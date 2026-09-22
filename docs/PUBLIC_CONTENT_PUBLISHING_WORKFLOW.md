# SAM-UP Public Content Publishing Workflow

This document operationalizes the evidence and visibility rules in `docs/SAMUP_REDESIGN_SOURCE_OF_TRUTH.md`.

The public website is not a scratchpad for organizational memory. A fact being known internally, repeated historically, or present in an old repository file does **not** automatically make it safe or current public content.

## Before creating or editing public content

Identify the content class:

| Content class | Typical source | Freshness expectation |
| --- | --- | --- |
| Foundational identity | Constitution | Stable until formally amended |
| Current operational guidance | Current OSA / current bylaws / current official announcement | Re-check when term, policy, or application cycle changes |
| Program/event status | Current official announcement or approved organizer record | Current date/status required |
| Historical archive | Approved archive file / dated publication | Preserve historical label |
| Educational Applied Math content | Reliable mathematical source + editorial review | Re-review when edited |
| Partnership/public case study | Approved public agreement, announcement, or deliverable | Approval required before publication |

## Required evidence metadata

Every collection entry must carry an `evidence` object.

Minimum fields:

```yaml
evidence:
  status: verified-current
  visibility: public
  sourceLabel: "Name of authoritative source"
  reviewedAt: "YYYY-MM-DD"
```

Use `sourceUrl`, `sourceDocument`, `sourceDate`, `validUntil`, and `notes` when relevant.

## Visibility rules

### May be rendered publicly

- `public`
- `public-summary-only`
- `historical`

Only when the evidence status is also publishable.

### Must not be rendered publicly by default

- `internal`
- `needs-approval`
- `private`

Records with `unknown`, `blocked`, or `needs-approval` evidence status also stay out of public collection queries.

## Current claims

For a claim to appear as current:

1. identify the current authoritative source;
2. record when that source was reviewed;
3. check whether the source itself establishes the claimed state;
4. do not promote a recurring or historical activity into a current one;
5. use a fallback such as "check the latest official announcement" when current state is not established.

Examples:

- OSA registration can establish current organization registration.
- An OSA organization page does **not** automatically prove recruitment is open today.
- A historical event page does **not** prove the event is currently scheduled.
- A leadership archive does **not** prove the current full Executive Committee roster.

## Programs and events

Create entries in `src/content/programs/` only when current or historical publication is justified.

Required public fields include:

- organizer;
- SAM-UP's specific role;
- lifecycle;
- date or recurring label;
- audience/venue when verified;
- summary;
- evidence.

For collaborative events, never collapse the organizer and SAM-UP role into the same field.

## Resources

Create entries in `src/content/resources/` only when the public file/link is approved.

Do not infer:

- course coverage;
- syllabus topics;
- tutorial availability;
- update frequency.

Those must come from the material or an approved source.

## Applied Mathematics explainers

Create entries in `src/content/applied-math/`.

Every explainer needs:

- concept;
- level;
- public summary;
- accessibility description;
- source list;
- review date.

Interactive enhancement is optional. The core explanation must remain understandable without JavaScript.

## Governance

Use `public-summary-only` when a governance document contains both public institutional information and operational/internal material.

A public summary should explain what the document establishes without publishing:

- account credentials or access procedures;
- internal discipline/merit details;
- private financial procedures;
- negotiation instructions;
- applicant/member personal information;
- unapproved obligations.

## Chronicle and archives

Historical content must remain visibly historical.

Do not rewrite an old issue, officer, event, or policy as though it describes the present organization.

## Review checklist before merge

- [ ] Source is identifiable.
- [ ] Visibility is explicitly chosen.
- [ ] Time-sensitive status is actually established by the source.
- [ ] Historical/current distinction is clear.
- [ ] Collaborative ownership and SAM-UP role are separated.
- [ ] No private/internal information is exposed.
- [ ] Accessibility description exists for meaningful diagrams/visuals.
- [ ] Links and dates are current enough for the claim.
- [ ] The content passes the collection schema.
- [ ] `npm run build` passes.
- [ ] `npm run qa:audit` passes.
- [ ] `npm run qa:motion` passes.
- [ ] `npm run qa:visual` passes.

## When evidence is incomplete

Do not fill the gap with likely wording.

Use one of these outcomes instead:

- omit the record;
- keep it in a non-public quarantine dataset;
- render a source-aware empty state;
- point users to the current official announcement;
- mark the item for organizational approval.

Accuracy is a product feature.
