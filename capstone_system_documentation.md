# WFP Barangay Management System - Technical Capstone Documentation

## 1. Executive Summary & Architecture
The WFP Barangay Management System is an integrated, role-based organizational and case management platform designed to digitize and optimize critical barangay operations. Built on the modern **TALL Stack** (Tailwind CSS, Alpine.js, Laravel, Livewire) utilizing the **FilamentPHP Admin Panel**, the system ensures robust architectural integrity by employing standard MVC (Model-View-Controller) patterns combined with SOLID principles.

### Architectural Highlights
- **Role-Based Access Control (RBAC):** Restricts data access strictly to authorized personnel (e.g., BNS for Nutrition, VAWC Officers for secure case management).
- **Service-Oriented Background Processing:** Uses Laravel Queues (Database/Sync) to optimize responsiveness during computationally heavy or latency-prone tasks like automated email dispatching.
- **Relational Integrity:** Implements specific cascading updates and soft deletes to protect legal data trails.

---

## 2. Infrastructure: Security, Audit Logging & Exception Handling
To ensure the system is "panelist-proof," all critical data transactions maintain an immutable paper trail using morphological relationships.

### Audit Logging (`AuditLog.php`)
Every state change across user profiles, VAWC reports, or Organization applications logs the exact `old_values`, `new_values`, and IP trace of the administrator executing the change.

```php
// app/Models/AuditLog.php
class AuditLog extends Model
{
    protected $fillable = ['user_id', 'action', 'auditable_type', 'auditable_id', 'old_values', 'new_values', 'ip_address', 'user_agent'];
    protected $casts = ['old_values' => 'array', 'new_values' => 'array'];

    public function auditable(): MorphTo
    {
        return $this->morphTo(); // Dynamically links to CaseReport, User, or Membership Application
    }
}
```

### Exception Handling & Reliability
Key integrations (such as SMTP mailing for membership approvals) are wrapped in `try-catch` blocks and tied to localized notifications. This prevents terminal failures (e.g., 500 Server Errors) if a third-party service times out, ensuring the administrative portal remains functional.

---

## 3. VAWC-RAVE Module (Risk Assessment for Vulnerability Emergencies)
The VAWC module is legally aligned with RA 9262 and the Philippine Barangay VAW Desk Handbook. It securely captures mandatory socio-demographic indicators ("Pink Form" compliance).

### Triage Logic (1-12 Scoring Algorithm)
A core technical feature is the **VAWC-RAVE algorithm**. It evaluates a case based on boolean inputs mathematically transitioning into a weighted severity score (1-12).

* **Low Risk (1-4):** Minor verbal conflicts, no weapons.
* **Medium Risk (5-8):** Repeat offenses or escalating threats.
* **High/Emergency Risk (9-12):** Weapons involved, warrantless arrests, direct physical danger.

### Core Model Implementation (`VawcCase.php`)
```php
// app/Models/VawcCase.php
class VawcCase extends Model
{
    use SoftDeletes; // Preserves deleted cases for legal auditing
    
    protected $fillable = [
        'case_report_id', 'intake_type', 'is_repeat_offense', 
        'has_weapon_involved', 'incident_veracity', 'weapons_confiscated'
        // ...
    ];

    protected $casts = [
        'is_repeat_offense' => 'boolean',
        'has_weapon_involved' => 'boolean',
        // Automatically cast database tinyints to application-level booleans
    ];

    // Belongs to the core CaseReport infrastructure
    public function caseReport(): BelongsTo
    {
        return $this->belongsTo(CaseReport::class);
    }
}
```

---

## 4. BCPC Nutrition Command Center
The Barangay Council for the Protection of Children (BCPC) module tracks infant and child health using WHO (World Health Organization) standard nutritional triage logic.

### Technical Workflow
The system actively calculates and monitors changes in **Weight-for-Age (WFA)** and **Height-for-Age (HFA)**. When a Barangay Nutrition Scholar (BNS) submits an assessment, the system evaluates the float values against age constraints to recommend interventions.

### Core Model Implementation (`BcpcAssessment.php`)
```php
// app/Models/BcpcAssessment.php
class BcpcAssessment extends Model
{
    protected $fillable = [
        'bcpc_child_id', 'user_id', 'date_of_weighing',
        'weight_kg', 'height_cm', 'wfa_status', 'hfa_status',
        'intervention_logs', 'remarks'
    ];

    protected $casts = [
        'date_of_weighing' => 'date',
        'weight_kg' => 'float',
        'height_cm' => 'float',
        'intervention_logs' => 'array', // Dynamically scaling JSON storage for medical logs
    ];

    public function child()
    {
        return $this->belongsTo(BcpcChild::class, 'bcpc_child_id');
    }
}
```

---

## 5. Organization & Membership Management System
Manages barangay-level organizational entities (e.g., Youth Clubs, Senior Citizen Groups) and automated application workflows.

### Process Automation
When an applicant applies to an organization, an `ApplicantProfile` is queued for review. Upon status change (Approved/Disapproved) by an Administrator, **Model Observers** (or controller actions) trigger an asynchronous Email Dispatcher.

