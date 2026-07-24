# WFP Barangay Management System: Use Case Testing Documentation

This document contains the detailed system actor analysis and the Use Case Testing matrices for the WFP Barangay Management System, structured by user role to align with Chapter 5 (System Testing, Implementation, and Evaluation) of Philippine Capstone 2 standards.

---

## 1. System Actors (User Roles) Analysis

The WFP Barangay Management System comprises four (4) distinct user roles (system actors), each with specific levels of system access and permission scopes:

1. **ADMINISTRATOR (Admin / Punong Barangay):**
   * **Permissions:** Has root-level access to the administrative dashboard. Can create, edit, archive, and restore system user accounts (e.g., creating credentials for Committee Heads and Organization Presidents). Handles global configuration changes (case abuse types, zone assignments) and security audits (viewing and exporting immutable audit logs). Can view overall analytics.
   * **Scope:** Universal Administrative access.

2. **SECRETARY / COMMITTEE HEAD (VAW Desk Officer / Barangay Nutrition Scholar / Staff):**
   * **Permissions:** Restricted to social work case management. Has full control over the **VAWC Module** (case intake, risk scoring assessments, BPO lifecycle, PNP transmittals) and the **BCPC Nutrition Module** (registering child profiles, weighing inputs, WHO Z-score diagnostics).
   * **Scope:** Excluded from user account settings, settings customization, and database system audit files.

3. **ORGANIZATION PRESIDENT (President):**
   * **Permissions:** Restricted to the management of their specific accredited barangay organization (e.g., KALIPI, Senior Citizens Association). Can encode member applications, view active member rosters, and submit GAD Event proposals for approval.
   * **Scope:** Only allowed access to organizational records tied directly to their assigned `organization_id`. Cannot access VAWC or BCPC database records.

4. **PUBLIC CITIZEN / RESIDENT:**
   * **Permissions:** Accesses frontend pages without credentials. Can view published announcements, browse active organizations, query **The Sentinel AI Chatbot** for legal information or dynamic database mapping, register for GAD events, and submit dynamic online membership applications with attachments.
   * **Scope:** Public-facing modules only.

---

## 2. Use Case Testing Matrices

The tables below document the testing scenarios, input values, actions, expected behavior, and interface layouts executed by each system actor, covering 100% of the system tabs (Dashboard, System Users, Settings, VAWC Cases, BCPC Cases, Applications, GAD Events, Announcements, Officials, Members list, and Audit Logs).

---

### TABLE 1: USE CASE TESTING FOR USER: ADMINISTRATOR

| Test Case ID | Test Case Title | Actions | Expected Output | Actual Output | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_ADMIN_1** | Login with valid credentials | Go to `/login`, input valid username and password, click "Sign In". | Authenticated successfully; session token is established; redirects to dashboard. | Renders admin dashboard layout containing primary metrics (active cases, alerts) and side nav. | **PASSED** |
| **TC_ADMIN_2** | Block unauthorized login | Go to `/login`, input valid email but incorrect password. | Access blocked. System displays validation message: "These credentials do not match our records." | Stays on login page; displays red validation alert; session is blocked. | **PASSED** |
| **TC_ADMIN_3** | Session Timeout / Auto-logout | Idle the session past timeout window or click "Log Out" in sidebar. | Destroys current token and session variables; redirects user to `/login`. | Returns to login screen; blocks user from back-button navigation. | **PASSED** |
| **TC_ADMIN_4** | Archive System User Account | Admin logs in, clicks "Archive User" beside a staff account name. | Role token is disabled; status set to archived; user cannot authenticate. | User list updates; account is moved to archive folder; user receives error on login. | **PASSED** |
| **TC_ADMIN_5** | Restore System User Account | Admin goes to Archives list, clicks "Restore" beside user. | Restores database record status; enables role token; restores login access. | Account returns to active users list; login access is restored. | **PASSED** |
| **TC_ADMIN_6** | Verify Immutable Audit Log | Register a new measurement (weight/height) for a child; log in as Admin, view `Audit Logs` page. | Log record is created; details the User ID, action (Created), and the logged measurement values. | Displays log: "Created BcpcAssessment (ID: ...)" along with recorded weight, height, and IP address. | **PASSED** |
| **TC_ADMIN_7** | Review and Approve GAD Event | Admin reviews proposed GAD event details, clicks "Approve". | Proposal state updates to "Approved"; GAD event is verified and published to the public calendar. | Status updates to Approved; event is published on public feed; invitation email job is queued. | **PASSED** |
| **TC_ADMIN_8** | Approve Organization Application | Admin logs in, reviews application, clicks "Approve". | Status changes to "Approved"; email dispatch job is added to the database queue. | Status changes to Approved; email dispatch is offloaded to background queue without lag. | **PASSED** |
| **TC_ADMIN_9** | Configure Barangay Settings (Zones) | Admin navigates to Settings tab, clicks "Add Zone", inputs Zone Name and description. | Database saves Zone configuration details successfully. | Settings view refreshes and displays the new Zone/Purok in the listings table. | **PASSED** |
| **TC_ADMIN_10** | Configure Case Abuse Types | Admin navigates to Settings tab, clicks "Add Abuse Type", inputs name and legal code. | Database registers the new category (e.g., Economic Abuse) for case reports. | Adds category option to the VAWC Case filing intake form. | **PASSED** |
| **TC_ADMIN_11** | Create Barangay Announcement | Admin goes to Announcements tab, inputs Title, Content, and saves. | Save checks pass; announcement details recorded; event published on frontpage. | Renders new announcement card in the admin panel and public landing news feed. | **PASSED** |
| **TC_ADMIN_12** | Manage Barangay Officials | Admin goes to Officials tab, registers a new official, assigns order index. | Saves the new official profile and displays them in the layout order. | Updates the barangay organizational chart dynamically in the web views. | **PASSED** |
| **TC_ADMIN_13** | Trigger Bulk Email Dispatch | Admin goes to Members tab, selects a group, clicks "Send Bulk Email", inputs body text. | Queues email dispatch jobs in the background table; returns immediate success toast. | System continues running without lag; emails are sent asynchronously via SMTP. | **PASSED** |

