# WFP Barangay Management System: API & Technical Defense Q&A Cheat Sheet
*Prepare for your Capstone Presentation with these Panelist-Proof Answers*

---

## 🎙️ The Primary Question: "What API did you use in your system?"

### 💡 The Recommended Answer:
> **“Sir/Ma'am, our system utilizes two classifications of APIs:**
> 
> 1. **First-Party (Custom-Developed) JSON APIs:** We designed and built our own custom RESTful endpoints using **Laravel Routes and Controllers**. These APIs handle the asynchronous exchange of data between the frontend user interface and the backend database—such as chatbot requests (`POST /chatbot/query`), child nutrition assessments (`POST /admin/bcpc/cases`), and BPO lifecycle updates.
> 2. **Third-Party Transactional APIs:** We integrated the **SMTP API (Simple Mail Transfer Protocol)** for asynchronous communication. When an administrator updates an organization application, this API is called in the background to dispatch transactional email alerts to the citizen without blocking the browser interface.”

---

## 🧠 AI, NLP & Subprocess Integration Questions

### Q1: "Why build a local NLP chatbot in Python instead of using the OpenAI (GPT) or Gemini API?"
* **Panelist's Angle:** Checking if you did redundant work or if you understand cost/confidentiality trade-offs.
* **Defensible Response:** 
  > “We deliberately avoided global LLM APIs like OpenAI or Gemini for three major reasons:
  > 1. **Legal Compliance & Privacy (RA 9262):** VAWC (Violence Against Women and Children) details are highly confidential under Philippine law. Sending raw citizen statements to external US-based servers violates standard privacy protocols. Keeping it local via Python's `scikit-learn` ensures data stays on the local server.
  > 2. **Zero Cost Sustainability:** Paid APIs are billed per token, creating a financial burden that barangay budgets cannot sustain. Our self-hosted model runs entirely free.
  > 3. **Deterministic Boundaries:** A general LLM can hallucinate or talk about politics/recipes. Our model uses a strict classification threshold (0.25), meaning it will only respond to predefined barangay topics, keeping the chatbot focused and safe.”

### Q2: "How does Laravel (PHP) communicate with your Python AI script?"
* **Panelist's Angle:** Verification of system integration and process flow knowledge.
* **Defensible Response:**
  > “The system implements a **Subprocess Process Bridge** using the **Symfony Process component** inside Laravel ([ChatbotService.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/app/Services/ChatbotService.php)).
  > When a query is received, Laravel launches a secure command-line subprocess: `python resources/python/chat.py [query]`. The Python script pre-processes the text, classifies the intent, and prints a JSON object to standard output (`stdout`), which Laravel parses and delivers back to the user.”

### Q3: "Does the AI model have access to the MySQL database? How does it display live Barangay announcements?"
* **Panelist's Angle:** Checking for security flaws or high maintenance (e.g. retraining the model every time an admin posts an announcement).
* **Defensible Response:**
  > “No, the AI model does not access the database directly, nor do we retrain it. We built a **Dynamic Action Mapping Engine**. 
  > The Python model only predicts the *intent* of the query and outputs an **Action Tag** (e.g., `ACTION_FETCH_ANNOUNCEMENTS`). Laravel's controller catches this tag and runs a live Eloquent query on our MySQL database. This separates the cognitive layer (AI) from the data layer (Laravel), keeping announcements and officials instantly updated with zero retraining overhead.”

---

## 🔒 Security & Database API Questions

### Q4: "How did you secure your API endpoints from malicious attacks or data extraction?"
* **Panelist's Angle:** Evaluating the security posture of the software.
* **Defensible Response:**
  > “We implemented three primary security layers:
  > 1. **Middleware-Based RBAC:** Administrative APIs (such as BPO issuance and case reports) are protected by Laravel's `auth` and custom `role:admin,head` middleware. Unauthorized roles receive an immediate HTTP 403 Forbidden response.
  > 2. **Rate Limiting (API Throttling):** To prevent automated spamming, endpoints like the Chatbot query use a throttle middleware (`throttle:10,1`), restricting users to 10 queries per minute.
  > 3. **Strict Validation and Sanitization:** All incoming requests are run through Laravel validator instances, checking data types, email formats, and string lengths before database entry, preventing SQL injection and script execution.”

### Q5: "How does your system handle database failures during high-latency API tasks, like bulk email dispatching?"
* **Panelist's Angle:** Checking the reliability of integration points.
* **Defensible Response:**
  > “To prevent timeouts (which commonly occur when sending multiple emails under PHP's default 30-second limits), we offloaded bulk email dispatching to a **Laravel Queue system** (`QUEUE_CONNECTION=database`). 
  > The API immediately responds with a success message to the frontend, while email dispatch tasks are written to a database queue table. A queue worker handles SMTP transfers asynchronously in the background. If a transfer fails, the system logs the failure in our `AuditLogs` and schedules a retry without crashing the user interface.”

---

## 📐 Algorithm & Logic Questions

### Q6: "Explain the mathematical algorithm behind your VAWC triage logic."
* **Panelist's Angle:** Checking if you just copy-pasted or if you understand the business logic.
* **Defensible Response:**
  > “The triage logic employs a **Multi-Criteria Decision Analysis (MCDA) Scoring Algorithm** based on DILG and PCW Pink Form guidelines:
  > $$\text{Score} = \sum (\text{Frequency} + \text{Severity} + \text{WeaponAccess} + \text{LethalityThreat})$$
  > The backend controller collects boolean flags from the intake form (e.g. repeat offense, weapon used, direct physical danger). Each flag carries a weight which accumulates to a maximum score of 12. A score of 9-12 automatically categorizes the case as **Critical Risk**, alerting the Desk Officer to immediately process a Barangay Protection Order (BPO).”

### Q7: "What standard did you use to categorize child nutrition records?"
* **Panelist's Angle:** Validating mathematical correctness and domain alignment.
* **Defensible Response:**
  > “We integrated the **World Health Organization (WHO) Child Growth Standards**. 
  > The algorithm calculates child age down to the exact month ($Age = \text{Date of Weighing} - \text{Date of Birth}$). It compares the child's weight/height against the WHO Median and Standard Deviations for that specific month and gender, automatically classifying them into Severe Acute Malnutrition (SAM), Moderate Acute Malnutrition (MAM), or Normal, triggering corresponding intervention prompts.”
