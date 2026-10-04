# 🗄️ Streamlined Logical Database Diagram (ERD) Specification

> **System:** Women and Family Protection System (WFPS)  
> **Target Tool:** Visual Paradigm (Physical / Logical ERD)  
> **Standard:** Crow's Foot Notation ($1 : 1$, $1 : N$)  
> **Layout Goal:** Single-Page Clean Landscape Fit (Strictly 4 to 6 Core Columns per Table)

---

## 🗺️ Visual Paradigm Canvas Placement (Single-Page Layout)

To fit all tables comfortably on one page with **zero crossing lines**, place your tables into these four quadrants:

```
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│   QUADRANT 1: ORGANIZATIONS & GAD    │  │       QUADRANT 2: VAWC CASES         │
│             (Top Left)               │  │            (Top Right)               │
│                                      │  │                                      │
│  [ organizations ]                   │  │  [ vawc_dossiers ]                   │
│         │                            │  │         │                            │
│         ├───> [ users ] ─────────────┼──┼─────────┼───────────┐                │
│         │       │    │               │  │         ▼           ▼                │
│         │       │    └───────────────┼──┼──> [ cases ] <─── [ abuse_types ]    │
│         ▼       ▼                    │  │         │                            │
│  [ applications ] ──> [ members ]    │  │         ├───> [ involved_parties ]   │
│         │                            │  │         ├───> [ vawc_assessments ]   │
│         ▼                            │  │         ├───> [ protection_orders ]  │
│  [ gad_events ]   [ announcements ]  │  │         └───> [ legal_escalations ]  │
└──────────────────────────────────────┘  └──────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                   QUADRANT 3: BCPC CHILD NUTRITION (Bottom)                    │
│                                                                                │
│       [ zones ] ──────────> [ bcpc_children ] ──────────> [ bcpc_assessments ] │
│                                    ▲                               ▲           │
│                           (linked from members)             (assessed by user) │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Streamlined Data Dictionary (Strictly 4 to 6 Columns per Table)

Every Primary Key `[PK]`, Foreign Key `[FK]`, and essential business column is preserved according to standard Logical Data Model (LDM) rules:

### 1. System Core & Users
* **`users`**
  * `id` : integer `[PK]`
  * `organization_id` : integer `[FK, Nullable]` *(ref: > organizations.id)*
  * `name` : varchar
  * `email` : varchar
  * `role` : varchar *(admin, head, president)*

* **`zones`**
  * `id` : integer `[PK]`
  * `name` : varchar *(Purok / Zone Name)*
  * `purok_leader` : varchar

---

### 2. Organizations & GAD Subsystem
* **`organizations`**
  * `id` : integer `[PK]`
  * `name` : varchar
  * `slug` : varchar
  * `is_active` : boolean

* **`membership_applications`**
  * `id` : integer `[PK]`
  * `organization_id` : integer `[FK]` *(ref: > organizations.id)*
  * `fullname` : varchar
  * `status` : varchar *(Pending, Approved, Rejected, Appealed)*
  * `appeal_reason` : text `[Nullable]`

* **`members`**
  * `id` : integer `[PK]`
  * `organization_id` : integer `[FK]` *(ref: > organizations.id)*
  * `membership_application_id` : integer `[FK, Nullable]` *(ref: > membership_applications.id)*
  * `fullname` : varchar
  * `status` : varchar *(Active, Suspended)*

* **`gad_events`**
  * `id` : integer `[PK]`
  * `organization_id` : integer `[FK, Nullable]` *(ref: > organizations.id)*
  * `title` : varchar
  * `event_date` : date
  * `status` : varchar *(pending, approved, rejected)*

* **`announcements`**
  * `id` : integer `[PK]`
  * `user_id` : integer `[FK]` *(ref: > users.id)*
  * `title` : varchar
  * `category` : varchar
  * `event_date` : date `[Nullable]`

---

### 3. VAWC Digital Case Management Subsystem
* **`case_abuse_types`** *(Taxonomy lookup from previous ERD)*
  * `id` : integer `[PK]`
  * `name` : varchar *(Physical, Sexual, Psychological, Economic)*

* **`vawc_dossiers`**
  * `id` : integer `[PK]`
  * `dossier_number` : varchar *(DOS-YYYY-XXXX)*
  * `survivor_name` : varchar
  * `respondent_name` : varchar
  * `current_lifecycle` : varchar *(active, closed)*

* **`vawc_cases`**
  * `id` : integer `[PK]`
  * `dossier_id` : integer `[FK]` *(ref: > vawc_dossiers.id)*
  * `case_number` : varchar *(CR-YYYY-XXXX)*
  * `incident_date` : date
  * `abuse_type` : varchar
  * `status` : varchar *(Intake, Assessment, BPO, Monitoring, Closed)*

* **`vawc_involved_parties`**
  * `id` : integer `[PK]`
  * `vawc_case_id` : integer `[FK]` *(ref: > vawc_cases.id)*
  * `role` : varchar *(Victim, Respondent, Witness)*
  * `name` : varchar
  * `gender` : varchar

* **`vawc_assessments`**
  * `id` : integer `[PK]`
  * `vawc_case_id` : integer `[FK]` *(ref: > vawc_cases.id)*
  * `assessed_by` : integer `[FK, Nullable]` *(ref: > users.id)*
  * `assessment_date` : date
  * `risk_level` : varchar *(LOW, MEDIUM, HIGH, CRITICAL)*

* **`vawc_protection_orders`**
  * `id` : integer `[PK]`
  * `vawc_case_id` : integer `[FK]` *(ref: > vawc_cases.id)*
  * `order_number` : varchar
  * `status` : varchar *(Applied, Issued, Served, Expired)*
  * `expiration_date` : date `[Nullable]`

* **`vawc_legal_escalations`**
  * `id` : integer `[PK]`
  * `vawc_case_id` : integer `[FK]` *(ref: > vawc_cases.id)*
  * `court_name` : varchar
  * `docket_number` : varchar
  * `status` : varchar *(Filed, In-Hearing, Resolved)*

---

### 4. BCPC Child Nutrition Subsystem
* **`bcpc_children`**
  * `id` : integer `[PK]`
  * `zone_id` : integer `[FK, Nullable]` *(ref: > zones.id)*
  * `member_id` : integer `[FK, Nullable]` *(ref: > members.id)*
  * `child_first_name` : varchar
  * `child_last_name` : varchar
  * `date_of_birth` : date
  * `sfp_status` : varchar *(None, Enrolled, Completed, Graduated)*

* **`bcpc_assessments`**
  * `id` : integer `[PK]`
  * `bcpc_child_id` : integer `[FK]` *(ref: > bcpc_children.id)*
  * `user_id` : integer `[FK, Nullable]` *(ref: > users.id)*
  * `date_of_weighing` : date
  * `weight_kg` : decimal
  * `wfa_status` : varchar *(Normal, Underweight, SAM)*

---

## 🔗 Master Connector Checklist (Draw in this Exact Sequence)

Use the standard **One-to-Many ($1 : 0..\star$)** Crow's Foot tool in Visual Paradigm:

1. **`organizations` $\longrightarrow$ `users`** ($1 : 0..\star$) on `users.organization_id`
2. **`organizations` $\longrightarrow$ `membership_applications`** ($1 : 0..\star$) on `membership_applications.organization_id`
3. **`organizations` $\longrightarrow$ `members`** ($1 : 0..\star$) on `members.organization_id`
4. **`membership_applications` $\longrightarrow$ `members`** (**$1 : 0..1$ One-to-One**) on `members.membership_application_id`
5. **`organizations` $\longrightarrow$ `gad_events`** ($1 : 0..\star$) on `gad_events.organization_id`
6. **`users` $\longrightarrow$ `announcements`** ($1 : 0..\star$) on `announcements.user_id`
7. **`vawc_dossiers` $\longrightarrow$ `vawc_cases`** ($1 : 1..\star$) on `vawc_cases.dossier_id`
8. **`vawc_cases` $\longrightarrow$ `vawc_involved_parties`** ($1 : 1..\star$) on `vawc_involved_parties.vawc_case_id`
9. **`vawc_cases` $\longrightarrow$ `vawc_assessments`** ($1 : 0..\star$) on `vawc_assessments.vawc_case_id`
10. **`users` $\longrightarrow$ `vawc_assessments`** ($1 : 0..\star$) on `vawc_assessments.assessed_by`
11. **`vawc_cases` $\longrightarrow$ `vawc_protection_orders`** ($1 : 0..\star$) on `vawc_protection_orders.vawc_case_id`
12. **`vawc_cases` $\longrightarrow$ `vawc_legal_escalations`** ($1 : 0..\star$) on `vawc_legal_escalations.vawc_case_id`
13. **`zones` $\longrightarrow$ `bcpc_children`** ($1 : 0..\star$) on `bcpc_children.zone_id`
14. **`members` $\longrightarrow$ `bcpc_children`** ($1 : 0..\star$) on `bcpc_children.member_id`
15. **`bcpc_children` $\longrightarrow$ `bcpc_assessments`** ($1 : 1..\star$) on `bcpc_assessments.bcpc_child_id`
16. **`users` $\longrightarrow$ `bcpc_assessments`** ($1 : 0..\star$) on `bcpc_assessments.user_id`