> **User Summary:** This module validates administrator activities. The administrator manages system-wide accounts, verifies background queues, audits database transactions via immutable logs, manages local configurations (Abuse types, Zones), and updates public listings (Announcements, Officials).

---

### TABLE 2: USE CASE TESTING FOR USER: SECRETARY (COMMITTEE HEAD)

| Test Case ID | Test Case Title | Actions | Expected Output | Actual Output | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_SEC_1** | File VAWC Case Intake | Fill out Pink Form intake fields (demographics, incident description) and submit. | Intake data validation checks pass; database saves case under unique ID. | Saves case; updates list view showing case state as "Pending Assessment". | **PASSED** |
| **TC_SEC_2** | Execute RAVE Triage (Low Risk) | Fill out risk checklist: repeat offense = false, weapon used = false. Click "Calculate Risk". | RAVE algorithm computes risk level as "Low Risk" (Score: 1-4). BPO prompt is disabled. | System flags case as Low Risk; options to apply for a BPO are hidden. | **PASSED** |
| **TC_SEC_3** | Execute RAVE Triage (Critical) | Fill out checklist: repeat offense = true, weapon used = true, threats made = true. Click "Calculate". | RAVE algorithm computes severity score (9-12), flagging case as "Critical Risk" and enabling BPO options. | Flags case as Critical Risk; highlights case in red on dashboard; displays active BPO prompt. | **PASSED** |
| **TC_SEC_4** | Issue BPO with 15-day SLA | Select Critical Case, click "Issue BPO", verify expiration date. | Database updates BPO status to Active; sets BPO expiration date to precisely Current Date + 15 Days. | Sets case status to "BPO Processing"; once served, displays a dynamic 15-day validity countdown alert showing remaining days in the monitoring panel. | **PASSED** |
| **TC_SEC_5** | Escalate Case on Violation | In an active BPO case, click "Escalate Case". | Updates BPO status to "Violated"; automatically generates PNP Transmittal and Court Complaint files. | Generates printable PNP referral forms populated with details of the victim and offender. | **PASSED** |
| **TC_SEC_6** | Register Child Profile | Input child's name, gender, birthdate, and parents' details. | Profiles checks pass; child registered; age in months is automatically calculated. | Displays child profile card with birth details and exact computed age in months. | **PASSED** |
| **TC_SEC_7** | Input Assessment (Normal) | Input child's age (e.g. 12 Mos), gender, and weight (9.8kg). Click "Calculate Z-Score". | System compares weight against WHO dataset; classifies weight-for-age status as "Normal". | Record is saved; status is flagged in green as "Normal". | **PASSED** |
| **TC_SEC_8** | Input Assessment (SAM) | Input child's age (e.g. 24 Mos), gender, and weight (8.5kg). Click "Calculate Z-Score". | Z-score maps below -3 standard deviations; status flagged as "Severe Acute Malnutrition". | Status flagged in red as "SAM"; triggers referral details modal. | **PASSED** |
| **TC_SEC_9** | Log Nutritional Intervention | Click "Add Intervention Logs", type feeding schedules and supplements, click save. | Intervention details are saved as a JSON array under the assessment record. | Displays updated intervention timeline on the child's dashboard view. | **PASSED** |
| **TC_SEC_10** | Tag GAD Beneficiary | Secretary navigates to Members tab, clicks "Tag for Benefit" on a resident, enters entitlement name, and clicks "Generate & Notify". | System generates a Reference Code (e.g. `BRGY-F3K8H2A9J1`), records a pending dispatch, and queues email notification. | Reference ID created; dispatch logged under member; email sent. | **PASSED** |
| **TC_SEC_11** | Claim GAD Benefit | Secretary toggles "Pending Claims Only" or searches by GAD Reference Code, and clicks the green checkmark "Claim" action button on the resident's table row. | Filters match pending codes; table row displays pulsing "Pending Claim" badge; clicking the claim button updates the status to "Claimed" automatically. | Row filter matches; pulsing badge renders; checkmark click marks benefit claimed instantly. | **PASSED** |

