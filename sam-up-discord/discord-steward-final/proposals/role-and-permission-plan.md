# Role and Permission Plan

## Roles Strategy
- **Preserve:** `Member`, `Alumni`, `Verified`, `Unverified`, `Admin`, `Executive`
- **Avoid:** Creating committee-specific roles (e.g., Marketing, Scholastics) since this is an online tambayan, not a project management workspace.
- **Discord Architect Bot:** Retain Administrator currently assigned to `Jarvis ng PUMAS` to apply the structural changes.

## Permission Model
- `@everyone`: Baseline access. Restricted from viewing TAMBAYAN, ACADEMICS, INTERESTS, VOICE TAMBAYAN. Can only view START HERE.
- `Verified`: Granted access to view OFFICIAL, TAMBAYAN, ACADEMICS, INTERESTS, VOICE TAMBAYAN.
- `Unverified`: Restricted to START HERE and the `verification` channel.
- `Executive` / `Admin`: Manage messages and kick/ban access preserved (as per manual moderation rules, the bot will not moderate but human moderators can).
- `Ticket Tool` / Verification Bots: Permissions untouched.
