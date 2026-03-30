# Research: Phase 4 — Advanced Portfolio (Senior-Level Depth)

**Branch**: `005-advanced-portfolio` | **Date**: 2026-03-29

All decisions in this document were resolved during the `/speckit.clarify` session on 2026-03-29. No open unknowns remain.

---

## Decision 1: Case Study Routing Model

**Decision**: Each case study has its own dedicated page at a unique URL (`/case-studies/[slug]`). A listing page at `/case-studies` links to all published entries.

**Rationale**: Dedicated pages make each case study independently shareable, deep-linkable, and indexable by search engines — directly supporting the Phase 4 goal of demonstrating business value to recruiters and technical evaluators. Inline/expandable or modal-based patterns limit content depth and prevent direct URL sharing.

**Alternatives considered**:
- Inline expandable within the projects section: rejected — no shareable URL, limits content length, hides depth from casual browsers
- Modal overlay from projects list: rejected — no unique URL, not crawlable, poor for long-form narrative

---

## Decision 2: Case Study Metrics Structure

**Decision**: Case study metrics are stored as a structured list of `CaseStudyMetric` records, each with a `label` (e.g., "Deployment time"), `value` (e.g., "-60%"), and optional `unit` (e.g., "%"). Metrics are stored in a child table (`case_study_metrics`) linked by FK to `case_studies`.

**Rationale**: Structured storage enables consistent visual callout rendering (stat cards) across all case studies without relying on the author to format metrics uniformly in free text. This is the mechanism that allows Phase 4 to visually differentiate from generic portfolios. A child table (rather than JSON column) is consistent with the project's Prisma-first, fully typed approach and keeps queries simple.

**Alternatives considered**:
- Free-form text in the `outcomes` narrative: rejected — cannot render consistent visual callouts; metrics buried in prose are less impactful
- JSON column on `case_studies`: considered viable but rejected in favour of a typed child table that integrates cleanly with Prisma's relation system and allows `orderBy` on `displayOrder` without JSON parsing

---

## Decision 3: Article Content Mode

**Decision**: Articles link exclusively to external URLs (e.g., personal blog, Medium, dev.to). Body text is not stored or rendered within the portfolio system.

**Rationale**: Most senior engineers publish writing on external platforms. Storing external links is far simpler (no rich text editor, no content hosting, no HTML sanitization) and avoids content duplication. The portfolio's role is to surface and curate writing, not to host it.

**Alternatives considered**:
- Embedded body text (rich text stored in DB): rejected — requires a rich text editor component in the admin, HTML sanitization for XSS prevention, and significantly more complex rendering; out of proportion for a portfolio that already has an external publishing home
- Both modes (hybrid): rejected during clarification; adds conditional rendering complexity for marginal benefit

---

## Decision 4: CV Replacement Behaviour

**Decision**: When the admin uploads a replacement CV, the previous file is permanently deleted from MinIO and its DB record is removed. No version history is maintained.

**Rationale**: A personal portfolio CV is replaced entirely on each update — no rollback use case exists in practice. Permanent deletion keeps the MinIO bucket clean, avoids orphan storage costs, and simplifies the admin UI (one-state model: either a current CV exists or it doesn't). Version history can be added in a future phase if needed.

**Alternatives considered**:
- Archive old CV (retain in storage but mark inactive): rejected — adds a version-management concept with no current use case; storage cost is negligible but conceptual complexity is not

---

## Decision 5: Optional Section Visibility Control

**Decision**: Each optional section (articles, open-source contributions, talks) has an independent admin-controlled visibility toggle stored in a `section_visibility` DB table. A section is displayed publicly only when BOTH its toggle is `enabled: true` AND it has at least one published entry. The toggle is managed from the section's admin list page.

**Rationale**: An explicit toggle lets the admin suppress an entire section without unpublishing every individual entry — useful for temporarily hiding a section that is under construction while preserving all draft/published entry states. This is a common CMS pattern for section-level visibility.

**Alternatives considered**:
- Auto-visibility only (show when entries exist, hide when empty): rejected during clarification — forces the admin to unpublish all entries to hide a section, which loses individual entry states and adds friction

---

## Decision 6: CV Download Approach

**Decision**: The public CV download endpoint (`/api/cv/download`) proxies the file from MinIO through the Next.js application layer. The MinIO object key (`storageKey`) is never returned to the browser. The download response sets `Content-Disposition: attachment` and `Content-Type: application/pdf`.

**Rationale**: Exposing a raw MinIO presigned URL would leak the internal storage key structure and the MinIO service host/port to public users, violating the principle that internal storage details must not be visible at the public API boundary. The proxy approach adds negligible latency for a file downloaded infrequently (one PDF per recruiter visit).

**Alternatives considered**:
- Return a presigned MinIO URL directly to the client for redirect: rejected — exposes MinIO hostname/bucket structure and the storage key in browser network logs; not appropriate for production

---

## Decision 7: Slug Generation

**Decision**: Case study slugs are generated by the admin portal from the case study title (lowercase, spaces → hyphens, strip non-alphanumeric except hyphens). The slug is auto-populated in the create form but is editable. Uniqueness is enforced at the DB level via `@unique` on `CaseStudy.slug`. On slug conflict, the API returns `400 { error: 'Slug already in use' }`.

**Rationale**: Auto-generation from title is the standard UX pattern (WordPress, Ghost, etc.) and eliminates manual slug entry for the common case. Admin editability handles cases where the generated slug is undesirable. DB-level uniqueness prevents race conditions. No external slugify library is required — a simple inline transformation (`/[^a-z0-9-]/g` regex) suffices.

**Alternatives considered**:
- UUID-based URLs: rejected — not human-readable, not SEO-friendly
- Admin must manually enter slug: rejected — unnecessary friction for the common case

---

## Decision 8: Existing CaseStudy Model Extension Strategy

**Decision**: The existing `CaseStudy` Prisma model (introduced in Phase 2 but never made public-facing) is extended in-place rather than replaced. The `projectId` FK is made optional (`String?`) to support standalone case studies. The `onDelete` is changed from `Restrict` to `SetNull`. New fields (`slug`, `title`, `published`, `isVisible`, `displayOrder`, `architectureNotes`) and the `metrics` relation are added via migration.

**Rationale**: The existing model already has the core narrative fields (`challenge`, `solution`, `outcomes`). Extending in-place avoids a destructive migration and preserves any existing seed data. The FK change to `SetNull` is safe — if a linked project is deleted, the case study renders independently (required by spec edge case).

**Alternatives considered**:
- Drop and recreate the table: rejected — unnecessarily destructive; the existing schema is a valid starting point for extension
- Separate standalone `StandaloneCase Study` model: rejected — introduces duplication; a nullable `projectId` is the idiomatic Prisma approach

---

## Decision 9: No New npm Packages Required

**Decision**: Phase 4 adds no new npm dependencies. All functionality is implemented using the packages already installed by Phase 3 (`next`, `prisma`, `zod`, `minio`, `shadcn/ui`, `react-hook-form`, `@hookform/resolvers`, `iron-session`).

**Rationale**: Reviewed each Phase 4 capability against existing deps:
- Slug generation: inline regex transform, no `slugify` package needed
- Rich text: not required (articles are external-URL-only)
- File upload: existing MinIO SDK covers CV upload
- Date formatting: Next.js server components can use `Intl.DateTimeFormat` (built-in)
- Auth: existing `iron-session` + `requireAdminSession()` helper

No new attack surface, no new dependency audits required.
