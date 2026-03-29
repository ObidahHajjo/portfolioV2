# Tasks: Phase 3 — Admin Portal MVP

**Input**: Design documents from `/specs/004-admin-portal-mvp/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Implementer note**: Every task below is self-contained. Each description includes the exact file path, the key logic to implement, and a reference to the contract document that defines the full detail. Read the referenced contract before starting each task. All spec/contract files are in `specs/004-admin-portal-mvp/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase (different files, no cross-dependency)
- **[Story]**: User story this task belongs to

---

## Phase 1: Setup

**Purpose**: Install dependencies, configure environment, run the one new migration, and initialise shadcn/ui. Must complete before any implementation starts.

- [x] T001 Add new npm dependencies: run `npm install iron-session minio bcryptjs react-hook-form @hookform/resolvers` and `npm install --save-dev @types/bcryptjs` in the project root. Verify all appear in `package.json`.

- [x] T002 Add new env vars to `.env.example` (no real values) and `.env.local` (real values): `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (bcrypt hash, cost 12 — generate with `node -e "const b=require('bcryptjs');b.hash('yourpassword',12).then(console.log)"`), `SESSION_SECRET` (min 32 chars random string — generate with `openssl rand -hex 32`), `SESSION_COOKIE_NAME=admin_session`, `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`. See `specs/004-admin-portal-mvp/quickstart.md` for full list.

- [x] T003 Add `LoginAttempt` model to `prisma/schema.prisma` exactly as defined in `specs/004-admin-portal-mvp/data-model.md`: fields `id String @id @default(cuid())`, `email String @db.VarChar(254)`, `success Boolean`, `attemptAt DateTime @default(now())`, index on `[email, attemptAt]`, map to `"login_attempts"`.

- [x] T004 Run `npx prisma migrate dev --name add_login_attempts_table` from the project root. Verify migration file created in `prisma/migrations/` and `login_attempts` table exists in the database.

- [ ] T005 Create the MinIO `portfolio-assets` bucket. If `mc` is available: `mc alias set local http://localhost:9000 minioadmin minioadmin && mc mb local/portfolio-assets`. Otherwise use the MinIO Console at `http://localhost:9001`. See `specs/004-admin-portal-mvp/quickstart.md`.

- [x] T006 Initialise shadcn/ui: run `npx shadcn-ui@latest init` (choose Next.js App Router, Tailwind, default style). Then add components: `npx shadcn-ui@latest add form button input textarea label select dialog table badge toast alert`. Verify component files appear in `src/components/ui/`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared utilities and layout that every user story depends on. No user story phase can begin until this phase is complete.

**⚠️ CRITICAL**: Complete all tasks in this phase before moving to Phase 3.

- [x] T007 Create `src/lib/session.ts`. Export: (1) `sessionOptions` object — `{ password: process.env.SESSION_SECRET!, cookieName: process.env.SESSION_COOKIE_NAME ?? 'admin_session', cookieOptions: { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'strict', maxAge: 28800 } }`. (2) `getSession(req: Request)` — use `getIronSession<{ adminId: string; loginTime: number; expiresAt: number }>(cookies(), sessionOptions)` from `iron-session/next`. (3) `requireSession(req: Request)` — calls `getSession`, returns `NextResponse.json({ error: 'Not authenticated' }, { status: 401 })` if session is empty or `expiresAt < Date.now()`, otherwise returns the session object. See `specs/004-admin-portal-mvp/contracts/auth-session-contract.md`.

- [x] T008 [P] Create `src/lib/auth.ts`. Export three functions: (1) `verifyCredentials(email: string, password: string): Promise<boolean>` — compare `email` with `process.env.ADMIN_EMAIL`, compare `password` with `process.env.ADMIN_PASSWORD_HASH` using `bcrypt.compare()`. Return true only if both match. (2) `checkLockout(email: string): Promise<{ locked: boolean; minutesRemaining?: number }>` — query `prisma.loginAttempt.count({ where: { email, success: false, attemptAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } } })`. If count ≥ 5 return `{ locked: true, minutesRemaining }` (compute from oldest qualifying attempt). Otherwise return `{ locked: false }`. (3) `recordAttempt(email: string, success: boolean): Promise<void>` — `prisma.loginAttempt.create({ data: { email, success } })`. See `specs/004-admin-portal-mvp/contracts/auth-session-contract.md`.

- [x] T009 [P] Create `src/lib/minio.ts`. Export: (1) `minioClient` — singleton `new Client({ endPoint: process.env.MINIO_ENDPOINT!, port: Number(process.env.MINIO_PORT ?? 9000), useSSL: process.env.MINIO_USE_SSL === 'true', accessKey: process.env.MINIO_ACCESS_KEY!, secretKey: process.env.MINIO_SECRET_KEY! })`. (2) `uploadToMinio(objectName: string, buffer: Buffer, mimeType: string, size: number): Promise<string>` — calls `minioClient.putObject(BUCKET, objectName, buffer, size, { 'Content-Type': mimeType })`, returns the public URL `${endpoint}/${BUCKET}/${objectName}`. (3) `deleteFromMinio(objectName: string): Promise<void>` — calls `minioClient.removeObject(BUCKET, objectName)` wrapped in try/catch (swallows error, logs warning). See `specs/004-admin-portal-mvp/contracts/media-upload-contract.md`.

