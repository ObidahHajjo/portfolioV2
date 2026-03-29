# Tasks: Phase 2 — Content Architecture & Data Model

**Input**: Design documents from `/specs/003-content-data-model/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. Each story phase is independently verifiable against the acceptance scenarios in spec.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Maps to user story from spec.md (US1–US4)
- Exact file paths required in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the `src/lib/content/` module skeleton before any query helpers are implemented.

- [x] T001 [P] Create `src/lib/content/queries.ts` with an empty module comment (`// Phase 2 content query helpers — see contracts/content-query-interface.md`)
- [x] T002 [P] Create `src/lib/content/types.ts` with an empty module comment (`// Phase 2 content type re-exports — populated in Polish phase`)
- [x] T003 [P] Create `src/lib/content/validation.ts` with an empty module comment (`// Phase 2 Zod validation schemas — populated in Polish phase`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Apply the complete Phase 2 Prisma schema and migration. MUST complete before any user story query work begins.

**⚠️ CRITICAL**: No user story implementation can begin until T007 (migration applied) and T008 (Prisma client regenerated) are complete.

- [x] T004 Replace `prisma/schema.prisma` with the complete Phase 2 schema per `specs/003-content-data-model/data-model.md` — all 12 models: Profile, Hero (restructured), ContactSettings, SocialLink, Experience (replaces ExperienceEntry), Skill (extended), Project (extended), ProjectSkill, CaseStudy, Testimonial, SeoMetadata, MediaAsset; includes `singletonKey` constraints, `@@index([published, isVisible, displayOrder])` on all 5 list entities, and all FK/cascade rules
- [x] T005 Run `npx prisma validate` in the repo root to confirm schema syntax is valid — must exit with no errors before proceeding to migration
- [x] T006 Run `npx prisma migrate dev --name phase2-content-data-model` — generates SQL migration in `prisma/migrations/` and applies it to the local PostgreSQL database
- [x] T007 Run `npx prisma generate` to regenerate the Prisma client with all Phase 2 types
- [x] T008 Update the five Phase 1 source files that break after the Phase 2 migration — apply all changes below before running the app, as each file references renamed or dropped models or removed fields:
  - `src/types/portfolio.ts`: update `HeroData` — remove `name` (moves to Profile), rename `title→headline`, `tagline→subHeadline`, `ctaLabel→ctaText`; rename `AboutData→ProfileData` and add `fullName: string` field
  - `src/lib/data/hero.ts`: replace `db.hero.findFirst()` with `db.hero.findUniqueOrThrow({ where: { singletonKey: 'singleton' } })` wrapped in try/catch returning `null`; update the return-object keys to match: `headline`, `subHeadline`, `ctaText`, `ctaHref`
  - `src/lib/data/about.ts`: replace `db.about.findFirst()` with `db.profile.findUniqueOrThrow({ where: { singletonKey: 'singleton' } })` wrapped in try/catch returning `null`; update the return object to include `fullName` and `bio`; rename the export to `getProfileData()`
  - `src/app/page.tsx`: import `getProfileData` in place of `getAboutData`; add `profile` to the `Promise.all` call; replace `hero?.name` in the `Header` prop with `profile?.fullName`
  - `src/components/sections/HeroSection.tsx`: replace `data.name→data.headline`, `data.title→data.subHeadline`, `data.tagline` _(remove or fold into subHeadline)_, `data.ctaLabel→data.ctaText`
  - **Note**: Singletons (Hero, Profile) use `findUniqueOrThrow` not `findFirst` — the singleton pattern requires the `singletonKey` unique constraint lookup, not an unordered first-row scan. No `published`/`isVisible` filter is needed for singletons as they carry no lifecycle state.

**Checkpoint**: `npx prisma migrate status` shows all migrations Applied; `npx prisma validate` passes; app compiles without type errors.

---

## Phase 3: User Story 1 — Content Lifecycle Management (Priority: P1) 🎯 MVP

**Goal**: Every content item exists as either draft or published; draft items are completely invisible on the public site.

**Independent Test**: Create an Experience in draft state (`published: false`) via seed; run `getPublishedVisible('experience')`; confirm the draft item is absent from results. Publish it; re-run; confirm it now appears.

- [x] T009 [US1] Update `prisma/seed.ts` — add singleton upserts for Profile, Hero, and ContactSettings using the exact template in `specs/003-content-data-model/contracts/singleton-contract.md` (use `prisma.profile.upsert`, `prisma.hero.upsert`, `prisma.contactSettings.upsert` with `where: { singletonKey: 'singleton' }`)
- [x] T010 [US1] Update `prisma/seed.ts` — add 2 published Experiences (`published: true`) and 1 draft Experience (`published: false`); add 2 published Testimonials and 1 draft Testimonial; all with distinct `displayOrder` values
- [x] T011 [US1] Implement `getPublishedVisible<T>()` generic query helper in `src/lib/content/queries.ts` — filters `where: { published: true, isVisible: true }`, orders by `[{ displayOrder: 'asc' }, { createdAt: 'asc' }]`; implement `getSingleton<T>()` using `findUniqueOrThrow({ where: { singletonKey: 'singleton' } })` per `specs/003-content-data-model/contracts/content-query-interface.md`
- [x] T012 [US1] Run `npx prisma db seed`; verify draft isolation by running `getPublishedVisible('experience')` (via Prisma Studio query or a temporary `ts-node` script) and confirming only the 2 published Experience records are returned, not the draft

**Checkpoint**: User Story 1 acceptance scenarios 1, 2, 3 from spec.md are verifiable — draft items cannot be retrieved through the published query interface.

---

## Phase 4: User Story 2 — Ordered Content Display (Priority: P2)

**Goal**: Content items in each list section appear in the exact order controlled by `displayOrder`, with ties broken by `createdAt`.

**Independent Test**: Seed 3 Skills with `displayOrder` values 30, 10, 20 (intentionally out of sequence); run the published+visible query; confirm they are returned in order 10 → 20 → 30.

- [x] T013 [US2] Update `prisma/seed.ts` — add 3 published+visible Skills across at least 2 categories with non-sequential `displayOrder` values (e.g., 30, 10, 20); add 3 published+visible SocialLinks with display orders (e.g., 20, 10, 30)
- [x] T014 [P] [US2] Confirm `@@index([published, isVisible, displayOrder])` is present for all 5 list entities (`social_links`, `experiences`, `skills`, `projects`, `testimonials`) in `prisma/schema.prisma` and generated in the migration SQL at `prisma/migrations/*/migration.sql`
- [x] T015 [US2] Run `npx prisma db seed`; verify ordering by running `prisma.skill.findMany({ where: { published: true, isVisible: true }, orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] })` and confirming the Skill with `displayOrder: 10` is first in the result array

**Checkpoint**: User Story 2 acceptance scenarios 1, 2 from spec.md are verifiable — published items are returned in `displayOrder` ascending order.

---

## Phase 5: User Story 3 — Per-Item Visibility Control (Priority: P3)

**Goal**: A published item can be hidden without being deleted or unpublished; toggling `isVisible` immediately changes its public presence.

**Independent Test**: Set one published Skill's `isVisible` to `false`; run `getPublishedVisible('skill')`; confirm it is absent. Set `isVisible` back to `true`; confirm it reappears.

- [x] T016 [US3] Update `prisma/seed.ts` — add 1 published-but-hidden Skill (`published: true, isVisible: false`) and 1 published-but-hidden Testimonial (`published: true, isVisible: false`) to the existing seed data
- [x] T017 [US3] Run `npx prisma db seed`; verify `getPublishedVisible('skill')` excludes the hidden Skill — confirm the result count matches only the visible published Skills, not the hidden one

**Checkpoint**: User Story 3 acceptance scenarios 1, 2 from spec.md are verifiable — hidden items are excluded from the public query output while remaining intact in the database.

---

## Phase 6: User Story 4 — Content Relationships and Cross-References (Priority: P4)

**Goal**: Projects are linked to Skills via a join table; a CaseStudy is linked to its parent Project; both relationships are enforced at the database layer.

**Independent Test**: Seed a Project linked to 2 Skills and a CaseStudy; call `getPublishedProjects()`; confirm the response includes the linked Skills and CaseStudy in a single query without a separate lookup. Attempt to delete the Project; confirm it is blocked.

- [x] T018 [US4] Update `prisma/seed.ts` — add 2 published+visible Projects; link each to 2 existing Skills via `prisma.projectSkill.create({ data: { projectId, skillId } })`; add 1 CaseStudy linked to the first Project with all three text fields (challenge, solution, outcomes) populated
- [x] T019 [US4] Implement `getPublishedProjects()` in `src/lib/content/queries.ts` — queries `prisma.project.findMany` with `where: { published: true, isVisible: true }`, `orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }]`, and `include: { skills: { include: { skill: true } }, caseStudy: true, mediaAsset: true }` per `specs/003-content-data-model/contracts/content-query-interface.md`
- [x] T020 [P] [US4] Implement `getSeoMetadata(pageSlug: string)` in `src/lib/content/queries.ts` — returns `prisma.seoMetadata.findUnique({ where: { pageSlug } })` or `null` if not found
- [x] T021 [US4] Run `npx prisma db seed`; verify `getPublishedProjects()` returns the first Project with its `skills` array (containing 2 Skill objects) and its `caseStudy` object populated in a single Prisma call — no second query needed
- [x] T022 [US4] Verify FK Restrict enforcement: run `prisma.project.delete({ where: { id: <projectWithCaseStudy> } })` in a Prisma Studio query or `ts-node` script — confirm it throws a Prisma `P2003` foreign key constraint error, confirming orphaned CaseStudy prevention

**Checkpoint**: User Story 4 acceptance scenarios 1, 2 from spec.md are verifiable — associations are stored, retrievable in one query, and FK constraints prevent orphaning.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Complete the content module API surface with Zod schemas, type re-exports, and a barrel export.

- [x] T023 [P] Implement all 5 Zod validation schemas in `src/lib/content/validation.ts` — `ExperienceSchema`, `ProjectSchema`, `SkillSchema`, `SeoMetadataSchema`, `MediaAssetSchema` — matching the exact schema definitions in `specs/003-content-data-model/contracts/content-query-interface.md`
- [x] T024 [P] Add TypeScript type re-exports in `src/lib/content/types.ts` — re-export Prisma-generated types for all 12 models (`Profile`, `Hero`, `ContactSettings`, `SocialLink`, `Experience`, `Skill`, `Project`, `ProjectSkill`, `CaseStudy`, `Testimonial`, `SeoMetadata`, `MediaAsset`) with `export type { ... } from '@prisma/client'`
- [x] T025 [P] Create barrel export in `src/lib/content/index.ts` — export all query helpers from `./queries`, all Zod schemas from `./validation`, and all types from `./types`
- [x] T026 Run the full quickstart.md verification sequence: `npx prisma migrate status` (all Applied), `npx prisma db seed` (no errors), `npx prisma studio` spot-check confirming all 12 tables are present with correct column shapes and seed data is visible

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T001–T003 run in parallel
- **Foundational (Phase 2)**: Depends on Phase 1; T004 → T005 → T006 → T007 are strictly sequential; T008 can follow T007
- **User Stories (Phase 3–6)**: All depend on Foundational (T007 + T008) completion
  - Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3): Sequential recommended (seed builds on prior seeds)
  - Phase 6 (US4): Depends on Phase 3 seed data (uses existing Skills/Experiences)
