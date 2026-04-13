# Implementation Plan: Public Portfolio Terminal Theme Alignment

**Branch**: `007-align-terminal-theme` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-align-terminal-theme/spec.md`

## Summary

Refresh the public-facing portfolio so it inherits the reference portfolio's terminal-style visual identity without copying its layout one-for-one. The implementation will centralize the terminal palette and chrome in the shared public theme layer, restyle existing public sections and public case-study pages within the current data-driven structure, and confine the strongest ambient effects to the homepage or hero while keeping long-form content calmer. No persistent data model, admin workflow, or deployment changes are required.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20 LTS  
**Primary Dependencies**: Next.js 14 App Router, React 18, Tailwind CSS 3, shadcn/ui, lucide-react, next-themes (installed but no public theme toggle in scope), Playwright  
**Storage**: PostgreSQL 16 and MinIO remain in place for existing content and assets; no schema migrations, new buckets, or new persistent storage introduced  
**Testing**: Existing Playwright suites in `tests/e2e/portfolio.spec.ts`, `tests/e2e/mobile.spec.ts`, and `tests/e2e/accessibility.spec.ts`, plus manual browser validation for reduced motion and long-form readability  
**Target Platform**: Self-hosted VPS via Docker Compose; modern desktop and mobile browsers  
**Project Type**: Public web application enhancement within the existing Next.js monolith  
**Performance Goals**: Preserve existing public targets: LCP < 2.5s, CLS < 0.1, INP < 200ms, and visually usable content within 3 seconds on broadband  
**Constraints**: Single dark terminal theme only; align the reference portfolio's core visual system and signature effects without reproducing its layout one-for-one; strongest ambient effects limited to homepage or hero; no hardcoded portfolio content; no public theme switch; no draft content leakage; no new npm packages unless an implementation blocker emerges  
**Scale/Scope**: Three public route groups (`/`, `/case-studies`, `/case-studies/[slug]`), shared public layout and section components, and targeted regression coverage across existing public E2E suites

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| #    | Principle                                           | Status  | Notes                                                                                                            |
| ---- | --------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| I    | Phase-Gated Delivery                                | ✅ PASS | `PLAN.md` now defines this work explicitly as Phase 6, so the feature has a valid roadmap phase anchor           |
| II   | Admin-Managed Public Content                        | ✅ PASS | No public content is hardcoded; the feature only changes presentation around existing data-driven content        |
| III  | Content Visibility Safety                           | ✅ PASS | Public theme work reuses existing public queries and routes; no new path may expose draft content                |
| IV   | Server-Side Validation                              | ✅ PASS | No new admin actions are introduced; existing server-side validation paths remain unchanged                      |
| V    | PostgreSQL for All Persistent Data                  | ✅ PASS | No persistence changes are introduced                                                                            |
| VI   | MinIO for Uploaded Assets and Portfolio Media       | ✅ PASS | Existing asset delivery remains unchanged; no filesystem-based upload behavior added                             |
| VII  | Graceful Public UI Under Partial or Missing Content | ✅ PASS | Theme wrappers and decorative chrome must self-hide or degrade cleanly when content is missing                   |
| VIII | Production-Grade Standards                          | ✅ PASS | Accessibility, reduced-motion handling, Core Web Vitals, and scannability remain explicit feature constraints    |
| IX   | Spec-Driven Development                             | ✅ PASS | `/speckit.specify`, `/speckit.clarify`, and `/speckit.plan` are complete before re-generating tasks and analysis |
| X    | VPS Deployment via Docker Compose                   | ✅ PASS | No infrastructure or deployment model changes are required                                                       |

## Project Structure

### Documentation (this feature)

```text
specs/007-align-terminal-theme/
├── plan.md                             # This file
├── research.md                         # Phase 0 decisions and rationale
├── data-model.md                       # Phase 1 presentation-layer model
├── quickstart.md                       # Phase 1 local verification runbook
├── contracts/
│   ├── public-theme-surface-contract.md
│   └── public-theme-accessibility-contract.md
└── tasks.md                            # Generated by /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx                      # Shared public shell and metadata wiring
│   ├── globals.css                     # Global theme tokens, utilities, focus styles, motion handling
│   ├── page.tsx                        # Public homepage composition
│   └── case-studies/
│       ├── page.tsx                    # Public case studies listing
│       └── [slug]/page.tsx             # Public case study detail page
├── components/
│   ├── layout/
│   │   └── Header.tsx                  # Sticky public navigation
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── SkillsSection.tsx
│   │   ├── ExperienceSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── ContactSection.tsx
│   │   ├── ArticlesSection.tsx
│   │   ├── OpenSourceSection.tsx
│   │   ├── TalksSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── CaseStudyCard.tsx
│   │   └── MetricCallout.tsx
│   └── theme/
│       ├── MatrixBackdrop.tsx          # Homepage-only ambient effect, reduced-motion aware
│       └── TerminalFrame.tsx           # Shared terminal-style chrome wrapper for public surfaces
└── lib/
    ├── data/                           # Existing homepage data loaders remain authoritative
    ├── content/queries.ts              # Existing public case-study and advanced-content queries
    └── seo/metadata.ts                 # Existing public metadata generation

tests/
└── e2e/
    ├── portfolio.spec.ts               # Homepage regressions
    ├── mobile.spec.ts                  # Mobile layout regressions
    └── accessibility.spec.ts           # Keyboard, focus, and semantic regressions
```

**Structure Decision**: Keep the existing single-app Next.js structure. Theme work is concentrated in `src/app/globals.css`, the public route files under `src/app/`, shared public components under `src/components/`, and the existing Playwright E2E coverage under `tests/e2e/`. A small `src/components/theme/` area is introduced only for reusable decorative wrappers that are shared across public surfaces.

## Complexity Tracking

> No constitution violations requiring justification.

---

## Post-Design Constitution Re-Check (Phase 1 complete)

| #    | Principle                    | Status  | Notes                                                                                                                                         |
| ---- | ---------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| I    | Phase-Gated Delivery         | ✅ PASS | Phase 6 is now explicitly defined in `PLAN.md`, so this feature is roadmap-aligned                                                            |
| II   | Admin-Managed Public Content | ✅ PASS | Design keeps all public content sourced from existing database-backed loaders and queries                                                     |
| III  | Content Visibility Safety    | ✅ PASS | No new public data path is introduced; themed surfaces rely on existing published-only query behavior                                         |
| IV   | Server-Side Validation       | ✅ PASS | No new admin write path or validation surface created                                                                                         |
| V    | PostgreSQL                   | ✅ PASS | No schema or persistence changes in the design                                                                                                |
| VI   | MinIO                        | ✅ PASS | Existing media delivery stays unchanged; no filesystem fallback introduced                                                                    |
| VII  | Graceful Public UI           | ✅ PASS | Theme wrappers and ambient effects are explicitly required to degrade cleanly under missing content, reduced motion, or unsupported rendering |
| VIII | Production-Grade Standards   | ✅ PASS | Design locks in single dark theme scope, contrast preservation, focus visibility, reduced-motion handling, and Core Web Vitals protection     |
| IX   | Spec-Driven Development      | ✅ PASS | `research.md`, `data-model.md`, `contracts/`, and `quickstart.md` are produced before tasks                                                   |
| X    | Docker Compose               | ✅ PASS | No new services, secrets, or deployment assumptions added                                                                                     |
