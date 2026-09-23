# 🏗️ BCPC Module: System Architecture

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Barangay Council for the Protection of Children (BCPC) Child Nutrition Module

---

## 🏛️ 1. Multi-Tier Layered Architecture

The BCPC module isolates mathematical calculations from HTTP handling, delegating WHO z-score lookups to an encapsulated calculation service.

```mermaid
flowchart TD
    subgraph ClientLayer ["1. Presentation Layer (React 19 + TypeScript + Shadcn UI)"]
        UI_Index["Index.tsx (Master OPT+ Census Registry)"]
        UI_Show["Show.tsx (Child Growth Card & SFP Timeline)"]
        UI_Create["Create.tsx (Child Intake & Baseline Weighing)"]
        UI_Dashboard["Dashboard.tsx (Prevalence Heatmaps & SFP Radar)"]
        UI_Print["Print.tsx (Official DOH/NNC Printable Masterlist)"]
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
        Svc_Analytics["BcpcAnalyticsService.php<br/>(Prevalence & Recovery Rate Calculator)"]
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
    UI_Show --> InertiaRouter
    UI_Create --> InertiaRouter
    UI_Dashboard --> InertiaRouter
    UI_Print --> InertiaRouter
```

---

## 💾 2. Entity-Relationship Data Model

The schema separates stable demographic entities from time-series clinical weighing evaluations:

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
- **WHO Array Tables:** Stores static reference lookup vectors for boys and girls from month 0 to 60 (Median, $-1\text{ SD}$, $-2\text{ SD}$, $-3\text{ SD}$, $+1\text{ SD}$, $+2\text{ SD}$, $+3\text{ SD}$).
- **Continuous Interpolation:** Computes exact decimal age and performs linear interpolation between bounding monthly milestones.
- **Extreme Sanity Checking:** Implements `isBiologicalOutlier($weight, $height, $ageMonths)` returning boolean warning flags.
- **Clinical Triage Evaluator:** Assigns categorical status based on WHO standard cut-offs.

### `BcpcAnalyticsService.php`
- Computes aggregate zone prevalence:
  $$\text{Prevalence Rate} = \left( \frac{N_{\text{malnourished children in zone}}}{N_{\text{total children weighed in zone}}} \right) \times 100\%$$
- Computes SFP recovery velocity:
  $$\text{Velocity} = \frac{\text{Weight}_{\text{final}} - \text{Weight}_{\text{baseline}}}{\Delta t_{\text{days}}} \quad (\text{g/day})$$
