---
title: Athlete + Clearance + Coach Roster
github: https://github.com/SeaDog410/Capstone_Project_2026/issues/2
labels: needs-triage
skill: .claude/skills/to-issues/SKILL.md
---

## What to build

Trainer can create athlete profiles and set each athlete's clearance status (Red / Yellow / Green). Coach logs in and sees a read-only roster table showing only athlete name, sport, and clearance badge — no medical details. This slice delivers a complete end-to-end flow from trainer action to coach view.

## Acceptance criteria

- [ ] Trainer can create an athlete profile (name, sport, team) linked to a user account
- [ ] Trainer can set clearance status to Red, Yellow, or Green from the athlete profile
- [ ] Clearance status is persisted to the database and reflected immediately in the UI
- [ ] Coach view shows a roster table with Athlete Name, Sport, and clearance badge only
- [ ] Coach cannot navigate to any trainer or athlete-specific views
- [ ] Trainer roster view displays all athletes with their current clearance status

## Blocked by

- [#1 Auth + Login UI](01-auth-login-ui.md)