- [x] T010 [P] Create `src/lib/admin/validation.ts`. Re-export all Zod schemas from `src/lib/content/validation.ts`. Add the missing schemas that Phase 2 did not define: `ProfileSchema` (fields: `fullName` max 100, `tagline` max 200, `bio` min 10, `contactEmail` email max 254, `avatarUrl` optional URL max 500), `HeroSchema` (`headline` max 150, `subHeadline` max 300, `ctaText` max 50, `ctaHref` URL or path max 500), `ContactSettingsSchema` (`contactEmail` email max 254, `formEnabled` boolean, `ctaMessage` max 500), `SocialLinkSchema` (`platform` max 50, `url` URL max 500, `displayOrder` int min 0, `published` boolean, `isVisible` boolean), `TestimonialSchema` (`authorName` max 100, `authorRole` max 150, `authorCompany` max 150, `quote` min 10, `displayOrder` int min 0, `published` boolean, `isVisible` boolean), `CaseStudySchema` (`projectId` cuid, `challenge` min 10, `solution` min 10, `outcomes` min 10, `mediaAssetIds` optional array of cuids), `DisplayOrderSchema` (`displayOrder` int min 0). All schemas defined in `specs/003-content-data-model/contracts/content-query-interface.md` for Experience, Project, Skill, SeoMetadata, MediaAsset remain authoritative — import them.

- [x] T011 Create `middleware.ts` at the project root. Match `/admin/:path*`. If `pathname === '/admin/login'` or `pathname === '/api/admin/auth/login'`, call `next()`. Otherwise unseal the `admin_session` cookie using `iron-session`. If the cookie is missing, invalid, or `expiresAt < Date.now()`, redirect to `/admin/login?reason=unauthorized`. Otherwise call `next()`. Import `sessionOptions` from `src/lib/session.ts`. See `specs/004-admin-portal-mvp/contracts/auth-session-contract.md`.

- [x] T012 Create `src/components/admin/AdminShell.tsx`. A client component that renders: (1) a fixed left sidebar with nav links to every entity management screen (Dashboard, Profile, Hero, Contact Settings, Social Links, Experiences, Projects, Case Studies, Skills, Testimonials, SEO Metadata, Media Assets), (2) a top bar showing "Admin Portal" title and a Logout button that POSTs to `/api/admin/auth/logout` and redirects to `/admin/login` on success, (3) a `<main>` content area with `{children}`. Use shadcn `Button` for logout. Use Next.js `<Link>` for nav items. Mark active route with a visual indicator using `usePathname()`.

- [x] T013 Create `src/app/(admin)/layout.tsx`. Import and render `<AdminShell>` wrapping `{children}`. Import and render `<SessionWarning>` (will be created in T021 — for now just comment it out with `{/* <SessionWarning /> */}`). This layout wraps all admin pages automatically via the `(admin)` route group.

- [x] T014 [P] Create `src/components/admin/EntityList.tsx`. A reusable client component. Props: `items: Record<string, unknown>[]`, `columns: { key: string; label: string }[]`, `onEdit?: (id: string) => void`, `onDelete?: (id: string) => void`, `extraActions?: (item: Record<string, unknown>) => React.ReactNode`. Renders a shadcn `Table` with column headers from `columns`, rows from `items`, and an Actions column with Edit (links to `[id]` edit page) and Delete (shows shadcn `Dialog` confirmation before calling `onDelete`). Accepts `published` and `isVisible` fields to show a shadcn `Badge` (green=published, yellow=hidden, gray=draft).

- [x] T015 [P] Create `src/components/admin/EntityForm.tsx`. A reusable client component. Props: `schema: z.ZodSchema`, `defaultValues: Record<string, unknown>`, `fields: { name: string; label: string; type: 'text'|'textarea'|'number'|'boolean'|'select'|'date'; options?: {value:string;label:string}[] }[]`, `onSubmit: (data: unknown) => Promise<void>`, `submitLabel?: string`. Uses `react-hook-form` with `zodResolver(schema)`. Renders shadcn `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` for each field. Shows field-level errors from server responses by calling `form.setError(fieldName, { message })`. Renders a Submit `Button` with `submitLabel` (default "Save").

**Checkpoint**: Foundation ready. All user story phases can now proceed.

---

## Phase 3: User Story 1 — Secure Admin Authentication (Priority: P1) 🎯 MVP

**Goal**: Working login/logout with session cookie, 8h timeout, lockout after 5 failed attempts, and session expiry warning.

**Independent Test**: Navigate to `/admin/dashboard` unauthenticated → redirected to `/admin/login`. Submit correct credentials → reach dashboard. Submit wrong credentials 5 times → 6th attempt returns lockout message with minutes remaining. After login, check cookie is HTTP-only. Logout → session destroyed.

