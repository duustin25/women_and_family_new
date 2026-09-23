# 📁 Community Organizations Module: Structured Files & Folders

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Community Organizations & Beneficiary Governance Module

---

## 🗺️ Codebase Map & Directory Structure

### 1. Backend Layer (Laravel 11 / PHP 8.2+)

```
app/
├── Http/
│   └── Controllers/
│       ├── Admin/
│       │   ├── OrganizationController.php         <-- Master organization CRUD & officer assignment
│       │   ├── MembershipApplicationController.php<-- Review, approve, reject, and appeals handling
│       │   ├── MembersController.php              <-- Active member registry & status toggles
│       │   ├── OrganizationImportController.php   <-- CSV roster upload & mapping handler
│       │   └── OrganizationEventController.php    <-- Org-specific event requests
│       └── Public/
│           ├── MembershipController.php           <-- Citizen online application & OTP verification
│           └── PublicOrganizationController.php   <-- Public directory of accredited organizations
├── Models/
│   ├── Organization.php                           <-- Accredited entity profile
│   ├── Member.php                                 <-- Master individual resident member
│   ├── OrganizationalMember.php                   <-- Pivot binding member to organization
│   ├── MembershipApplication.php                  <-- Application submissions & review states
│   └── EmailOtp.php                               <-- One-time password verification tokens
└── Services/
    ├── OrganizationGovernanceService.php          <-- 14-Day SLA enforcement & Council overrule
    ├── OrganizationMemberImportService.php        <-- CSV streaming parser & deduplication engine
    ├── MembershipService.php                      <-- Member status lifecycle & card generation
    ├── MembershipSynchronizationService.php       <-- Syncs approved applications into member tables
    └── OtpSecurityService.php                     <-- 6-digit OTP token generator & validator
```

---

### 2. Frontend Layer (React 19 / TypeScript / Shadcn UI)

```
resources/js/
└── pages/
    ├── Admin/
    │   ├── Organizations/
    │   │   ├── Index.tsx                          <-- Master accredited organizations table
    │   │   ├── Create.tsx                         <-- Register new accredited organization
    │   │   ├── Edit.tsx                           <-- Edit organization profile & bylaws
    │   │   └── Members.tsx                        <-- Organization-specific member roster
    │   ├── Applications/
    │   │   ├── Index.tsx                          <-- Applications inbox with status & SLA filters
    │   │   ├── ReviewData.tsx                     <-- Comprehensive review & document inspection
    │   │   ├── AppealsIndex.tsx                   <-- Barangay Council appeals resolution desk (Orchestrator)
    │   │   ├── Partials/
    │   │   │   ├── Appeals/
    │   │   │   │   ├── AppealsKpiStats.tsx        <-- Large-font readable KPI metrics summary cards
    │   │   │   │   ├── AppealsTable.tsx           <-- Clean tabular queue with verbatim dossier triggers
    │   │   │   │   ├── AppealDossierDialog.tsx    <-- Side-by-side comparative dispute dossier modal
    │   │   │   │   ├── AppealConfirmDialog.tsx    <-- Statutory overrule & sustain confirmation modal
    │   │   │   │   └── types.ts                   <-- Module-scoped interfaces & data contracts
    │   │   │   ├── AppealModal.tsx                <-- Resident appeal submission form
    │   │   │   └── RejectionReasonModal.tsx       <-- Officer rejection rationale modal
    │   │   └── Print.tsx                          <-- Printable application summary
    │   └── Members/
    │       └── Index.tsx                          <-- Consolidated community-wide member registry
    └── Public/
        └── Membership/
            ├── Apply.tsx                          <-- Public application form with OTP step
            └── Track.tsx                          <-- Real-time application status tracker
```

---

### 3. Database Migration Blueprint

```
database/migrations/
├── 2024_01_01_000040_create_organizations_table.php
├── 2024_01_01_000041_create_members_table.php
├── 2024_01_01_000042_create_organizational_members_table.php
├── 2024_01_01_000043_create_membership_applications_table.php
└── 2024_01_01_000044_create_email_otps_table.php
```
