# SAM-UP Redesign Source of Truth

**Project:** SAM-UP institutional website
**Repository:** `Diannn3/samup`
**Plan date:** 22 September 2026
**Implementation doctrine:** Correct the truth, structure the tasks, establish the system, then add delight.

This document is the repository-level implementation contract for the current redesign. It is derived from the SAM-UP Constitution (10 November 2018), the A.Y. 2026–2027 Bylaws, current UPLB OSA information, the September 2026 repository audit, and the companion research plan created for this redesign.

## Source hierarchy

When sources disagree, use this order unless a newer explicit project instruction supersedes it:

1. new explicit project instruction;
2. current official UPLB/OSA source for registration and present public restrictions;
3. current A.Y. 2026–2027 SAM-UP Bylaws for operational rules, without assuming every rule is public;
4. SAM-UP Constitution for foundational identity, principles, objectives, and structure;
5. current official SAM-UP public channels for recruitment, events, schedules, and announcements;
6. approved organization documents/data;
7. repository data only when provenance is documented;
8. reliable third-party reporting as corroboration;
9. design/community sources only for design inspiration.

Do not average conflicting sources. Current public claims must follow the highest-ranked current source.

## Foundational facts safe to use

- Society of Applied Mathematics of UPLB (SAM-UP).
- Self-governing academic organization based at UPLB.
- Constitution states OSA recognition on 27 November 1984.
- Official colors: black and gold.
- Official seal contains the piu within concentric circles.
- Constitutional objectives include promoting the relevance and wider application of Applied Mathematics, helping UPLB achieve its purposes, academic excellence, and members' moral/social development.
- Constitutional principles include the university as a microcosm of society; equality, unity, loyalty, and commitment; and collective leadership with criticism/self-criticism.

Do not manufacture an official mission/vision statement from these clauses.

## Current operational facts need current evidence

### Membership

Do not present the 2018 Resident/Affiliate wording as current recruitment eligibility. Current UPLB OSA information for First Semester A.Y. 2026–2027 states that SAM-UP is college-based and that only CAS students may apply. Degree-program-specific recruitment instructions must come from the current SAM-UP recruitment announcement. When the two layers are shown, label them separately as constitutional definitions and current recruitment guidance.

### Officers

`senior_executives.json` is a historical Senior Executive archive. It does not authorize a current full Executive Committee roster.

### Events and programs

No item is "upcoming", "scheduled", "active", or "open" without a current source/date. Recurring historical activity is not automatically a currently scheduled event.

### Partnerships

Do not expose sponsor rates, unexecuted promises, MOA internals, compliance screenshots, negotiation notes, or account-access procedures without approval.

## P0 repository defects

1. **UPLB Math Wizard ownership:** current public evidence attributes the Annual Search for the UPLB Math Wizard to UPLB Mathematical Sciences Society, not SAM-UP. Remove it from SAM-UP program/event data unless a current authoritative source documents a specific SAM-UP role.
2. **Membership copy:** stop describing current application eligibility as simply "students outside BS Applied Mathematics" for Affiliate membership.
3. **Resources syllabus:** remove unsupported inferred topic/course expansions and Math 165 unless approved evidence exists.
4. **Program status:** peer tutorials/athletics names and status require current/approved evidence before appearing as active programs.
5. **Reporting dossier:** `/reporting` is a separate personal applicant-reporting experience. It must not be promoted as part of the institutional public navigation.
6. **Reporting viewport:** restore browser zoom; do not use `maximum-scale=1.0` or `user-scalable=no`.

## Public/private visibility model

```ts
type Visibility = 'public' | 'public-summary-only' | 'historical' | 'internal' | 'needs-approval' | 'private';
```

Never publish `internal`, `needs-approval`, or `private` content by default.

High-risk classes include member/applicant personal data, discipline/merit data, internal finances, credentials, negotiations, unapproved partner obligations, and personal reporting material.

## Evidence model

```ts
type EvidenceStatus =
  | 'verified-current'
  | 'verified-foundational'
  | 'historical'
  | 'official-but-stale'
  | 'needs-approval'
  | 'unknown'
  | 'blocked';

interface EvidenceMeta {
  status: EvidenceStatus;
  visibility: Visibility;
  sourceLabel: string;
  sourceUrl?: string;
  sourceDocument?: string;
  sourceDate?: string;
  reviewedAt: string;
  validUntil?: string;
  notes?: string;
}
```

