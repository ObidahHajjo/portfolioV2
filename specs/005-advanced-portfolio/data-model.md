# Data Model: Phase 4 — Advanced Portfolio (Senior-Level Depth)

**Branch**: `005-advanced-portfolio` | **Date**: 2026-03-29
**ORM**: Prisma 6.x | **Database**: PostgreSQL 16

---

## Overview

Phase 4 modifies two existing models and introduces six new models. All changes are delivered in a single migration named `phase4_advanced_portfolio`.

| Change | Model | Type | Action |
|---|---|---|---|
| Extend | `CaseStudy` | Child of Project (optional) | Add slug, title, published/visible/order, architectureNotes, metrics relation; make projectId optional |
| New | `CaseStudyMetric` | Child of CaseStudy | Structured KV metric entries |
| Extend | `Testimonial` | List | Add optional avatarUrl; make authorCompany optional |
| New | `CvAsset` | Singleton-like (one published at a time) | CV PDF metadata + MinIO storage key |
| New | `Article` | List | External-URL article entries |
| New | `OpenSourceContribution` | List | Open source contribution entries |
| New | `Talk` | List | Conference/meetup talk entries |
| New | `SectionVisibility` | Settings (keyed by section name) | Per-section on/off toggle for optional public sections |

---

## Cross-Cutting Conventions (inherited from Phase 2)

All **list entities** include:
- `displayOrder Int @default(0)` — ascending sort for public display
- `published Boolean @default(false)` — draft (false) / published (true)
- `isVisible Boolean @default(true)` — admin visibility flag
- `@@index([published, isVisible, displayOrder])` — composite index for the standard public query

All entities include: `id String @id @default(cuid())`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`

---

## Modified Model: CaseStudy

**Table**: `case_studies`

The Phase 2 `CaseStudy` model was a child of `Project` with no public-facing lifecycle of its own. Phase 4 promotes it to a first-class content type with its own slug, dedicated URL, draft/publish state, and a structured metrics child table.

### Schema

```prisma
model CaseStudy {
  id                String            @id @default(cuid())
  slug              String            @unique @db.VarChar(150)
  title             String            @db.VarChar(200)
  projectId         String?           @unique
  challenge         String            @db.Text
  solution          String            @db.Text
  outcomes          String            @db.Text
  architectureNotes String?           @db.Text
  displayOrder      Int               @default(0)
  published         Boolean           @default(false)
  isVisible         Boolean           @default(true)
  mediaAssetIds     String[]
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  project           Project?          @relation(fields: [projectId], references: [id], onDelete: SetNull)
  metrics           CaseStudyMetric[]

  @@index([published, isVisible, displayOrder])
  @@map("case_studies")
}
```

### Field Reference

| Field | Type | Rules |
|---|---|---|
| `slug` | `String` @unique VarChar(150) | Required; URL-safe (lowercase, hyphens only); auto-generated from title, admin-editable; unique enforced at DB level |
| `title` | `String` VarChar(200) | Required; max 200 chars |
| `projectId` | `String?` @unique | Optional FK to `projects.id`; `SetNull` on project delete |
| `challenge` | `String` Text | Required; min 10 chars |
| `solution` | `String` Text | Required; min 10 chars |
| `outcomes` | `String` Text | Required; min 10 chars |
| `architectureNotes` | `String?` Text | Optional; architecture and decision rationale |
| `displayOrder` | `Int` | Required; integer ≥ 0; default 0 |
| `published` | `Boolean` | Default false; only `published: true` records appear publicly |
| `isVisible` | `Boolean` | Default true; used by admin to hide without unpublishing |
| `mediaAssetIds` | `String[]` | Optional array of MediaAsset IDs (inherited from Phase 2, not used in Phase 4 public display) |

### Migration Notes

```sql
-- Add new columns
ALTER TABLE case_studies ADD COLUMN slug VARCHAR(150);
ALTER TABLE case_studies ADD COLUMN title VARCHAR(200) DEFAULT 'Untitled';
ALTER TABLE case_studies ADD COLUMN "architectureNotes" TEXT;
ALTER TABLE case_studies ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE case_studies ADD COLUMN published BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE case_studies ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT TRUE;

-- Make projectId optional (drop not-null constraint)
ALTER TABLE case_studies ALTER COLUMN "projectId" DROP NOT NULL;

-- Backfill slugs for any existing rows (dev environment only — no prod data)
UPDATE case_studies SET slug = id WHERE slug IS NULL;

-- Add unique constraint on slug
ALTER TABLE case_studies ADD CONSTRAINT case_studies_slug_key UNIQUE (slug);

-- Add index
CREATE INDEX idx_case_studies_query ON case_studies (published, "isVisible", "displayOrder" ASC);

