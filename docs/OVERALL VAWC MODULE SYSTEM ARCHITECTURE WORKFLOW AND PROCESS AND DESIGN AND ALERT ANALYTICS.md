# 🛡️ OVERALL VAWC MODULE SYSTEM ARCHITECTURE, WORKFLOW, PROCESS, DESIGN, AND ALERT ANALYTICS

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **System Component**: Violence Against Women and Their Children (VAWC) Management & BPO Lifecycle Engine  
> **Primary Statutory Mandate**: Republic Act No. 9262 (*Anti-Violence Against Women and Their Children Act of 2004*)  
> **Intersecting Statutes**: RA 7610 (*Child Protection Act*), RA 11313 (*Safe Spaces Act*), Family Code of the Philippines  
> **Design Pattern**: Service-Oriented Architecture (SOA) + Hook-Driven Modular React / Inertia.js/ SHADCN Simplicity clean codes and simple UI/UX.
> **Audience**: Senior Software Engineers, Capstone Technical Panelists, System Architects, Legal Operations Officers  

NOTE: DO NOT FORGET TO SCAN THESE.
OFFICIAL WORKFLOW OF VAWC HANDLING CASE AND BPO ISSUANCE FLOWCHART 
1. C:\Users\djemp\Herd\wfp-system_captsone\Capstone Papers\Legal_Process_Official.md\Flowchart in Handling VAWC Cases.jpg

2. C:\Users\djemp\Herd\wfp-system_captsone\Capstone Papers\Legal_Process_Official.md\Flowchart Issuance and Enforcement of Barangay Protection Order(BPO) PER RA 9262.jpg
---

