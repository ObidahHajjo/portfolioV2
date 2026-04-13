# Tasks: Public Portfolio Terminal Theme Alignment

**Input**: Design documents from `/specs/007-align-terminal-theme/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: Extend the existing public Playwright suites and add targeted performance validation because the spec and quickstart require regression coverage for homepage behavior, mobile stability, accessibility, reduced-motion-safe theming, and user-visible performance.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Every task includes exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the reusable public theme scaffolding and validation entry points the rest of the feature builds on.

- [x] T001 Create shared terminal chrome wrapper in `src/components/theme/TerminalFrame.tsx`
- [x] T002 Create homepage ambient backdrop component in `src/components/theme/MatrixBackdrop.tsx`
- [x] T003 [P] Extend semantic terminal theme tokens in `tailwind.config.ts`
- [x] T004 [P] Create public performance validation scaffold in `tests/e2e/performance.spec.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared public dark-terminal theme layer before any user story-specific restyling begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Update global terminal palette, utility classes, and reduced-motion-safe base styles in `src/app/globals.css`
- [x] T006 Update shared public shell defaults for the single dark terminal theme in `src/app/layout.tsx`
- [x] T007 Update sticky public navigation chrome and shared focus behavior in `src/components/layout/Header.tsx`
- [x] T008 Wire shared terminal wrappers and homepage ambient layer into the public homepage composition in `src/app/page.tsx`

**Checkpoint**: Shared theme foundation is ready and user stories can now be implemented independently.

---

## Phase 3: User Story 1 - Distinctive First Impression (Priority: P1) 🎯 MVP

**Goal**: Give the homepage the reference portfolio's terminal-inspired first impression while keeping the current content structure, hierarchy, and calls to action clear.

**Independent Test**: Load `/` and verify the visual language is clearly terminal-inspired, the hero remains immediately scannable, and the primary contact path stays more prominent than decorative styling.

### Tests for User Story 1

- [x] T009 [US1] Extend homepage regression coverage for terminal styling, hero hierarchy, and contact CTA prominence in `tests/e2e/portfolio.spec.ts`

### Implementation for User Story 1

- [x] T010 [P] [US1] Restyle the hero with terminal-first hierarchy and homepage ambient treatment in `src/components/sections/HeroSection.tsx`
- [x] T011 [P] [US1] Restyle the about section with terminal panel typography in `src/components/sections/AboutSection.tsx`
- [x] T012 [P] [US1] Restyle the skills section with terminal-themed grouping and badges in `src/components/sections/SkillsSection.tsx`
- [x] T013 [P] [US1] Restyle the experience section with terminal-themed timeline or panel treatment in `src/components/sections/ExperienceSection.tsx`
- [x] T014 [P] [US1] Restyle project cards and outbound actions for terminal-style scanability in `src/components/sections/ProjectsSection.tsx`
- [x] T015 [P] [US1] Restyle homepage contact call-to-action and form shell for terminal emphasis in `src/components/sections/ContactSection.tsx`
- [x] T016 [US1] Refine homepage section sequencing and wrapper usage for consistent terminal chrome in `src/app/page.tsx`

**Checkpoint**: User Story 1 is fully functional and independently testable on the homepage.

---

## Phase 4: User Story 2 - Accessible Themed Browsing (Priority: P2)

**Goal**: Preserve accessibility, mobile usability, keyboard navigation, reduced-motion behavior, and explicit validation standards under the new terminal theme.

**Independent Test**: Review `/` on small and large viewports, navigate with keyboard only, enable reduced motion, and confirm the dark terminal experience remains readable, operable, and free of critical accessibility regressions.

### Tests for User Story 2

- [x] T017 [US2] Extend keyboard, focus-visibility, and decorative-semantics coverage in `tests/e2e/accessibility.spec.ts`
- [x] T018 [US2] Extend mobile overflow and touch-target coverage for the terminal theme in `tests/e2e/mobile.spec.ts`

