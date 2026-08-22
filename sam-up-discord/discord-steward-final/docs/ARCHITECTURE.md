# Architecture

## Control plane

Antigravity starts `apps/mcp` over stdio. The MCP process calls the daemon's localhost API using `STEWARD_LOCAL_TOKEN`. No Discord message, slash command, or DM can reach the control plane.

## Runtime plane

The daemon owns the Discord Gateway connection, REST operations, moderation engine, plan executor, SQLite database, and local API.

## Dashboard

The dashboard is a local React application. It is read/write only after the user enters `DASHBOARD_PASSWORD`. The password is held in session storage and sent only to `127.0.0.1`.

## Planning model

Desired server configuration is read from YAML. The planner compares it to a live snapshot and creates an ordered immutable plan. The plan hash covers its operations. Applying a plan requires both the plan ID and generated confirmation code.

## Moderation model

1. Ignore other guilds and bot messages.
2. Respect excluded and ticket-protected channels.
3. Run deterministic anti-spam checks.
4. Optionally run Gemini structured classification.
5. Store a moderation case.
6. In shadow mode, take no AI-driven action.
7. In enforcement mode, only explicitly enabled deterministic actions may execute.
