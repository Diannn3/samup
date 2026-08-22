---
name: tune-moderation-policy
description: Improve config/moderation.yaml using observed false positives, false negatives, and server rules while keeping a staged rollout.
---

# Tune moderation policy

1. Review recent cases and audit events.
2. Group outcomes by signal and channel type.
3. Identify false-positive patterns, especially links, verification messages, and event promotions.
4. Change one threshold or category at a time.
5. Keep AI in shadow mode until a representative evaluation set is reviewed.
6. Run tests and simulations.
7. Document the policy change and expected impact.
8. Never enable automatic kicks or bans as part of a threshold-only change.
