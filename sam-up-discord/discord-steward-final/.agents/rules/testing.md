# Testing rule

For code changes:

1. Run the narrowest relevant unit tests.
2. Run `npm run typecheck`.
3. Run `npm test`.
4. Run `npm run build`.
5. For dashboard changes, use the browser against localhost and verify login, overview, plans, cases, and responsive layout.
6. For Discord adapter changes, use mocks or a dedicated test guild; never experiment against the production student-org guild without a previewed plan.
7. Report failures honestly and do not weaken tests to make them pass.
