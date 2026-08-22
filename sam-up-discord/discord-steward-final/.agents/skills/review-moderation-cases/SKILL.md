---
name: review-moderation-cases
description: Review open moderation cases, distinguish deterministic evidence from Gemini recommendations, and resolve false positives safely.
---

# Review moderation cases

1. Call `steward_list_cases` with status `open`.
2. Open relevant cases with `steward_show_case`.
3. Separate objective signals from contextual AI judgment.
4. Treat protected ticket cases as redacted and do not seek hidden identity content.
5. Recommend resolution, but do not invent missing context.
6. Resolve or dismiss only after the user decides.
7. Record a clear resolution note through `steward_resolve_case`.