- **Polish (Phase 7)**: Depends on all user story phases complete; T023–T025 run in parallel

### Within Each User Story

- Seed updates before query helper verification
- Query helper implementation before verification run
- Verification confirms the story's acceptance criteria before moving to next phase

### Parallel Opportunities

- T001, T002, T003 (Phase 1): All different files — run in parallel
- T014, T020 (confirmations within their stories): Can run alongside seed tasks
- T023, T024, T025 (Polish): All different files — run in parallel

---

## Parallel Example: Phase 1

```
Task T001: Create src/lib/content/queries.ts
Task T002: Create src/lib/content/types.ts          ← run in parallel with T001
Task T003: Create src/lib/content/validation.ts     ← run in parallel with T001
```

## Parallel Example: Phase 7 Polish

```
Task T023: Implement Zod schemas in src/lib/content/validation.ts
Task T024: Add type re-exports in src/lib/content/types.ts          ← parallel with T023
Task T025: Create barrel export in src/lib/content/index.ts         ← parallel with T023
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational — schema + migration (T004–T008) ⚠️ BLOCKS EVERYTHING
3. Complete Phase 3: User Story 1 — lifecycle (T009–T012)
4. **STOP and VALIDATE**: `getPublishedVisible()` excludes drafts — US1 acceptance criteria met
5. Continue to Phase 4 when ready

### Incremental Delivery

1. Setup + Foundational → schema applied, Phase 1 code updated
2. US1 (lifecycle) → published/draft isolation verified
3. US2 (ordering) → display order confirmed
4. US3 (visibility) → hidden toggle verified
5. US4 (relationships) → join queries and FK constraints verified
6. Polish → module API complete

Each story adds to the content module without breaking previous stories.

---

## Notes

- No test tasks generated (not requested in spec.md)
- All verification tasks use Prisma Studio or `ts-node` scripts — no test framework required
- `[P]` tasks operate on different files with no shared state — safe to parallelize
- Story labels map directly: US1 = User Story 1 (P1 lifecycle), US2 = (P2 ordering), US3 = (P3 visibility), US4 = (P4 relationships)
- Commit after each phase checkpoint at minimum
- Phase 2 T004 is the highest-risk task — review against data-model.md carefully before running T006
