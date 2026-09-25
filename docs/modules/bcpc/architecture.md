# 🏗️ BCPC Module: System Architecture

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Barangay Council for the Protection of Children (BCPC) Child Nutrition Module  
> **Architecture Pattern:** Multi-Tier Architecture with Modular Clean-Partials Presentation Layer

---

## 🏛️ 1. Multi-Tier Layered Architecture

The BCPC module is organized into five decoupled architectural layers, isolating presentation logic, transport routing, domain business services, and database persistence.

```mermaid
flowchart TD
    subgraph ClientLayer ["1. Presentation Layer (React 19 + TypeScript + Modular Partials)"]
        direction TB
        subgraph Orchestrators ["Page Orchestrators"]
            UI_Index["Index.tsx (Master OPT+ Census Registry)"]
            UI_Create["Create.tsx (3-Step Child Intake Wizard)"]
            UI_Show["Show.tsx (Longitudinal Profile & Growth Card)"]
            UI_Dashboard["Dashboard.tsx (Real-Time Action Center)"]
            UI_Print["Print.tsx (Official DOH/NNC Printable Masterlist)"]
        end
        subgraph Partials ["Modular Partials Hierarchy"]
            P_Index["Partials/Index/<br/>(MetricCards, FilterBar, Table)"]
            P_Create["Partials/Create/<br/>(Step1Household, Step2Identity, Step3Measurement)"]
            P_Show["Partials/Show/<br/>(Header, Demographics, Timeline, Diagnostics, Modals/*)"]
            P_Dashboard["Partials/Dashboard/<br/>(KpiStrip, TriageQueue, SfpRoster, ZoneTable, Distributions)"]
        end
        UI_Index -.-> P_Index
        UI_Create -.-> P_Create
        UI_Show -.-> P_Show
        UI_Dashboard -.-> P_Dashboard
    end

    subgraph TransportLayer ["2. Transport Layer (Inertia.js Protocol)"]
        InertiaRouter["Inertia Router (GET / POST / PUT)"]
        AuthMiddleware["Middleware: auth + role:admin,bns,head"]
        InertiaRouter --> AuthMiddleware
    end

    subgraph ControllerLayer ["3. Application Controller"]
        BcpcCtrl["BcpcMonitoringController.php"]
        AuthMiddleware --> BcpcCtrl
    end

    subgraph ServiceLayer ["4. Domain Services"]
        Svc_Nutri["NutritionCalculatorService.php<br/>(WHO 3-Axis & Interpolation Engine)"]
        Svc_Analytics["BcpcAnalyticsService.php<br/>(Prevalence, Heatmaps & SFP Velocity)"]
        Svc_Audit["AuditLogger.php<br/>(COA Compliance Traceability)"]

        BcpcCtrl --> Svc_Nutri
        BcpcCtrl --> Svc_Analytics
        BcpcCtrl --> Svc_Audit
    end

    subgraph DatabaseLayer ["5. Relational Persistence Layer (MySQL 8.0)"]
        DB_Children[("bcpc_children<br/>(Master Demographics)")]
        DB_Assessments[("bcpc_assessments<br/>(Longitudinal Measurements & Z-Scores)")]
        DB_Audit[("audit_logs<br/>(Immutable Log)")]

        BcpcCtrl --> DB_Children
        BcpcCtrl --> DB_Assessments
        Svc_Audit --> DB_Audit
    end

    UI_Index --> InertiaRouter
    UI_Create --> InertiaRouter
    UI_Show --> InertiaRouter
    UI_Dashboard --> InertiaRouter
    UI_Print --> InertiaRouter
```

---

## 💾 2. Entity-Relationship Data Model

The schema cleanly isolates immutable/longitudinal demographic records from time-series clinical weighing evaluations:

```mermaid
erDiagram
    BCPC_CHILDREN ||--|{ BCPC_ASSESSMENTS : "has longitudinal"
    BCPC_CHILDREN ||--o{ AUDIT_LOGS : "audits changes"
    BCPC_ASSESSMENTS ||--o{ AUDIT_LOGS : "audits changes"

    BCPC_CHILDREN {
        bigint id PK
        string child_code UK "BCPC-2026-XXXX"
        string first_name
        string middle_name
        string last_name
        string gender "male, female"
        date birth_date
        string mother_name
        string father_name
        string guardian_contact
        string zone "Zone 1 to Zone 10"
        text address
        string status "active, aged_out, transferred, deceased"
        date aged_out_at
        timestamps created_at
    }

    BCPC_ASSESSMENTS {
        bigint id PK
        bigint bcpc_child_id FK
        date assessment_date
        integer age_in_months
        decimal weight_kg "4,2 precision"
        decimal height_cm "4,2 precision"
        string measurement_type "lying, standing"
        boolean has_edema
        string wfa_status "severely_underweight, underweight, normal, overweight"
        string hfa_status "severely_stunted, stunted, normal, tall"
        string wfl_status "sam, mam, normal, overweight, obese"
        integer sfp_cycle_number
        string sfp_milestone "baseline, day_30, day_60, day_90, day_120"
        boolean vitamin_a_given
        boolean deworming_given
        boolean mnp_given
        text clinical_notes
        bigint measured_by_user_id FK
        timestamps created_at
    }
```

---

## ⚙️ 3. Service Layer Architecture

### `NutritionCalculatorService.php`
- **WHO Growth Reference Standards:** Encapsulates official WHO reference tables for boys and girls from birth to 60 months.
- **Continuous Interpolation:** Computes exact decimal age and performs linear interpolation between adjacent monthly nodes for decimal-accurate z-score approximation.
- **Extreme Biological Sanity Guardrail:** Implements `isBiologicalOutlier($weight, $height, $ageMonths)` enforcing $[1.5\text{ kg}, 35\text{ kg}]$ and $[40\text{ cm}, 125\text{ cm}]$ limits to trap typographical errors.
- **Preliminary Decision-Support Triage:** Assigns preliminary nutritional status across WFA, HFA, and WFL/H for human health worker verification.

### `BcpcAnalyticsService.php`
- **Zone Heatmap Aggregations:** Computes malnutrition density and prevalence rates across all 10 Zones of Barangay 183.
- **Clinical Action Queues:** Dynamically segments children requiring intervention (SAM, MAM, Double Burden, Stunting, Overdue Weighings).
- **SFP Velocity Engine:** Evaluates therapeutic weight velocity ($g/\text{day}$) to track rehabilitation progress.
