# PRD: Trainer Dashboard Overhaul

## Problem Statement

The current Trainer Overview dashboard presents three large summary cards (Total Athletes, Limited / Out, Cleared) and a single Add Athlete button. This layout fails to surface the daily operational information a trainer actually needs: which athletes require immediate attention, who has recent injuries, what sessions are scheduled this week, and how injury trends are tracking over the season. Trainers must navigate away from the dashboard to answer questions that should be visible at a glance.

## Solution

Redesign the Trainer Overview dashboard across four phases: replace the coarse KPI cards with a rich Team Health Summary widget, introduce a curated feed of pending actions and recent injuries, add a weekly planner derived from existing encounter and rehab data, and anchor the bottom of the dashboard with a comparative injury trends chart. All new widgets pull live data from the existing API, with targeted schema additions to support structured injury classification.

## User Stories

1. As a trainer, I want a single Team Health Summary card showing Active Athlete count with HEALTHY / LIMITED / OUT breakdowns, so that I can assess team readiness at a glance without navigating to the athlete list.
2. As a trainer, I want to toggle the Team Health Summary between a donut chart and a horizontal bar chart, so that I can switch between proportional and absolute views of athlete status.
3. As a trainer, I want the HEALTHY / LIMITED / OUT counts to reflect live clearance_status values (green / yellow / red) from the database, so that the dashboard always reflects the current state of the roster.
4. As a trainer, I want a prominent "+ New SOAP Note" button in the dashboard header, so that I can begin documenting an encounter without leaving the overview.
5. As a trainer, I want a "Record Voice Note" button in the dashboard header that opens the existing voice recording flow, so that I can capture a quick audio note from the overview screen.
6. As a trainer, I want the dashboard title area to display context-specific session text below "TRAINER OVERVIEW", so that the header communicates which team or session is active.
7. As a trainer, I want a Pending Actions widget that lists encounters where both the Assessment and Plan SOAP fields are empty, so that I can identify and finish incomplete SOAP notes without searching through all encounters.
8. As a trainer, I want the Pending Actions widget to list athletes who have logged at least one rehab completion in the last 7 days, so that I can review recent rehabilitation progress without navigating to each athlete profile.
9. As a trainer, I want each item in the Pending Actions widget to be clickable and navigate to the relevant record, so that I can act on items directly from the dashboard.
10. As a trainer, I want the Pending Actions header to display a total count badge labeled "URGENT", so that I can see the number of outstanding actions without scanning the full list.
11. As a trainer, I want a Recent Injury Feed widget showing athlete name, injury type, body part, clearance status badge, and log timestamp, so that I can quickly review who was recently injured and their current status.
12. As a trainer, I want to filter the Recent Injury Feed between "WEEKLY" (last 7 rolling days) and "ALL" (all time), so that I can focus on current injuries or review the full history.
13. As a trainer, I want athlete entries in the Recent Injury Feed to show an initials-based avatar using the athlete's name, so that rows are visually distinct without requiring profile photos.
14. As a trainer, I want a "VIEW FULL INJURY REGISTRY" link at the bottom of the Recent Injury Feed, so that I can navigate to the complete encounter list with one click.
15. As a trainer, I want a Weekly Planner widget showing a 7-day calendar view populated with encounter dates and rehab completion dates, so that I can see what sessions are on record for the current week.
16. As a trainer, I want the Weekly Planner to include navigation arrows and a "TODAY" button, so that I can move between weeks and quickly return to the current week.
17. As a trainer, I want the SOAP note form to include an "Injury Classification" section at the top with an Injury Type free-text field and a Body Part dropdown, so that I can tag structured diagnosis data before filling in the SOAP narrative.
18. As a trainer, I want the Body Part dropdown to offer 8 anatomical regions (Ankle/Foot, Knee, Hip/Thigh, Shoulder, Elbow/Wrist/Hand, Head/Neck, Spine/Back, Other), so that injury data is consistently grouped for analytics.
19. As a trainer, I want an Injury Hotspots & Rates area chart showing monthly injury counts for the current season alongside a static prior-season baseline, so that I can identify seasonal trends and compare to historical norms.
20. As a trainer, I want the Injury Hotspots chart X-axis to show the last 6 rolling calendar months dynamically, so that the chart always displays recent data regardless of time of year.
21. As a trainer, I want a "TOP INJURY SITE" stat card below the chart showing the most frequently tagged body part and its percentage, so that I can identify which anatomical region needs the most attention.
22. As a trainer, I want a "TOP MECHANISM" stat card showing the most common injury type text across all encounters, so that I can identify recurring injury patterns.
23. As a trainer, I want a "RATE CHANGE" stat card comparing the current season encounter count to the hardcoded baseline total with a directional arrow, so that I can gauge whether injury rates are improving or worsening.
24. As a trainer, I want the Add Athlete action removed from the main dashboard header and available only within the Athletes list view, so that the dashboard header stays focused on daily workflow actions.
25. As a trainer, I want all new dashboard widgets to follow the existing design system (Lexend font, Power Red #9e0000, sharp corners, uppercase labels, bold borders), so that the interface is visually consistent.

## Implementation Decisions

### Schema Changes
- Add `injury_type TEXT` column to the `encounters` table — free-text diagnosis label entered by the trainer.
- Add `body_part TEXT` column to the `encounters` table — constrained to: Ankle/Foot, Knee, Hip/Thigh, Shoulder, Elbow/Wrist/Hand, Head/Neck, Spine/Back, Other.
- Both columns are nullable and default to empty string to preserve backwards compatibility with existing encounter records.
- Schema migration via `ALTER TABLE` on app startup alongside existing `initSchema` logic.

### New API Endpoint
- `GET /api/dashboard/summary` (trainer/admin only) returns a single aggregated payload:
  - `healthSummary`: counts of athletes grouped by clearance_status (green → HEALTHY, yellow → LIMITED, red → OUT)
  - `pendingActions`: array of incomplete SOAP items (encounters where assessment = '' AND plan = '') and rehab-active athletes (at least one completion in last 7 days), each with type, athlete name, and relevant timestamp
  - `pendingCount`: total count of all pending items
- Existing endpoints (`GET /api/encounters`, `GET /api/rehab/programs`) continue to serve raw list data for the Recent Injury Feed and Weekly Planner widgets.

### Frontend Modules
- **Team Health Summary Card** — fetches from `/api/dashboard/summary`, renders donut and bar chart via Chart.js (CDN), toggles on icon button click.
- **Pending Actions Widget** — fetches from `/api/dashboard/summary`, renders action list with type-specific icons and navigation links.
- **Recent Injury Feed Widget** — fetches from `/api/encounters`, filters client-side by 7-day window or all-time, renders initials avatars via a utility function (first letter of first name + first letter of last name).
- **Weekly Planner Widget** — fetches from `/api/encounters` and `/api/rehab/programs` (completions), merges by date, renders a 7-day grid with week navigation.
- **Injury Hotspots Chart** — Chart.js area/line combo, live series from `/api/encounters` grouped by month and body_part, baseline series hardcoded as a static JS array matching the last 6 calendar months.
- **Stat Cards (TOP INJURY SITE, TOP MECHANISM, RATE CHANGE)** — computed client-side from the encounters payload; RATE CHANGE compares live encounter count to hardcoded baseline total.

### Charting Library
- Chart.js loaded via CDN — no build step required. Consistent with existing Tailwind CDN setup.

### SOAP Form Update
- Injury Classification section added at the top of the SOAP form, above the S/O/A/P fields.
- Injury Type: `<input type="text">` with placeholder.
- Body Part: `<select>` with the 8 defined options plus an empty default.
- Both fields are optional.

### Navigation
- "Add Athlete" button removed from dashboard header, added to the Athletes list view only.
- "Record Voice Note" button in dashboard header triggers the existing voice note UI flow.

## Testing Decisions

A good test for this feature validates external behavior — what the user sees and what data is returned — not implementation details like function names or internal state.

**Modules to test:**

- `GET /api/dashboard/summary` — verify it returns correct health counts when athletes have known clearance statuses; verify pending actions list includes encounters with empty assessment+plan and excludes encounters with content; verify rehab-active athletes appear when completions exist within last 7 days and do not appear when completions are older.
- `GET /api/encounters` with new `injury_type` and `body_part` fields — verify fields are returned in response and persist correctly on POST.
- Initials avatar utility — verify "Marcus Thompson" → "MT", single-name athletes fallback gracefully.

**Testing approach:** Integration tests against the real SQLite database (not mocks), consistent with the existing route test patterns in the codebase.

## Out of Scope

- **Full scheduling/appointments system** — the Weekly Planner derives from existing encounters and rehab completions only. A dedicated appointments table and scheduling workflow is a future feature.
- **Athlete profile photos** — initials avatars are used throughout. Photo upload is a separate feature.
- **Mobile/tablet responsive layout** — the redesigned dashboard is desktop-only. Responsive breakpoints for the new widgets are a follow-up.
- **Coach clearance workflow** — the "Coach Clearance" pending action type (coach requests trainer approval of availability list) is not implemented. It requires a multi-role workflow that does not yet exist.
- **Draft SOAP note saving** — there is no explicit "Save Draft" action. Incomplete SOAPs are identified post-hoc by empty Assessment and Plan fields.
- **Two-tier urgency in Pending Actions** — all pending items are treated as equally urgent. Severity tiers are out of scope.

## Further Notes

- The prior-season baseline data for the Injury Hotspots chart is hardcoded as a static JS array. When real historical data accumulates, this should be replaced with a server-side aggregation query.
- The `body_part` field is free-text at the DB level (TEXT column) but constrained to the 8 options via the UI dropdown. Future migrations can add a CHECK constraint once the option set stabilizes.
- Lexend font, Power Red (#9e0000), sharp (0px) corners, uppercase labels, and bold borders must be maintained across all new components per the design system defined in Docs/DESIGN.md.
