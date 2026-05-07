# Issue 11: Weekly Planner widget

## Parent

[PRD: Trainer Dashboard Overhaul](prd-dashboard-overhaul.md)

## What to build

Add a "WEEKLY PLANNER" widget to the dashboard showing a 7-day calendar grid. Rather than requiring a new scheduling system, this widget derives its content from two existing data sources: encounter `created_at` dates (logged sessions) and rehab completion dates. Both are fetched from existing API endpoints and merged client-side by date.

The widget includes previous/next week navigation arrows and a "TODAY" button that snaps back to the current week. Each day cell shows abbreviated athlete name labels for any encounters or rehab completions that occurred on that date.

## Acceptance criteria

- [ ] "WEEKLY PLANNER" widget renders on the dashboard showing a SUN–SAT 7-day grid
- [ ] Encounter dates are fetched from `GET /api/encounters` and plotted on the correct day cells
- [ ] Rehab completion dates are fetched from `GET /api/rehab/programs` (or completions endpoint) and plotted on the correct day cells
- [ ] Left/right navigation arrows move the view backward and forward by one week
- [ ] "TODAY" button snaps the view back to the current calendar week
- [ ] Day cells show abbreviated athlete name labels for each activity on that date
- [ ] The current day is visually highlighted
- [ ] Widget styling matches the design system: grid lines, uppercase day labels, bold borders

## Blocked by

None — can start immediately.
