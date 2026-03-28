# Feature Specification: Phase 0 — Foundation & Constitution

**Feature Branch**: `001-phase-0-foundation`
**Created**: 2026-03-28
**Status**: Draft
**Input**: User description: "Create the specification for Phase 0 only, based strictly on PLAN.md."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Product Vision Documented (Priority: P1)

The project owner can read a single authoritative document that communicates
what the portfolio platform is, who it is for, what problems it solves, and
what success looks like. Any developer joining the project understands the
purpose and audience within minutes of reading it.

**Why this priority**: Without a shared product vision, every subsequent phase
risks building the wrong thing. This is the foundational agreement for all
decisions that follow.

**Independent Test**: A new team member reads the vision artefact alone and
correctly answers "Who is this platform for?", "What are the two primary
surfaces?", and "What does the admin portal do?" — without referencing any
other file.

**Acceptance Scenarios**:

1. **Given** the product vision artefact exists, **When** a reader reviews it,
   **Then** they can identify the target audience (recruiters, hiring managers,
   professional contacts), the two surfaces (public portfolio and admin portal),
   and the core objectives without ambiguity.
2. **Given** the vision artefact exists, **When** a developer starts work on
   any later phase, **Then** they can reference it to validate whether their
   work aligns with project goals.

---

### User Story 2 — Design & UX Principles Defined (Priority: P2)

The project owner has documented design and UX principles that all
public-facing work must follow: mobile-first responsive design, visual
hierarchy that supports recruiter reading patterns, accessibility standards,
and user-visible performance targets.

**Why this priority**: Design principles prevent inconsistency across phases.
Without them, individual phases may make conflicting visual and structural
decisions that require expensive rework.

