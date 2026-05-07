# Issue 10: Recent Injury Feed widget

## Parent

[PRD: Trainer Dashboard Overhaul](prd-dashboard-overhaul.md)

## What to build

Add a "RECENT INJURY FEED" widget to the dashboard. It pulls from the existing `GET /api/encounters` endpoint and renders a scannable table of recent injuries with athlete identity, injury classification, clearance status, and timestamp.

Rows display an initials-based avatar (no photo required), the athlete's name, `injury_type` free text, `body_part` tag, a colored clearance status badge (OUT / LIMITED / HEALTHY), and the encounter's `created_at` timestamp. A WEEKLY / ALL toggle filters between the last 7 rolling days and all-time. A "VIEW FULL INJURY REGISTRY" link at the bottom navigates to the full encounters list.

## Acceptance criteria

- [ ] "RECENT INJURY FEED" widget renders on the dashboard
- [ ] Widget fetches data from `GET /api/encounters` (existing endpoint)
- [ ] Each row displays: initials avatar, athlete name, injury_type, body_part, clearance status badge, and timestamp
- [ ] Initials avatar is generated from the athlete's name (first letter of first + last name), rendered as a colored circle
- [ ] Clearance status badge uses correct colors: OUT = red, LIMITED = yellow, HEALTHY = green
- [ ] WEEKLY filter shows only encounters from the last 7 rolling days
- [ ] ALL filter shows all encounters
- [ ] "VIEW FULL INJURY REGISTRY" link is present and navigates to the encounters list
- [ ] Widget styling matches the design system: table headers uppercase, bold borders, pill-shaped status badges

## Blocked by

- [Issue 06: Injury Classification fields on SOAP form](06-injury-classification-soap-form.md) — `injury_type` and `body_part` fields must exist on encounters records
