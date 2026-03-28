<!--
SYNC IMPACT REPORT
==================
Version change: [unversioned template] → 1.0.0
Modified principles: N/A (initial population from template)
Added sections:
  - Core Principles (I–X)
  - Technical Stack & Infrastructure
  - Development Workflow
  - Governance
Removed sections: N/A (template placeholders replaced)
Templates reviewed:
  - .specify/templates/plan-template.md       ✅ aligned (Constitution Check section present)
  - .specify/templates/spec-template.md       ✅ aligned (no constitution-specific sections required)
  - .specify/templates/tasks-template.md      ✅ aligned (task phases match phase-gated model)
  - .specify/templates/commands/              ✅ no command files found (nothing to update)
Follow-up TODOs: none — all fields resolved.
-->

# Senior Developer Portfolio Platform Constitution

## Core Principles

### I. Phase-Gated Delivery (NON-NEGOTIABLE)

Development MUST proceed strictly phase by phase as defined in `PLAN.md`.
No work from a later phase may be introduced during an earlier phase, even
as a "convenience" or "foundation" for future work. Each phase begins only
after its predecessor is fully specified, planned, tasked, analyzed, and
implemented.

**Rationale**: Phase discipline prevents scope creep, keeps each delivery
testable and reviewable in isolation, and aligns implementation with the
Spec Kit workflow that governs this project.

### II. Admin-Managed Public Content

All content rendered on the public portfolio MUST be editable via the admin
portal unless that content is explicitly declared static in the relevant
phase specification. Hardcoded portfolio content in UI components is
prohibited. Content ordering, visibility, and publishing state MUST all be
controllable without code changes.

**Rationale**: The platform's core value proposition is dynamic content
management. Hardcoded content defeats this and forces code deployments for
routine updates.

### III. Content Visibility Safety (NON-NEGOTIABLE)

Draft content MUST never be publicly visible under any circumstances.
The public rendering layer MUST filter strictly on published/active status.
No API route, server-side render, or static generation step may expose
unpublished or draft records to unauthenticated users.

**Rationale**: Leaking draft content (unreleased projects, in-progress copy,
private notes) would be a functional and reputational failure for a
production platform.

### IV. Server-Side Validation of All Admin Actions (NON-NEGOTIABLE)

Every admin action that creates, updates, deletes, or reorders content MUST
be validated server-side before persistence. Client-side validation is
permitted as a UX aid only and MUST NOT be the sole enforcement layer.
Input sanitization, authorization checks, and business-rule enforcement all
belong on the server.

**Rationale**: Client-side validation is bypassable. A portfolio admin portal
that stores data without server-side guards is insecure regardless of UI
controls.

### V. PostgreSQL for All Persistent Data (NON-NEGOTIABLE)

PostgreSQL MUST be used as the sole relational database for all persistent
application data. No alternative database engine (SQLite, MySQL, MongoDB,
etc.) may be substituted. Schema migrations MUST be managed via a versioned
migration tool (e.g., Prisma Migrate or similar).

**Rationale**: Mandated in `AGENTS.md`. PostgreSQL provides the relational
integrity, JSONB flexibility, and production reliability required for a
content-managed platform on a self-hosted VPS.

### VI. MinIO for All Uploaded Assets and Portfolio Media (NON-NEGOTIABLE)

MinIO MUST be used as the object storage backend for all uploaded files,
images, documents (e.g., CV PDF), and portfolio media. Direct filesystem
storage of user-uploaded assets is prohibited. MinIO exposes an S3-compatible
API, enabling future migration without application changes.

**Rationale**: Mandated in `AGENTS.md`. Centralised object storage with
S3-compatible semantics ensures portability, access control, and clean
separation of binary assets from application state.

### VII. Graceful Public UI Under Partial or Missing Content

The public portfolio UI MUST handle missing, empty, or partially populated
content without error states, broken layouts, or unhandled exceptions.
Sections with no published content MUST either render a sensible empty/hidden
state or be omitted gracefully. The UI MUST never crash or expose stack
traces to public visitors.

**Rationale**: During early phases the content system may be incomplete.
Visitors must always see a coherent, professional interface regardless of
admin content completeness.

### VIII. Production-Grade Standards (NON-NEGOTIABLE)

Every deliverable MUST meet production-grade standards across four dimensions:

- **Security**: OWASP Top 10 mitigations, secure session-based admin auth,
  input sanitization, HTTPS-only in production, no secrets in source.
- **Performance**: Core Web Vitals targets met (LCP < 2.5s, CLS < 0.1,
  INP < 200ms); assets optimized; database queries indexed.
