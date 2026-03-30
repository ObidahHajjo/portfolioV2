# Tasks: Phase 1 — Public Portfolio MVP

**Input**: Design documents from `/specs/002-public-portfolio-mvp/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Minimal E2E test included in Polish phase to validate acceptance scenarios. No per-story TDD (not requested).

**Organization**: Tasks grouped by user story to enable independent implementation and testing.
Each task is written to be self-contained — a smaller LLM can execute each task without reading other documents.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase (different files, no shared dependency)
- **[Story]**: Maps to user story from spec.md (US1–US6)

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Bootstrap the Next.js project, tooling, Docker infrastructure, and environment config.
No user story work can begin until this phase is complete.

- [x] T001 Initialize Next.js 14 App Router + TypeScript project at repo root: run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias` — accept all defaults; this creates `src/app/`, `tailwind.config.ts`, `tsconfig.json`, and `next.config.ts`; then open `next.config.ts` and add `output: 'standalone'` to the config object (required for the Docker multi-stage build to find `.next/standalone`)
- [x] T002 [P] Create `.prettierrc` at repo root: `{ "singleQuote": true, "semi": true, "tabWidth": 2, "printWidth": 100, "trailingComma": "es5" }` — install `prettier` as dev dependency
- [x] T003 [P] The `.env.example` already exists at repo root from Phase 0 with DATABASE_URL, POSTGRES_PASSWORD, MinIO vars, SESSION_SECRET, and NEXT_PUBLIC_APP_URL — do NOT overwrite it. Only verify that `DATABASE_URL` matches the local dev Postgres service defined in `docker/docker-compose.yml` (e.g., `postgresql://postgres:postgres@localhost:5432/portfolio_dev`) and copy `.env.example` to `.env.local` for local development
- [x] T004 Create `docker/docker-compose.yml` with three named services: `postgres` (image: postgres:16-alpine, port 5432:5432, env POSTGRES_USER/PASSWORD/DB all set to `postgres`, named volume `postgres_data`, healthcheck `pg_isready -U postgres`), `next-app` (build context `../`, dockerfile `docker/Dockerfile`, port 3000:3000, env DATABASE_URL, depends_on postgres with condition `service_healthy`), `nginx` (image: nginx:alpine, ports 80:80, volume `./nginx/default.conf:/etc/nginx/conf.d/default.conf`, depends_on next-app)
- [x] T005 [P] Create `docker/Dockerfile` as a two-stage build: stage 1 `FROM node:20-alpine AS builder` installs deps with `npm ci`, runs `npx prisma generate`, runs `npm run build`; stage 2 `FROM node:20-alpine AS runner` sets `NODE_ENV=production`, copies `.next/standalone`, `.next/static`, `public` from builder, exposes 3000, runs `node server.js`
- [x] T006 [P] Create `docker/nginx/default.conf` with a single `server` block: `listen 80`, `server_name _`, `location /` block with `proxy_pass http://next-app:3000`, and headers `proxy_set_header Host $host`, `proxy_set_header X-Real-IP $remote_addr`, `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for`

