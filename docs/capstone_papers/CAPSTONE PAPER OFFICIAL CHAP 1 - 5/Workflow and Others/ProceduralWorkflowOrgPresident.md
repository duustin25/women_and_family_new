# Organization President Procedural Workflow
## Barangay Women and Family Protection System (WFPS)

This document formalizes the exact procedural workflow of the **Organization Head / President (Org President)** as illustrated in `ProceduralWorkflowOrgPresident.png`.

---

### 1. Procedural Workflow Diagram (Mermaid Flowchart)

```mermaid
flowchart TD
    Start([Start]) --> Login[/Organization Head Login/]
    Login --> Auth[Authenticate User]
    Auth --> IsAuth{Authorized?}

    IsAuth -- No --> Err[Display Login Error]
    Err --> Login

    IsAuth -- Yes --> Dash[Display Organization Dashboard]
    Dash --> SelMod{Select Module}

    %% Branch 1: Organization Management
    SelMod --> OrgMod{Organization Management}
    OrgMod --> OrgView[/View Organization Information/]
    OrgView --> OrgUpdate{Update Organization Information}
    OrgUpdate --> OrgSave[Save]
    OrgSave --> OrgDB[(Organization Database)]

    %% Branch 2: Membership Management
    SelMod --> MemMod{Membership Management}
    MemMod --> MemView[/View Membership Applications/]
    MemView --> MemReview[Review Applicant Information]
    MemReview --> MemApprove{Approved?}
    MemApprove -- Yes --> MemUpdate[Update Membership Status]
    MemUpdate --> MemNotify[Send Membership Notification]
    MemNotify --> MemDB[(Membership Database)]
    MemApprove -- No --> MemReject[Send Rejected Application]

    %% Branch 3: Programs & Seminars
    SelMod --> ProgMod{Programs & Seminars}
    ProgMod --> ProgView{View Programs Seminars}
    ProgView --> ProgDisp[/Display Programs/Seminars/]

    ProgMod --> ProgCreate{Create Programs & Seminars}
    ProgCreate --> ProgInput1[/Input Program Details/]
    ProgInput1 --> ProgSave1[Save]
    ProgSave1 --> ProgDB[(Programs Database)]

    ProgMod --> ProgUpd{Update Program Information}
    ProgUpd --> ProgInput2[/Input Program Details/]
    ProgInput2 --> ProgSave1

    ProgMod --> ProgMon{Monitor Program Participation}
    ProgMon --> ProgDispPart[/Display Program Participations/]

    %% Branch 4: Reports & Analytics
    SelMod --> RepMod{Reports & Analytics}
    RepMod --> RepDisp[/Display Organization Analytics/]

    %% Termination
    OrgDB --> End([End])
    MemDB --> End
    MemReject --> End
    ProgDisp --> End
    ProgDB --> End
    ProgDispPart --> End
    RepDisp --> End
```

---

### 2. Procedural Steps Summary

1. **Authentication**: Organization Head logs in -> System authenticates -> Displays Organization Dashboard.
2. **Organization Management**: View organization profile -> Edit charter, mission, vision, and requirements -> Save updates to Organization Database.
3. **Membership Management**: View applicant list -> Review submitted information -> Decision:
   - Approved: Update status to active -> Dispatch membership notification -> Save to Membership Database.
   - Rejected: Dispatch rejection notice with remarks.
4. **Programs & Seminars**:
   - View / Display existing programs and seminars.
   - Create new program/seminar proposals -> Input details -> Save to Programs Database.
   - Update existing program information -> Save to Programs Database.
   - Monitor participant attendance and engagement records.
5. **Reports & Analytics**:
   - View sector-specific analytics (demographics, membership growth, participation rates).