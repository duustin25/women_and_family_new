# 📁 VAWC Module: Structured Files & Folders

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Violence Against Women and Their Children (VAWC) Management

---

## 🗺️ Codebase Map & Directory Hierarchy

The VAWC module is implemented across dedicated layers in both Laravel (backend) and React/Inertia (frontend).

### 1. Backend Architecture (PHP / Laravel 11)

```
app/
├── Http/
│   └── Controllers/
│       └── Admin/
│           ├── VawcController.php             <-- Main HTTP orchestrator for VAWC intake & lifecycle
│           └── AbuseTypeController.php        <-- Management of abuse classifications
├── Models/
│   ├── VawcCase.php                          <-- Primary case entity with Eloquent relationships
│   ├── VawcDossier.php                       <-- Master person identity registry (Search First)
│   ├── VawcInvolvedParty.php                 <-- Polymorphic victim, respondent, child, informant
│   ├── VawcProtectionOrder.php               <-- BPO issuance, status, SLA expiration
│   ├── VawcBpoServiceRecord.php              <-- Tanod / peace officer service proof
│   ├── VawcComplianceLog.php                 <-- Longitudinal hearing & home visit logs
│   ├── VawcLegalEscalation.php               <-- External transmittal records (WCPD, DSWD)
│   ├── VawcAgencyTransmittal.php             <-- Transmittal dispatch metadata
│   ├── CaseAbuseType.php                     <-- Pivot table link for RA 9262 abuse types
│   ├── VawcAssessment.php                    <-- Risk evaluation responses & RAVE score
│   └── CaseReport.php                        <-- Legacy/Core report model
├── Services/
│   ├── VawcCaseService.php                   <-- Atomic DB transactions for case creation & lookup
│   ├── VawcBpoService.php                    <-- BPO SLA calculation (24h) & relief window
│   ├── VawcComplianceService.php             <-- Compliance audit & violation checks
│   ├── VawcLegalService.php                  <-- Legal transmittal compilation & PDF export
│   ├── VawcAnalyticsService.php              <-- Incident heatmaps & abuse type distribution
│   └── RiskAssessmentService.php             <-- Deterministic VAWC-RAVE scoring engine
```

---

### 2. Frontend Architecture (React 19 / TypeScript / Inertia.js)

```
resources/js/
├── hooks/
│   ├── useVawcCreateWorkflow.ts               <-- Custom hook managing Create Wizard state & search gateway
│   └── useVawcCaseWorkflow.ts                 <-- Custom hook coordinating Show.tsx stages & actions
├── pages/
│   └── Admin/
│       └── Vawc/
│           ├── Index.tsx                     <-- Master case blotter table with filters & stats
│           ├── Create.tsx                    <-- Wizard shell (decoupled into atomic steps)
│           ├── Show.tsx                      <-- Case Control Center (lifecycle, BPO, logs)
│           ├── Dashboard.tsx                 <-- VAWC executive analytics & danger charts
│           ├── ComplaintForm.tsx             <-- Printable statutory complaint sheet
│           ├── PrintBpo.tsx                  <-- Official printable Barangay Protection Order
│           ├── PnpTransmittal.tsx            <-- Official transmittal cover sheet for PNP WCPD
│           └── Partials/
│               ├── Create/
│               │   ├── DossierSearchGateway.tsx <-- "Search First, Encode Second" search panel
│               │   ├── Step1Survivor.tsx     <-- Victim-survivor demographic form
│               │   ├── Step2Incident.tsx     <-- Incident location, narrative, abuse type select
│               │   ├── Step3Respondent.tsx   <-- Respondent info, relationship, weapon flags
│               │   ├── Step4Verify.tsx       <-- Summary verification & submission checklist
│               │   ├── CreateConfirmModal.tsx<-- Final confirmation modal before DB write
│               │   ├── CreateHeader.tsx      <-- Wizard progress bar & statutory tips
│               │   └── types.ts              <-- TypeScript definitions for Create workflow
│               └── Show/
│                   ├── VawcCaseHeader.tsx    <-- Top bar with case number, status badge, print
│                   ├── VawcMasterDossierBanner.tsx <-- Historical abuse linkage alert
│                   ├── VawcProgressionStepper.tsx  <-- Visual lifecycle pipeline
│                   ├── VawcRaveScorecard.tsx <-- Danger assessment score & warning badges
│                   ├── types.ts              <-- TypeScript definitions for Case View
│                   ├── Stages/               <-- Status-specific panels (Active, BPO, Escalated)
│                   ├── Modals/               <-- Modals for Issue BPO, Add Log, Escalate
│                   └── Background/           <-- Case history and involved parties tab
```

---

### 3. Database Migration Blueprint

```
database/migrations/
├── 2024_01_01_000010_create_vawc_dossiers_table.php
├── 2024_01_01_000011_create_vawc_cases_table.php
├── 2024_01_01_000012_create_vawc_involved_parties_table.php
├── 2024_01_01_000013_create_vawc_protection_orders_table.php
├── 2024_01_01_000014_create_vawc_bpo_service_records_table.php
├── 2024_01_01_000015_create_vawc_compliance_logs_table.php
├── 2024_01_01_000016_create_vawc_legal_escalations_table.php
└── 2024_01_01_000017_create_case_abuse_types_table.php
```
