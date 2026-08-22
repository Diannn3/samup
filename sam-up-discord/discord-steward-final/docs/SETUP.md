# Setup guide

## 1. Discord application

Create a Discord application, add a bot, and enable these privileged intents on the Bot page:

- Server Members Intent
- Message Content Intent

Invite the bot to your one target server. Do not grant `Administrator`. Recommended starting permissions:

- View Channels
- Send Messages
- Embed Links
- Read Message History
- Manage Messages
- Manage Channels
- Manage Roles
- Manage Guild
- Moderate Members
- View Audit Log

Keep the bot role below owner/adviser roles and above roles it must manage.

## 2. Environment

Create local config files, generate local secrets, and fill the Discord values. The secret generator writes values directly to `.env` and does not print them.

```bash
npm run bootstrap
npm run generate:secrets
```

The dashboard password is kept only in browser session storage. The MCP process loads `STEWARD_LOCAL_TOKEN` from the local `.env` file and never exposes it through Discord.

## 3. Antigravity MCP

Antigravity supports workspace MCP definitions at `.agents/mcp_config.json`. The included config launches the compiled MCP server over `stdio`.

After running `npm run build`, reload MCP servers inside Antigravity.

## 4. Existing ticket system

Do not rename or move ticket/verification categories until the first inspection is complete. The inspector identifies likely ticket channels and bot accounts using names and permission patterns. Add exact protected IDs to `apps/daemon/config/server.yaml` after inspection.

## 5. First launch

```bash
npm install
npm run build
npm run start
```

For active development:

```bash
npm run dev
```

The daemon API listens at `http://127.0.0.1:4317`. The dashboard listens at `http://127.0.0.1:5173` and proxies API calls to the daemon. Both hosts are fixed to loopback addresses.
