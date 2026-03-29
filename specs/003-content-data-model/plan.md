# Implementation Plan: Phase 2 — Content Architecture & Data Model

**Branch**: `003-content-data-model` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-content-data-model/spec.md`

## Summary

Define and persist the complete content data model for the senior developer portfolio platform. This phase introduces 11 content entities with draft/published lifecycle states, per-item visibility controls, numeric display ordering, and enforced referential integrity — providing the authoritative data contract for the Phase 3 admin portal and Phase 1 public rendering layer.

The implementation targets Prisma 5 migrations against the existing PostgreSQL 16 database, extending the Phase 1 schema (which contains `Hero`, `About`, `Skill`, `ExperienceEntry`, `Project`, `ContactReference`) with full lifecycle support and 6 new entities.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20 LTS
**Primary Dependencies**: Next.js 14+ (App Router), Prisma 5, Zod
**Storage**: PostgreSQL 16 (Prisma Migrate; MinIO for binary assets — referenced only, not uploaded in Phase 2)
**Testing**: Jest / ts-jest (unit); Prisma integration tests against real PostgreSQL instance
**Target Platform**: Self-hosted VPS (Docker Compose); local Docker for development
**Project Type**: web-service
**Performance Goals**: Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms); all list queries indexed on `(published, isVisible, displayOrder)`
**Constraints**: Draft/hidden content MUST never be returned by public queries; singletons enforced at DB layer; CaseStudy cannot exist without a parent Project; FR-005 "define and enforce validation" — Phase 2 scope is **definition only** (Zod schemas in `validation.ts`); enforcement at API call sites is a Phase 3 deliverable
**Scale/Scope**: Single-admin CMS; 11 content entity types; ~50–200 content records total at launch

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — see bottom.*

| # | Principle | Status | Notes |
|---|---|---|---|
| I | Phase-Gated Delivery | ✅ PASS | Phase 1 MVP complete on `002-public-portfolio-mvp`; Phase 2 begins only now |
| II | Admin-Managed Public Content | ✅ PASS | All 11 entities expose `published`/`isVisible` fields; no content hardcoded in UI |
| III | Content Visibility Safety | ✅ PASS | FR-001, FR-002, FR-017 mandate strict filter; enforced in query contract |
| IV | Server-Side Validation | ✅ PASS | Zod schemas defined in contracts; enforcement deferred to Phase 3 admin API |
| V | PostgreSQL for All Persistent Data | ✅ PASS | Prisma 5 + PostgreSQL 16; Prisma Migrate for all schema changes |
| VI | MinIO for Uploaded Assets | ✅ PASS | `MediaAsset` entity models file references; actual upload/MinIO integration deferred to Phase 3 |
| VII | Graceful Public UI Under Partial Content | ✅ PASS | `getPublishedVisible()` query returns empty array — caller handles empty state |
| VIII | Production-Grade Standards | ✅ PASS | Composite indexes on query-hot columns; `@db.VarChar` length constraints; no secrets in schema |
| IX | Spec-Driven Development | ✅ PASS | Full Spec Kit workflow in progress; no implementation before tasks + analyze complete |
| X | VPS Deployment via Docker Compose | ✅ PASS | No changes to Docker Compose topology; Prisma migrations run inside app container |

**Post-design re-check**: see bottom of this file.

## Project Structure

### Documentation (this feature)

```text
specs/003-content-data-model/
├── plan.md              # This file
├── research.md          # Phase 0 — design decisions and rationale
├── data-model.md        # Phase 1 — complete Prisma schema + validation rules
├── quickstart.md        # Phase 1 — migration and seed runbook
├── contracts/
│   ├── content-lifecycle.md        # Draft/published/hidden state machine
│   ├── content-query-interface.md  # Standard published+visible query contract
│   ├── entity-relationships.md     # Referential integrity rules
│   └── singleton-contract.md       # Singleton enforcement pattern
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
prisma/
├── schema.prisma        # Updated: 11 content entities + ProjectSkill join = 12 Prisma models
└── migrations/          # New Prisma migration for Phase 2 schema

src/
└── lib/
    └── content/
        ├── queries.ts     # Published+visible query helpers (getPublishedVisible, getSingleton)
        ├── types.ts       # Re-exported Prisma types for all 12 models
        ├── validation.ts  # Zod validation schemas (defined in Phase 2; enforced in Phase 3)
        └── index.ts       # Barrel export for queries, types, and validation schemas
```

**Structure Decision**: Single Next.js monolith. Schema changes live in `prisma/`, query utilities in `src/lib/content/`. No new API routes or UI components in Phase 2 — those are Phase 3 work.

## Complexity Tracking

> No constitution violations requiring justification.

---

## Post-Design Constitution Re-Check (Phase 1 complete)

| # | Principle | Status | Notes |
|---|---|---|---|
| I | Phase-Gated | ✅ PASS | All design artifacts complete; implementation blocked until tasks + analyze done |
| II | Admin-Managed Content | ✅ PASS | All list entities have `published` + `isVisible`; all singletons have full field coverage |
| III | Content Visibility Safety | ✅ PASS | `getPublishedVisible()` contract excludes `published=false OR isVisible=false` |
| IV | Server-Side Validation | ✅ PASS | Zod schemas in contracts/content-query-interface.md; enforced in Phase 3 |
| V | PostgreSQL | ✅ PASS | Prisma Migrate manages all schema changes |
| VI | MinIO | ✅ PASS | `MediaAsset` table is a reference registry; storage URL format is S3-compatible |
| VII | Graceful UI | ✅ PASS | Empty array safe — public site sections render empty state, not errors |
| VIII | Production-Grade | ✅ PASS | Composite indexes, VarChar bounds, FK constraints, `@updatedAt` on all entities |
| IX | Spec-Driven | ✅ PASS | research.md → data-model.md → contracts/ sequence followed |
| X | Docker Compose | ✅ PASS | No infrastructure changes |
