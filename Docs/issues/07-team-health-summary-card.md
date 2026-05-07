# Issue 07: Team Health Summary card

## Parent

[PRD: Trainer Dashboard Overhaul](prd-dashboard-overhaul.md)

## What to build

Replace the three existing summary KPI cards (Total Athletes, Limited / Out, Cleared) with a single "TEAM HEALTH SUMMARY" card. This slice adds the `GET /api/dashboard/summary` endpoint (health summary portion) and replaces the header metric section in the Trainer Overview UI.

The card displays a central "Active Athletes" count with three segmented indicators: HEALTHY (green), LIMITED (yellow), and OUT (red), derived from `clearance_status` values. An icon button in the top-right toggles between a donut chart and a horizontal bar chart via Chart.js (loaded via CDN).

## Acceptance criteria

- [ ] `GET /api/dashboard/summary` returns `healthSummary` with counts for `healthy`, `limited`, and `out` (mapped from green/yellow/red `clearance_status`)
- [ ] Chart.js is loaded via CDN in the page
- [ ] The three existing KPI cards are removed from the dashboard
- [ ] A "TEAM HEALTH SUMMARY" card renders in their place showing total active athlete count
- [ ] HEALTHY / LIMITED / OUT counts are displayed as segmented indicators with correct colors
- [ ] An icon button in the card's top-right toggles between donut and horizontal bar chart views
- [ ] Both chart types render correctly using live data from `/api/dashboard/summary`
- [ ] Card styling matches the design system: Lexend font, sharp corners, uppercase labels, bold borders

## Blocked by

None — can start immediately.