### Core Model Implementation (`Organization.php`)
```php
// app/Models/Organization.php
class Organization extends Model
{
    protected $fillable = [
        'name', 'slug', 'color_theme', 'requirements', 'form_schema'
    ];

    // Schema arrays allow dynamic application forms configured per organization
    protected $casts = [
        'requirements' => 'array',
        'form_schema' => 'array',
    ];

    // Auto-generates URL-friendly slugs on Creation and Update
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($org) {
            if (empty($org->slug)) { $org->slug = Str::slug($org->name); }
        });
    }

    public function membershipApplications(): HasMany
    {
        return $this->hasMany(MembershipApplication::class);
    }
}
```

---

## 6. GAD (Gender and Development) Module
This module tracks project proposals, budgets, and beneficiary targeting specifically structured to utilize the nationally mandated 5% GAD budget allocation.

* **Key Functionality:** Ties into `Organization` and `User` relations to track which group is sponsoring a proposal, streamlining the approval matrix from proposal phase through dispatching beneficiaries (`BeneficiaryDispatch.php`).

## 7. AI Chatbot (The Sentinel) Engine & Subprocess Bridge

The AI chatbot module ("The Sentinel") is a **Hybrid Retrieval-Based Natural Language Processing (NLP) Classifier**. It uses a local machine learning script to classify user intent and returns either static responses or triggers backend database queries.

### Tech Stack, Languages & Libraries
- **Programming Languages**: 
  * **Python 3**: Core Machine Learning and Natural Language Processing engine.
  * **PHP 8.x**: Back-end process runner and relational database bridge (Laravel 11).
  * **TypeScript (React)**: Chat user interface.
- **Machine Learning Libraries**:
  * `scikit-learn` (`sklearn.neural_network.MLPClassifier`): Custom Multi-Layer Perceptron (neural network classifier).
  * `nltk` (Natural Language Toolkit): Word tokenization (`nltk.word_tokenize`) and dictionary root mapping (`WordNetLemmatizer`).
  * `numpy`: Array vector operations.
  * `pickle`: Binary serialization for the compiled ML model brain file.

### Custom Preprocessing & Neural Network Architecture (`train.py`, `chat.py`)
Rather than relying on basic rule-based string matching or external cloud APIs, the system parses sentences locally:
1. **Tokenization**: Splits input queries into raw arrays of words (tokens).
2. **Lemmatization**: Reduces tenses and plural forms to their base root dictionary words (e.g., *"sinasaktan"* -> *"saktan"*, *"reports"* -> *"report"*).
3. **Bag of Words (BoW) Vectorization**: Converts the array of lemmatized words into a binary frequency vector matching the training vocabulary.
4. **ANN Classification**: Runs the vector through a **Multi-Layer Perceptron (MLP) Classifier** containing:
   * **Input Layer**: Neurons corresponding to the vocabulary length.
   * **Two Hidden Layers**: Nodes of size `(128, 64)` running `ReLU` (Rectified Linear Unit) activation functions.
   * **Adam Optimizer**: Backpropagation algorithm minimizing training loss.
   * **Output Layer**: Represents the target intent classes.
5. **Model Serialization**: Pre-compiles vocabulary and weights into a local binary file `chatbot_model.pkl`.

### Laravel Process Bridge (`ChatbotService.php`)
When a user queries the bot, the React client initiates a POST request to Laravel, which executes Python locally via Symfony Process:
```php
// app/Services/ChatbotService.php
$process = new Process(['python', $scriptPath, $query]);
$process->run();
```
- **Action Mapping**: If Python predicts a dynamic tag (e.g., `ACTION_FETCH_ANNOUNCEMENTS`), Laravel intercepts the action, runs MySQL database queries, and merges the latest live database information into the response.

### 🛡️ Core Defensibility: Offline & Static Security Design
- **100% Offline Capability**: All NLP tokenization, lemmatization, and neural network inference occur locally on the hosting server. No internet or external APIs (like OpenAI GPT or Gemini) are used.
- **Strict Data Privacy**: Citizens' messages never traverse the public internet or external databases, ensuring total compliance with the **Data Privacy Act of 2012 (DPA)**.
- **Zero Hallucinations & Data Poisoning Defense**: The model is statically trained. **Live "Self-Learning" is intentionally disabled**. This prevents attackers from poisoning the model's vocabulary with malicious prompts (Prompt Injection) or causing the chatbot to accidentally reveal confidential victim details input in other chat sessions. All updates are made securely by admins updating `intents.json` and rebuilding the network offline.

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


## 8. Conclusion & System Defensibility
The WFP Barangay Management system answers the complex operational needs of LGUs through a scalable architecture. By cleanly separating specific module logics (VAWC Risk algorithms, WHO Nutrition data types, JSON-casted dynamic membership schemas, local MLP-based AI chatbots) while tying it all together with unified Audit Logging and structured Try-Catch fault tolerance, the codebase is secure, legally reliable, and built to professional enterprise standards.
