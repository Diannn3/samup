# Discord Steward

Discord Steward is a local-first, single-guild Discord setup and architect system controlled through **Google Antigravity**, a local MCP server, and a dashboard bound to your laptop.

## What is implemented

- Hard restriction to one configured Discord guild
- Live inventory of roles, channels, permission overwrites, bots, AutoMod rules, and likely ticket/verification resources
- Desired-state YAML for roles, categories, channels, permissions, and Discord AutoMod rules
- Immutable plans with expiry, structural-state hash, confirmation code, audit history, application, and rollback
- Local Antigravity MCP tools over `stdio`
- Local dashboard bound to `127.0.0.1`
- SQLite persistence for snapshots, plans, operations, and audit events
- Windows startup scripts and Antigravity workspace rules, skills, and workflows

## Requirements

- Node.js 22 or newer
- A Discord application and bot token
- `MESSAGE_CONTENT` and `GUILD_MEMBERS` privileged intents enabled
- The bot invited only to the target server
- Google Antigravity

## First setup

```bash
npm run bootstrap
npm run generate:secrets
npm install
npm run typecheck
npm test
npm run build
```

Then place the Discord token and target guild ID in `.env`, edit `apps/daemon/config/server.yaml`, and start:

```bash
npm run dev
```

Open `http://127.0.0.1:5173` and let Antigravity connect through `.agents/mcp_config.json`.

## Safe live-server order

1. Run `steward_health`.
2. Run `steward_inspect_server`.
3. Record protected ticket categories, roles, channels, and bot IDs in `apps/daemon/config/server.yaml`.
4. Generate and preview the setup plan.
5. Apply only the exact reviewed plan.

For a role-color-only change, use `steward_generate_role_color_plan`. It produces no channel, permission, name, or role-creation operations.

## Security boundaries

- The control API is loopback-only.
- The MCP server rejects non-loopback API URLs.
- Every mutation checks the configured guild ID.
- The server owner and bot accounts are protected from member actions.
- Discord `Administrator` is rejected from desired permissions.
- Structural changes require a stored immutable plan and confirmation code.

Read `ANTIGRAVITY_HANDOFF.md`, `docs/SETUP.md`, `docs/ARCHITECTURE.md`, `docs/THREAT_MODEL.md`, and `docs/OPERATIONS.md` before connecting the live server.
