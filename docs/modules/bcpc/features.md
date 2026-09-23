# 🌟 BCPC Module: Features Specification

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Barangay Council for the Protection of Children (BCPC) Child Nutrition Module

---

## 📋 1. Core Feature Matrix

| Feature Category | Sub-Feature | Functional Description | Authorized Role |
| :--- | :--- | :--- | :--- |
| **Child Registry** | 0–59 Month Census Intake | Captures child demographic profile, birth date, sex, guardian info, and street address across the 10 zones. | BNS, Admin |
| | 60-Month Age-Out Lockout | Prohibits registration or new weighing entries for children $\ge 5$ years old, redirecting them to DepEd SBFP. | Automated Daemon |
| | COA-Compliant Archival | Automatically flags 60+ month records as `Aged Out` without deleting data to satisfy COA audit retention rules. | System |
| **WHO Diagnostics** | Real-Time 3-Axis Assessment | Instantly computes nutritional status across WFA, HFA, and WFL/H using exact WHO Child Growth Standards. | BNS, Admin |
| | Linear Interpolation Engine | Interpolates between discrete age/height milestones to calculate accurate decimal-precise z-scores. | System |
| | Biological Sanity Check ($\pm 5\text{ SD}$) | Intercepts typing mistakes (e.g. $120\text{ kg}$ instead of $12.0\text{ kg}$) via a mandatory confirmation modal. | System, BNS |
| | Clinical Red Flag Interceptor | Detects Severe Acute Malnutrition (SAM) and Bilateral Pitting Oedema, generating a Pasay Health referral slip. | BNS, Health Officer |
| **SFP Feeding Engine** | 120-Day Intervention Cycle | Enrolls malnourished children (SAM, MAM, Wasted) into a structured 120-day supplemental feeding program. | BNS, BCPC Chair |
| | 5 Statutory Milestones | Tracks mandatory check-ins: Day 1 (Baseline), Day 30, Day 60 (Mid-term), Day 90, and Day 120 (Graduation). | BNS |
| | Net Weight Gain Velocity | Calculates weight trajectory ($\Delta \text{kg}$ and g/day) to identify non-responders needing clinical intervention. | BNS, BCPC Chair |
| | Single-Profile Relapse Engine | Automatically reactivates a new SFP Cycle under the same master record if a graduated child relapses. | BNS, System |
| **Healthcare Logs** | *Garantisadong Pambata* Tracker | Multi-select logging of Vitamin A supplementation, Deworming tablets, Micronutrient Powder (MNP), and Counseling. | BNS |
| **Reporting & Export**| Printable e-OPT Plus Masterlist | Formatted table output matching National Nutrition Council standard, including tripartite signature blocks. | Admin, Punong Barangay |
| | Zone Malnutrition Analytics | Dashboard showing prevalence of stunting, wasting, and underweight across all 10 Puroks/Zones of Brgy 183. | BCPC Chair, Admin |

---

## 🔍 2. Detailed Capability Breakdown

### 2.1 0–59 Months Lockout & DepEd Transition
- **Statutory Boundary:** Republic Act No. 11037 explicitly defines barangay supplementary feeding jurisdiction for children up to 59 months. At 60 months (5 years), statutory responsibility transfers to DepEd's School-Based Feeding Program (SBFP).
- **Enforcement:**
  - When calculating child age at measurement date: $\text{Age}_{\text{months}} = \lfloor \Delta t_{\text{birth}} / 30.4375 \rfloor$.
  - If $\text{Age}_{\text{months}} \ge 60$, the system disables the assessment form, displaying:
    > *"Statutory Limit Reached: Child has reached 5 years (60 months). In compliance with RA 11037, nutritional jurisdiction is transferred to the DepEd School-Based Feeding Program (SBFP)."*

### 2.2 Biological Range Sanity Guardrail ($\pm 5\text{ SD}$)
- In field weighing conditions, typographical errors on mobile devices or clipboards are common (e.g., entering `95.0 cm` as `950 cm`, or `11.5 kg` as `115 kg`).
- The system enforces hard biological plausibility limits:
  - Weight: $[1.5\text{ kg}, \; 35.0\text{ kg}]$
  - Length/Height: $[40.0\text{ cm}, \; 125.0\text{ cm}]$
- Any value falling outside WHO $\pm 5\text{ SD}$ displays an **Extreme Outlier Pause Dialog**:
  > *"Warning: Entered value (Weight: 32.5 kg at 14 months) deviates $>5$ standard deviations from biological norms. Please re-weigh child and confirm measurement."*

### 2.3 Single-Profile SFP Relapse Engine
- Traditional spreadsheets create duplicate child profiles when a child relapses months after completing a feeding cycle.
- The WFPIS architecture preserves a **Single Master Profile (`bcpc_children`)** while dynamically maintaining multiple longitudinal cycles (`bcpc_assessments` linked by `cycle_number` and `cycle_status`):
  - Cycle 1: Baseline -> Milestone 120 (Status: `Graduated`).
  - Follow-up Census 6 months later: WFL/H drops back to `Wasted`.
  - System initiates Cycle 2 under the same Master Child ID, preserving complete medical history for public health longitudinal analysis.