-- Change onDelete behaviour: projectId FK now SetNull
ALTER TABLE case_studies DROP CONSTRAINT IF EXISTS "case_studies_projectId_fkey";
ALTER TABLE case_studies ADD CONSTRAINT "case_studies_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES projects(id) ON DELETE SET NULL;
```

---

## New Model: CaseStudyMetric

**Table**: `case_study_metrics`

Stores structured impact metrics linked to a case study. Each record represents one measurable outcome displayed as a visual callout (e.g., "Deployment time / -60%").

### Schema

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

### Field Reference

| Field | Type | Rules |
|---|---|---|
| `caseStudyId` | `String` | Required; FK to `case_studies.id`; cascades on delete |
| `label` | `String` VarChar(100) | Required; e.g., "Deployment time" |
| `value` | `String` VarChar(100) | Required; e.g., "-60%" |
| `unit` | `String?` VarChar(50) | Optional; e.g., "%" |
| `displayOrder` | `Int` | Required; default 0; controls visual order of callout cards |

---

## Modified Model: Testimonial

**Table**: `testimonials`

Minor extensions to the Phase 2 model: add optional avatar URL, make `authorCompany` optional.

### Schema

```prisma
model Testimonial {
  id            String   @id @default(cuid())
  authorName    String   @db.VarChar(100)
  authorRole    String   @db.VarChar(150)
  authorCompany String?  @db.VarChar(150)   -- Changed: was required, now optional
  avatarUrl     String?  @db.VarChar(500)   -- New field
  quote         String   @db.Text
  displayOrder  Int      @default(0)
  published     Boolean  @default(false)
  isVisible     Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([published, isVisible, displayOrder])
  @@map("testimonials")
}
```

### Migration Notes

```sql
ALTER TABLE testimonials ADD COLUMN "avatarUrl" VARCHAR(500);
ALTER TABLE testimonials ALTER COLUMN "authorCompany" DROP NOT NULL;
```

---

## New Model: CvAsset

**Table**: `cv_assets`

Stores metadata for the single active CV PDF. Only one record should have `published: true` at a time — the admin API enforces this by deleting the previous record before inserting a new one. The `storageKey` is the MinIO object key used to retrieve or delete the file; it is never exposed in public API responses.

### Schema

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

### Field Reference

| Field | Type | Rules |
|---|---|---|
| `fileName` | `String` VarChar(255) | Original filename for `Content-Disposition` header |
| `storageKey` | `String` VarChar(500) | MinIO object key (e.g., `cv/cluid123.pdf`) — internal only |
| `fileSize` | `Int` | File size in bytes; displayed in admin UI |
| `published` | `Boolean` | Only records with `true` are returned by `getPublishedCvAsset()` |

### Lifecycle

```
Admin uploads PDF
  → Fetch existing CvAsset where published = true
  → If exists: delete MinIO object at storageKey, delete DB record
  → Upload new PDF to MinIO at key "cv/[cuid].pdf"
  → Create CvAsset record with published = true
  → Return new record (without storageKey) to admin client

Admin deletes CV
  → Fetch current CvAsset where published = true
  → Delete MinIO object at storageKey
  → Delete DB record
  → Return 204

Public download
  → Fetch CvAsset where published = true
  → If none: return 404
  → Fetch file bytes from MinIO using storageKey
  → Stream to client with Content-Disposition: attachment; filename="[fileName]"
  → Never return storageKey to browser
```

---

## New Model: Article

**Table**: `articles`

Optional public section. Articles link exclusively to external URLs; no body text is stored internally.

### Schema

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

### Field Reference

| Field | Type | Rules |
|---|---|---|
| `title` | `String` VarChar(200) | Required; max 200 chars |
| `summary` | `String` Text | Required; min 10 chars |
| `externalUrl` | `String` VarChar(500) | Required; valid URL; links to where the article is hosted |
| `publishedAt` | `DateTime?` | Optional; the date the article was published externally |

---

## New Model: OpenSourceContribution

**Table**: `open_source_contributions`

Optional public section. Documents contributions to open-source projects.

### Schema

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

### Field Reference

| Field | Type | Rules |
|---|---|---|
| `projectName` | `String` VarChar(150) | Required; max 150 chars |
| `description` | `String` Text | Required; min 10 chars |
| `contributionType` | `String` VarChar(100) | Required; e.g., "Bug fix", "Feature", "Maintainer", "Documentation" |
| `repositoryUrl` | `String?` VarChar(500) | Optional; valid URL to the repository or project page |

---

## New Model: Talk

**Table**: `talks`

Optional public section. Documents conference talks, meetup presentations, or podcast appearances.

### Schema

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

### Field Reference

| Field | Type | Rules |
|---|---|---|
| `title` | `String` VarChar(200) | Required; max 200 chars |
| `eventName` | `String` VarChar(200) | Required; name of the conference or meetup |
| `talkDate` | `DateTime` | Required; date the talk was given |
| `summary` | `String` Text | Required; min 10 chars |
| `recordingUrl` | `String?` VarChar(500) | Optional; valid URL to recording |
| `slidesUrl` | `String?` VarChar(500) | Optional; valid URL to slides |

---

## New Model: SectionVisibility

**Table**: `section_visibility`

Controls the admin-managed on/off toggle for each optional public section. One row per section. If no row exists for a section, the section is treated as enabled by default.

### Schema

```prisma
model SectionVisibility {
  id        String   @id @default(cuid())
  section   String   @unique @db.VarChar(50)
  enabled   Boolean  @default(true)
  updatedAt DateTime @updatedAt

  @@map("section_visibility")
}
```

### Valid Section Values

| `section` | Controls |
|---|---|
| `"articles"` | Articles section |
| `"open_source"` | Open Source Contributions section |
| `"talks"` | Talks & Presentations section |

### Lifecycle

The API uses `upsert` — if no row exists for a section, inserting via PUT creates it; the application reads it as `enabled: true` if absent.

---

## Relationship Diagram (Phase 4 additions)

```
Project (Phase 2)
   └──→ CaseStudy (projectId nullable FK, onDelete: SetNull)
            └──→ CaseStudyMetric[] (caseStudyId FK, onDelete: Cascade)