- [x] T016 [US1] Create `src/app/(admin)/login/page.tsx`. A server component that renders a centred login card using shadcn `Card`. Contains a client sub-component `LoginForm` that: (1) uses `EntityForm` with `schema = z.object({ email: z.string().email(), password: z.string().min(1) })`, fields `[{name:'email',label:'Email',type:'text'},{name:'password',label:'Password',type:'text'}]` (use `<Input type="password">` for password via the type override), (2) POSTs JSON `{email, password}` to `/api/admin/auth/login`, (3) on 200 redirects to `/admin/dashboard`, (4) on 401 shows "Invalid email or password" error below the form, (5) on 429 shows the lockout message from the response body. Read `?reason=` query param and show "Your session has expired. Please log in again." if `reason=session_expired`.

- [x] T017 [US1] Create `src/app/api/admin/auth/login/route.ts`. POST handler: (1) Parse and Zod-validate body `{email:string, password:string}` — return 422 with `{error, fields}` on failure. (2) Call `checkLockout(email)` — if locked, return `NextResponse.json({ error: \`Too many attempts. Try again in ${minutesRemaining} minutes.\` }, { status: 429 })`. (3) Call `verifyCredentials(email, password)`— if false, call`recordAttempt(email, false)`, return `NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })`. (4) On success: call `recordAttempt(email, true)`, get iron-session, set `session.adminId = 'admin'`, `session.loginTime = Date.now()`, `session.expiresAt = Date.now() + 28800000`, call `await session.save()`, return `NextResponse.json({ ok: true })`. Import from `src/lib/auth.ts`and`src/lib/session.ts`. See `specs/004-admin-portal-mvp/contracts/admin-api.md`and`auth-session-contract.md`.

- [x] T018 [P] [US1] Create `src/app/api/admin/auth/logout/route.ts`. POST handler: (1) Get session via `getSession()`. (2) If empty, return `NextResponse.json({ error: 'Not authenticated' }, { status: 401 })`. (3) Call `session.destroy()`. (4) Return `NextResponse.json({ ok: true })`. See `specs/004-admin-portal-mvp/contracts/admin-api.md`.

- [x] T019 [P] [US1] Create `src/app/api/admin/session/status/route.ts`. GET handler: (1) Call `requireSession()` — if it returns a `NextResponse`, return it (401). (2) Return `NextResponse.json({ expiresAt: new Date(session.expiresAt).toISOString() })`. See `specs/004-admin-portal-mvp/contracts/admin-api.md`.

- [x] T020 [P] [US1] Create `src/app/api/admin/session/extend/route.ts`. POST handler: (1) Call `requireSession()` — if returns `NextResponse`, return it. (2) Update `session.expiresAt = Date.now() + 28800000`. (3) Call `await session.save()`. (4) Return `NextResponse.json({ ok: true, expiresAt: new Date(session.expiresAt).toISOString() })`. See `specs/004-admin-portal-mvp/contracts/admin-api.md`.

- [x] T021 [US1] Create `src/components/admin/SessionWarning.tsx`. A client component. On mount, start a `setInterval` every 60 seconds that calls `GET /api/admin/session/status`. Parse `expiresAt` as a timestamp. If `(expiresAt - Date.now()) <= 5 * 60 * 1000` (≤ 5 minutes remaining), show a shadcn `Alert` (or modal `Dialog`) saying "Your session expires in X minutes. Stay logged in?" with two buttons: "Stay logged in" (calls `POST /api/admin/session/extend`, hides the alert on success) and "Log out now" (calls `POST /api/admin/auth/logout`, redirects to `/admin/login`). On 401 from `/status`, redirect to `/admin/login?reason=session_expired`. Uncomment `<SessionWarning />` in `src/app/(admin)/layout.tsx` after this task.

**Checkpoint**: Login, lockout, session expiry warning, and logout are fully functional.

---

## Phase 4: User Story 2 — CRUD for All Content Entities (Priority: P2)

**Goal**: Create, list, edit, and delete screens for all 11 entity types. Singletons have edit-only forms. List entities have list + create + edit pages and full API routes.

**Independent Test**: For any entity (e.g., Skill) — create a record, see it in the list, edit it, delete it with confirmation. For a singleton (Profile) — navigate to `/admin/profile`, edit and save, verify no "Create" button is present.

### Shared API helper (implement first)

- [ ] T022 Create `src/lib/admin/api-helpers.ts`. Export: (1) `withAdminAuth(handler: (req: Request, session: Session) => Promise<NextResponse>)` — wraps a route handler, calls `requireSession()`, passes session to handler or returns 401. (2) `zodValidate<T>(schema: z.ZodSchema<T>, data: unknown): { data: T } | NextResponse` — calls `schema.safeParse(data)`, on failure returns `NextResponse.json({ error: 'Validation failed', fields: Object.fromEntries(Object.entries(result.error.flatten().fieldErrors).map(([k,v])=>[k,v?.[0]])) }, { status: 422 })`. (3) `notFound()` — returns `NextResponse.json({ error: 'Not found' }, { status: 404 })`. (4) `ok(data?: unknown)` — returns `NextResponse.json(data ?? { ok: true })`. Import `requireSession` from `src/lib/session.ts`.

