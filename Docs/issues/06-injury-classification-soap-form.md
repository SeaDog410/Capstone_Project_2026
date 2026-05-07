# Issue 06: Injury Classification fields on SOAP form

## Parent

[PRD: Trainer Dashboard Overhaul](prd-dashboard-overhaul.md)

## What to build

Add a structured "Injury Classification" section to the top of the SOAP note form. This is a thin vertical slice that adds two new fields — `injury_type` (free text) and `body_part` (dropdown) — from the database schema all the way through to the UI.

The schema gains two nullable TEXT columns on `encounters`. The POST and GET encounters API routes are updated to accept and return the new fields. The SOAP form renders a new section above the S/O/A/P narrative fields containing an Injury Type text input and a Body Part dropdown with 8 anatomical options.

## Acceptance criteria

- [ ] `encounters` table has `injury_type TEXT DEFAULT ''` and `body_part TEXT DEFAULT ''` columns (added via ALTER TABLE on startup)
- [ ] `POST /api/encounters` accepts `injury_type` and `body_part` in the request body and persists them
- [ ] `GET /api/encounters` returns `injury_type` and `body_part` for every encounter record
- [ ] SOAP form renders an "Injury Classification" section above the S/O/A/P fields
- [ ] Injury Type is a free-text input field
- [ ] Body Part is a dropdown with options: Ankle/Foot, Knee, Hip/Thigh, Shoulder, Elbow/Wrist/Hand, Head/Neck, Spine/Back, Other
- [ ] Both fields are optional — existing SOAP form submission still works with neither field filled
- [ ] Existing encounter records load without error (empty strings for both fields)

## Blocked by

None — can start immediately.
