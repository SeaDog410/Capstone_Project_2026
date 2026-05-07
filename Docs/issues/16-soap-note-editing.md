# Issue 16: SOAP Note Editing

## Parent

[PRD: Sprint 2 Functional Enhancements](../PRD_Sprint2.md)

## What to build

Allow trainers to edit any field on an existing SOAP note and track when it was last modified. Currently encounters are write-once — there is no `PATCH` endpoint and no edit UI.

**New API endpoint:** `PATCH /api/encounters/:id` — accepts any subset of SOAP fields: `subjective`, `objective`, `assessment`, `plan`, `injury_type`, `body_part`. The trainer must own the encounter. Updates `updated_at` on save. Returns the updated encounter record. Partial updates must not overwrite unmentioned fields with null.

**Frontend changes:** The SOAP note detail view gains an Edit button. Clicking it enables all six fields for inline editing and reveals a Save button. On save, the form calls `PATCH /api/encounters/:id` and the detail view refreshes. A "Last Updated" timestamp is displayed beneath the encounter header whenever `updated_at` differs from `created_at`.

## Acceptance criteria

- [ ] `PATCH /api/encounters/:id` exists and accepts partial SOAP field updates
- [ ] Unmentioned fields are preserved — a partial update does not null out other fields
- [ ] `updated_at` is advanced on every successful save
- [ ] A trainer cannot edit an encounter owned by a different trainer (API returns 403)
- [ ] Edit button appears on the SOAP note detail view
- [ ] Clicking Edit enables all six fields (subjective, objective, assessment, plan, injury_type, body_part) for inline editing
- [ ] Saving calls the PATCH endpoint and refreshes the detail view with updated content
- [ ] "Last Updated" timestamp is displayed when `updated_at` differs from `created_at`
- [ ] Cancelling edit discards unsaved changes and restores the read-only view
- [ ] Styling matches the design system

## Blocked by

None — can start immediately. No schema change is required; `updated_at` already exists on the `encounters` table.