Testimonial (Phase 2, extended)
   - avatarUrl added (optional)
   - authorCompany now optional

CvAsset (standalone, no FK relations)

Article (standalone, no FK relations)
OpenSourceContribution (standalone, no FK relations)
Talk (standalone, no FK relations)
SectionVisibility (standalone, keyed by section name)
```

---

## Summary of Schema Changes for Migration

```sql
-- 1. Extend case_studies
ALTER TABLE case_studies ADD COLUMN slug VARCHAR(150);
ALTER TABLE case_studies ADD COLUMN title VARCHAR(200) NOT NULL DEFAULT 'Untitled';
ALTER TABLE case_studies ALTER COLUMN "projectId" DROP NOT NULL;
ALTER TABLE case_studies ADD COLUMN "architectureNotes" TEXT;
ALTER TABLE case_studies ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE case_studies ADD COLUMN published BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE case_studies ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT TRUE;
UPDATE case_studies SET slug = id WHERE slug IS NULL;
ALTER TABLE case_studies ADD CONSTRAINT case_studies_slug_key UNIQUE (slug);
CREATE INDEX idx_case_studies_query ON case_studies (published, "isVisible", "displayOrder" ASC);
-- Change FK onDelete to SET NULL
ALTER TABLE case_studies DROP CONSTRAINT IF EXISTS "case_studies_projectId_fkey";
ALTER TABLE case_studies ADD CONSTRAINT "case_studies_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES projects(id) ON DELETE SET NULL;

-- 2. Extend testimonials
ALTER TABLE testimonials ADD COLUMN "avatarUrl" VARCHAR(500);
ALTER TABLE testimonials ALTER COLUMN "authorCompany" DROP NOT NULL;

-- 3. New tables
CREATE TABLE case_study_metrics (
  id TEXT PRIMARY KEY,
  "caseStudyId" TEXT NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  value VARCHAR(100) NOT NULL,
  unit VARCHAR(50),
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_case_study_metrics ON case_study_metrics ("caseStudyId", "displayOrder" ASC);

CREATE TABLE cv_assets (
  id TEXT PRIMARY KEY,
  "fileName" VARCHAR(255) NOT NULL,
  "storageKey" VARCHAR(500) NOT NULL,
  "fileSize" INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL
);

CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  summary TEXT NOT NULL,
  "externalUrl" VARCHAR(500) NOT NULL,
  "publishedAt" TIMESTAMPTZ,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  "isVisible" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_articles_query ON articles (published, "isVisible", "displayOrder" ASC);

CREATE TABLE open_source_contributions (
  id TEXT PRIMARY KEY,
  "projectName" VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  "contributionType" VARCHAR(100) NOT NULL,
  "repositoryUrl" VARCHAR(500),
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  "isVisible" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_oss_query ON open_source_contributions (published, "isVisible", "displayOrder" ASC);

CREATE TABLE talks (
  id TEXT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  "eventName" VARCHAR(200) NOT NULL,
  "talkDate" TIMESTAMPTZ NOT NULL,
  summary TEXT NOT NULL,
  "recordingUrl" VARCHAR(500),
  "slidesUrl" VARCHAR(500),
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  "isVisible" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_talks_query ON talks (published, "isVisible", "displayOrder" ASC);

CREATE TABLE section_visibility (
  id TEXT PRIMARY KEY,
  section VARCHAR(50) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  "updatedAt" TIMESTAMPTZ NOT NULL,
  CONSTRAINT section_visibility_section_key UNIQUE (section)
);
```

**Migration command**: `npx prisma migrate dev --name phase4_advanced_portfolio`
