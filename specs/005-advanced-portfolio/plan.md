# Implementation Plan: Phase 4 — Advanced Portfolio (Senior-Level Depth)

**Branch**: `005-advanced-portfolio` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-advanced-portfolio/spec.md`

## Summary

Elevate the public portfolio to senior engineering depth by delivering four independently testable content layers on top of the Phase 2/3 foundation:

1. **Case Studies** — rich narrative pages (problem → solution → outcome) with structured metrics callouts, architecture notes, draft/publish lifecycle, and dedicated URLs at `/case-studies/[slug]`.
2. **CV Download** — a single-click PDF download control (public, no auth) backed by admin-managed MinIO storage; uploading a replacement permanently deletes the previous file.
3. **Testimonials** — social proof quotes with author attribution; use the existing `Testimonial` Prisma model (Phase 2), extending it with optional `avatarUrl` and making `authorCompany` optional.
4. **Optional Sections** — articles (external URL only), open-source contributions, and conference talks; each has an independent admin-controlled visibility toggle governing public display, so the admin can suppress a section without unpublishing every individual entry.

No new npm packages are required; all functionality is built on the existing stack (Next.js 14+, Prisma 6.x, Zod, MinIO SDK, shadcn/ui, react-hook-form, iron-session). A single Prisma migration covers all schema changes.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20 LTS
**Primary Dependencies**: Next.js 14+ (App Router), Prisma 6.x, Zod, `minio` SDK, `shadcn/ui`, `react-hook-form`, `@hookform/resolvers/zod`, `iron-session` (all inherited from Phase 3 — no new packages required)
**Storage**: PostgreSQL 16 (one new Prisma migration: `phase4_advanced_portfolio`); MinIO (CV PDF storage — existing bucket reused)
**Testing**: Not requested for this phase
**Target Platform**: Self-hosted VPS (Docker Compose); local Docker for development — unchanged from Phase 3
**Project Type**: web-service — incremental additions to the existing Next.js monolith
**Performance Goals**: Public case study pages must meet the same Core Web Vitals targets as the rest of the portfolio (LCP < 2.5s, CLS < 0.1); all new sections use `force-dynamic` server components to ensure content freshness
**Constraints**: Draft content of all Phase 4 types must never be accessible via public URLs (enforced by `published: true, isVisible: true` filter on all public queries); CV `storageKey` must never be returned in public API responses; MinIO proxy route required for CV download
**Scale/Scope**: Single administrator; 6 new entity types + 2 modified; ~10–50 records per entity at launch; minimal query complexity (all queries are simple filtered selects by published + isVisible)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — see bottom.*

| # | Principle | Status | Notes |
|---|---|---|---|
| I | Phase-Gated Delivery | ✅ PASS | Phase 3 (Admin Portal MVP) is complete; Phase 4 begins only now |
| II | Admin-Managed Public Content | ✅ PASS | All Phase 4 content (case studies, CV, testimonials, optional sections) is managed exclusively via the admin portal; nothing is hardcoded |
| III | Content Visibility Safety | ✅ PASS | All public query functions filter on `published: true, isVisible: true`; draft case study URLs return 404 via `notFound()`; CV `storageKey` is never exposed publicly |
| IV | Server-Side Validation | ✅ PASS | All admin API routes validate inputs with Zod schemas before any Prisma call; `requireAdminSession()` guard on every admin route |
| V | PostgreSQL for All Persistent Data | ✅ PASS | One new migration adds 6 new models and modifies 2 existing ones; no alternative storage for data |
| VI | MinIO for Uploaded Assets | ✅ PASS | CV PDF is uploaded to MinIO via existing `minio` SDK client; on replacement the old object is deleted from MinIO before the new one is stored |
| VII | Graceful Public UI Under Partial Content | ✅ PASS | All new public section components (`TestimonialsSection`, `ArticlesSection`, etc.) return `null` when empty — no broken layouts or empty headings |
| VIII | Production-Grade Standards | ✅ PASS | CV download proxied through app (no exposed MinIO keys); section visibility enforces two-condition check; all public queries indexed; slug uniqueness enforced at DB level |
| IX | Spec-Driven Development | ✅ PASS | Full Spec Kit workflow followed (specify → clarify → plan → tasks); implementation blocked until `/speckit.analyze` complete |
| X | VPS Deployment via Docker Compose | ✅ PASS | No new containers or services required; MinIO and PostgreSQL already in Compose stack |

## Project Structure

### Documentation (this feature)

```text
specs/005-advanced-portfolio/
├── plan.md              # This file
├── research.md          # Phase 0 — key decisions and rationale
├── data-model.md        # Phase 1 — full schema additions and migrations
├── quickstart.md        # Phase 1 — setup runbook, seed, and validation steps
├── contracts/
│   ├── case-studies-api.md       # Case study + metrics REST endpoint contracts
│   ├── cv-contract.md            # CV upload/download/delete flow contract
│   └── optional-sections-api.md  # Articles, open source, talks + section visibility contracts
└── tasks.md             # Generated by /speckit.tasks (already exists)
```

### Source Code (repository root)

```text
prisma/
├── schema.prisma                   # Modified: CaseStudy, Testimonial; New: CaseStudyMetric,
│                                   #   CvAsset, Article, OpenSourceContribution, Talk, SectionVisibility
└── migrations/
    └── [timestamp]_phase4_advanced_portfolio/
        └── migration.sql