### Singleton API routes (Profile, Hero, ContactSettings)

- [ ] T023 [P] [US2] Create `src/app/api/admin/profiles/route.ts`. GET: upsert singleton with `prisma.profile.upsert({ where: { singletonKey: 'singleton' }, create: { singletonKey: 'singleton', fullName: '', tagline: '', bio: '', contactEmail: '' }, update: {} })`, return record. PATCH: validate body with `ProfileSchema` from `src/lib/admin/validation.ts`, call `prisma.profile.update({ where: { singletonKey: 'singleton' }, data: body })`, return updated record. Wrap both with `withAdminAuth`. See `specs/004-admin-portal-mvp/contracts/admin-api.md`.

- [ ] T024 [P] [US2] Create `src/app/api/admin/heroes/route.ts`. Same pattern as T023 but for the `Hero` model. Use `HeroSchema` for PATCH validation. Fields: `headline`, `subHeadline`, `ctaText`, `ctaHref`.

- [ ] T025 [P] [US2] Create `src/app/api/admin/contact-settings/route.ts`. Same pattern as T023 but for the `ContactSettings` model. Use `ContactSettingsSchema`. Fields: `contactEmail`, `formEnabled`, `ctaMessage`.

### List entity API routes

- [ ] T026 [P] [US2] Create `src/app/api/admin/social-links/route.ts` (GET list all, POST create) and `src/app/api/admin/social-links/[id]/route.ts` (GET one, PATCH update, DELETE). For DELETE: permanently delete via `prisma.socialLink.delete`. Use `SocialLinkSchema` for POST/PATCH. Wrap all with `withAdminAuth`. No cascade check needed for SocialLink.

- [ ] T027 [P] [US2] Create `src/app/api/admin/experiences/route.ts` and `src/app/api/admin/experiences/[id]/route.ts`. Same CRUD pattern as T026. Use `ExperienceSchema` (from `src/lib/content/validation.ts`). No cascade check needed.

- [ ] T028 [P] [US2] Create `src/app/api/admin/skills/route.ts` and `src/app/api/admin/skills/[id]/route.ts`. Same CRUD pattern. Use `SkillSchema`. For DELETE: Prisma schema sets `ProjectSkill` to `onDelete: Restrict` — if the skill is linked to any project via `ProjectSkill`, Prisma will throw a foreign key error; catch it and return `400 { error: 'Skill is linked to one or more projects. Remove those links first.' }`.

- [ ] T029 [P] [US2] Create `src/app/api/admin/testimonials/route.ts` and `src/app/api/admin/testimonials/[id]/route.ts`. Same CRUD pattern. Use `TestimonialSchema`. No cascade check needed.

- [ ] T030 [US2] Create `src/app/api/admin/projects/route.ts` and `src/app/api/admin/projects/[id]/route.ts`. GET list: `prisma.project.findMany({ include: { skills: { include: { skill: true } }, caseStudy: true } })`. POST: validate with `ProjectSchema` (includes `skillIds: string[]`), create project + upsert `ProjectSkill` join records for each skillId in a transaction. PATCH: same — update project fields + replace `ProjectSkill` records in a transaction (delete all existing, create new from `skillIds`). DELETE: **check for linked CaseStudy first** — `const cs = await prisma.caseStudy.findUnique({ where: { projectId: id } })`. If found, return `400 { error: \`Cannot delete: this project has a linked case study (ID: ${cs.id}, challenge: "${cs.challenge.substring(0, 60)}..."). Delete the case study first.\` }`. Only delete if no case study. (Note: CaseStudy has no title field — use ID + challenge preview per FR-011a.) See `specs/004-admin-portal-mvp/contracts/admin-api.md` (FR-011a).

- [ ] T031 [P] [US2] Create `src/app/api/admin/case-studies/route.ts` and `src/app/api/admin/case-studies/[id]/route.ts`. GET list: include `project`. POST: validate with `CaseStudySchema`, verify `projectId` exists in `prisma.project`, create. PATCH: validate, update. DELETE: no cascade check needed (CaseStudy has no children).

- [ ] T032 [P] [US2] Create `src/app/api/admin/seo-metadata/route.ts` and `src/app/api/admin/seo-metadata/[id]/route.ts`. Use `SeoMetadataSchema`. No cascade check needed.

- [ ] T033 [P] [US2] Create `src/app/api/admin/media-assets/route.ts` and `src/app/api/admin/media-assets/[id]/route.ts`. GET list, GET one, PATCH to update `ownerType` and `ownerId` linkage fields. DELETE: (1) fetch the record to get `storageUrl` and derive `objectName` (the path after the bucket prefix), (2) call `deleteFromMinio(objectName)` from `src/lib/minio.ts` (best-effort, swallow error), (3) call `prisma.mediaAsset.delete({ where: { id } })`. Return `200 { ok: true }`. This prevents orphaned MinIO files when the admin explicitly deletes a media asset.

