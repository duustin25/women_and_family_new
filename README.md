# 🛡️ Women and Family Protection & Support Management System
### 📍 Barangay 183 Villamor, Pasay City

<div align="center">
  <img src="https://raw.githubusercontent.com/duustin25/women_and_family_new/main/public/Logo/barangay183LOGO.png" onerror="this.src='https://scontent.fmnl4-2.fna.fbcdn.net/v/t39.30808-6/500239037_671974392308023_7855615069596178046_n.jpg'" width="110px" height="110px" style="border-radius: 50%;" />
  <br />
  <h2><b>INTELLIGENT WOMEN & CHILDREN PROTECTION SYSTEM</b></h2>
  <p><i>An Enterprise Decision-Support & Community Welfare Platform powered by PHP Laravel, React, and Python AI.</i></p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Status-Active_Capstone-success?style=for-the-badge&logo=laravel&color=FF2D20" />
  <img src="https://img.shields.io/badge/AI_Engine-Python_MLP_Classifier-blue?style=for-the-badge&logo=python&color=3776AB" />
  <img src="https://img.shields.io/badge/Security-Data_Privacy_Compliant-blue?style=for-the-badge&logo=security&color=4CAF50" />
  <img src="https://img.shields.io/badge/Coverage-Barangay_183-yellow?style=for-the-badge&logo=map&color=FFC107" />
</div>

---

## 🚨 Emergency Contacts & Legal Mandate
> [!IMPORTANT]
> *   **National Emergency:** `911`
> *   **PNP Women and Children Protection Center (WCPC):** `177` | `(02) 8532-6690`
> *   **Barangay 183 WFP Desk:** `(02) 8-183-SAFE`
> *   *This system is built in strict compliance with the **Data Privacy Act of 2012 (RA 10173)**, **RA 9262 (Anti-VAWC Act)**, and **RA 7610 (Child Protection Act)**.*

---

## 📚 Core System Modules

### 1. 🤖 AI Chatbot Assistant ("Gabay")
An automated Tagalog/Taglish conversational assistant designed to guide citizens and survivors.
*   **Offline NLP Classifier:** Runs a local Python subprocess using **NLTK** and **Scikit-Learn's Multi-Layer Perceptron (MLP)** neural network. Securely processes intents locally without transmitting sensitive data to external APIs.
*   **Zero-Crash Fallback UI:** Includes a dynamic connection monitor. If the Python process is offline on the hosting server, the chatbot slides a warning banner and gracefully falls back to deterministic keyword routing.
*   **Action Mapping Interceptor:** Resolves intents to dynamic actions (e.g. fetching news, officials, or laws) straight from the database.

### 2. ⚖️ Case Management (VAWC & BCPC)
A highly confidential intake and lifecycle tracking engine for desk officers.
*   **VAWC-RAVE Scoring (RA 9262):** A **Direct Additive Multi-Criteria Decision Analysis (MCDA)** algorithm that calculates a case’s Triage Priority Index (1 to 12) based on weapon presence, repeat offenses, and security threats.
*   **Barangay Protection Order (BPO) Lifecycle:** Tracks BPO application, compliance logging, and automatic escalation pathways to the PNP WCPD.
*   **Separation of Concerns:** Domestic child abuse is handled under VAWC (for BPO legal support), while general child welfare cases are routed immediately to the PNP and monitored via the BCPC nutrition registry.

### 👶 3. BCPC Nutrition Monitoring (e-OPT Plus)
An automated community health module tracking child growth under the Barangay Council for the Protection of Children.
*   **WHO Standards Integration:** Evaluates child growth indices (Weight-for-Age and Height-for-Age) by calculating Z-scores based on WHO Child Growth curves.
*   **90-Day Supplemental Feeding Program (SFP):** Automatically enrolls malnourished children (Underweight/Stunted) into the SFP, logs weekly assessments, and tracks graduation/relapse statuses.
*   **Zone Hotspots:** Generates analytics of malnutrition hotspots by Zone (Purok) to help direct barangay budget interventions.

### 📋 4. Dynamic Organization Accreditor
A customizable portal for community groups (KALIPI, Solo Parents, ERPAT, etc.).
*   **Drag-and-Drop Form Builder:** Admins create custom membership forms without altering database tables. Forms are stored dynamically as JSON schemas.
*   **Live Official Letterhead Preview:** Renders printed barangay letterhead dynamically in real-time as admins design form schemas.

### 📊 5. GAD Plan & Budget Tracker
Enforces accountability for Barangay 183 Pasay City's Gender and Development funds.
*   **HGDG Score Calculator:** Evaluates project proposals using Harmonized Gender and Development Guidelines (HGDG) box scores, automatically attributing 25%, 50%, 75%, or 100% of the project budget based on gender responsiveness.

---

## 🛠️ Senior Technical Implementation & SOLID Principles

*   **Single Responsibility (SRP):** Business logic is completely decoupled from controllers. Services like [VawcCaseService](app/Services/VawcCaseService.php) handle computations, keeping controllers thin.
*   **Open/Closed Principle (OCP):** Dynamic system logging is accomplished using a polymorphic observer model. New database events can be logged without modifying the Logger class.
*   **Composition over Inheritance:** Dynamic case composition where specialized tables (`vawc_cases`) hold references to core `case_reports` rather than creating a massive, un-normalized table structure.
*   **ACID Database Transactions:** Multi-row database mutations (e.g. case logs and BPO records) are wrapped inside `DB::transaction()` units of work to prevent database corruption.
*   **Database Indexing:** Indexed performance-critical fields (`case_number`, `status` on `vawc_cases`) to guarantee fast database query speeds under enterprise-level records scale.

---

## 💻 Tech Stack
*   **Frontend SPA:** React (TypeScript), Inertia.js, Tailwind CSS, Lucide Icons, Shadcn/UI
*   **Backend Framework:** Laravel 10 (PHP 8.2)
*   **AI Classifier:** Python 3 (NLTK, Scikit-Learn)
*   **Database Engine:** MySQL 8.0
*   **Build Tooling:** Vite, Composer

---

## 🚀 Setup & Installation

### Prerequisite Checklist
*   PHP $\ge$ 8.2
*   Composer
*   NodeJS $\ge$ 18 & NPM
*   MySQL $\ge$ 8.0
*   Python 3 (with `pip`)

### 1. Repository Setup
```bash
git clone https://github.com/duustin25/women_and_family_new.git
cd wfp-system_captsone
cp .env.example .env
```
*Configure database credentials inside your `.env` file.*

### 2. Dependency Installation
```bash
# Install PHP dependencies
composer install

# Install Frontend packages
npm install
```

### 3. Database Migration & Seeding
```bash
php artisan key:generate
php artisan migrate --seed
```
*Seeds default Zones, accredited CSOs, default Admin accounts, and Case Type definitions.*

### 4. AI Chatbot Setup & Training
```bash
# Install python NLP packages
pip install nltk scikit-learn numpy

# Download NLTK data packages & train the MLP model
python resources/python/train.py
```

### 5. Running the Application Locally
```bash
# Run Laravel development server
php artisan serve

# Run Vite compiler
npm run dev
```
Navigate to `http://127.0.0.1:8000`. Login credentials for test Admin can be found in `DatabaseSeeder.php` (`admin@gmail.com` / `password`).

---
<div align="center">
  <sub>Developed with structural and technical rigor for Barangay 183 Villamor.</sub>
</div>
