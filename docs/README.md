# 📚 Municipal & Barangay Women and Family Protection Information System (WFPIS)
## Comprehensive Technical Documentation & Capstone Portfolio

> **Barangay 183, Villamor Airbase, Pasay City**  
> **Institute of Computer Studies Department — National Aviation Academy of the Philippines (Formerly PhilSCA)**  
> **Target Production Release:** Academic Year 2025–2026

---

## 🏛️ System Overview

The **Women and Family Protection Information System (WFPIS)** is an enterprise-grade, role-based public administration and clinical decision support system. Built with a modern **TALL + React 19** stack (Laravel 11, Inertia.js, React 19, TypeScript, Tailwind CSS, Shadcn UI, Python NLP/MLP, MySQL 8.0), the platform digitizes and unifies four critical barangay governance sectors:

1. **🛡️ VAWC Module:** Domestic violence case management, **VAWC-RAVE** lethal danger scoring, and statutory 24-hour Barangay Protection Order (BPO) SLA automation under **Republic Act No. 9262**.
2. **👶 BCPC Module:** Child malnutrition census and growth monitoring adhering to **NNC Operation Timbang (e-OPT) Plus** and **WHO 3-Axis Child Growth Standards**, with 120-Day Supplemental Feeding Program (SFP) milestone tracking under **Republic Act No. 11037**.
3. **🌸 GAD Module:** Community seminar scheduling, GAD Plan execution tracking ($\ge 5\%$ budget allocation), proposal vetting, and asynchronous resident alerts under **Republic Act No. 9710**.
4. **👥 Organizations Module:** Multi-tenant civil society governance (KALIPI, Solo Parents under **RA 11861**, PWDs under **RA 7277**, Senior Citizens under **RA 9994**), public application portal with Email OTP, 14-day auto-approval SLA, and resident appeals channels.

---

## 🗺️ Master Documentation Directory & Interactive Sitemap

