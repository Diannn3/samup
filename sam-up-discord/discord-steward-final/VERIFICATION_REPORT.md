# Verification report

## Completed in this build environment

- Parsed every JSON and YAML file successfully.
- Ran a repository structural validator covering relative imports and accidental `.env` packaging.
- Ran TypeScript across all `.ts` and `.tsx` files in syntax-oriented no-resolution mode; after filtering unavailable external-module diagnostics, no remaining diagnostics were reported.
- Checked source delimiters and relative imports.
- Added tests for duplicate spam, invite spam, hidden Unicode controls, blocked attachment extensions, plan integrity, structural hashing, snapshots, and repository persistence.
- Confirmed the dashboard and MCP expose case actions for delete, warn, timeout, kick, and ban.
- Confirmed single-guild checks, owner/bot protections, role-hierarchy checks, immutable plan confirmation, rollback data, loopback binding, ticket-context privacy, AutoMod planning, warning escalation, edited-message handling, join-burst detection, and profile/image review are present in source.
- Confirmed no real `.env` file is included.

## Dependency-level verification still required after ingestion

The package registry available in this build environment repeatedly timed out, so dependencies could not be installed here. Consequently, a dependency-resolved TypeScript build, Vitest execution, Vite production build, and live Discord API test must be completed inside Antigravity before the bot touches the live server.

Run, in order:

```bash
python scripts/validate_repo.py
npm install
npm run typecheck
npm test
npm run build
```

Any failure is blocking. Fix it before adding a Discord token or starting the daemon.

## Required live rollout

- Begin in `shadow` mode.
- Inspect and protect the existing ticket/verification resources.
- Use a restricted channel and test account for action testing.
- Verify the bot role remains below owner/protected roles and above only the roles it must manage.
- Enable enforcement only after reviewing test cases and audit events.