### Singleton admin pages

- [ ] T034 [P] [US2] Create `src/app/(admin)/profile/page.tsx`. Server component: fetches `GET /api/admin/profiles` (or calls Prisma directly via server action). Renders `EntityForm` with `ProfileSchema`, fields: `fullName` (text), `tagline` (text), `bio` (textarea), `contactEmail` (text), `avatarUrl` (text, optional). On submit, PATCH to `/api/admin/profiles`. Show success toast on save.

- [ ] T035 [P] [US2] Create `src/app/(admin)/hero/page.tsx`. Same pattern as T034 for Hero. Fields: `headline` (text), `subHeadline` (textarea), `ctaText` (text), `ctaHref` (text).

- [ ] T036 [P] [US2] Create `src/app/(admin)/contact-settings/page.tsx`. Same pattern for ContactSettings. Fields: `contactEmail` (text), `formEnabled` (boolean/checkbox), `ctaMessage` (textarea).

### List entity admin pages

- [ ] T037 [P] [US2] Create `src/app/(admin)/social-links/page.tsx` (list with `EntityList`), `src/app/(admin)/social-links/new/page.tsx` (create form with `EntityForm` + `SocialLinkSchema`), `src/app/(admin)/social-links/[id]/page.tsx` (edit form, fetches existing record as `defaultValues`). All forms POST/PATCH to the corresponding API route. Delete calls `DELETE /api/admin/social-links/[id]` and refreshes list.

- [ ] T038 [P] [US2] Create experience pages: `src/app/(admin)/experiences/page.tsx`, `new/page.tsx`, `[id]/page.tsx`. Form fields: `company` (text), `role` (text), `startDate` (date), `endDate` (date, optional), `description` (textarea), `highlights` (textarea — comma-separated, split on save into array). Use `ExperienceSchema`.

- [ ] T039 [P] [US2] Create skill pages: `src/app/(admin)/skills/page.tsx`, `new/page.tsx`, `[id]/page.tsx`. Form fields: `name` (text), `category` (text), `proficiency` (select: beginner/intermediate/advanced/expert/none), `displayOrder` (number), `published` (boolean), `isVisible` (boolean). Use `SkillSchema`.

- [ ] T040 [P] [US2] Create testimonial pages: `src/app/(admin)/testimonials/page.tsx`, `new/page.tsx`, `[id]/page.tsx`. Form fields: `authorName`, `authorRole`, `authorCompany` (text), `quote` (textarea), `displayOrder` (number), `published` (boolean), `isVisible` (boolean). Use `TestimonialSchema`.

- [ ] T041 [P] [US2] Create project pages: `src/app/(admin)/projects/page.tsx`, `new/page.tsx`, `[id]/page.tsx`. Form fields: `title`, `summary` (textarea), `repoUrl`, `demoUrl` (text optional), `displayOrder` (number), `published` (boolean), `isVisible` (boolean), `skillIds` (multi-select of existing skills — fetch `/api/admin/skills` to populate options). The `mediaAssetId` field is handled by `MediaUploadField` in Phase 7 (T052) — leave a `{/* TODO: MediaUploadField – added in T052 */}` placeholder comment for now. Use `ProjectSchema`.

- [ ] T042 [P] [US2] Create case-study pages: `src/app/(admin)/case-studies/page.tsx`, `new/page.tsx`, `[id]/page.tsx`. Form fields: `projectId` (select from existing projects — fetch `/api/admin/projects`), `challenge` (textarea), `solution` (textarea), `outcomes` (textarea). Use `CaseStudySchema`.

- [ ] T043 [P] [US2] Create SEO metadata pages: `src/app/(admin)/seo-metadata/page.tsx`, `new/page.tsx`, `[id]/page.tsx`. Form fields: `pageSlug` (text), `pageTitle`, `metaDescription`, `keywords` (text, comma-separated), `ogTitle`, `ogDescription`, `ogImageUrl`. Use `SeoMetadataSchema`.

- [ ] T044 [P] [US2] Create media assets page: `src/app/(admin)/media-assets/page.tsx` — list of all uploaded media assets with file name, type, size, storage URL (as a link). No create form (uploads handled in Phase 7). Add delete button that calls `DELETE /api/admin/media-assets/[id]`.

**Checkpoint**: All 11 entity types are fully CRUD-manageable through the admin UI.

---

## Phase 5: User Story 3 — Publish / Unpublish / Visibility Controls (Priority: P3)

**Goal**: Publish, unpublish, hide, and show controls on every eligible entity list screen and edit screen.

**Independent Test**: Create a project (draft by default), confirm it is absent from the public route (`/` or `/projects`), publish it via the admin UI, confirm it appears on the public site, unpublish it, confirm it disappears.

