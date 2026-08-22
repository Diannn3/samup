# Threat model

## Protected assets

- Discord bot token
- Gemini API key
- Guild structure and permissions
- Verification/ticket data
- Moderation evidence
- Audit and rollback history

## Main threats and controls

### Prompt injection from Discord messages

Discord content is only classification input. It is never routed into MCP tool execution or configuration planning.

### Cross-guild actions

Every adapter, route, and plan validates the exact configured guild ID.

### Destructive configuration mistakes

Structural actions require a stored plan, hash validation, confirmation code, audit reason, and ordered executor. Rollback reverses supported operations.

### Permission escalation

The validator and Discord adapter reject the `Administrator` permission. Protected role and channel IDs cannot be modified by a plan.

### Local unauthorized control

The API binds to loopback only. MCP requires `STEWARD_LOCAL_TOKEN`; dashboard routes require `DASHBOARD_PASSWORD`.

### Sensitive verification content exposure

Ticket/verification channels are detected and protected. Their attachments are never sent to Gemini when `neverAnalyzeProtectedTickets` is enabled.

### AI false positives

Default mode is shadow. AI output is schema-validated and converted into a case; it does not directly call Discord punishment methods.
