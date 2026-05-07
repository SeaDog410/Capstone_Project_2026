# Issue 20: Weekly Planner — Click-to-View Athlete Modal

## Parent

[PRD: Sprint 2 Functional Enhancements](../PRD_Sprint2.md)

## What to build

Extend the Weekly Planner widget (built in Issue 11) so that clicking an appointment entry opens a quick-view modal showing the athlete's current injury status and clearance. The planner remains display-only — no appointment booking is added.

When a trainer clicks an athlete label on a day cell, a modal appears showing: athlete name, team, clearance status badge, most recent SOAP note summary (injury type, body part, assessment excerpt), and a link to the full SOAP note detail view. The modal is dismissible.

The seeded 2025/2026 encounter data (from Issue 14) ensures the planner has meaningful entries for demo purposes.

## Acceptance criteria

- [ ] Clicking an athlete label in a Weekly Planner day cell opens a quick-view modal
- [ ] Modal displays athlete name, team, and clearance status badge
- [ ] Modal displays the athlete's most recent SOAP note: injury type, body part, and a truncated assessment
- [ ] A "View Full Note" link in the modal navigates to the full SOAP note detail view
- [ ] Modal is dismissible by clicking outside it or a close button
- [ ] If an athlete has no SOAP notes, the modal shows a neutral "No notes on file" state
- [ ] Planner entries from seeded 2025/2026 encounter data are visible on correct day cells
- [ ] Existing planner widget behavior (navigation arrows, TODAY button, day grid) is unaffected
- [ ] Styling matches the design system

## Blocked by

- [Issue 11: Weekly Planner widget](11-weekly-planner-widget.md) — base planner widget must exist
- [Issue 14: Schema Foundation — Sprint 2](14-schema-foundation-sprint2.md) — seed data must be present for the planner to have meaningful entries