**Checkpoint**: Project scaffolded, Docker infrastructure defined, environment template ready.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, Prisma client, TypeScript types, and seed data. ALL user story work is blocked until this phase is complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Add Prisma to the project: run `npm install prisma @prisma/client` then `npx prisma init --datasource-provider postgresql`; this creates `prisma/schema.prisma` with the datasource block and `src/lib/` if not present; also add `"prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }` to `package.json`, and install `ts-node` as dev dependency
- [x] T008 Replace the contents of `prisma/schema.prisma` with the complete 6-model schema from `specs/002-public-portfolio-mvp/data-model.md`: `Hero`, `About`, `Skill`, `ExperienceEntry`, `Project`, `ContactReference` — copy fields, types, `@@map` names, and `@@unique` constraints exactly as specified; keep the existing generator and datasource blocks
- [x] T009 Run `npx prisma migrate dev --name init` to generate the first migration in `prisma/migrations/` and apply it to the local database; also run `npx prisma generate` to regenerate the Prisma client types
- [x] T010 Create `src/lib/db.ts` with the global Prisma client singleton pattern: `import { PrismaClient } from '@prisma/client'`; declare `const globalForPrisma = global as unknown as { prisma: PrismaClient }`; export `export const db = globalForPrisma.prisma ?? new PrismaClient()`; add `if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db` — this prevents connection pool exhaustion during Next.js hot reload
- [x] T011 [P] Create `src/types/portfolio.ts` by copying the exact TypeScript interface definitions from `specs/002-public-portfolio-mvp/contracts/page-data.ts`: `HeroData`, `AboutData`, `SkillData`, `SkillGroup`, `ExperienceEntryData`, `ProjectData`, `ContactReferenceData`, `PortfolioPageData`, `NavLink` — do not modify any field names or types
- [x] T012 Create `prisma/seed.ts` that: (1) imports `{ db }` from `../src/lib/db` (named export — do not use default import), (2) defines a `main()` async function, (3) calls `db.[model].deleteMany()` for all 6 models in dependency-safe order, (4) calls `db.hero.create()` with one hero record (use placeholder developer name/title/tagline/ctaHref set to `mailto:dev@example.com`), (5) calls `db.about.create()` with a 3-paragraph bio, (6) calls `db.skill.createMany()` with at least 8 skills across 3 categories using displayOrder 0,1,2 within each category, (7) calls `db.experienceEntry.createMany()` with 3 entries in reverse-chronological order (displayOrder 2, 1, 0 for most-recent to oldest), (8) calls `db.project.createMany()` with 2 projects each having at least one non-null URL, (9) calls `db.contactReference.createMany()` with 2 refs (email at displayOrder 0, LinkedIn at displayOrder 1); wrap `main()` with `.catch(console.error).finally(() => db.$disconnect())`
- [x] T013 [P] Replace the content of `src/app/globals.css` with: Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`), a `:root` block defining `--font-sans` CSS variable, `html { scroll-behavior: smooth; }`, and a `@media (prefers-reduced-motion: reduce)` block setting `html { scroll-behavior: auto; }` — remove all default Next.js CSS that came from create-next-app
- [x] T014 [P] Update `src/app/layout.tsx`: import `Inter` from `next/font/google` with `{ subsets: ['latin'], variable: '--font-sans' }`, export a `metadata` const of type `Metadata` with placeholder `title: 'Portfolio'` and `description: 'Developer portfolio'` (will be updated in T021), render `<html lang="en" className={inter.variable}><body className="font-sans antialiased bg-white text-gray-900">{children}</body></html>` — no Header here; the Header will be rendered from page.tsx to access server data

**Checkpoint**: Database migrated, seed data loadable via `npx prisma db seed`, Prisma client usable in server components, TypeScript types available at `src/types/portfolio.ts`.

---

## Phase 3: User Story 1 — First-Time Recruiter Visit (Priority: P1) 🎯 MVP

**Goal**: Hero section + About section + sticky navigation header + correct page structure and SEO metadata. Together this delivers the first-impression experience that is the core purpose of the portfolio.

**Independent Test**: Load `http://localhost:3000` → confirm developer name appears in an `<h1>`, professional title and tagline visible below it, a CTA button present, an About section visible below hero, sticky header at top contains nav links, page title in browser tab is not "Portfolio".

### Implementation for User Story 1

