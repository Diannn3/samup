# Antigravity handoff

Open this repository as the workspace in Google Antigravity. Antigravity is the only intended control surface; the bot exposes no administrative Discord commands.

## First prompt

> Load all workspace rules. Read README.md, docs/SETUP.md, docs/ARCHITECTURE.md, docs/THREAT_MODEL.md, docs/OPERATIONS.md, and VERIFICATION_REPORT.md. Run `python scripts/validate_repo.py`, `npm install`, `npm run typecheck`, `npm test`, and `npm run build`. Fix every failure before connecting Discord. Never print or open `.env`. Do not make Discord changes yet.

## First live inspection

After `.env` and `apps/daemon/config/server.yaml` are configured and the daemon is running:

> Run `/audit-server`. Preserve the existing verification and ticket system. Make no Discord changes. Produce a sanitized inventory of roles, channels, permission overwrites, bots, AutoMod rules, ticket categories, ticket panels, verification roles, and likely transcript channels. Recommend the exact IDs to add to the protected lists.

## Setup workflow

> Run `/plan-setup`. Compare the desired YAML with the live guild. Show every operation, dependency, risk level, plan hash, and rollback behavior. Do not call `steward_apply_plan` until I approve that exact plan and confirmation code.



## Available control tools

- Health and inspection
- Setup-plan generation, preview, apply, and rollback

- Audit-log review

## Secret handling

Run `npm run generate:secrets`; it writes local secrets directly to `.env` and does not print them. Add Discord credentials manually. Never ask Antigravity to display `.env`.
