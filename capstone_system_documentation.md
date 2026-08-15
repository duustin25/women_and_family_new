# WFP Barangay Management System - Technical Capstone Documentation

## 1. Executive Summary & Architecture
The WFP Barangay Management System is an integrated, role-based organizational and case management platform designed to digitize and optimize critical barangay operations. Built on a high-performance **Laravel + Inertia.js + React** framework with **Shadcn UI & Tailwind CSS**, the system ensures robust architectural integrity by employing standard MVC (Model-View-Controller) patterns combined with SOLID principles.

### Architectural Highlights
- **Role-Based Access Control (RBAC):** Restricts data access strictly to authorized personnel (e.g., BNS for Nutrition, VAWC Officers for secure case management).
- **Service-Oriented Background Processing:** Uses Laravel Queues and Service classes (`NutritionCalculatorService`, `DatabaseBackupService`) to isolate complex calculations and background jobs.
- **Relational Integrity:** Implements specific cascading updates and soft deletes to protect legal data trails.

---

## 2. Infrastructure: Security, Audit Logging & Exception Handling
To ensure the system is "panelist-proof," all critical data transactions maintain an immutable paper trail using morphological relationships.

### Audit Logging (`AuditLog.php`)
Every state change across user profiles, VAWC reports, BCPC child assessments, or Organization applications logs the exact `old_values`, `new_values`, and IP trace of the administrator executing the change.

```php
// app/Models/AuditLog.php
class AuditLog extends Model
{
    protected $fillable = ['user_id', 'action', 'auditable_type', 'auditable_id', 'old_values', 'new_values', 'ip_address', 'user_agent'];
    protected $casts = ['old_values' => 'array', 'new_values' => 'array'];

    public function auditable(): MorphTo
    {
        return $this->morphTo(); // Dynamically links to CaseReport, BcpcChild, Member, or User
    }
}
```

---

## 3. VAWC-RAVE Module (Risk Assessment for Vulnerability Emergencies)
The VAWC module is legally aligned with RA 9262 and the Philippine Barangay VAW Desk Handbook. It securely captures mandatory socio-demographic indicators ("Pink Form" compliance).

### Triage Logic (1-12 Scoring Algorithm)
A core technical feature is the **VAWC-RAVE algorithm**. It evaluates a case based on boolean inputs mathematically transitioning into a weighted severity score (1-12).

* **Low Risk (1-4):** Minor verbal conflicts, no weapons.
* **Medium Risk (5-8):** Repeat offenses or escalating threats.
* **High/Emergency Risk (9-12):** Weapons involved, warrantless arrests, direct physical danger.

---

## 4. BCPC Child Nutrition Command Center (NNC e-OPT Plus & RA 11037)
The Barangay Council for the Protection of Children (BCPC) module tracks infant and child health in strict compliance with the **National Nutrition Council (NNC) Operation Timbang (OPT) Plus guidelines** and **RA 11037 (Masustansyang Pagkain para sa Batang Pilipino Act)**.

### Technical & Operational Workflow
1. **0–59 Months Lockout Enforcement**: Operation Timbang Plus strictly applies to preschoolers aged **0 to 59 months**. Children who reach 60 months (5 years) are automatically locked out from new weighing entries, with an automated UI notice redirecting monitoring to the school sector.
2. **WHO 3-Axis Precision Growth Calculator (`NutritionCalculatorService.php`)**:
   - Evaluates **Weight-for-Age (WFA)**, **Height-for-Age (HFA)**, and **Weight-for-Length/Height (WFL/H)**.
   - Utilizes **precision linear interpolation** across exact WHO reference arrays for all months $0 \dots 60$, eliminating rounding errors or false diagnoses.
3. **Data Entry "Sanity Check" Validations**:
   - Enforces strict min/max numerical bounds ($1.5-35.0\text{ kg}$, $40.0-125.0\text{ cm}$).
   - **Extreme Outlier Pause Dialog Prompt**: Automatically detects measurements beyond WHO $\pm 5\text{ SD}$ and pauses submission to request user verification against typos.
4. **120-Day Supplemental Feeding Program (SFP)**:
   - Malnourished children (SAM/MAM/Wasted) are automatically enrolled in the **120-Day SFP Cycle** with automated milestone tracking at **Day 1**, **Day 30**, **Day 60**, **Day 90**, and **Day 120 (Final Graduation)**.

### Core Model Implementation (`BcpcAssessment.php`)
```php
// app/Models/BcpcAssessment.php
class BcpcAssessment extends Model
{
    protected $fillable = [
        'bcpc_child_id', 'user_id', 'date_of_weighing',
        'weight_kg', 'height_cm', 'wfa_status', 'hfa_status', 'wflh_status',
        'intervention_logs', 'remarks', 'bns_assessor', 'sfp_day_number'
    ];

    protected $casts = [
        'date_of_weighing' => 'date',
        'weight_kg' => 'float',
        'height_cm' => 'float',
        'intervention_logs' => 'array',
    ];
}
```

---

## 5. DOH/NNC e-OPT Plus Printable Masterlists & Executive Reports
Administrators can launch the official printable **e-OPT Plus Masterlist & Executive Summary Report** (`Print.tsx`), formatted according to National Nutrition Council standards for city/municipal health office submission.
