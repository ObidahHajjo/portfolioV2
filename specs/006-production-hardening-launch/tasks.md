# Tasks: Phase 5 - Production Hardening and Launch

**Input**: Design documents from `C:\Users\cdax28\Documents\senior-dev-portfolio\specs\006-production-hardening-launch\`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Test tasks are included because `spec.md` defines explicit independent test criteria and measurable quality outcomes (SEO, contact reliability, accessibility, performance, monitoring, analytics).

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unmet dependency)
- **[Story]**: Story label (`[US1]` ... `[US6]`) for traceability
- Every task includes at least one concrete file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add base dependencies and shared helpers used across multiple stories.

- [x] T001 Install SMTP dependency and lock dependency tree in `package.json` and `package-lock.json`
- [x] T002 Add Phase 5 environment variables (`SMTP_*`, `ANALYTICS_SALT`) in `.env.example`
- [x] T003 [P] Create typed environment accessor for Phase 5 variables in `src/lib/config/env.ts`
- [x] T004 [P] Create shared SMTP transporter factory in `src/lib/email/transporter.ts`
- [x] T005 [P] Create hashing helpers for anonymized identifiers in `src/lib/security/hash.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data and shared services that MUST exist before user story implementation.

**CRITICAL**: No user story work starts before this phase is complete.

- [x] T006 Extend Phase 5 persistence models and enums in `prisma/schema.prisma`
- [x] T007 Create migration SQL for Phase 5 schema changes in `prisma/migrations/[timestamp]_phase5_production_hardening_launch/migration.sql`
- [x] T008 [P] Extend SEO validation/types for canonical URL support in `src/lib/content/validation.ts` and `src/lib/content/types.ts`
- [x] T009 [P] Extend SEO admin field definitions to include canonical URL in `src/lib/admin/page-config.ts`
- [x] T010 [P] Extend SEO admin server mapping and persistence handling in `src/lib/admin/server.ts`
- [x] T011 Create shared monitoring helpers (persist event, sanitize stack, non-throwing capture) in `src/lib/monitoring/capture.ts`
- [x] T012 Create shared analytics aggregation/session helpers in `src/lib/analytics/queries.ts` and `src/lib/analytics/session.ts`
- [x] T013 Seed baseline Phase 5 records for local verification in `prisma/seed.ts`

**Checkpoint**: Foundation is ready; user stories can now be implemented.

---

## Phase 3: User Story 1 - SEO Discovery and Social Sharing (Priority: P1) MVP

**Goal**: Ensure every public page serves correct SEO/social metadata and valid sitemap entries with safe defaults.

**Independent Test**: Inspect rendered head tags, validate rich previews in social debuggers, and verify `/sitemap.xml` includes only published public URLs.

### Tests for User Story 1

- [x] T014 [P] [US1] Add metadata and sitemap assertions in `tests/e2e/production-hardening.spec.ts`

### Implementation for User Story 1

- [x] T015 [US1] Implement deterministic metadata fallback resolver in `src/lib/seo/metadata.ts`
- [x] T016 [US1] Wire root metadata generation to resolver in `src/app/layout.tsx`
- [x] T017 [US1] Wire case-study page metadata generation to resolver in `src/app/case-studies/page.tsx` and `src/app/case-studies/[slug]/page.tsx`
- [x] T018 [US1] Implement dynamic sitemap route with publish/visibility filtering in `src/app/sitemap.ts`
- [x] T019 [US1] Add default social preview asset used by metadata fallback in `public/og/portfolio-default.svg`
- [x] T020 [US1] Ensure admin SEO edit flow persists canonical URL field in `src/components/admin/AdminEntityEditor.tsx`

**Checkpoint**: US1 is fully functional and independently verifiable.

---

## Phase 4: User Story 2 - Contact Form Message Delivery (Priority: P2)

**Goal**: Deliver validated contact messages reliably via email with clear success/error UX and rate limiting.

**Independent Test**: Submit valid and invalid form payloads, confirm delivery timing, verify 429 on 6th submission in 60 minutes, and verify fallback contact behavior on SMTP failure.

### Tests for User Story 2

- [x] T021 [P] [US2] Add contact form success/validation/rate-limit/fallback tests in `tests/e2e/production-hardening.spec.ts`

### Implementation for User Story 2