> **User Summary:** This module validates Secretary and Committee Head activities (VAW Desk Officers and Nutrition Scholars). It covers filing VAWC cases, executing the 1-12 RAVE scoring triage, monitoring BPO SLAs, registering child profiles, running WHO growth chart calculations, and tagging/claiming GAD event benefits.

---

### TABLE 3: USE CASE TESTING FOR USER: PRESIDENT (ORGANIZATION PRESIDENT)

| Test Case ID | Test Case Title | Actions | Expected Output | Actual Output | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_PRES_1** | RBAC Case Access Restriction | Authenticate as `president` and try to manually enter `/admin/vawc/cases` in address bar. | Route middleware detects insufficient role authorization; redirects with 403 error. | Renders HTTP 403 Forbidden page, blocking the president from case details. | **PASSED** |
| **TC_PRES_2** | Create GAD Event Proposal | Organization President fills out event title, proposal details (date, time, location), and submits. | Proposal saved; status set to "Pending"; notification broadcast to system Admin. | Proposal appears in admin review list; president receives pending status indicator. | **PASSED** |
| **TC_PRES_3** | Export Member Roster | Admin/President clicks "Export Members". | Formats and generates a CSV/XLSX spreadsheet with active members. | Initiates download of member list sheet matching the current organization. | **PASSED** |

> **User Summary:** This module validates Organization President activities. Presidents are restricted to managing their own organization records (exporting members rosters, proposing events) and are blocked by RBAC middleware from accessing sensitive social work modules.

---

### TABLE 4: USE CASE TESTING FOR USER: PUBLIC CITIZEN (RESIDENT)

| Test Case ID | Test Case Title | Actions | Expected Output | Actual Output | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_CIT_1** | Submit Online Application | Select organization, fill in details (name, email), attach ID copy, click "Apply". | Files uploaded; application recorded in database; validation rules pass. | Displays confirmation screen: "Application submitted for review." | **PASSED** |
| **TC_CIT_2** | Duplicate Application Check | Try to submit another application for the same name and organization. | Blocks application; returns error: "An active application already exists for this name." | Form stays editable; displays red validation message under the name input. | **PASSED** |
| **TC_CIT_3** | View GAD Calendar | Resident navigates to GAD page (/gad) to view upcoming barangay programs. | System pulls and displays all approved GAD events with event details. | Renders GAD Events page showing dates, descriptions, and sponsoring groups. | **PASSED** |
| **TC_CIT_4** | Chatbot Greeting | Type: "Kamusta bot?" in Chatbot window and submit. | NLP pre-processor tokenizes input; MLP classifier returns greeting intent. | Chatbot replies with welcome greeting and displays initial options chips. | **PASSED** |
| **TC_CIT_5** | Chatbot Announcements Lookup | Type: "May balita ba?" or click "Latest Announcements". | AI returns tag `ACTION_FETCH_ANNOUNCEMENTS`; Laravel pulls active announcements. | Displays the three latest announcements fetched from database with date links. | **PASSED** |
| **TC_CIT_6** | Chatbot Intent Disambiguation | Type: "Nais kong magreport". | AI returns tag `ACTION_DISAMBIGUATE_REPORT` for vague inputs. | Chatbot responds: "Report for VAWC or BCPC?" and displays selection chips. | **PASSED** |
| **TC_CIT_7** | Chatbot Out-of-Scope Filter | Type: "Paano magluto ng adobo?". | Prediction falls below the 0.25 threshold; triggers fallback response. | Chatbot responds: "I apologize, I do not understand that yet. Can you rephrase?" | **PASSED** |

> **User Summary:** This module validates Resident/Citizen activities on the public interface. Standard residents can apply to organizations, register for community events, and interact with the NLP AI Chatbot to obtain barangay resources.
