# 📖 Admin & Desk Officer Operational Manual

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Barangay 183, Villamor Airbase, Pasay City**

---

## 🏛️ 1. Administrator & Executive Overview

The Administrative Dashboard (`/admin/dashboard`) provides a command center for the Punong Barangay and Committee Kagawads to oversee community safety, child malnutrition recovery, and civil society governance.

---

## 🛡️ 2. VAWC Desk Officer Operations

1. **Conducting Face-to-Face Intake:**
   - Always conduct interviews inside the private Barangay VAW Desk room.
   - Access `/admin/vawc/create`.
   - **Step 1:** Enter survivor and respondent names to query the Master Dossier registry. If a previous incident exists, review past blotters before encoding.
   - **Step 2:** Complete the digital Pink Form, checking all applicable categories of abuse (Physical, Sexual, Psychological, Economic).
   - **Step 3:** Answer the 12 danger assessment questions to calculate the **VAWC-RAVE** score.
2. **Managing Barangay Protection Orders (BPO):**
   - Click `Apply for BPO` upon request of survivor.
   - Monitor the 24-hour statutory countdown timer.
   - Notify the Punong Barangay for electronic sign-off.
   - Generate the printable BPO document and dispatch to Barangay Tanods for personal service.
   - Log the Return of Service timestamp once served to respondent.
3. **Legal Referrals & Transmittals:**
   - If victim pursues court or criminal charges, click `Escalate Case` -> Select `PNP WCPD` or `Family Court`.
   - Print the generated `PnpTransmittal.tsx` attaching blotter extracts and medical records.

---

## 👶 3. Barangay Nutrition Scholar (BNS) Operations

1. **Annual Operation Timbang Plus (OPT+) Census:**
   - Screen preschooler age: Child must be between **0 and 59 months**.
   - Weigh child using calibrated equipment. Record length (lying down) for infants $<24$ months or standing height for $\ge 24$ months.
   - Check for Bilateral Pitting Oedema by pressing thumbs on both feet for 3 seconds.
2. **Encoding in System:**
   - Navigate to `/admin/bcpc`.
   - Click `New Child Intake` or search existing child profile.
   - Input weight in kg and height in cm.
   - Review automatically generated WHO status badges (WFA, HFA, WFL/H).
   - If an **Extreme Outlier Pause Dialog** appears, double-check measurement to eliminate typos before saving.
3. **120-Day SFP Feeding Monitoring:**
   - Enroll undernourished children into SFP.
   - Log follow-up check-ins at Day 30, Day 60, Day 90, and Day 120.
   - Track daily weight gain velocity ($\text{g/day}$) until final graduation.

---

## 🌸 4. GAD Committee Head Operations

1. **Managing Calendar of Activities:**
   - Go to `/admin/gad-events`.
   - Click `Create GAD Event` to publish barangay-sponsored seminars or workshops.
   - Review pending proposals submitted by accredited community organizations.
   - Approve proposals to trigger automated citizen email notifications, or request reschedule if venue is double-booked.
2. **Generating Accomplishment Reports:**
   - Access `/admin/analytics` -> `GAD Tab` to view yearly metrics for submission to DILG and PCW.

---

## 👥 5. Community Organization Governance

1. **Reviewing Membership Applications:**
   - Go to `/admin/applications`.
   - Inspect uploaded proof documents (e.g. Solo Parent ID, PWD medical certificate).
   - Click `Approve` to automatically enroll resident, or `Reject` with a descriptive note.
2. **Handling Resident Appeals (Barangay Council):**
   - Open `/admin/applications/appeals`.
   - Review rejected applicants who filed a formal reconsideration request.
   - Execute an **Administrative Overrule** if the citizen meets residency and statutory criteria.
