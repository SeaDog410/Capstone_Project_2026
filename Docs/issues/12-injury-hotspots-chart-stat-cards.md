# Issue 12: Injury Hotspots chart & stat cards

## Parent

[PRD: Trainer Dashboard Overhaul](prd-dashboard-overhaul.md)

## What to build

Add the "INJURY HOTSPOTS & RATES" section to the bottom of the dashboard. This includes a comparative area/line chart and three stat cards below it.

The chart uses Chart.js to render two series: a live series counting encounters grouped by month (last 6 rolling calendar months on the X-axis), and a static hardcoded prior-season baseline series. A legend identifies both series. Below the chart, three stat cards are computed from encounter data: TOP INJURY SITE (most frequent `body_part` value with percentage), TOP MECHANISM (most frequent `injury_type` text), and RATE CHANGE (current season encounter count vs. hardcoded baseline total, shown as a percentage with a directional arrow).

## Acceptance criteria

- [ ] "INJURY HOTSPOTS & RATES" chart renders at the bottom of the dashboard
- [ ] X-axis shows the last 6 rolling calendar months (dynamic, not hardcoded)
- [ ] Live series plots encounter count per month from `GET /api/encounters`
- [ ] Baseline series is hardcoded static data representing the prior season
- [ ] Chart legend clearly labels both series
- [ ] Chart uses Chart.js (already loaded via CDN from Issue 07)
- [ ] "TOP INJURY SITE" stat card shows the most frequently tagged `body_part` and its percentage of all encounters
- [ ] "TOP MECHANISM" stat card shows the most frequent `injury_type` text value
- [ ] "RATE CHANGE" stat card shows percentage difference between live encounter count and hardcoded baseline total, with a colored directional arrow
- [ ] All three stat cards update based on live encounter data
- [ ] Section styling matches the design system: bold section header, card borders, red data line on chart

## Blocked by

- [Issue 06: Injury Classification fields on SOAP form](06-injury-classification-soap-form.md) — `body_part` field must exist on encounters for TOP INJURY SITE aggregation
