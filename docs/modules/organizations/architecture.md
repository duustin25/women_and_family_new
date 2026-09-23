# 🏗️ Community Organizations Module: System Architecture

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Community Organizations & Beneficiary Governance Module

---

## 🏛️ 1. Multi-Tier & Multi-Tenant Layered Architecture

The Organizations module employs role-based tenant isolation: Super Administrators have global visibility across all accredited entities, while Organization Heads are scoped strictly to their designated organization.

```mermaid
flowchart TD
    subgraph ClientLayer ["1. Presentation Layer (React 19 + Inertia.js)"]
        UI_Public["Public/Membership/Apply.tsx (Public Intake Portal)"]
        UI_OrgAdmin["Admin/Organizations/Index.tsx (Master Org Directory)"]
        UI_Apps["Admin/Applications/Index.tsx & ReviewData.tsx (Application Triage)"]
        UI_Appeals["Admin/Applications/AppealsIndex.tsx (Council Appeals Desk)"]
        UI_Members["Admin/Members/Index.tsx (Active Member Directory)"]
    end

    subgraph TransportLayer ["2. Transport & Scoping Layer"]
        InertiaRouter["Inertia Protocol (HTTP POST / GET / PUT)"]
        TenantScope["Multi-Tenant Scope Middleware<br/>(Restricts org_head to $user->organization_id)"]
        InertiaRouter --> TenantScope
    end

    subgraph ControllerLayer ["3. Application Controllers"]
        Public_MemberCtrl["Public/MembershipController.php"]
        Admin_OrgCtrl["Admin/OrganizationController.php"]
        Admin_AppCtrl["Admin/MembershipApplicationController.php"]
        Admin_ImportCtrl["Admin/OrganizationImportController.php"]
        Admin_MemberCtrl["Admin/MembersController.php"]
        
        TenantScope --> Public_MemberCtrl
        TenantScope --> Admin_OrgCtrl
        TenantScope --> Admin_AppCtrl
        TenantScope --> Admin_ImportCtrl
        TenantScope --> Admin_MemberCtrl
    end

    subgraph ServiceLayer ["4. Domain Services"]
        Svc_Gov["OrganizationGovernanceService.php (SLA & Appeals)"]
        Svc_Import["OrganizationMemberImportService.php (CSV Streaming & Deduplication)"]
        Svc_Member["MembershipService.php (Lifecycle Management)"]
        Svc_OTP["OtpSecurityService.php (Verification Tokens)"]
        Svc_Audit["AuditLogger.php (Change Traceability)"]

        Admin_AppCtrl --> Svc_Gov
        Admin_ImportCtrl --> Svc_Import
        Admin_AppCtrl --> Svc_Member
        Public_MemberCtrl --> Svc_OTP
        Admin_OrgCtrl --> Svc_Audit
    end

    subgraph DatabaseLayer ["5. Relational Persistence Layer (MySQL 8.0)"]
        DB_Orgs[("organizations")]
        DB_Apps[("membership_applications")]
        DB_Members[("members")]
        DB_OrgMembers[("organizational_members (Pivot)")]
        DB_OTP[("email_otps")]
        DB_Audit[("audit_logs")]

        Admin_OrgCtrl --> DB_Orgs
        Admin_AppCtrl --> DB_Apps
        Admin_MemberCtrl --> DB_Members
        Svc_Import --> DB_Members
        Svc_Import --> DB_OrgMembers
        Svc_OTP --> DB_OTP
        Svc_Audit --> DB_Audit
    end

    UI_Public --> InertiaRouter
    UI_OrgAdmin --> InertiaRouter
    UI_Apps --> InertiaRouter
    UI_Appeals --> InertiaRouter
    UI_Members --> InertiaRouter
```

---

