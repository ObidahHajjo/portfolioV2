# Implementation Plan: Phase 0 — Foundation & Constitution

**Branch**: `001-phase-0-foundation` | **Date**: 2026-03-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-phase-0-foundation/spec.md`

## Summary

Phase 0 establishes the authoritative governance artefacts for the entire
senior developer portfolio platform. It produces no deployable application
code. Its outputs — the Spec Kit constitution, the content classification,
the security baseline, the deployment strategy, and the performance targets
— are consumed as binding constraints by all subsequent phases.

Technical approach: all outputs are versioned Markdown documents committed
to the repository under `.specify/memory/` and `specs/001-phase-0-foundation/`.
No database, runtime, or build tooling is involved. The constitution
(already ratified at v1.0.0) is the primary output; all other artefacts
expand on it with phase-consumable detail.

## Technical Context

**Language/Version**: N/A — Phase 0 is documentation only
**Primary Dependencies**: N/A
**Storage**: N/A
**Testing**: Manual verification against Success Criteria (SC-001 – SC-006)
**Target Platform**: Repository (Markdown, committed to `main` branch via `001-phase-0-foundation`)
**Project Type**: Governance / documentation
**Performance Goals**: N/A
**Constraints**: All artefacts must be complete and unambiguous before Phase 1
begins; no artefact may reference future-phase implementation decisions
**Scale/Scope**: 10 functional requirements, 6 success criteria, 5 clarifications,
6 user stories, 11 admin-managed content types classified

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Pre-Research | Post-Design |
|---|---|---|---|
| I | Phase-Gated Delivery | ✅ Pass | ✅ Pass |
| II | Admin-Managed Public Content | ✅ Pass | ✅ Pass |
| III | Content Visibility Safety | ✅ Pass | ✅ Pass |
| IV | Server-Side Validation | ✅ Pass | ✅ Pass |
| V | PostgreSQL Mandatory | ✅ Pass | ✅ Pass |
| VI | MinIO Mandatory | ✅ Pass | ✅ Pass |
| VII | Graceful Public UI | ✅ Pass | ✅ Pass |
| VIII | Production-Grade Standards | ✅ Pass | ✅ Pass |
| IX | Spec-Driven Development | ✅ Pass | ✅ Pass |
| X | VPS via Docker Compose | ✅ Pass | ✅ Pass |

No violations. Complexity Tracking section not required.

## Project Structure

### Documentation (this feature)

```text
specs/001-phase-0-foundation/
├── plan.md              # This file
├── research.md          # Phase 0 output — technology decisions & rationale
├── data-model.md        # Phase 0 output — conceptual content model
├── quickstart.md        # Phase 0 output — verification guide
├── contracts/
│   ├── content-classification.md   # Authoritative admin-managed vs static list
│   ├── security-baseline.md        # Security requirements for all phases
│   ├── performance-contract.md     # Public site performance targets
│   └── deployment-contract.md     # Service topology & availability posture
└── tasks.md             # Created by /speckit.tasks (not this command)
```

### Repository Structure (established by Phase 0 for all phases)

Phase 0 defines the repository layout that all subsequent phases build into.
No source code is created in Phase 0; the structure below is the target
established for Phases 1–5.

```text
.specify/
├── memory/
│   └── constitution.md       # Spec Kit governance (v1.0.0)
└── templates/                # Spec Kit templates

specs/                        # All phase specifications
├── 001-phase-0-foundation/   # This phase
├── 002-*/                    # Phase 1 (Public Portfolio MVP)
└── ...

docker/
├── docker-compose.yml        # Production orchestration
├── docker-compose.dev.yml    # Local development overrides
└── nginx/                    # Reverse proxy config (TLS termination)

src/
├── app/
│   ├── (public)/             # Public portfolio routes
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── admin/                # Admin portal routes (auth-gated)
│   │   ├── layout.tsx
│   │   └── (dashboard)/
│   └── api/                  # REST API routes
│       └── admin/            # Admin CRUD endpoints
├── components/
│   ├── public/               # Public-facing UI components
│   ├── admin/                # Admin portal UI components
│   └── shared/               # Shared primitives
├── lib/
│   ├── db/                   # Prisma client & query helpers
│   ├── storage/              # MinIO client & upload helpers
│   ├── auth/                 # Session management
│   └── validation/           # Zod schemas (shared)
└── types/                    # Shared TypeScript types

prisma/
├── schema.prisma             # Data model
└── migrations/               # Versioned migrations

public/                       # Static assets (Next.js)
```

**Structure Decision**: Single Next.js application (monolith) with
`/admin` route group behind authentication middleware. Public and admin
surfaces share the same codebase but are strictly separated by route
grouping, component directories, and API route namespacing. This avoids
monorepo overhead for a single-owner project while maintaining clear
architectural boundaries.

## Complexity Tracking

> No constitution violations to justify.
