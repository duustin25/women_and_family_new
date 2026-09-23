# 🎤 High-Stakes Capstone Panelist Q&A Defense Script

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Barangay 183, Villamor Airbase, Pasay City**  
> **Audience:** Presenting Developers, Defense Candidates, Panel Reviewers

---

## 🏛️ Domain & Statutory Questions

### Q1: *"Why are BCPC and VAWC divided into two separate modules instead of one generic case blotter?"*
> **Candidate Answer:**
> *"BCPC and VAWC are governed by entirely different Philippine statutes, operational objectives, and authorized personnel:
>
> 1. **Statutory Mandate:** VAWC is governed by **Republic Act No. 9262** (criminal law against intimate partner violence), whereas our BCPC module operationalizes **Republic Act No. 11037** and the **NNC Operation Timbang Plus** (public health child nutrition and stunting prevention).
> 2. **Authorized Actors:** VAWC cases contain sensitive criminal disclosures restricted strictly to the **Barangay VAW Desk Officer** and the **Punong Barangay**. Conversely, BCPC child weighing data is gathered in community zones by **Barangay Nutrition Scholars (BNS)**. Combining them would violate the Data Privacy Act (RA 10173) by exposing domestic abuse records to public health field workers."*

### Q2: *"If a father beats both his wife and his 4-year-old child, in which module is the incident handled?"*
> **Candidate Answer:**
> *"Under Philippine jurisprudence, violence committed against a woman AND her children by an intimate partner falls strictly under **Republic Act No. 9262 (VAWC)**.
>
> In our system, the incident is encoded in the **VAWC Module**. The mother is registered as the primary survivor-petitioner, the abusive husband as the respondent, and the child is recorded under the `vawc_involved_parties` table as a minor dependent. The resulting Barangay Protection Order (BPO) automatically extends legal protection to both the mother and child. The BCPC module is NOT used for this incident because BCPC is reserved for community nutrition tracking under RA 11037."*

### Q3: *"Can the Punong Barangay resolve a VAWC complaint through an amicable settlement (Kasunduan) if both parties agree to forgive each other?"*
> **Candidate Answer:**
> *"No, absolutely not. **Section 33 of Republic Act No. 9262** explicitly and unequivocally prohibits conciliation, mediation, or amicable settlement of VAWC cases under the *Katarungang Pambarangay* law. Domestic violence is recognized as a public crime against human rights, not a private civil dispute.
>
> To enforce this in code, our system contains **zero mediation or settlement buttons**. In fact, our service layer (`VawcCaseService.php`) includes hardcoded regex filters that throw a fatal exception if an officer attempts to record terms like 'amicable', 'settled', or 'kasunduan'."*

---

## 🔬 Clinical & Mathematical Questions

### Q4: *"Why did you use linear interpolation for the WHO Child Growth Standards instead of rounding to the nearest month?"*
> **Candidate Answer:**
> *"Preschool children do not get weighed on their exact monthly birthdays. If a child is 14 months and 28 days old (14.93 months), rounding down to 14 months compares them against reference standards for a younger child, while rounding up to 15 months compares them against older standards.
>
> In public health, this 1-month rounding error can misdiagnose a child with **Moderate Acute Malnutrition (MAM)** as 'Normal' (a false negative), thereby denying them enrollment into the 120-Day Supplemental Feeding Program (SFP). Our `NutritionCalculatorService` applies decimal continuous linear interpolation between monthly lookup milestones, ensuring medical-grade accuracy."*

### Q5: *"What happens if a tired BNS worker accidentally enters a typo, such as entering 115 kg instead of 11.5 kg?"*
> **Candidate Answer:**
> *"The system implements a dual-layer safety guardrail:
>
> 1. **Numerical Validation Bounds:** Form validation immediately rejects values outside the biologically possible range for 0–59 month preschoolers ($1.50\text{ kg} - 35.00\text{ kg}$ and $40.0\text{ cm} - 125.0\text{ cm}$).
> 2. **Biological Outlier Pause Dialog ($\pm 5\text{ SD}$):** Even if an entered value falls within the wide numerical bounds, if it deviates more than 5 standard deviations from the WHO biological median for that exact age, the frontend blocks submission and displays an **Extreme Outlier Pause Dialog** requiring the BNS to re-weigh the child and confirm."*

---

## 🔒 Security, System Architecture & Forensics

### Q6: *"How do you defend against a corrupt administrator altering records in the database to clear a perpetrator's name?"*
> **Candidate Answer:**
> *"Every single create, update, and delete transaction across all models triggers our `AuditLogger` service.
>
> 1. **Granular Delta Storage:** The system records both the `old_values` and `new_values` as immutable JSON arrays, along with the user ID, IPv4/IPv6 address, and browser User-Agent fingerprint.
> 2. **Append-Only Table:** The `audit_logs` table has no edit or delete endpoints in the application. Any attempt to modify a case status generates an immediate audit log capturing the administrator's account details, providing an irrefutable paper trail for court subpoena."*

### Q7: *"What prevents the Python AI Chatbot from crashing your Laravel web server or hallucinating dangerous advice?"*
> **Candidate Answer:**
> *"Three defensive architectural layers safeguard the AI chatbot:
>
> 1. **Process Isolation & 5-Second Timeout:** The Python sub-process is executed via Symfony Process with a strict 5-second timeout. If the Python process hangs, it is terminated immediately without stalling PHP web workers.
> 2. **Confidence Threshold & Fallback Router:** The Scikit-Learn Multi-Layer Perceptron (MLP) requires a classification probability $P \ge 0.70$. If the confidence falls below 70%, it routes to a static educational fallback directing the user to official hotlines.
> 3. **Administrative Maintenance Toggle:** Under `/admin/settings`, the administrator can toggle the chatbot offline with 1 click during maintenance, safely returning a polite offline message."*
