# Ticket and verification protection

- Existing ticket infrastructure is third-party-owned until identified.
- Do not delete, rename, move, or rewrite likely ticket/verification resources automatically.
- Add exact IDs to `config/server.yaml` protected lists after the first audit.
- Redact ticket message previews in local moderation cases.
- Do not transmit ticket attachments to Gemini when `neverAnalyzeProtectedTickets` is true.
- Any future ticket integration must be adapter-based and reversible.
