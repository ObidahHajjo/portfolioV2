# Quickstart: Phase 4 — Advanced Portfolio (Senior-Level Depth)

**Branch**: `005-advanced-portfolio` | **Date**: 2026-03-29

This runbook covers the setup, migration, seed, and validation steps needed to run Phase 4 locally and verify each user story independently.

---

## Prerequisites

Phase 3 (Admin Portal MVP) must be fully deployed and running. The following must be operational before starting Phase 4:

- PostgreSQL 16 running (Docker Compose or local)
- MinIO running (Docker Compose or local) with credentials in `.env`
- Next.js app running (`npm run dev`)
- Admin session working at `http://localhost:3000/admin/login`
- All Phase 2 and Phase 3 migrations applied

Confirm: `npx prisma migrate status` — all migrations should show as Applied.

---

## Step 1: Apply the Phase 4 Migration

```bash
npx prisma migrate dev --name phase4_advanced_portfolio
```

This creates and applies the migration that:
- Extends `case_studies` (adds slug, title, published, isVisible, displayOrder, architectureNotes)
- Makes `CaseStudy.projectId` nullable (SetNull on project delete)
- Creates `case_study_metrics` table
- Extends `testimonials` (adds avatarUrl, makes authorCompany nullable)
- Creates `cv_assets` table
- Creates `articles` table
- Creates `open_source_contributions` table
- Creates `talks` table
- Creates `section_visibility` table

If the migration fails due to existing `case_studies` rows missing the `slug` value, the migration SQL includes a backfill step (`UPDATE case_studies SET slug = id WHERE slug IS NULL`) that handles this automatically.

---

## Step 2: Regenerate the Prisma Client

```bash
npx prisma generate
```

Verify: no TypeScript errors in `src/lib/content/queries.ts` after this step.

---

## Step 3: Install No New Packages

Phase 4 introduces no new npm dependencies. Skip this step.

---

## Step 4: Seed Phase 4 Test Data

Run the seed script (after updating `prisma/seed.ts` per task T061):

```bash
npx prisma db seed
```

This seeds:
- 1 published `CaseStudy` with slug `"led-platform-migration"`, title `"Led Platform Migration"`, and 2 `CaseStudyMetric` entries
- 1 published `Testimonial` with author name and quote
- 1 published `Article` with an external URL
- 1 published `OpenSourceContribution`
- 1 published `Talk`
- 3 `SectionVisibility` rows (`articles`, `open_source`, `talks`) with `enabled: true`

The seed uses `upsert` and is safe to re-run.

---

## Step 5: Start the Dev Server

```bash
npm run dev
```

---

## Validation Scenarios

### User Story 1 — Case Studies

**Scenario A — Listing page**
1. Navigate to `http://localhost:3000/case-studies`
2. Expected: page renders with at least one case study card linking to `/case-studies/led-platform-migration`

**Scenario B — Detail page**
1. Navigate to `http://localhost:3000/case-studies/led-platform-migration`
2. Expected: page renders with title, challenge, solution, outcomes, and at least 2 metric callout cards

**Scenario C — Draft protection**
1. In admin, create a case study with `published: false` and slug `"draft-test"`
2. Navigate to `http://localhost:3000/case-studies/draft-test`
3. Expected: 404 page — "Case study not found"

**Scenario D — Admin CRUD**
1. Navigate to `http://localhost:3000/admin/case-studies`
2. Expected: list of all case studies (including drafts)
3. Click "New Case Study", fill the form, save
4. Expected: redirects to list, new entry appears
5. Click Edit on the new entry, add a metric in the CaseStudyMetricsEditor
6. Expected: metric appears in the list immediately

### User Story 2 — CV Download

**Scenario A — Upload CV**
1. Navigate to `http://localhost:3000/admin/cv`
2. Expected: "No CV uploaded" message with upload control
3. Upload a PDF file (< 10MB)
4. Expected: admin page now shows the file name, size, and "Active" badge

**Scenario B — Public download button appears**
1. Navigate to `http://localhost:3000` (public portfolio home)
2. Expected: "Download CV" button is visible

**Scenario C — Download works**
1. Click the "Download CV" button
2. Expected: PDF file download starts immediately

**Scenario D — Button hidden when no CV**
1. Go to admin, delete the CV
2. Reload the public portfolio
3. Expected: "Download CV" button is absent

**Scenario E — Replacement deletes old file**
1. Upload CV file A
2. Upload CV file B (replacement)
3. Expected: only file B is served; file A is gone from MinIO (verify via MinIO console or admin UI shows new filename)

### User Story 3 — Testimonials

**Scenario A — Section visible with published content**
1. Seed or manually create at least 1 published Testimonial
2. Navigate to `http://localhost:3000`
3. Expected: "What People Say" section visible with the testimonial

**Scenario B — Section hidden when no published content**
1. Unpublish all testimonials
2. Reload public portfolio
3. Expected: testimonials section is entirely absent — no heading, no empty container

**Scenario C — Order respected**
1. Create two published testimonials with `displayOrder` 2 and 1
2. Reload public portfolio
3. Expected: testimonial with `displayOrder: 1` appears first

### User Story 4 — Optional Sections

**Scenario A — Section appears when enabled + published**
1. Ensure articles section visibility is `enabled: true` and at least 1 article is published
2. Navigate to `http://localhost:3000`
3. Expected: "Writing" section renders with the article entry

**Scenario B — Section hidden when toggle disabled**
1. In admin, navigate to `http://localhost:3000/admin/articles`
2. Toggle the "Section Visibility" switch to off
3. Reload public portfolio
4. Expected: "Writing" section is absent, even though published articles exist

**Scenario C — Section hidden when no published entries (regardless of toggle)**
1. Re-enable the section toggle
2. Unpublish all articles
3. Reload public portfolio
4. Expected: "Writing" section is absent

**Scenario D — Each section toggles independently**
1. Disable only the "talks" section
2. Reload public portfolio
3. Expected: articles and open source sections appear normally; talks section is absent

---

## Environment Variables

No new environment variables are introduced in Phase 4. All required vars are from Phase 3:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `MINIO_ENDPOINT` | MinIO host (e.g., `localhost`) |
| `MINIO_PORT` | MinIO port (default `9000`) |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `MINIO_BUCKET` | Bucket name for all uploads |
| `SESSION_SECRET` | Secret for `iron-session` cookie encryption |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of admin password |

---

## MinIO Bucket Setup (if not already done in Phase 3)

The CV PDF is stored in the same MinIO bucket used for media assets. Ensure the bucket exists:

```bash
# Using mc (MinIO Client)
mc alias set local http://localhost:9000 <access-key> <secret-key>
mc mb local/<bucket-name> --ignore-existing
mc policy set download local/<bucket-name>  # Only if public read is acceptable
```

For the CV download proxy approach, bucket policy does not need to be public — the Next.js API route authenticates with MinIO server-side using the access key, then proxies the bytes to the browser.