Public content must have a publishable visibility state and satisfy freshness requirements for the route.

## Product goal

The institutional site serves five primary audiences:

1. prospective members — identity, current recruitment status/eligibility, official next step;
2. UPLB students — useful programs, resources, events;
3. partners/sponsors — credibility, collaboration value, contact path;
4. alumni/current community — history, Chronicle, continuity;
5. general visitors — a concrete understanding of why Applied Mathematics matters.

A high-value task should be discoverable within two interactions from the homepage.

## Design direction: Mathematical Editorial Institution

- SAM-UP before trend: black/gold/piu identity drives the system.
- Content before chrome.
- Mathematical structure may inspire grids, diagrams, contours, coordinates, and transformations, but must support comprehension.
- Premium means restraint.
- Motion communicates state, orientation, feedback, or relationship.
- Current claims carry source/freshness context.
- Static-first Astro. React/WebGL only when interaction earns its cost.

### Visual system

- palette: graphite/black, gold, warm paper/off-white, neutral gray, semantic status colors;
- no decorative emerald/blue glow system as a default brand layer;
- body/interface: Plus Jakarta Sans Variable;
- editorial/display: Newsreader Variable;
- metadata/data labels: JetBrains Mono Variable;
- Cinzel should be retired or limited to rare heritage moments;
- four surface roles only: canvas, reading, elevated/interactive, special identity/glass;
- no universal frosted glass;
- controlled radius scale; hairline borders and mathematical linework over excessive shadows;
- hero: static piu/seal composition first, optional progressive 3D second.

### Motion priority

1. CSS;
2. Astro View Transitions;
3. Motion for specific React interactions;
4. Three.js for optional identity exploration;
5. GSAP only for a demonstrated complex timeline.

Respect `prefers-reduced-motion` and never require decorative motion to understand content.

## Performance rules

Public content must work without JavaScript. Prefer Astro markup, zero-hydration components, and `client:visible`/`client:idle` for noncritical islands. No Pixi/Three in initial public bundles unless the route is explicitly interactive.

Hero WebGL must be progressively enhanced: static mobile fallback, deferred import, lower DPR, clean disposal, offscreen/hidden pause, and reduced-motion/data-saving behavior.

Targets:

- LCP <= 2.5s lab target;
- CLS <= 0.1;
- TBT <= 200ms lab target;
- homepage core JS < 150 KB gzip before optional 3D.

## Accessibility

Target WCAG 2.2 AA. Required: keyboard-complete interactions, visible focus, correct landmarks/headings, practical touch targets, browser zoom, no hover-only information, reduced-motion support, robust dialogs/menus, intrinsic image dimensions, accessible search, and semantic fallback for canvas/WebGL.

## Target information architecture

Primary navigation target:

- Explore Applied Math
- Programs & Events
- Resources
- About
- Partners
- Join SAM-UP (prominent action)

Utility/footer: Search, Chronicle/Archive, Governance.

Do not include `/reporting` in institutional navigation.

Target route family (add only when content exists):

```text
/
/explore/
/programs/
/events/[slug]/
/resources/
/join/
/partners/
/about/
/governance/
/archive/
/archive/leadership/
/chronicle/
/search/
/reporting/  # separate scope, no public-nav promotion
```

## Content architecture

All programs/events/resources should carry evidence metadata. Any collaborative event must record `organizer` and `samUpRole` separately. Governance metadata must record document version/date/visibility. Applied Math explainers need sources and an accessibility description.

## Dependency policy

Planned foundation when lockfile can be safely regenerated:

- `@base-ui/react`
- self-hosted variable fonts via Fontsource
- `@astrojs/sitemap`
- Pagefind
- QA: axe, Lighthouse CI, bundle analyzer, Astro check, Prettier/Astro plugin

Feature-gated only: KaTeX and JSXGraph.

Do not add another full primitive system, Lenis/global smooth scrolling, random background/particle libraries, a hosted CMS, or another state manager for public pages.

Existing dependency disposition:

