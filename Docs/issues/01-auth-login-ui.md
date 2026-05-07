
---
title: Auth + Login UI
github: https://github.com/SeaDog410/Capstone_Project_2026/issues/1
labels: needs-triage
skill: .claude/skills/to-issues/SKILL.md
---

## What to build

Implement end-to-end authentication: SQLite database initialization with the full schema, user register/login API endpoints, JWT generation and validation middleware, and a login screen in the frontend that replaces the current mock landing page. After login, the sidebar nav renders only the links appropriate for the logged-in user's role (trainer, athlete, or coach).

## Acceptance criteria

- [ ] SQLite database initializes on server start with all tables (users, athletes, encounters, rehab_programs, rehab_exercises, rehab_completions, inventory, inventory_loans) each including updated_at and sync_status columns
- [ ] POST /auth/register creates a user with a hashed password and returns a JWT
- [ ] POST /auth/login returns a JWT for valid credentials and 401 for invalid
- [ ] All non-auth routes reject requests with missing or expired JWT tokens
- [ ] Login screen is the first view shown on page load
- [ ] After login, the correct role-based nav items are shown (trainer / athlete / coach)
- [ ] JWT is stored in localStorage and sent as Authorization: Bearer header on all API requests

## Blocked by

None - can start immediately
