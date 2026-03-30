# Tasks: Advanced Portfolio — Senior-Level Depth

**Input**: spec.md (005-advanced-portfolio), prisma/schema.prisma, src/ project structure
**Prerequisites**: Phase 2 (content data model) and Phase 3 (admin portal) complete and deployed
**Tests**: Not requested — no test tasks included
**Note**: plan.md was not generated before tasks; tech stack and file paths are derived from the live codebase

## Tech Stack Reference (for implementers)

- **Framework**: Next.js 14+ App Router, TypeScript 5.x
- **ORM**: Prisma 6.x — schema at `prisma/schema.prisma`
- **Database**: PostgreSQL 16
- **Storage**: MinIO (S3-compatible) — existing client in `src/lib/` (follow patterns from `src/app/api/admin/media-assets/upload/route.ts`)
- **Validation**: Zod — schemas in `src/lib/content/validation.ts`
- **Admin auth**: `iron-session` — session guard via `src/lib/admin/server.ts`
- **UI components**: shadcn/ui — existing components in `src/components/ui/`
- **Admin forms**: `react-hook-form` + `@hookform/resolvers/zod`
- **Styling**: Tailwind CSS 3

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete prior tasks)
- **[Story]**: Which user story this task belongs to
- No test tasks included

---

## Phase 1: Setup (Review & Orientation)

**Purpose**: Confirm existing models that Phase 4 builds on before making schema changes

- [x] T001 Read `prisma/schema.prisma` in full and confirm these models exist as listed: `CaseStudy` (has `projectId`, `challenge`, `solution`, `outcomes`, `mediaAssetIds`), `Testimonial` (has `authorName`, `authorRole`, `authorCompany`, `quote`, `displayOrder`, `published`, `isVisible`), `Project` (has `caseStudy` relation). Note: the existing `CaseStudy` model is missing `slug`, `title`, `published`, `isVisible`, `displayOrder`, `architectureNotes`, and a metrics relation — all of these will be added in Phase 2.
- [x] T002 [P] Read `src/lib/content/validation.ts`, `src/lib/content/types.ts`, and `src/lib/content/queries.ts` in full to understand existing patterns for Zod schemas, TypeScript types, and Prisma query functions before adding Phase 4 content.
- [x] T003 [P] Read `src/lib/admin/page-config.ts` and `src/app/api/admin/[entity]/route.ts` in full to understand how the generic admin CRUD is configured and whether new entities can be registered there or require custom routes.

---

## Phase 2: Foundational (Database Schema — All Migrations)

**Purpose**: Apply ALL Prisma schema changes and run ONE migration for Phase 4. Complete this phase before any implementation tasks.

**⚠️ CRITICAL**: Every user story depends on this phase. Do not start Phase 3+ until T013 is complete.

- [x] T004 In `prisma/schema.prisma`, update the existing `CaseStudy` model to match the following definition exactly. The existing `projectId String @unique` becomes `projectId String? @unique` (optional — standalone case studies are now supported). Add these fields after `id`: `slug String @unique @db.VarChar(150)`, `title String @db.VarChar(200)`. Add these fields before `createdAt`: `architectureNotes String? @db.Text`, `displayOrder Int @default(0)`, `published Boolean @default(false)`, `isVisible Boolean @default(true)`. Update the `project` relation to use `Project?` (nullable) and change `onDelete: Restrict` to `onDelete: SetNull`. Add a new relation field: `metrics CaseStudyMetric[]`. Add index: `@@index([published, isVisible, displayOrder])`. Keep all existing fields (`challenge`, `solution`, `outcomes`, `mediaAssetIds`) unchanged.

- [x] T005 In `prisma/schema.prisma`, add a new model immediately after the updated `CaseStudy` model:

  ```prisma
  model CaseStudyMetric {
    id           String    @id @default(cuid())
    caseStudyId  String
    label        String    @db.VarChar(100)
    value        String    @db.VarChar(100)
    unit         String?   @db.VarChar(50)
    displayOrder Int       @default(0)
    createdAt    DateTime  @default(now())
    updatedAt    DateTime  @updatedAt
    caseStudy    CaseStudy @relation(fields: [caseStudyId], references: [id], onDelete: Cascade)
    @@index([caseStudyId, displayOrder])
    @@map("case_study_metrics")
  }
  ```

- [x] T006 In `prisma/schema.prisma`, update the existing `Testimonial` model: add `avatarUrl String? @db.VarChar(500)` between `authorCompany` and `quote`. Also make `authorCompany` optional by changing it to `authorCompany String? @db.VarChar(150)` (the spec says organisation is optional). No other changes.

- [x] T007 In `prisma/schema.prisma`, add a new `CvAsset` model at the end of the file (before `LoginAttempt`):

  ```prisma
  model CvAsset {
    id         String   @id @default(cuid())
    fileName   String   @db.VarChar(255)
    storageKey String   @db.VarChar(500)
    fileSize   Int      @default(0)
    published  Boolean  @default(false)
    createdAt  DateTime @default(now())
    updatedAt  DateTime @updatedAt
    @@map("cv_assets")
  }
  ```

  Note: `storageKey` is the MinIO object key (not a full URL) — the download URL is generated at request time.

