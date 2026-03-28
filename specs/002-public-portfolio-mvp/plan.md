# Implementation Plan: Phase 1 — Public Portfolio MVP

**Branch**: `002-public-portfolio-mvp` | **Date**: 2026-03-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-public-portfolio-mvp/spec.md`

## Summary

Build a polished, recruiter-facing public portfolio as a single-page scrollable Next.js application. All content (hero, about, skills, experience, projects, contact) is read at runtime from a seeded PostgreSQL database via Prisma server components. The page renders fully server-side with no client-side JavaScript required for content visibility, a sticky anchor-link header, and a mobile-first responsive layout. No admin interface, contact form, or media upload is in scope for this phase.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20 LTS
**Primary Dependencies**: Next.js 14+ (App Router), Tailwind CSS 3, Prisma 5, PostgreSQL 16
**Storage**: PostgreSQL 16 (content records only — no file uploads in Phase 1; MinIO not required)
**Testing**: Playwright (E2E layout/rendering), Vitest + Testing Library (component unit tests)
**Target Platform**: Docker Compose on self-hosted VPS; Nginx reverse proxy for HTTPS termination
**Project Type**: Web application — server-rendered public portfolio
**Performance Goals**: LCP < 2.5s, CLS < 0.1, INP < 200ms (per Constitution Principle VIII); page visually usable within 3s on broadband (SC-008)
**Constraints**: Fully server-rendered (no JS required for content); WCAG 2.1 AA on all public UI; single developer profile; read-only public surface in Phase 1
**Scale/Scope**: Single-profile, low-traffic portfolio; no horizontal scaling requirements in Phase 1

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design below.*

| Principle | Status | Notes |
|---|---|---|
| I. Phase-Gated Delivery | ✅ PASS | Phase 1 scope only; no Phase 2+ work introduced |
| II. Admin-Managed Public Content | ✅ PASS | Spec explicitly declares Phase 1 content as seeded/static — permitted exception |
| III. Content Visibility Safety | ✅ PASS | No draft state in Phase 1; all seeded records are published by definition |
| IV. Server-Side Validation | ✅ PASS | No admin actions in Phase 1; read-only public surface |
| V. PostgreSQL | ✅ PASS | PostgreSQL 16 mandated; Prisma Migrate for schema |
| VI. MinIO | ✅ PASS | No uploaded assets in Phase 1 (project links are URLs, not images); MinIO deferred to Phase 3+ |
| VII. Graceful Public UI | ✅ PASS | FR-010: sections with no records hidden entirely |
| VIII. Production-Grade Standards — Performance | ✅ PASS | LCP < 2.5s per constitution; SC-008 (3s) is the gross usability window |
| VIII. Production-Grade Standards — Accessibility | ⚠️ RESOLVED (see below) | Spec assumption conflicted with constitution; resolved in plan |
| VIII. Production-Grade Standards — Security | ✅ PASS | Public read-only; HTTPS via Nginx; no secrets in source |
| VIII. Production-Grade Standards — SEO | ✅ PASS | FR-008 covers title, meta, heading hierarchy, semantic landmarks |
| IX. Spec-Driven Development | ✅ PASS | Full Spec Kit workflow followed |
| X. Docker Compose Deployment | ✅ PASS | Docker Compose with Next.js + PostgreSQL + Nginx included in Phase 1 scope |

### Accessibility Violation Resolution

The spec assumption stated: *"Accessibility compliance beyond correct semantic HTML and keyboard navigability of interactive elements is a Phase 5 concern."* This conflicts with **Constitution Principle VIII (NON-NEGOTIABLE)** which mandates WCAG 2.1 AA for all public-facing UI.

**Resolution**: Phase 1 MUST deliver WCAG 2.1 AA compliance. This is achievable in Phase 1 because:
- The UI is server-rendered HTML with Tailwind — no complex client interactions requiring ARIA state management
- Correct semantic HTML + heading hierarchy is already required by FR-008/FR-009
- Keyboard navigability of the sticky nav and contact links is straightforward
- Color contrast ≥ 4.5:1 is a design-time decision (Tailwind palette selection)
- ARIA labels on icon-only buttons/links is minimal scope

The Phase 5 accessibility task is reframed as a **full WCAG 2.1 AA audit** (validation pass), not initial implementation. The spec assumption is superseded by this plan.

**Updated constraint added**: FR-014 (see research.md — no spec amendment required; this is a plan-level constraint enforcement).

*Post-design re-check*: Gates confirmed passing after Phase 1 design below. ✅

---

## Project Structure

### Documentation (this feature)

```text
specs/002-public-portfolio-mvp/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/           ← Phase 1 output
│   ├── page-data.ts     ← TypeScript data shape contracts per section
│   └── seed-contract.md ← Seed data requirements and validation rules
├── checklists/
│   └── requirements.md
└── tasks.md             ← Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx                  ← Root layout: HTML shell, metadata, font
│   ├── page.tsx                    ← Home page: orchestrates all sections
│   └── globals.css                 ← Tailwind base + custom CSS variables
├── components/
│   ├── layout/
│   │   └── Header.tsx              ← Sticky nav with anchor links (Client Component)
│   └── sections/
│       ├── HeroSection.tsx
│       ├── AboutSection.tsx
│       ├── SkillsSection.tsx
│       ├── ExperienceSection.tsx
│       ├── ProjectsSection.tsx
│       └── ContactSection.tsx
├── lib/
│   ├── db.ts                       ← Prisma client singleton
│   └── data/
│       ├── hero.ts                 ← getHeroData()
│       ├── about.ts                ← getAboutData()
│       ├── skills.ts               ← getSkillGroups()
│       ├── experience.ts           ← getExperienceEntries()
│       ├── projects.ts             ← getProjects()
│       └── contact.ts              ← getContactRefs()
└── types/
    └── portfolio.ts                 ← TypeScript types matching Prisma output

prisma/
├── schema.prisma                    ← Database schema (all Phase 1 models)
├── migrations/                      ← Auto-generated by Prisma Migrate
└── seed.ts                          ← Seed script with developer content

docker/
├── docker-compose.yml               ← next-app + postgres + nginx services
├── Dockerfile                       ← Multi-stage Next.js build
└── nginx/
    └── default.conf                 ← Reverse proxy + HTTPS config

.env.example                         ← Template for DATABASE_URL + other env vars
```

**Structure Decision**: Single Next.js application (App Router). No separate backend service in Phase 1 — Prisma is called directly from React Server Components via `lib/db.ts`. This is the simplest correct approach for a read-only public surface. A separate API layer is introduced only if Phase 3 admin complexity demands it.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| WCAG 2.1 AA in Phase 1 (previously deferred) | Constitution Principle VIII is NON-NEGOTIABLE for public UI | Deferring to Phase 5 would mean the public portfolio is live in a non-compliant state between phases |