- [ ] T045 Create `src/lib/admin/lifecycle.ts`. Export four functions that each take `(model: 'socialLink'|'experience'|'skill'|'project'|'testimonial', id: string)` and update the corresponding Prisma model: (1) `publishItem` — set `{ published: true }`, first validate required fields are non-null (return 400 if invalid). For Project: check `title`, `summary` are non-empty. For Experience: check `company`, `role`, `description` are non-empty. For others: check main text field. (2) `unpublishItem` — set `{ published: false }`. (3) `hideItem` — set `{ isVisible: false }`, return 400 if item is not currently published. (4) `showItem` — set `{ isVisible: true }`. Each function returns the updated record or throws. See `specs/003-content-data-model/contracts/content-lifecycle.md` for state machine rules, and `specs/004-admin-portal-mvp/contracts/admin-api.md` for response shapes.

- [ ] T046 [P] [US3] Create lifecycle API routes for each list entity. For each of: `social-links`, `experiences`, `skills`, `testimonials`, `projects` — create files `src/app/api/admin/{entity}/[id]/publish/route.ts`, `unpublish/route.ts`, `hide/route.ts`, `show/route.ts`. Each is a PATCH handler wrapped with `withAdminAuth` that calls the corresponding function from `lifecycle.ts` and returns `200 { ok: true }` or the error response. Five entities × four routes = 20 route files total.

- [ ] T047 [US3] Add publish/unpublish/hide/show action buttons to `EntityList.tsx` (created in T014). Add new prop `lifecycleActions?: boolean`. When true, render inline action buttons per row: "Publish" (only when `published=false`), "Unpublish" (only when `published=true && isVisible=true`), "Hide" (only when `published=true && isVisible=true`), "Show" (only when `published=true && isVisible=false`). Each button calls the appropriate lifecycle endpoint via `fetch`, then triggers a list refresh. Pass `lifecycleActions={true}` to all list pages for lifecycle-enabled entities.

**Checkpoint**: Publish/unpublish/hide/show controls are functional on all eligible entity list screens.

---

## Phase 6: User Story 4 — Content Display Ordering (Priority: P4)

**Goal**: Manual numeric ordering for all list-type entities.

**Independent Test**: Navigate to `/admin/skills`, change a skill's `displayOrder` value, save, visit the public site — skills render in the new order.

- [ ] T048 [P] [US4] Create `PATCH /api/admin/{entity}/[id]/order/route.ts` for each of: `social-links`, `experiences`, `skills`, `testimonials`, `projects`. Each handler: wrapped with `withAdminAuth`, validates body `{ displayOrder: number }` using `DisplayOrderSchema` from `src/lib/admin/validation.ts`, updates `prisma.{entity}.update({ where: { id }, data: { displayOrder } })`, returns `200 { ok: true }`. Five route files total. **Note on duplicate positions**: duplicate `displayOrder` values are accepted silently — ties are broken by `createdAt` ascending (per Phase 2 query contract). No uniqueness constraint is needed.

- [ ] T049 [US4] Add inline `displayOrder` number input to each list page for eligible entities (`social-links`, `experiences`, `skills`, `testimonials`, `projects`). Each row in `EntityList` should show a small number `<Input type="number" min={0}>` pre-filled with the current `displayOrder`. On blur or "Save order" button click, call `PATCH /api/admin/{entity}/{id}/order` with the new value and show a brief "Saved" indicator. This can be done by extending `EntityList` with an optional `orderField?: boolean` prop, or by implementing it inline in each list page — choose the simpler approach.

**Checkpoint**: Display order is editable for all list entities and immediately reflected on the public site.

---

## Phase 7: User Story 5 — Media Upload (Priority: P5)

**Goal**: Upload images and documents to MinIO, register as MediaAsset records, link to content entities.

**Independent Test**: Go to a project edit page, upload a valid JPEG, receive a storage URL, save the project — the `mediaAssetId` is linked. Upload a 20 MB file — receive a "File exceeds 10 MB" error. Upload an `.exe` file — receive a "File type not allowed" error.

**⚠️ Execution order in this phase**: T051 → T052 → T050 (T051 must run first to migrate the schema and regenerate the Prisma client before T050 can reference `fileSize`).

- [ ] T050 [US5] ⚠️ **Depends on T051 completing first** (migration must run and `prisma generate` must be called before this file can reference `fileSize`). Create `src/app/api/admin/media-assets/upload/route.ts`. POST handler wrapped with `withAdminAuth`: (1) Parse `await req.formData()`. Extract `file` (File), `ownerType` (string), `ownerId` (string). (2) Validate file size ≤ 10 MB (`file.size <= 10 * 1024 * 1024`) — return 400 if exceeded. (3) Validate MIME type is one of `['image/jpeg','image/png','image/webp','image/gif','application/pdf']` — return 400 if not allowed. (4) Generate `objectName = \`${ownerType}/${ownerId}/${Date.now()}-${file.name}\``. (5) Read file to `Buffer`via`Buffer.from(await file.arrayBuffer())`. (6) Call `uploadToMinio(objectName, buffer, file.type, file.size)`from`src/lib/minio.ts`— if it throws, return 500. (7) Create`prisma.mediaAsset.create({ data: { fileName: file.name, storageUrl, fileType: file.type, fileSize: file.size, ownerType, ownerId } })`— if Prisma throws, call`deleteFromMinio(objectName)`(best-effort), return`500 { error: 'Upload failed. Storage has been cleaned up.' }`. (8) Return `201 { id, storageUrl, fileName, fileType }`. See `specs/004-admin-portal-mvp/contracts/media-upload-contract.md`.

