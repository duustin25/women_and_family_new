# Barangay 183 Women & Family Organization Management System
## Client User Guide & Administrative Manual

Welcome to the **Barangay 183 Women & Family Organization Management System**! This comprehensive guide walks you through every aspect of using the administrative panel and public portal to manage your community organizations, application pipelines, nutritional tracking (BCPC), and secure risk assessments (VAWC).

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Accessing and Navigating the Dashboard](#2-accessing-and-navigating-the-dashboard)
3. [Managing Organizations and Membership Settings](#3-managing-organizations-and-membership-settings)
4. [Designing Custom Application Forms (Form Builder)](#4-designing-custom-application-forms-form-builder)
5. [Customizing Print Layouts and Approval Signatures](#5-customizing-print-layouts-and-approval-signatures)
6. [Processing Membership Applications](#6-processing-membership-applications)
7. [Managing Members & Directory Filters](#7-managing-members--directory-filters)
8. [BCPC Child Nutrition Monitoring](#8-bcpc-child-nutrition-monitoring)
9. [VAWC Secure Case Management](#9-vawc-secure-case-management)
10. [Troubleshooting & Support FAQ](#10-troubleshooting--support-faq)

---

## 1. System Overview

The Barangay 183 Women & Family Organization Management System is a dual-portal application designed to digitize local community workflows:
- **Public Portal**: Allows local residents to view registered barangay organizations (e.g. KALIPI, ERPAT, VCO, Solo Parents, KABAHAGI), fill out customized registration questionnaires, upload required files, and print their filled-out application sheets.
- **Admin Portal**: Allows Barangay Officials, Committee Chairs, and Organization Presidents to define form structures, adjust header/footer print settings, review submissions, and manage BCPC/VAWC casework securely.

---

## 2. Accessing and Navigating the Dashboard

### User Roles & Permissions
The system utilizes three distinct roles:
1. **System Administrator (Admin)**: Full access to BCPC, VAWC, form configurations, print layouts, user management, and global reports.
2. **Committee Head / Officer (Head)**: Dedicated caseworker access to review/action incoming membership applications, add monitoring reports, and track BCPC/VAWC caseloads.
3. **Organization President (President)**: Specific management access restricted to their own organization (e.g., KALIPI President only manages KALIPI members).

### Login Credentials
To log in, navigate to your site's admin URL and enter your registered email and password.
* *Default Administrator Email:* `admin@gmail.com`
* *Default Administrator Password:* `password`

---

## 3. Managing Organizations and Membership Settings

To manage local organizations:
1. Navigate to **Organizations** in the Admin Sidebar.
2. Click **Create Organization** or select an existing organization to edit.
3. Define the core organization attributes:
   - **Name**: The official name (e.g. `KALIPI (Women)`).
   - **Slug**: Automatically generated URL-friendly identifier.
   - **Description**: High-level summary shown on the public portal.
   - **Requirements**: Define required documents (e.g. `Barangay Clearance`, `Valid ID`) which residents must upload during application.

---

## 4. Designing Custom Application Forms (Form Builder)

You can match any physical application layout exactly by editing an organization's form schema.

### Adding & Editing Fields
Under the **Form Schema Builder** tab on the Organization edit page:
- **Core Fields**: `Full Name`, `Address`, and `Email` are locked by default to ensure database consistency. They cannot be renamed or deleted.
- **Section Headers**: Use the `Section` field type to group fields into clean, visual panels.
- **Paragraph Blocks**: Use the `Paragraph` field type to add legal disclosures, confidentiality waivers, and instructions.
- **Checkbox & Radio Groups**: Define pick-lists for sectoral categories or marital status.
  - *Write-in Support*: To add a write-in line (e.g. `Others (specify):`), simply add `(specify)` or `(indicate)` inside the option label (e.g., `Others (specify)`). The form renderer will automatically append an underline on printed sheets and show an interactive text box when selected in the web browser.
- **Table Grids**: Use the `Table` field type for structured, tabular data (like **Family Composition**). You can define column headers and specify column types (Text, Number, Date).
- **Repeater lists**: Use the `Repeater` field type for unbounded list rows (like **Seminars Attended**). Users can click `+ Add Entry` to append rows.

---

## 5. Customizing Print Layouts and Approval Signatures

Barangay 183 requires highly specific signature configurations matching their official printed documents. The **Print Settings Builder** handles this with pixel-perfect control.

### Layout Customization
On the **Print Settings** tab:
1. **Form Document Title**: Customize the sheet title (e.g. `APPLICATION`, `REGISTRATION FORM`, `MEMBERSHIP SHEET`).
2. **Alignment & Headers**: Toggle PASAY CITY / BARANGAY 183 header seals on or off. Select left-aligned or center-aligned layouts.
3. **Logos**: Upload left and right header logos (such as PASAY seal and Barangay crest).

### Building the Approval Signature Chain
At the bottom of the Print Settings tab, click **+ Add New Signature Row** to define your official signatories:
- Each row can contain up to 4 columns.
- **Header Note**: Text printed above the line (e.g., *Noted by:*, *Recommending Approval:*).
- **Name Placeholder**: The signatory name.
  - *Dynamic Placeholders*: Use `{applicant_name}` or `{president_name}` to automatically pull the actual applicant's name or the organization president's name onto the signature block.
- **Sub-Title / Role Name**: Under the line designation (e.g. `Committee Head, Women and Family`, `Chapter President`).

---

## 6. Processing Membership Applications

Once residents submit applications through the public page, they enter the processing pipeline.

### Steps to Review Submissions
1. Navigate to **Applications** in the Admin Sidebar.
2. Click **Review** on a pending application record.
3. In the **Active Data Questionnaire** section, you will see all submitted answers.
   - **Tables and Repeaters** are automatically parsed into beautiful interactive tables rather than raw JSON strings.
4. Review the uploaded files (Requirements section).
5. In the Action panel:
   - Select **Approve** (this automatically graduates the applicant to an active organization **Member**).
   - Select **Disapprove** and provide feedback remarks.

---

## 7. Managing Members & Directory Filters

After approval, members are stored in the secure **Members Directory**:
- Filter members by Organization, Purok zone, and active status.
- Bulk download member records as CSV/Excel or export list directories.
- Click **Print Membership Sheet** to load the custom print layout. Press `Ctrl + P` to print or save as PDF.

---

## 8. BCPC Child Nutrition Monitoring (NNC e-OPT Plus & RA 11037)

The BCPC (Barangay Council for the Protection of Children) panel monitors preschooler health, WHO z-scores, and the **120-Day Supplemental Feeding Program (SFP)** under **RA 11037** and **National Nutrition Council (NNC) Operation Timbang (OPT) Plus guidelines**.

1. Navigate to **BCPC Nutrition Monitoring** in the Admin Sidebar.
2. Click **Register Child** to enroll a preschooler aged **0 to 59 months**.
   - *Age-Out Lockout Rule*: Children aged 60 months (5 years) or older automatically age out of the barangay program, with a UI notice redirecting monitoring to the school sector.
3. Select their Purok zone, gender, birthdate, and guardian info (*with 1-click resident parent auto-fill*).
4. Click **Record New Measurement** to enter weight ($1.5-35.0\text{ kg}$) and height ($40.0-125.0\text{ cm}$) readings.
   - *Data Entry Sanity Check*: If an extreme biological outlier (beyond WHO $\pm 5\text{ SD}$) is entered, a confirmation prompt opens to request typo verification before saving.
5. The system automatically computes 3-axis WHO growth classifications with precision linear interpolation:
   - **WFA (Weight-for-Age)**: *Normal, Underweight, Severely Underweight (SAM), Overweight*
   - **HFA (Height-for-Age)**: *Normal, Stunted, Severely Stunted, Tall*
   - **WFL/H (Weight-for-Length/Height)**: *Normal, Wasted (MAM), Severely Wasted (SAM), Overweight, Obese*
6. **120-Day Supplemental Feeding Program (SFP)**: Malnourished children (SAM/MAM/Wasted) are automatically enrolled in the 120-day cycle with automated progress tracking at **Day 1**, **Day 30**, **Day 60**, **Day 90**, and **Day 120 (Final Graduation)**.
7. Click **Print OPT+ Masterlist** to generate official printable DOH/NNC masterlists and executive summary reports.

---

## 9. VAWC Secure Case Management

The VAWC (Violence Against Women and Children) module provides a highly secure, restricted workspace for tracking gender-based violence.

### Case Creation & Investigation
1. Navigate to **VAWC Cases** in the Admin Sidebar.
2. Click **New Case** to register a complaint.
3. Record victim details, perpetrator information, weapons involved, and immediate arrest details.

### RAVE Safety & Risk Assessment
To evaluate threat levels:
1. Complete the safety assessment checklist.
2. The system computes a weighted risk score:
   - **Low Risk (Score 1-4)**: Suggest internal counseling or community mediator follow-ups.
   - **Medium Risk (Score 5-8)**: Monitor BPO (Barangay Protection Order) compliance closely.
   - **High Risk (Score 9-12)**: Flags immediate referral to passive PNP (Police) escorts and medical assistance.

---

## 10. Troubleshooting & Support FAQ

#### Q: How can I change the President of an organization?
*Navigate to **Users** in the sidebar, select the user record representing the president, and re-assign them to the target Organization. Ensure their role is set to `President`.*

#### Q: The printed form cuts off. How do I fix the margins?
*Ensure your printer dialog settings have **Margins: None or Minimum** and **Background Graphics: Enabled**.*

#### Q: Why are my signature placeholders not showing?
*Double-check that you typed the placeholder exact lowercase keys: `{applicant_name}`, `{president_name}`, or `{organization_name}`.*

---

*Document Version: 1.0.0*  
*Prepared by Barangay 183 Capstone System Admin Team*  
