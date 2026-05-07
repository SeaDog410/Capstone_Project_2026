# Issue 21: Recent Injury Feed — Live Data Population

## Parent

[PRD: Sprint 2 Functional Enhancements](../PRD_Sprint2.md)

## What to build

Make the Recent Injury Feed widget (built in Issue 10) meaningful by ensuring it is populated with real encounter data from both the 2025 and 2026 seasons. This slice also wires the feed to correctly surface `injury_type` and `body_part` from encounter records for the Injury Hotspots analytics.

The seeded historical encounter records (from Issue 14) include `injury_type` and `body_part` values across a range of body sites and diagnoses. This slice verifies the feed correctly reads and displays those fields, and that the WEEKLY / ALL toggle accurately reflects the seeded date distribution.

No new API endpoint is needed — the feed uses the existing `GET /api/encounters` endpoint.

## Acceptance criteria

- [ ] Recent Injury Feed displays entries from the seeded 2025 and 2026 encounter records
- [ ] Each row correctly shows `injury_type` and `body_part` from the encounter record
- [ ] WEEKLY filter shows only encounters from the last 7 rolling days (2026 seed data)
- [ ] ALL filter shows the full history across both 2025 and 2026 records
- [ ] Clearance status badges reflect the linked athlete's current clearance status
- [ ] "VIEW FULL INJURY REGISTRY" link navigates to the full encounters list
- [ ] Feed renders without errors when `injury_type` or `body_part` is null on an encounter
- [ ] Existing feed widget styling (Issue 10) is unaffected

## Blocked by

- [Issue 10: Recent Injury Feed widget](10-recent-injury-feed-widget.md) — base feed widget must exist
- [Issue 14: Schema Foundation — Sprint 2](14-schema-foundation-sprint2.md) — seeded encounter data must be present for the feed to be meaningful
