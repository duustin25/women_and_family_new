# 🌟 VAWC Module: Features Specification

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Violence Against Women and Their Children (VAWC) Management

---

## 📋 1. Core Feature Matrix

| Feature Area | Sub-Feature | Description | Authorized Role |
| :--- | :--- | :--- | :--- |
| **Dossier Registry** | Master Dossier Search | Real-time query against victim and respondent profiles to prevent duplicated cases and identify repeat abusers. | VAWC Desk Officer, Admin |
| | Cross-Case Linking | Automatically attaches multiple incident reports to a single persistent respondent or victim record. | VAWC Desk Officer, Admin |
| **Intake & Blotter** | Pink Form Encoding | Digital entry matching the national DILG/DSWD Pink Form standard (Demographics, employment, civil status). | VAWC Desk Officer |
| | Categorized Abuse Multi-Select | Simultaneous classification of Physical, Sexual, Psychological, and Economic violence (RA 9262 Sec. 5). | VAWC Desk Officer |
| | Informant / Whistleblower Shield | Protection of third-party reporting identities under RA 9262 Sec. 44 with redaction toggles. | VAWC Desk Officer |
| **Risk Assessment** | VAWC-RAVE Scoring | Automated calculation of a 1–12 risk score evaluating weapons, prior police records, threats of homicide. | VAWC Desk Officer, Admin |
| | Dynamic Triage Badging | Color-coded risk tier: Low Risk (1–4), Medium Risk (5–8), High/Emergency Risk (9–12). | All Staff |
| **BPO Lifecycle Engine** | Ex-Parte Application | Filing of protection order application upon request of victim, parent, or barangay official. | VAWC Desk Officer |
| | 24-Hour SLA Countdown | Real-time countdown tracking the statutory mandate to grant or deny a BPO within 24 hours. | Punong Barangay, Officer |
| | Notice of Hearing Generator | Automated scheduling and notice creation for respondent appearance within legal bounds. | VAWC Desk Officer |
| | Service & Proof of Delivery | Digital logging of personal service executed by Barangay Tanod / Peace Officer with witness signatures. | VAWC Desk Officer |
| | 15-Day Relief Tracker | Countdown tracking the 15-calendar-day validity of an issued BPO and court referral notices. | Punong Barangay, Officer |
| **Compliance & Monitoring**| Incident Follow-up Logs | Longitudinal logging of respondent compliance checks, home visits, and victim check-ins. | VAWC Desk Officer |
| | BPO Violation Handler | Instant escalation trigger upon breach of BPO terms (triggers criminal complaint under Sec. 12). | VAWC Desk Officer |
| **Legal Escalation** | Agency Transmittal Package | Generation of official transmittal packages to PNP WCPD, DSWD, PAO, or City Prosecutor. | Punong Barangay, Admin |
| | Court Endorsement (TPO/PPO) | Preparation of legal documentation supporting petitioner's application for court protection orders. | VAWC Desk Officer |
| **Analytics & Reports** | Monthly VAWC Blotter Report | Formatted PDF/Print output for DILG and PNP quarterly submission. | Admin, Punong Barangay |
| | Abuse Frequency Analytics | Interactive charts visualizing most common abuse types and seasonal distribution across zones. | Admin, Kagawad |

---

## 🔍 2. Detailed Functional Breakdown

### 2.1 "Search First, Encode Second" Policy
- **Workflow Enforcement:** Before the "Create New Incident" form activates, the desk officer must execute a query by First Name, Last Name, and Date of Birth.
- **Dossier Matching:**
  - If a match is found: The officer links the new incident to the existing `vawc_dossiers` record.
  - If no match is found: The system creates a new dossier with a unique tracking code (e.g. `DOS-2026-0012`).
- **Impact:** Eliminates identity fragmentation where the same batterer appears under slight spelling variations across different cases.

### 2.2 Standardized Pink Form & Abuse Classification
The system enforces mandatory field validation reflecting DILG standards:
- **Abuse Classification Checklist:**
  - **Physical Violence:** Bodily harm, battery, physical confinement.
  - **Psychological Violence:** Intimidation, harassment, public humiliation, stalking, verbal abuse.
  - **Sexual Violence:** Rape, attempted rape, sexual harassment, acts of lasciviousness.
  - **Economic Abuse:** Withholding of financial support, deprivation of basic needs, controlling earnings.
- **Children/Dependents Inventory:** Captures minors witnessing or subjected to abuse for immediate ECCD/DSWD intervention.

### 2.3 Automated VAWC-RAVE Triage
- Integrates 12 specific risk factors derived from the Philippine National Police Danger Assessment:
  - Access to firearms / sharp weapons
  - Threat to murder victim or children
  - History of drug or alcohol abuse
  - Unemployment / financial desperation
  - Prior domestic blotter or criminal arrest records
- Displays an emergency banner when score $\ge 9$, alerting the officer to coordinate emergency shelter or immediate police rescue.

### 2.4 BPO Management & Enforcement
- Enforces the strict statutory requirements of **Republic Act No. 9262 Section 14**:
  - Automatically records the application timestamp.
  - Sets an immutable SLA expiration at $T_{\text{apply}} + 24\text{ hours}$.
  - Requires Punong Barangay (or senior Kagawad) digital authentication to issue.
  - Generates official printable BPO relief documents prohibiting respondent from entering domicile or within 500 meters of victim.

### 2.5 Absolute Ban on Conciliation (Sec. 33)
- Under Philippine law, domestic violence is a public crime against human rights and cannot be subjected to *Katarungang Pambarangay* conciliation or amicable settlements.
- The UI contains no "Settle", "Mediate", or "Forgive" options. Case resolution can only occur via:
  - Formal Court Referral (TPO/PPO filing)
  - Prosecutor Case Filing (PNP WCPD Transmittal)
  - Completion of 15-Day BPO without violation
  - Case Dismissal (Lack of Jurisdiction / Frivolous with formal legal affidavit)
