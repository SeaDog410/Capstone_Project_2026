# Issue 18: Clearance Tasks — Full Slice

## Parent

[PRD: Sprint 2 Functional Enhancements](../PRD_Sprint2.md)

## What to build

Give trainers a way to create and manage self-assigned clearance task reminders tied to specific athletes. These tasks appear in the Pending Actions widget (Issue 19) alongside drafted SOAP notes and rehab reviews.

**New API endpoints:**
- `GET /api/clearance-tasks` — returns all clearance tasks for the authenticated trainer, joined with athlete name. Sorted by `created_at` descending.
- `POST /api/clearance-tasks` — creates a new task. Body: `{ athlete_id, note }`. Trainer is inferred from the JWT.
- `PATCH /api/clearance-tasks/:id` — updates `status` (`'pending'` → `'done'`). Trainer must own the task.

**Frontend:** A "New Clearance Task" button (or form) on the trainer dashboard lets the trainer pick an athlete from a dropdown and type a note. Existing tasks are listed with a checkbox or "Mark Done" button to complete them. Completed tasks are visually distinguished (strikethrough or muted style) but remain visible.

Three demo tasks are pre-seeded in the database (from Issue 14) and will appear automatically.

## Acceptance criteria

- [ ] `GET /api/clearance-tasks` returns only the requesting trainer's tasks with athlete name included
- [ ] `POST /api/clearance-tasks` creates a task owned by the authenticated trainer
- [ ] `PATCH /api/clearance-tasks/:id` transitions status from `'pending'` to `'done'`
- [ ] A trainer cannot read or modify another trainer's clearance tasks (API returns 403)
- [ ] The 3 seeded demo tasks appear as pending on first load
- [ ] Trainer can create a new clearance task by selecting an athlete and entering a note
- [ ] Trainer can mark a task as done; it updates visually without a full page reload
- [ ] Completed tasks remain visible but are visually distinguished from pending ones
- [ ] Styling matches the design system

## Blocked by

- [Issue 14: Schema Foundation — Sprint 2](14-schema-foundation-sprint2.md) — `clearance_tasks` table must exist
