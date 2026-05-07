---
title: Rehab Programs + Athlete HEP Checklist
github: https://github.com/SeaDog410/Capstone_Project_2026/issues/4
labels: needs-triage
skill: .claude/skills/to-issues/SKILL.md
---

## What to build

Trainer builds a rehab program for an athlete by selecting exercises from a preset library and specifying sets, reps, and frequency. Athlete logs in and sees a daily checklist of their exercises with checkboxes and a progress bar showing completion percentage for the day.

## Acceptance criteria

- [ ] Database is seeded with 15-20 common rehab exercises on server start
- [ ] Trainer can create a rehab program for an athlete and add exercises from the preset library
- [ ] Each exercise has name, sets, reps, and frequency fields
- [ ] Athlete view shows today's exercise checklist with sets and reps displayed
- [ ] Athlete can check off individual exercises; completion is persisted to the database
- [ ] Progress bar updates in real time as exercises are checked off
- [ ] Trainer can view completion history for an athlete's program

## Blocked by

- [#2 Athlete + Clearance + Coach Roster](02-athlete-clearance-coach-roster.md)
