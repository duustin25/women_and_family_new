# 🛡️ SYSTEM SECURITY ARCHITECTURE & THREAT MITIGATION MANUAL
**Women & Family Protection (WFP) Management System**  
*Barangay 183, Villamor, Pasay City*

> **Classification:** Confidential / Official Production Security Manual  
> **Applicable Laws:** Republic Act 9262 (Anti-VAWC Act of 2004), Republic Act 10173 (Data Privacy Act of 2012)  
> **Scope:** Authentication, Cryptographic Key Storage, Account Lifecycle, Step-Up Verification, Emergency Session Kill-Switches, RBAC, and Disaster Recovery.

---

## 1. Executive Security Blueprint

Because this platform processes highly confidential cases involving domestic violence, vulnerable minors, and victim safety, the security architecture operates under a **Defense-in-Depth** and **Zero-Trust (Least Privilege)** paradigm.

```
                               THE DEFENSE-IN-DEPTH PERIMETER
+--------------------------------------------------------------------------------------------+
| 1. HTTP TRANSPORT LAYER                                                                    |
|    - TLS 1.3 / Strict-Transport-Security (HSTS)                                           |
|    - SecurityHeadersMiddleware (CSP, X-Frame-Options: DENY, X-Content-Type: nosniff)       |
+---------------------------------------------+----------------------------------------------+
                                              |
+---------------------------------------------v----------------------------------------------+
| 2. EDGE GATEWAY & SESSION ENFORCEMENT                                                      |
|    - Throttling (throttle:6,1 on Auth / throttle:10,1 on Admin & API)                      |
|    - EnsureAccountIsActive Middleware (Instant eviction of locked/provisional sessions)     |
|    - Encrypted HTTP-only Cookies & CSRF Protection Tokens                                   |
+---------------------------------------------+----------------------------------------------+
                                              |
+---------------------------------------------v----------------------------------------------+
| 3. IDENTITY, LIFECYCLE & STEP-UP DEFENSE                                                   |
|    - Phase 1 & 2 Provisional Onboarding (64-char high-entropy temporary passwords)          |
|    - Step-Up Authentication & Target-Value Quarantine for email/credential changes          |
|    - Emergency Panic Kill-Switch (/auth/security/panic/{token}) with DB Row Locking         |
|    - 3-Strike Brute-Force Hard Lockout & Constant-Time Verification (hash_equals)          |
+---------------------------------------------+----------------------------------------------+
                                              |
+---------------------------------------------v----------------------------------------------+
| 4. APPLICATION & DATA ACCESS CONTROL (RBAC)                                                |
|    - Multi-Tenant Role Isolation (Super Admin vs Committee Head vs Organization President)  |
|    - UUIDv4 Obfuscation for VAWC Dossiers (Anti-IDOR Protection)                           |
+---------------------------------------------+----------------------------------------------+
                                              |
+---------------------------------------------v----------------------------------------------+
| 5. PERSISTENCE & DISASTER RECOVERY                                                         |
|    - Database Sessions Storage (Instant session table purging upon panic)                  |
|    - AES-256-CBC Encrypted Database Snapshots with HMAC-SHA256 Integrity Verification      |
|    - Immutable Audit Trails (AuditObserver recording IP, user agent, before/after states)  |
+--------------------------------------------------------------------------------------------+
```

---

## 2. Threat Models & Countermeasures Matrix

| Threat Vector | Attack Scenario | System Countermeasure | Enforcing Component |
| :--- | :--- | :--- | :--- |
| **Account Takeover (ATO)** | An attacker hijacks an active browser session and modifies the email/password to lock out the victim. | **Target-Value Quarantine**: `users.email` is not modified. Proposed email is quarantined in `email_otps.target_value`. Step-Up OTP is sent to current verified email. | `ProfileController`, `OtpSecurityService` |
| **Physical Workstation Hijacking** | An unauthorized person uses an officer's unattended unlocked workstation to alter credentials. | **Emergency Panic Kill-Switch**: Officer receives security alert email and clicks 1-tap Panic Link, instantly terminating all sessions. | `SecurityOtpMail`, `OtpSecurityController` |
| **Admin Credential Leakage** | Plain-text passwords created by administrators are intercepted or guessed. | **Two-Phase Provisional Onboarding**: Temporary password is a 64-character cryptographic string. User sets permanent password via OTP. | `SystemUserController`, `AccountActivationController` |
| **Brute-Force & Credential Stuffing** | Automated bots rapidly guess 6-digit verification codes. | **3-Strike Hard Lockout**: After 3 consecutive failed attempts, the code is burned and the user account transitions to `locked`. | `OtpSecurityService::verifyOtp` |
| **Timing Side-Channel Attacks** | Attackers measure CPU execution time differences to deduce valid characters of OTP hashes. | **Constant-Time Comparison**: All comparisons execute via native PHP `hash_equals()`. | `OtpSecurityService` |
| **Replay Attacks** | An attacker intercepts a previously valid OTP and attempts to reuse it. | **Single-Use Burning**: OTPs are marked `is_used = true` immediately within an ACID database transaction upon validation. | `OtpSecurityService` |
| **IDOR & Data Scraping** | Attackers enumerate sequential integer IDs (`/vawc/cases/1`, `/2`) to harvest victim identities. | **UUIDv4 Masking**: Sensitive routes reference random 128-bit UUIDs (`/vawc/cases/9b1deb4d-...`). | `2026_09_10_010000_add_uuid...`, Route Models |
| **Database Backup Theft** | Stored SQL backup files are downloaded or stolen from the server filesystem. | **AES-256 Envelope Encryption**: Backups are encrypted with AES-256-CBC and signed with HMAC-SHA256 keys. | `DatabaseBackupService` |