- [x] T008 In `prisma/schema.prisma`, add a new `Article` model:

  ```prisma
  model Article {
    id           String    @id @default(cuid())
    title        String    @db.VarChar(200)
    summary      String    @db.Text
    externalUrl  String    @db.VarChar(500)
    publishedAt  DateTime?
    displayOrder Int       @default(0)
    published    Boolean   @default(false)
    isVisible    Boolean   @default(true)
    createdAt    DateTime  @default(now())
    updatedAt    DateTime  @updatedAt
    @@index([published, isVisible, displayOrder])
    @@map("articles")
  }
  ```

- [x] T009 In `prisma/schema.prisma`, add a new `OpenSourceContribution` model:

  ```prisma
  model OpenSourceContribution {
    id               String   @id @default(cuid())
    projectName      String   @db.VarChar(150)
    description      String   @db.Text
    contributionType String   @db.VarChar(100)
    repositoryUrl    String?  @db.VarChar(500)
    displayOrder     Int      @default(0)
    published        Boolean  @default(false)
    isVisible        Boolean  @default(true)
    createdAt        DateTime @default(now())
    updatedAt        DateTime @updatedAt
    @@index([published, isVisible, displayOrder])
    @@map("open_source_contributions")
  }
  ```

- [x] T010 In `prisma/schema.prisma`, add a new `Talk` model:

  ```prisma
  model Talk {
    id           String   @id @default(cuid())
    title        String   @db.VarChar(200)
    eventName    String   @db.VarChar(200)
    talkDate     DateTime
    summary      String   @db.Text
    recordingUrl String?  @db.VarChar(500)
    slidesUrl    String?  @db.VarChar(500)
    displayOrder Int      @default(0)
    published    Boolean  @default(false)
    isVisible    Boolean  @default(true)
    createdAt    DateTime @default(now())
    updatedAt    DateTime @updatedAt
    @@index([published, isVisible, displayOrder])
    @@map("talks")
  }
  ```

- [x] T011 In `prisma/schema.prisma`, add a new `SectionVisibility` model (controls the per-section on/off toggle for articles, open_source, talks):

  ```prisma
  model SectionVisibility {
    id        String   @id @default(cuid())
    section   String   @unique @db.VarChar(50)
    enabled   Boolean  @default(true)
    updatedAt DateTime @updatedAt
    @@map("section_visibility")
  }
  ```

  Valid values for `section` are: `"articles"`, `"open_source"`, `"talks"`.

- [x] T012 Run `npx prisma migrate dev --name phase4_advanced_portfolio` from the repo root. This creates and applies the migration for all schema changes from T004–T011. If the migration fails due to data conflicts on the existing `case_studies` table (e.g., existing rows missing the new non-nullable `slug` and `title` fields), add temporary defaults in the migration SQL before applying: `ALTER TABLE case_studies ADD COLUMN slug VARCHAR(150) DEFAULT 'placeholder'; ALTER TABLE case_studies ADD COLUMN title VARCHAR(200) DEFAULT 'Untitled';` then update those rows manually via `prisma studio` or a seed script.

- [x] T013 Run `npx prisma generate` from the repo root to regenerate the Prisma client with all Phase 4 types. Verify the command completes without errors. After this task completes, all Phase 3+ tasks can begin.

**Checkpoint**: Database schema updated, Prisma client regenerated — all user story phases can now begin.

---

## Phase 3: User Story 1 — Case Studies (Priority: P1) 🎯 MVP

**Goal**: Public visitors can navigate to `/case-studies` to see a listing of published case studies, click any entry to reach its dedicated page at `/case-studies/[slug]`, and read the full narrative (problem, solution, outcome, optional architecture notes, and highlighted metrics). Draft case study URLs return 404.

**Independent Test**: Run the app, seed one published CaseStudy with two CaseStudyMetric entries. Navigate to `/case-studies` — it should list the entry. Navigate to `/case-studies/[slug]` — it should show the full narrative and both metrics as callout cards. Navigate to `/case-studies/draft-slug` (a slug with `published: false`) — it should return a 404 page.

### Admin — Validation & Types

- [x] T014 [US1] In `src/lib/content/validation.ts`, add a Zod schema `caseStudyMetricSchema` with fields: `label: z.string().min(1).max(100)`, `value: z.string().min(1).max(100)`, `unit: z.string().max(50).optional()`, `displayOrder: z.number().int().min(0).default(0)`. Then add `createCaseStudySchema` with fields: `slug: z.string().min(1).max(150).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only')`, `title: z.string().min(1).max(200)`, `projectId: z.string().optional()`, `challenge: z.string().min(10)`, `solution: z.string().min(10)`, `outcomes: z.string().min(10)`, `architectureNotes: z.string().optional()`, `displayOrder: z.number().int().min(0).default(0)`, `published: z.boolean().default(false)`, `isVisible: z.boolean().default(true)`. Add `updateCaseStudySchema` as `createCaseStudySchema.partial()`.

- [x] T015 [P] [US1] In `src/lib/content/types.ts`, add TypeScript types exported as: `CaseStudyMetric` (id, caseStudyId, label, value, unit?, displayOrder, createdAt, updatedAt), `CaseStudy` (id, slug, title, projectId?, challenge, solution, outcomes, architectureNotes?, displayOrder, published, isVisible, createdAt, updatedAt, metrics: CaseStudyMetric[], project?: { id: string; title: string }). Follow the pattern of existing types in the file.

### Public — Query Functions