- [x] T022 [US2] Create contact payload schema and sanitization helpers in `src/lib/contact/validation.ts`
- [x] T023 [US2] Implement contact submission service (persist, rate-limit, SMTP send) in `src/lib/contact/service.ts`
- [x] T024 [US2] Implement public contact API contract in `src/app/api/contact/route.ts`
- [x] T025 [US2] Replace link-only contact block with accessible contact form UI in `src/components/sections/ContactSection.tsx`
- [x] T026 [US2] Load contact settings fallback email and social links for contact section in `src/lib/data/contact.ts` and `src/app/page.tsx`

**Checkpoint**: US2 works independently and does not depend on analytics/monitoring features.

---

## Phase 5: User Story 3 - Accessibility Compliance (Priority: P3)

**Goal**: Achieve WCAG-oriented keyboard and screen-reader usability across public pages.

**Independent Test**: Run automated a11y checks and complete manual keyboard traversal with visible focus and correct semantic announcements.

### Tests for User Story 3

- [x] T027 [P] [US3] Add keyboard navigation and alt-text checks in `tests/e2e/accessibility.spec.ts`

### Implementation for User Story 3

- [x] T028 [US3] Add ARIA labels, described-by bindings, and live error regions for contact form in `src/components/sections/ContactSection.tsx`
- [x] T029 [US3] Enforce robust focus-visible styles and skip-link behavior in `src/components/layout/Header.tsx` and `src/app/globals.css`
- [x] T030 [US3] Ensure meaningful/decorative image alt handling in public section components in `src/components/sections/ProjectsSection.tsx` and `src/components/sections/HeroSection.tsx`
- [x] T031 [US3] Add manual screen-reader and keyboard verification checklist in `specs/006-production-hardening-launch/quickstart.md`

**Checkpoint**: US3 passes independent accessibility criteria.

---

## Phase 6: User Story 4 - Performance and Core Web Vitals (Priority: P4)

**Goal**: Reach performance thresholds (Lighthouse >= 90, LCP < 2.5s, CLS < 0.1) on public pages.

**Independent Test**: Run Lighthouse CI and confirm metrics meet thresholds on desktop and mobile profiles.

### Tests for User Story 4

- [x] T032 [P] [US4] Add desktop/mobile Lighthouse assertions in `.lighthouserc.js`
- [x] T033 [P] [US4] Add performance regression checks in `tests/e2e/production-hardening.spec.ts`

### Implementation for User Story 4

- [x] T034 [US4] Optimize rendering strategy for public homepage data fetches in `src/app/page.tsx`
- [x] T035 [US4] Optimize metadata/font/external-link loading behavior in `src/app/layout.tsx` and `src/components/layout/Header.tsx`
- [x] T036 [US4] Reduce layout shift risk in hero/projects sections in `src/components/sections/HeroSection.tsx` and `src/components/sections/ProjectsSection.tsx`
- [x] T037 [US4] Add repeatable performance validation run steps in `specs/006-production-hardening-launch/quickstart.md`

**Checkpoint**: US4 meets measurable performance criteria independently.

---

## Phase 7: User Story 5 - Error Monitoring and Operational Visibility (Priority: P5)

**Goal**: Capture runtime errors with context and send threshold alerts without breaking application behavior.

**Independent Test**: Trigger controlled public/admin errors and confirm persisted events plus one threshold alert email for 3+ events in 10 minutes.

### Tests for User Story 5

- [x] T038 [P] [US5] Add error capture and threshold alert test cases in `tests/e2e/production-hardening.spec.ts`

### Implementation for User Story 5

- [x] T039 [US5] Implement monitoring ingest API endpoint in `src/app/api/monitoring/error-events/route.ts`
- [x] T040 [US5] Implement threshold evaluator and alert sender in `src/lib/monitoring/alerts.ts`
- [x] T041 [US5] Add public global error boundary with background reporting in `src/app/global-error.tsx`
- [x] T042 [US5] Add admin error boundary with user-friendly fallback in `src/app/admin/error.tsx`
- [x] T043 [US5] Integrate API error handling pipeline with monitoring capture helper in `src/lib/admin/api-helpers.ts` and `src/lib/monitoring/capture.ts`

**Checkpoint**: US5 is independently observable and resilient when monitoring components fail.

---

## Phase 8: User Story 6 - Analytics Visibility (Priority: P6)

**Goal**: Capture privacy-safe page views and surface aggregated analytics in the admin portal.

