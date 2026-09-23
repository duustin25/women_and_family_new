# 🌟 Community Organizations Module: Features Specification

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Community Organizations & Beneficiary Governance Module

---

## 📋 1. Core Feature Matrix

| Feature Area | Sub-Feature | Functional Description | Authorized Role |
| :--- | :--- | :--- | :--- |
| **Organization Registry** | Organization Directory | CRUD management of accredited entities (KALIPI, Solo Parents, PWD, Senior Citizens, ERPAT). | Admin |
| | Multi-Tenant Scoping | Organization Heads only view and manage records belonging to their assigned organization. | Org Head |
| **Public Applications** | Self-Service Web Portal | Citizens can review accreditation requirements and submit digital applications. | Public Citizen |
| | Email OTP Authentication | Enforces 6-digit OTP verification to authenticate applicant email identity before database insertion. | Public Citizen |
| | Proof Attachment Upload | Uploads scanned verification documents (e.g. medical certificates, birth certificates of dependents). | Public Citizen |
| **Application Review** | Triage & Review Console | Status workflow: `pending` -> `under_review` -> `approved` or `rejected`. | Org Head, Admin |
| | Rejection Justification | Mandatory written rationale sent to the applicant's email explaining missing requirements. | Org Head |
| **SLA & Appeals** | 14-Day SLA Monitoring | Tracks days elapsed; flags overdue applications awaiting organization head action. | System, Admin |
| | Resident Appeals Portal | Rejected applicants can file a formal reconsideration request to the Barangay Council. | Citizen, Admin |
| | Admin Overrule Workflow | Barangay Administrator can overturn unfair rejections and grant membership directly. | Admin, Kagawad |
| **Member Management** | Master Member Directory | Searchable roster of active members with status toggles (`active`, `inactive`, `probationary`). | Org Head, Admin |
| | Purok Demographics Filter | Filter members by Barangay 183 Zone/Purok to organize targeted local distribution drives. | Org Head, Admin |
| | Printable Member Masterlist | Formatted printable table with official certification blocks for city hall subsidies. | Org Head, Admin |
| **Bulk Data Ingestion** | High-Speed CSV Import | Streaming parser importing hundreds of legacy members with schema mapping. | Admin |
| | Automatic Deduplication | Detects duplicated records by comparing Mobile Phone and Email against active database. | System |

---

## 🔍 2. Detailed Capability Breakdown

### 2.1 Public Citizen Application & OTP Identity Guard
- To prevent bot spam and fraudulent identity submissions, the public portal uses `OtpSecurityService`:
  1. Citizen enters their active email address on `/membership/apply`.
  2. The system generates a cryptographically secure 6-digit numeric OTP with a 10-minute time-to-live (TTL).
  3. The citizen must enter the OTP received in their inbox before the full application form unlocks.
  4. Upon form submission, the system records the application in `membership_applications`.

### 2.2 14-Day SLA Governance & Resident Appeals Channel
- **SLA Policy:** Under barangay administrative guidelines, civil society organizations must process membership applications within 14 calendar days.
- **Overdue Escalation:** If an application remains `pending` beyond 14 days, the system elevates the priority badge to `Overdue SLA` and permits the Barangay Council to intervene.
- **Appeals Desk (`AppealsIndex.tsx`):**
  - If an organization head rejects an applicant due to clerical technicalities, the applicant can click `File Appeal` from their notification email.
  - The Barangay Administrator or Committee Kagawad reviews the appeal alongside the attached evidence.
  - If the rejection was improper, the administrator issues an **Administrative Overrule**, forcing the application status to `approved`.

### 2.3 High-Performance CSV Roster Import
- Local barangay chapters often hold paper rosters typed in Microsoft Excel.
- `OrganizationMemberImportService.php`:
  - Parses uploaded `.csv` files using memory-efficient generators.
  - Maps spreadsheet headers (`Full Name`, `Mobile`, `Zone`, `Gender`, `Birth Date`).
  - Checks if mobile phone or email already exists in `members` or `membership_applications`.
  - Duplicates are gracefully skipped and reported in an import summary report.
