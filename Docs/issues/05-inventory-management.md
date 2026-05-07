---
title: Inventory Management (stretch goal)
github: https://github.com/SeaDog410/Capstone_Project_2026/issues/5
labels: needs-triage
skill: .claude/skills/to-issues/SKILL.md
---

## What to build

Trainer can view and manage inventory items. Consumable stock is adjusted with plus and minus buttons. Equipment can be checked out to an athlete or checked back in via QR code scan, with the loan tracked in the database.

## Acceptance criteria

- [ ] Inventory list shows all items with name, category, and current quantity
- [ ] Plus and minus buttons adjust quantity and persist the change immediately
- [ ] Each inventory item has a QR code; scanning opens a check-out or check-in prompt
- [ ] Check-out links the item to a specific athlete and records the timestamp
- [ ] Check-in clears the active loan and updates item availability
- [ ] Loaned equipment is visually distinguished from available stock in the UI

## Blocked by

- [#1 Auth + Login UI](01-auth-login-ui.md)
