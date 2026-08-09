# 🏛 FINAL FULL SYSTEM DOCUMENTATION & DEFENSE PORTFOLIO
*WFP Barangay Management System (Capstone Defense Master Document)*

> This document is the ultimate aggregation of all system logic, architectural principles, mathematical algorithms, legal compliances, and defense narratives developed for the Capstone Presentation.

---

## 🗂 Table of Contents
1. **Executive Summary & System Purpose**
2. **Phase 1: Core Architecture & Software Engineering Principles**
3. **Phase 2: Intelligent Algorithms & Triage Complexity**
4. **Phase 3: VAWC-RAVE Implementation & Lifecycle Narrative**
5. **Phase 4: BCPC Nutrition Command Center & WHO Triage**
6. **Phase 5: Automated Operation Lifecycle (Organization & GAD)**
7. **Phase 6: AI Chatbot (The Sentinel) Core & Neural Network Training**
8. **Legal Alignment & Panelist Defense Q&A**

---

## 1. Executive Summary & System Purpose
The WFP Barangay Management System is deeply engineered as an **Intelligent Decision Support System (DSS)**. It is not merely a CRUD (Create, Read, Update, Delete) database; it translates complex Philippine legislative mandates (RA 9262, RA 9344) and WHO international health standards into automated, algorithmic workflows intended to protect families and standardize justice.

**Core Offerings:**
* **Intake & Profiling**: Captures RA 9262-compliant data securely.
* **Smart-Triage Assessment**: Automatically calculates victim risk using proprietary multi-criteria algorithms.
* **Protection Order Management**: Generates and tracks the critical 15-day SLA validity of Barangay Protection Orders (BPO).

---

## 2. Phase 1: Architecture & Software Engineering Principles

### The TALL Stack & MVC Blueprint
Built on the **TALL Stack** (TailwindCSS, Alpine.js, Laravel, Livewire) with an Inertia.js interface for desktop-grade performance during emergencies. 

### A. The 4 Pillars of Object-Oriented Programming (OOP)
* **Encapsulation**: Business logic is "encapsulated" within **Service Classes** (e.g., `VawcBpoService`, `RiskAssessmentService`). Controllers only route data—they do not handle the math.
* **Abstraction**: The system abstracts complex legal workflows into single UI clicks.
* **Inheritance**: Controllers and Eloquent Models inherit from robust core framework classes.
* **Polymorphism**: A generic `CaseReport` model "morphs" strictly into specific cases (VAWC, BCPC) keeping the database normalized.

### B. SOLID Principles
* **Single Responsibility (SRP):** Classes are purposefully segregated. `NutritionCalculatorService` computes BMI, it does not save to the database. They never overlap.
* **Open/Closed (OCP):** The assessment engines are open for adding new parameters but closed to modifying the math backbone.
* **Dependency Inversion:** Services are systematically injected into controllers, making the codebase highly professional and pluggable.

### C. System Algorithm Approach - Audit Logging & Immutability Matrix
To ensure extreme defensibility during court presentations, the system enforces a strict immutability algorithm on every critical data point using `AuditLogs`.
**Algorithmic Flow:**
1. Administrator requests a write operation.
2. The Model Lifecycle Observer halts the commit to analyze changes.
3. The system maps `isDirty()` variables, separating `old_values` from `new_values`.
4. A morphological bind connects the trace data, the Actor (User ID), and Network Intel (IP) into an immutable log.

---

## 3. Phase 2: Intelligent Algorithms & Triage Complexity

When addressing system complexity, highlight the **Hybrid Automation** logic. The system "listens" to standard intake data and translates flags into "Expert Vectors."

### A. VAWC-RAVE (Risk Assessment & Vulnerability Evaluation)
**Formula:** $Score = \sum (Frequency + Severity + WeaponAccess + LethalityThreat)$
* **Logic:** Evaluates boolean flags on a scale from 1 (Low) to 3 (Severe) pushing a max score of 12.
* **Impact:** Cases are algorithmically bucketed: CRITICAL (10-12), HIGH (8-9), MODERATE (6-7), LOW (1-5), surfacing "Red" priority cases to the top of the Admin Inbox continuously.

### B. BCPC-DEM (Diversion Eligibility Matrix)
**Formula:** A Categorical Decision Matrix branching based on:
* **Logic:** Analyzes `Discernment` (Maturity logic) against `Offense Type`.
* **Output:** Categorizes children into Community-Based Diversion, Intensive Social Intervention, or Family Integration.