- **Accessibility**: WCAG 2.1 AA compliance on all public-facing UI; semantic
  HTML; keyboard navigability; screen-reader support.
- **SEO**: Semantic markup, structured metadata, Open Graph tags, sitemap,
  canonical URLs — managed via the admin where applicable.

**Rationale**: This platform represents the author's senior engineering
credibility. Substandard performance, accessibility failures, or security
gaps directly undermine its purpose.

### IX. Spec-Driven Development via Spec Kit

Every phase MUST complete the full Spec Kit workflow before implementation
begins:

1. `/speckit.specify` — feature specification
2. `/speckit.clarify` — scope clarification
3. `/speckit.plan` — technical plan
4. `/speckit.tasks` — task breakdown
5. `/speckit.analyze` — cross-artifact consistency check
6. `/speckit.implement` — implementation

Implementation MUST NOT begin before `/speckit.tasks` and `/speckit.analyze`
are complete. Each phase MUST have its own dedicated git branch created before
coding starts.

**Rationale**: Mandated in `AGENTS.md`. Spec Kit enforces deliberate design
before coding, prevents ambiguity-driven rework, and ensures each phase is
independently reviewable.

### X. VPS Deployment via Docker Compose (NON-NEGOTIABLE)

The target deployment environment is a self-hosted VPS using Docker Compose.
All services (application, database, object storage, reverse proxy) MUST be
containerised and orchestrated via Docker Compose. No deployment model that
requires a managed cloud platform (Vercel, Heroku, RDS, S3) may be assumed
as the primary target, though local development tooling may use them.

**Rationale**: Mandated in `AGENTS.md`. Self-hosted VPS deployment gives full
infrastructure control, cost predictability, and is consistent with
demonstrating senior DevOps capability.

## Technical Stack & Infrastructure

The following technology choices are mandated across all phases:

| Concern | Choice | Notes |
|---|---|---|
| Frontend framework | Next.js + TypeScript | App Router preferred |
| Styling | Tailwind CSS | Utility-first, responsive |
| Backend | Next.js API routes or separate NestJS service | Decide in Phase 2 spec |
| ORM | Prisma | Typed schema, migration support |
| Database | PostgreSQL | Mandatory — see Principle V |
| Object storage | MinIO | Mandatory — see Principle VI |
| Admin auth | Secure session-based authentication | No OAuth to third parties for admin |
| Deployment | Docker Compose on self-hosted VPS | Mandatory — see Principle X |
| Reverse proxy | Nginx or Caddy | HTTPS termination required |

Deviations from this stack MUST be justified in the relevant phase
specification and approved before implementation.

## Development Workflow

- **Planning tool**: Claude Code (Spec Kit commands only — no implementation).
- **Implementation tool**: OpenCode (implementation only — no spec authorship).
- **Branching**: One dedicated git branch per phase, created before any code is
  written for that phase.
- **Phase artifacts** (each phase MUST produce all of the following):
  - `specs/[###-phase-name]/spec.md` — feature specification
  - `specs/[###-phase-name]/plan.md` — technical plan
  - `specs/[###-phase-name]/tasks.md` — task list
  - Clarified scope embedded in `spec.md` or as a separate clarification doc
- **Constitution Check**: Every `plan.md` MUST include a Constitution Check
  section that confirms compliance with all ten principles before Phase 1
  research proceeds.
- **Commit discipline**: Commit after each completed task or logical group;
  never commit secrets or environment files.

## Governance

This constitution supersedes all other practices, preferences, or conventions
within this project. In the event of conflict between this document and any
other artifact (README, plan, spec, task list), this constitution takes
precedence.

**Amendment procedure**:

1. Propose the amendment in writing, stating the principle affected, the
   change, and the rationale.
2. Assess version bump: PATCH for clarifications, MINOR for additions,
   MAJOR for removals or redefinitions.
3. Update this file, increment the version, set `Last Amended` to today's
   date.
4. Propagate changes to affected templates (plan, spec, tasks) and update the
   Sync Impact Report at the top of this file.
5. Note any in-flight phase specs that require re-analysis under the new
   rules.

**Compliance review**: Every phase's `/speckit.analyze` run MUST include a
constitution compliance check. Violations block implementation until resolved.

**Versioning policy**:
- MAJOR: Principle removed or fundamentally redefined.
- MINOR: New principle or section added, or material guidance expanded.
- PATCH: Wording clarifications, formatting, typo fixes.

**Version**: 1.0.0 | **Ratified**: 2026-03-28 | **Last Amended**: 2026-03-28