- [x] T016 [US1] In `src/lib/content/queries.ts`, add two exported async functions:
  1. `getPublishedCaseStudies()`: queries `prisma.caseStudy.findMany` with `where: { published: true, isVisible: true }`, `orderBy: { displayOrder: 'asc' }`, `include: { metrics: { orderBy: { displayOrder: 'asc' } }, project: { select: { id: true, title: true } } }`. Returns `CaseStudy[]`.
  2. `getCaseStudyBySlug(slug: string)`: queries `prisma.caseStudy.findFirst` with `where: { slug, published: true, isVisible: true }`, same includes. Returns `CaseStudy | null`.

### Admin — API Routes

- [x] T017 [US1] Create `src/app/api/admin/case-studies/route.ts`. This route handles GET (list all case studies for admin — no published filter, include metrics count) and POST (create a new case study). Use `requireAdminSession()` from `src/lib/admin/server.ts` on both methods. Validate POST body with `createCaseStudySchema` from `src/lib/content/validation.ts`. On POST, auto-generate slug from title if not provided (lowercase, replace spaces with hyphens, strip non-alphanumeric except hyphens). Return JSON. On slug conflict, return `400 { error: 'Slug already in use' }`.

- [x] T018 [US1] Create `src/app/api/admin/case-studies/[id]/route.ts`. Handles GET (single case study with metrics), PUT (update — validate with `updateCaseStudySchema`), DELETE (delete case study and cascade-delete metrics). Use `requireAdminSession()` on all methods. Return `404 { error: 'Not found' }` if id does not exist. All routes return JSON.

- [x] T019 [US1] Create `src/app/api/admin/case-studies/[id]/metrics/route.ts`. Handles GET (list metrics for this case study ordered by displayOrder) and POST (create a new metric — validate with `caseStudyMetricSchema`). Use `requireAdminSession()`. Verify the parent case study exists before operating; return `404` if not.

- [x] T020 [US1] Create `src/app/api/admin/case-studies/[id]/metrics/[metricId]/route.ts`. Handles PUT (update a metric — validate with `caseStudyMetricSchema.partial()`) and DELETE (remove the metric). Use `requireAdminSession()`. Return `404` if metric does not belong to the specified case study.

### Admin — UI Pages

- [x] T021 [US1] Create `src/app/admin/case-studies/page.tsx`. This is a server component. Fetch all case studies from the admin GET API (or query Prisma directly server-side). Render a table with columns: Title, Slug, Published, Display Order, Actions (Edit link, Delete button). Add a "New Case Study" button linking to `/admin/case-studies/new`. Include the `AdminShell` wrapper. Show draft case studies with a "Draft" badge. Follow the same visual pattern as `src/app/admin/[entity]/page.tsx`.

- [x] T022 [US1] Create `src/app/admin/case-studies/new/page.tsx`. Renders a form (client component) with fields: Title (text), Slug (text, auto-populated from title, editable), Project Link (optional select — list existing published projects by title/id), Challenge (textarea, required), Solution (textarea, required), Outcomes (textarea, required), Architecture Notes (textarea, optional), Display Order (number), Published (checkbox), Is Visible (checkbox). On submit, POST to `/api/admin/case-studies`. On success, redirect to `/admin/case-studies`. Show validation errors inline. Use `react-hook-form` + `zodResolver(createCaseStudySchema)`.

- [x] T023 [US1] Create `src/app/admin/case-studies/[id]/page.tsx`. Same form as T022 but pre-populated with existing data fetched server-side. Below the main form, render the `CaseStudyMetricsEditor` component (T024). On submit, PUT to `/api/admin/case-studies/[id]`. On success, show a success toast and stay on the page.

- [x] T024 [US1] Create `src/components/admin/CaseStudyMetricsEditor.tsx`. This is a client component that receives `caseStudyId: string` as a prop. It fetches metrics from `/api/admin/case-studies/[caseStudyId]/metrics`. Renders a list of existing metrics (label, value, unit, displayOrder) with Edit and Delete buttons per row. Renders an "Add Metric" form with fields: Label (text, required), Value (text, required, e.g. "-60%"), Unit (text, optional, e.g. "%"), Display Order (number). On submit, POST to metrics endpoint. On delete, DELETE the metric and refresh the list. Use React state for optimistic updates.

### Public — Pages & Components

- [x] T025 [US1] Create `src/components/sections/MetricCallout.tsx`. A small presentational component that receives `label: string`, `value: string`, `unit?: string` as props. Renders as a visually distinct card/callout (e.g., large bold value, smaller label below, unit appended to value if present). Style with Tailwind CSS. Example render: value "-60%" + label "Deployment time" → renders as a highlighted stat card.

- [x] T026 [US1] Create `src/components/sections/CaseStudyCard.tsx`. A presentational card component that receives a `CaseStudy` object (without full narrative — just title, slug, outcomes summary, and first 3 metrics). Renders a card with: title as a link to `/case-studies/[slug]`, a short excerpt from `outcomes` (truncated at ~150 chars), and up to 3 `MetricCallout` components if metrics exist. Style with Tailwind CSS.

- [x] T027 [US1] Create `src/app/case-studies/page.tsx`. A Next.js server component (no `'use client'`). Calls `getPublishedCaseStudies()`. If result is empty, renders a fallback message (e.g., "No case studies available yet.") — this should NOT appear in production but prevents blank pages during development. If results exist, renders a page heading "Case Studies" and a grid/list of `CaseStudyCard` components. Add `export const dynamic = 'force-dynamic'` to disable caching since this content is managed by admin.

