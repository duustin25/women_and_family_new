# 📁 GAD Module: Structured Files & Folders

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Gender and Development (GAD) Module

---

## 🗺️ Codebase Map & Directory Structure

### 1. Backend Layer (Laravel 11 / PHP 8.2+)

```
app/
├── Http/
│   └── Controllers/
│       └── Admin/
│           └── GadEventController.php        <-- HTTP CRUD and status approval orchestrator
├── Jobs/
│   └── SendBulkGadEventEmail.php             <-- Asynchronous queue job dispatching member emails
├── Models/
│   ├── GadEvent.php                          <-- Eloquent model representing GAD programs
│   ├── Organization.php                      <-- Linked sponsoring community organization
│   └── MembershipApplication.php             <-- Recipient directory for notification broadcasts
└── Services/
    ├── GadAnalyticsService.php               <-- Annual event statistics & sectoral breakdown
    └── AuditLogger.php                       <-- Audits event state approvals and deletions
```

---

### 2. Frontend Layer (React 19 / TypeScript / Shadcn UI)

```
resources/js/
└── pages/
    └── Admin/
        ├── GadEvents/
            └── Index.tsx                     <-- Master GAD calendar, event cards, status action modal
```

---

### 3. Database Migration Blueprint

```
database/migrations/
└── 2024_01_01_000030_create_gad_events_table.php  <-- Stores title, date, location, banner, status
```

---

### 4. Component Architecture within `Index.tsx`

`resources/js/pages/Admin/GadEvents/Index.tsx` encapsulates:
- **Calendar & Table Tab View:** Toggle between list table view and calendar layout (`shadcn/ui/calendar`).
- **Create/Edit Event Dialog:** Controlled modal capturing event title, description, date, time, location, and file upload.
- **Decision Modal (`statusModal`):** Handles `rejected` and `reschedule_requested` actions with dynamic reason text binding.
- **Badge Indicator Matrix:** Rendered via `STATUS_CONFIG` styling badges according to event life cycle state.
