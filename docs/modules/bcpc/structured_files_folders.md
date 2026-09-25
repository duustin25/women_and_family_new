# 📁 BCPC Module: Structured Files & Folders

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Barangay Council for the Protection of Children (BCPC) Child Nutrition Module  
> **Architecture Pattern:** Modular Component Hierarchy (Matching VAWC Clean Partials Standard)

---

## 🗺️ Codebase Map & Directory Structure

### 1. Backend Layer (PHP 8.2+ / Laravel 11)

```
app/
├── Http/
│   └── Controllers/
│       └── Admin/
│           └── BcpcMonitoringController.php  <-- HTTP controller for census, weighing logs, SFP lifecycle
├── Models/
│   ├── BcpcChild.php                         <-- Master child demographic model, relationships & scopes
│   └── BcpcAssessment.php                    <-- Clinical weighing record, WHO statuses & SFP milestones
└── Services/
    ├── NutritionCalculatorService.php        <-- WHO 3-axis calculation, linear interpolation, outlier guardrails
    ├── BcpcAnalyticsService.php              <-- Malnutrition prevalence, zone hotspots & SFP velocity analytics
    └── AuditLogger.php                       <-- Change auditor for medical & COA compliance
```

---

### 2. Frontend Layer (React 19 / TypeScript / Tailwind CSS / Shadcn UI)

The frontend adopts a strict **clean partials architecture** modeled after the system's VAWC module. Monolithic page files have been converted into clean, high-level orchestrators that delegate layout and presentation to modular components within dedicated `Partials/` subdirectories:

```
resources/js/pages/Admin/Bcpc/
├── Index.tsx                                 <-- Clean orchestrator: Census Registry table with triage filters
├── Create.tsx                                <-- Clean orchestrator: 3-step child registration & baseline intake
├── Show.tsx                                  <-- Clean orchestrator: Longitudinal profile, growth history & SFP tracker
├── Dashboard.tsx                             <-- Clean orchestrator: Executive public health analytics & triage queues
├── Print.tsx                                 <-- Official printable DOH/NNC e-OPT Plus Masterlist
│
└── Partials/
    ├── Index/                                <-- Partials for Index (Master Registry)
    │   ├── types.ts                          <-- Type contracts for registry children, metrics, and filters
    │   ├── BcpcIndexHeader.tsx               <-- Registry title, action buttons (Export, Register Child)
    │   ├── BcpcMetricCards.tsx               <-- 5-metric overview strip (Monitored, Overdue, SFP, SAM, MAM)
    │   ├── BcpcTriageFilterBar.tsx           <-- Search input, zone filter, nutritional triage status tabs
    │   └── BcpcChildrenTable.tsx             <-- Tabular list of children with badges, age, zone, and actions
    │
    ├── Create/                               <-- Partials for 3-Step Intake Wizard
    │   ├── types.ts                          <-- Form state interfaces, step definitions, and helper constants
    │   ├── CreateHeader.tsx                  <-- Page header with step navigation indicator
    │   ├── CreateAdvisoryBanner.tsx          <-- Official preliminary result advisory disclaimer banner
    │   ├── Step1GuardianHousehold.tsx        <-- Guardian name, contact, zone (1-10), household address
    │   ├── Step2ChildIdentity.tsx            <-- Child demographics, DOB, sex, biological age calculator
    │   └── Step3BaselineMeasurement.tsx      <-- Anthropometric input, WHO 3-axis preview, optional SFP toggle
    │
    ├── Show/                                 <-- Partials for Child Longitudinal Profile
    │   ├── types.ts                          <-- Child profile and assessment interfaces
    │   ├── BcpcProfileHeader.tsx             <-- Header with avatar, age badge, zone, and action buttons
    │   ├── BcpcAdvisoryBanner.tsx            <-- Official preliminary result advisory banner
    │   ├── BcpcDemographicsCard.tsx          <-- Guardian, contact, address, registration date
    │   ├── BcpcSfpTimelineCard.tsx           <-- 120-Day SFP milestone stepper (Baseline, Day 30, 60, 90, 120)
    │   ├── BcpcDiagnosticsCard.tsx           <-- WHO 3-axis current cards (WFA, HFA, WFL/H)
    │   ├── BcpcGrowthHistoryTable.tsx        <-- Longitudinal weighing records with trend indicators
    │   └── Modals/
    │       ├── BcpcMeasurementModal.tsx      <-- Modal form to record follow-up weighing & height
    │       ├── BcpcPhotoUploadModal.tsx      <-- Modal to update child profile photograph
    │       ├── BcpcChoReferralModal.tsx      <-- Emergency clinical referral slip for SAM / Oedema
    │       └── BcpcExtremeOutlierModal.tsx   <-- Biological range warning dialog (deviations > 5 SD)
    │
    └── Dashboard/                            <-- Partials for Nutrition Action Center
        ├── types.ts                          <-- Dashboard KPIs, distributions, and zone data interfaces
        ├── BcpcDashboardHeader.tsx           <-- Dashboard header with quick actions (Export, Registry, Register)
        ├── BcpcKpiStrip.tsx                  <-- 6 strategic metric cards (Monitored, SAM, MAM, SFP, Overdue)
        ├── BcpcTriageQueueSection.tsx        <-- Actionable queue tabs (SAM, MAM, Double Burden, Stunted, Overdue)
        ├── BcpcSfpRosterSection.tsx          <-- 120-Day SFP active roster card with progress bars
        ├── BcpcZoneHeatmapTable.tsx          <-- Zone-by-zone malnutrition density table (Zones 1–10)
        ├── BcpcNutritionalDistributions.tsx  <-- Population health status charts (WFA, HFA, WFL/H)
        └── BcpcBirthdaysWidget.tsx           <-- Upcoming birthdays widget (Next 30 days)
```

