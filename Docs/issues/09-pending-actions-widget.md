# Issue 09: Pending Actions widget

## Parent

[PRD: Trainer Dashboard Overhaul](prd-dashboard-overhaul.md)

## What to build

Add a "PENDING ACTIONS" widget to the left side of the dashboard. This slice extends the `GET /api/dashboard/summary` endpoint (created in Issue 07) to include a `pendingActions` array and a `pendingCount` total, then renders the widget in the UI.

Two item types are surfaced: (1) incomplete SOAP notes — encounters where both `assessment` and `plan` are empty strings; (2) rehab-active athletes — athletes who have logged at least one rehab completion in the last 7 days. Each item is clickable and navigates to the relevant record. The widget header displays a dynamic "N URGENT" count badge equal to the total number of pending items.

## Acceptance criteria

- [ ] `GET /api/dashboard/summary` returns `pendingActions` array and `pendingCount` integer
- [ ] `pendingActions` includes encounters where `assessment = ''` AND `plan = ''`, with athlete name and `created_at` timestamp
- [ ] `pendingActions` includes athletes with at least one `rehab_completion` in the last 7 days, with athlete name and most recent completion date
- [ ] `pendingCount` equals the total number of items across both types
- [ ] The "PENDING ACTIONS" widget renders on the dashboard with the URGENT count badge
- [ ] Each action item displays the correct label, athlete name, and relative timestamp
- [ ] Each action item is clickable and navigates to the correct record (incomplete SOAP → encounter form; rehab active → rehab program)
- [ ] Widget styling matches the design system: uppercase header, bold borders, arrow indicators on items

## Blocked by

- [Issue 07: Team Health Summary card](07-team-health-summary-card.md) — `/api/dashboard/summary` endpoint must exist first
