# 📊 System-Wide Data Flow Diagrams (Context & Level 1)

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Barangay 183, Villamor Airbase, Pasay City**

---

## 1. System-Wide Context Diagram (Level 0 DFD)

The Context Diagram defines the full operational perimeter of WFPIS across all four core domains.

```mermaid
flowchart TD
    Citizen["Citizen / Resident / Applicant"]
    Officer["VAWC Desk Officer"]
    BNS["Barangay Nutrition Scholar"]
    Org_Head["Organization President"]
    PB["Punong Barangay / Committee Kagawad"]
    Ext_Agency["PNP WCPD / DSWD / City Health Office"]

    WFPIS(("(0.0)<br/>Women & Family Protection<br/>Information System (WFPIS)"))

    %% Citizen Interactions
    Citizen -->|Online Org Application & Email OTP| WFPIS
    Citizen -->|Chatbot Guidance Questions| WFPIS
    WFPIS -->|OTP Verification Codes & Approval Notices| Citizen
    WFPIS -->|Public GAD Calendar & AI Chat Answers| Citizen

    %% Officer Interactions
    Officer -->|VAWC Case Blotter, Pink Form, RAVE Answers| WFPIS
    WFPIS -->|Overdue BPO Alerts & Master Dossier Matches| Officer

    %% BNS Interactions
    BNS -->|0-59 Mo Census, Weights, Heights, Oedema Flags| WFPIS
    WFPIS -->|WHO Z-Scores & Outlier Prompts| BNS

    %% Org Head Interactions
    Org_Head -->|Application Decisions & Event Proposals| WFPIS
    WFPIS -->|Scoped Member Rosters & Overdue SLA Notices| Org_Head

    %% Punong Barangay / Kagawad
    PB -->|BPO Signatures, Masterlist Approvals, Overrules| WFPIS
    WFPIS -->|Executive Dashboards & Compliance Alerts| PB

    %% External Agencies
    WFPIS -->|VAWC Transmittals & SAM Referrals| Ext_Agency
```

---

## 2. System-Wide Level 1 Data Flow Diagram

```mermaid
flowchart TD
    %% External Actors
    Citizen["Citizen / Resident"]
    Staff["Barangay Staff (Admin, BNS, VAWC)"]
    PB["Punong Barangay"]
    Ext_Agency["External Agencies"]

    %% Data Stores
    D1[("D1: users")]
    D2[("D2: vawc_dossiers & cases")]
    D3[("D3: bcpc_children & assessments")]
    D4[("D4: organizations & members")]
    D5[("D5: gad_events")]
    D6[("D6: audit_logs")]
    D7[("D7: database_backups")]

    %% Core System Processes
    P1["1.0 Security, Auth & RBAC"]
    P2["2.0 VAWC Case Management & BPO Engine"]
    P3["3.0 BCPC Nutrition & SFP Engine"]
    P4["4.0 Organizations & Membership Governance"]
    P5["5.0 GAD Activity Coordination"]
    P6["6.0 System Administration, Analytics & Backups"]

    %% 1.0 Auth
    Staff & Citizen -->|Credentials / OTP| P1
    P1 <-->|Verify Credentials & Permissions| D1
    P1 -->|Log Login Events| D6

    %% 2.0 VAWC
    Staff -->|Incident Narrative & Parties| P2
    P2 <-->|Dossier Matches & Protection Orders| D2
    P2 -->|Log Case Mutations| D6
    P2 -->|Transmittals| Ext_Agency

    %% 3.0 BCPC
    Staff -->|Child Measurements| P3
    P3 <-->|WHO Calculations & SFP Milestones| D3
    P3 -->|Log Assessment Audits| D6
    P3 -->|Medical Referrals| Ext_Agency

    %% 4.0 Organizations
    Citizen -->|Submit Application| P4
    P4 <-->|Store Applications & Sync Members| D4
    P4 -->|Log Governance Actions| D6

    %% 5.0 GAD
    Staff -->|Create / Review Event| P5
    P5 <-->|Manage Event Records| D5
    P5 -->|Log Event Actions| D6

    %% 6.0 Administration
    D2 & D3 & D4 & D5 & D6 -->|Aggregate Cross-Sectional Data| P6
    P6 -->|Executive Dashboards & Printable Reports| PB
    P6 -->|mysqldump Snapshot Dump| D7
```