- [x] T015 Create `src/lib/data/hero.ts` exporting `export async function getHeroData(): Promise<HeroData | null>` — imports `db` from `./db` (adjust relative path) and `HeroData` from `../types/portfolio`, calls `db.hero.findFirst()`, maps the result to a `HeroData` object picking only `{name, title, tagline, ctaLabel, ctaHref}`, returns `null` if result is `null`
- [x] T016 [P] [US1] Create `src/lib/data/about.ts` exporting `export async function getAboutData(): Promise<AboutData | null>` — same pattern as T015 but calls `db.about.findFirst()`, returns `{ bio: result.bio }` or `null`
- [x] T017 [P] [US1] Create `src/components/sections/HeroSection.tsx` — accepts `{ data: HeroData | null }` as props, immediately `return null` if `data` is null (FR-010); renders a `<section id="hero" className="...">` containing: `<h1 className="...">` with `data.name`, a `<p>` with `data.title`, a `<p>` with `data.tagline`, and `<a href={data.ctaHref} className="...">` with `data.ctaLabel` as text; use Tailwind for styling: large hero height (`min-h-screen`), large font for h1, good padding; ensure text color has contrast ratio ≥ 4.5:1 against background
- [x] T018 [P] [US1] Create `src/components/sections/AboutSection.tsx` — accepts `{ data: AboutData | null }`, returns `null` if data is null; renders `<section id="about" aria-labelledby="about-heading" className="py-16 px-6 max-w-4xl mx-auto">` with `<h2 id="about-heading" className="text-3xl font-bold mb-6">About</h2>`; split `data.bio` by `'\n\n'` and render each part as `<p className="mb-4 text-gray-700 leading-relaxed">...</p>`
- [x] T019 [US1] Create `src/components/layout/Header.tsx` as a Client Component (`'use client'` at top) — accepts `{ navLinks: NavLink[] }` from `src/types/portfolio`; uses `useState(false)` for mobile menu open state; renders: `<header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">` containing `<nav aria-label="Main navigation" className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">`; desktop: `<ul className="hidden md:flex gap-6">` with each navLink as `<li><a href={"#"+link.anchor} className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded">{link.label}</a></li>`; mobile: `<button aria-expanded={isOpen} aria-controls="mobile-menu" aria-label="Toggle navigation" className="md:hidden ...">` hamburger icon (three `<span>` bars); below nav add `<div id="mobile-menu" className={isOpen ? 'block md:hidden' : 'hidden'}>` with the same links in a vertical list; all `<a>` and `<button>` elements must have visible focus rings via `focus:ring-2`
- [x] T020 [US1] Create `src/app/page.tsx` as a React Server Component (no `'use client'`): (1) import `getHeroData` and `getAboutData`; (2) fetch both in parallel: `const [hero, about] = await Promise.all([getHeroData(), getAboutData()])`; (3) build `const navLinks: NavLink[] = []` and push `{ label: 'About', anchor: 'about' }` only if `about !== null` — do NOT add a hardcoded Contact entry here (Contact nav is added conditionally in T033 once the Contact section exists); (4) render: `<><Header navLinks={navLinks} /><main id="main-content"><HeroSection data={hero} /><AboutSection data={about} /></main></>` — the `id="main-content"` is required for the skip-to-content link added in T034
- [x] T021 [US1] Update `src/app/layout.tsx` metadata export: replace the placeholder title/description with the actual developer name and tagline copied from `prisma/seed.ts` (the Hero record's `name` and `tagline` fields) — `layout.tsx` is a static module and cannot query the database, so hardcode these strings directly; set `title: { default: '<name> | Senior Software Engineer', template: '%s | <name>' }`, `description: '<tagline>'`, `openGraph: { type: 'website', title: '...', description: '...' }`, `metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')`; keep the `<html>/<body>` render unchanged from T014

**Checkpoint**: User Story 1 fully functional. Running `npm run dev` + opening localhost:3000 shows hero name in `<h1>`, title, tagline, CTA button, About bio, and sticky header with nav links. Page title set correctly in browser tab.

---

## Phase 4: User Story 2 — Reviewing Skills and Tech Stack (Priority: P2)

**Goal**: Skills section groups tech competencies by category in a visually scannable layout.

**Independent Test**: Skills section renders below About section, shows at least 3 category groups each with 2+ skill tags, mobile layout shows 1 column with categories stacked vertically.

### Implementation for User Story 2

- [x] T022 Create `src/lib/data/skills.ts` exporting `export async function getSkillGroups(): Promise<SkillGroup[]>` — queries `db.skill.findMany({ orderBy: { displayOrder: 'asc' } })`; groups results: `const grouped = new Map<string, string[]>()`; iterate results and push each `skill.name` into `grouped.get(skill.category)` (create entry if missing); return `Array.from(grouped.entries()).map(([category, skills]) => ({ category, skills: skills.map(name => ({ name })) }))`; return `[]` if no records
- [x] T023 [P] [US2] Create `src/components/sections/SkillsSection.tsx` — accepts `{ groups: SkillGroup[] }`, returns `null` if `groups.length === 0` (FR-010); renders `<section id="skills" aria-labelledby="skills-heading" className="py-16 px-6 bg-gray-50">` with `<div className="max-w-6xl mx-auto">`; `<h2 id="skills-heading">Skills</h2>`; then `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">` with one `<div>` per group: `<h3 className="font-semibold text-gray-900 mb-3">{group.category}</h3>` and `<div className="flex flex-wrap gap-2">` containing one `<span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700">` per skill name
- [x] T024 [US2] Update `src/app/page.tsx` — add `getSkillGroups` import and `src/lib/data/skills`; add it to the `Promise.all` destructuring as `skillGroups`; push `{ label: 'Skills', anchor: 'skills' }` to `navLinks` if `skillGroups.length > 0`; render `<SkillsSection groups={skillGroups} />` in `<main>` after `<AboutSection>`

**Checkpoint**: Skills section visible below About, skills grouped by category with tag chips, navigation includes "Skills" anchor link.

---

## Phase 5: User Story 3 — Reviewing Work Experience (Priority: P2)

**Goal**: Experience section lists professional roles in reverse-chronological order with company, role, dates, and achievement descriptions.

**Independent Test**: Experience section shows 3 entries, most recent first, with "Present" for current role (null endDate), each entry has company name, role title, and description paragraph.

### Implementation for User Story 3

- [x] T025 Create `src/lib/data/experience.ts` exporting `export async function getExperienceEntries(): Promise<ExperienceEntryData[]>` — queries `db.experienceEntry.findMany({ orderBy: { displayOrder: 'desc' } })`; maps each result to `ExperienceEntryData` keeping all fields; returns `[]` if no records
- [x] T026 [P] [US3] Create `src/components/sections/ExperienceSection.tsx` — accepts `{ entries: ExperienceEntryData[] }`, returns `null` if empty; renders `<section id="experience" aria-labelledby="experience-heading" className="py-16 px-6">` with `<div className="max-w-4xl mx-auto">`; `<h2 id="experience-heading">Experience</h2>`; then a vertical list where each entry is `<article className="border-l-2 border-gray-200 pl-6 mb-10">`: `<h3>{entry.role} at {entry.company}</h3>`, date range as `<p className="text-sm text-gray-500"><time dateTime={entry.startDate.toISOString()}>{formatDate(entry.startDate)}</time> – {entry.endDate ? <time dateTime={entry.endDate.toISOString()}>{formatDate(entry.endDate)}</time> : 'Present'}</p>`, and `<p className="mt-2 text-gray-700">{entry.description}</p>`; define `function formatDate(d: Date): string` using `d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })`
- [x] T027 [US3] Update `src/app/page.tsx` — add `getExperienceEntries` import from `src/lib/data/experience`; add to `Promise.all` destructuring as `experience`; push `{ label: 'Experience', anchor: 'experience' }` to `navLinks` if `experience.length > 0`; render `<ExperienceSection entries={experience} />` after `<SkillsSection>`

**Checkpoint**: Experience section visible below Skills, entries in reverse-chronological order, "Present" shown for current role.

---

## Phase 6: User Story 4 — Exploring Featured Projects (Priority: P3)

**Goal**: Projects section shows project cards with title, summary, tech tags, and external GitHub/demo links that open in a new tab.

**Independent Test**: Projects section renders 2 cards, each has a title and summary, shows only non-null links (repo or demo), all links have `target="_blank"` and `rel="noopener noreferrer"`, technology tags visible on each card.

### Implementation for User Story 4

- [x] T028 Create `src/lib/data/projects.ts` exporting `export async function getProjects(): Promise<ProjectData[]>` — queries `db.project.findMany({ orderBy: { displayOrder: 'desc' } })`; maps each to `ProjectData`; returns `[]` if no records
- [x] T029 [P] [US4] Create `src/components/sections/ProjectsSection.tsx` — accepts `{ projects: ProjectData[] }`, returns `null` if empty; renders `<section id="projects" aria-labelledby="projects-heading" className="py-16 px-6 bg-gray-50">`; `<h2 id="projects-heading">Projects</h2>`; `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">` with one card per project: `<article className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col">` containing `<h3>{project.title}</h3>`, `<p>{project.summary}</p>`, tech tags as `<span>` chips (same style as skills), and a `<div className="flex gap-3 mt-4">` with links — render `<a href={project.repoUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.title} repository`}>Repository</a>` ONLY if `project.repoUrl !== null`; render `<a href={project.demoUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.title} live demo`}>Live Demo</a>` ONLY if `project.demoUrl !== null`
- [x] T030 [US4] Update `src/app/page.tsx` — add `getProjects` import; add to `Promise.all` as `projects`; push `{ label: 'Projects', anchor: 'projects' }` to navLinks if `projects.length > 0`; render `<ProjectsSection projects={projects} />` after `<ExperienceSection>`

**Checkpoint**: Projects section shows cards with external links, no link rendered for null URLs, links open in new tab.

---

## Phase 7: User Story 5 — Initiating Contact (Priority: P3)

**Goal**: Contact section lists contact methods (email, LinkedIn) as prominent links, accessible from the sticky nav and from the hero CTA.

**Independent Test**: Contact section renders with at least one link, email link generates `mailto:` action on click, LinkedIn link opens in new tab, nav header has a "Contact" link that jumps to this section.

### Implementation for User Story 5

- [x] T031 Create `src/lib/data/contact.ts` exporting `export async function getContactRefs(): Promise<ContactReferenceData[]>` — queries `db.contactReference.findMany({ orderBy: { displayOrder: 'asc' } })`; returns `[]` if no records
- [x] T032 [P] [US5] Create `src/components/sections/ContactSection.tsx` — accepts `{ refs: ContactReferenceData[] }`, returns `null` if empty; renders `<section id="contact" aria-labelledby="contact-heading" className="py-16 px-6">` with `<div className="max-w-4xl mx-auto text-center">`; `<h2 id="contact-heading">Get In Touch</h2>`; `<p className="text-gray-600 mb-8">Feel free to reach out...</p>`; `<div className="flex flex-wrap justify-center gap-4">` with one `<a>` per ref: if `ref.href` starts with `mailto:` render without `target="_blank"`; otherwise render with `target="_blank" rel="noopener noreferrer"`; all links must have `aria-label={ref.label}` and visible focus ring
- [x] T033 [US5] Update `src/app/page.tsx` — add `getContactRefs` import; add to `Promise.all` as `contactRefs`; push `{ label: 'Contact', anchor: 'contact' }` to navLinks if `contactRefs.length > 0` (remove the hardcoded Contact from T020 — replace with this conditional); render `<ContactSection refs={contactRefs} />` as the last section inside `<main>`

**Checkpoint**: Contact section rendered as last section, nav header "Contact" link jumps to it, email link opens mail client, external links open in new tab.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: WCAG 2.1 AA compliance audit, SEO metadata finalisation, Docker validation, and E2E test.

- [x] T034 [FR-014] Audit all interactive elements across `src/components/` for WCAG 2.1 AA compliance (FR-014): verify every `<a>` and `<button>` has `focus:ring-2 focus:ring-offset-2` or equivalent focus styles; verify every `<section>` has `aria-labelledby` pointing to its `<h2 id>`; verify the mobile hamburger button in `Header.tsx` has `aria-label`, `aria-expanded`, and `aria-controls`; check that the text/background color combinations in all components have contrast ratio ≥ 4.5:1 (use the chosen Tailwind gray palette: `text-gray-700` on `bg-white` = 5.74:1 ✅, `text-gray-500` on `bg-white` = 3.95:1 ❌ — replace with `text-gray-600` = 4.63:1 ✅ for any secondary text); add `<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 ...">Skip to content</a>` as the first focusable child inside `<header>` in `Header.tsx` — this targets `id="main-content"` set on `<main>` in T020
- [x] T035 [P] Finalise SEO metadata in `src/app/layout.tsx`: add `robots: { index: true, follow: true }` to the `metadata` export; add `canonical` url using `metadataBase`; update `openGraph.description` to match the meta description exactly; update `title.default` to use the actual seeded developer name (same value as Hero.name in seed)
- [x] T036 [P] Write Playwright E2E test in `tests/e2e/portfolio.spec.ts`: install `@playwright/test` as dev dep, configure `playwright.config.ts` pointing to `http://localhost:3000`; write tests that: (1) `page.locator('h1')` has text matching seeded hero name, (2) `page.locator('#hero a')` CTA is visible, (3) `page.locator('header')` is visible after `page.evaluate(() => window.scrollTo(0, 500))`, (4) `page.locator('#skills')` is visible when skills seeded, (5) `page.locator('#projects a[target="_blank"]')` count matches seeded project link count, (6) `await page.title()` is not empty and not "Portfolio", (7) meta description: use `await page.evaluate(() => document.querySelector('meta[name="description"]')?.getAttribute('content'))` and assert it is not null/empty (do NOT use `page.locator` for `<head>` meta tags — they are not in the body DOM tree), (8) JS-disabled content: use `await page.context().setJavaScriptEnabled(false)`, navigate to `'/'`, and assert `page.locator('h1')` still has text (verifies FR-009 / SC-004), (9) link validity smoke check: get the first `href` from `page.locator('#contact a').first()`, use `page.request.get(href)` and assert status < 400; add `"test:e2e": "playwright test"` to `package.json` scripts
- [x] T037 Validate full Docker Compose stack against `specs/002-public-portfolio-mvp/quickstart.md` "Full Stack with Docker Compose" section: run `docker compose up --build`, then `docker compose exec next-app npx prisma migrate deploy`, then `docker compose exec next-app npx prisma db seed`, then verify `curl http://localhost:80` returns HTML containing the seeded developer name in an `<h1>` tag
- [x] T038 [P] Measure Core Web Vitals against Constitution Principle VIII targets (SC-008): install `lighthouse` as a dev dependency; run `npx lighthouse http://localhost:3000 --output json --output-path ./lighthouse-report.json --chrome-flags="--headless"`; parse `lighthouse-report.json` and assert: `lhr.audits['largest-contentful-paint'].numericValue < 2500` (LCP < 2.5s), `lhr.audits['cumulative-layout-shift'].numericValue < 0.1` (CLS < 0.1), `lhr.audits['experimental-interaction-to-next-paint'].numericValue < 200` (INP < 200ms); log a FAIL with the actual values if any assertion fails — do not block on INP if the audit is not available in the installed Lighthouse version, but LCP and CLS are mandatory
- [x] T039 [P] [US6] Add Playwright mobile viewport test in `tests/e2e/mobile.spec.ts`: set viewport to `{ width: 375, height: 812 }` (iPhone SE); navigate to `'/'`; assert (1) `document.documentElement.scrollWidth <= window.innerWidth` (no horizontal overflow — verifies SC-003 at 375px), (2) all six section ids (`#hero`, `#about`, `#skills`, `#experience`, `#projects`, `#contact`) are visible when seeded, (3) `page.locator('header')` is visible (sticky nav present on mobile), (4) all `<a>` and `<button>` elements have bounding box height ≥ 44px and width ≥ 44px (touch target size — WCAG 2.5.5); add `"test:mobile": "playwright test tests/e2e/mobile.spec.ts"` to `package.json` scripts

