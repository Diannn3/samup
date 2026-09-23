# SAM-UP Institutional Website

Public web platform for the **Society of Applied Mathematics of UPLB (SAM-UP)**.

This repository contains the **public SAM-UP institutional website** — identity, Applied Mathematics promotion, verified programs/resources, recruitment guidance, partnerships, governance, Chronicle/history, and public archives.

The former applicant **Reporting Dossier** has been removed from the public codebase.

## Implementation doctrine

> Correct the truth, structure the tasks, establish the system, then add delight.

Before changing public claims or redesigning the information architecture, read:

- `docs/SAMUP_REDESIGN_SOURCE_OF_TRUTH.md`
- `docs/content-audit.md`
- `docs/PUBLIC_CONTENT_PUBLISHING_WORKFLOW.md`

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
- Playwright for browser, progressive-enhancement, touch, and visual QA
- Fontsource variable families for self-hosted typography

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
│   │   ├── sections/         # public-page sections
│   │   ├── ui/               # reusable UI primitives
│   │   └── visualizers/      # legacy/special visual components
│   ├── data/                 # typed data and evidence-backed records
│   ├── layouts/
│   ├── pages/
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

Quality checks:

```bash
npm run qa:audit
npm run qa:motion
npm run qa:visual
npm run qa:all
```

For canonical URLs and structured-data origins, set the production deployment variable:

```bash
PUBLIC_SITE_URL=https://your-production-domain.example
```

If `PUBLIC_SITE_URL` is absent, Astro does not invent a canonical production origin.

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

## Removed applicant reporting scope

The former Reporting Dossier is not part of the institutional website and should not be reintroduced without an explicit product decision and a separate privacy/content review.

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
