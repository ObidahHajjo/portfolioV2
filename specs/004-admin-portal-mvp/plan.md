# Implementation Plan: Phase 3 — Admin Portal MVP

**Branch**: `004-admin-portal-mvp` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-admin-portal-mvp/spec.md`

## Summary

Build a secure, single-user admin portal for managing all 11 portfolio content entities (defined in Phase 2). The portal provides authentication with lockout protection, full CRUD for all entity types, publish/unpublish/visibility/ordering controls, MinIO-backed media uploads with orphan cleanup, a session expiry warning, draft content preview, and a dashboard summary. Implemented as a protected `/admin` route group within the existing Next.js 14 App Router monolith using `iron-session` for authentication, `shadcn/ui` for the UI component layer, and the `minio` SDK for object storage.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20 LTS
**Primary Dependencies**: Next.js 14+ (App Router), Prisma 6.x, Zod, `iron-session`, `minio`, `shadcn/ui`, `react-hook-form`, `@hookform/resolvers`, `bcryptjs`
**Storage**: PostgreSQL 16 (Prisma Migrate — one new table: `login_attempts`); MinIO (S3-compatible, file uploads)
**Testing**: Jest / ts-jest (unit for auth logic, lockout, upload cleanup); Playwright or similar for admin UI flow (optional in MVP)
**Target Platform**: Self-hosted VPS (Docker Compose); local Docker for development
**Project Type**: web-service (admin surface of existing Next.js monolith)
**Performance Goals**: Admin UI page loads < 2s; no Core Web Vitals requirement for the internal admin portal
**Constraints**: Draft content MUST never be accessible via public routes; session MUST expire after 8h absolute; all admin mutations validated server-side with Zod; no Redis dependency (lockout stored in PostgreSQL)
**Scale/Scope**: Single administrator; 11 entity types; ~50–200 content records total at launch

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — see bottom.*

| # | Principle | Status | Notes |
|---|---|---|---|
| I | Phase-Gated Delivery | ✅ PASS | Phase 2 (content data model) is complete; Phase 3 begins only now |
| II | Admin-Managed Public Content | ✅ PASS | This phase builds the admin surface for all 11 content entities; no content hardcoded in UI |
| III | Content Visibility Safety | ✅ PASS | Publish/visibility controls enforce Phase 2 `published=true AND isVisible=true` filter; preview is session-gated |
| IV | Server-Side Validation | ✅ PASS | All admin mutations validated server-side with Zod (Phase 2 schemas enforced at API call sites in this phase) |
| V | PostgreSQL for All Persistent Data | ✅ PASS | One new migration: `login_attempts` table |
| VI | MinIO for Uploaded Assets | ✅ PASS | Upload API routes write files to MinIO via `minio` SDK; direct filesystem storage prohibited |
| VII | Graceful Public UI Under Partial Content | ✅ PASS | No changes to public rendering layer; Phase 1 graceful-empty handling preserved |
| VIII | Production-Grade Standards | ✅ PASS | bcrypt cost 12; HTTP-only SameSite=Strict cookie; lockout after 5 attempts; orphan cleanup on upload failure; no secrets in source |
| IX | Spec-Driven Development | ✅ PASS | Full Spec Kit workflow followed; implementation blocked until tasks + analyze complete |
| X | VPS Deployment via Docker Compose | ✅ PASS | No new containers; MinIO and PostgreSQL already in Compose stack |

## Project Structure

### Documentation (this feature)

```text
specs/004-admin-portal-mvp/
├── plan.md                          # This file
├── research.md                      # Phase 0 — decisions and rationale
├── data-model.md                    # Phase 1 — LoginAttempt schema + session payload
├── quickstart.md                    # Phase 1 — setup, migration, dependency runbook
├── contracts/
│   ├── admin-api.md                 # REST endpoint contracts for all admin routes
│   ├── auth-session-contract.md     # Session lifecycle, cookie attributes, lockout rules
│   └── media-upload-contract.md     # Upload flow, orphan cleanup, MinIO config
└── tasks.md                         # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
prisma/
├── schema.prisma          # + LoginAttempt model
└── migrations/            # New migration: add_login_attempts_table

