# 🛡️ Women and Family Protection Management System
### 📍 Barangay 183 Villamor, Pasay City

<div align="center">
  <img src="https://scontent.fmnl4-2.fna.fbcdn.net/v/t39.30808-6/500239037_671974392308023_7855615069596178046_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=TEverAfJPtEQ7kNvwE8HiAS&_nc_oc=AdkFDw3f60SaRrO1vx4gvZq3N_FhBM7xxajmw37QGbTwI3I3RGMwT2qweLZL3F9TCnyuueCg5CcLv-fBV0mkXwT6&_nc_zt=23&_nc_ht=scontent.fmnl4-2.fna&_nc_gid=kBfWXX5jJfGbK7n94FDcoQ&oh=00_Afu9Sq-2DlCsgDmFgP1-poo1HgzqMdyZ4-u2pslOJJq5-g&oe=698D45C7" width="100px" height="100px" />
  <img src="https://scontent.fmnl4-3.fna.fbcdn.net/v/t39.30808-6/316528967_473338041561875_6339995951810963287_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=UCo2j1FiTLYQ7kNvwEhM6Zc&_nc_oc=AdnPMxka_UUncLSCaEb1TjtYwDjcj-EJcSfUnR8-ekHRMKxMqc4UkQKQ5VpyxwSVmboq6lprkP4MJG4H8gkOjCXz&_nc_zt=23&_nc_ht=scontent.fmnl4-3.fna&_nc_gid=EXc9gamKErfJaKeYJ1lSdQ&oh=00_AfsGS1jng4liU9wYOXSEQM-aym3eNFFqT5m9_DwXsM7Grg&oe=698D2D56" width="100px" height="100px" />
  <br />
  <h1><b>PROTECTING WOMEN & CHILDREN</b></h1>
  <p><i>Para sa mga kababaihan at kabataan na nangangailangan ng proteksyon.</i></p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Status-Active_Capstone-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Security-Data_Privacy_Compliant-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Coverage-Barangay_183-yellow?style=for-the-badge" />
</div>

---

## 🚨 Emergency Hotlines (Live Marquee)
> [!IMPORTANT]
> **BRGY EMERGENCY:** `0917-XXX-XXXX` | **VAWC HOTLINE:** `0918-XXX-XXXX`

---

## 📚 Core System Modules

### 1. **GAD Management System** (Gender and Development)
A comprehensive module for tracking and managing the GAD Plan and Budget (GPB).
- **HGDG Logic Integration**: Automated attribution of budgets based on Gender Responsiveness scores.
- **Activity Tracking**: Monitor GAD activities, participants, and budget utilization in real-time.
- **Analytics & Reporting**: Generate transparency reports and visualized data for GAD accomplishments.

### 2. **Dynamic Organization Management**
A powerful engine for accrediting and managing community organizations (CSOs/NGOs).
- **Drag-and-Drop Form Builder**: Admins can create custom membership forms without coding.
- **Live "Official Paper" Preview**: See exactly how the application form looks on printed barangay letterhead while building it.
- **Digital Accreditation**: Streamlined process for recognizing groups like KALIPI, Solo Parents, ERPAT, etc.
- **Membership Database**: Centralized repository of all organization members with "Print-to-PDF" capabilities.

### 3. **Case Management (VAWC & BCPC)**
Secure handling of sensitive cases related to Violence Against Women and Children (VAWC) and Children in Conflict with the Law (CICL).
- **Strict Confidentiality**: Role-Based Access Control (RBAC) ensures only authorized personnel see sensitive data.
- **Case Lifecycle**: Automated tracking from `New` -> `On-Going` -> `Resolved/Referred`.
- **Intelligent Archiving**: Soft-delete mechanisms to maintain legal audit trails while keeping the active dashboard clean.

### 4. **Public Transparency Portal**
A user-friendly frontend for residents to access services.
- **Digital Services**: File complaints or apply for organization membership online.
- **Information Hub**: Access Laws (RA 9262), Rights of the Child, and intervention procedures.
- **Organization Directory**: View active accredited groups and their requirements.

---

## 🏛️ Accredited Organizations
*These groups are managed dynamically via the Admin Panel CRUD system.*

| Organization | Leadership | Status |
| :--- | :--- | :--- |
| **KALIPI** | President: TBA | ✅ Accredited |
| **SOLO PARENT** | President: TBA | ✅ Accredited |
| **ERPAT** | President: TBA | ✅ Accredited |
| **VCO** | President: TBA | ✅ Accredited |

---

## 🛠️ System Architecture (The Logic)

This project is built using **SOLID Principles** and **OOP (Object-Oriented Programming)** to ensure a maintainable and scalable codebase for the LGU.

### 🔹 Key Technical Implementation:
1. **RBAC (Role-Based Access Control):** Custom middleware to separate Admin, Committee Heads, and Residents.
2. **Dynamic JSON Schemas**: The Form Builder saves form structures as JSON, allowing for infinite flexibility without altering the database schema.
3. **Data Archiving Strategy:** Implementation of **Soft Deletes** in MySQL to ensure legal records are never truly purged, maintaining a 100% audit trail.
4. **Inertia.js SPA**: A modern Single Page Application experience using React, serving a unified frontend and backend monolith.

---

## 📊 Analytics Dashboard Preview
The system provides real-time "Backtrack Statistics" (e.g., January to February trends) for:
- **Total Reported Cases** (VAWC & CPP)
- **Membership Growth Rates**
- **GAD Budget Utilization Support**

---

## 💻 Tech Stack
- **Frontend:** React.js, Inertia.js, Tailwind CSS, Shadcn/UI
- **Backend:** Laravel 10 (PHP 8.2)
- **Database:** MySQL
- **Tooling:** Vite, TypeScript

---

<div align="center">
  <sub>Developed for the betterment of Barangay 183 Villamor Community.</sub>
</div>