- [ ] T051 [US5] ⚠️ **Must complete before T050** — run first in Phase 7. Add `fileSize Int @default(0)` field to the `MediaAsset` model in `prisma/schema.prisma`. Run `npx prisma migrate dev --name add_media_asset_file_size`, then run `npx prisma generate` to update the client. Verify `prisma.mediaAsset` type includes `fileSize` before proceeding to T050. See `specs/004-admin-portal-mvp/contracts/media-upload-contract.md` (fileSize note).

- [ ] T052 [US5] Create `src/components/admin/MediaUploadField.tsx`. A client component. Props: `ownerType: string`, `ownerId: string`, `currentUrl?: string`, `onUploaded: (asset: { id: string; storageUrl: string }) => void`. Renders: (1) if `currentUrl` is set, show a thumbnail/link with a "Replace" button. (2) An `<input type="file" accept="image/*,application/pdf">` that on change calls `POST /api/admin/media-assets/upload` via `FormData` with `file`, `ownerType`, `ownerId`. (3) Shows an upload progress indicator (disable input while uploading). (4) On success, calls `onUploaded(asset)`. (5) On error, shows the error message from the response body. Add `<MediaUploadField>` to the project edit page (`src/app/(admin)/projects/[id]/page.tsx`) — replace the placeholder comment from T041.

**Checkpoint**: Files can be uploaded, stored in MinIO, and linked to project records.

---

## Phase 8: User Story 6 — Content Preview (Priority: P6)

**Goal**: View a draft item as it would appear when published, without exposing it on the public URL.

**Independent Test**: Create a draft project (not published). Click "Preview" in the admin. A page renders showing the project as it would appear. Visit the same route without the admin session — the project is not visible.

- [ ] T053 [US6] Create `src/app/api/admin/preview/projects/[id]/route.ts`. GET handler: (1) Call `requireSession()` — return 401 if not authenticated. (2) Fetch the project by id including skills and case study: `prisma.project.findUnique({ where: { id }, include: { skills: { include: { skill: true } }, caseStudy: true, mediaAsset: true } })`. Return 404 if not found. (3) Return 200 with the full project record as JSON. This is the data payload — the preview page will render it. Add `X-Robots-Tag: noindex` response header.

- [ ] T054 [US6] Create `src/app/(admin)/preview/projects/[id]/page.tsx`. Server component. Fetches project data from the preview API (calls `requireSession` server-side). Renders the project in a simplified preview layout matching the public portfolio presentation (title, summary, skills list, case study if present, media image if present). Shows a banner at the top: "Preview mode — this content is not published" with a link back to the edit page. If the project has no `published=false` status, show a note "This item is currently published". Wrap the page with a minimal layout (no admin sidebar — just the preview banner).

- [ ] T055 [US6] Add a "Preview" button to the project edit page (`src/app/(admin)/projects/[id]/page.tsx`) and the project list page. The button links to `/admin/preview/projects/[id]` opening in a new tab.

**Checkpoint**: Draft projects can be previewed within the admin session without appearing on the public site.

---

## Phase 9: User Story 7 — Admin Dashboard (Priority: P7)

**Goal**: Dashboard showing published/draft counts for all major entities.

**Independent Test**: Load `/admin/dashboard`. Counts match actual record counts in the database. Publish a skill, reload dashboard — published skill count increments.

- [ ] T056 [US7] Create `src/app/api/admin/dashboard/summary/route.ts`. GET handler wrapped with `withAdminAuth`: run `Promise.all` of `prisma.{entity}.count({ where: { published: true } })` and `prisma.{entity}.count({ where: { published: false } })` for each of: `project`, `skill`, `experience`, `testimonial`, `socialLink`. Return JSON matching the shape in `specs/004-admin-portal-mvp/contracts/admin-api.md` `##Dashboard` section: `{ projects: { published, draft }, skills: {...}, experiences: {...}, testimonials: {...}, socialLinks: {...} }`.

- [ ] T057 [US7] Create `src/app/(admin)/dashboard/page.tsx`. Server component. Calls the summary API (or Prisma directly). Renders a grid of summary cards — one per entity type — each showing the entity name, a green "Published: N" badge, and a gray "Draft: N" badge. Add a shadcn `Button` or link below each card to navigate to that entity's management screen. This is the default page the admin lands on after login.

**Checkpoint**: Dashboard displays accurate entity counts and links to management screens.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, navigation guards, and final wiring.

- [ ] T058 Create `src/app/(admin)/not-found.tsx`. Renders a simple "404 — Page not found" message within the admin shell with a link back to the dashboard.

- [ ] T059 [P] Add global error handling to all admin API routes: ensure every unhandled `catch` block in API route files returns `NextResponse.json({ error: 'Internal server error' }, { status: 500 })` with no stack trace exposed. Review all route files created in Phases 3–9 and add consistent try/catch where missing.