**Independent Test**: A developer or designer can use the principles to make a
binary pass/fail decision on any proposed UI pattern (e.g., "Does this layout
meet the mobile-first requirement? Does it meet the accessibility standard?").

**Acceptance Scenarios**:

1. **Given** the design principles are documented, **When** a new UI section is
   designed in any phase, **Then** the designer can apply the principles as a
   checklist to validate decisions before implementation.
2. **Given** the accessibility standard is documented, **When** any public UI
   component is built, **Then** the minimum conformance target (WCAG 2.1 AA)
   is clear and unambiguous.

---

### User Story 3 — Content Management Boundaries Defined (Priority: P2)

The project owner has documented which portfolio content is admin-manageable
and which is explicitly static. Developers working on any phase know precisely
what must connect to the data layer and what may be hardcoded.

**Why this priority**: Without clear boundaries, phases may over-engineer or
under-engineer content management, causing costly rework later.

**Independent Test**: Given any portfolio element (e.g., hero title, nav
links, skill tags, project descriptions, copyright year), a developer can look
it up in the content boundaries artefact and determine its category without
asking.

**Acceptance Scenarios**:

1. **Given** content boundary rules are documented, **When** a developer
   encounters any UI content element, **Then** they can determine its category
   (admin-managed or explicitly static) from the document without additional
   input.
2. **Given** content boundaries include draft/publish lifecycle rules, **When**
   a developer implements any content type, **Then** the visibility rules (draft
   never public, published visible) are pre-defined and do not require per-phase
   decisions.

---

### User Story 4 — Security Requirements Defined (Priority: P3)

The project owner has documented the security baseline all phases must meet:
admin authentication model, session handling expectations, input validation
mandate, and the rule that all admin actions are server-side validated.

**Why this priority**: Security requirements defined late are expensive to
retrofit. Defining them in Phase 0 ensures every phase is built to the correct
security posture from the start.

**Independent Test**: A developer implementing the admin portal in Phase 3 can
use the security requirements artefact to produce a compliance checklist for
their implementation without further input from the project owner.

**Acceptance Scenarios**:

1. **Given** security requirements are documented, **When** a developer
   implements any admin feature, **Then** they have explicit guidance on
   authentication model, session handling, and server-side validation.
2. **Given** the authentication model is defined, **When** a developer designs
   the admin login flow, **Then** the requirement (secure session-based, no
   third-party OAuth for admin) is unambiguous.

---

### User Story 5 — Performance Expectations Defined (Priority: P3)

The project owner has documented measurable performance targets for the public
portfolio (Core Web Vitals thresholds, page weight budget) so that
architectural decisions in all subsequent phases are made with these targets
in mind.

**Why this priority**: Performance targets inform architectural decisions in
Phases 1 and 2. Without them, optimisation becomes reactive rather than
intentional.

**Independent Test**: A developer can reference the performance artefact and
state a specific, testable threshold for each Core Web Vital without
ambiguity.

**Acceptance Scenarios**:

1. **Given** performance targets are documented, **When** any public page is
   implemented, **Then** the developer has specific LCP, CLS, and INP targets
   to design toward.
2. **Given** performance expectations are part of the foundation, **When**
   Phase 5 (Production Hardening) optimises the platform, **Then** the targets
   defined here serve as the acceptance criteria for that phase.

---

### User Story 6 — Deployment Strategy Defined (Priority: P3)

The project owner has documented the target deployment model: self-hosted VPS,
Docker Compose orchestration, required services (application server,
PostgreSQL, MinIO, reverse proxy), and HTTPS as mandatory in production.

**Why this priority**: The deployment model affects how services communicate,
how secrets are managed, and how environment configuration is structured
across all phases.

**Independent Test**: A developer can read the deployment strategy artefact
and list all required Docker Compose services and their responsibilities
without additional input.

**Acceptance Scenarios**:

1. **Given** the deployment strategy is documented, **When** a developer
   configures any service in any phase, **Then** they know which platform it
   runs on and how it connects to other services.
2. **Given** HTTPS is defined as mandatory in production, **When** a reverse
   proxy configuration is designed, **Then** HTTP-to-HTTPS redirection and
   TLS termination are understood as non-negotiable.

---

### Edge Cases

- What happens if the product vision conflicts with a later-phase technical
  constraint? The constitution takes precedence; the phase spec must document
  the conflict and its resolution.
- How are content boundary decisions amended after Phase 0? Via a constitution
  amendment following the governance procedure in the constitution; the
  amendment must be reflected before the affected phase begins.
- What if a performance target cannot be met without violating a design
  principle (e.g., rich imagery vs. LCP target)? The conflict must be
  documented and resolved explicitly in the relevant phase spec rather than
  silently ignored.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The foundation MUST produce a documented product vision covering
  target audience, primary surfaces (public portfolio and admin portal), core
  objectives, and guiding principles.
- **FR-002**: The foundation MUST define design and UX principles including
  mobile-first responsive design, visual hierarchy for recruiter audiences,
  WCAG 2.1 AA accessibility conformance, and consistency rules for typography
  and layout.
- **FR-003**: The foundation MUST document content management boundaries,
  classifying every content type listed in PLAN.md Phase 2 as either
  admin-managed or explicitly static, and encoding the universal rule that
  draft content is never publicly visible. The authoritative classification
  is as follows:

  **Admin-managed** (all require CRUD via admin portal; none may be hardcoded
  in the UI):
  - Profile / personal info (name, bio, avatar, headline)
  - Hero content (headline, subheadline, call-to-action text and link)
  - Social links (platform, URL, display order)
  - Experiences (employer, role, dates, description, highlights)
  - Projects (title, description, tech stack, links, visibility order)
  - Case studies (problem, solution, outcome, metrics, assets)
  - Skills (name, category, proficiency, display order)
  - Testimonials (author, role, company, quote, visibility)
  - Contact settings (contact email, form enable/disable, custom message)
  - SEO metadata (page titles, meta descriptions, Open Graph fields per page)
  - Media assets (images, CV PDF, project screenshots — stored in MinIO)

  **Explicitly static** (may be hardcoded; do not require admin management):
  - Brand name and logo
  - Top-level navigation structure and link labels
  - Copyright year in footer
  - Legal and privacy page copy
- **FR-004**: The foundation MUST define the security baseline: secure
  session-based admin authentication (no third-party OAuth for admin access),
  8-hour absolute session timeout with no idle extension, server-side
  validation mandate for all admin actions, HTTPS-only in production, and a
  policy that secrets must never appear in source control.
- **FR-005**: The foundation MUST define measurable public-site performance
  targets: LCP < 2.5 s, Cumulative Layout Shift < 0.1, INP < 200 ms, and a
  page weight budget consistent with these targets.
- **FR-006**: The foundation MUST define the deployment strategy: self-hosted
  VPS, Docker Compose orchestration, all required services (application,
  PostgreSQL, MinIO, reverse proxy with TLS), separation of development and
  production environments, best-effort availability posture (auto-restart on
  failure, daily backups of PostgreSQL and MinIO, no formal SLA).
- **FR-007**: The foundation MUST produce or confirm the Spec Kit constitution
  at `.specify/memory/constitution.md`, covering all ten principles, the
  mandatory technology stack, the Spec Kit development workflow, and the
  governance amendment procedure.
- **FR-008**: The foundation MUST establish SEO structural requirements —
  semantic HTML, page-level metadata, Open Graph support, and sitemap
  generation — to be applied from Phase 1 onward, with full admin
  configurability deferred to Phase 5.
- **FR-009**: The foundation MUST define the minimum observability baseline
  applicable to all phases before Phase 5: structured stdout logging of
  application errors and key events (from Phase 1 onward), and a persistent
  admin action audit trail capturing who did what and when (from Phase 3
  onward). Full error monitoring, metrics, and tracing are deferred to Phase 5.
- **FR-010**: The foundation MUST establish REST as the API communication
  model between the admin portal and the backend: standard HTTP verbs, JSON
  payloads, conventional HTTP status codes, and server-side input validation
  using a schema validation library (e.g., Zod). This applies to all admin
  API routes from Phase 3 onward.

### Key Entities

- **Product Vision**: Communicates purpose, target audience, surfaces, and
  objectives. Consumed by all phases as the project's north star.
- **Design Principles**: Documented UX and visual standards governing all
  public-facing work. Includes responsiveness, accessibility, and
  user-visible performance constraints.
- **Content Boundary Rules**: Categorises all portfolio content types as
  admin-managed or explicitly static, and encodes draft/publish lifecycle
  rules applicable to all phases.
- **Security Baseline**: Documented security requirements for all phases:
  authentication model, server-side validation mandate, transport security,
  and secrets management policy.
- **Performance Targets**: Quantified, phase-agnostic thresholds for Core
  Web Vitals and page weight on the public portfolio site.
- **Deployment Strategy**: Documented service topology, Docker Compose
  orchestration model, and environment requirements for the full platform.
- **Constitution**: The Spec Kit governance document at
  `.specify/memory/constitution.md` encoding all of the above as binding,
  versioned, amendment-governed rules.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer joining the project at any phase can locate all
  foundational decisions in at most two documents (the constitution and this
  Phase 0 spec) without requiring verbal briefing.
- **SC-002**: Every subsequent phase specification can produce a binary
  pass/fail Constitution Check result against the rules defined in this phase
  — with zero ambiguous items.
- **SC-003**: The content boundary rules classify 100% of the content types
  listed in PLAN.md Phase 2, with each type unambiguously categorised as
  admin-managed or explicitly static.
- **SC-004**: The security baseline is specific enough that a developer can
  produce a compliance checklist for any phase's admin features without
  requesting further clarification.
- **SC-005**: The performance targets are quantified so that automated tooling
  (e.g., Lighthouse CI) can produce a pass/fail result against them without
  interpretation.
- **SC-006**: The deployment strategy is complete enough that a developer can
  draft a Docker Compose service manifest covering all required services from
  it alone, without guessing. The availability posture (best-effort: auto-restart,
  daily backups, no SLA) is explicitly documented and requires no further
  interpretation.

## Clarifications

### Session 2026-03-28

- Q: What is the intended availability posture for the VPS-hosted platform? → A: Best-effort — auto-restart on failure, daily PostgreSQL and MinIO backups, no formal SLA.
- Q: What is the required admin session lifetime before automatic expiry? → A: 8-hour absolute timeout, no idle extension.
- Q: Should Phase 0 enumerate the full admin-managed vs. static classification for all Phase 2 content types? → A: Yes — Phase 0 owns the authoritative classification; exhaustive list added to FR-003.
- Q: What is the minimum observability baseline required across all phases before Phase 5? → A: Structured stdout logging (errors + key events) from Phase 1; admin action audit trail from Phase 3. Full monitoring deferred to Phase 5.
- Q: What is the API communication model between the admin portal and the backend? → A: REST — standard HTTP verbs and status codes, JSON payloads, input validation via Zod.

## Assumptions

- The Spec Kit constitution at `.specify/memory/constitution.md` (v1.0.0,
  ratified 2026-03-28) is the authoritative encoding of governance rules and
  is treated as Phase 0's primary output.
- Phase 0 produces no deployable application artefact; all outputs are
  documentation and governance artefacts consumed by subsequent phases.
- The technology stack encoded in the constitution (Next.js + TypeScript,
  Tailwind CSS, Prisma, PostgreSQL, MinIO, Docker Compose) is accepted as
  final; stack decisions are not re-litigated in later phases without a
  constitution amendment.
- SEO metadata will be fully admin-configurable in Phase 5; the structural
  requirements defined here (semantic HTML, OG tags, sitemap) apply from
  Phase 1 onward as non-negotiable implementation standards.
- The portfolio has a single owner who is also the sole admin user;
  multi-user admin access is out of scope for all phases.
- The authoritative content classification (admin-managed vs. explicitly static)
  is defined in FR-003 and covers all Phase 2 entity types. That list is the
  single source of truth for all subsequent phases.