### Implementation for User Story 2

- [x] T019 [US2] Add terminal-theme focus, contrast, and reduced-motion refinements in `src/app/globals.css`
- [x] T020 [US2] Make the ambient backdrop reduced-motion aware and decorative-only in `src/components/theme/MatrixBackdrop.tsx`
- [x] T021 [US2] Refine keyboard flow, mobile toggle behavior, and visible focus states in `src/components/layout/Header.tsx`
- [x] T022 [US2] Refine terminal-themed contact form states, validation visibility, and interactive contrast in `src/components/sections/ContactSection.tsx`
- [x] T023 [US2] Apply calmer long-form spacing and reading defaults on public case-study routes in `src/app/case-studies/page.tsx` and `src/app/case-studies/[slug]/page.tsx`
- [x] T024 [US2] Add explicit accessibility and reduced-motion verification steps to `specs/007-align-terminal-theme/quickstart.md`

**Checkpoint**: User Stories 1 and 2 both work independently; the terminal theme is accessible and stable across supported public browsing modes.

---

## Phase 5: User Story 3 - Existing Content Still Drives the Experience (Priority: P3)

**Goal**: Extend the terminal theme across public case-study surfaces and content-driven public components without breaking published-content rules, missing-content handling, or graceful fallback behavior.

**Independent Test**: Load `/`, `/case-studies`, `/case-studies/[slug]`, and the case-study not-found flow with varying published content and verify the themed presentation adapts cleanly without introducing placeholders, broken empty states, or draft leakage.

### Tests for User Story 3

- [x] T025 [US3] Extend public regression coverage for case-study routes, not-found handling, and empty-state behavior in `tests/e2e/portfolio.spec.ts`

### Implementation for User Story 3

- [x] T026 [P] [US3] Restyle the public case-study listing surface for terminal-themed cards and empty states in `src/app/case-studies/page.tsx`
- [x] T027 [P] [US3] Restyle the public case-study detail surface for calm terminal long-form reading in `src/app/case-studies/[slug]/page.tsx`
- [x] T028 [P] [US3] Restyle the case-study missing-content fallback in `src/app/case-studies/[slug]/not-found.tsx`
- [x] T029 [P] [US3] Restyle case-study summary cards and metric callouts for the shared terminal system in `src/components/sections/CaseStudyCard.tsx` and `src/components/sections/MetricCallout.tsx`
- [x] T030 [P] [US3] Restyle optional public advanced-content sections for terminal consistency in `src/components/sections/TestimonialsSection.tsx`, `src/components/sections/ArticlesSection.tsx`, `src/components/sections/OpenSourceSection.tsx`, and `src/components/sections/TalksSection.tsx`
- [x] T031 [US3] Verify public content loading and self-hiding behavior remain data-driven with the new wrappers in `src/app/page.tsx` and `src/lib/content/queries.ts`

**Checkpoint**: All user stories are independently functional and the terminal theme extends across the in-scope public surfaces without changing content rules.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements that affect multiple stories.