src/
├── app/
│   ├── case-studies/
│   │   ├── page.tsx                # Public: list of published case studies
│   │   └── [slug]/
│   │       ├── page.tsx            # Public: individual case study detail
│   │       └── not-found.tsx       # 404 for draft/missing slugs
│   ├── api/
│   │   ├── cv/
│   │   │   └── download/route.ts   # Public: proxy CV PDF from MinIO
│   │   └── admin/
│   │       ├── case-studies/
│   │       │   ├── route.ts                      # GET list, POST create
│   │       │   └── [id]/
│   │       │       ├── route.ts                  # GET, PUT, DELETE
│   │       │       └── metrics/
│   │       │           ├── route.ts              # GET list, POST create metric
│   │       │           └── [metricId]/route.ts   # PUT, DELETE metric
│   │       ├── cv/
│   │       │   └── route.ts        # GET current, POST upload, DELETE
│   │       ├── articles/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── open-source/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── talks/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       └── section-visibility/
│   │           └── [section]/route.ts  # GET, PUT toggle
│   └── admin/
│       ├── case-studies/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx
│       ├── cv/
│       │   └── page.tsx
│       ├── articles/
│       │   ├── page.tsx            # includes section visibility toggle
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx
│       ├── open-source/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx
│       └── talks/
│           ├── page.tsx
│           ├── new/page.tsx
│           └── [id]/page.tsx
├── components/
│   ├── admin/
│   │   └── CaseStudyMetricsEditor.tsx  # Inline metrics list + add/edit/delete form
│   ├── sections/
│   │   ├── CaseStudyCard.tsx       # Card for case studies listing
│   │   ├── MetricCallout.tsx       # Highlighted stat card (label + value + unit)
│   │   ├── TestimonialCard.tsx     # Single testimonial with attribution
│   │   ├── TestimonialsSection.tsx # Self-hiding server component
│   │   ├── ArticlesSection.tsx     # Self-hiding server component
│   │   ├── OpenSourceSection.tsx   # Self-hiding server component
│   │   └── TalksSection.tsx        # Self-hiding server component
│   └── ui/
│       └── CvDownloadButton.tsx    # Self-hiding server component (no CV = renders null)
└── lib/
    └── content/
        ├── queries.ts              # + getPublishedCaseStudies, getCaseStudyBySlug,
        │                           #   getPublishedCvAsset, getPublishedTestimonials,
        │                           #   getPublishedArticles, getPublishedOpenSourceContributions,
        │                           #   getPublishedTalks, getSectionVisibility
        ├── types.ts                # + CaseStudy, CaseStudyMetric, CvAsset, Testimonial (updated),
        │                           #   Article, OpenSourceContribution, Talk, SectionVisibility
        └── validation.ts           # + createCaseStudySchema, caseStudyMetricSchema,
                                    #   cvAssetSchema, createArticleSchema, createOpenSourceSchema,
                                    #   createTalkSchema, updateTestimonialSchema (updated)
```

**Structure Decision**: Single Next.js monolith (unchanged from Phase 3). Public routes added under `src/app/case-studies/`. Public API route for CV download at `src/app/api/cv/download/`. All admin routes and UI pages follow the established Phase 3 patterns. No new directories outside the existing `src/` tree.

## Complexity Tracking

> No constitution violations requiring justification.

---

## Post-Design Constitution Re-Check (Phase 1 complete)

| # | Principle | Status | Notes |
|---|---|---|---|
| I | Phase-Gated | ✅ PASS | All Phase 4 design artifacts complete; implementation blocked until `/speckit.analyze` |
| II | Admin-Managed Content | ✅ PASS | Case studies, CV, testimonials, all optional sections — 100% admin-managed |
| III | Content Visibility Safety | ✅ PASS | `notFound()` for draft slugs; `published: true, isVisible: true` on all public queries; CV key proxied |
| IV | Server-Side Validation | ✅ PASS | All admin API routes use `requireAdminSession()` + Zod validation; file type/size validated on CV upload |
| V | PostgreSQL | ✅ PASS | Single `phase4_advanced_portfolio` migration covers all schema changes |
| VI | MinIO | ✅ PASS | CV stored in MinIO; old CV deleted from MinIO before new one stored; no filesystem writes |
| VII | Graceful UI | ✅ PASS | All section components return `null` on empty; no heading renders without content |
| VIII | Production-Grade | ✅ PASS | Slug uniqueness at DB level; two-condition section visibility; CV download proxied; DB indexes on all list entities |
| IX | Spec-Driven | ✅ PASS | research.md + data-model.md + contracts/ complete; tasks.md already generated |
| X | Docker Compose | ✅ PASS | No new containers; existing MinIO bucket reused |
