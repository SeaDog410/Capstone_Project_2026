# The Nest — Athletic Training Documentation & Management System

**The Nest** is a web application for college and high school athletic trainers to reduce administrative burden, ensure documentation compliance, and improve athlete recovery outcomes. Trainers can log SOAP notes, manage rosters and clearance, build rehab programs, and track inventory — all from a browser.

---

## Quick Links

- **GitHub Wiki:** [SeaDog410/Capstone\_Project\_2026/wiki](https://github.com/SeaDog410/Capstone_Project_2026/wiki)
- **Project Board:** [GitHub Projects](https://github.com/users/SeaDog410/projects/1)
- **Demo Video:** *(coming soon)*

---

## Getting Started

**Prerequisites:** Node.js 18 or later. No global installs required.

```bash
git clone https://github.com/SeaDog410/Capstone_Project_2026.git
cd Capstone_Project_2026
npm install
npm start
```

Open **http://localhost:3000** in your browser.

To explore the app, click **Sign Up**, fill in your name, email, password, and select **Trainer** as your role. All trainer features are available immediately after registering.

> Detailed setup notes (environment variables, SQLite file location) live in the [wiki](https://github.com/SeaDog410/Capstone_Project_2026/wiki).

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime** | Node.js 18+ |
| **Backend** | Express.js |
| **Database** | SQLite via node-sqlite3-wasm |
| **Frontend** | Vanilla JavaScript, HTML, CSS |
| **Auth** | jsonwebtoken, bcryptjs |
| **AI / Voice** | OpenAI API |

---

## Project Status

| Milestone | Status | Description |
| :--- | :--- | :--- |
| **1: Auth & User Management** | **Complete** | JWT login/register, role-based access (Trainer, Athlete, Coach) |
| **2: Athlete Roster & Clearance** | **Complete** | Athlete profiles, Red/Yellow/Green clearance, coach read-only view |
| **3: SOAP Notes & Voice** | **Complete** | Full SOAP note editor with OpenAI voice-to-text transcription |
| **4: Rehab Programs & HEP** | **Complete** | Exercise library, program builder, athlete checklist |
| **5: Inventory & QR Scanning** | **Complete** | Supply tracking, low-stock alerts, QR code generation/scanning |

---

## Key Features

1. **SOAP Note Documentation:** Structured injury notes with optional OpenAI voice-to-text, keeping trainers hands-free on the sideline.
2. **Role-Based Access Control:** A single login renders different interfaces for Trainers, Athletes, and Coaches to maintain HIPAA/FERPA privacy.
3. **Rehab & HEP Tracking:** Build home exercise programs from a library and let athletes check off completed sessions.
4. **Inventory Management:** Track consumables and loaned equipment with QR code scanning and automatic low-stock alerts.

---

## Application Flow & UI Roles

1. **Trainer Interface** — Full access to medical records, SOAP notes, roster, rehab programs, and inventory.
2. **Athlete Interface** — Focused on assigned rehab exercises and personal recovery status.
3. **Coach Interface** — Read-only Red/Yellow/Green clearance dashboard with no access to medical details.

---

## Database Schema (Overview)

```sql
USERS        (id, email, password_hash, role, name)
ATHLETES     (id, user_id, name, team, clearance_status, trainer_id)
ENCOUNTERS   (id, athlete_id, trainer_id, subjective, objective, assessment, plan)
REHAB_PROGRAMS (id, athlete_id, trainer_id, name, exercises)
INVENTORY    (id, name, quantity, low_stock_threshold, category)
```

---

## Team Contributions

| Team Member | Total Story Points Completed | Contribution % |
| :--- | :--- | :--- |
| Kamron Loera | [TOTAL] | 100.0% |
| **Team Total** | **[TOTAL]** | **100.0%** |

> Story point totals are sourced from the Done column of the [GitHub Project board](https://github.com/users/SeaDog410/projects/1). Replace `[TOTAL]` with the final count before submission.