**Independent Test**: Visit pages from multiple sessions and verify totals, top pages, and referral sources in `/admin/analytics` within expected reporting windows.

### Tests for User Story 6

- [x] T044 [P] [US6] Add analytics ingest and admin summary assertions in `tests/e2e/production-hardening.spec.ts`

### Implementation for User Story 6

- [x] T045 [US6] Implement non-blocking analytics ingest endpoint in `src/app/api/analytics/page-view/route.ts`
- [x] T046 [US6] Implement admin analytics summary endpoint with date filters in `src/app/api/admin/analytics/summary/route.ts`
- [x] T047 [US6] Create non-blocking page-view tracker component in `src/components/analytics/PageViewTracker.tsx`
- [x] T048 [US6] Mount analytics tracker for public routes in `src/app/layout.tsx`
- [x] T049 [US6] Build analytics dashboard page in `src/app/admin/analytics/page.tsx`
- [x] T050 [US6] Add admin sidebar navigation link for analytics in `src/components/admin/AdminShell.tsx`

**Checkpoint**: US6 is independently testable and compliant with privacy constraints.

---

## Phase 9: Polish and Cross-Cutting Concerns

**Purpose**: Final hardening, release documentation, and full-system verification.

- [x] T051 [P] Update launch environment documentation in `.env.example` and `README.md`
- [x] T052 [P] Add operational launch checklist document in `docs/phase-5-launch-checklist.md`
- [x] T053 Run full verification commands and record results in `specs/006-production-hardening-launch/quickstart.md`
- [x] T054 Normalize response error payloads across new Phase 5 endpoints in `src/app/api/contact/route.ts` and `src/app/api/monitoring/error-events/route.ts`

---

## Dependencies and Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: no dependencies
- **Phase 2 (Foundational)**: depends on Phase 1; blocks all user stories
- **Phases 3-8 (User Stories)**: depend on Phase 2 completion
- **Phase 9 (Polish)**: depends on all selected user stories being complete

### User Story Dependencies

- **US1 (P1)**: starts immediately after Phase 2
- **US2 (P2)**: starts after Phase 2; reuses shared SMTP utilities from Phase 1
- **US3 (P3)**: starts after Phase 2; can run in parallel with US2 if staffed
- **US4 (P4)**: starts after Phase 2; should run after major UI changes from US1/US2 to avoid rework
- **US5 (P5)**: starts after Phase 2; reuses shared SMTP transport created earlier
- **US6 (P6)**: starts after Phase 2; can run parallel with US5

### Recommended Completion Order

`US1 -> US2 -> US3 -> US4 -> US5 -> US6`

---

## Parallel Execution Examples Per User Story

### User Story 1

```bash
Task T014 [P] [US1] in tests/e2e/production-hardening.spec.ts
Task T019 [US1] in public/og/portfolio-default.svg
```

### User Story 2

```bash
Task T021 [P] [US2] in tests/e2e/production-hardening.spec.ts
Task T022 [US2] in src/lib/contact/validation.ts
```

### User Story 3

```bash
Task T027 [P] [US3] in tests/e2e/accessibility.spec.ts
Task T029 [US3] in src/components/layout/Header.tsx and src/app/globals.css
```

### User Story 4

```bash
Task T032 [P] [US4] in .lighthouserc.js
Task T033 [P] [US4] in tests/e2e/production-hardening.spec.ts
```

### User Story 5

```bash
Task T038 [P] [US5] in tests/e2e/production-hardening.spec.ts
Task T041 [US5] in src/app/global-error.tsx
```

### User Story 6

```bash
Task T044 [P] [US6] in tests/e2e/production-hardening.spec.ts
Task T047 [US6] in src/components/analytics/PageViewTracker.tsx
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Run `T014` + manual metadata/sitemap checks
4. Demo/deploy SEO hardening increment

### Incremental Delivery

1. Foundation (Phases 1-2)
2. SEO and sitemap (US1)
3. Contact delivery (US2)
4. Accessibility and performance (US3-US4)
5. Monitoring and analytics (US5-US6)
6. Polish and launch checklist (Phase 9)

### Low-Cost LLM Execution Notes

- Execute tasks strictly by ID order unless task is marked `[P]`.
- Do not modify files outside each task description.
- After each phase checkpoint, run only the tests referenced in that phase before continuing.
- Keep endpoint payloads exactly aligned with contracts in `specs/006-production-hardening-launch/contracts/`.
