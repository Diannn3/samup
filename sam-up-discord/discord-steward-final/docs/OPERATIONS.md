# Operations guide

## Modes

`shadow` records signals and AI decisions but does not automatically delete or punish. `enforce` enables only the actions allowed in `config/moderation.yaml`.

## Emergency stop

Change `STEWARD_ENFORCEMENT_MODE=shadow` and restart the daemon. Logging, inspection, dashboard access, and case review remain available.

## Antigravity commands

- Inspect: `steward_health`, then `steward_inspect_server`
- Plan: `steward_generate_setup_plan`, then `steward_preview_plan`
- Role colors: `steward_generate_role_color_plan`, then `steward_preview_plan`
- Apply: `steward_apply_plan` with the exact confirmation code
- Roll back: `steward_rollback_plan`
- Cases: `steward_list_cases`, `steward_show_case`, `steward_act_on_case`
- Warnings: `steward_clear_member_warnings`
- Audit: `steward_audit_log`

## Moderation action rules

- `delete` removes the message attached to the case.
- `warn` attempts a DM and always records a local warning strike.
- `timeout` requires the bot role to be above the member.
- `kick` and `ban` are blocked by Discord hierarchy if the target is protected.
- The guild owner and bots are blocked by application guardrails.

## Ticket privacy

Use `protectedTicketKeywords`, protected channel IDs, and `neverAnalyzeProtectedTickets`. Do not send identity documents or verification attachments to the AI provider.

## Recovery

- Plans store rollback data per operation.
- SQLite uses WAL mode.
- Back up `data/steward.sqlite`, `.env`, and `config/` while the service is stopped.
- After a crash, inspect plan statuses and audit history before retrying any mutation.
