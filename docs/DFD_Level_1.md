# Finalized System DFD Level 1 (Digitalization) - Women and Family Portal

## Context
The **Women and Family Portal** is a comprehensive system connecting public citizens with local government services (VAWC/BCPC protection) and community organizations (KALIPI, Solo Parents). It features distinct roles for Administrators, Committee Heads, and Organization Presidents.

## Data Flow Diagram (Level 1)

```mermaid
graph TD
    %% Entities / Actors
    Public[Public User / Citizen]
    Admin[Admin / Local Authority]
    Head[Committee Head (VAWC/BCPC)]
    Pres[Org President (e.g. KALIPI)]

    %% Processes
    P0[0.0 Authentication (Login)]
    P1[1.0 Case Digitalization]
    P2[2.0 Membership Management]
    P3[3.0 Organization Mgmt]
    P4[4.0 Content & Information]
    P5[5.0 GAD Management]
    P6[6.0 Analytics & Reports]
    P7[7.0 Settings & Users]

    %% Data Stores
    D1[(D1 Users DB)]
    D2[(D2 Case Reports DB)]
    D3[(D3 Applications DB)]
    D4[(D4 Organizations DB)]
    D5[(D5 Content DB)]
    D6[(D6 GAD Activities DB)]
    D7[(D7 Settings/Audit DB)]

    %% --- FLOWS ---

    %% 0.0 Authentication
    Admin & Head & Pres -->|Credentials| P0
    P0 -.->|Verify User| D1
    P0 -->|Session/Token| Admin & Head & Pres

    %% 1.0 Case Digitalization (VAWC / BCPC)
    %% Admin and Head encode manual reports
    Admin & Head -->|Digitize Manual Report| P1
    Admin & Head -->|Update Status/Referral| P1
    P1 -->|Store Digital Record| D2
    D2 -.->|Fetch Case History| P1

    %% 2.0 Membership Management
    %% Public applies, President/Admin reviews
    Public -->|Submit Application| P2
    P2 -->|Save App| D3
    D3 -.->|Fetch App| P2
    Pres -->|Review Own Org Apps| P2
    Admin -->|Review All Apps| P2
    P2 -->|Status Update| D3

    %% 3.0 Organization Management
    %% Admin creates, President edits own
    Admin -->|Create, Delete Orgs| P3
    Pres -->|Update Own Org Profile| P3
    P3 -->|Org Data| D4
    D4 -.->|Read Org| P3

    %% 4.0 Content & Information (Public Services)
    %% Admin posts, Public views
    Admin -->|Post Announcements/Laws| P4
    P4 -->|Save Content| D5
    D5 -.->|Read Content| P4
    Public -->|View Info, Chatbot Query| P4
    P4 -->|Info/Response| Public

    %% 5.0 GAD Management
    %% Admin manages budget/activities
    Admin -->|Plan Activities, Track Budget| P5
    P5 -->|Activity Data| D6
    D6 -.->|Read Activity| P5

    %% 6.0 Analytics
    %% Admin and Head view stats
    Admin & Head -->|Request Stats| P6
    D2 & D3 & D6 -.->|Aggregate Data| P6
    P6 -->|Visual Charts| Admin & Head
    
    %% 7.0 Settings & Users (System Admin)
    Admin -->|Manage Accounts, Audit Logs| P7
    P7 -->|Update Users/Settings| D1 & D7
    D7 -.->|Read Logs| P7

```

## Detailed Process Descriptions

### 0.0 Authentication (Login)
*   **Actors:** Admin, Committee Head, Org President
*   **Description:** Validates credentials against the `Users` database. Public users do not need to log in for their primary actions (Applying, Viewing).
*   **Input:** Email, Password.
*   **Output:** Authenticated Session (Role-Based Access).

### 1.0 Case Management (VAWC / BCPC)
*   **Actors:** Admin, Committee Head (VAWC Officer)
*   **Description:** The core protection module. Allows authorized personnel to File, Update, and Track the status of VAWC and BCPC cases.
    *   **Admin:** Full access to all cases.
    *   **Head:** Focuses on processing and updating active cases (e.g., issuing BPO, referring to PNP).
*   **Data Store:** D2 Case Reports (Separate logic for VAWC `vawc_reports` and BCPC `bcpc_reports` models).

### 2.0 Membership Management
*   **Actors:** Public User, Org President, Admin
*   **Description:** Handles the workflow for residents joining community organizations.
    *   **Public User:** Fills out dynamic forms ("Apply Now") for specific organizations.
    *   **Org President:** Reviews applications specifically for *their* organization (e.g., KALIPI President only sees KALIPI applicants). Can Approve/Disapprove.
    *   **Admin:** Can oversee and review all applications across all organizations.
*   **Data Store:** D3 Applications (`membership_applications`).

### 3.0 Organization Management
*   **Actors:** Admin, Org President
*   **Description:** Managing the profiles of the organizations themselves.
    *   **Admin:** Creates new organizations in the system, deletes old ones.
    *   **Org President:** Can edit their own organization's profile (Description, Logo, Requirements) but *cannot* create new organizations.
*   **Data Store:** D4 Organizations (`organizations`).

### 4.0 Content & Information Services
*   **Actors:** Admin, Public User
*   **Description:** The public face of the portal.
    *   **Admin:** Publishes Announcements, updates Directory of Officials, and manages Laws/Guidelines content.
    *   **Public User:** Consumes this information. Includes the **AI Chatbot** interaction which queries system knowledge to answer user questions.
*   **Data Store:** D5 Content (`announcements`, `barangay_officials`, `laws`).

### 5.0 GAD Management
*   **Actors:** Admin
*   **Description:** Tracks Gender and Development (GAD) activities and budget utilization.
*   **Data Store:** D6 GAD Activities (`gad_activities`).

### 6.0 Analytics & Reporting
*   **Actors:** Admin, Committee Head
*   **Description:** Generates visual reports (bar/pie charts) for decision making.
    *   **Case Analytics:** Abuse rates, hotspots (Used by Admin & Head).
    *   **GAD Analytics:** Budget expenditure (Used by Admin).
*   **Data Sources:** Aggregates from D2 (Cases) and D6 (GAD).

### 7.0 Settings & User Management
*   **Actors:** Admin
*   **Description:** System-level configuration.
    *   Creating new System User accounts (e.g. appointing a new Head or President).
    *   Managing generic settings (Abuse Types, Ongoing Status options).
    *   Viewing Audit Logs for security.
*   **Data Store:** D1 Users (`users`), D7 Settings (`audit_logs`, `abuse_types`, etc).
