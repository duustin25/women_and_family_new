# 🔄 GAD Module: Operational Process & Workflows

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Gender and Development (GAD) Module

---

## 🚦 End-to-End Operational Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Proponent as Organization President / Proponent
    actor GAD_Head as GAD Committee Head / Admin
    actor Citizen as Barangay Resident / Member
    participant System as WFPIS GAD Engine
    participant Queue as Laravel Queue Worker

    Proponent->>System: 1. Submit Event Proposal (Title, Date, Venue, Poster)
    System->>System: 2. Set Status: PENDING
    System-->>GAD_Head: 3. Alert Pending Event in Admin Portal

    alt Approval Granted
        GAD_Head->>System: 4. Click 'Approve'
        System->>System: 5. Set Status: APPROVED & Publish to Public Calendar
        System->>Queue: 6. Enqueue SendBulkGadEventEmail
        Queue->>Citizen: 7. Dispatch Personalized Notification Email
    else Date/Venue Conflict
        GAD_Head->>System: 8. Request Reschedule with Feedback Note
        System->>Proponent: 9. Alert Proponent & Await New Date
    else Non-Compliant / Rejected
        GAD_Head->>System: 10. Click 'Reject' & Enter Mandatory Reason
        System->>Proponent: 11. Notify of Rejection with Rationale
    end

    Citizen->>System: 12. View Event on Public Interactive Calendar
    Proponent->>GAD_Head: 13. Execute Activity at Barangay Multipurpose Hall
    GAD_Head->>System: 14. Log Accomplishment in Annual GAD Report
```

---

## 📋 2. Step-by-Step Officer Procedures

### Workflow A: Direct Admin Event Creation (Fast-Track)
1. Navigate to `/admin/gad-events`.
2. Click **Create GAD Event**.
3. Enter title (e.g. *"Barangay 183 Women's Month Livelihood Seminar"*), description, date, start time, and venue.
4. Upload promotional poster banner (`.jpg` or `.png`, max 2MB).
5. Click **Publish Event**.
   - System sets `status = 'approved'` immediately.
   - Event appears in the citizen public calendar.
   - Asynchronous notification job is enqueued.

### Workflow B: Reviewing Community Organization Proposals
1. In `/admin/gad-events`, switch filter tab to **Pending**.
2. Click the action dropdown (`...`) on the pending event row.
3. Choose one of three options:
   - **Approve:** Opens confirmation dialog. Clicking confirm executes state change and starts email notifications.
   - **Request Reschedule:** Enter requested date adjustment notes (e.g., *"Barangay covered court is booked for vaccination drive on this date"*).
   - **Reject:** Enter statutory or policy rejection reason.
4. The system logs the reviewing officer's user ID in the audit trail.