### C. GAD-SAM (Social Alignment Model)
* **Logic:** Uses Requirement-Verification Heuristics to validate membership prerequisites ensuring transparent allocation of the 5% GAD budget.

---

## 4. Phase 3: VAWC-RAVE Implementation & Lifecycle Narrative

### The "Maria" Full Lifecycle Narrative (Demo Strategy)
Explain the VAWC module to panelists using a survivor-centric workflow:
1. **Arrival & Phase 1 Execution:**
   * Maria arrives with injuries. You utilize the **Multi-Path Workflow**, documenting "WCPU Hospital" and "PNP" referral *first* in the Intake to record immediate duty-of-care before writing the narrative.
   * *John Doe Protocol:* If Maria doesn't know the attacker, the system accepts a physical description to ensure documentation is not blocked.
   * Demographics are recorded strictly for DILG "Pink Form" compliance.
2. **Algorithmic Scoring (Phase 2):** Maria's intake flags a 'Weapon' and 'Injuries'. The system scores her `11/12 (CRITICAL)`.
3. **Legal Protection (Phase 3):** System prompts an immediate Application for BPO. The Punong Barangay reviews and hits 'Issue BPO'.
4. **Monitoring (Phase 4):** Case enters an Active Monitoring Queue for exactly 15 Days.
5. **Successive Action (Phase 5):** If respondent violates the BPO on day 10, the "Escalate" button is triggered, automatically formatting a Court Complaint Assistance form.

---

## 5. Phase 4: BCPC Nutrition Command Center & WHO Triage

**What makes this an "Algorithm"?**
It deterministically interpolates physical metrics against rigid World Health Organization (WHO) Growth datasets.
> **Complexity Rating: O(1) Lookup with O(log N) Categorization**

### Algorithmic Execution: The Z-Score Assessment
* **Step 1:** System maps Carbon-Date Precision ($Age = Date_{weighing} - Date_{birth}$).
* **Step 2:** Maps `weight_kg` or `height_cm` against the EXACT median standard deviation (SD) lookup table for the computed month and sex.

### Intake Case Examples (Validation Data)
* **Male, 24 Months, 8.5kg:** Automatically triggers **Severe Acute Malnutrition (SAM)**. Requires immediate clinical referral.
* **Female, 12 Months, 6.8kg:** Triggers **Moderate Acute Malnutrition (MAM)**. System prompts enrollment into RA 11037 Supplemental Feeding flow.

---

## 6. Phase 5: Automated Operation Lifecycle (Organization & GAD)

### Asynchronous Approval Algorithms
The system utilizes robust Queue-based background processing to prevent UI throttling.

**Algorithmic Flow:**
1. **Ingestion:** Membership submitted dynamically matching an Organization's custom JSON `form_schema`.
2. **Review:** Administrator toggles state to `Approved`.
3. **Queueing:** Controller halts UI delay, returning an instant success prompt, whilst dropping an `ApprovalMailable` Job into the database queue.
4. **Dispatch:** The server formats a customized branded email and pushes it via SMTP exactly when network resources allow.

---

## 7. Phase 6: AI Chatbot (The Sentinel) Core & Neural Network Training

The system features **The Sentinel**, an AI-powered conversational assistant to guide citizens on RA 9262, barangay officials, emergency contacts, accredited organizations, and active announcements.

### Algorithmic Execution: NLP Pipeline & MLP Neural Network Classifier
1. **Preprocessing (NLP):**
   * **Tokenization:** Breaks query into words using NLTK `word_tokenize`.
   * **Lemmatization:** Reduces words to base root form using `WordNetLemmatizer` (e.g. "complained" $\rightarrow$ "complaint").
   * **Bag of Words (BoW):** Creates a binary vector representing word occurrences.
2. **Classification (Neural Network):**
   * Processes vector input through a **Multi-Layer Perceptron (MLP) Classifier** (`sklearn.neural_network.MLPClassifier`) trained on `intents.json`.
   * **Architecture:** Two hidden layers `(128, 64)`, `ReLU` activation, and `Adam` solver optimization.
   * **Softmax Threshold:** Only proceeds if the prediction confidence $> 0.25$ to handle out-of-scope queries safely.
3. **Hybrid Dynamic Action Mapping:**
   * If the classified intent requires live data, the Python script returns an Action Tag (e.g., `ACTION_FETCH_ANNOUNCEMENTS`).
   * Laravel's `ChatbotService` catches the tag and runs live Eloquent queries on MySQL database records (e.g. latest 3 announcements, active barangay officials) to return real-time updates.

