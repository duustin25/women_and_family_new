# 🌟 GAD Module: Features Specification

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Gender and Development (GAD) Module

---

## 📋 1. Core Feature Matrix

| Feature Category | Sub-Feature | Functional Description | Authorized Role |
| :--- | :--- | :--- | :--- |
| **Event Calendar** | Public Interactive Calendar | Grid and list view displaying community seminars, livelihood training, and women's month activities. | Public, Citizen |
| | Multi-Parameter Search & Filter | Filter by keyword, event month, venue, and approval status (`pending`, `approved`, `rejected`). | Staff, Admin |
| **Event Intake** | Admin Fast-Track Intake | Admin-created events are instantly marked `approved` and published immediately to the public calendar. | Admin, GAD Head |
| | Org Proposal Submission | Organization presidents submit event proposals including target attendees, rationale, and date/time. | Org Head |
| | Media & Banner Upload | Uploads high-resolution promotional posters (`image_path`) stored in public storage disk. | Staff, Admin |
| **Review Workflow** | Formal Decision State Machine | GAD Head can Approve, Reject (with mandatory explanation), or Request Reschedule. | GAD Head, Admin |
| | Reschedule Negotiation | Communicates required date/time changes back to the submitting organization. | GAD Head |
| **Automated Alerts** | Bulk Email Dispatch (`SendBulkGadEventEmail`) | Upon approval, dispatches background queue job notifying verified members of related organizations. | System (Queue) |
| | Email Timeout Protection | Implements batch chunking (`set_time_limit`) preventing PHP script timeout under `QUEUE_CONNECTION=sync`. | System |
| **GAD Analytics** | Annual GAD Program Radar | Tracks total activities executed per year against DILG GAD Plan targets. | GAD Head, Admin |
| | Sector Participation Metrics | Analyzes outreach density across vulnerable sectors (Solo Parents, PWD, Senior Citizens). | GAD Head, Kagawad |

---

## 🔍 2. Detailed Functional Breakdown

### 2.1 Fast-Track vs. Organization Approval Pipeline
- **Admin/GAD Head Channel:** When an administrator or Kagawad creates a GAD event directly in `/admin/gad-events`, the system bypasses the pending queue and sets `status = 'approved'`.
- **Community Organization Channel:** When an accredited group (e.g. *KALIPI Barangay 183 Chapter*) submits a workshop proposal, the event enters `status = 'pending'`.
- **Review Dialog:** The GAD Head reviews the event and selects:
  - **Approve:** Publishes event and enqueues bulk resident notification.
  - **Reject:** Prompts for mandatory `reject_reason` text displayed in the organization portal.
  - **Request Reschedule:** Flags event as `reschedule_requested` allowing the proponent to propose an alternate slot.

### 2.2 Asynchronous Email Dispatch & Timeout Defense
- Sending emails to hundreds of barangay organization members can easily exceed PHP's default 30-second execution time limit.
- **Queue Architecture:**
  - The controller dispatches `SendBulkGadEventEmail::dispatch($event)`.
  - The job processes recipients in chunks of 50.
  - In environments with `QUEUE_CONNECTION=sync`, the job incorporates `set_time_limit(0)` and individual try-catch blocks to ensure that a single malformed email address does not halt the entire notification broadcast.

### 2.3 Sectoral Demographics Alignment
- Every GAD program is mapped to relevant accredited community sectors.
- When generating quarterly GAD reports for the Department of the Interior and Local Government (DILG) and Philippine Commission on Women (PCW), the system cross-references approved event attendee counts with accredited organization registries.
