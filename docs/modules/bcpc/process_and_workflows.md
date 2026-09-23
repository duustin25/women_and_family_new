# 🔄 BCPC Module: Operational Process & Workflows

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Barangay Council for the Protection of Children (BCPC) Child Nutrition Module  
> **Protocols:** NNC Operation Timbang Plus & DOH Guidelines

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
    BNS->>System: 2. Enter Child Info & Birth Date
    alt Age >= 60 Months (5 Years)
        System-->>BNS: Reject Intake: Lockout Alert (Transfer to DepEd SBFP)
    else Age 0 - 59 Months
        System-->>BNS: Approve Intake & Open Weighing Panel
    end
    
    BNS->>System: 3. Input Weight (kg), Height (cm), Edema Status
    System->>System: 4. Execute Biological Range Outlier Check (±5 SD)
    opt Value is Outlier (>5 SD)
        System-->>BNS: Display Pause Prompt Modal (Request Re-weigh Verification)
    end
    System->>System: 5. Interpolate Z-Scores (WFA, HFA, WFL/H)
    System-->>BNS: 6. Display Real-time Diagnostic Badges

    alt Child has SAM or Bilateral Oedema
        System->>CHO: 7. Generate Emergency Medical Referral Slip
    else Child is MAM or Wasted
        System->>System: 8. Auto-Enroll into 120-Day SFP (Day 1 Baseline)
        loop Milestones: Day 30, Day 60, Day 90, Day 120
            BNS->>System: 9. Record Follow-up Weighing & Rations
            System->>System: Compute Net Weight Velocity (g/day)
        end
        alt Child Recovers (Normal WFL/H at Day 120)
            System->>System: 10. Mark SFP Status: GRADUATED
        else Child Fails to Recover
            System->>CHO: 11. Escalate to CHO Pediatrician for Medical Investigation
        end
    end

    BCPC->>System: 12. Review Zone Prevalence & Summary Metrics
    PB->>System: 13. Electronically Sign DOH/NNC e-OPT Plus Masterlist
```

---

## 📋 2. Step-by-Step Field Manual for BNS

### Step 1: Pre-Weighing Screening
- Confirm child resides within one of the 10 Zones of Barangay 183.
- Verify child date of birth via PSA Birth Certificate or Barangay Immunization Card (*Bakuna Card*).
- Check age: Must be between 0 and 59 months.

### Step 2: Physical Measurement Protocol
- **Weight Measurement:**
  - Children $< 24\text{ months}$: Use infant beam balance or hanging Salter scale with clean weighing trousers.
  - Children $\ge 24\text{ months}$: Use calibrated digital/mechanical bathroom floor scale. Ensure light clothing, no shoes.
- **Length / Height Measurement:**
  - Children $< 24\text{ months}$: Measure recumbent length using wooden infantometer board.
  - Children $\ge 24\text{ months}$: Measure standing height using vertical stadiometer.
- **Bilateral Pitting Oedema Check:**
  - Press thumbs gently on the tops of both feet for 3 seconds.
  - If indentation remains on both feet, mark `has_edema = true`.

### Step 3: Encoding & System Validation
- Open `/admin/bcpc` -> Click `New Child Intake`.
- Fill required demographic fields.
- Enter weight to 2 decimal places (e.g. `9.45`) and height to 1 decimal place (e.g. `76.2`).
- Click `Calculate Status`:
  - System highlights three badges:
    - **Weight-for-Age:** *Normal*
    - **Height-for-Age:** *Stunted*
    - **Weight-for-Height:** *Normal*

### Step 4: SFP Feeding Management
- If child is enrolled in SFP:
  - Coordinate with barangay nutrition feeding center for daily fortified hot meal distribution.
  - Record periodic check-ins in the child's `Show.tsx` profile on Day 30, Day 60, Day 90, and Day 120.
  - If child reaches Day 120 with normal growth metrics, system issues a graduation certificate.

### Step 5: Official Masterlist Printing & Sign-Off
- At the end of the OPT+ census campaign (March 31):
  - Go to `/admin/bcpc/print`.
  - Filter by Zone or generate consolidated Barangay 183 masterlist.
  - Export printable document containing official NNC layout and signature lines for BNS, BCPC Committee Chair, and Punong Barangay.