---

## 7.1 Detailed API Endpoints & Request/Response Contracts

To facilitate asynchronous data transfer and inter-module execution, the system implements a set of JSON APIs and AJAX endpoints.

### A. AI Chatbot API
* **Endpoint:** `POST /chatbot/query`
* **Route Name:** N/A (Internal API)
* **Access Control:** Public (Throttle: 10 requests per minute)
* **Request Headers:**
  `Content-Type: application/json`
* **Payload Structure:**
  ```json
  {
    "message": "Nais kong magsumbong ng kaso ng VAWC"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "response": "Nais mo bang mag-report ng kaso para sa isang babae (VAWC) o para sa isang bata (BCPC)?",
    "suggestions": [
      "File VAWC Case",
      "File BCPC Case"
    ]
  }
  ```
* **Fallback Response (200 OK):**
  ```json
  {
    "response": "I apologize, but I am having trouble processing that right now. Please try again."
  }
  ```

### B. Public Organization Application API
* **Endpoint:** `POST /organizations/{organization}/apply`
* **Route Name:** `public.organizations.submit`
* **Access Control:** Public (Throttle: 3 requests per minute)
* **Request Headers:**
  `Content-Type: multipart/form-data` (due to optional file attachment uploads)
* **Payload Structure:**
  ```json
  {
    "fullname": "Jane Doe",
    "address": "Zone 4, Barangay WFP",
    "email": "janedoe@gmail.com",
    "form_data": {
      "Contact Number": "09171234567",
      "Valid ID Photo": "[Binary File Attachment]"
    }
  }
  ```
* **Success Response (302 Redirect):**
  Redirects back to application screen with successful validation flash alerts.
* **Error Response (302 / 422 Validation Error):**
  Returns validation messages mapped to input fields (e.g. email must be valid, fullname unique constraint failed).

### C. VAWC Case Assessment & Triage API
* **Endpoint:** `POST /admin/vawc/cases/{id}/assess`
* **Route Name:** `admin.vawc.assess`
* **Access Control:** Admin, VAWC Head Only (`auth`, `role:admin,head`)
* **Payload Structure:**
  ```json
  {
    "incident_veracity": true,
    "is_repeat_offense": true,
    "has_weapon_involved": true,
    "weapons_confiscated": false
  }
  ```
* **Success Response (200 OK or 302):**
  Updates the risk score dynamically and redirects the administrative panel to BPO application cues.

### D. BPO Compliance & Lifecycle APIs
* **Endpoints:**
  * `POST /admin/vawc/cases/{id}/apply-bpo`
  * `POST /admin/vawc/cases/{id}/issue-bpo`
  * `POST /admin/vawc/cases/{id}/record-service`
  * `POST /admin/vawc/cases/{id}/log-compliance`
  * `POST /admin/vawc/cases/{id}/escalate`
  * `POST /admin/vawc/cases/{id}/close`
* **Access Control:** Admin, VAWC Head Only (`auth`, `role:admin,head`)
* **Usage:** Handles transitional state changes in the BPO 15-day SLA counter. Escalate triggers court complaint generation, close sets case resolved.
* **Response (302 Redirect):** Updates status fields and redirects to case files.

### E. Notification Status API
* **Endpoints:** 
  * `POST /admin/notifications/{id}/read` (Mark specific notification read)
  * `POST /admin/notifications/mark-all-read` (Mark all notifications read)
* **Access Control:** Authenticated Users (`auth`)
* **Success Response (200 OK):**
  ```json
  {
    "success": true
  }
  ```

---


## 8. Legal Alignment & Panelist Defense Q&A

**Crucial Defense Statement:** *"This system transforms the Barangay VAW Desk from a reactive record-keeping office into a proactive protective service through algorithmic triage and legal compliance monitoring."*

### Defensive Q&A
**Q1: Why use an algorithm instead of letting the officer decide?**
> *"To eliminate Subjective Bias. In high-pressure situations, human judgment varies. Our MCDA Algorithm provides a Standardized Triage Protocol ensuring every victim receives prioritized safety based strictly on objective danger flags."*

**Q2: Is the algorithm fair? Doesn't it punish the respondent?**
> *"The algorithm is Protective, not Punitive. It does not determine the guilt of the respondent; it determines the Level of Safety Service required for the victim, prioritizing true emergency resources."*

**Q3: Why collect 'Educational Attainment' or 'Occupation'?**
> *"This fulfills DILG/PCW (Pink Form) demographic mandates. The data allows LGUs to enact evidence-driven Gender and Development (GAD) seminars and livelihood allocations."*