**Checkpoint**: WCAG audit complete, SEO tags verified, performance targets validated, mobile viewport tested, E2E tests pass, Docker Compose full stack operational.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 complete — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 complete — delivers the MVP
- **US2, US3 (Phase 4–5)**: Depend on Phase 2 complete — can run in parallel with each other after Phase 2
- **US4, US5 (Phase 6–7)**: Depend on Phase 2 complete — can run in parallel with each other
- **Polish (Phase 8)**: Depends on all user stories (Phases 3–7) complete

### User Story Dependencies

- **US1 (P1)**: Independent after Foundation — no other story dependency
- **US2 (P2)**: Independent after Foundation — but T024 requires page.tsx from US1 (T020) to be the existing file to update
- **US3 (P2)**: Independent after Foundation — T027 similarly builds on page.tsx
- **US4 (P3)**: Independent after Foundation — T030 builds on page.tsx
- **US5 (P3)**: Independent after Foundation — T033 adds the conditional Contact nav entry to page.tsx (no hardcoded entry to remove; T020 was corrected to not add one)

### Within Each User Story

- Data function (T015-style) before section component (T017-style) — component imports from data file
- Section component before page.tsx update — page imports from component
- Each story's page.tsx update (T024, T027, T030, T033) is the integration step

### Parallel Opportunities