- GSAP: remove if still unused;
- Motion: intentionally use for a small number of interactions or remove;
- Three.js: retain only if progressive hero survives performance/usability review;
- Pixi/Pixi Viewport/Zustand: reporting-only and must not leak into public bundles.

## QA policy

Eventually support:

```bash
npm run format:check
npm run check
npm run build
npm run test:a11y
npm run qa:audit
npm run qa:visual
npm run perf:lhci
```

Test mobile through wide desktop, normal/reduced motion, keyboard-only, touch/coarse pointer, zoom, and high-contrast spot cases.

## Atomic implementation sequence

Keep every commit buildable and scoped. Split further when needed.

### Phase 0 — trust foundation

1. `docs: add SAM-UP redesign source-of-truth and implementation contract`
2. `docs: replace starter README with SAM-UP project documentation`
3. remove tracked debug artifacts and document artifact policy
4. add safe type/check/format tooling when lockfile can be regenerated
5. add accessibility smoke tests
6. add Lighthouse baseline/budgets
7. add bundle analysis tooling

### Phase 1 — factual correctness

8. add evidence/visibility metadata types
9. remove misattributed UPLB Math Wizard listing
10. quarantine unverified current program claims
11. remove unsupported resource syllabus details
12. separate constitutional membership definitions from current eligibility
13. add current recruitment evidence model with safe fallback

### Phase 2 — content architecture

14. typed programs/events collection
15. migrate only verified event content
16. resource collection
17. Chronicle/governance schemas
18. fail validation for invalid public evidence states

### Phase 3 — design foundation

19. SAM-UP design tokens
20. self-host typography
21. Base UI foundation
22. accessible mobile dialog primitive
23. canonical button/link/surface components

### Phase 4 — navigation and shell

24. task-led public navigation
25. remove reporting dossier from institutional nav
26. Pagefind indexing
27. accessible global search
28. institutional footer/trust links

### Phase 5 — homepage

29. content-first SSR hero
30. progressive Three.js enhancement
31. WebGL lifecycle/texture optimization
32. stable verified facts instead of animated proof strip
33. source-aware current-status module
34. Applied Math promotional feature slot
35. Join + Partners conversion sections

### Phase 6 — core pages

36. editorial About page
37. public-safe Governance hub
38. collection-driven Programs listing
39. sourced event detail page
40. verified Resources page
41. dedicated current Join page
42. Partners landing page
43. historical leadership archive positioning
44. Chronicle archive bridge

### Phase 7 — Applied Math value

45. server-rendered math component
46. first sourced Applied Math explainer
47. accessible visualization enhancement only after static content passes review

### Phase 8 — reporting scope

48. restore zoom
49. noindex reporting route
50. keyboard/semantic fallback coverage

### Phase 9 — restrained polish

51. restrained route transitions
52. standardized reduced-motion policy
53. reduce blur/glow duplication
54. normalize piu-derived editorial motifs
55. remove decorative interaction with no UX purpose

### Phase 10 — SEO

56. canonical site + sitemap
57. route metadata + verified structured data
58. social preview system

### Phase 11 — final QA/prune

59. expand browser audit
60. visual regression baselines
61. enforce Lighthouse/bundle budgets
62. remove unused dependencies based on final import graph
63. remove dead legacy components
64. document content publishing/evidence review
65. redesign release notes/follow-ups

## Atomic commit rules

Each commit:

- solves one concern;
- uses a descriptive conventional commit message;
- preserves route usability unless explicitly removing unsupported content;
- includes behavioral tests when behavior changes;
- does not mix dependency upgrades with unrelated UI;
- does not mix factual corrections with aesthetic redesign unless inseparable;
- never silently changes authoritative wording.

## Stop conditions

Do not invent a solution when current event ownership, recruitment eligibility, current officers, partner claims, source conflicts, licenses, or dependency chains are uncertain. Omit the content or render an honest source-aware fallback.

## Definition of done

The redesign is not done until factual P0s are resolved, task-led IA is in place, reporting is separate in scope, current states are evidence-aware, unsupported claims are gone, typography is self-hosted, public pages work without JS, 3D is progressive, search/accessibility/performance gates pass, Partners and Applied Math systems exist, dependency baggage is pruned, publishing workflow is documented, and implementation history remains atomic.