- [x] T028 [US1] Create `src/app/case-studies/[slug]/page.tsx`. A Next.js server component. Calls `getCaseStudyBySlug(params.slug)`. If the result is `null` (draft, not found, or not visible), call `notFound()` from `next/navigation` — this triggers the 404 page. If found, render the full case study: title as `<h1>`, `challenge` section with heading "The Challenge", `solution` section with heading "The Solution", `outcomes` section with heading "The Outcome", `architectureNotes` section (only if present) with heading "Architecture & Decisions", and a metrics row (only if `metrics.length > 0`) rendering all `MetricCallout` components. If `project` is linked, show a small "See project →" link. Add `export const dynamic = 'force-dynamic'`.

- [x] T029 [US1] Create `src/app/case-studies/[slug]/not-found.tsx`. Renders a simple 404-style message: "Case study not found" with a back link to `/case-studies`. This file is automatically used by Next.js when `notFound()` is called in T028.

**Checkpoint**: User Story 1 complete. A visitor can navigate to `/case-studies`, browse published case studies, and read each one at its unique URL. Draft URLs return 404. Admin can create/edit/delete case studies and manage metrics.

---

## Phase 4: User Story 2 — CV Download (Priority: P2)

**Goal**: A published CV PDF can be downloaded by visitors in one click. The download control is hidden if no CV is published. When the admin uploads a replacement CV, the old file is permanently deleted from MinIO and the old DB record is replaced.

**Independent Test**: Upload a PDF via the admin CV page. Verify the download button appears on the public portfolio. Click it — a PDF download should start. Go to admin, upload a replacement — the old PDF should be gone from MinIO. Verify the download button delivers the new file.

### Validation, Types & Queries

- [x] T030 [US2] In `src/lib/content/validation.ts`, add `cvAssetSchema` with: `fileName: z.string().min(1).max(255)`, `fileSize: z.number().int().min(1)`, `published: z.boolean().default(false)`.

- [x] T031 [P] [US2] In `src/lib/content/types.ts`, add type `CvAsset`: `{ id: string; fileName: string; storageKey: string; fileSize: number; published: boolean; createdAt: Date; updatedAt: Date }`.

- [x] T032 [US2] In `src/lib/content/queries.ts`, add `getPublishedCvAsset()`: queries `prisma.cvAsset.findFirst` with `where: { published: true }`, `orderBy: { createdAt: 'desc' }`. Returns `CvAsset | null`.

### Admin — CV Upload API Route

- [x] T033 [US2] Create `src/app/api/admin/cv/route.ts`. This route handles:
- **GET**: Return the current CV asset (if any) from DB — `prisma.cvAsset.findFirst({ where: { published: true } })`. Return `{ cv: CvAsset | null }`.
- **POST**: Upload a new CV. Accept `multipart/form-data` with a `file` field. Validate: must be `application/pdf`, max 10MB. Steps: (1) Check if an existing `CvAsset` record exists in DB. (2) If yes, delete the old file from MinIO using its `storageKey`, then delete the DB record. (3) Upload the new PDF to MinIO under key `cv/[cuid()].pdf`. (4) Create a new `CvAsset` record with `published: true`. Return the new record.
- **DELETE**: Delete the current CV — remove from MinIO using `storageKey`, delete DB record. Return `204`.
- Use `requireAdminSession()` on all methods. Use the existing MinIO client pattern from `src/app/api/admin/media-assets/upload/route.ts`.

### Admin — CV Page

- [x] T034 [US2] Create `src/app/admin/cv/page.tsx`. A client component wrapped in `AdminShell`. On mount, fetch current CV from `GET /api/admin/cv`. If a CV exists, show: file name, file size (formatted as KB/MB), an "Active" badge, a "Download" link (calls a signed URL or streams via an API route), and a "Delete" button. Show a file input with "Upload New CV (PDF, max 10MB)" label — on change, POST to `/api/admin/cv` with the file. On success, refresh the display. If no CV exists, show "No CV uploaded" with the upload control. Show loading and error states.

### Public — CV Download Button

- [x] T035 [US2] Create `src/components/ui/CvDownloadButton.tsx`. A server component that calls `getPublishedCvAsset()`. If `null`, renders nothing (returns `null`). If a CV exists, renders an `<a>` tag pointing to `/api/cv/download` with `download` attribute and label "Download CV". Style as a primary button using existing shadcn/ui `Button` component. This component is safe to include anywhere — it self-hides when no CV is published.

- [x] T036 [US2] Create `src/app/api/cv/download/route.ts` (public, no auth required). This is the public CV download endpoint. Fetches the published CvAsset from DB. If none, returns `404`. If found, generates a presigned MinIO download URL (or streams the file directly) and redirects/pipes the response to the browser with `Content-Disposition: attachment; filename="[fileName]"` and `Content-Type: application/pdf`. Use the existing MinIO client. Do not expose `storageKey` to the client.

- [x] T037 [US2] In `src/app/page.tsx` (public portfolio home page), import `CvDownloadButton` and render it in the hero or about section — wherever a prominent CTA placement makes sense visually. Since `CvDownloadButton` is a server component that self-hides when no CV exists, no conditional rendering is needed at the call site.

**Checkpoint**: User Story 2 complete. Admin can upload/replace/delete a CV PDF. Visitors see a download button only when a CV is published. Download delivers the correct file.

