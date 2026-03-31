# Implementation Plan: Phase 5 - Production Hardening and Launch

**Branch**: `006-production-hardening-launch` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-production-hardening-launch/spec.md`

## Summary

Phase 5 hardens the existing Next.js portfolio into a launch-ready product by adding five production capabilities that are already scoped in the spec: dynamic SEO/social metadata plus sitemap, reliable contact message delivery with rate limiting, privacy-first analytics in the admin portal, runtime error monitoring with threshold email alerts, and release quality gates for accessibility and performance.

To keep implementation low-risk for smaller/cheaper LLMs, this plan uses explicit vertical slices with deterministic contracts and minimal moving parts:

1. SEO and sitemap slice (no new dependencies)
2. Contact form and email delivery slice (single SMTP integration)
3. Analytics capture and reporting slice (PostgreSQL only, no third-party scripts)
4. Error capture and alerting slice (PostgreSQL + same SMTP channel)
5. Launch quality gate slice (Playwright + Lighthouse CI)

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS
**Primary Dependencies**: Next.js 14.2 (App Router), Prisma 6.x, Zod 4.x, `iron-session`, `minio`, Playwright, Lighthouse CI, `nodemailer` (new)
**Storage**: PostgreSQL 16 for all persistent records; MinIO remains the only object store for media/portfolio assets
**Testing**: Playwright E2E (`tests/e2e`), Lighthouse CI (`.lighthouserc.js`), API route integration checks, manual keyboard and screen-reader verification
**Target Platform**: Self-hosted VPS via Docker Compose + Nginx reverse proxy
**Project Type**: Single Next.js web application (public portfolio + `/admin`)
**Performance Goals**: Lighthouse Performance >= 90 on desktop and mobile; LCP < 2.5s; CLS < 0.1; analytics and monitoring must be non-blocking
**Constraints**: GDPR privacy-first analytics (no personal identifiers, no third-party tracking scripts); contact rate limit 5 submissions/IP/60 min; alert threshold 3+ errors/10 min; graceful fallback when SMTP/monitoring fails
**Scale/Scope**: Single admin user, low-traffic portfolio workload, expected daily events in the hundreds (not thousands), one deployment target

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| #    | Principle                         | Status | Notes                                                                                                   |
| ---- | --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| I    | Phase-Gated Delivery              | PASS   | This work is scoped strictly to Phase 5 in `PLAN.md`; no Phase 6+ behavior introduced                   |
| II   | Admin-Managed Public Content      | PASS   | SEO overrides and contact recipient remain admin-configurable; no hardcoded content regressions         |
| III  | Content Visibility Safety         | PASS   | Sitemap includes only published public routes; no draft/admin URLs exposed                              |
| IV   | Server-Side Validation            | PASS   | Contact, analytics, and monitoring endpoints define server-side Zod validation and sanitization         |
| V    | PostgreSQL for Persistent Data    | PASS   | Contact submissions, analytics events, error events, and alert audit records persist only in PostgreSQL |
| VI   | MinIO for Uploaded Assets         | PASS   | Existing MinIO usage is unchanged; OG image values may reference MinIO-hosted assets                    |
| VII  | Graceful UI Under Partial Content | PASS   | Missing metadata/contact settings/errors must fall back safely and never crash public pages             |
| VIII | Production-Grade Standards        | PASS   | Security, SEO, a11y, and performance acceptance targets are explicit and testable                       |
| IX   | Spec-Driven Development           | PASS   | Plan artifacts generated before tasks/implementation; no coding performed in planning step              |
| X    | VPS Deployment via Docker Compose | PASS   | Deployment expectations remain Docker Compose + Nginx; no managed-cloud-only assumptions                |

## Project Structure

### Documentation (this feature)

```text
specs/006-production-hardening-launch/
├── plan.md                              # This file
├── research.md                          # Phase 0 decisions and rationale
├── data-model.md                        # Phase 1 schema and lifecycle design
├── quickstart.md                        # Phase 1 implementation and validation runbook
├── contracts/
│   ├── public-contact-api.md            # Contact submission and rate-limit contract
│   ├── analytics-api.md                 # Event ingest and admin analytics reporting contract
│   ├── seo-sitemap-contract.md          # Metadata resolution and sitemap contract
│   └── error-monitoring-contract.md     # Error capture and alert threshold contract
└── tasks.md                             # Generated by /speckit.tasks
```

### Source Code (repository root)

```text
prisma/
├── schema.prisma                        # Add Phase 5 models + SeoMetadata extension
└── migrations/
    └── [timestamp]_phase5_production_hardening_launch/
        └── migration.sql