**Q4: How do you ensure data quality during emergencies?**
> *"We implemented Real-Time Validation Feedback. If mandatory fields like incident location are missing, the UI provides immediate red-text cues, ensuring incomplete 'trash' data never corrupts the registry."*

---

---

## 9. Phase 7: IT Expert Feedback, Web Accessibility, Auth Security & Software Architecture Refactoring

Following post-demo evaluation with an IT industry expert, the system architecture was expanded with inclusion engines, resilient system toggles, authentication hardening, and software design refactoring.

### A. Web Accessibility & Voice Assist Architecture (WCAG 2.1 AA & NVDA)
* **NVDA Screen Reader Integration**: Standardized HTML markup with semantic ARIA tags (`aria-label`, `role`, `aria-live="polite"`) and visible focus ring indicators (`focus-visible:ring-4`) for keyboard tab navigation (`Tab` / `Shift+Tab`).
* **Built-in Voice Assistant (`SpeechSynthesis`)**: Web Speech API integration in `<AccessibilityToolbar />` allowing senior citizens, visually impaired, and PWD residents to hear emergency numbers (*"Emergency 911"*) and navigation labels spoken aloud without requiring external screen reader software.
* **Non-Colliding Floating UI Stack**: Positioned `<QuickExit />` at `fixed bottom-24 left-6 z-[100]` directly stacked above `<AccessibilityToolbar />` at `fixed bottom-6 left-6 z-40`, guaranteeing zero UI overlap during high-speed emergency exits.
* **Responsive Senior Usability**: Touch targets engineered with minimum 48×48px clickable areas and sticky 1-tap emergency dialers.

### B. AI Chatbot Admin Feature Toggle
* **Feature Toggle Switch (`chatbot_enabled`)**: Managed via system settings repository with Shadcn UI `Switch` and `Badge` status indicators.
* **Graceful Maintenance Fallback**: If disabled by Admin, `<ChatbotWidget />` automatically transitions to a maintenance card displaying emergency hotlines instead of rendering broken UI errors.

### C. Authentication Hardening & Confidentiality Policy
* **Disabling Persistent Cookies & Public Self-Service Resets**: For strict compliance with the **Data Privacy Act (RA 10173)** and **RA 9262**, persistent "Remember Me" cookies and public "Forgot Password" links are intentionally excluded from `login.tsx`. In a confidential municipal system handling domestic violence and victim records, users must authenticate explicitly for every session, and password resets require administrative verification through the System Users Command Center (`/admin/system-users`).

### D. In-Person VAWC Desk Intake Defense Rationale (RA 9262)
* **Architectural Safety Shield**: Open online guest filing is intentionally restricted under RA 9262 and RA 10173 to protect victim safety on shared household devices. Case intake is performed strictly **face-to-face at the Barangay VAW Desk**, eliminating public online fake reporting by design.

### E. Automated Testing Suite (Vitest & Playwright E2E)
* **Component Unit Testing (Vitest)**: Executes unit tests for frontend components (`tests/Frontend/AccessibilityToolbar.test.tsx`) via `npm run test`.
* **End-to-End Automation (Playwright)**: Executes end-to-end browser testing (`tests/e2e/system_flow.spec.ts`) via `npm run test:e2e`.

### F. Software Design Principles & Code Defensibility Matrix

| OOP / Clean Code Principle | Architectural Pattern | Panel Defense Script |
| :--- | :--- | :--- |
| **Encapsulation** | `useAccessibilityMode` & `SystemSettingsService` | *"Encapsulates browser theme and speech APIs inside modular state handlers, isolating UI components."* |
| **Abstraction** | `<AccessibilityToolbar />` & `<ChatbotWidget />` | *"Abstracts low-level SpeechSynthesis and API queries behind simple UI interfaces."* |
| **Inheritance** | Base Controllers & React Interfaces | *"Controllers inherit core authentication, validation, and response helpers from `Controller.php`."* |
| **Polymorphism** | Dynamic Setting Repository | *"Processes diverse setting data structures through unified setting repository contracts."* |
| **Single Responsibility (SRP)** | Segregated Component Modules | *"Each component owns a single responsibility (e.g. Accessibility toolbar vs. Chatbot widget)."* |
| **Don't Repeat Yourself (DRY)** | Shared Theme & Speech Hooks | *"Reuses centralized accessibility hooks across all public and resident portal layouts."* |
| **Keep It Simple (KISS)** | Browser-Native Web APIs | *"Utilizes browser-native `window.speechSynthesis` and Tailwind tokens for maximum speed and zero bloated dependencies."* |
| **Automated QA (Unit + E2E)** | Vitest & Playwright Test Suites | *"Maintains automated component unit tests and Playwright E2E automation for regression-free releases."* |

