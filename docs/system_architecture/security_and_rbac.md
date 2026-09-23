# 🔐 System Security Architecture & Role-Based Access Control (RBAC)

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Barangay 183, Villamor Airbase, Pasay City**

---

## 🛡️ 1. Security Architecture Overview

The WFPIS platform handles sensitive, legally protected human rights and minor health data. The security perimeter adheres to **Republic Act No. 10173 (Data Privacy Act of 2012)** and standard government cryptographic standards.

```
+-----------------------------------------------------------------------------------+
|                            APPLICATION FIREWALL & AUTH                            |
|             Laravel Sanctum  *  CSRF Protection  *  Rate Limiting                 |
+-----------------------------------------+-----------------------------------------+
                                          |
+-----------------------------------------v-----------------------------------------+
|                                ROLE-BASED ACCESS CONTROL                          |
|             admin  *  head  *  bns  *  vawc_officer  *  org_head                  |
+-----------------------------------------+-----------------------------------------+
                                          |
+-----------------------------------------v-----------------------------------------+
|                             DATA ENCRYPTION AT REST & TRANSIT                     |
|           TLS 1.3 Encryption in Transit  *  AES-256 Eloquent Field Encryption     |
+-----------------------------------------+-----------------------------------------+
                                          |
+-----------------------------------------v-----------------------------------------+
|                                IMMUTABLE AUDIT TRAIL                              |
|           Polymorphic AuditLogger (old_values, new_values, IP, User-Agent)        |
+-----------------------------------------------------------------------------------+
```

---

## 👥 2. Role-Based Access Control (RBAC) Matrix

| Module & Action | `admin` | `head` (Kagawad / PB) | `vawc_officer` | `bns` (Nutrition) | `org_head` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **VAWC Case Intake & Dossiers** | ✅ Full | ✅ Full | ✅ Full | ❌ Blocked | ❌ Blocked |
| **VAWC BPO Sign & Issuance** | ❌ Review | ✅ Sign & Issue | ❌ Apply Only | ❌ Blocked | ❌ Blocked |
| **BCPC Census & Weighing Intake**| ✅ Full | ✅ View Only | ❌ Blocked | ✅ Full | ❌ Blocked |
| **BCPC e-OPT+ Masterlist Sign** | ❌ Review | ✅ Sign & Issue | ❌ Blocked | ✅ Prep Only | ❌ Blocked |
| **GAD Event Fast-Track Publish** | ✅ Full | ✅ Full | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| **GAD Proposal Review** | ✅ Full | ✅ Full | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| **Org Public Applications** | ✅ Full | ✅ Full | ❌ Blocked | ❌ Blocked | ✅ Scoped to Org |
| **Resident Appeals Overrule** | ✅ Full | ✅ Full | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| **Database Point-in-Time Backup**| ✅ Full | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| **Audit Logs Inspection** | ✅ Full | ✅ View Only | ❌ Blocked | ❌ Blocked | ❌ Blocked |

---

## 📜 3. Immutable Audit Logging Subsystem

Every transactional mutation across case reports, child assessments, member applications, and user accounts is logged by `AuditLogger.php`.

```php
// app/Models/AuditLog.php
class AuditLog extends Model
{
    protected $fillable = [
        'user_id', 'action', 'auditable_type', 'auditable_id',
        'old_values', 'new_values', 'ip_address', 'user_agent'
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function auditable(): MorphTo
    {
        return $this->morphTo(); // Dynamically links to CaseReport, BcpcChild, Member, User
    }
}
```

### Forensic Properties
* **Immutability:** The `audit_logs` table has no `update` or `delete` methods in any controller. Rows are append-only.
* **Granular Diff:** Stores both previous (`old_values`) and updated (`new_values`) states as JSON arrays, allowing forensic verification during legal court subpoenas or COA audits.
* **Network Traceability:** Records client IPv4/IPv6 address and User-Agent browser fingerprint on every state transition.

---

## ♿ 4. Web Accessibility & Screen Reader Standards (WCAG 2.1 AA)

In alignment with IT Expert recommendations for inclusive barangay governance:
* **NVDA Screen Reader Optimization:** WAI-ARIA landmarks (`role="banner"`, `role="navigation"`, `role="main"`) are embedded across all layout templates.
* **High-Contrast Toggle:** Built-in high-contrast theme token switch for visually impaired users.
* **Web Speech API Voice Assistance:** Built-in screen reader reading out vital public alerts and emergency hotlines.
* **Touch Targets:** Minimum $48 \times 48\text{px}$ touch boundaries for elderly mobile users.