---

## Phase 5: User Story 3 — Testimonials (Priority: P3)

**Goal**: Published testimonials appear as a section on the public portfolio. They are ordered by admin-defined display order. The section is hidden when no testimonials are published. The existing `Testimonial` model (Phase 2) is used — Phase 4 adds avatarUrl and creates the public display layer.

**Independent Test**: In the DB, create two published Testimonial records with different `displayOrder` values. Load the public portfolio — the testimonials section should appear with both entries in the correct order. Set both to `published: false` — reload, and the section should disappear entirely.

### Validation, Types & Queries

- [x] T038 [US3] In `src/lib/content/validation.ts`, find the existing `testimonial` validation schema. Update it to: add `avatarUrl: z.string().url().max(500).optional()`, make `authorCompany` optional: `authorCompany: z.string().max(150).optional()`. If no Zod schema for Testimonial exists yet, create `createTestimonialSchema` with all fields as described.

- [x] T039 [P] [US3] In `src/lib/content/types.ts`, find or add the `Testimonial` type. Ensure it includes: `id`, `authorName`, `authorRole`, `authorCompany` (optional string), `avatarUrl` (optional string), `quote`, `displayOrder`, `published`, `isVisible`, `createdAt`, `updatedAt`.

- [x] T040 [US3] In `src/lib/content/queries.ts`, add `getPublishedTestimonials()`: queries `prisma.testimonial.findMany` with `where: { published: true, isVisible: true }`, `orderBy: { displayOrder: 'asc' }`. Returns the list. If the function already exists, verify it includes the `isVisible` filter and correct ordering.

### Public — Components & Integration

- [x] T041 [US3] Create `src/components/sections/TestimonialCard.tsx`. A presentational component receiving a `Testimonial` prop. Renders: a large blockquote with the `quote` text, below it `authorName` (bold), `authorRole`, and `authorCompany` (if present, separated by " · "). If `avatarUrl` is present, render a small circular `<img>` beside the author line. Gracefully omit the avatar `<img>` if `avatarUrl` is null/undefined — no broken image. Style with Tailwind CSS.

- [x] T042 [US3] Create `src/components/sections/TestimonialsSection.tsx`. A server component. Calls `getPublishedTestimonials()`. If the result is an empty array, return `null` (renders nothing — no heading, no empty container). If results exist, render a `<section>` with heading "What People Say" and a grid of `TestimonialCard` components. Add `export const dynamic = 'force-dynamic'`.

- [x] T043 [US3] In `src/app/page.tsx`, import `TestimonialsSection` and add it to the page layout between the projects/case studies area and the contact section. No conditional logic needed — `TestimonialsSection` self-hides when empty.

**Checkpoint**: User Story 3 complete. The testimonials section appears on the portfolio when published testimonials exist and disappears when all are unpublished or hidden.

---

## Phase 6: User Story 4 — Optional Sections (Priority: P4)

**Goal**: Three optional sections — Articles, Open Source Contributions, and Talks — are admin-managed and conditionally displayed. Each section has an independent visibility toggle. A section only renders publicly when BOTH its toggle is enabled AND it has at least one published entry. Admin can manage all three content types and their section toggles.

**Independent Test**: Create one published Article entry. Set the `section_visibility` row for `"articles"` to `enabled: true` — the articles section appears. Set it to `enabled: false` — the section disappears, even though the entry is still published. Repeat independently for open_source and talks.

### Validation, Types & Queries

- [x] T044 [US4] In `src/lib/content/validation.ts`, add Zod schemas:
- `createArticleSchema`: `title: z.string().min(1).max(200)`, `summary: z.string().min(10)`, `externalUrl: z.string().url().max(500)`, `publishedAt: z.string().datetime().optional()`, `displayOrder: z.number().int().min(0).default(0)`, `published: z.boolean().default(false)`, `isVisible: z.boolean().default(true)`. Add `updateArticleSchema` as `.partial()`.
- `createOpenSourceSchema`: `projectName: z.string().min(1).max(150)`, `description: z.string().min(10)`, `contributionType: z.string().min(1).max(100)`, `repositoryUrl: z.string().url().max(500).optional()`, `displayOrder: z.number().int().min(0).default(0)`, `published: z.boolean().default(false)`, `isVisible: z.boolean().default(true)`. Add `updateOpenSourceSchema` as `.partial()`.
- `createTalkSchema`: `title: z.string().min(1).max(200)`, `eventName: z.string().min(1).max(200)`, `talkDate: z.string().datetime()`, `summary: z.string().min(10)`, `recordingUrl: z.string().url().max(500).optional()`, `slidesUrl: z.string().url().max(500).optional()`, `displayOrder: z.number().int().min(0).default(0)`, `published: z.boolean().default(false)`, `isVisible: z.boolean().default(true)`. Add `updateTalkSchema` as `.partial()`.

- [x] T045 [P] [US4] In `src/lib/content/types.ts`, add TypeScript types: `Article`, `OpenSourceContribution`, `Talk` — each with all their Prisma model fields. Also add `SectionVisibility: { id: string; section: string; enabled: boolean; updatedAt: Date }`.