src/
├── app/
│   ├── layout.tsx                       # Dynamic metadata resolution wiring
│   ├── sitemap.ts                       # Dynamic XML sitemap generation
│   ├── api/
│   │   ├── contact/route.ts             # Public contact endpoint
│   │   ├── analytics/page-view/route.ts # Public analytics ingest endpoint
│   │   ├── monitoring/error-events/route.ts  # Error event ingest endpoint
│   │   └── admin/
│   │       └── analytics/summary/route.ts    # Admin analytics reporting endpoint
│   ├── admin/
│   │   ├── analytics/page.tsx           # Analytics dashboard page
│   │   └── error.tsx                    # Friendly admin error boundary + reporting hook
│   └── global-error.tsx                 # Public global error fallback + reporting hook
├── components/
│   ├── sections/ContactSection.tsx      # Replace link-only block with validated contact form UX
│   └── analytics/PageViewTracker.tsx    # Non-blocking page-view sender
└── lib/
    ├── seo/metadata.ts                  # Metadata fallback/merge logic
    ├── contact/
    │   ├── validation.ts                # Contact payload schema
    │   └── service.ts                   # Persistence, rate-limit check, SMTP dispatch
    ├── analytics/
    │   ├── session.ts                   # Daily anonymized session hash utility
    │   └── queries.ts                   # Aggregation for admin charts/cards
    ├── monitoring/
    │   ├── capture.ts                   # Error capture helper (non-throwing)
    │   └── alerts.ts                    # Threshold check + alert dispatch
    └── email/transporter.ts             # Shared SMTP transport for contact + alerts

tests/
└── e2e/
    ├── production-hardening.spec.ts     # Contact, sitemap, metadata, error flows
    └── accessibility.spec.ts            # Keyboard/focus and a11y checks
```

**Structure Decision**: Keep the current single-project Next.js architecture and add focused modules under `src/lib` plus route handlers under `src/app/api`. This matches existing repo conventions and minimizes cross-cutting refactors.

## Complexity Tracking

No constitution violations require justification.

---

## Post-Design Constitution Re-Check (Phase 1 complete)

| #    | Principle                      | Status | Notes                                                                        |
| ---- | ------------------------------ | ------ | ---------------------------------------------------------------------------- |
| I    | Phase-Gated Delivery           | PASS   | Research, data model, contracts, and quickstart are all Phase 5 scoped       |
| II   | Admin-Managed Public Content   | PASS   | SEO and contact recipient configuration remain admin-managed with defaults   |
| III  | Content Visibility Safety      | PASS   | Sitemap contract explicitly excludes drafts/admin URLs                       |
| IV   | Server-Side Validation         | PASS   | All new endpoints include strict payload validation and sanitization rules   |
| V    | PostgreSQL for Persistent Data | PASS   | All new persistent entities are PostgreSQL models                            |
| VI   | MinIO for Uploaded Assets      | PASS   | No deviation from MinIO asset policy                                         |
| VII  | Graceful Public UI             | PASS   | Contact and metadata fallbacks prevent user-facing crashes on partial config |
| VIII | Production-Grade Standards     | PASS   | A11y/perf/error/SEO criteria are measurable and mapped to validation steps   |
| IX   | Spec-Driven Development        | PASS   | `/speckit.plan` outputs completed before `/speckit.tasks`                    |
| X    | VPS + Docker Compose           | PASS   | Deployment assumptions remain VPS + Docker Compose + Nginx                   |
