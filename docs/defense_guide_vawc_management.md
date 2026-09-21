# 🛡️ VAWC Management & BPO Workflow Defense Guide

This document provides a comprehensive overview of the **VAWC Case Management System** and the **Barangay Protection Order (BPO) Lifecycle** built for the Women and Family Desk. It is designed to assist panelists and developers in understanding the architectural decisions, legal compliance, and technical implementation of the module.

---

## 📌 1. System Overview & Legal Compliance

The primary objective of this module is to digitize and enforce the strict regulations mandated by **RA 9262 (Anti-Violence Against Women and Their Children Act of 2004)**. 

Unlike generic blotter reports, VAWC cases require immediate legal action, continuous compliance monitoring, and strict confidentiality. This system completely separates generic cases from VAWC cases by implementing a dedicated `VawcCase` model that extends the standard `CaseReport` log with highly specialized fields.

### Key RA 9262 Automations:
- **Immediate Response (SLA):** RA 9262 mandates that BPOs be issued on the same day they are applied for. The system tracks the `application_datetime` vs `issued_datetime` and automatically flags SLA breaches.
- **Monitoring (Steps 8-11):** Structured "Compliance Logs" force the recording of respondent behavior, allowing automated referral pathways (e.g., DSWD for counseling).
- **Escalation (Step 12):** Automatically generates the PNP/Prosecutor transmittal documents and flags cases under the "Escalated" status if the respondent violates the protection order.

---

## ⚖️ 2. Legal Bases & Qualifying Relationship Categories (RA 9262 Sec. 3)

### Statutory Exclusion of Non-Qualifying Relatives
Under Section 3 of Republic Act 9262, the crime of VAWC can only be committed against a woman who is the offender's wife, former wife, or with whom the offender has or had an intimate/dating relationship, or with whom he has a common child.

> [!IMPORTANT]
> **Defending the Removal of "Other Household Relative":**
> In older prototypes, "Other Household Relative (with custody/care)" was incorrectly included. Under Philippine legal jurisprudence, if an uncle, cousin, or in-law abuses a household member without an intimate or marital relationship, it does **not** fall under RA 9262. It must be charged under **RA 7610** (Child Abuse) or Physical Injuries under the Revised Penal Code (RPC). The system strictly enforces the 7 legally recognized intimate relationships:
> 1. `Spouse (Legal Husband/Wife)`
> 2. `Former Spouse (Separated/Annulled)`
> 3. `Common-Law / Live-in Partner`
> 4. `Former Live-in Partner`
> 5. `Parent of Common Child`
> 6. `Dating / Romantic / Sexual Partner`
> 7. `Former Dating Partner`

---

## 🔄 3. The VAWC Lifecycle (State Machine)

A `VawcCase` progresses through a strict, linear state machine to prevent procedural errors. The `status` field strictly enforces the following ENUM values:

1.  `Intake`: Initial recording of the incident and victim/respondent details.
2.  `Assessment`: Identifying immediate hazards (e.g., medical needs).
3.  `Alternative Housing`: Victim requires alternative housing / temporary shelter placement.
4.  `BPO Processing`: The BPO application has been filed and/or issued.
5.  `Monitoring`: The BPO has been served, and the Barangay is conducting regular compliance checks.
6.  `Escalated`: The respondent has violated the order, and the case has been handed to the PNP or Prosecutor.
7.  `Closed`: The case has concluded without further violations or the protection period ended peacefully.

> [!CAUTION]
> **Data Integrity Constraint**
> Direct string assignments outside these states (e.g., "Violation Flagged", "Legal Escalation") will trigger MySQL `Data Truncated` exceptions. The system forces the standardized `Escalated` status to maintain accurate analytics.

---

## ⚖️ 4. Alignment with DILG Official Flowcharts

The system's database schema and state machine were carefully analyzed and designed to perfectly synchronize with the **DILG National Barangay Operations Office Flowcharts** for "Handling VAWC Cases" and the "Issuance and Enforcement of BPOs".

- **Incident Verification (Start Phase):** The flowchart's initial decision trees are handled via `intake_type` (direct vs. third-party), `incident_veracity`, and `perpetrator_present` boolean flags natively on the `VawcCase` model.
- **Immediate Response & Arrest:** Flags for `warrantless_arrest_made` and `weapons_confiscated` directly map to the flowchart's immediate response protocols.
- **SLA & Same-Day Issuance:** BPO timelines are strictly monitored via `application_datetime` and `issued_datetime` within the `VawcProtectionOrder` model. The system calculates and flags the "Same Day / 1-Hour" requirement mathematically via the `is_sla_breached` column.
- **Inter-Agency Transmittals:** The specific flowchart step where "PB transmits copy of issued BPO to PNP" is securely digitized via the `VawcAgencyTransmittal` model, ensuring proper audit trails for physical document handovers.
- **Monitoring & Escalation:** The 15-day monitoring phase (compliant vs. non-compliant) is managed by `VawcComplianceLogs`. For terminal flowchart nodes where a BPO is violated, the `VawcLegalEscalation` table fully digitizes the turnover to the Prosecutor or MTC/CTC for TPO/PPO processing.

---

## 🛠️ 5. Backend Service-Oriented Architecture (SOA)

To prevent the `VawcController` from becoming a "Fat Controller," business logic is strictly compartmentalized into distinct Services adhering to the Single Responsibility Principle:

### `VawcCaseService`
- **Purpose:** Handles the complex creation logic of a new VAWC case.
- **Mechanism:** Wraps creation in a `DB::transaction`. It simultaneously creates the parent `CaseReport`, the child `VawcCase`, nested `VawcInvolvedParty` records (Victim/Respondent), and the initial `VawcAssessment`.

