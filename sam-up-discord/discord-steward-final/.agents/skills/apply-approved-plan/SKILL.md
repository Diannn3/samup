---
name: apply-approved-plan
description: Apply a previously generated Discord setup plan only after the user explicitly approved that exact plan. Use for production structural changes.
---

# Apply an approved plan

1. Confirm the plan was previewed in the current conversation.
2. Confirm the user explicitly approved the exact plan ID and operation list.
3. Re-read the plan with `steward_preview_plan`.
4. Stop if it expired, changed, contains unexpected high-risk operations, or targets another guild.
5. Call `steward_apply_plan` with the exact confirmation code and a specific audit reason.
6. Call `steward_inspect_server` and verify the intended final state.
7. Report the plan ID, completed operations, verification result, and rollback path.
