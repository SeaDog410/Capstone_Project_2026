# Issue 08: Dashboard header action buttons

## Parent

[PRD: Trainer Dashboard Overhaul](prd-dashboard-overhaul.md)

## What to build

Overhaul the Trainer Overview header button group. Remove the "Add Athlete" button from the dashboard and add it to the Athletes list view instead. Replace it with two action buttons: "+ New SOAP Note" (primary) and "Record Voice Note" (secondary). Add a context subtitle below the "TRAINER OVERVIEW" title.

This is a pure UI slice — no schema or API changes required.

## Acceptance criteria

- [ ] "Add Athlete" button is removed from the Trainer Overview dashboard header
- [ ] "Add Athlete" button is present and functional in the Athletes list view
- [ ] A primary "+ New SOAP Note" button appears in the dashboard header and navigates to the SOAP note creation form
- [ ] A secondary "Record Voice Note" button appears in the dashboard header and opens the existing voice note recording UI
- [ ] The dashboard title area shows "TRAINER OVERVIEW" with a context subtitle line below it
- [ ] Button styling matches the design system: primary is solid red with white text, secondary is distinct but consistent

## Blocked by

None — can start immediately.
