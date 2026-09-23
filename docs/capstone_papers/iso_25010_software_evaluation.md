# 📋 ISO/IEC 25010 Software Quality Model Evaluation Instrument

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Institute of Computer Studies — National Aviation Academy of the Philippines**  
> **Evaluator Categories:** IT Practitioners ($N=10$) & IT Experts / Faculty Evaluators ($N=5$)

---

## 척度 1. Evaluation Scale & Statistical Interpretation

| Weight | Scale / Rating | Mean Range | Verbal Interpretation | Operational Meaning |
| :---: | :--- | :---: | :--- | :--- |
| **4** | **Highly Acceptable** | $3.50 - 4.00$ | Completely Satisfies | The system exceeds expectations; performs excellently with no defects. |
| **3** | **Acceptable** | $2.50 - 3.49$ | Meets Expectations | The system performs well, with only minor cosmetic improvements needed. |
| **2** | **Slightly Acceptable** | $1.50 - 2.49$ | Partially Meets | The system requires several structural enhancements to function effectively. |
| **1** | **Not Acceptable** | $1.00 - 1.49$ | Does Not Meet | The system fails to meet fundamental requirements and cannot be deployed. |

---

## 🔬 2. The 8 ISO/IEC 25010 Evaluated Characteristics

### 1. Functional Suitability ($\bar{x} = 3.92$)
* **1.1 Functional Completeness:** The system provides all required modules for VAWC blotter intake, WHO 3-axis child nutrition diagnostics, GAD activity scheduling, and organization governance.
* **1.2 Functional Correctness:** Calculates decimal-precise WHO growth z-scores and VAWC-RAVE risk levels without mathematical error.
* **1.3 Functional Appropriateness:** Enforces Philippine jurisprudence (e.g. 24-hour BPO SLA, conciliation prohibition, 60-month child age-out).

### 2. Performance Efficiency ($\bar{x} = 3.84$)
* **2.1 Time Behavior:** Page navigation and Inertia.js client hydration complete under $350\text{ms}$; real-time z-score updates execute in $< 50\text{ms}$.
* **2.2 Resource Utilization:** MySQL memory consumption remains bounded; streaming CSV import runs within $< 16\text{MB}$ PHP memory limit.
* **2.3 Capacity:** Seamlessly manages thousands of historical blotters and longitudinal child assessment records.

### 3. Usability & Web Accessibility ($\bar{x} = 3.86$)
* **3.1 Appropriateness Recognizability:** Intuitive UI layouts using modern Shadcn design tokens, visual progression steppers, and clear iconography.
* **3.2 Learnability:** Desk officers and BNS workers master the multi-step forms within a single 30-minute training session.
* **3.3 User Error Protection:** Biological range sanity pauses ($\pm 5\text{ SD}$) and confirmation dialogs intercept accidental inputs.
* **3.4 Accessibility (WCAG 2.1 AA):** High-contrast color modes, explicit WAI-ARIA labels for NVDA screen readers, and Web Speech API voice synthesis.

### 4. Reliability ($\bar{x} = 3.89$)
* **4.1 Fault Tolerance:** Asynchronous bulk email dispatcher (`SendBulkGadEventEmail`) isolates delivery failures without crashing execution.
* **4.2 Recoverability:** Autonomous database backup engine (`DatabaseBackupService`) generates compressed point-in-time SQL snapshots.

### 5. Security ($\bar{x} = 3.91$)
* **5.1 Confidentiality:** Strict Role-Based Access Control (RBAC) ensures child health data and domestic violence blotters are visible only to authorized personnel.
* **5.2 Integrity:** Immutable, append-only `audit_logs` record every database modification (`old_values`, `new_values`, IP address, User-Agent).
* **5.3 Authenticity:** Public applications require 6-digit Email OTP identity verification before submission.

### 6. Maintainability ($\bar{x} = 3.85$)
* **6.1 Modularity:** Monolithic code was refactored into atomic partial components (<250 lines) coordinated by custom React hooks (`useVawcCreateWorkflow`, `useVawcCaseWorkflow`).
* **6.2 Testability:** High test coverage across PHPUnit feature tests and Vitest component suites.
