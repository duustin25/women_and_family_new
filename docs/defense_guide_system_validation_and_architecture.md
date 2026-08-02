# 🛡️ Capstone Defense Guide: System Validations, Architecture & Database Security

This document provides the official system design documentation and verbal defense script with **exact codebase file paths, line numbers, and code proofs** to explain **System Validations**, **System Architecture**, **Database Security**, **Encryptions**, and **Data Integrity** for the **Women & Family Program (WFP) Capstone System**.

---

## 🔍 Understanding the Panelist Question: "How about your system's validations?"

When IT expert panelists ask about validation, they are **not** asking if a form has `required` fields. They are asking:
> **"How does your software architecture prevent bad, malicious, incomplete, or logically invalid data from breaching security, corrupting the database, or breaking business workflows?"**

In our system, validation is enforced across **5 distinct architectural tiers**:

```
                                [ User Input ]
                                      │
                                      ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ Tier 1: Client-Side UI Validation (React / Inertia.js)                  │
  │ • UX Feedback, Form State (useForm), HTML5 Input Attributes             │
  │ • Proof: resources/js/pages/Admin/Bcpc/Create.tsx                       │
  └───────────────────────────────────┬─────────────────────────────────────┘
                                      │ (HTTP Request)
                                      ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ Tier 2: Server-Side Request Validation (Laravel HTTP Validation)        │
  │ • $request->validate(), Regex, MIME, Size Limits, Unique/Exists Rules    │
  │ • Halts execution & returns HTTP 422 Unprocessable Content on failure   │
  │ • Proof: app/Http/Controllers/Admin/BcpcMonitoringController.php        │
  └───────────────────────────────────┬─────────────────────────────────────┘
                                      │ (Validated Data)
                                      ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ Tier 3: Business Logic & Domain Validation (Service Layer)              │
  │ • NutritionCalculatorService: WHO Growth Z-Scores (Weight/Height-for-Age)│
  │ • CaseManagementService & MembershipService: Valid state transitions    │
  │ • Proof: app/Services/NutritionCalculatorService.php                    │
  └───────────────────────────────────┬─────────────────────────────────────┘
                                      │ (Atomic DB Transactions)
                                      ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ Tier 4: Database Integrity & Constraints (Relational Engine)            │
  │ • Foreign Keys (constrained / nullOnDelete), Unique Indexes, Default    │
  │ • DB::transaction() for ACID Compliance                                 │
  │ • Proof: database/migrations/2026_04_13_024315_create_bcpc_children.php │
  └───────────────────────────────────┬─────────────────────────────────────┘
                                      │ (State Saved)
                                      ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ Tier 5: Security & Access Control Validation (RBAC & Audit Trail)       │
  │ • Spatie Role-Based Access Control, Session Guards                      │
  │ • Polymorphic audit_logs table (user_id, action, old_values, new_values)│
  │ • Proof: database/migrations/2026_03_01_172918_create_audit_logs_table  │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ 1. The 5-Tier Validation Framework & Codebase Proof

### Tier 1: Client-Side UI & Form Validation (React / Inertia.js)
* **Purpose:** Instant User Experience (UX) feedback before network transmission.
* **Codebase Proof:** 
  * [resources/js/pages/Admin/Bcpc/Create.tsx](file:///c:/Users/djemp/Herd/wfp-system_captsone/resources/js/pages/Admin/Bcpc/Create.tsx#L19-L37) (Lines 19–37 initialize form state via `useForm`; Lines 158, 169, 180 render field errors `{errors.guardian_name && <p className="text-xs text-destructive">{errors.guardian_name}</p>}`).
  * [resources/js/pages/Admin/Vawc/Create.tsx](file:///c:/Users/djemp/Herd/wfp-system_captsone/resources/js/pages/Admin/Vawc/Create.tsx#L19-L35).
  * [resources/js/pages/Public/Organizations/Apply/DynamicForm.tsx](file:///c:/Users/djemp/Herd/wfp-system_captsone/resources/js/pages/Public/Organizations/Apply/DynamicForm.tsx#L10-L25).
* **Code Snippet Proof:**
  ```tsx
  // From resources/js/pages/Admin/Bcpc/Create.tsx
  const { data, setData, post, processing, errors } = useForm({
      child_first_name: '',
      date_of_birth: '',
      weight_kg: '',
      height_cm: '',
  });

  // Client-side rendering of server-returned validation feedback:
  {errors.guardian_name && <p className="text-xs text-destructive mt-1">{errors.guardian_name}</p>}
  ```
* **Verbal Defense Script:**
  > *"Client-side validation is our first layer for user experience, giving immediate feedback in the browser. However, we treat client-side validation as purely cosmetic because malicious users can easily bypass browser checks using tools like Postman or cURL. Therefore, we never rely solely on frontend validation."*

---

### Tier 2: Server-Side HTTP Request Validation (Laravel Framework)
* **Purpose:** Uncompromising gatekeeper ensuring all incoming payloads adhere strictly to application schema before reaching core services.
* **Codebase Proof:**
  * [app/Http/Controllers/Admin/BcpcMonitoringController.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/app/Http/Controllers/Admin/BcpcMonitoringController.php#L212-L230) (Lines 212–230 perform strict bounds checking).
  * [app/Http/Controllers/Admin/AnnouncementController.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/app/Http/Controllers/Admin/AnnouncementController.php#L49-L59) (File upload MIME & size validation).
  * [app/Concerns/PasswordValidationRules.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/app/Concerns/PasswordValidationRules.php#L10-L25).
* **Code Snippet Proof:**
  ```php
  // From app/Http/Controllers/Admin/BcpcMonitoringController.php (Lines 212-230)
  $validated = $request->validate([
      'member_id' => 'nullable|exists:members,id',
      'zone_id' => 'nullable|exists:zones,id',
      'guardian_name' => 'required|string|max:255',
      'date_of_birth' => 'required|date|before_or_equal:today',
      'sex' => 'required|in:Male,Female',
      'date_of_weighing' => 'required|date|after_or_equal:date_of_birth|before_or_equal:today',
      'weight_kg' => 'required|numeric|min:0.5|max:100',
      'height_cm' => 'required|numeric|min:30|max:200',
  ]);
  ```
* **Verbal Defense Script:**
  > *"Every HTTP request undergoes server-side validation. If a payload fails any rule—such as entering a weighing date before birth date or a weight out of realistic bounds—Laravel instantly aborts execution and returns an HTTP 422 Unprocessable Content response back to the client, preventing dirty or malicious data from touching our business logic."*

---

### Tier 3: Business Logic & Domain Validation (Service Layer)
* **Purpose:** Enforces complex mathematical, legal, and procedural rules that basic request rules cannot handle.
* **Codebase Proof:**
  * [app/Services/NutritionCalculatorService.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/app/Services/NutritionCalculatorService.php#L18-L150) (WHO Standard Growth curves, computing age-in-months, evaluating Weight-for-Age and Height-for-Age z-scores).
  * [app/Services/MembershipService.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/app/Services/MembershipService.php#L14-L60) (State transitions for membership application approval/rejection).
  * [app/Services/CaseManagementService.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/app/Services/CaseManagementService.php#L13-L40) (Abuse type routing and case triage).
* **Code Snippet Proof:**
  ```php
  // From app/Services/NutritionCalculatorService.php
  public function evaluateWeightForAge(int $ageInMonths, string $sex, float $weightKg): string
  {
      $thresholds = ($sex === 'Female') ? $this->wfaGirls : $this->wfaBoys;
      // Evaluates child weight against WHO Standard Deviation (-2SD, -3SD) bands
      if ($weightKg < $severelyUnderweightThreshold) {
          return 'Severely Underweight';
      }
      ...
  }
  ```
* **Verbal Defense Script:**
  > *"Complex domain validation takes place inside dedicated Service classes. For instance, in our BCPC module, the `NutritionCalculatorService` computes exact age-in-months and evaluates WHO z-score growth benchmarks before automatically triaging malnourished children into the 90-Day Supplemental Feeding Program."*

---

### Tier 4: Database-Level Integrity & Constraints (DBMS Engine)
* **Purpose:** Hard structural safety built into the relational database engine (MySQL / PostgreSQL).
* **Codebase Proof:**
  * **ACID Transactions:** [app/Http/Controllers/Admin/BcpcMonitoringController.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/app/Http/Controllers/Admin/BcpcMonitoringController.php#L232-L300) (`DB::transaction(function () use ($validated) { ... })`).
  * **Foreign Key Constraints:** [database/migrations/2026_04_13_024315_create_bcpc_children_table.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/database/migrations/2026_04_13_024315_create_bcpc_children_table.php#L18-L20) (`$table->foreignId('zone_id')->nullable()->constrained()->nullOnDelete();`).
  * **Unique Indexes:** [database/migrations/2026_03_28_161836_create_vawc_cases_table.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/database/migrations/2026_03_28_161836_create_vawc_cases_table.php) (`$table->string('case_number')->unique();`).
* **Code Snippet Proof:**
  ```php
  // From app/Http/Controllers/Admin/BcpcMonitoringController.php (Line 232)
  return DB::transaction(function () use ($validated) {
      // 1. Calculate WHO metrics
      // 2. Triage SFP Status
      // 3. Save Child Record
      // 4. Create Initial Assessment Entry
  });
  ```
* **Verbal Defense Script:**
  > *"Even if application logic were to fail, our database schema enforces hard structural integrity using Foreign Key constraints, Unique Indexes, and DB Transactions (`DB::transaction`). If any step of a multi-table save fails, the entire transaction is rolled back, guaranteeing ACID compliance and zero orphaned records."*

---

### Tier 5: Security & Access Control Validation (RBAC & Audit Trail)
* **Purpose:** Validates user identity, verifies authorization rights, and logs every system state modification.
* **Codebase Proof:**
  * **Polymorphic Audit Trail Table:** [database/migrations/2026_03_01_172918_create_audit_logs_table.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/database/migrations/2026_03_01_172918_create_audit_logs_table.php#L13-L23).
  * **Audit Log Controller & Query Engine:** [app/Http/Controllers/Admin/AuditLogController.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/app/Http/Controllers/Admin/AuditLogController.php#L1-L110).
  * **Password Security & Authentication:** Configured via Laravel Fortify in [config/fortify.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/config/fortify.php).
* **Code Snippet Proof:**
  ```php
  // From database/migrations/2026_03_01_172918_create_audit_logs_table.php (Lines 13-23)
  Schema::create('audit_logs', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
      $table->string('action'); // Created, Updated, Deleted, Logged In, etc.
      $table->morphs('auditable'); // Polymorphic (auditable_type, auditable_id)
      $table->json('old_values')->nullable(); // State snapshot before action
      $table->json('new_values')->nullable(); // State snapshot after action
      $table->string('ip_address')->nullable();
      $table->string('user_agent')->nullable();
      $table->timestamps();
  });
  ```
* **Verbal Defense Script:**
  > *"Every sensitive action is validated against user permissions. Furthermore, all state modifications generate an automated entry in our polymorphic `audit_logs` table, storing before-and-after JSON snapshots along with IP addresses for complete accountability."*

---

## 🏗️ 2. System Architecture & Tech Stack

Our system is built as a **Modern Monolithic Single-Page Application (SPA)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (User Interface)                       │
│             React 19 + TypeScript + Vite + Tailwind CSS + Radix UI     │
│             Proof: package.json & resources/js/app.tsx                 │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
                         Inertia.js 2.0 (Bridge)
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                        BACKEND (Core Application)                      │
│                           Laravel 12 (PHP 8.2+)                        │
│                           Proof: composer.json                         │
│                                                                        │
│   [ HTTP Controllers ] ──► [ Service Layer ] ──► [ Eloquent Models ]   │
└─────────────────────────────────────────────────────┬──────────────────┘
                                                      │
                                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      DATABASE & BACKGROUND WORKERS                     │
│    MySQL / PostgreSQL Relational DB  |  Laravel Queues (jobs table)    │
│    Proof: database/migrations & config/queue.php                       │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions & Codebase Proof:
1. **Inertia.js Monolithic Bridge:** Eliminates the need for a separate REST API routing layer. Props are passed directly from Laravel Controllers to React components server-driven.
   * *Proof:* [composer.json](file:///c:/Users/djemp/Herd/wfp-system_captsone/composer.json#L13) (`"inertiajs/inertia-laravel": "^2.0"`) and [package.json](file:///c:/Users/djemp/Herd/wfp-system_captsone/package.json#L38) (`"@inertiajs/react": "^2.3.7"`).
2. **Controller-Service-Model Separation:** Controllers remain thin, business logic is isolated inside reusable Service classes (`app/Services`), and data access is managed through Eloquent Models.
3. **Asynchronous Background Processing:** Heavy operations such as bulk email dispatches or system notifications are delegated to Laravel Queue workers (`jobs` table).
   * *Proof:* [database/migrations/2026_04_16_034239_create_jobs_table.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/database/migrations/2026_04_16_034239_create_jobs_table.php) and [database/migrations/2026_03_27_032554_create_member_communications_table.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/database/migrations/2026_03_27_032554_create_member_communications_table.php).

---

## 🔐 3. Database Security, Encryptions & OWASP Protection

| Security Vector | Implementation Mechanism & File Proof | Panel Defense Script |
| :--- | :--- | :--- |
| **Password Hashing** | Laravel Fortify / **Bcrypt Hashing**<br>*Proof:* [composer.json](file:///c:/Users/djemp/Herd/wfp-system_captsone/composer.json#L14) (`"laravel/fortify"`) & `config/fortify.php` | *"Passwords are never stored in plain text. They are hashed using Bcrypt with a unique per-user salt and configurable cost factor, making them immune to rainbow table attacks."* |
| **SQL Injection Prevention** | **Eloquent ORM / PDO Parameterized Queries**<br>*Proof:* All models in `app/Models/` & controllers | *"All database queries use PDO prepared statements. User inputs are bound as strict data parameters, never concatenated into raw SQL strings."* |
| **Cross-Site Scripting (XSS)** | **React JSX Auto-Escaping**<br>*Proof:* All components in `resources/js/` | *"React automatically escapes all variables before injecting them into the DOM, neutralizing script tag injection attempts."* |
| **CSRF Protection** | **Laravel CSRF Middleware (`VerifyCsrfToken`)**<br>*Proof:* `bootstrap/app.php` session middleware | *"Every mutating request (POST, PUT, DELETE) requires a valid session CSRF token header matched against an encrypted SameSite session cookie."* |
| **Data Confidentiality & Privacy** | **Role Authorization & Field Access Control**<br>*Proof:* Spatie RBAC & Policy classes in `app/Policies/` | *"Sensitive victim and child records (VAWC/BCPC) are restricted via role guards and policy authorization, preventing unauthorized access."* |
| **Audit Logging** | **Polymorphic `audit_logs` Table**<br>*Proof:* [database/migrations/2026_03_01_172918_create_audit_logs_table.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/database/migrations/2026_03_01_172918_create_audit_logs_table.php) | *"Tracks `user_id`, `action`, `auditable_type`/`id`, `old_values` (JSON), `new_values` (JSON), `ip_address`, and `user_agent` for full accountability."* |
| **File Upload Security** | **MIME Validation & Secure Storage**<br>*Proof:* [app/Http/Controllers/Admin/AnnouncementController.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/app/Http/Controllers/Admin/AnnouncementController.php#L60) | *"Uploaded files are validated for MIME type and file size, assigned UUID filenames, and stored in isolated storage disks."* |

---

## 💬 4. Master Defense Q&A Script for IT Expert Panelists

### Category A: Validation & Data Integrity

#### Q1: "How about the validations of your system?"
* **Verbal Script:** *"We enforce a 5-Tier Validation Framework. First, Client-Side React validation in files like `resources/js/pages/Admin/Bcpc/Create.tsx`. Second, Server-Side Laravel HTTP request validation in controllers like `BcpcMonitoringController.php` which immediately rejects invalid payloads with HTTP 422. Third, Service-Layer Business Logic validation in `NutritionCalculatorService.php` for WHO child growth benchmarks. Fourth, Database-Level integrity using Foreign Key constraints and atomic DB Transactions. Fifth, Security and RBAC validation coupled with polymorphic audit logging in `audit_logs`."*

#### Q2: "What happens if someone bypasses your frontend validation and sends malicious data directly to your API?"
* **Verbal Script:** *"The server-side validation rules in our Laravel Controllers (e.g. `BcpcMonitoringController.php` line 212) immediately reject the request with a 422 Unprocessable Content HTTP response. Execution is halted before the payload ever reaches our application logic or touches the database."*

#### Q3: "How do you validate file uploads like announcement banners or case documents?"
* **Verbal Script:** *"In `AnnouncementController.php`, file uploads are validated on the server for strict MIME types (`image/jpeg`, `image/png`, `application/pdf`) and maximum file size (2 MB). Uploaded files are renamed with secure non-predictable filenames and stored in managed public/private storage disks, preventing arbitrary file execution attacks."*

#### Q4: "How do you guarantee that a database save operation doesn't leave partial or corrupt data if a crash occurs?"
* **Verbal Script:** *"In `BcpcMonitoringController.php` line 232, multi-step operations—such as saving a child's weighing record along with their guardian details—are wrapped inside an atomic database transaction (`DB::transaction()`). If any single step fails, the entire transaction rolls back completely, ensuring ACID compliance and zero data corruption."*

---

### Category B: System Architecture & Framework Selection

#### Q5: "Why did you choose Inertia.js instead of building a separate REST API with React?"
* **Verbal Script:** *"As documented in our `composer.json` and `package.json`, Inertia.js gives us the best of both worlds: a rich, reactive Single-Page Application (SPA) frontend in React, combined with the security and simplicity of server-driven Laravel routing. It eliminates the overhead of building, documenting, and synchronizing a separate REST API layer, preventing API-frontend contract drift."*

#### Q6: "How is your backend structured?"
* **Verbal Script:** *"We strictly follow a Controller-Service-Model architecture. HTTP Controllers (`app/Http/Controllers`) process request routing, Service classes (`app/Services`) encapsulate reusable business logic and calculations, and Eloquent Models (`app/Models`) handle database interaction and relationships."*

---

### Category C: Database Security, Encryption & Privacy

#### Q7: "How is your database secured against SQL Injection?"
* **Verbal Script:** *"We use Laravel's Eloquent ORM and Query Builder, which use PDO Parameterized Queries (prepared statements) exclusively. User inputs are treated strictly as bound parameters, rendering SQL injection impossible."*

#### Q8: "How are user passwords stored in your database?"
* **Verbal Script:** *"Passwords are hashed using Laravel Fortify (`laravel/fortify` in `composer.json`) with the Bcrypt algorithm. Bcrypt applies a salted, multi-round work factor, ensuring plain-text passwords can never be reverse-engineered even in the event of a database dump."*

#### Q9: "How do you protect sensitive records like VAWC victims or child nutrition data?"
* **Verbal Script:** *"Data access is governed by Role-Based Access Control (RBAC) and policy authorization. Only authorized personnel can view sensitive records, and any modification generates an entry in our polymorphic `audit_logs` table (migration `2026_03_01_172918_create_audit_logs_table.php`) tracking before-and-after JSON snapshots and IP addresses."*

---

## ⚡ 5. Quick Codebase Proof Index Table

| Validation / Security Concept | Exact Codebase File Path & Location |
| :--- | :--- |
| **Tier 1: Client Form Validation** | [resources/js/pages/Admin/Bcpc/Create.tsx](file:///c:/Users/djemp/Herd/wfp-system_captsone/resources/js/pages/Admin/Bcpc/Create.tsx#L19-L37) |
| **Tier 2: Server Request Validation** | [app/Http/Controllers/Admin/BcpcMonitoringController.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/app/Http/Controllers/Admin/BcpcMonitoringController.php#L212-L230) |
| **Tier 3: WHO Domain Logic Math** | [app/Services/NutritionCalculatorService.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/app/Services/NutritionCalculatorService.php#L18-L150) |
| **Tier 4: DB ACID Transactions** | [app/Http/Controllers/Admin/BcpcMonitoringController.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/app/Http/Controllers/Admin/BcpcMonitoringController.php#L232) |
| **Tier 4: Foreign Key Migration** | [database/migrations/2026_04_13_024315_create_bcpc_children_table.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/database/migrations/2026_04_13_024315_create_bcpc_children_table.php#L18-L20) |
| **Tier 5: Audit Log Schema** | [database/migrations/2026_03_01_172918_create_audit_logs_table.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/database/migrations/2026_03_01_172918_create_audit_logs_table.php#L13-L23) |
| **Tier 5: Audit Log Controller** | [app/Http/Controllers/Admin/AuditLogController.php](file:///c:/Users/djemp/Herd/wfp-system_captsone/app/Http/Controllers/Admin/AuditLogController.php) |
| **Password Hashing (Fortify)** | [composer.json](file:///c:/Users/djemp/Herd/wfp-system_captsone/composer.json#L14) & `config/fortify.php` |