- Within Phase 1: T002, T003, T004, T005, T006 all parallel after T001
- Within Phase 2: T011, T013, T014 parallel with T007–T012 sequence; T010 and T011 parallel after T009
- Within Phase 3: T015, T016 parallel; T017, T018 parallel after T015/T016; T019 parallel with T017/T018
- Within Phase 4: T022 and T023 parallel
- Within Phase 5: T025 and T026 parallel
- Within Phase 6: T028 and T029 parallel
- Within Phase 7: T031 and T032 parallel
- Within Phase 8: T035, T036, T038, T039 all parallel after T034; T037 runs last (needs full stack)

---

## Parallel Example: Foundation Phase

```bash
# After T007 (prisma init) completes:
# These three can run simultaneously:
Task T010: "Create src/lib/db.ts"
Task T011: "Create src/types/portfolio.ts"
Task T013: "Update src/app/globals.css"
Task T014: "Update src/app/layout.tsx minimal shell"
# While T008 → T009 → T012 proceeds in sequence
```

## Parallel Example: User Story 2 (Skills)

```bash
# After Phase 2 complete, US2 tasks T022 and T023 run simultaneously:
Task T022: "Create src/lib/data/skills.ts"       # data layer
Task T023: "Create src/components/sections/SkillsSection.tsx"  # UI layer
# Then T024 integrates them into page.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T006)
2. Complete Phase 2: Foundation (T007–T014) — **run `npx prisma db seed` to verify**
3. Complete Phase 3: User Story 1 (T015–T021)
4. **STOP and VALIDATE**: run `npm run dev`, open localhost:3000, verify hero name in `<h1>`, bio paragraph, sticky nav, page title in browser tab
5. If valid: proceed to US2+

### Incremental Delivery Order

1. Setup + Foundation → **Verify**: `npx prisma studio` shows seeded data
2. US1 (Hero + About + Nav + SEO) → **Verify**: page loads with identity + bio
3. US2 (Skills) → **Verify**: skills section with category groups
4. US3 (Experience) → **Verify**: experience entries in reverse order with "Present"
5. US4 (Projects) → **Verify**: project cards with conditional links
6. US5 (Contact) → **Verify**: contact links functional, nav complete
7. Polish → **Verify**: WCAG audit, Docker Compose, E2E tests

### Single Developer — Sequential Execution

Execute phases in order: Phase 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8.
Within each phase, pick up [P]-marked tasks in parallel if using multiple agent windows, or execute them sequentially — they are fully independent.

---

## Notes

- **Each section component has one rule**: return `null` when its data prop is null/empty — this is FR-010
- **page.tsx is the integration point**: updated incrementally each phase (T020 → T024 → T027 → T030 → T033)
- **No API routes in Phase 1**: all data flows server component → Prisma → PostgreSQL → HTML
- **No `'use client'`** except in `Header.tsx` (needs `useState` for mobile menu)
- **[P] tasks** in the same phase touch different files — safe to execute simultaneously
- Commit after each complete phase checkpoint
- All `target="_blank"` links must include `rel="noopener noreferrer"` (security requirement)
- `aria-labelledby` pattern: every `<section id="X">` pairs with `<h2 id="X-heading">` and `aria-labelledby="X-heading"`