---

### 3. Database Migration Blueprint

```
database/migrations/
├── 2024_01_01_000020_create_bcpc_children_table.php       <-- Demographics, zones, guardian, photo, 60m status
└── 2024_01_01_000021_create_bcpc_assessments_table.php    <-- Weights, heights, WHO categories, SFP cycles, rations
```

---

### 4. Component Responsibility & Architecture Matrix

| Domain Directory | Orchestrator | Primary Sub-Components | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **Index** | `Index.tsx` | `BcpcIndexHeader`<br/>`BcpcMetricCards`<br/>`BcpcTriageFilterBar`<br/>`BcpcChildrenTable` | Master OPT+ Census registry table, real-time client search, zone multi-filter, triage status tabs (All, Priority, SAM, MAM, Stunted, Overdue), and direct case actions. |
| **Create** | `Create.tsx` | `CreateHeader`<br/>`CreateAdvisoryBanner`<br/>`Step1GuardianHousehold`<br/>`Step2ChildIdentity`<br/>`Step3BaselineMeasurement` | 3-step structured intake wizard: Guardian & zone details, Child identity & biological age calculation, baseline anthropometric measurements with live WHO 3-axis preview and voluntary SFP consent. |
| **Show** | `Show.tsx` | `BcpcProfileHeader`<br/>`BcpcAdvisoryBanner`<br/>`BcpcDemographicsCard`<br/>`BcpcSfpTimelineCard`<br/>`BcpcDiagnosticsCard`<br/>`BcpcGrowthHistoryTable`<br/>`Modals/*` | Master longitudinal profile: Comprehensive child metrics, 120-day milestone progress stepper, WHO 3-axis diagnostic cards, growth history table, new measurement modal, CHO referral slip, photo upload modal, and biological outlier guardrails. |
| **Dashboard** | `Dashboard.tsx` | `BcpcDashboardHeader`<br/>`BcpcKpiStrip`<br/>`BcpcTriageQueueSection`<br/>`BcpcSfpRosterSection`<br/>`BcpcZoneHeatmapTable`<br/>`BcpcNutritionalDistributions`<br/>`BcpcBirthdaysWidget` | Real-time public health command center: 10s auto-polling via `usePoll`, interactive clinical action triage queues, active SFP monitoring, Barangay 183 zone malnutrition density, WHO population distributions, and upcoming birthdays. |
| **Print** | `Print.tsx` | Standalone print-optimized layout | Official National Nutrition Council (NNC) e-OPT Plus Masterlist layout with formal tripartite signature blocks (BNS, BCPC Chair, Punong Barangay). |
