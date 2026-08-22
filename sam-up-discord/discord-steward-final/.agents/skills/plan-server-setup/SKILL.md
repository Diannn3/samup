---
name: plan-server-setup
description: Turn the current live Discord audit and config/server.yaml into a safe previewable structural plan. Use when the user asks to set up or reorganize the one server.
---

# Plan server setup

1. Run the audit skill first.
2. Read `config/server.yaml` and validate the target guild ID.
3. Preserve protected roles/channels and ticket hints.
4. Call `steward_generate_setup_plan`.
5. Call `steward_preview_plan` for the returned ID.
6. Explain every operation, dependency, permission overwrite, risk, and rollback behavior.
7. Do not apply the plan.
8. Ask the user to approve or edit the exact plan.