## 💾 2. Entity-Relationship Data Model

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ MEMBERSHIP_APPLICATIONS : "receives"
    ORGANIZATIONS ||--o{ ORGANIZATIONAL_MEMBERS : "enrolls"
    MEMBERS ||--o{ ORGANIZATIONAL_MEMBERS : "belongs to"
    MEMBERSHIP_APPLICATIONS ||--o{ AUDIT_LOGS : "tracks"
    MEMBERS ||--o{ AUDIT_LOGS : "tracks"

    ORGANIZATIONS {
        bigint id PK
        string name UK
        string slug UK
        string sector_category
        text description
        string contact_person
        string contact_number
        timestamps created_at
    }

    MEMBERS {
        bigint id PK
        string first_name
        string last_name
        string email UK
        string contact_number UK
        date birth_date
        string gender
        string zone
        text address
        string status "active, inactive"
        timestamps created_at
    }

    ORGANIZATIONAL_MEMBERS {
        bigint id PK
        bigint organization_id FK
        bigint member_id FK
        date joined_date
        string role "member, officer, president"
        string status "active, resigned"
    }

    MEMBERSHIP_APPLICATIONS {
        bigint id PK
        bigint organization_id FK
        string application_number UK
        string first_name
        string last_name
        string email
        string contact_number
        string status "pending, under_review, approved, rejected, appealed"
        timestamp submitted_at
        timestamp sla_due_date
        timestamp decided_at
        text reject_reason
        text appeal_reason
        bigint reviewed_by_user_id FK
    }

    EMAIL_OTPS {
        bigint id PK
        string email
        string otp_code
        timestamp expires_at
        boolean is_verified
    }
```

---

## ⚙️ 3. Service Layer Architecture

### `OrganizationGovernanceService.php`
- Enforces the 14-day statutory SLA policy.
- Evaluates overdue applications and dispatches escalation alerts to the Barangay Council.
- Manages the Administrative Overrule workflow, updating applicant status while logging justification into `audit_logs`.

### `OrganizationMemberImportService.php`
- Employs PHP generator pipelines to process large CSV rosters with bounded memory consumption ($< 16\text{MB}$).
- Checks duplicate indices against `members.contact_number` and `members.email`.
- Inserts new members and automatically binds them to the target organization via `organizational_members`.

### `OtpSecurityService.php`
- Generates 6-digit cryptographic tokens (`random_int(100000, 999999)`).
- Sets 10-minute expiry and tracks attempts to prevent brute-force attacks.

---

## ⚖️ 4. Appeals & Governance Command Center Architecture

### 4.1 Atomic Component Structure (Single Responsibility Principle)
Matching the modular architectural standard set by the VAWC and BCPC modules, the Appeals Command Center is broken down from a monolithic file into modular, single-responsibility components in `resources/js/pages/Admin/Applications/Partials/Appeals/`:
- **`AppealsIndex.tsx`**: Main controller and layout orchestrator. Manages page-level routing, query tabs, and modal states.
- **`AppealsKpiStats.tsx`**: Displays 4 high-contrast KPI cards with thin indicator lines (`border-l-4`), providing live counts of pending appeals, granted overrules, sustained rejections, and total resolved disputes.
- **`AppealsTable.tsx`**: Renders the simplified, high-readability queue. Employs clean columns and eliminates nested in-cell cards.
- **`AppealDossierDialog.tsx`**: Dedicated modal rendering side-by-side comparative cards (Officer Disapproval Reason vs. Resident Appeal Argument) with verbatim text and clickable document attachments.
- **`AppealConfirmDialog.tsx`**: Modal for confirming statutory actions (Overrule vs. Sustain) prior to executing state mutations.
- **`types.ts`**: Shared TypeScript contracts defining `ApplicationAppeal` and `GovernanceStats`.

### 4.2 Countering Layout Distortion from Unbounded Text
To prevent multi-paragraph resident statements or officer rationales from breaking table heights and distorting row alignments:
1. **In-Table Line-Clamping:** In `AppealsTable.tsx`, statements are clamped to a clean 2-line preview (`line-clamp-2`, `text-sm text-foreground`), ensuring row heights remain strictly uniform across any dataset volume.
2. **Dedicated Verbatim Dossier:** Clicking any row or the *"Read Full Statement & Evidence Dossier"* action opens `AppealDossierDialog.tsx`, presenting the un-truncated text inside scrollable, selectable quote blocks with attached document previews.

### 4.3 Golden Rule Typography & System Color Codings
- **Font Sizes:** Eliminates micro-fonts (`text-[10px]`, `text-[11px]`). Employs accessible, highly readable sizes: `text-3xl/4xl` for stat counters, `text-base font-bold` for applicant names, and `text-sm` for descriptions, body text, and action buttons.
- **Semantic Palette:**
  - ⚖️ **Pending Appeals / Escalations:** Amber (`amber-500` / `amber-600`)
  - 🛡️ **Executive Overrule & Approval:** Emerald (`emerald-600`)
  - 🚫 **Sustained Disapproval:** Rose (`rose-600` / `rose-700`)
  - 🏢 **Organization Identity:** Purple (`purple-600` / `purple-700`)
  - 📜 **Historical Resolution Log:** Neutral Slate (`slate-700` / `slate-900`)