```
docs/
├── README.md                                  <-- You are here (Master Hub & Sitemap)
│
├── modules/                                   <-- THE 4 CORE CAPSTONE MODULES
│   ├── vawc/                                  <-- Violence Against Women and Children (RA 9262)
│   │   ├── README.md                          <-- Module Overview, Mandate & Scope
│   │   ├── features.md                        <-- Detailed Feature Matrix & Roles
│   │   ├── architecture.md                    <-- Layered Design, Service Layer & ERD
│   │   ├── structured_files_folders.md        <-- Full Codebase Map (Backend & Frontend)
│   │   ├── logics_and_algorithms.md           <-- VAWC-RAVE Triage (1-12) & 24h BPO SLA
│   │   ├── process_and_workflows.md           <-- Blotter-to-Disposition Desk Manual
│   │   ├── dfd.md                             <-- Context, Level 0, 1 & 2 DFDs
│   │   └── fullstack_developer_guide.md       <-- Routes, Models, Migrations, Tests
│   │
│   ├── bcpc/                                  <-- Child Nutrition & e-OPT Plus (RA 11037)
│   │   ├── README.md                          <-- Module Overview & Mandates
│   │   ├── features.md                        <-- Census, SFP Tracking, Outlier Prompts
│   │   ├── architecture.md                    <-- System Architecture & Calculations
│   │   ├── structured_files_folders.md        <-- Codebase File/Folder Breakdown
│   │   ├── logics_and_algorithms.md           <-- WHO 3-Axis Precision & Linear Interpolation
│   │   ├── process_and_workflows.md           <-- BNS Field Weighing & SFP Milestones
│   │   ├── dfd.md                             <-- Context, Level 0, 1 & 2 DFDs
│   │   └── fullstack_developer_guide.md       <-- Endpoints, Validation Rules, Tests
│   │
│   ├── gad/                                   <-- Gender and Development (RA 9710)
│   │   ├── README.md                          <-- Module Overview & PCW Guidelines
│   │   ├── features.md                        <-- Interactive Calendar & Proposals
│   │   ├── architecture.md                    <-- Architecture & Queue Workers
│   │   ├── structured_files_folders.md        <-- Backend & Frontend Source Map
│   │   ├── logics_and_algorithms.md           <-- Event FSM & Bulk Mail Timeout Defense
│   │   ├── process_and_workflows.md           <-- Proposal Approval & Annual Reporting
│   │   ├── dfd.md                             <-- Context, Level 0, 1 & 2 DFDs
│   │   └── fullstack_developer_guide.md       <-- Route Handlers, Form Props, Tests
│   │
│   └── organizations/                         <-- Community Organizations (RA 11861, 7277)
│       ├── README.md                          <-- Module Overview & CSO Mandates
│       ├── features.md                        <-- Citizen Portal, Reviews & Appeals
│       ├── architecture.md                    <-- Multi-Tenant Governance Architecture
│       ├── structured_files_folders.md        <-- Source Directory Blueprint
│       ├── logics_and_algorithms.md           <-- 14-Day SLA Daemon & CSV Deduplication
│       ├── process_and_workflows.md           <-- Citizen Intake & Council Overrule
│       ├── dfd.md                             <-- Context, Level 0, 1 & 2 DFDs
│       └── fullstack_developer_guide.md       <-- Inertia Forms, Services, Tests
│
├── system_architecture/                       <-- SYSTEM-WIDE ARCHITECTURE & INFRASTRUCTURE
│   ├── overall_architecture.md                <-- Hybrid TALL+React Stack, SOLID & Clean Code
│   ├── security_and_rbac.md                   <-- RBAC Matrix, AES-256, Sanctum, Audit Trails
│   ├── analytics_and_reporting.md             <-- Command Center & Printable Sign-off Layouts
│   ├── ai_chatbot_the_sentinel.md             <-- Python NLP/MLPClassifier & Interceptors
│   ├── database_and_disaster_recovery.md      <-- Relational ERD & mysqldump Gzip Backup
│   └── dfd_system_level.md                    <-- System-Wide Context Diagram & Level 1 DFD
│
├── capstone_papers/                           <-- FORMAL ACADEMIC THESIS MANUSCRIPTS
│   ├── README.md                              <-- Capstone Abstract & Author Details
│   ├── chapter_1_to_5_full_manuscript.md      <-- Complete Academic Thesis (Chapters 1–5)
│   ├── iso_25010_software_evaluation.md       <-- ISO/IEC 25010 Survey & Statistical Metrics
│   ├── tam_technology_acceptance_model.md     <-- TAM Framework (PU, PEU, BIU)
│   ├── legal_framework_and_statutes.md        <-- Philippine Statutory Compendium
│   └── assets/                                <-- Flowcharts, Context Diagrams & Figures
│
└── capstone_defense/                          <-- DEFENSE PORTFOLIO & OPERATIONAL MANUALS
    ├── master_defense_portfolio.md            <-- IT Expert Recommendations Compliance
    ├── panelist_qa_defense_script.md          <-- Verbatim High-Stakes Panel Q&A Script
    ├── use_case_testing_matrix.md             <-- Empirical Use Case Test Scenarios (TC-01..15)
    └── user_manuals/                          <-- Step-by-Step Operating Guides
        ├── admin_and_desk_officer_guide.md    <-- Admin, VAWC Officer & BNS User Manual
        └── public_citizen_portal_guide.md     <-- Citizen Online Portal & Appeals Manual
```

---

## ⚡ Fullstack Developer Quick Reference

### Starting the Local Development Environment
```powershell
# 1. Start PHP Local Server & Queue Worker
php artisan serve
php artisan queue:work

# 2. Start Vite Asset Compiler
npm run dev

# 3. Database Migration & Seed
php artisan migrate --seed
```

### Running Automated Test Suites
```powershell
# Backend PHPUnit / Pest Feature Tests
php artisan test

# Frontend Vitest Component Suites
npm run test:unit
```
