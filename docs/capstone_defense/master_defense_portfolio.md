# 🛡️ Master Capstone Defense Portfolio & IT Expert Evaluation Alignment

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Barangay 183, Villamor Airbase, Pasay City**  
> **Target Audience:** Capstone Defense Panel, Faculty Evaluators, System Architects

---

## 🎯 1. Alignment with IT Expert Evaluation

During the preliminary system evaluation by the IT Expert, five (5) strategic recommendations were established. Below is the technical compliance matrix demonstrating how the codebase directly fulfills each recommendation:

| IT Expert Recommendation | Architectural Solution Implemented in Code | Status |
| :--- | :--- | :---: |
| **1. Web Accessibility (WCAG 2.1 AA)** | Integrated semantic HTML5 landmarks, high-contrast theme toggles, and minimum $48 \times 48\text{px}$ touch targets. | ✅ Fully Integrated |
| **2. Screen Reader Compatibility** | Added explicit WAI-ARIA labels for NVDA compatibility and integrated Web Speech API for voice synthesis. | ✅ Fully Integrated |
| **3. AI Chatbot Maintenance Toggle** | Built an administrative toggle in `/admin/settings` allowing staff to gracefully disable the AI chatbot during server maintenance. | ✅ Fully Integrated |
| **4. Rigorous Automated Testing** | Developed automated PHPUnit feature suites and Vitest component unit tests ensuring regression-free builds. | ✅ Fully Integrated |
| **5. Senior Mobile Usability** | Optimized mobile layouts for elderly residents with large typography and 1-tap emergency hotline calling buttons. | ✅ Fully Integrated |

---

## 🏛️ 2. Architectural Defenses & Software Principles

### 2.1 Why In-Person VAWC Blotter instead of Public Online Filing?
A common panel question is: *"Why can't random citizens submit VAWC blotters online from their phones?"*
* **Panel Answer:**
  > *"Under Republic Act No. 9262 and the Data Privacy Act of 2012, formal domestic violence intake requires an in-person sworn affidavit (*Salaysay*) before the Barangay VAW Desk Officer.
  >
  > 1. **Victim Safety:** Online filing on a shared home device exposes the survivor to severe lethal danger if the abusive partner discovers browser history or notification SMS.
  > 2. **Legal Due Process:** Issuing a 24-hour Barangay Protection Order requires immediate physical identity verification and optional WCPU medical documentation.
  > 3. **Prevention of Fraudulent / Malicious Reports:** Because unauthenticated guest blotter filing is intentionally excluded, malicious fake blotters are impossible by design."*

### 2.2 Why BCPC Excludes RA 7610 Child Abuse Case Blotters
* **Panel Answer:**
  > *"Cases of child abuse, sexual exploitation, or pedophilia under Republic Act No. 7610 committed by neighbors or non-intimate individuals are **non-mediable public crimes** that fall strictly under the jurisdiction of the Regional Trial Court (RTC).
  >
  > Under DILG-DSWD guidelines, barangays have **zero statutory authority** to arbitrate, mediate, or conciliate RA 7610 crimes. Maintaining an internal barangay case blotter for child abuse risks illegal conciliation or evidence tampering. Therefore, our BCPC module focuses on preschool child nutrition and development under RA 11037, while providing an emergency router that immediately transmits child abuse disclosures directly to the PNP WCPD and DSWD."*

---

## ⚡ 3. Software Engineering Design Standards

1. **Service Layer Isolation:** No raw mathematics exist inside controllers. The `NutritionCalculatorService` encapsulates WHO growth standards, while `RiskAssessmentService` encapsulates VAWC-RAVE danger scoring.
2. **Atomic Component Decomposition:** Monolithic React pages exceeding 1,500 lines were refactored into atomic partial components (<250 lines) coordinated by custom hooks (`useVawcCreateWorkflow`, `useVawcCaseWorkflow`).
3. **Database Relational Integrity:** Soft deletes and foreign key cascades prevent dangling legal transmittals while preserving permanent audit records under Commission on Audit (COA) standards.
