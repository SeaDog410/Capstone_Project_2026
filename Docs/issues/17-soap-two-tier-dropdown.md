---
Milestone: Core Clinical Workflows
---

# Issue 17: Two-Tier SOAP Note Dropdown

## Parent

[PRD: Sprint 2 Functional Enhancements](../PRD_Sprint2.md)

## What to build

Replace the flat athlete selector on the SOAP note create form with a two-tier cascade: the trainer selects a Team first, then the Athlete dropdown is dynamically filtered to show only members of that team. This reduces scroll time on large rosters.

No new API endpoint is required. The existing `GET /api/athletes` response already includes the `team` field. The cascade is implemented client-side: fetch all athletes on form open, populate the Team dropdown with unique team values, and re-filter the Athlete dropdown whenever the selected team changes.

All athletes are expected to have a team assigned following the Sprint 2 schema migration (Issue 14). No "Unassigned" bucket is needed.

## Acceptance criteria

- [x] SOAP note create form shows a Team dropdown before the Athlete dropdown
- [x] Team dropdown is populated with unique team values from the trainer's athlete roster
- [x] Selecting a team filters the Athlete dropdown to only that team's members
- [x] Changing the selected team resets the Athlete dropdown selection
- [x] All existing SOAP note form fields (subjective, objective, assessment, plan, injury type, body part) remain present and functional
- [x] Form submission behavior is unchanged — creates a new encounter via `POST /api/encounters`
- [x] Styling matches the design system

## Blocked by

- [Issue 14: Schema Foundation — Sprint 2](14-schema-foundation-sprint2.md) — `sport` column drop and `team` field consolidation must be complete so team values are clean and consistent
