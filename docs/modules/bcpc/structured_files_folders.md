# 📁 BCPC Module: Structured Files & Folders

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Barangay Council for the Protection of Children (BCPC) Child Nutrition Module

---

## 🗺️ Codebase Map & Directory Structure

### 1. Backend Layer (PHP 8.2+ / Laravel 11)

```
app/
├── Http/
│   └── Controllers/
│       └── Admin/
│           └── BcpcMonitoringController.php  <-- HTTP controller for census, weighing logs, SFP
├── Models/
│   ├── BcpcChild.php                         <-- Master child demographic model & relationships
│   └── BcpcAssessment.php                    <-- Clinical weighing record, WHO statuses & SFP
└── Services/
    ├── NutritionCalculatorService.php        <-- WHO 3-axis calculation, linear interpolation
    ├── BcpcAnalyticsService.php              <-- Malnutrition prevalence & SFP velocity analytics
    └── AuditLogger.php                       <-- Change auditor for medical & COA compliance
```

---

### 2. Frontend Layer (React 19 / TypeScript / Shadcn UI)

```
resources/js/
└── pages/
    └── Admin/
        └── Bcpc/
            ├── Index.tsx                     <-- Master OPT+ Census registry table with filters
            ├── Create.tsx                    <-- 0-59 mo child registration & baseline intake form
            ├── Show.tsx                      <-- Longitudinal child profile, WHO growth cards & SFP stepper
            ├── Dashboard.tsx                 <-- Executive public health analytics & zone heatmaps
            └── Print.tsx                     <-- Official printable DOH/NNC e-OPT Plus Masterlist
```

---

### 3. Database Migration Blueprint

```
database/migrations/
├── 2024_01_01_000020_create_bcpc_children_table.php       <-- Demographics, zones, 60-month status
└── 2024_01_01_000021_create_bcpc_assessments_table.php    <-- Weights, heights, WHO categories, SFP cycles
```

---

### 4. Key Component & Modal Interactions

| Component | File Path | Key Sub-Components & Function |
| :--- | :--- | :--- |
| **Census Table** | `Bcpc/Index.tsx` | Search by name, Zone filter (Zone 1–10), Age-out filter, CSV Export, Batch Action bar. |
| **Intake Form** | `Bcpc/Create.tsx` | Date of Birth calculator, Age lockout check, Recumbent vs. Standing measurement toggle. |
| **Growth Center** | `Bcpc/Show.tsx` | Longitudinal trend chart (Weight over time, Height over time), SFP 5-milestone checklist, Add Assessment Modal, Biological Range Interceptor Dialog. |
| **Analytics Shell**| `Bcpc/Dashboard.tsx`| Stunting, Wasting, Underweight breakdown; SFP enrollment count; Zone malnutrition density. |
| **Print Engine** | `Bcpc/Print.tsx` | NNC standard tabular layout, zone-specific filtering, formal signature blocks (BNS, BCPC Chair, Punong Barangay). |