---

## 3. Two-Phase Provisional User Onboarding

Traditional web applications require an administrator to choose a temporary password and verbally or manually share it with the user, exposing plain text to chat apps and shoulder surfing. This system replaces that anti-pattern with **Two-Phase Zero-Knowledge Provisioning**.

```
[Super Admin] ──> Enters Name, Email, Role
                        │
                        ▼
            [Backend Provisioning Engine]
            • is_active = false
            • status = 'pending_verification'
            • password = Hash::make(Str::random(64))
            • rawOtp = random_int(100000, 999999)
            • otp_hash = hash_hmac('sha256', rawOtp, APP_KEY)
            • expires_at = now() + 10 minutes
                        │
                        ▼
       [Out-of-Band Invitation Email Dispatched]
                        │
                        ▼
     [Invited User Opens /verify-account?email=...]
                        │
                        ▼
          [User Inputs OTP + Permanent Password]
                        │
                        ▼
            [Cryptographic Verification]
            • hash_equals(stored_hash, expected_hash)
            • attempts < 3
            • !is_used && !isPast()
                        │
                        ▼
           [Account Activated & Verified]
            • is_active = true
            • status = 'active'
            • password = Hash::make(newPassword)
            • email_verified_at = now()
            • is_used = true (burned)
```

---

## 4. Step-Up Authentication & Target-Value Quarantine

When an active user submits an email change via `PATCH /settings/profile`:

1. **Quarantine Logic**:
   ```php
   // Quarantine new email; primary email remains untouched
   $otpPayload = $otpService->createStepUpProtectionOtp(
       $user,
       EmailOtp::ACTION_EMAIL_CHANGE,
       $newEmail
   );
   ```
2. **Current-Device Prompt**: The frontend displays `SecurityOtpModal.tsx`, requiring the 6-digit confirmation code.
3. **Out-of-Band Dispatch**: The confirmation code is sent to the **current, existing email address** (`$user->email`), along with an emergency panic button.
4. **Commitment**: Only when the valid OTP is verified via `POST /settings/profile/verify-email-change` does the database update:
   ```php
   $user->email = $result['target_value'];
   $user->email_verified_at = now();
   $user->save();
   ```

---

## 5. Emergency Panic Link & Session Kill-Switch

```
                               EMERGENCY PANIC KILL-SWITCH FLOW
[Legitimate User Receives Security Alert]
  "Did not request this change? Click here to lock your account immediately."
                    │
                    ▼
     GET /auth/security/panic/{token}
                    │
                    ▼
      [OtpSecurityService::triggerPanicKillSwitch]
                    │
      ┌─────────────┴─────────────┐
      │   DB::transaction() with   │
      │       lockForUpdate()      │
      └─────────────┬─────────────┘
                    │
       1. Lock User Record (status = 'locked', remember_token = null)
       2. Purge DB Sessions (DELETE FROM sessions WHERE user_id = ?)
       3. Burn All Active OTPs (is_used = true)
       4. Log Security Warning to Audit Trail
                    │
                    ▼
     [Session Eviction via EnsureAccountIsActive Middleware]
      Attacker's browser session is immediately invalidated.
                    │
                    ▼
     [User Redirected to /auth/panic-confirmation]
```

### Pessimistic Concurrency Guarantee
To prevent race conditions where an attacker might rapidly submit multiple OTP guesses while the legitimate user triggers the panic switch, row-level locking (`lockForUpdate()`) ensures that whichever transaction acquires the lock executes atomically, invalidating all subsequent attempts.

---

## 6. SecOps & Administrative Recovery Runbook

When an account is locked due to 3 failed OTP attempts or the panic switch, administrators do not need to execute manual database scripts. The **Admin Settings > System Users** interface provides dedicated recovery controls:

1. **Status Visibility**:
   - `Active` (Emerald): Normal operation.
   - `Pending Verification` (Amber): Awaiting user OTP confirmation.
   - `Locked / Frozen` (Destructive Red): Account restricted.
2. **One-Click Actions**:
   - **Resend Activation Code**: Automatically enforces a 60-second rate-limiting cooldown to prevent mailer flooding.
   - **Unlock Account**:
     ```php
     $user->update([
         'status' => User::STATUS_PENDING_VERIFICATION,
         'is_active' => false,
     ]);
     $rawOtp = $this->createProvisionalActivationOtp($user);
     Mail::to($user->email)->send(new UserInvitationMail($user, $rawOtp));
     ```

