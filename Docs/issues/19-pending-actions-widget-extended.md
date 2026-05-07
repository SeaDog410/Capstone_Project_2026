# Issue 19: Pending Actions Widget — Clearance Tasks Integration

## Parent

[PRD: Sprint 2 Functional Enhancements](../PRD_Sprint2.md)

## What to build

Extend the Pending Actions widget (built in Issue 09) to include clearance tasks as a third action type alongside incomplete SOAP drafts and rehab reviews. This slice extends the dashboard summary API and updates the frontend widget renderer.

**API change:** Extend `GET /api/dashboard/summary` to include a `clearanceTasks` array of pending clearance tasks (status = `'pending'`), each containing `id`, `athlete_name`, `note`, and `created_at`. Update `pendingCount` to include the clearance task count.

**Frontend change:** The Pending Actions widget renders clearance task items below SOAP drafts and rehab reviews. Each clearance task item displays the athlete name and note text with a "CLEARANCE" type label and a direct link to the athlete's profile modal. The "N URGENT" count badge reflects all three action types combined.

## Acceptance criteria

- [ ] `GET /api/dashboard/summary` returns a `clearanceTasks` array of pending tasks
- [ ] `pendingCount` includes clearance tasks in the total
- [ ] Clearance task items render in the Pending Actions widget with athlete name, note, and "CLEARANCE" label
- [ ] Clicking a clearance task item opens the athlete's profile modal
- [ ] The "N URGENT" count badge reflects all three action types
- [ ] The 3 seeded clearance tasks appear in the widget on first load
- [ ] Existing SOAP draft and rehab review items are unaffected
- [ ] Styling matches the design system

## Blocked by

- [Issue 09: Pending Actions widget](09-pending-actions-widget.md) — base widget must exist
- [Issue 18: Clearance Tasks — Full Slice](18-clearance-tasks.md) — clearance tasks API must exist before the dashboard summary can include them
