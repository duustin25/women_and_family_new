# 📊 BCPC Module: Data Flow Diagrams (DFD)

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Barangay Council for the Protection of Children (BCPC) Child Nutrition Module

---

## 1. Context Diagram (Level 0 DFD)

The Context Diagram outlines external entities interacting with the BCPC Child Nutrition Subsystem.

```mermaid
flowchart TD
    Parent["Parent / Guardian"]
    BNS["Barangay Nutrition Scholar (BNS)"]
    BCPC_Chair["BCPC Committee Chair"]
    PB["Punong Barangay"]
    CHO["Pasay City Health Office"]
    
    BCPC_System(("(0.0)<br/>BCPC Child Nutrition &<br/>e-OPT Plus Subsystem"))

    %% Flows
    Parent -->|1. Child Demographics & Birth Certificate| BCPC_System
    BCPC_System -->|2. SFP Feeding Schedule & Growth Card| Parent

    BNS -->|3. Field Weight, Height & Clinical Oedema Data| BCPC_System
    BNS -->|4. SFP Milestone Follow-up Measurements| BCPC_System
    BCPC_System -->|5. Real-Time Z-Scores & Biological Outlier Prompts| BNS

    BCPC_System -->|6. Zone Prevalence Reports & SFP Beneficiary Count| BCPC_Chair
    BCPC_Chair -->|7. Food Allocation Approval| BCPC_System

    BCPC_System -->|8. Printable Official e-OPT Plus Masterlist| PB
    PB -->|9. Executive Certification & Electronic Sign-off| BCPC_System

    BCPC_System -->|10. Clinical Referral Slips (SAM & Severe Oedema)| CHO
    CHO -->|11. Inpatient Medical Discharge Assessment| BCPC_System
```

---

## 2. Level 1 Data Flow Diagram (Subsystem Decomposition)

Level 1 breaks down the subsystem into 5 functional processes and relational data stores:

```mermaid
flowchart TD
    %% External Entities
    BNS["Barangay Nutrition Scholar"]
    BCPC_Chair["BCPC Chair"]
    PB["Punong Barangay"]
    CHO["Pasay City Health Office"]

    %% Data Stores
    D1[("D1: bcpc_children<br/>(Master Demographics)")]
    D2[("D2: bcpc_assessments<br/>(Longitudinal Measurements)")]
    D3[("D3: who_growth_standards<br/>(Static Reference Vectors)")]
    D_Audit[("D_AUDIT: audit_logs")]

    %% Processes
    P1["1.0 Child Registration & Age Lockout Check"]
    P2["2.0 Biological Range Sanity Verification"]
    P3["3.0 WHO 3-Axis Precision Interpolator"]
    P4["4.0 120-Day SFP Lifecycle & Velocity Engine"]
    P5["5.0 Official Masterlist Reporting & Archival"]

    %% Flows
    BNS -->|Birth Date & Profile| P1
    P1 -->|Age < 60 Mo: Persist Child Profile| D1
    P1 -->|Log Registration Audit| D_Audit

    BNS -->|Weight, Height, Measurement Type| P2
    P2 -->|Check Plausibility Range (±5 SD)| P2
    P2 -->|Validated Clinical Metrics| P3

    P3 <-->|Read Lookup Standard Deviations| D3
    P3 -->|Interpolate Exact Decimal Z-Scores| P3
    P3 -->|Store Longitudinal Weighing & Diagnoses| D2

    D2 -->|SAM / MAM Diagnoses| P4
    P4 -->|Initialize Cycle & Compute Daily Velocity| P4
    P4 -->|SAM / Oedema Referral| CHO
    P4 -->|Update Milestone State| D2

    D1 & D2 -->|Aggregate Census & Status Data| P5
    P5 -->|Zone Malnutrition Charts| BCPC_Chair
    P5 -->|Formatted DOH/NNC Report| PB
```

---

## 3. Level 2 Data Flow Diagram (WHO 3-Axis Interpolation & Triage Engine)

Level 2 examines **Process 3.0 (WHO 3-Axis Precision Interpolator)**:

```mermaid
flowchart TD
    In_Data["Input Data:<br/>Age (months), Sex, Weight (kg), Height (cm), Edema"]
    D3[("D3: who_growth_standards")]
    Out_Diagnoses["Output Results:<br/>WFA, HFA, WFL/H Diagnoses & Z-Scores"]

    P3_1["3.1 Age Decimalization & Table Selector"]
    P3_2["3.2 Weight-for-Age (WFA) Linear Interpolator"]
    P3_3["3.3 Height-for-Age (HFA) Linear Interpolator"]
    P3_4["3.4 Weight-for-Length/Height (WFL/H) Matcher"]
    P3_5["3.5 Categorical Diagnostic Triage Router"]

    In_Data --> P3_1
    P3_1 -->|Exact Age + Sex Vector| P3_2
    P3_1 -->|Exact Age + Sex Vector| P3_3
    P3_1 -->|Height + Sex Vector| P3_4

    D3 -->|WFA Reference Arrays| P3_2
    D3 -->|HFA Reference Arrays| P3_3
    D3 -->|WFL/H Reference Arrays| P3_4

    P3_2 -->|Z_wfa Score| P3_5
    P3_3 -->|Z_hfa Score| P3_5
    P3_4 -->|Z_wfl Score| P3_5
    In_Data -->|Edema Flag| P3_5

    P3_5 --> Out_Diagnoses
```
