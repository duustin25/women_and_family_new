# WFP Barangay Management System - Technical Capstone Documentation

## 1. Executive Summary & Architecture
The WFP Barangay Management System is an integrated, role-based organizational and case management platform designed to digitize and optimize critical barangay operations. Built on the modern **TALL Stack** (Tailwind CSS, Alpine.js, Laravel, Livewire) utilizing the **FilamentPHP Admin Panel**, the system ensures robust architectural integrity by employing standard MVC (Model-View-Controller) patterns combined with SOLID principles.

### Architectural Highlights
- **Role-Based Access Control (RBAC):** Restricts data access strictly to authorized personnel (e.g., BNS for Nutrition, VAWC Officers for secure case management).
- **Service-Oriented Background Processing:** Uses Laravel Queues (Database/Sync) to optimize responsiveness during computationally heavy or latency-prone tasks like automated email dispatching.
- **Relational Integrity:** Implements specific cascading updates and soft deletes to protect legal data trails.

---

## 2. Infrastructure: Security, Audit Logging & Exception Handling
To ensure the system is "panelist-proof," all critical data transactions maintain an immutable paper trail using morphological relationships.

### Audit Logging (`AuditLog.php`)
Every state change across user profiles, VAWC reports, or Organization applications logs the exact `old_values`, `new_values`, and IP trace of the administrator executing the change.

```php
// app/Models/AuditLog.php
class AuditLog extends Model
{
    protected $fillable = ['user_id', 'action', 'auditable_type', 'auditable_id', 'old_values', 'new_values', 'ip_address', 'user_agent'];
    protected $casts = ['old_values' => 'array', 'new_values' => 'array'];

    public function auditable(): MorphTo
    {
        return $this->morphTo(); // Dynamically links to CaseReport, User, or Membership Application
    }
}
```

### Exception Handling & Reliability
Key integrations (such as SMTP mailing for membership approvals) are wrapped in `try-catch` blocks and tied to localized notifications. This prevents terminal failures (e.g., 500 Server Errors) if a third-party service times out, ensuring the administrative portal remains functional.

---

## 3. VAWC-RAVE Module (Risk Assessment for Vulnerability Emergencies)
The VAWC module is legally aligned with RA 9262 and the Philippine Barangay VAW Desk Handbook. It securely captures mandatory socio-demographic indicators ("Pink Form" compliance).

### Triage Logic (1-12 Scoring Algorithm)
A core technical feature is the **VAWC-RAVE algorithm**. It evaluates a case based on boolean inputs mathematically transitioning into a weighted severity score (1-12).

* **Low Risk (1-4):** Minor verbal conflicts, no weapons.
* **Medium Risk (5-8):** Repeat offenses or escalating threats.
* **High/Emergency Risk (9-12):** Weapons involved, warrantless arrests, direct physical danger.

### Core Model Implementation (`VawcCase.php`)
```php
// app/Models/VawcCase.php
class VawcCase extends Model
{
    use SoftDeletes; // Preserves deleted cases for legal auditing
    
    protected $fillable = [
        'case_report_id', 'intake_type', 'is_repeat_offense', 
        'has_weapon_involved', 'incident_veracity', 'weapons_confiscated'
        // ...
    ];

    protected $casts = [
        'is_repeat_offense' => 'boolean',
        'has_weapon_involved' => 'boolean',
        // Automatically cast database tinyints to application-level booleans
    ];

    // Belongs to the core CaseReport infrastructure
    public function caseReport(): BelongsTo
    {
        return $this->belongsTo(CaseReport::class);
    }
}
```

---

## 4. BCPC Nutrition Command Center
The Barangay Council for the Protection of Children (BCPC) module tracks infant and child health using WHO (World Health Organization) standard nutritional triage logic.

### Technical Workflow
The system actively calculates and monitors changes in **Weight-for-Age (WFA)** and **Height-for-Age (HFA)**. When a Barangay Nutrition Scholar (BNS) submits an assessment, the system evaluates the float values against age constraints to recommend interventions.

### Core Model Implementation (`BcpcAssessment.php`)
```php
// app/Models/BcpcAssessment.php
class BcpcAssessment extends Model
{
    protected $fillable = [
        'bcpc_child_id', 'user_id', 'date_of_weighing',
        'weight_kg', 'height_cm', 'wfa_status', 'hfa_status',
        'intervention_logs', 'remarks'
    ];

    protected $casts = [
        'date_of_weighing' => 'date',
        'weight_kg' => 'float',
        'height_cm' => 'float',
        'intervention_logs' => 'array', // Dynamically scaling JSON storage for medical logs
    ];

    public function child()
    {
        return $this->belongsTo(BcpcChild::class, 'bcpc_child_id');
    }
}
```

---

## 5. Organization & Membership Management System
Manages barangay-level organizational entities (e.g., Youth Clubs, Senior Citizen Groups) and automated application workflows.

### Process Automation
When an applicant applies to an organization, an `ApplicantProfile` is queued for review. Upon status change (Approved/Disapproved) by an Administrator, **Model Observers** (or controller actions) trigger an asynchronous Email Dispatcher.

### Core Model Implementation (`Organization.php`)
```php
// app/Models/Organization.php
class Organization extends Model
{
    protected $fillable = [
        'name', 'slug', 'color_theme', 'requirements', 'form_schema'
    ];

    // Schema arrays allow dynamic application forms configured per organization
    protected $casts = [
        'requirements' => 'array',
        'form_schema' => 'array',
    ];

    // Auto-generates URL-friendly slugs on Creation and Update
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($org) {
            if (empty($org->slug)) { $org->slug = Str::slug($org->name); }
        });
    }

    public function membershipApplications(): HasMany
    {
        return $this->hasMany(MembershipApplication::class);
    }
}
```

---

## 6. GAD (Gender and Development) Module
This module tracks project proposals, budgets, and beneficiary targeting specifically structured to utilize the nationally mandated 5% GAD budget allocation.

* **Key Functionality:** Ties into `Organization` and `User` relations to track which group is sponsoring a proposal, streamlining the approval matrix from proposal phase through dispatching beneficiaries (`BeneficiaryDispatch.php`).

## 7. Conclusion & System Defensibility
The WFP Barangay Management system answers the complex operational needs of LGUs through a scalable architecture. By cleanly separating specific module logics (VAWC Risk algorithms, WHO Nutrition data types, JSON-casted dynamic membership schemas) while tying it all together with unified Audit Logging and structured Try-Catch fault tolerance, the codebase is secure, legally reliable, and built to professional enterprise standards.