### `VawcBpoService`
- **Purpose:** Manages the legal protection timeline.
- **Methods:**
  - `fileApplication()`: Starts the SLA timer.
  - `issueOrder()`: Checks if the issuance occurred within 24 hours of application. Calculates the 15-day expiration.
  - `recordService()`: Logs *when* and *who* received the physical BPO and automatically transitions the parent setup strictly to the `Monitoring` state.
  - `recordTransmittal()`: Logs the handover of the document to the PNP.

### `VawcComplianceService`
- **Purpose:** Records ongoing Barangay visits and respondent behavior.
- **Mechanism:** Validates compliance. If non-compliant, it automatically flags the case for legal escalation.

### `VawcLegalService`
- **Purpose:** Handles the final step (Step 12) of the RA 9262 flowchart.
- **Mechanism:** Formally moves the case to `Escalated` and logs the target authority (Court, Prosecutor, or PNP).

---

## ⚛️ 6. Frontend Clean Architecture & Component Hierarchy

To avoid monolithic codebases (where single files exceeded 2,000 lines), the frontend was refactored into modular sub-components powered by custom React hooks:

### A. Case Intake (`Create.tsx` < 240 lines)
- Coordinated by `resources/js/hooks/useVawcCreateWorkflow.ts`.
- **Partials Decomposition (`resources/js/pages/Admin/Vawc/Partials/Create/`)**:
  - `CreateHeader.tsx`: Title, badge, and cancellation navigation.
  - `DossierSearchGateway.tsx`: Step 0 "Search First, Encode Second" Master Dossier gateway.
  - `Step1Survivor.tsx`: Demographics, intake mode, and Sec. 44 informant anonymity.
  - `Step2Incident.tsx`: Facts, date/time boundaries, zone, and RA 7610 minor children coverage.
  - `Step3Respondent.tsx`: Perpetrator demographics, serial perpetrator warning, intimate relationship selector.
  - `Step4Verify.tsx`: Inter-agency transmittals (PNP, DSWD, PAO), desired statutory actions, witness affidavits.
  - `CreateConfirmModal.tsx`: Legal review modal before final database submission.

### B. Case Management & BPO Control Center (`Show.tsx` < 240 lines)
- Coordinated by `resources/js/hooks/useVawcCaseWorkflow.ts`.
- **Partials Decomposition (`resources/js/pages/Admin/Vawc/Partials/Show/`)**:
  - `Stages/Step1TriageChecklist.tsx`: Algorithmic risk evaluation (0-12 points) and emergency bypasses.
  - `Stages/Step2BpoApplication.tsx`: BPO application filing with chronological boundary checks.
  - `Stages/Step3BpoIssuance.tsx`: 24h SLA compliance analyzer with visual health alerts.
  - `Stages/Step4BpoService.tsx`: Substituted / Personal service logging.
  - `Stages/Step5Resolution.tsx`: 15-day compliance monitoring and legal escalation.
  - `Stages/VawcMonitoringLogSection.tsx`: Log history of home visits and wellness checks.
  - `Modals/VawcCloseCaseModal.tsx`: Sec. 33 anti-conciliation enforcement & judicial resolution requirement.
  - `Modals/VawcReferralModal.tsx`: Agency transmittal slip generator.

---

## 📊 7. Real-Time Analytics Dashboard

The VAWC Dashboard (`VawcController@dashboard`) parses the complex relationship data into actionable insights for the Women and Family Desk Officer.

### Key Metrics Tracked
- **Total Cases & Distribution:** Tracks the volume and current state of all incidents.
- **SLA Compliance Rate:** A critical KPI calculating the percentage of BPOs successfully issued within 24 hours of application.
- **Incident Hotspots:** Analyzes cases by mapping `CaseReport` zone IDs. To prevent data loss, `LEFT JOIN` operations are used to ensure even unassigned cases appear under "Unknown Zone."

---

## 🏛️ 8. Software Engineering Principles (Defense Ready)

### SOLID Principles Applied
1. **Single Responsibility Principle (SRP):** 
   - Backend: Controllers solely handle HTTP requests/responses. All complex business rules reside in dedicated Services (`VawcCaseService`, `VawcBpoService`).
   - Frontend: Page entry files (`Create.tsx`, `Show.tsx`) act as orchestrators, while individual wizard steps and stage cards live in dedicated partial components.
2. **Open/Closed Principle (OCP):** 
   - The workflow uses structured state transitions (via the `status` enum). We can introduce new legal procedures or referral pathways without rewriting the core transitioning engine.
3. **Liskov Substitution & Interface Segregation:** 
   - Eloquent Relationships strictly define boundaries. Relying on abstracted parent models (like `CaseReport`) allows the VAWC system to securely add localized metadata without breaking the global blotter system.
4. **Dependency Inversion Principle (DIP):**
   - Business services and custom React hooks decouple UI rendering from underlying database schemas and API request payload assembly.

### Clean Code & Senior Developer Practices
- **Database Transactions (`DB::transaction`):** Wrapping case creation and status changes in atomic database transactions prevents orphaned or corrupted rows if a partial insert fails.
- **Strict Typing & Casting:** Laravel model `$casts` and TypeScript interfaces (`useVawcCreateWorkflow`, `types.ts`) guarantee end-to-end type safety, verified via `npx tsc --noEmit` with zero errors.
- **Immutable Audit Trails (Soft Deletes):** Physical row deletions are disabled via the `SoftDeletes` trait, preserving complete chains of custody required for judicial proceedings.
- **Dual-Timestamp Audit Standard:** Captures both `process_timestamp` (occurrence date) and `created_at` (system server entry) to detect retroactive back-encoding.

---
*End of Documentation - Updated for WFPIS VAWC Management Module*