- [x] T046 [US4] In `src/lib/content/queries.ts`, add these exported async functions:
- `getPublishedArticles()`: `prisma.article.findMany({ where: { published: true, isVisible: true }, orderBy: { displayOrder: 'asc' } })`
- `getPublishedOpenSourceContributions()`: same pattern on `openSourceContribution`
- `getPublishedTalks()`: same pattern on `talk`, orderBy `displayOrder asc`
- `getSectionVisibility(section: string)`: `prisma.sectionVisibility.findUnique({ where: { section } })` — returns the record or `null`. Treat `null` as enabled (default).

### Admin — API Routes

- [x] T047 [US4] Create `src/app/api/admin/articles/route.ts` (GET list, POST create) and `src/app/api/admin/articles/[id]/route.ts` (GET one, PUT update, DELETE). Follow the same pattern as T017/T018 for case studies. Use `requireAdminSession()`. Validate with `createArticleSchema` / `updateArticleSchema`.

- [x] T048 [P] [US4] Create `src/app/api/admin/open-source/route.ts` (GET list, POST create) and `src/app/api/admin/open-source/[id]/route.ts` (GET one, PUT update, DELETE). Same pattern. Validate with `createOpenSourceSchema` / `updateOpenSourceSchema`.

- [x] T049 [P] [US4] Create `src/app/api/admin/talks/route.ts` (GET list, POST create) and `src/app/api/admin/talks/[id]/route.ts` (GET one, PUT update, DELETE). Same pattern. Validate with `createTalkSchema` / `updateTalkSchema`.

- [x] T050 [US4] Create `src/app/api/admin/section-visibility/[section]/route.ts`. Handles:
- **GET**: Returns current visibility for the named section. Query `prisma.sectionVisibility.findUnique({ where: { section: params.section } })`. If no record exists, return `{ section: params.section, enabled: true }` (default enabled).
- **PUT**: Upsert visibility. Validate `params.section` is one of `['articles', 'open_source', 'talks']` — return `400` if invalid. Body: `{ enabled: boolean }`. Use `prisma.sectionVisibility.upsert({ where: { section }, update: { enabled }, create: { section, enabled } })`. Return updated record.
- Use `requireAdminSession()` on both methods.

### Admin — UI Pages

- [x] T051 [US4] Create `src/app/admin/articles/page.tsx`. Renders a list of all articles (title, external URL, published status, display order) with Edit and Delete controls and a "New Article" button. Above the list, render a small "Section Visibility" toggle (checkbox or switch) that calls PUT `/api/admin/section-visibility/articles` on change. Show current enabled state fetched on load. Wrap in `AdminShell`.

- [x] T052 [US4] Create `src/app/admin/articles/new/page.tsx` and `src/app/admin/articles/[id]/page.tsx`. Form fields: Title, Summary (textarea), External URL, Published At (date, optional), Display Order, Published, Is Visible. Validate with `createArticleSchema` / `updateArticleSchema`. POST/PUT to articles API. Redirect to `/admin/articles` on success.

- [x] T053 [P] [US4] Create `src/app/admin/open-source/page.tsx`, `src/app/admin/open-source/new/page.tsx`, and `src/app/admin/open-source/[id]/page.tsx`. Same pattern as T051/T052. Fields: Project Name, Description, Contribution Type, Repository URL (optional), Display Order, Published, Is Visible. Section visibility toggle calls `/api/admin/section-visibility/open_source`.

- [x] T054 [P] [US4] Create `src/app/admin/talks/page.tsx`, `src/app/admin/talks/new/page.tsx`, and `src/app/admin/talks/[id]/page.tsx`. Same pattern. Fields: Title, Event Name, Talk Date, Summary, Recording URL (optional), Slides URL (optional), Display Order, Published, Is Visible. Section visibility toggle calls `/api/admin/section-visibility/talks`.

### Public — Section Components & Integration

- [x] T055 [US4] Create `src/components/sections/ArticlesSection.tsx`. A server component. Calls `getPublishedArticles()` and `getSectionVisibility('articles')`. If `visibility.enabled === false` OR articles array is empty, return `null`. Otherwise render a `<section>` with heading "Writing" and a list of articles, each showing title (as external link), summary, and formatted `publishedAt` date (if present). Add `export const dynamic = 'force-dynamic'`.

- [x] T056 [P] [US4] Create `src/components/sections/OpenSourceSection.tsx`. Same pattern. Calls `getPublishedOpenSourceContributions()` and `getSectionVisibility('open_source')`. Render with heading "Open Source". Each entry shows project name, description, contribution type badge, and repository link (if present). Returns `null` if toggle off or no entries.

- [x] T057 [P] [US4] Create `src/components/sections/TalksSection.tsx`. Same pattern. Calls `getPublishedTalks()` and `getSectionVisibility('talks')`. Render with heading "Talks & Presentations". Each entry shows title, event name, formatted date, summary, and links for recording/slides if present. Returns `null` if toggle off or no entries.

- [x] T058 [US4] In `src/app/page.tsx`, import `ArticlesSection`, `OpenSourceSection`, and `TalksSection` and add them to the page layout after the testimonials section. Each self-hides — no conditional logic needed at the call site.

**Checkpoint**: User Story 4 complete. All optional sections render when enabled + have published content, and disappear entirely when either condition is false.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Wire up admin navigation, seed data, and complete dashboard integration.

- [x] T059 In `src/components/admin/AdminShell.tsx`, add navigation links for all Phase 4 admin sections to the sidebar: "Case Studies" → `/admin/case-studies`, "CV" → `/admin/cv`, "Testimonials" (if not already present) → `/admin/testimonials`, "Articles" → `/admin/articles`, "Open Source" → `/admin/open-source`, "Talks" → `/admin/talks`. Follow the same link component and styling pattern as existing nav items.

