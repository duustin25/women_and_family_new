# 🏗️ GAD Module: System Architecture

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Gender and Development (GAD) Module

---

## 🏛️ 1. Layered Architecture & Asynchronous Event Processing

The GAD module integrates standard request-response operations with background asynchronous queue workers for citizen notifications.

```mermaid
flowchart TD
    subgraph ClientLayer ["1. Presentation Layer (React 19 + Inertia.js)"]
        UI_List["Index.tsx (Master Event Table & Calendar)"]
        UI_Modal["Event Creation & Edit Dialog"]
        UI_Decision["Status Action Modal (Approve / Reject / Reschedule)"]
    end

    subgraph TransportLayer ["2. Transport & Routing Layer"]
        InertiaRouter["Inertia Router (GET / POST / PUT / DELETE)"]
        AuthMiddleware["Middleware: auth + role:admin,head"]
        InertiaRouter --> AuthMiddleware
    end

    subgraph ControllerLayer ["3. Application Controller Layer"]
        GadCtrl["GadEventController.php"]
        AuthMiddleware --> GadCtrl
    end

    subgraph AsyncLayer ["4. Background Queue & Job Processing Layer"]
        EmailJob["SendBulkGadEventEmail.php (Laravel Job)"]
        MailWorker["Queue Worker (artisan queue:work)"]
        SMTP["SMTP Mail Transport (Gmail / Mailtrap / SES)"]
        
        GadCtrl -->|Dispatch on Approval| EmailJob
        EmailJob --> MailWorker
        MailWorker --> SMTP
    end

    subgraph ServiceLayer ["5. Domain Services & Analytics Layer"]
        Svc_GadAnalytics["GadAnalyticsService.php"]
        Svc_Audit["AuditLogger.php"]
        
        GadCtrl --> Svc_Audit
    end

    subgraph DatabaseLayer ["6. Relational Persistence Layer (MySQL 8.0)"]
        DB_GadEvents[("gad_events")]
        DB_Orgs[("organizations")]
        DB_Members[("membership_applications")]
        DB_Audit[("audit_logs")]

        GadCtrl --> DB_GadEvents
        Svc_GadAnalytics --> DB_GadEvents
        Svc_GadAnalytics --> DB_Orgs
        Svc_GadAnalytics --> DB_Members
        Svc_Audit --> DB_Audit
    end

    UI_List --> InertiaRouter
    UI_Modal --> InertiaRouter
    UI_Decision --> InertiaRouter
```

---

## 💾 2. Relational Database Schema

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ GAD_EVENTS : "proposes"
    ORGANIZATIONS ||--o{ MEMBERSHIP_APPLICATIONS : "enrolls"
    GAD_EVENTS ||--o{ AUDIT_LOGS : "logs status changes"

    ORGANIZATIONS {
        bigint id PK
        string name
        string slug UK
        text description
        string sector_category "women, solo_parent, senior, pwd, lgbtq"
        timestamps created_at
    }

    GAD_EVENTS {
        bigint id PK
        bigint organization_id FK "nullable (null for admin-created)"
        string title
        text description
        date event_date
        time event_time
        string location
        string image_path "nullable"
        string status "pending, approved, rejected, reschedule_requested"
        text reject_reason "nullable"
        timestamps created_at
        timestamps updated_at
    }

    MEMBERSHIP_APPLICATIONS {
        bigint id PK
        bigint organization_id FK
        string full_name
        string email
        string contact_number
        string status "pending, approved, rejected"
    }
```

---

## ⚙️ 3. Execution Pipeline & State Transitions

1. **Intake Evaluation:**
   - If user role is `admin` or `head`: `status` defaults to `approved`.
   - If user role is `organization_head`: `status` defaults to `pending`.
2. **Approval Hook:**
   - When transitioning from `pending` -> `approved`:
     ```php
     SendBulkGadEventEmail::dispatch($event);
     ```
   - Dispatches email alerts to all approved members belonging to the sponsoring organization.
3. **Analytics Aggregation:**
   - `GadAnalyticsService` queries `gad_events` by year and aggregates metrics across event statuses, linking them to sectoral membership counts in `membership_applications`.