- [ ] T060 [P] Update `src/app/(admin)/layout.tsx` to uncomment `<SessionWarning />` (if it was left commented in T013). Verify the warning component mounts and polls correctly by checking the Network tab in browser devtools.

- [ ] T061 Verify `middleware.ts` handles the `/admin/login` page itself: if the user is already authenticated and visits `/admin/login`, redirect to `/admin/dashboard` (avoids logged-in users seeing the login form). Add this check: after unsealing the cookie, if path is `/admin/login` and session is valid and not expired, redirect to `/admin/dashboard`.

- [ ] T062 Run the full quickstart validation from `specs/004-admin-portal-mvp/quickstart.md`: start dev server, navigate to `/admin/login`, complete a full round-trip (login → create/edit/publish one entity of each of the 7 main types → logout). Fix any broken routes or form errors found.

- [ ] T063 _(Optional — add if time allows)_ Add a "Delete" button with confirmation dialog to each entity **edit** page (`[id]/page.tsx`) for non-singleton list entities. Currently delete is only available from the list view. This is a UX convenience, not a functional requirement — skip if the list-view delete is sufficient.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — blocks all user story phases
- **Phase 3–9 (User Stories)**: All depend on Phase 2 completion; can proceed sequentially in priority order
- **Phase 10 (Polish)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (Auth)**: No dependency on other user stories — implements the session/lockout infrastructure
- **US2 (CRUD)**: Depends on US1 (all CRUD pages are protected routes). API routes themselves only need Phase 2.
- **US3 (Lifecycle)**: Depends on US2 (lifecycle buttons are part of entity list/edit screens)
- **US4 (Ordering)**: Depends on US2 (order inputs are added to entity list screens)
- **US5 (Media)**: Depends on US2 (MediaUploadField is embedded in project edit form)
- **US6 (Preview)**: Depends on US2 (preview links are added to project edit pages)
- **US7 (Dashboard)**: Depends on US1 (dashboard is a protected route); independent of US2–US6 content

### Within Each User Story

- API route tasks before page tasks (pages call API routes)
- Shared helper tasks (T022, T045, T050) before the tasks that use them
- `EntityList` and `EntityForm` (T014, T015) must be complete before any page tasks

### Parallel Opportunities

- All [P] tasks within each phase can run simultaneously (different files)
- Phase 3 US1 auth API routes (T017–T020) can all run in parallel after T007/T008 complete
- All singleton API routes (T023–T025) can run in parallel
- All list entity API routes (T026–T033) can run in parallel
- All singleton pages (T034–T036) and list pages (T037–T044) can run in parallel
- All lifecycle route files (T046) can be created in parallel

---

## Parallel Example: User Story 2 (CRUD)

```
After T022 (api-helpers.ts) is complete:

Batch 1 — run in parallel:
  T023 profiles/route.ts
  T024 heroes/route.ts
  T025 contact-settings/route.ts
  T026 social-links/route.ts + [id]/route.ts
  T027 experiences/route.ts + [id]/route.ts
  T028 skills/route.ts + [id]/route.ts
  T029 testimonials/route.ts + [id]/route.ts
  T031 case-studies/route.ts + [id]/route.ts
  T032 seo-metadata/route.ts + [id]/route.ts
  T033 media-assets/route.ts + [id]/route.ts

T030 (projects — requires CaseStudy block check — sequential, depends on T031 being understood)

Batch 2 — run in parallel after Batch 1:
  T034 /admin/profile/page.tsx
  T035 /admin/hero/page.tsx
  T036 /admin/contact-settings/page.tsx
  T037 /admin/social-links pages
  T038 /admin/experiences pages
  T039 /admin/skills pages
  T040 /admin/testimonials pages
  T042 /admin/case-studies pages
  T043 /admin/seo-metadata pages
  T044 /admin/media-assets/page.tsx

T041 (projects pages — references skill multi-select, sequential after T039)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Authentication)
4. **STOP AND VALIDATE**: Can log in, session expires, lockout works, logout works
5. Proceed to US2

### Incremental Delivery

1. Phase 1 + 2 → Infrastructure ready
2. - Phase 3 (US1) → Auth working (MVP gate)
3. - Phase 4 (US2) → Full content management working
4. - Phase 5 (US3) → Publish controls working
5. - Phase 6 (US4) → Ordering working
6. - Phase 7 (US5) → Media uploads working
7. - Phase 8 (US6) → Preview working
8. - Phase 9 (US7) → Dashboard working
9. - Phase 10 → Polish complete

---

## Notes

- Every task description is designed to be self-contained for implementation by a smaller LLM context window
- Each task references the exact contract file for full detail — read the referenced contract before implementing
- [P] tasks use different files with no shared state — safe to implement in parallel
- All admin mutations must pass Zod validation before Prisma calls (enforced by `zodValidate` in `api-helpers.ts`)
- Draft content safety is enforced by Phase 2's public query helpers (`getPublishedVisible`) which are not modified in this phase
- Commit after each completed task or logical group; never commit `.env.local` or `SESSION_SECRET`
