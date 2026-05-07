---
Milestone: Core Clinical Workflows
---

# Issue 14: Schema Foundation — Sprint 2

## Parent

[PRD: Sprint 2 Functional Enhancements](../PRD_Sprint2.md)

## What to build

Lay the database groundwork for all Sprint 2 features. This slice makes three schema changes and seeds demo data — no UI is delivered, but every other Sprint 2 issue is blocked until this is complete.

**Schema changes:**
- Drop the `sport` column from the `athletes` table (`ALTER TABLE athletes DROP COLUMN sport`)
- Add 17 new nullable columns to `athletes`: `age` (integer), `height` (text), `weight` (integer), `year` (text), `phone` (text), `emergency_contact_name` (text), `emergency_contact_phone` (text), `insurance` (text), `blood_type` (text), `allergies` (text), `medications` (text), `medical_history` (text), `last_physical` (text), `primary_physician` (text), `injury_type` (text), `body_part` (text)
- Create a new `clearance_tasks` table with columns: `id` (PK), `trainer_id` (FK users), `athlete_id` (FK athletes), `note` (text), `status` (text, default `'pending'`), `created_at`, `updated_at`

**Seed data (clearly marked, removable before production):**
- Insert realistic encounter records dated across Jul–Dec 2025 and Jan–May 2026 to populate the Injury Hotspots chart with two-season comparison data
- Insert 3 pending clearance tasks tied to seeded athletes:
  1. "Approve return-to-play — Marcus T. | Ankle sprain cleared by physician"
  2. "Review rehab progression — Sarah J. | Completed 4 of 6 sessions"
  3. "Update clearance status — Team A | Post-game injury report pending"

## Acceptance criteria

- [ ] `sport` column no longer exists on the `athletes` table
- [ ] All 17 new `athletes` columns exist and accept null values
- [ ] `clearance_tasks` table exists with the correct columns and foreign key constraints
- [ ] Historical encounter seed records exist for both 2025 and 2026 date ranges
- [ ] 3 clearance task seed records exist with `status = 'pending'`
- [ ] Seed data is clearly marked in the schema initialisation code so it can be removed cleanly
- [ ] Existing athlete and encounter records are unaffected by the migration
- [ ] Server starts without errors after the migration runs

## Blocked by

None — can start immediately.