---

## 10. Phase 8: Database Backup, Disaster Recovery & Restoration Engine (Shadcn UI)

To satisfy IT Expert recommendations and municipal business continuity standards, the system incorporates a complete **Database Backup, Disaster Recovery & External Restoration Engine**.

### A. Architectural Specifications (How, What, Why)
* **WHAT**: An administrative Disaster Recovery subsystem (`/admin/backup-recovery`) built with official **Shadcn UI** components (`Card`, `Button`, `Badge`, `Table`, `Dialog`, `Input`, `Label`) that generates point-in-time compressed SQL snapshots (`.sql.gz`), lists historical archives, allows secure admin downloads, enables 1-click external `.sql` file uploads from USB drives, and executes password-authorized database restorations.
* **WHY**: Ensures compliance with **RA 10173 (Data Privacy Act)** and DILG disaster recovery standards. Prevents total data loss in the event of server hardware failure, database corruption, power outages, or ransomware attacks.
* **HOW**: `DatabaseBackupService.php` captures full relational schemas and data rows, compresses archives using gzip encryption into `storage/app/backups/`, and logs all backup/restore activities into the `AuditLogs` immutability matrix.

### B. Role-Based Access Control (RBAC) & Principle of Least Privilege (PoLP)
* **Super Admin Strict Isolation (`role:admin`)**: Backup & Recovery access is strictly restricted to `role:admin` in `routes/web.php` and hidden in `app-sidebar.tsx`. Department Desk Heads (VAWC/BCPC) and Committee Members are excluded to prevent **data exfiltration** (exporting confidential victim files to personal drives) and **accidental database overwrites**.

### C. Automated Task Scheduler & 30-Day Auto-Pruning
* **Daily Cron Task Scheduler (`routes/console.php`)**: Executes `Schedule::command('db:backup')->dailyAt('00:00')` automatically every night at midnight, achieving a **Recovery Point Objective (RPO)** of $< 24\text{ hours}$ and a **Recovery Time Objective (RTO)** of $< 5\text{ minutes}$.
* **30-Day Retention Policy**: `pruneOldBackups(30)` in `DatabaseBackupService.php` automatically purges snapshot files older than 30 days during backup execution to prevent server hard drive storage bloat.

### D. Complete System Scope (100% Relational Coverage)
Every backup archive captures **100% of database entities**:
* **User & Resident Profiles**: Credentials, roles, permissions, profile metadata.
* **VAWC & BCPC Confidential Records**: Case intake records, offender details, risk scores, BPO protection order validity logs.
* **Barangay Operations & GAD**: Accredited organization registries, member applications (pending & verified), GAD event calendars and budget allocations.
* **Public Content**: Announcements, official directories.
* **Audit Trail**: Complete immutable audit trail history, actor IDs, network IP stamps.

### E. Software Engineering & OOP Principles Matrix

| OOP / SOLID Principle | Codebase Implementation | Panel Defense Explanation |
| :--- | :--- | :--- |
| **Encapsulation** | `DatabaseBackupService.php` | *"Encapsulates low-level shell calls, PDO streaming, and zip compression logic inside a dedicated service class."* |
| **Abstraction** | `BackupStorageInterface` & Upload Handler | *"Abstracts storage mediums and file upload streams behind a unified interface, hiding raw file I/O operations from controllers."* |
| **Inheritance** | `DatabaseBackupCommand.php` extends `Command` | *"Inherits Laravel Console command methods for CLI and cron execution."* |
| **Polymorphism** | Strategy Pattern for Backup Drivers | *"Allows interchangeable backup storage drivers (Local, Cloud, Encrypted Archives)."* |
| **Single Responsibility (SRP)** | Segregated Controllers & Services | *"Controller handles HTTP routes & Auth checks; Service handles dump math; Command handles Artisan CLI execution."* |
| **Open/Closed (OCP)** | Storage Driver Extensions | *"Open to adding new backup destinations (AWS S3, Google Drive) without modifying existing dump generators."* |
| **Don't Repeat Yourself (DRY)** | Shared Core Dump Engine | *"Web admin manual backups, external file uploads, and CLI automated daily cron backups execute the exact same `DatabaseBackupService` engine."* |

