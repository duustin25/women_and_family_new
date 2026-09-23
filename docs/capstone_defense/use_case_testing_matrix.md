# 🧪 Use Case Testing Matrix & System Validation Checklist

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Barangay 183, Villamor Airbase, Pasay City**

---

## 📋 Comprehensive Empirical Test Execution Matrix

| Test ID | System Feature & Use Case | Input / Action | Expected Result | Actual Result | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Role-Based Access Control | Attempting to access `/admin/vawc` while logged in as BNS worker. | System blocks request with HTTP 403 Forbidden. | Correctly redirected with access denied banner. | ✅ PASSED |
| **TC-02** | Master Dossier Search First | Searching for known repeat perpetrator name prior to case creation. | Displays existing dossier profile and historical case count. | Dossier returned; auto-links to new incident. | ✅ PASSED |
| **TC-03** | VAWC-RAVE Danger Triage | Entering affirmative answers for lethal indicators ($x_1, x_2, x_3$). | Computes score $\ge 9$; displays High/Emergency Risk banner. | Score 10 calculated; emergency shelter protocol shown. | ✅ PASSED |
| **TC-04** | BPO 24-Hour Statutory SLA | Submitting ex-parte BPO application at 10:00 AM. | Deadline calculated as 10:00 AM next day; countdown starts. | Exact 24-hour timestamp locked; timer active. | ✅ PASSED |
| **TC-05** | Conciliation Ban Guardrail | Attempting to resolve VAWC case with reason *"Amicable settlement"*. | System throws `DomainException` citing RA 9262 Sec. 33. | Blocked with descriptive statutory warning. | ✅ PASSED |
| **TC-06** | 60-Month Child Age-Out | Registering a child born 61 months ago in the BCPC module. | Form validation rejects registration citing transfer to DepEd. | Blocked with DepEd SBFP referral alert. | ✅ PASSED |
| **TC-07** | WHO Linear Interpolation | Boy aged 14.5 months, weight $10.2\text{ kg}$, height $79.8\text{ cm}$. | Interpolates between month 14 and 15 tables. | Accurate z-scores computed; Normal status assigned. | ✅ PASSED |
| **TC-08** | Biological Range Pause Dialog | Entering weight of $45.0\text{ kg}$ for an 18-month-old infant. | Triggers Outlier Pause Dialog ($> 5\text{ SD}$). | Modal paused submission, requesting re-weighing. | ✅ PASSED |
| **TC-09** | 120-Day SFP Relapse Engine | Re-weighing a graduated child whose weight dropped back to SAM. | System initiates SFP Cycle 2 under same master profile. | Cycle 2 initialized; medical history preserved. | ✅ PASSED |
| **TC-10** | GAD Proposal Approval Flow | GAD Head approves organization workshop proposal. | Event status set to `approved`; queue job dispatched. | Public calendar updated; bulk email enqueued. | ✅ PASSED |
| **TC-11** | Bulk Email Timeout Defense | Dispatching email broadcast to 200 organization members. | Job runs in chunks of 50 without hitting PHP 30s timeout. | Processed all recipients without memory exhaustion. | ✅ PASSED |
| **TC-12** | Public Application & OTP | Citizen applies for Solo Parents org via `/membership/apply`. | Requires 6-digit OTP code sent to applicant email. | Form locked until valid OTP verified. | ✅ PASSED |
| **TC-13** | 14-Day SLA & Council Overrule | Council Kagawad reviews rejected application under appeal. | Council Overrule flips status to `approved`; logs justification. | Member synchronized; audit trail captures action. | ✅ PASSED |
| **TC-14** | Database Backup & Pruning | Admin triggers 1-click snapshot in `/admin/backups`. | Generates `.sql.gz` dump; prunes archives older than 30 days. | Compressed backup saved; SHA-256 verified. | ✅ PASSED |
| **TC-15** | Immutable Audit Trail | Modifying resident member contact details. | Logs old and new phone number with operator IP address. | Recorded in `audit_logs` with JSON diff. | ✅ PASSED |