- [x] T060 In `src/app/api/admin/dashboard/summary/route.ts`, add Phase 4 entity counts to the summary response: `caseStudies: { total, published }`, `cv: { hasPublished: boolean }`, `testimonials: { total, published }`, `articles: { total, published }`, `openSource: { total, published }`, `talks: { total, published }`. Follow the existing pattern for how counts are calculated and returned.

- [x] T061 In `prisma/seed.ts`, add seed data for Phase 4 entities: one `CaseStudy` (published, with slug `"led-platform-migration"`, with 2 `CaseStudyMetric` entries), one `Testimonial` (published), one `Article` (published), one `OpenSourceContribution` (published), one `Talk` (published). Also seed `SectionVisibility` rows for all three optional sections with `enabled: true`. Use `upsert` to make the seed idempotent (safe to re-run).

- [x] T062 [P] Verify `src/app/case-studies/page.tsx` and `src/app/case-studies/[slug]/page.tsx` are included in the public navigation (if a nav component exists, e.g., `src/components/layout/Header.tsx`). Add a "Case Studies" link if not already present. This is a manual check — only modify if a nav menu exists.

- [x] T063 [P] Do a final review of `src/app/page.tsx` to confirm all Phase 4 sections (CvDownloadButton, TestimonialsSection, ArticlesSection, OpenSourceSection, TalksSection) are integrated in a logical reading order: hero → about/skills → experience → projects → case studies (link/preview) → testimonials → articles/open source/talks → contact. Adjust order if needed for UX coherence.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — read-only orientation tasks, start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 understanding — **BLOCKS all user stories**. T004–T011 can all run in parallel (all edit `prisma/schema.prisma` — do them sequentially in one editing session). T012 (migrate) must follow T004–T011. T013 (generate) must follow T012.
- **User Story phases (Phase 3–6)**: All depend on T013 (Prisma client generated). Can proceed in parallel per story once Foundational is done.
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after T013. No dependency on other stories.
- **US2 (P2)**: Can start after T013. No dependency on US1.
- **US3 (P3)**: Can start after T013. No dependency on US1 or US2.
- **US4 (P4)**: Can start after T013. No dependency on other stories.

### Within Each User Story

- Validation/Types tasks (T014, T015, T030–T031, T038–T039, T044–T045) should be done before implementation tasks
- Query functions should be done before public page components
- Admin API routes should be done before admin UI pages
- Admin UI pages can be developed in parallel with public pages (different files)

### Parallel Opportunities (within Foundational phase)

```
T004, T005, T006, T007, T008, T009, T010, T011
  → all edit prisma/schema.prisma — do in sequence in one session
  → T012 migrate (depends on all schema edits)
  → T013 generate (depends on T012)
```

### Parallel Opportunities (within User Story phases, once T013 done)