---

## 11. Phase 9: IT Expert Recommendations — Bulk Importer, Domain Analytics & Governance Appeals

Following the secondary IT Expert review, three critical enterprise features were architected and implemented:

### A. Bulk CSV/Excel Member Importer (Dynamic JSON Schema Mapping)
* **The Problem**: Manual logbook digitizing was slow and repetitive.
* **The Architecture**:
  * **Strategy & Factory Pattern (`OrganizationImportStrategyFactory`)**: `OrganizationMemberImportService.php` inspects each organization's custom `form_schema` JSON definition and dynamically constructs custom CSV sample headers (`fullname`, `email`, `address`, `phone`, plus organization-specific fields like `osca_id`, `pwd_id`, `solo_parent_id`).
  * **Duplicate Prevention & Verification**: Automatically checks for existing resident records and email collisions before performing transactional batch database insertions.
  * **Shadcn UI Bulk Import Modal**: Built `<BulkImportModal />` allowing 1-click sample CSV download, file drag-and-drop upload, parsing previews, and batch insertion.

### B. Domain-Segregated Analytics Subsystem (Shadcn UI Tabs & Filters)
* **The Problem**: Mixing VAWC, BCPC, and GAD charts on one screen confused non-technical department heads.
* **The Architecture**:
  * **Facade & Separation of Concerns**: Decoupled analytics calculations into dedicated services (`VawcAnalyticsService.php`, `BcpcAnalyticsService.php`, `GadAnalyticsService.php`).
  * **Shadcn UI Domain Tabs**: Integrated Shadcn UI `Tabs` navigation in `Admin/Analytics/Index.tsx`:
    * `[ 🛡️ VAWC Case Analytics ]`: Focuses strictly on RA 9262 monthly abuse rates, risk distribution, BPO SLAs, threat radar, and PNP transmittals.
    * `[ 👶 BCPC Child Welfare ]`: Focuses strictly on WHO e-OPT Plus child nutrition trends, malnutrition prevalence (stunting/wasting), and SFP outcomes.
    * `[ 👥 GAD & Organizations ]`: Focuses strictly on Gender & Development budget allocations, event participation, and organization member demographics.

### C. Organization Governance Subsystem (Rejection Justifications, Appeals & 14-Day SLA)
* **The Problem**: Preventing bias, personal grudges, or stagnant applications from Organization Presidents against residents.
* **The Architecture**:
  * **Mandatory Rejection Justification (`RejectionReasonModal.tsx`)**: Presidents clicking "Disapprove" must document a clear, non-arbitrary rejection reason in `rejection_reason`.
  * **Resident Appeals Engine (`AppealModal.tsx`)**: Rejection triggers a notification email with a direct link for residents to submit an **Appeal Statement**.
  * **Barangay Admin Appeals Command Center (`AppealsIndex.tsx`)**: Escalated appeals land in the Admin Appeals Queue (`/admin/applications/appeals`), enabling the Barangay Admin to investigate and **Overrule & Force Approve** unfairly rejected residents (`approval_type = 'admin_overrule'`).
  * **Automated 14-Day SLA Auto-Approval Cron (`SlaAutoApprovalCommand.php`)**: Scheduled CLI command `php artisan orgs:auto-approve` (running daily at `01:00` in `routes/console.php`) automatically approves applications left pending for more than 14 days (`approval_type = 'auto_sla'`).

### D. Software Engineering & OOP Principles Matrix

| Software Engineering Principle | Implementation Pattern | Panel Defense Script |
| :--- | :--- | :--- |
| **Strategy Pattern** | `OrganizationMemberImportService` | *"Selects CSV column parsing strategies dynamically based on each organization's JSON schema."* |
| **Facade Pattern** | `VawcAnalyticsService`, `BcpcAnalyticsService`, `GadAnalyticsService` | *"Provides clean domain facades for analytics queries, isolating department math from web controllers."* |
| **State Machine Pattern** | `MembershipApplication` Lifecycle | *"Enforces legal state transitions (`pending` → `rejected` → `appealed` → `approved` / `overruled`) with immutable audit trails."* |
| **Encapsulation & SOLID** | `OrganizationGovernanceService` | *"Encapsulates rejection logging, resident appeal dispatches, admin overrule authorizations, and SLA auto-approvals."* |
| **Automated SLA Scheduling** | `SlaAutoApprovalCommand` (`php artisan orgs:auto-approve`) | *"Prevents resident stagnation by automatically approving pending applications neglected for over 14 days."* |



