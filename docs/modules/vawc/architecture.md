# 🏗️ VAWC Module: System Architecture

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Violence Against Women and Their Children (VAWC) Management

---

## 🏛️ 1. Multi-Tier Layered Architecture

The VAWC module follows a strict **Service-Oriented MVC Architecture** decoupled from direct controller database interactions, adhering to the Single Responsibility Principle (SRP) and Open/Closed Principle (OCP).

```mermaid
flowchart TD
    subgraph ClientLayer ["1. Presentation Layer (React 19 + TypeScript + Shadcn UI)"]
        UI_List["Index.tsx (Master Case Blotter Table)"]
        UI_Create["Create.tsx (Modular Wizard Shell)"]
        UI_Show["Show.tsx (Case Control Center)"]
        Hook_Create["useVawcCreateWorkflow.ts"]
        Hook_Show["useVawcCaseWorkflow.ts"]
        
        UI_Create <--> Hook_Create
        UI_Show <--> Hook_Show
    end

    subgraph TransportLayer ["2. Transport Layer (Inertia.js Protocol & HTTP Routing)"]
        InertiaRouter["Inertia Router (POST/GET/PUT)"]
        AuthMiddleware["Middleware: auth + role:admin,head"]
        InertiaRouter --> AuthMiddleware
    end

    subgraph ControllerLayer ["3. Application Controller Layer"]
        VawcCtrl["VawcController.php"]
        AuthMiddleware --> VawcCtrl
    end

    subgraph ServiceLayer ["4. Domain Service Layer (Pure Business Logic)"]
        Svc_Case["VawcCaseService.php"]
        Svc_Bpo["VawcBpoService.php"]
        Svc_Comp["VawcComplianceService.php"]
        Svc_Legal["VawcLegalService.php"]
        Svc_Risk["RiskAssessmentService.php"]
        Svc_Audit["AuditLogger.php"]
        
        VawcCtrl --> Svc_Case
        VawcCtrl --> Svc_Bpo
        VawcCtrl --> Svc_Comp
        VawcCtrl --> Svc_Legal
        VawcCtrl --> Svc_Risk
        VawcCtrl --> Svc_Audit
    end

    subgraph DatabaseLayer ["5. Relational Persistence Layer (MySQL 8.0 / InnoDB)"]
        DB_Dossier[("vawc_dossiers")]
        DB_Case[("vawc_cases & case_reports")]
        DB_Parties[("vawc_involved_parties")]
        DB_BPO[("vawc_protection_orders")]
        DB_Service[("vawc_bpo_service_records")]
        DB_Logs[("vawc_compliance_logs")]
        DB_Esc[("vawc_legal_escalations")]
        DB_Audit[("audit_logs")]

        Svc_Case --> DB_Dossier
        Svc_Case --> DB_Case
        Svc_Case --> DB_Parties
        Svc_Bpo --> DB_BPO
        Svc_Bpo --> DB_Service
        Svc_Comp --> DB_Logs
        Svc_Legal --> DB_Esc
        Svc_Audit --> DB_Audit
    end

    Hook_Create --> InertiaRouter
    Hook_Show --> InertiaRouter
```

---

## 💾 2. Relational Database Entity-Relationship Schema

The VAWC module is normalized to 3rd Normal Form (3NF) to preserve relational integrity across complex legal proceedings.

```mermaid
erDiagram
    VAWC_DOSSIERS ||--o{ VAWC_CASES : "aggregates"
    VAWC_CASES ||--|{ VAWC_INVOLVED_PARTIES : "involves"
    VAWC_CASES ||--o{ CASE_ABUSE_TYPES : "classifies"
    VAWC_CASES ||--o{ VAWC_ASSESSMENTS : "evaluates"
    VAWC_CASES ||--o{ VAWC_PROTECTION_ORDERS : "issues"
    VAWC_PROTECTION_ORDERS ||--o{ VAWC_BPO_SERVICE_RECORDS : "serves"
    VAWC_CASES ||--o{ VAWC_COMPLIANCE_LOGS : "tracks"
    VAWC_CASES ||--o{ VAWC_LEGAL_ESCALATIONS : "escalates"
    VAWC_CASES ||--o{ AUDIT_LOGS : "audits"

    VAWC_DOSSIERS {
        bigint id PK
        string dossier_number UK
        string subject_name
        string subject_type "victim, respondent"
        date birth_date
        string contact_number
        text address
        timestamps created_at
    }

    VAWC_CASES {
        bigint id PK
        bigint dossier_id FK
        string case_number UK
        string status "screening, active, under_bpo, escalated, closed"
        date incident_date
        string incident_location
        string incident_purok
        text narrative
        integer risk_score
        string risk_level "low, medium, high"
        bigint handled_by_user_id FK
        timestamps created_at
    }

    VAWC_INVOLVED_PARTIES {
        bigint id PK
        bigint vawc_case_id FK
        string party_type "victim, respondent, child, informant"
        string full_name
        integer age
        string gender
        string relationship_to_victim
        boolean is_confidential
    }

    VAWC_PROTECTION_ORDERS {
        bigint id PK
        bigint vawc_case_id FK
        string bpo_number UK
        timestamp application_date
        timestamp sla_deadline
        timestamp issued_at
        timestamp served_at
        date relief_effective_until
        string status "pending, issued, served, violated, expired"
        bigint signed_by_official_id FK
    }

    VAWC_BPO_SERVICE_RECORDS {
        bigint id PK
        bigint vawc_protection_order_id FK
        string served_by_name
        timestamp date_served
        string service_method "personal, substituted"
        string recipient_relationship
        text proof_notes
    }

    VAWC_COMPLIANCE_LOGS {
        bigint id PK
        bigint vawc_case_id FK
        date log_date
        string activity_type "hearing, home_visit, counseling"
        text findings
        boolean violation_detected
        bigint logged_by_user_id FK
    }

    VAWC_LEGAL_ESCALATIONS {
        bigint id PK
        bigint vawc_case_id FK
        string receiving_agency "PNP_WCPD, DSWD, PROSECUTOR, COURT"
        string transmittal_number UK
        date transmittal_date
        text transmittal_notes
        string agency_officer_name
    }
```

---

## ⚙️ 3. Service Layer Responsibilities

1. **`VawcCaseService`**:
   - Manages atomic transactions (`DB::transaction`) for case creation, party registration, and Pink Form classification.
   - Computes unique case numbers using the format `VAWC-YYYY-MM-XXXX`.
2. **`VawcBpoService`**:
   - Computes the 24-hour statutory SLA timestamp upon BPO application.
   - Validates official signatory authorization before issuing the order.
   - Computes the 15-day validity window upon service.
3. **`VawcComplianceService`**:
   - Logs monitoring activities and automatically flags BPO violation events.
4. **`VawcLegalService`**:
   - Compiles full case transmittal packages for external agencies, generating tamper-evident PDF dossiers.
5. **`RiskAssessmentService`**:
   - Executes the deterministic scoring matrix for the VAWC-RAVE algorithm.
6. **`AuditLogger`**:
   - Automatically writes state mutations (`old_values`, `new_values`, user IP, User-Agent) to `audit_logs`.