```
US1 implementation team:  T014 → T015 (parallel) → T016 → T017 → T018 → T019 → T020 → T021 → T022 → T023 → T024 → T025 → T026 → T027 → T028 → T029
US2 implementation team:  T030 → T031 (parallel) → T032 → T033 → T034 → T035 → T036 → T037
US3 implementation team:  T038 → T039 (parallel) → T040 → T041 → T042 → T043
US4 implementation team:  T044 → T045 (parallel) → T046 → T047 → T048 (parallel) → T049 (parallel) → T050 → T051 → T052 → T053 (parallel) → T054 (parallel) → T055 → T056 (parallel) → T057 (parallel) → T058
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (read existing code)
2. Complete Phase 2: Foundational (schema + migration)
3. Complete Phase 3: User Story 1 (case studies public + admin)
4. **STOP and VALIDATE**: Navigate to `/case-studies`, create a case study via admin, verify end-to-end
5. Proceed to US2, US3, US4 in priority order

### Incremental Delivery

Each user story adds independent value:

- After US1: Case studies with dedicated pages — core differentiator done
- After US2: Downloadable CV — recruiter workflow complete
- After US3: Testimonials — social proof layer added
- After US4: Articles / open source / talks — full depth for technical evaluators

---

## Review Findings

**Review date:** 2026-03-30 | **Reviewer:** bmad-code-review (5-layer parallel)
**Result:** 8 `patch` (blocker), 6 `patch` (major), 4 `defer`

### Blockers (must fix before shipping)

- [x] [Review][Patch] BLOCKER-1: Migration slug uniqueness hazard — `migration.sql` adds `slug NOT NULL DEFAULT ''` but `slug` has `@unique`; any table with >1 existing row will fail migration [prisma/migrations/20260330101108_phase4_advanced_portfolio/migration.sql:7-8] — **FIXED**: Changed to add nullable column first, update with unique values, then make NOT NULL
- [x] [Review][Patch] BLOCKER-2: CV storageKey exposed in admin API responses — GET and POST `/api/admin/cv` return full `CvAsset` including `storageKey` (internal MinIO path); must be stripped from response [src/app/api/admin/cv/route.ts:15,61] — **FIXED**: Strip storageKey from responses
- [x] [Review][Patch] BLOCKER-3: CV upload not atomic — if MinIO delete succeeds but DB operation fails, state is inconsistent (orphaned file or lost record) [src/app/api/admin/cv/route.ts:38-59] — **FIXED**: Upload new file first, then delete old record, then delete old file (failure is non-critical)
- [x] [Review][Patch] BLOCKER-4: Missing Zod `.default()` on `createCaseStudySchema` — `displayOrder`, `published`, `isVisible` have no defaults, making them mandatory instead of optional-with-default [src/lib/content/validation.ts:22-24] — **FIXED**: Added `.default()` to all three fields
- [x] [Review][Patch] BLOCKER-5: Missing Zod `.default(0)` on `caseStudyMetricSchema.displayOrder` — field is mandatory instead of defaulting to 0 [src/lib/content/validation.ts:7] — **FIXED**: Added `.default(0)`
- [x] [Review][Patch] BLOCKER-6: `TestimonialsSection` missing visibility toggle check — only checks `testimonials.length === 0`; never queries `getSectionVisibility('testimonials')`; violates FR-013 [src/components/sections/TestimonialsSection.tsx] — **FIXED**: Added visibility toggle check
- [x] [Review][Patch] BLOCKER-7: Testimonials admin pages missing entirely — `AdminShell` nav link exists (`/admin/testimonials`) but no page files; clicking it returns 404; violates SC-006 [src/components/admin/AdminShell.tsx + missing /admin/testimonials/*] — **FIXED**: Created testimonials/page.tsx, testimonials/new/page.tsx, testimonials/[id]/page.tsx
- [x] [Review][Patch] BLOCKER-8: Articles/open-source/talks PUT endpoints don't check record existence — uncaught Prisma `NotFoundError` returns 500 instead of 404 [src/app/api/admin/articles/[id]/route.ts:30, src/app/api/admin/open-source/[id]/route.ts:30, src/app/api/admin/talks/[id]/route.ts:30] — **FIXED**: Added existence check before update

### Major (contract violations)

- [x] [Review][Patch] MAJOR-1: All DELETE endpoints return 200 `{ok: true}` instead of 204 no body — contract violation for case-studies, articles, open-source, talks, and metrics routes [src/app/api/admin/case-studies/[id]/route.ts:82, articles/[id]:49, open-source/[id]:49, talks/[id]:49, metrics/[metricId]:48] — **FIXED**: Changed all 5 DELETE handlers to `return new NextResponse(null, { status: 204 })`
- [x] [Review][Patch] MAJOR-2: Case studies GET list returns raw array, not `{ caseStudies: [...] }` — frontend consumers expecting the wrapped shape will break [src/app/api/admin/case-studies/route.ts:24] — **FIXED**: Wrapped response in object
- [x] [Review][Patch] MAJOR-3: Articles/open-source/talks GET list endpoints return raw arrays — same contract violation [src/app/api/admin/articles/route.ts:12, open-source/route.ts:12, talks/route.ts:12] — **FIXED**: Wrapped responses in objects; open-source uses `{ contributions: [...] }`
- [x] [Review][Patch] MAJOR-4: Case studies list returns `_count.metrics` instead of flat `metricsCount` — contract specifies `metricsCount` as a sibling prop [src/app/api/admin/case-studies/route.ts:21] — **FIXED**: Mapped to `metricsCount` field
- [x] [Review][Patch] MAJOR-5: Validation schemas placed in wrong module — spec requires additions to `src/lib/content/validation.ts` (T014, T044) but they were added to `src/lib/admin/validation.ts`; forms import from mixed sources — **FIXED**: Added cvAssetSchema, createArticleSchema, createOpenSourceSchema, createTalkSchema to content/validation.ts
- [x] [Review][Patch] MAJOR-6: Visibility toggles have no error/success feedback — `onChange` handlers fire-and-forget with no `response.ok` check, no toast on failure [src/app/admin/articles/page.tsx:77-82, open-source/page.tsx:77-82, talks/page.tsx:75-80] — **FIXED**: Added try/catch with toast.error on failure

### Deferred (pre-existing or out of scope)

- [x] [Review][Defer] DEFER-1: Missing explicit return type annotations on query functions — type inference works; style improvement only [src/lib/content/queries.ts] — deferred, pre-existing pattern
- [x] [Review][Defer] DEFER-2: `CaseStudyWithMetrics` uses `Pick<PrismaProject, 'id' | 'title'>` — fragile coupling to Prisma model; functional but brittle [src/lib/content/types.ts:30] — deferred, pre-existing pattern
- [x] [Review][Defer] DEFER-3: CV admin page has no client-side file size validation — server validates correctly; UX improvement only [src/app/admin/cv/page.tsx] — deferred, enhancement
- [x] [Review][Defer] DEFER-4: Inconsistent `isSubmitting` state patterns across forms — some use `form.formState.isSubmitting`, some use manual `useState` — deferred, UX polish

---

## Notes

- `[P]` tasks edit different files — they can be assigned to different agents/sessions simultaneously
- Each user story phase is independently deployable after its Checkpoint
- The Prisma schema edits in T004–T011 all touch the same file — do them in a single sequential editing session, then run T012 once
- The public sections (TestimonialsSection, ArticlesSection, etc.) are server components that self-hide — no client-side conditional rendering is needed at integration points
- All admin routes use `requireAdminSession()` from `src/lib/admin/server.ts` — never skip this guard
- Draft content protection relies on the `published: true` filter in all public query functions — never remove this filter
- The CV `storageKey` must never be exposed in public API responses — the public download endpoint proxies/redirects to MinIO without revealing the key
