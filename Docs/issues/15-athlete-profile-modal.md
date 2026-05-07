# Issue 15: Athlete Profile Modal — View & Edit

## Parent

[PRD: Sprint 2 Functional Enhancements](../PRD_Sprint2.md)

## What to build

Make athlete names clickable throughout the app. Clicking any athlete name opens a full-screen modal displaying all profile information grouped into four sections: Personal, Physical, Medical, and Injury. The modal includes an Edit button that switches every field to an editable input in place. Saving calls a new API endpoint and refreshes the modal with the updated data.

**New API endpoint:** `PATCH /api/athletes/:id` — accepts any subset of the new profile fields. Restricted to the athlete's assigned trainer. Returns the full updated athlete record.

**Profile sections and fields:**
- **Personal:** name, team, year, phone, emergency contact name, emergency contact phone, insurance
- **Physical:** age, height, weight, blood type
- **Medical:** allergies, medications, medical history, last physical date, primary physician
- **Injury:** injury type, body part

The clearance status badge is displayed in the modal header but is not editable here (it has its own existing control).

## Acceptance criteria

- [ ] Clicking an athlete's name anywhere in the app opens the profile modal
- [ ] Modal displays all profile fields grouped into Personal, Physical, Medical, and Injury sections
- [ ] Fields with no data display a neutral placeholder (e.g., "—") rather than blank space
- [ ] Clearance status badge is visible in the modal header
- [ ] "Edit" button switches all fields to editable inputs
- [ ] Saving calls `PATCH /api/athletes/:id` and shows a success indicator
- [ ] Updated values are reflected in the modal immediately after save without a full page reload
- [ ] A trainer cannot edit an athlete assigned to a different trainer (API returns 403)
- [ ] Modal can be dismissed without saving, discarding unsaved changes
- [ ] `PATCH /api/athletes/:id` ignores unknown fields and does not overwrite unmentioned fields with null
- [ ] Modal styling matches the design system: Lexend headings, section dividers, red primary action button

## Blocked by

- [Issue 14: Schema Foundation — Sprint 2](14-schema-foundation-sprint2.md) — new athlete columns must exist before the modal can display or save them
