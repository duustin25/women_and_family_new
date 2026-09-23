# 📊 VAWC Module: Data Flow Diagrams (DFD)

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Violence Against Women and Their Children (VAWC) Management

---

## 1. Context Diagram (Level 0 DFD)

The Context Diagram establishes the boundaries of the VAWC Case Management Subsystem, showing all external entities and high-level data exchanges.

```mermaid
flowchart TD
    Survivor["Victim-Survivor / Petitioner"]
    Officer["Barangay VAW Desk Officer"]
    PB["Punong Barangay / Acting Kagawad"]
    Tanod["Barangay Tanod / Process Server"]
    Agency["External Law Enforcement (PNP WCPD / DSWD / Court)"]
    
    VAWC_System(("(0.0)<br/>VAWC Case Management &<br/>BPO Lifecycle Subsystem"))

    %% Data Flows
    Survivor -->|1. Incident Report & Pink Form Intake| VAWC_System
    Survivor -->|2. Sworn Salaysay & BPO Application| VAWC_System
    VAWC_System -->|3. Official BPO Relief Copy & Court Advice| Survivor

    Officer -->|4. Master Dossier Search & Verification| VAWC_System
    Officer -->|5. Danger Assessment (VAWC-RAVE) Answers| VAWC_System
    Officer -->|6. Compliance & Hearing Logs| VAWC_System
    VAWC_System -->|7. Danger Alerts, Overdue SLA Badges| Officer

    VAWC_System -->|8. Pending BPO Application Queue| PB
    PB -->|9. BPO Digital Sign-off / Grant / Denial| VAWC_System

    VAWC_System -->|10. Executable BPO Document & Notice| Tanod
    Tanod -->|11. Return of Service & Delivery Proof| VAWC_System

    VAWC_System -->|12. Formal Agency Transmittal Package| Agency
    Agency -->|13. Receiving Acknowledgment & Court Docket No.| VAWC_System
```

---

## 2. Level 1 Data Flow Diagram (Subsystem Decomposition)

Level 1 decomposes the subsystem into the 5 core transactional processes and data stores.

```mermaid
flowchart TD
    %% External Entities
    Survivor["Victim-Survivor"]
    Officer["VAW Desk Officer"]
    PB["Punong Barangay"]
    Tanod["Barangay Tanod"]
    Agency["PNP WCPD / Court"]

    %% Data Stores
    D1[("D1: vawc_dossiers")]
    D2[("D2: vawc_cases & parties")]
    D3[("D3: vawc_assessments")]
    D4[("D4: vawc_protection_orders")]
    D5[("D5: vawc_compliance_logs")]
    D6[("D6: vawc_legal_escalations")]
    D_Audit[("D_AUDIT: audit_logs")]

    %% Processes
    P1["1.0 Dossier Search & Identity Resolution"]
    P2["2.0 Incident Intake & Pink Form Recording"]
    P3["3.0 VAWC-RAVE Risk Evaluation"]
    P4["4.0 BPO Lifecycle & SLA Enforcement"]
    P5["5.0 Compliance Monitoring & Escalation"]

    %% Process 1.0 Flows
    Officer -->|Search Query (Name, DOB)| P1
    P1 <-->|Read / Write Person Dossier| D1
    P1 -->|Matched Dossier ID| P2

    %% Process 2.0 Flows
    Survivor -->|Physical Blotter & Statement| P2
    Officer -->|Pink Form Data & Abuse Multi-select| P2
    P2 -->|Persist Case & Parties| D2
    P2 -->|Log Case Creation Audit| D_Audit

    %% Process 3.0 Flows
    Officer -->|12 Danger Factors| P3
    P3 -->|Evaluate Lethality Weights| P3
    P3 -->|Store Risk Score & Tier| D3
    D3 -->|Update Case Risk Level| D2
    P3 -->|High Risk Emergency Alert| Officer

    %% Process 4.0 Flows
    Survivor -->|BPO Request| P4
    P4 -->|Create Pending BPO & Start 24h SLA| D4
    D4 -->|Alert Pending Order| PB
    PB -->|Approve & Sign BPO| P4
    P4 -->|Update Status: ISSUED| D4
    P4 -->|Printable BPO Order| Tanod
    Tanod -->|Proof of Service Timestamp| P4
    P4 -->|Update Status: SERVED & Start 15d Timer| D4

    %% Process 5.0 Flows
    Officer -->|Hearing & Home Visit Notes| P5
    P5 -->|Append Compliance History| D5
    P5 -->|Check Violation of BPO| P5
    alt BPO Violation or Escalation Requested
        P5 -->|Compile Transmittal Package| D6
        P5 -->|Lock Case Record| D2
        D6 -->|Transmit Legal Dossier| Agency
    end
```

---

## 3. Level 2 Data Flow Diagram (BPO Issuance & 24h SLA Engine)

Level 2 examines the high-stakes **Process 4.0 (BPO Lifecycle & SLA Enforcement)**:

```mermaid
flowchart TD
    Officer["VAW Desk Officer"]
    PB["Punong Barangay"]
    Tanod["Process Server / Tanod"]
    D4[("D4: vawc_protection_orders")]
    D2[("D2: vawc_cases")]

    P4_1["4.1 Ex-Parte Application Intake"]
    P4_2["4.2 Statutory SLA Countdown Daemon"]
    P4_3["4.3 Official Adjudication & Signature"]
    P4_4["4.4 Service Dispatch & Verification"]
    P4_5["4.5 15-Day Relief Window Tracker"]

    Officer -->|Submit Ex-Parte BPO Request| P4_1
    P4_1 -->|Initialize BPO (T_applied, Status: PENDING)| D4
    
    D4 -->|Query T_applied| P4_2
    P4_2 -->|Calculate Remaining SLA Delta| P4_2
    P4_2 -->|Push SLA Status: Normal / Warning / Critical| Officer
    P4_2 -->|Push Urgent Signature Request| PB

    PB -->|Execute Digital Signature & Issue Relief| P4_3
    P4_3 -->|Update Status: ISSUED (T_issued)| D4
    P4_3 -->|Transition Case Status: UNDER_BPO| D2

    P4_3 -->|Generate Sealed Legal Order| Tanod
    Tanod -->|Personal Service Proof / Affidavit| P4_4
    P4_4 -->|Update Status: SERVED (T_served)| D4

    D4 -->|T_served| P4_5
    P4_5 -->|Calculate T_served + 15 Calendar Days| P4_5
    P4_5 -->|3-Day Pre-Expiration Court Warning| Officer
    P4_5 -->|Mark Status: EXPIRED after Day 15| D4
```
