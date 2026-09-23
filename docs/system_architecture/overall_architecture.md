# 🏛️ System Architecture: Fullstack Engineering & Architectural Patterns

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Barangay 183, Villamor Airbase, Pasay City**

---

## 🏗️ 1. Modern Decoupled TALL + React Stack

The WFPIS platform operates on an enterprise **Hybrid Monolith** architecture that blends the transactional safety and robust ecosystem of Laravel with the fluid interactivity of modern React.

```
+-----------------------------------------------------------------------------------+
|                                PRESENTATION LAYER                                 |
|         React 19  *  TypeScript  *  Tailwind CSS  *  Shadcn UI Components         |
+-----------------------------------------+-----------------------------------------+
                                          | Inertia.js Hydration & Wire Protocol
+-----------------------------------------v-----------------------------------------+
|                                APPLICATION CONTROLLERS                            |
|  BcpcMonitoringController  *  VawcController  *  MembershipApplicationController  |
|  GadEventController        *  ChatbotController *  DatabaseBackupController       |
+--------------------+--------------------+--------------------+--------------------+
                     |                    |                    |
+--------------------v----+ +-------------v--------+ +---------v--------------------+
|     SERVICE LAYER       | |  EVENT / JOB QUEUE   | |   PYTHON AI ENGINE (SENTINEL) |
| NutritionCalcService    | | BulkEmailJobs        | | NLTK Tokenizer / Lemmatizer  |
| RiskAssessmentService   | | SlaAutoApproval      | | BoW Feature Extraction       |
| VawcBpoService          | | BcpcAssessmentEvents | | Scikit-Learn MLPClassifier   |
| OrganizationGovService  | | AppStatusChanged     | | Live DB Action Interceptors  |
| DatabaseBackupService   | |                      | |                              |
+--------------------+----+ +-------------+--------+ +---------+--------------------+
                     |                    |                    |
+--------------------v--------------------v--------------------v--------------------+
|                         DATABASE LAYER & ORM (ELOQUENT)                           |
|       MySQL Database  *  AuditObserver Logs  *  Point-in-Time SQL Snapshots       |
+-----------------------------------------------------------------------------------+
```

### 1.1 The Role of Inertia.js (The Architectural Glue)
Instead of building a separate GraphQL or client-side REST API with client routers (React Router), Inertia.js acts as an invisible bridge:
- **Server-Driven Routing:** Laravel routes remain the single source of truth.
- **Server Props Hydration:** Inertia serializes Laravel Eloquent data directly into React page component props.
- **No Client State Desync:** Eliminates JWT expiration issues in client local storage by leveraging HTTP-only session cookies and CSRF tokens.

---

## 💎 2. Clean Code, OOP Pillars & SOLID Implementation

### 2.1 The 4 Pillars of OOP
1. **Encapsulation:** Complex calculations (e.g. WHO z-score linear interpolation, VAWC-RAVE scoring, 24h BPO SLA timers) are encapsulated within dedicated Service classes (`NutritionCalculatorService`, `RiskAssessmentService`). Controllers do not perform raw calculations.
2. **Abstraction:** High-level controllers interact with abstract contracts and service interfaces, hiding database queries and SQL transactions.
3. **Inheritance:** Standard Eloquent Models inherit core capabilities from `Illuminate\Database\Eloquent\Model` while shared controller behaviors inherit from `App\Http\Controllers\Controller`.
4. **Polymorphism:** The `AuditLog` entity uses polymorphic relationships (`MorphTo` auditable) to attach audit trails to `VawcCase`, `BcpcChild`, `Member`, or `User` through a single unified schema.

### 2.2 SOLID Principles in Action
* **Single Responsibility Principle (SRP):** Monolithic React files exceeding 1,500 lines were refactored into atomic partials (<250 lines) coordinated by custom hooks (`useVawcCreateWorkflow`, `useVawcCaseWorkflow`).
* **Open/Closed Principle (OCP):** Service classes are open for extension (e.g. adding new WHO growth metrics or new protection order types) without modifying core controller dispatch logic.
* **Liskov Substitution Principle (LSP):** Specialized models substitute base model interfaces seamlessly in polymorphic queries.
* **Interface Segregation Principle (ISP):** Custom React interfaces in `types.ts` declare only the exact fields consumed by a specific component stage.
* **Dependency Injection (DI):** Laravel's service container injects domain services directly into controller action methods via constructor or method injection.
