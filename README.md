# SAM-UP Institutional Website

Public web platform for the **Society of Applied Mathematics of UPLB (SAM-UP)**.

This repository contains two deliberately separate product scopes:

1. the **public SAM-UP institutional website** — identity, Applied Mathematics promotion, verified programs/resources, recruitment guidance, partnerships, governance, Chronicle/history, and public archives; and
2. the **applicant reporting experience** under `/reporting` — a separate personal reporting/portfolio surface that must not be treated as institutional navigation or a source of public organizational facts.

## Implementation doctrine

> Correct the truth, structure the tasks, establish the system, then add delight.

Before changing public claims or redesigning the information architecture, read:

- `docs/SAMUP_REDESIGN_SOURCE_OF_TRUTH.md`
- `docs/content-audit.md`

The redesign source-of-truth defines source precedence, public/private boundaries, evidence requirements, current known content defects, accessibility/performance expectations, and the atomic implementation sequence.

## Source hierarchy

Public factual claims should prefer, in order:

1. current explicit project instructions;
2. current official UPLB/OSA sources for registration/current restrictions;
3. current A.Y. 2026–2027 SAM-UP Bylaws for operational rules;
4. the SAM-UP Constitution for foundational identity/principles/objectives;
5. current official SAM-UP announcements/channels for active recruitment, schedules, and events;
6. approved organization documents/data;
7. repository data with documented provenance.

Do not infer current officers, event status, recruitment eligibility, sponsor claims, or schedules from historical files.

## Stack

- Astro
- React islands where interaction is justified
- Tailwind CSS
- TypeScript
- Playwright for browser QA
- Three.js for the current public hero experiment
- PixiJS + Pixi Viewport + Zustand for the separate reporting experience

The public website follows a **static-first Astro** policy. Core content should remain readable and usable without JavaScript.

## Project structure

```text
/
├── docs/                     # source-of-truth, content and implementation documentation
├── public/                   # static assets
├── scripts/                  # browser/visual QA helpers
├── src/
│   ├── components/
│   │   ├── interactive/      # React islands
│   │   ├── layout/           # site shell
│   │   ├── reporting/        # reporting-only UI
│   │   ├── sections/         # public-page sections
│   │   ├── ui/               # reusable UI primitives
│   │   └── visualizers/      # legacy/special visual components
│   ├── data/                 # typed data and evidence-backed records
│   ├── layouts/
│   ├── pages/
│   ├── stores/               # reporting-only state at present
│   └── styles/
└── package.json
```

## Local development

Requires Node `>=22.12.0`.

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

Current browser audit:

```bash
npm run qa:audit
```

Additional format/type/accessibility/performance gates are being added incrementally as part of the redesign. Do not invent commands that are not yet present in `package.json`.

## Content safety

Every current-facing content model should eventually carry evidence and visibility metadata. Public surfaces must not expose content marked internal, private, or needs-approval.

High-risk content includes:

- applicant/member personal information;
- disciplinary or merit/demerit data;
- internal financial details;
- credentials or account-access procedures;
- partnership negotiation details;
- unapproved sponsor obligations;
- personal reporting material.

## Public vs. reporting scope

The public institutional navigation must not promote `/reporting`.

The reporting experience may remain in this repository for now because it uses its own Pixi/Zustand architecture, but it should:

- restore normal browser zoom;
- be explicitly scoped as applicant/personal reporting;
- be excluded from public search/indexing;
- not leak its dependencies into ordinary public routes.

## Design direction

The redesign direction is **Mathematical Editorial Institution**:

- black/gold/piu identity before generic trends;
- content before chrome;
- mathematical grids, diagrams, contours, coordinates, and transformations as functional visual language;
- restrained motion;
- limited glass rather than universal glassmorphism;
- static content first, progressive enhancement second;
- source/freshness context for current claims.

## Contribution rules

Keep commits atomic.

A commit should:

- solve one concern;
- remain buildable;
- include behavioral tests when behavior changes;
- avoid mixing factual correction and aesthetic redesign;
- avoid mixing dependency changes with unrelated UI;
- preserve authoritative wording unless a source-backed change is intentional.

Use conventional commit messages such as:

```text
fix(content): remove misattributed event listing
refactor(nav): remove reporting from institutional navigation
perf(hero): defer optional Three.js enhancement
docs: document evidence review workflow
```

## Current redesign branch strategy

Recommended implementation groups:

- `feat/samup-trust-foundation`
- `feat/samup-design-system`
- `feat/samup-public-ia`
- `feat/samup-home-v2`
- `feat/samup-content-pages`
- `feat/samup-applied-math`
- `chore/samup-quality-gates`

Do not collapse the redesign into a single monolithic commit.
