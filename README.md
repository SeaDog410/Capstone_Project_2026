# The Nest — Athletic Training Documentation & Management System

**The Nest** is a comprehensive application designed for college and high school athletic trainers (ATs) to reduce administrative burden, ensure legal documentation compliance, and improve athlete recovery outcomes. This repository connects a cross-platform mobile frontend (React Native) to a high-performance backend (FastAPI/PostgreSQL).

---

## 🔗 Quick Links
- **Local API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs) *(FastAPI Swagger UI)*
- **Manage Tasks:** [Project Workspace Board](https://github.com/users/YOUR_USER/projects/1)
- **Design Assets:** [Figma Design File](https://figma.com/...)

---

## 📈 Project Status

The project is moving from architectural design to active development.

| Milestone | Status | Description |
| :--- | :--- | :--- |
| **Milestone 1: Database & Security** | **In Progress** | PostgreSQL Schema, RBAC Logic, and AES-256 Encryption setup. |
| **Milestone 2: Trainer & Athlete UI** | **In Progress** | Mobile interface creation with Offline-First sync capabilities. |
| **Milestone 3: Voice & Analytics** | **Pending** | Integration of AWS Transcribe Medical and D3.js Heatmaps. |

---

## 🛡️ Key Features

1.  **Offline-First Documentation:** Mobile-friendly system using a local database (SQLite) that auto-syncs to the cloud, ensuring data is never lost on the field.
2.  **Voice-to-Note (SOAP):** Integration with medical-grade Speech-to-Text APIs to generate structured injury notes hands-free.
3.  **Role-Based Access Control (RBAC):** A single login renders different interfaces for Trainers, Athletes, and Coaches to maintain HIPAA/FERPA privacy.
4.  **Injury Analytics:** Visual D3.js dashboards showing injury hotspots by body part, team, or specific practice drills.

---

## 🛠️ Tech Stack

* **Language:** Python (FastAPI), JavaScript (React Native)
* **Database:** PostgreSQL (Cloud), SQLite (Local Sync)
* **Security:** AES-256 Encryption, TLS, and Detailed Audit Logging
* **APIs:** AWS Transcribe Medical

---

## 📡 Application Flow & UI Roles

1.  **Trainer Interface** (`Trainer_UI`)
    * Full access to medical records, SOAP notes, analytics, and inventory.
2.  **Athlete Interface** (`Athlete_UI`)
    * Focused on rehab "to-do" lists, exercise videos, and personal recovery status.
3.  **Coach Interface** (`Coach_UI`)
    * Limited "Red/Yellow/Green" clearance status to maintain privacy compliance.
4.  **Inventory Management** (`Inventory_Scanner`)
    * QR code scanning for consumable supplies (tape, meds) and tracking for loaned equipment.

---

## 🧩 Database Structure Summary

The system utilizes a relational schema optimized for speed and medical compliance.

```sql
-- Conceptual Schema Overview
USERS (UserID [PK], Name, Role)
ATHLETES (AthleteID [PK], TeamID, MedicalHistory, ClearanceStatus)
ENCOUNTERS (NoteID [PK], AthleteID [FK], TrainerID [FK], S/O/A/P_Fields)
REHAB_PROGRAMS (ProgramID [PK], AthleteID [FK], ExerciseDetails, CompletionStatus)
INVENTORY (ItemID [PK], ItemName, Quantity, Threshold)
