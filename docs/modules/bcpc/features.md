# 🌟 BCPC Module: Features Specification

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Barangay Council for the Protection of Children (BCPC) Child Nutrition Module  
> **Target Scope:** 0–59 Months Children of Barangay 183, Villamor Airbase, Pasay City

---

## ⚠️ Advisory Notice

> [!IMPORTANT]
> **Advisory Disclaimer:**  
> *"The system generates a preliminary nutritional-status result for verification by authorized nutrition or health personnel. It does not provide a medical diagnosis or automatically enroll a child in a feeding program."*

---

## 📋 1. Core Feature Matrix

| Feature Category | Sub-Feature | Functional Description | Authorized Role |
| :--- | :--- | :--- | :--- |
| **Child Registry** | 0–59 Month Census Intake | 3-step intake wizard capturing guardian info, child demographics, zone (Zones 1–10), and baseline anthropometrics. | BNS, Admin |
| | 60-Month Age-Out Lockout | Enforces RA 11037 statutory boundary by blocking registration or new weighings for children $\ge 60$ months. | Automated System |
| | COA-Compliant Archival | Retains complete records of aged-out children as `Aged Out` to satisfy government accounting (COA) audit requirements. | System |
| **WHO Diagnostics** | Preliminary 3-Axis Assessment | Computes Weight-for-Age, Height-for-Age, and Weight-for-Length/Height against WHO standards with advisory disclaimer. | BNS, Admin |
| | Linear Interpolation Engine | Interpolates between discrete monthly and height milestones to calculate decimal-precise z-scores. | System |
| | Biological Sanity Check ($\pm 5\text{ SD}$) | Intercepts typing mistakes (e.g. $120\text{ kg}$ instead of $12.0\text{ kg}$) via an interactive confirmation dialog. | System, BNS |
| | Clinical Red Flag Interceptor | Detects Severe Acute Malnutrition (SAM) and Bilateral Pitting Oedema, generating a Pasay Health referral slip. | BNS, Health Officer |
| **SFP Feeding Engine** | Verified 120-Day Feeding Intake | Enables BNS to enroll malnourished children with guardian consent into the statutory 120-day feeding program. | BNS, BCPC Chair |
| | 5 Statutory Milestones | Tracks mandatory check-ins: Day 1 (Baseline), Day 30, Day 60 (Mid-term), Day 90, and Day 120 (Graduation). | BNS |
| | Net Weight Gain Velocity | Calculates weight trajectory ($\Delta \text{kg}$ and g/day) to identify non-responders needing clinical intervention. | BNS, BCPC Chair |
| | Single-Profile Relapse Engine | Automatically reactivates a new SFP Cycle under the same master record if a graduated child relapses. | BNS, System |
| **Action Center Dashboard** | Real-Time Metrics & Polling | 10-second polling (`usePoll`) refreshing clinical queues, active feeding counts, and overdue weighings. | BCPC Chair, Admin |
| | Clinical Action Triage Queues | Dedicated triage tabs for SAM, MAM, Double Burden (Overweight/Obese + Stunted), Stunted, and Overdue weighings. | BNS, Admin |
| | Zone Malnutrition Density | Interactive heatmap table mapping malnutrition prevalence rates across all 10 Puroks/Zones of Barangay 183. | BCPC Chair, Admin |
| | Upcoming Birthdays Widget | 30-day lookahead displaying upcoming birthdays to track age milestones and 60-month graduation. | BNS, Admin |
| **Reporting & Export**| Printable e-OPT Plus Masterlist | Formatted table output matching National Nutrition Council standard, including tripartite signature blocks. | Admin, Punong Barangay |
| | Masterlist CSV Export | Client-side export of census data filtered by zone, age, or nutritional classification. | BNS, Admin |

---

## 🔍 2. Detailed Capability Breakdown

### 2.1 3-Step Clean Intake Wizard (`Create.tsx`)
- **Step 1: Guardian & Household Information:**
  - Captures guardian name, contact telephone, relationship to child, and assigned Barangay Zone (Zones 1–10).
- **Step 2: Child Identity & Age Verification:**
  - Date of birth input with real-time biological age calculator in months and days.
  - Automatically alerts the user if the child has reached or exceeded 60 months.
- **Step 3: Baseline Anthropometrics & SFP Consent:**
  - Weight in kilograms (2 decimals) and height in centimeters (1 decimal).
  - Recumbent length vs. standing height toggle.
  - Bilateral pitting oedema inspection checkbox.
  - Live preview of WHO 3-axis status badges with the prominent advisory disclaimer.
  - Voluntary **120-Day SFP Enrollment toggle** (requires guardian and BNS agreement).

### 2.2 Longitudinal Profile & Growth Card (`Show.tsx`)
- **Profile Header:** Displays child identity, current age, zone badge, case status, quick action buttons (Record Measurement, Upload Photo, Export Growth Card, Generate CHO Referral).
- **Advisory Banner:** Displays the official preliminary result disclaimer.
- **Demographics Card:** Summary of guardian contact, residential address, and registration timestamps.
- **SFP 120-Day Progress Stepper:** Visual timeline illustrating completion across Day 1, Day 30, Day 60, Day 90, and Day 120 milestones, with weight velocity ($\text{g/day}$) display.
- **WHO 3-Axis Status Cards:** Current diagnostic classifications for WFA, HFA, and WFL/H.
- **Longitudinal Growth History Table:** Chronological log of all measurements with date, age, weight, height, z-scores, nutritional diagnoses, and evaluator name.

### 2.3 Clinical Action Triage Queues (`Dashboard.tsx`)
- Allows public health officers to triage children based on medical severity:
  1. **SAM Cases:** Immediate high-priority queue for Severe Acute Malnutrition or Oedema.
  2. **MAM Cases:** Moderate Acute Malnutrition candidates for community supplementary feeding.
  3. **Double Burden:** Children exhibiting concurrent stunting and overweight/obesity.
  4. **Stunted:** Children with impaired linear growth requiring micronutrient intervention.
  5. **Overdue Weighings:** Children who have not received a scheduled monthly or milestone measurement.
