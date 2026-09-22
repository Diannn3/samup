# SAM-UP Private Content Audit

Internal review artifact. Not imported by Astro routes.

| Claim | File | Current source | Evidence status | Keep/remove/rewrite/defer | Reason |
|---|---|---|---|---|---|
| SAM-UP name and UPLB affiliation | `src/pages/about.astro`, `src/data/organization.ts` | Constitution Art I; organization data | verified | keep | Core identity. |
| Recognition on November 27, 1984 | `src/data/mission.ts`, `src/data/milestones.ts` | Constitution Art I §3 | verified | keep | Founding fact. |
| Black/gold colors and Più/seal | `src/data/mission.ts`, `/about` | Constitution Art II | verified | keep | Authentic identity. |
| Constitutional principles | `src/data/mission.ts`, `/about` | Constitution Art III | verified | rewrite | Use actual three principles; remove invented four-principle framing. |
| Five constitutional objectives | `src/data/mission.ts`, `/about` | Constitution Art IV | verified | keep | Present as mission/objectives, not invented mission/vision copy. |
| Handshake meaning | `/about` | Constitution Art V | verified | keep, concise | Useful identity context; no standalone visualizer. |
| Leadership archive | `/alumni`, `senior_executives.json` | Repository archive | verified | keep, label carefully | Historical archive only; not current Executive Committee. |
| Current Executive Committee roster | Navigation/pages | No approved roster | unknown | defer | Do not create `/executive-committee` or imply current officers. |
| Resident member names / batches | `resident_members.json` | Local file only; no public consent | needsApproval | defer | Do not publish names or batch archive. |
| UPLB Math Wizard | legacy `src/data/events.ts`, former `/events` copy | Current public evidence attributes the Annual Search for the UPLB Math Wizard to UPLB Mathematical Sciences Society | blocked for SAM-UP ownership | remove from SAM-UP listings unless a current source documents SAM-UP's specific role | Repository ownership was incorrect. |
| Peer Tutorial Caravans | legacy `src/data/events.ts`, former `/resources` copy | No current approved public program record ingested | unknown | quarantine/defer | Historical naming is not enough to establish current ownership, scope, or schedule. |
| STRASUC / Intramural Athletics | legacy `src/data/events.ts` | No current approved public program record ingested | unknown | quarantine/defer | Do not present recurring or historical activity as a current SAM-UP program without source-backed role/status. |
| MIA Colloquium | old `events.ts` / legacy sections | No supporting source found | unknown | remove from active data | Unsupported program. |
| Math Building facility directory | old `/resources`, `HubSection` | No approved room source | unknown | remove from active route; legacy retained | Avoid unsupported room details. |
| Merit / dues calculator | old `/resources`, `MeritCalculator` | Bylaws contain fee rules, but no publication approval | needsApproval | remove from active route; legacy retained | Internal finance tool should not be public without approval. |
| “Premier”, “brightest”, “nationwide”, `500+`, `100% placement` | old active copy | No approved source | unknown | remove/rewrite | Prestige, metrics, and scope claims were unsupported. |
| Recruitment Google Form | old MembershipSection | URL returns HTTP 404 | blocked | replace with Facebook/email | Do not expose dead form as active CTA. |
| Facebook/email contact | Membership/footer/events | Verified repository data; Facebook resolves | verified | keep | Approved contact channels. |
