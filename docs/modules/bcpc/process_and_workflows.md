# 🔄 BCPC Module: Operational Process & Workflows

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Barangay Council for the Protection of Children (BCPC) Child Nutrition Module  
> **Protocols:** NNC Operation Timbang Plus & DOH Guidelines (Compliant with Republic Act No. 11037)

---

## ⚠️ Statutory Clinical Disclaimer

> [!IMPORTANT]
> **Advisory Disclaimer (Adviser & NNC Compliance):**  
> *"The system generates a preliminary nutritional-status result for verification by authorized nutrition or health personnel. It does not provide a medical diagnosis or automatically enroll a child in a feeding program."*  
> Software calculations serve as decision-support telemetry. Formal clinical diagnoses and Supplementary Feeding Program (SFP) enrollments require human-in-the-loop validation by a certified Barangay Nutrition Scholar (BNS), Barangay Health Worker (BHW), or City Health Office (CHO) medical officer with parent/guardian consent.

---

## 🚦 End-to-End Operational Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Parent as Parent / Guardian
    actor BNS as Barangay Nutrition Scholar (BNS)
    actor BCPC as BCPC Committee Chair
    actor PB as Punong Barangay
    actor CHO as Pasay City Health Office
    participant System as WFPIS BCPC Engine

    BNS->>Parent: 1. Door-to-Door OPT+ Census / Health Center Visit
    BNS->>System: 2. Enter Child Demographics & Birth Date
    alt Age >= 60 Months (5 Years)
        System-->>BNS: Statutory Lockout Alert: Reject Intake (Redirect to DepEd SBFP)
    else Age 0 - 59 Months
        System-->>BNS: Approve Intake & Advance to Physical Measurement Step
    end
    
    BNS->>System: 3. Input Weight (kg), Height (cm), Edema Status
    System->>System: 4. Execute Biological Range Sanity Check (±5 SD)
    opt Value is Biological Outlier (>5 SD)
        System-->>BNS: Display Extreme Outlier Warning Dialog (Request Re-weigh Verification)
    end
    System->>System: 5. Interpolate Z-Scores across 3 Axes (WFA, HFA, WFL/H)
    System-->>BNS: 6. Display Preliminary Nutritional Assessment & Advisory Disclaimer

    alt Child has SAM or Bilateral Oedema
        System->>CHO: 7. Generate Emergency Medical Referral Slip
        BNS->>CHO: Expedite child for clinical examination & therapeutic feeding
    else Child is Identified with MAM / Wasted / Underweight
        BNS->>Parent: 8. Counsel Parent & Seek Supplementary Feeding Consent
        opt Guardian Consents & Clinical Intake Approved
            BNS->>System: 9. Manually Enroll Child into 120-Day SFP (Baseline Recorded)
            loop Statutory Milestones: Day 30, Day 60, Day 90, Day 120
                BNS->>System: 10. Record Periodic Follow-up Weighing & Rations
                System->>System: Compute Net Weight Velocity (g/day)
            end
            alt Child Recovers (Normal WFL/H at Day 120)
                BNS->>System: 11. Mark SFP Status: GRADUATED
            else Child Fails to Recover / Exhibits Relapse
                System->>CHO: 12. Escalate to CHO Pediatrician for Medical Investigation
            end
        end
    end

    BCPC->>System: 13. Review Zone Prevalence & Action Center Triage Queues
    PB->>System: 14. Electronically Sign DOH/NNC e-OPT Plus Masterlist
```

---

## 📋 Step-by-Step Field Manual for BNS & Encoders

### Step 1: Pre-Weighing Demographics & Household Verification
- Confirm child resides within one of the 10 Zones of Barangay 183 (Villamor Airbase).
- Verify child date of birth via Philippine Statistics Authority (PSA) Birth Certificate or Barangay Immunization Card (*Bakuna Card*).
- Check chronological age: Child must be strictly between 0 and 59 months. Children $\ge 60$ months are automatically locked out per RA 11037 and transitioned to the Department of Education's School-Based Feeding Program (DepEd SBFP).
- Gather guardian details, relationship, contact numbers, and address in Step 1 of the registration wizard.

### Step 2: Physical Measurement Protocol
- **Weight Measurement:**
  - Children $< 24\text{ months}$: Use an infant beam balance or hanging Salter scale with clean weighing trousers.
  - Children $\ge 24\text{ months}$: Use a calibrated digital or mechanical floor scale. Ensure light clothing and no footwear.
- **Length / Height Measurement:**
  - Children $< 24\text{ months}$: Measure recumbent length using a wooden infantometer board with sliding headboard and footpiece.
  - Children $\ge 24\text{ months}$: Measure standing height using a vertical stadiometer.
- **Bilateral Pitting Oedema Check:**
  - Press thumbs gently on the tops of both feet for 3 seconds.
  - If visible indentations remain on both feet upon release, mark `has_edema = true`.

### Step 3: Encoding & Preliminary Assessment Verification
- Open `/admin/bcpc/cases/create` (3-Step Intake Wizard):
  - **Step 1:** Guardian & household details.
  - **Step 2:** Child identity and date of birth (system calculates exact decimal age in months).
  - **Step 3:** Baseline measurements (Weight in kg to 2 decimals, Height in cm to 1 decimal).
- Review the preliminary assessment result:
  - **Weight-for-Age (WFA):** Severely Underweight, Underweight, Normal, Overweight
  - **Height-for-Age (HFA):** Severely Stunted, Stunted, Normal, Tall
  - **Weight-for-Length/Height (WFL/H):** Severely Wasted / SAM, Moderately Wasted / MAM, Normal, Overweight, Obese
- Review the prominent **Advisory Disclaimer**: Confirm that this result represents preliminary decision-support data for health worker verification.

### Step 4: Supplemental Feeding Program (SFP) Voluntary Intake
- If the child is identified as malnourished (SAM, MAM, Underweight, or Stunted):
  - SFP is **not automatically enforced** by code. Instead, the BNS engages the guardian, explains the program, and checks the voluntary enrollment toggle (`Enroll in 120-Day SFP`).
  - Active feeding entails daily fortified hot meals and micronutrient distribution over a 120-day cycle.
  - The BNS logs scheduled follow-up evaluations on Day 30, Day 60, Day 90, and Day 120 via the child's longitudinal profile (`/admin/bcpc/cases/{id}`).

### Step 5: Clinical Escalation & City Health Office (CHO) Referral
- When a child presents with **Severe Acute Malnutrition (SAM)** or **Bilateral Pitting Oedema**:
  - The system highlights the red-flag clinical badge.
  - The BNS clicks **"Generate CHO Referral Slip"** from the profile header.
  - The child is immediately expedited to the Pasay City Health Office or nearest health center for medical evaluation and therapeutic feeding (RUTF).

### Step 6: Annual Masterlist Generation & Executive Certification
- At the conclusion of the annual OPT+ census campaign:
  - Access the printable masterlist at `/admin/bcpc/print`.
  - Filter by Zone (1–10) or view the consolidated Barangay 183 registry.
  - Print the standardized NNC e-OPT Plus format featuring official certification and signature blocks for:
    1. **Barangay Nutrition Scholar (BNS)** (Preparer)
    2. **BCPC Committee Chairperson** (Reviewer)
    3. **Punong Barangay** (Approving Official)
