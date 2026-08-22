---
name: audit-discord-server
description: Inspect the configured student-organization Discord server, identify its existing structure and ticket system, and produce a no-change audit. Use before setup planning or permission work.
---

# Audit Discord server

1. Call `steward_health`.
2. If the daemon is unavailable, diagnose local setup without exposing secrets.
3. Call `steward_inspect_server`.
4. Summarize categories, channels, roles, role hierarchy, permissions, bots, AutoMod rules, and ticket hints.
5. Flag likely ticket/verification resources that should be added to protected IDs.
6. Identify duplicate, orphaned, hidden, or risky resources.
7. Make no Discord changes.
8. Save recommendations in `docs/audits/` with the date.