- [x] T032 Add user-visible performance validation for homepage and case-study routes in `tests/e2e/performance.spec.ts`
- [x] T033 [P] Update the validation runbook for discoverability, accessibility audit, and performance checks in `specs/007-align-terminal-theme/quickstart.md`
- [x] T034 Fine-tune global terminal contrast, glow intensity, and shared surface balance across `src/app/globals.css`, `src/components/theme/TerminalFrame.tsx`, and `src/components/layout/Header.tsx`
- [x] T035 Run quickstart validation and full public regression coverage using `specs/007-align-terminal-theme/quickstart.md`, `tests/e2e/portfolio.spec.ts`, `tests/e2e/mobile.spec.ts`, `tests/e2e/accessibility.spec.ts`, and `tests/e2e/performance.spec.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion; can proceed after US1 or in parallel if staffed
- **User Story 3 (Phase 5)**: Depends on Foundational completion; can proceed after US1 or in parallel if staffed
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after Phase 2
- **US2 (P2)**: No functional dependency on other stories after Phase 2, but benefits from US1 visual scaffolding being in place
- **US3 (P3)**: No data dependency on other stories after Phase 2, but should reuse the shared theme language established by US1

### Within Each User Story

- Extend tests before finalizing implementation in that story
- Shared wrappers and route composition before section-by-section refinements when they touch the same surface
- Core route and section implementation before final regression verification

### Parallel Opportunities

- `T003` and `T004` can run in parallel with `T001`-`T002`
- Within US1, `T010`-`T015` can run in parallel because they touch different section files
- Within US3, `T026`-`T030` can run in parallel because they touch different public surfaces
- In Phase 6, `T033` can run in parallel with `T032`, but `T034` must complete before `T035`

---

## Parallel Example: User Story 1

```bash
# Launch section restyling tasks for the homepage in parallel:
Task: "Restyle the hero with terminal-first hierarchy and homepage ambient treatment in src/components/sections/HeroSection.tsx"
Task: "Restyle the about section with terminal panel typography in src/components/sections/AboutSection.tsx"
Task: "Restyle the skills section with terminal-themed grouping and badges in src/components/sections/SkillsSection.tsx"
Task: "Restyle the experience section with terminal-themed timeline or panel treatment in src/components/sections/ExperienceSection.tsx"
Task: "Restyle project cards and outbound actions for terminal-style scanability in src/components/sections/ProjectsSection.tsx"
Task: "Restyle homepage contact call-to-action and form shell for terminal emphasis in src/components/sections/ContactSection.tsx"
```

---

## Parallel Example: User Story 3

```bash
# Launch public advanced-surface restyling in parallel:
Task: "Restyle the public case-study listing surface for terminal-themed cards and empty states in src/app/case-studies/page.tsx"
Task: "Restyle the public case-study detail surface for calm terminal long-form reading in src/app/case-studies/[slug]/page.tsx"
Task: "Restyle the case-study missing-content fallback in src/app/case-studies/[slug]/not-found.tsx"
Task: "Restyle case-study summary cards and metric callouts for the shared terminal system in src/components/sections/CaseStudyCard.tsx and src/components/sections/MetricCallout.tsx"
Task: "Restyle optional public advanced-content sections for terminal consistency in src/components/sections/TestimonialsSection.tsx, src/components/sections/ArticlesSection.tsx, src/components/sections/OpenSourceSection.tsx, and src/components/sections/TalksSection.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm the homepage delivers the terminal-style first impression without breaking hierarchy or CTA clarity

### Incremental Delivery

1. Complete Setup + Foundational to establish the shared dark-terminal layer
2. Deliver US1 for the homepage-first MVP
3. Deliver US2 to lock accessibility, reduced motion, and mobile stability
4. Deliver US3 to extend the theme across case-study and content-driven public surfaces
5. Finish with cross-cutting polish and full quickstart validation

### Parallel Team Strategy

With multiple developers:

1. One developer completes Setup + Foundational theme scaffolding
2. After Phase 2:
   - Developer A: US1 homepage sections
   - Developer B: US2 accessibility and browsing refinements
   - Developer C: US3 case-study and advanced-content surfaces
3. Reunite for Phase 6 validation and polish

---

## Notes

- All tasks follow the required checklist format: checkbox, task ID, optional `[P]`, required `[US#]` on story tasks, and exact file paths
- No schema, storage, or dependency tasks are included because the plan explicitly forbids them for this feature
- Existing data loaders and published-only behavior remain authoritative; theme work must not replace content with hardcoded copy
- The regenerated task list closes the earlier analysis gaps for public performance validation, case-study not-found handling, and unsafe parallel execution markers
- Stop at each story checkpoint and validate that the story works independently before moving on