src/
├── app/
│   ├── (admin)/           # Route group — all admin pages
│   │   ├── layout.tsx             # Admin shell (sidebar, nav, session check)
│   │   ├── login/
│   │   │   └── page.tsx           # Login form
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Dashboard overview with entity counts
│   │   ├── profile/
│   │   │   └── page.tsx           # Singleton edit form
│   │   ├── hero/
│   │   │   └── page.tsx           # Singleton edit form
│   │   ├── contact-settings/
│   │   │   └── page.tsx           # Singleton edit form
│   │   ├── social-links/
│   │   │   ├── page.tsx           # List + order inputs
│   │   │   ├── new/page.tsx       # Create form
│   │   │   └── [id]/page.tsx      # Edit form
│   │   ├── experiences/           # Same pattern as social-links
│   │   ├── projects/              # Same pattern
│   │   ├── case-studies/          # Same pattern (linked to parent project)
│   │   ├── skills/                # Same pattern
│   │   ├── testimonials/          # Same pattern
│   │   ├── seo-metadata/          # Same pattern (keyed by pageSlug)
│   │   └── media-assets/          # Upload UI + asset list
│   └── api/
│       └── admin/
│           ├── auth/
│           │   ├── login/route.ts
│           │   └── logout/route.ts
│           ├── session/
│           │   ├── status/route.ts
│           │   └── extend/route.ts
│           ├── dashboard/
│           │   └── summary/route.ts
│           ├── media-assets/
│           │   └── upload/route.ts
│           ├── profiles/route.ts
│           ├── heroes/route.ts
│           ├── contact-settings/route.ts
│           └── {entity}/
│               ├── route.ts               # GET list, POST create
│               └── [id]/
│                   ├── route.ts           # GET, PATCH, DELETE
│                   ├── publish/route.ts
│                   ├── unpublish/route.ts
│                   ├── hide/route.ts
│                   ├── show/route.ts
│                   └── order/route.ts
├── lib/
│   ├── session.ts          # iron-session config + getSession()/requireSession() helpers
│   ├── auth.ts             # verifyCredentials(), checkLockout(), recordAttempt()
│   └── minio.ts            # MinIO Client singleton
├── components/
│   └── admin/
│       ├── AdminShell.tsx          # Sidebar + layout wrapper
│       ├── SessionWarning.tsx      # Expiry warning modal (polls /api/admin/session/status)
│       ├── EntityList.tsx          # Reusable list table with publish/order/delete actions
│       ├── EntityForm.tsx          # Reusable form wrapper (react-hook-form + zod)
│       └── MediaUploadField.tsx    # File input + upload progress + asset link
middleware.ts               # Protects /admin/* routes; redirects unauthenticated requests
```

**Structure Decision**: Single Next.js monolith. Admin routes live in `src/app/(admin)/` route group. API routes under `src/app/api/admin/`. Shared utilities in `src/lib/`. Admin-specific UI components in `src/components/admin/`. Public routes and components remain untouched.

## Complexity Tracking

> No constitution violations requiring justification.

---

## Post-Design Constitution Re-Check (Phase 1 complete)

| # | Principle | Status | Notes |
|---|---|---|---|
| I | Phase-Gated | ✅ PASS | All design artifacts complete; implementation blocked until tasks + analyze done |
| II | Admin-Managed Content | ✅ PASS | All 11 entity types have management screens; no content hardcoded |
| III | Content Visibility Safety | ✅ PASS | Preview gated by session; public routes unchanged; draft filter from Phase 2 preserved |
| IV | Server-Side Validation | ✅ PASS | All API routes validate with Phase 2 Zod schemas before Prisma calls |
| V | PostgreSQL | ✅ PASS | `login_attempts` migration; `iron-session` is cookiestore — no session table needed |
| VI | MinIO | ✅ PASS | `minio` SDK writes all uploads; orphan cleanup on DB failure; no filesystem storage |
| VII | Graceful UI | ✅ PASS | Public rendering layer not modified; admin portal is internal-only |
| VIII | Production-Grade | ✅ PASS | bcrypt cost 12; SameSite=Strict HTTP-only cookie; 5-attempt lockout; orphan cleanup; SESSION_SECRET env-only |
| IX | Spec-Driven | ✅ PASS | research.md + data-model.md + contracts/ sequence complete |
| X | Docker Compose | ✅ PASS | No new containers; MinIO and PostgreSQL already in Compose stack |