## 📑 Table of Contents
1. [Executive Summary & Core Architectural Philosophy](#1-executive-summary--core-architectural-philosophy)
2. [End-to-End System Workflow & Senior Developer Flowcharts](#2-end-to-end-system-workflow--senior-developer-flowcharts)
3. [Relational Database Architecture & Entity-Relationship Schema](#3-relational-database-architecture--entity-relationship-schema)
4. [Backend Architecture: Models, Controllers & Service Layer](#4-backend-architecture-models-controllers--service-layer)
5. [Frontend Architecture: Hook-Driven Component Hierarchy](#5-frontend-architecture-hook-driven-component-hierarchy)
6. [Core Algorithms & Mathematical Formulations](#6-core-algorithms--mathematical-formulations)
7. [Statutory Rules, Legal Taxonomy & Defensive Guardrails](#7-statutory-rules-legal-taxonomy--defensive-guardrails)
8. [Alert Analytics, SLA Monitoring & Real-Time Command Center](#8-alert-analytics-sla-monitoring--real-time-command-center)

---

## 1. Executive Summary & Core Architectural Philosophy

The **VAWC Management Module** within the Women and Family Protection Information System (WFPIS) is an enterprise-grade digital solution engineered to eliminate manual blotter delays, eradicate clerical errors in statutory timelines, and enforce legal compliance across domestic violence disclosures.

### 🏛️ The Three Core System Tenets
1. **"Search First, Encode Second" Policy**: Desk officers must query the live Master Dossier registry prior to creating new entries. This links repeat incidents, uncovers serial offenders, and prevents data fragmentation.
2. **Elimination of Monolithic Frontend Architecture**: Monolithic files exceeding 1,700–2,000 lines have been systematically refactored into **atomic step partials** (< 250 lines) coordinated by custom React hooks (`useVawcCreateWorkflow`, `useVawcCaseWorkflow`).
3. **Deterministic Statutory Compliance**: Every operational phase enforces hard programmatic guardrails reflecting Philippine jurisprudence—specifically the **24-hour BPO SLA** (Sec. 14), **Prohibition of Conciliation** (Sec. 33), **Public Crime Doctrine** (Loss of Local Disposition Authority upon Escalation), and **Section 44 Confidential Informant Protection**.

---

## 2. End-to-End System Workflow & Senior Developer Flowcharts

### 2.1 Request-Response Pipeline & Execution Lifecycle
```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (React 19 + TypeScript + Shadcn UI)"]
        UI_Create["Create.tsx Wizard Shell"]
        UI_Show["Show.tsx Case Control Center"]
        Hook_Create["useVawcCreateWorkflow()"]
        Hook_Show["useVawcCaseWorkflow()"]
        UI_Create <--> Hook_Create
        UI_Show <--> Hook_Show
    end

    subgraph Transport ["Inertia.js Protocol & HTTP Routing"]
        InertiaRouter["Inertia.post() / Inertia.get()"]
        RouteMiddleware["auth + RoleMiddleware (role:admin,head)"]
        Hook_Create --> InertiaRouter
        Hook_Show --> InertiaRouter
        InertiaRouter --> RouteMiddleware
    end

    subgraph ControllerLayer ["HTTP Orchestrator (VawcController.php)"]
        VawcCtrl["VawcController"]
        RouteMiddleware --> VawcCtrl
    end

    subgraph ServiceLayer ["Service Layer (Business Logic & Atomic DB Transactions)"]
        Svc_Case["VawcCaseService"]
        Svc_Bpo["VawcBpoService"]
        Svc_Comp["VawcComplianceService"]
        Svc_Legal["VawcLegalService"]
        Svc_Risk["RiskAssessmentService"]
        Svc_Audit["AuditLogger"]
        
        VawcCtrl --> Svc_Case
        VawcCtrl --> Svc_Bpo
        VawcCtrl --> Svc_Comp
        VawcCtrl --> Svc_Legal
        VawcCtrl --> Svc_Risk
        VawcCtrl --> Svc_Audit
    end

    subgraph DatabaseLayer ["Database Boundary (MySQL 8.0 / InnoDB)"]
        DB_Dossier["vawc_dossiers"]
        DB_Case["vawc_cases & case_reports"]
        DB_Parties["vawc_involved_parties"]
        DB_BPO["vawc_protection_orders"]
        DB_Logs["vawc_compliance_logs"]
        DB_Esc["vawc_legal_escalations"]
        DB_Audit["audit_logs"]

        Svc_Case --> DB_Dossier
        Svc_Case --> DB_Case
        Svc_Case --> DB_Parties
        Svc_Bpo --> DB_BPO
        Svc_Comp --> DB_Logs
        Svc_Legal --> DB_Esc
        Svc_Audit --> DB_Audit
    end
```

---

### 2.2 End-to-End Case Progression State Machine
```mermaid
stateDiagram-v2
    [*] --> MasterDossierGateway: Officer Searches Existing Record
    MasterDossierGateway --> IntakeForm: New Dossier or Incident Link
    
    state IntakeForm {
        [*] --> Step1_Survivor: Intake Mode & Sec. 44 Whistleblower
        Step1_Survivor --> Step2_Incident: Dates, Zone, RA 7610 Children
        Step2_Incident --> Step3_Respondent: Intimate Relation & Serial Check
        Step3_Respondent --> Step4_Verify: Transmittals & Desired Actions
        Step4_Verify --> [*]: Confirm Modal & DB Insert
    }

    IntakeForm --> RiskTriage: Automated VAWC-RAVE MCDA Scoring
    
    state RiskTriage {
        direction lr
        Low_Mod: Score 0-6 (Standard Processing)
        High: Score 7-9 (Expedited Processing)
        Critical: Score 10-12 (🚨 Emergency QRT Rescue)
    }

    RiskTriage --> ApplicationPending: BPO Application Filed (24h SLA Starts)
    
    ApplicationPending --> BpoIssued: Punong Barangay Issues BPO within 24h
    note right of BpoIssued: 15-Day Protection Clock Starts
    
    BpoIssued --> UnderMonitoring: BPO Officially Served to Respondent
    
    state UnderMonitoring {
        direction tb
        CheckIn: Desk/Phone/Home Visit Logged
        AssessCompliance: Is Respondent Compliant?
        CheckIn --> AssessCompliance
    }

    AssessCompliance --> UnderMonitoring: Compliant (Continue 15-day period)
    AssessCompliance --> Escalated: Breach / Violence / Invalidation
    
    state Escalated {
        direction tb
        PNP_Transmittal: Transmit to PNP WCPD
        Court_Filing: File TPO/PPO with Family Court
        JurisdictionalLock: Local Barangay Closure Blocked
        PNP_Transmittal --> JurisdictionalLock
        Court_Filing --> JurisdictionalLock
    }

    UnderMonitoring --> Closed: 15 Days Concluded Without Violation
    Escalated --> Closed: Official Court Resolution Entered (PPO/TPO/Dismissal)
    
    Closed --> [*]: Immutable Case Archival
```

---

### 2.3 Master Dossier Recidivism & Serial Perpetrator Linkage Flowchart
```mermaid
flowchart TD
    StartInput["Desk Officer Types Survivor / Respondent Name"] --> QGateway{"Live Gateway Query"}
    
    QGateway -- Exact Match Found --> AttachDossier["Attach to Master Dossier (DOS-YYYY-XXXX)"]
    AttachDossier --> LockIdentities["🔒 Evidentiary Lock: Names Immutable"]
    LockIdentities --> IncSeq["Increment Incident Sequence (Incident #2, #3...)"]
    IncSeq --> RecidivistFlag["Set is_repeat_offense = true (+3 Triage Weight)"]
    
    QGateway -- No Dossier Match --> DecoupledCheck["Query Decoupled Survivor & Perpetrator Registries"]
    
    DecoupledCheck -- Match Respondent in Other Dossiers --> SerialAlert["🚨 CROSS-DOSSIER SERIAL PERPETRATOR DETECTED"]
    SerialAlert --> SeparateDossier["Generate Brand New Survivor Dossier (Sec. 44 Privacy)"]
    SeparateDossier --> ElevateTriage["Elevate Lethality Score (+3 Serial Perpetrator History)"]
    
    DecoupledCheck -- Brand New Entities --> FreshIntake["Generate Master Dossier (Sub-case #1)"]
```

---

### 2.4 Official DILG NBOO Manual Intake & Two-Stage Triage Protocol Flowchart

To ensure 100% statutory alignment with the **DILG National Barangay Operations Office (NBOO)** official guidelines (*Handling VAWC Cases* and *Issuance & Enforcement of BPO per RA 9262*), the system architecture decouples raw incident fact gathering from post-intake algorithmic lethality triage:

```mermaid
flowchart TD
    subgraph IntakeStage["STAGE 1: WIZARD MANUAL INTAKE (FACT-GATHERING)"]
        direction TB
        S1["Step 1: Survivor & Reporter Profile<br/>• Complete Home Address (Bgy 183 Jurisdiction)<br/>• Birthplace & Nationality (Identity Verification)<br/>• DOB + Auto-Age + Minor Flag (&lt;18 RA 9262 Sec. 3(a))<br/>• Separate Whistleblower/Complainant Home Address"]
        
        S2["Step 2: Incident Facts & Safety Checklist<br/>• Exact Incident Premise / Spot Details<br/>• Armed Offender Switch & Weapons Checklist<br/>• Substance Abuse Checklist (Alcohol / Drugs)<br/>• Conditional Medical Facility Name (if medical care needed)<br/>• Conditional Alternative Shelter Choice (Relatives vs CSWDO)"]
        
        S3["Step 3: Respondent / Perpetrator Profile<br/>• Alias / Known Nickname<br/>• Current Home Address (Primary 24h BPO Service Target)<br/>• Primary Contact Number (Summons & Notice)<br/>• Workplace Name & Address (Secondary BPO Service Target)<br/>• RA 9262 Qualifying Intimate Relationship"]
        
        S4["Step 4: Verification, Emergency Actions & Guardian Consent<br/>• Immediate Emergency Actions Checklist (Tanod Rescue/Safe Custody)<br/>• Child-Victim BPO Guardian Consent Node (DILG Flowchart Node B)<br/>• Inter-Agency Transmittals & Desired Legal Actions"]
        
        S1 --> S2 --> S3 --> S4
    end

    subgraph DecisionNode["DILG FLOWCHART NODE B: MINOR SURVIVOR GUARDIAN CONSENT"]
        direction TB
        MinorCheck{"Is Survivor a Minor?<br/>(Age &lt; 18)"}
        S4 --> MinorCheck
        
        MinorCheck -- No (Adult Survivor) --> ProceedBPO["Standard BPO Workflow Enabled"]
        MinorCheck -- Yes (Minor) --> GuardianConsent{"Guardian / Mother<br/>Consented to BPO?"}
        
        GuardianConsent -- Yes (Consented) --> ProceedBPO
        GuardianConsent -- No (Unconsented) --> BypassBPO["⚠️ DILG Statutory Bypass:<br/>Bypass Barangay BPO Issuance<br/>Provide MSWDO Psychosocial Counseling<br/>Direct Court Escalation for TPO/PPO"]
    end

    subgraph ShowStage["STAGE 2: CASE SHOW PAGE (ALGORITHMIC TRIAGE EXECUTION)"]
        direction TB
        PreFill["Pre-fill Desk Triage Checklist<br/>(from Step 2 & 4 Intake Facts)"]
        TanodVerify["Tanod On-Site / Physical Veracity Verification"]
        MCDA["Execute VAWC-RAVE MCDA Scoring Algorithm"]
        
        ProceedBPO --> PreFill
        PreFill --> TanodVerify --> MCDA
    end
```

---

## 3. Relational Database Architecture & Entity-Relationship Schema

### 3.1 Mermaid Entity-Relationship Diagram (ERD)
```mermaid
erDiagram
    CASE_REPORTS ||--|| VAWC_CASES : "extends (1:1)"
    ZONES ||--o{ CASE_REPORTS : "locates"
    VAWC_DOSSIERS ||--o{ VAWC_CASES : "groups incidents (1:N)"
    VAWC_CASES ||--o{ VAWC_INVOLVED_PARTIES : "contains parties (1:N)"
    VAWC_CASES ||--o{ VAWC_ASSESSMENTS : "evaluates (1:N)"
    VAWC_CASES ||--o{ VAWC_PROTECTION_ORDERS : "issues (1:N)"
    VAWC_PROTECTION_ORDERS ||--o{ VAWC_BPO_SERVICE_RECORDS : "serves (1:N)"
    VAWC_CASES ||--o{ VAWC_COMPLIANCE_LOGS : "monitors (1:N)"
    VAWC_CASES ||--o{ VAWC_LEGAL_ESCALATIONS : "escalates (1:N)"
    VAWC_CASES ||--o{ VAWC_AGENCY_TRANSMITTALS : "transmits (1:N)"

    VAWC_DOSSIERS {
        bigint id PK
        string dossier_number UK
        string uuid UK
        string survivor_name
        string respondent_name
        string relationship_type
        int incident_count
        string highest_threat_level
        string current_lifecycle
        datetime last_incident_at
        json survivor_demographics
        json respondent_demographics
    }

    CASE_REPORTS {
        bigint id PK
        string tracking_number UK
        bigint zone_id FK
        text narrative_description
        string reporter_name
        string reporter_contact
        string complainant_address
        datetime incident_date
        string status
    }

    VAWC_CASES {
        bigint id PK
        bigint case_report_id FK,UK
        bigint dossier_id FK
        string uuid UK
        int incident_sequence
        string intake_type
        boolean is_anonymous
        string abuse_type
        string incident_location_details
        int children_count
        json children_details
        boolean is_repeat_offense
        boolean has_weapon_involved
        boolean is_offender_armed
        json weapons_used
        json substance_abuse
        boolean requires_medical
        string medical_facility_name
        boolean requires_alternative_housing
        string victim_shelter_choice
        json immediate_emergency_actions
        boolean is_bpo_consented_by_guardian
        string status
    }

    VAWC_INVOLVED_PARTIES {
        bigint id PK
        bigint vawc_case_id FK
        string party_type
        string name
        string alias
        date birthdate
        string birthplace
        string nationality
        int age
        boolean is_minor
        string gender
        string civil_status
        string contact_number
        string home_address
        string work_address
        string relationship_to_victim
        string physical_description
    }

    VAWC_ASSESSMENTS {
        bigint id PK
        bigint vawc_case_id FK
        int risk_score
        string risk_level
        json assessment_details
        datetime evaluated_at
    }

    VAWC_PROTECTION_ORDERS {
        bigint id PK
        bigint vawc_case_id FK
        string order_number UK
        datetime application_datetime
        datetime issued_datetime
        boolean is_sla_breached
        datetime served_datetime
        datetime expiration_date
        string status
    }

    VAWC_BPO_SERVICE_RECORDS {
        bigint id PK
        bigint protection_order_id FK
        datetime served_at
        string service_method
        string server_name
        string recipient_name
        boolean recipient_signature_obtained
    }

    VAWC_COMPLIANCE_LOGS {
        bigint id PK
        bigint vawc_case_id FK
        datetime check_date
        string check_type
        boolean is_compliant
        boolean survivor_reported_safe
        text notes
    }

    VAWC_LEGAL_ESCALATIONS {
        bigint id PK
        bigint vawc_case_id FK
        string escalation_authority
        datetime escalated_at
        string court_docket_number
        string issuing_court
        text judicial_findings
        string legal_status
    }

    VAWC_AGENCY_TRANSMITTALS {
        bigint id PK
        bigint vawc_case_id FK
        string agency_name
        datetime transmitted_at
        string transmittal_reason
        string receiving_officer
    }
```

---

### 3.2 Data Dictionary & Integrity Constraints

| Table Name | Primary Role | Key Foreign Keys | Critical Data Constraints |
| :--- | :--- | :--- | :--- |
| `vawc_dossiers` | Recidivism anchor connecting repeat cases between same parties. | None | `dossier_number` formatted as `DOS-YYYY-XXXX`. Strict unique index. |
| `case_reports` | Base municipal blotter ledger. | `zone_id` $\rightarrow$ `zones.id` | `tracking_number` immutable audit key. |
| `vawc_cases` | Domain-specific VAWC incident data. | `case_report_id` $\rightarrow$ `case_reports.id`<br>`dossier_id` $\rightarrow$ `vawc_dossiers.id` | `status` ENUM: `Intake`, `Assessment`, `Alternative Housing`, `BPO Processing`, `Monitoring`, `Escalated`, `Closed`. |
| `vawc_involved_parties`| Demographic profiles of victims, perpetrators, complainants. | `vawc_case_id` $\rightarrow$ `vawc_cases.id` | `party_type` restricted to `Victim`, `Respondent`, `Complainant`. |
| `vawc_protection_orders`| Barangay Protection Order statutory timeline. | `vawc_case_id` $\rightarrow$ `vawc_cases.id` | `is_sla_breached` computed if $(t_{\text{issue}} - t_{\text{apply}}) > 24\text{h}$. |
| `vawc_compliance_logs` | 15-day surveillance logs. | `vawc_case_id` $\rightarrow$ `vawc_cases.id` | `notes` strictly required to avoid empty compliance entries. |
| `vawc_legal_escalations`| Court/Prosecutor referral dossiers. | `vawc_case_id` $\rightarrow$ `vawc_cases.id` | Escalated cases require `court_docket_number` and `issuing_court` to close. |

---

## 4. Backend Architecture: Models, Controllers & Service Layer

The backend strictly implements the **Service Layer Pattern** to ensure controllers remain lean and testable.

### 4.1 Service Layer Responsibility Matrix
```
app/Services/
├── VawcCaseService.php        # Atomic creation of case, dossier linking, child details
├── VawcBpoService.php         # BPO application, 24h SLA checks, order issuance, proof of service
├── VawcComplianceService.php  # 15-day check-in logging, violation detection, auto-escalation
├── VawcLegalService.php       # Transmittals to PNP WCPD/Court, Sec. 33 anti-conciliation rule
├── RiskAssessmentService.php  # VAWC-RAVE multi-criteria lethality scoring formulation
└── VawcAnalyticsService.php   # Real-time SLA compliance, recidivism rates, zone heatmaps
```

#### Code Implementation: Atomic Case Creation in `VawcCaseService.php`
```php
public function createCase(array $data, int $userId): VawcCase
{
    return DB::transaction(function () use ($data, $userId) {
        // 1. Resolve or Create Master Dossier
        $dossier = $this->resolveDossier($data);
        
        // 2. Create Base Blotter Report
        $report = CaseReport::create([
            'tracking_number' => $this->generateTrackingNumber(),
            'zone_id' => $data['zone_id'],
            'incident_date' => $data['incident_date'],
            'narrative_description' => $data['description'],
            'status' => 'Intake',
        ]);

        // 3. Create Specific VAWC Record
        $vawcCase = VawcCase::create([
            'case_report_id' => $report->id,
            'dossier_id' => $dossier->id,
            'incident_sequence' => $dossier->incident_count + 1,
            'abuse_type' => $data['abuse_type'],
            'intake_type' => $data['intake_type'],
            'is_anonymous' => $data['is_anonymous'] ?? false,
            'children_count' => $data['children_count'] ?? 0,
            'children_details' => $data['children_details'] ?? [],
            'is_repeat_offense' => $dossier->incident_count > 0,
            'status' => 'Intake',
        ]);

        // 4. Attach Parties & Evaluate Triage
        $this->attachParties($vawcCase, $data);
        $this->evaluateRiskTriage($vawcCase, $data);
        $dossier->increment('incident_count');

        return $vawcCase;
    });
}
```

---

## 5. Frontend Architecture: Hook-Driven Component Hierarchy

To eradicate 2,000-line monolithic files, the VAWC user interface is organized into **atomic, single-purpose components** controlled by custom React hooks.

```
resources/js/
├── hooks/
│   ├── useVawcCreateWorkflow.ts          # Encapsulates all intake state, search debouncers, validators
│   └── useVawcCaseWorkflow.ts            # Encapsulates active case state, SLA health, dialog actions
│
└── pages/Admin/Vawc/
    ├── Create.tsx                        # Master Intake Shell (< 240 lines)
    ├── Show.tsx                          # Case Control Center Shell (< 240 lines)
    │
    ├── Partials/Create/                  # Step-by-step Intake Components
    │   ├── types.ts                      # Data contracts, Props, and PreselectedDossier
    │   ├── CreateHeader.tsx              # Unboxed header, RA 9262 badge, cancellation
    │   ├── DossierSearchGateway.tsx      # Step 0: "Search First, Encode Second" Gateway
    │   ├── Step1Survivor.tsx             # Step 1: Intake mode, whistleblower, victim demographics
    │   ├── Step2Incident.tsx             # Step 2: Datetime bounds, zone, RA 7610 children stay-away
    │   ├── Step3Respondent.tsx           # Step 3: Perpetrator profile, serial alert, legal relations
    │   ├── Step4Verify.tsx               # Step 4: Multi-agency transmittals, remedies, witnesses
    │   └── CreateConfirmModal.tsx        # Pre-submission review & confirmation modal
    │
    └── Partials/Show/                    # Case Management Stage Components
        ├── Stages/
        │   ├── Step1TriageChecklist.tsx  # Stage 1: Algorithmic lethality scoring & danger triggers
        │   ├── Step2BpoApplication.tsx   # Stage 2: BPO application filing with chronological bounds
        │   ├── Step3BpoIssuance.tsx      # Stage 3: Same-Day 24h SLA compliance analyzer
        │   ├── Step4BpoService.tsx       # Stage 4: Substituted / Personal service logger
        │   ├── Step5Resolution.tsx       # Stage 5: 15-day compliance monitoring & escalation trigger
        │   └── VawcMonitoringLogSection.tsx # Historical log table of home visits and wellness checks
        └── Modals/
            ├── VawcCloseCaseModal.tsx    # Sec. 33 anti-conciliation enforcement & judicial gate
            └── VawcReferralModal.tsx     # External agency transmittal slip generator
```

---

## 6. Core Algorithms & Mathematical Formulations

### 6.1 Algorithm 1: VAWC-RAVE Multi-Criteria Decision Analysis (MCDA) Risk Evaluation
The **VAWC Risk Assessment & Vulnerability Evaluation (VAWC-RAVE)** engine assigns an objective lethality score ($0 \le S \le 12$) based on 4 weighted statutory criteria:

$$\text{VAWC-RAVE Score} = C_{\text{weapon}} + C_{\text{freq}} + C_{\text{severity}} + C_{\text{lethality}}$$

```
+-------------------+-------------------------------------------------------------+-------+
| Criterion         | Statutory Trigger Conditions                                | Score |
+-------------------+-------------------------------------------------------------+-------+
| C_weapon          | has_weapon_involved == true OR weapons_confiscated == true  | 3     |
|                   | No weapon reported                                          | 1     |
+-------------------+-------------------------------------------------------------+-------+
| C_freq            | is_repeat_offense == true OR incident_count > 1             | 3     |
|                   | First-time disclosure                                       | 1     |
+-------------------+-------------------------------------------------------------+-------+
| C_severity        | requires_medical == true OR perpetrator_present == true     | 3     |
|                   | incident_veracity == true (Verified Physical Bruising)      | 2     |
|                   | Routine disclosure                                          | 1     |
+-------------------+-------------------------------------------------------------+-------+
| C_lethality       | warrantless_arrest_made == true OR strangulation reported   | 3     |
|                   | children_count > 0 OR requires_alternative_housing == true  | 2     |
|                   | Standard risk                                               | 1     |
+-------------------+-------------------------------------------------------------+-------+
```

#### Triage Classification & Automated Protocol:
- 🚨 **CRITICAL (Score 10–12)**: **Emergency Ex-Officio Rescue Protocol**. Triggers immediate PNP QRT dispatch, warrantless arrest assistance, and CSWDO emergency shelter bypass.
- 🟠 **HIGH (Score 7–9)**: Expedited BPO issuance within 2 hours, Punong Barangay immediate notification.
- 🟡 **MODERATE (Score 4–6)**: Standard 24-hour BPO processing and social worker counseling.
- 🔵 **LOW (Score 0–3)**: Routine intake processing and standard monitoring.

---

### 6.2 Algorithm 2: Real-Time 24-Hour BPO SLA Analyzer
Under RA 9262 Section 14, the Punong Barangay must issue a BPO within **twenty-four (24) hours** of application filing. The system computes the exact time delta:

$$\Delta t_{\text{SLA}} = t_{\text{issuance}} - t_{\text{application}}$$

$$\text{Status} = \begin{cases} 
\text{INVALID (Blocked)}, & \Delta t_{\text{SLA}} < 0 \quad (\text{Chronological Violation}) \\
\text{COMPLIANT (Green)}, & 0 \le \Delta t_{\text{SLA}} \le 24\text{ hours} \\
\text{BREACH (Amber Alert)}, & \Delta t_{\text{SLA}} > 24\text{ hours} \implies \text{is\_sla\_breached} = \text{true}
\end{cases}$$

---

### 6.3 Algorithm 3: Dual-Timestamp Statutory Audit Discrepancy
To authenticate whether records were entered during live desk operations or back-encoded historically:

$$\Delta t_{\text{audit}} = |t_{\text{process}} - t_{\text{system\_created}}|$$

$$\text{Badge} = \begin{cases}
\text{"Live Real-Time Intake"}, & \Delta t_{\text{audit}} \le 24\text{ hours} \\
\text{"Historical Back-Encoding (Retroactive)"}, & \Delta t_{\text{audit}} > 24\text{ hours}
\end{cases}$$

---

## 7. Statutory Rules, Legal Taxonomy & Defensive Guardrails

### 7.1 Qualifying Intimate Relationship Taxonomy (RA 9262 Sec. 3)
Under Philippine jurisprudence, an act can only be prosecuted under RA 9262 if the respondent shares an **intimate, marital, dating, or common-child relationship** with the victim.

> [!CAUTION]
> **Strict Legal Exclusion of "Other Household Relative":**
> In accordance with legal mandates, `"Other Household Relative (with custody/care)"` has been permanently deleted from the system. Non-intimate household offenses (e.g., uncle assaulting a niece) must be filed under **RA 7610** (Child Abuse) or Physical Injuries under the Revised Penal Code.

#### The 7 Programmatically Enforced Relationships:
1. `Spouse (Legal Husband/Wife)`
2. `Former Spouse (Separated/Annulled)`
3. `Common-Law / Live-in Partner`
4. `Former Live-in Partner`
5. `Parent of Common Child`
6. `Dating / Romantic / Sexual Partner`
7. `Former Dating Partner`

---

### 7.2 Strict Prohibition of Conciliation (RA 9262 Sec. 33)
Section 33 of RA 9262 strictly states: *"Barangay officials are prohibited from attempting to conciliate or mediate between the parties in acts of violence covered under this Act."*

- **Programmatic Enforcement**: The option `"Amicable Settlement / Conciliation"` is physically excluded from all dropdowns and closure modals. Attempting to bypass this triggers a database validation exception.

---

### 7.3 Public Crime Doctrine & The Jurisdictional Gate
Domestic violence under RA 9262 is a **public offense against the State**. Once a case is escalated to the PNP Women and Children Protection Desk (WCPD) or Family Court (Step 6):
1. **Loss of Local Authority**: The barangay desk officer legally loses power to close or dismiss the case locally.
2. **UI Lockout**: The standard "Close Case File" button is disabled and badged as `Local Closure Blocked (Active Criminal Proceeding)`.
3. **Mandatory Judicial Gate**: The case can only be archived after entering official judicial credentials:
   - Court Docket / Resolution Number (e.g., `Crim. Case No. 2026-114`)
   - Issuing Judicial Authority (e.g., `RTC Branch 12 Family Court`)
   - Order / Resolution Date & Official Findings

---

### 7.4 Minor Children Coverage under RA 7610 & RA 9262 Sec. 8
Children present during domestic violence suffer psychological trauma recognized under RA 7610. 
- The system supports recording minor children (Name, Age, School/Daycare).
- Capturing the child's school/daycare center automatically inserts specific **statutory stay-away radius orders** into the generated BPO document to prevent abduction or harassment at educational institutions.

---

## 8. Alert Analytics, SLA Monitoring & Real-Time Command Center

The VAWC Dashboard (`/admin/vawc/dashboard`) parses complex relational tables into actionable operational intelligence:

### 8.1 Real-Time Alert Matrix
```
+------------------------------------+--------------------------------+------------------------------------------------+
| Alert Type                         | Detection Criteria             | Operational Action Triggered                   |
+------------------------------------+--------------------------------+------------------------------------------------+
| 🚨 24h SLA Breach Alert            | Δt_SLA > 24 hours              | Flags Punong Barangay; logs is_sla_breached.   |
| 🚨 Serial Perpetrator Match        | Respondent matched in >1 DOS   | Elevates lethality score; links history.       |
| ⚠️ 15-Day BPO Expiring (48h)       | now() >= (expiration - 48h)    | Prompts final compliance check or court TPO.   |
| 🔴 Active BPO Violation Flag       | is_compliant == false in log   | Initiates immediate PNP/Court escalation.      |
| 🛡️ Whistleblower Protected Record  | is_anonymous == true           | Activates Sec. 44 identity redaction masking.  |
+------------------------------------+--------------------------------+------------------------------------------------+
```

### 8.2 Executive Key Performance Indicators (KPIs)
1. **SLA Compliance Rate (%)**: Percentage of Barangay Protection Orders officially signed and issued within the 24-hour statutory window.
2. **Recidivism Velocity Index**: Frequency of subsequent incidents filed under existing Master Dossiers.
3. **Zone Incident Heatmap**: Geospatial distribution of domestic violence incidents grouped by Barangay Zone (`LEFT JOIN` query ensures unassigned zones are captured).
4. **Inter-Agency Referral Velocity**: Tracked transmittals to PNP WCPD, DSWD, and CSWDO to verify multi-sectoral protection response.

---

## 🏛️ Summary for College Technical Defense Panel

| Panel Question | Senior Architectural Defense Script |
| :--- | :--- |
| **"Why is your frontend split into so many partials?"** | *"We followed the Single Responsibility Principle (SRP). `Create.tsx` and `Show.tsx` are clean orchestrators under 240 lines. Each lifecycle phase (Intake, Incident Facts, Respondent, BPO Issuance, Compliance) is an isolated partial component, and all state is managed cleanly through custom React hooks."* |
| **"Why did you delete 'Other Household Relative'?"** | *"Under Section 3 of RA 9262, the crime of VAWC strictly requires an intimate, marital, dating, or common-child relationship. Non-intimate household offenses are properly charged under RA 7610 or Physical Injuries under the RPC. Removing it guarantees 100% statutory precision."* |
| **"How does the system ensure data integrity for repeat abusers?"** | *"Through our Master Dossier pattern. When an abuser repeats an offense against the same victim, the system locks the names to preserve chain of custody and increments the sub-case sequence. If an abuser attacks a new victim, cross-dossier serial perpetrator detection alerts the officer while keeping the survivor's records confidential under Sec. 44."* |

---
*End of Blueprint — Official System Architecture & Workflow Manual for WFPIS VAWC Module*
---