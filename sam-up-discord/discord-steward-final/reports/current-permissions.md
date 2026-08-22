# Current Permissions Audit

## Key Findings
- `Admin` and `Jarvis ng PUMAS` have the `Administrator` permission.
- `Executive` has extensive permissions including `KickMembers`, `BanMembers`, `ManageMessages`, `ModerateMembers`.
- Bots like `Dyno` and `Ticket Tool` have typical elevated permissions.
- `Member`, `Alumni`, `Verified`, `Unverified` have no explicit server-level permissions configured (relies on `@everyone` or channel overrides).
- `@everyone` has typical baseline permissions (`SendMessages`, `ViewChannel`).

## Channel Overrides
- Most categories restrict `@everyone` from `ViewChannel`.
- `Member` and `Alumni` roles are explicitly granted `ViewChannel` across the server.
- The `BULLETIN BOARD` (and its `verification` channel) is accessible to `Unverified` and specific ticket owners. `@everyone` cannot see the verification channel or send messages.
