# Issue 13: Dashboard layout polish

## Parent

[PRD: Trainer Dashboard Overhaul](prd-dashboard-overhaul.md)

## What to build

Final layout pass on the Trainer Overview dashboard. Once all widgets are built (Issues 07–12), this slice arranges them into the balanced multi-column grid described in the design mockup and ensures all borders, colors, font weights, and spacing are strictly aligned with the design system in Docs/DESIGN.md.

This is a HITL (Human-In-The-Loop) slice — the layout requires visual review and sign-off before it can be considered complete.

## Acceptance criteria

- [ ] All widgets are arranged in a balanced multi-column desktop grid (no single-column stacking)
- [ ] TEAM HEALTH SUMMARY and action buttons occupy the top header row
- [ ] PENDING ACTIONS, RECENT INJURY FEED, and WEEKLY PLANNER are arranged in the main content area columns
- [ ] INJURY HOTSPOTS chart and stat cards occupy the bottom section spanning the full content width
- [ ] All borders, colors, font weights, and spacing match Docs/DESIGN.md
- [ ] Section dividers are 2px+ solid lines per the design system
- [ ] No visual regressions in the sidebar or other existing views
- [ ] Layout reviewed and approved by the project owner (HITL sign-off)

## Blocked by

- [Issue 07: Team Health Summary card](07-team-health-summary-card.md)
- [Issue 08: Dashboard header action buttons](08-dashboard-header-buttons.md)
- [Issue 09: Pending Actions widget](09-pending-actions-widget.md)
- [Issue 10: Recent Injury Feed widget](10-recent-injury-feed-widget.md)
- [Issue 11: Weekly Planner widget](11-weekly-planner-widget.md)
- [Issue 12: Injury Hotspots chart & stat cards](12-injury-hotspots-chart-stat-cards.md)