---

## 7. Tiered Security Policy & The Friction Matrix (System Users Edit Architecture)

To eliminate administrative Multi-Factor Authentication (MFA) fatigue while strictly enforcing the CIA Triad (Confidentiality, Integrity, and Availability), modifications to system accounts follow an explicit security gradient:

### 7. Tiered Security Matrix: Self-Service vs. Administrative Authority

```
+------------------------------------+-----------------------------------+---------------------------+
| Operation Type                     | Friction Level                    | Security & Audit Action   |
+------------------------------------+-----------------------------------+---------------------------+
| Self-Service Email Mutation        | STEP-UP OTP REQUIRED              | Target-Value Quarantine   |
| (User in Settings > Profile)       | (SecurityOtpModal.tsx)            | Panic Kill-Switch in Mail |
+------------------------------------+-----------------------------------+---------------------------+
| Self-Service Password Mutation     | STEP-UP OTP REQUIRED              | Staged Bcrypt Hash in DB  |
| (User in Settings > Password)      | (SecurityOtpModal.tsx)            | Panic Kill-Switch in Mail |
+------------------------------------+-----------------------------------+---------------------------+
| Super Admin Profile & Role Update  | ZERO OTP FRICTION                 | Direct DB Commit          |
| (Admin in System Users > Edit)     | (Administrative Velocity)         | USER_ROLE_MUTATED Diff    |
+------------------------------------+-----------------------------------+---------------------------+
| Super Admin Password Override      | ZERO OTP FRICTION                 | Direct DB Password Commit |
| (Admin in System Users > Edit)     | (Administrative Velocity)         | USER_CREDENTIALS_OVERRIDDEN|
+------------------------------------+-----------------------------------+---------------------------+
| Super Admin Unlocking Account      | ZERO OTP FRICTION                 | Direct DB State Reset     |
| (Admin in System Users > Edit)     | (Self-Contained SecOps Action)    | Fresh OTP to User Inbox   |
+------------------------------------+-----------------------------------+---------------------------+
```

### 7.1 Separation of Concerns: Self-Service vs Administrative Override
1. **Self-Service Hygiene (`/settings/profile` & `/settings/password`)**:
   - Designed for the authenticated user to manage their own profile and credentials.
   - Any sensitive change (email modification or password update) triggers an automated **Step-Up Verification Dialog** demanding the 6-digit cryptographic OTP dispatched to their verified inbox.
   - If an unauthorized actor gains access to a session, the real user receives the security mail containing the **Emergency Panic Link** (*"Lock My Account"*), instantly purging sessions and freezing the account.
2. **Administrative Override (`/admin/system-users/{id}/edit`)**:
   - Designed for the **Super Administrator** to manage personnel, assign jurisdictions, and restore access for locked-out staff.
   - Executes via **Direct Commit (Zero OTP Friction)** to eliminate administrative slowdowns during in-person desk requests and account recoveries.
   - Every mutation is recorded in `audit_logs` (`USER_ROLE_MUTATED` or `USER_CREDENTIALS_OVERRIDDEN`) capturing the Admin ID, Target User ID, IP address, user agent, and an exact before-and-after diff.

### 7.2 Attack Surface Reduction (Removed Dead Endpoints)
- **Purged Fortify 2FA Routes**: Disabled `Features::twoFactorAuthentication()` in `config/fortify.php` and deleted dead endpoints (`settings/two-factor`).
- **Eliminated Account Self-Deletion**: Removed `DELETE /settings/profile` route and `<DeleteUser />` component from self-service settings to preserve LGU blotter audit trails and prevent accidental deletion of official personnel.

### 7.3 Structured Audit Log Diff Payloads
Every modification commits an atomic record into `audit_logs`:
- **Role & Profile Mutations**:
  ```json
  {
    "action": "USER_ROLE_MUTATED",
    "old_values": { "name": "Maria Santos", "role": "head", "organization_id": null },
    "new_values": { "name": "Maria Santos", "role": "president", "organization_id": 4 }
  }
  ```
- **Credential Mutations**:
  ```json
  {
    "action": "USER_CREDENTIALS_MUTATED",
    "old_values": { "email": "old_officer@gmail.com", "role": "head", "password_overridden": false },
    "new_values": { "email": "new_officer@pasay.gov.ph", "role": "admin", "password_overridden": true }
  }
  ```

---

## 8. Cryptographic Standards Summary

- **Hashing Engine:** SHA-256 HMAC utilizing `config('app.key')` as the secret salt.
- **Comparison Engine:** PHP `hash_equals()` ensuring timing-attack resistance ($O(1)$ constant time).
- **Password Storage:** Bcrypt with cost factor 12.
- **Database Backup Encryption:** AES-256-CBC with HMAC-SHA256 signature verification.
- **Entropy:**
  - 6-digit numeric OTPs: `random_int(100000, 999999)`
  - Panic Tokens: 64-character cryptographic strings (`Str::random(64)`)
  - Provisional Passwords: 64-character cryptographic strings (`Str::random(64)`)

