# Data Model: Phase 2 — Content Architecture

**Feature Branch**: `003-content-data-model`
**Date**: 2026-03-29
**ORM**: Prisma 5 | **Database**: PostgreSQL 16

---

## Entity Overview

| Entity | Table | Type | Lifecycle | FR Ref |
|---|---|---|---|---|
| Profile | `profiles` | Singleton | — | FR-006 |
| Hero | `heroes` | Singleton | — | FR-007 |
| ContactSettings | `contact_settings` | Singleton | — | FR-014 |
| SocialLink | `social_links` | List | published + isVisible | FR-008 |
| Experience | `experiences` | List | published + isVisible | FR-009 |
| Project | `projects` | List | published + isVisible | FR-010 |
| CaseStudy | `case_studies` | Child of Project | inherits from Project | FR-011 |
| Skill | `skills` | List | published + isVisible | FR-012 |
| Testimonial | `testimonials` | List | published + isVisible | FR-013 |
| SeoMetadata | `seo_metadata` | Per-route | — | FR-015 |
| MediaAsset | `media_assets` | Registry | — | FR-016 |
| ProjectSkill | `project_skills` | Join | — | FR-010 |

---

## Cross-Cutting Field Conventions

All entities include:
- `id String @id @default(cuid())` — surrogate primary key
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

All **list entities** additionally include:
- `displayOrder Int @default(0)` — ascending sort for public display
- `published Boolean @default(false)` — draft (false) / published (true)
- `isVisible Boolean @default(true)` — visible (true) / hidden (false)

All **singleton entities** additionally include:
- `singletonKey String @unique @default("singleton")` — enforces one row; see [singleton-contract.md](./contracts/singleton-contract.md)

---

## Complete Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// SINGLETON ENTITIES
// ============================================================

model Profile {
  id           String   @id @default(cuid())
  singletonKey String   @unique @default("singleton")
  fullName     String   @db.VarChar(100)
  tagline      String   @db.VarChar(200)
  bio          String   @db.Text
  contactEmail String   @db.VarChar(254)
  avatarUrl    String?  @db.VarChar(500)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("profiles")
}

model Hero {
  id           String   @id @default(cuid())
  singletonKey String   @unique @default("singleton")
  headline     String   @db.VarChar(150)
  subHeadline  String   @db.VarChar(300)
  ctaText      String   @db.VarChar(50)
  ctaHref      String   @db.VarChar(500)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("heroes")
}

model ContactSettings {
  id           String   @id @default(cuid())
  singletonKey String   @unique @default("singleton")
  contactEmail String   @db.VarChar(254)
  formEnabled  Boolean  @default(true)
  ctaMessage   String   @db.VarChar(500)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("contact_settings")
}

// ============================================================
// LIST ENTITIES
// ============================================================

model SocialLink {
  id           String   @id @default(cuid())
  platform     String   @db.VarChar(50)
  url          String   @db.VarChar(500)
  displayOrder Int      @default(0)
  published    Boolean  @default(false)
  isVisible    Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("social_links")
}

model Experience {
  id           String    @id @default(cuid())
  company      String    @db.VarChar(150)
  role         String    @db.VarChar(150)
  startDate    DateTime
  endDate      DateTime?
  description  String    @db.Text
  highlights   String[]
  displayOrder Int       @default(0)
  published    Boolean   @default(false)
  isVisible    Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@map("experiences")
}

model Skill {
  id           String         @id @default(cuid())
  name         String         @db.VarChar(100)
  category     String         @db.VarChar(100)
  proficiency  String?        @db.VarChar(50)
  displayOrder Int            @default(0)
  published    Boolean        @default(false)
  isVisible    Boolean        @default(true)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  projects     ProjectSkill[]

  @@unique([name, category])
  @@map("skills")
}

model Project {
  id           String         @id @default(cuid())
  title        String         @db.VarChar(150)
  summary      String         @db.Text
  repoUrl      String?        @db.VarChar(500)
  demoUrl      String?        @db.VarChar(500)
  mediaAssetId String?
  displayOrder Int            @default(0)
  published    Boolean        @default(false)
  isVisible    Boolean        @default(true)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  skills       ProjectSkill[]
  caseStudy    CaseStudy?
  mediaAsset   MediaAsset?    @relation(fields: [mediaAssetId], references: [id], onDelete: SetNull)

  @@map("projects")
}

model ProjectSkill {
  projectId    String
  skillId      String

  project      Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  skill        Skill    @relation(fields: [skillId], references: [id], onDelete: Restrict)

  @@id([projectId, skillId])
  @@map("project_skills")
}

model CaseStudy {
  id            String   @id @default(cuid())
  projectId     String   @unique
  challenge     String   @db.Text
  solution      String   @db.Text
  outcomes      String   @db.Text
  mediaAssetIds String[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  project       Project  @relation(fields: [projectId], references: [id], onDelete: Restrict)

  @@map("case_studies")
}

model Testimonial {
  id            String   @id @default(cuid())
  authorName    String   @db.VarChar(100)
  authorRole    String   @db.VarChar(150)
  authorCompany String   @db.VarChar(150)
  quote         String   @db.Text
  displayOrder  Int      @default(0)
  published     Boolean  @default(false)
  isVisible     Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("testimonials")
}

// ============================================================
// METADATA & ASSET ENTITIES
// ============================================================

model SeoMetadata {
  id              String   @id @default(cuid())
  pageSlug        String   @unique @db.VarChar(100)
  pageTitle       String   @db.VarChar(70)
  metaDescription String   @db.VarChar(160)
  keywords        String[]
  ogTitle         String?  @db.VarChar(70)
  ogDescription   String?  @db.VarChar(200)
  ogImageUrl      String?  @db.VarChar(500)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("seo_metadata")
}

model MediaAsset {
  id         String    @id @default(cuid())
  fileName   String    @db.VarChar(255)
  storageUrl String    @db.VarChar(500)
  fileType   String    @db.VarChar(50)
  ownerType  String    @db.VarChar(50)
  ownerId    String    @db.VarChar(36)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  projects   Project[]

  @@map("media_assets")
}
```

---

## Validation Rules

### Profile
| Field | Rule |
|---|---|
| `fullName` | Required; max 100 chars |
| `tagline` | Required; max 200 chars |
| `bio` | Required; min 10 chars |
| `contactEmail` | Required; valid email format; max 254 chars |
| `avatarUrl` | Optional; valid URL format; max 500 chars |

### Hero
| Field | Rule |
|---|---|
| `headline` | Required; max 150 chars |
| `subHeadline` | Required; max 300 chars |
| `ctaText` | Required; max 50 chars |
| `ctaHref` | Required; valid URL or path; max 500 chars |

### ContactSettings
| Field | Rule |
|---|---|
| `contactEmail` | Required; valid email format; max 254 chars |
| `formEnabled` | Required; boolean |
| `ctaMessage` | Required; max 500 chars |

### SocialLink
| Field | Rule |
|---|---|
| `platform` | Required; max 50 chars |
| `url` | Required; valid URL; max 500 chars |
| `displayOrder` | Required; integer ≥ 0 |

### Experience
| Field | Rule |
|---|---|
| `company` | Required; max 150 chars |
| `role` | Required; max 150 chars |
| `startDate` | Required; valid date; must be before `endDate` if set |
| `endDate` | Optional; must be after `startDate` |
| `description` | Required; min 10 chars |
| `highlights` | Optional; each item max 300 chars; max 20 items |

### Project
| Field | Rule |
|---|---|
| `title` | Required; max 150 chars |
| `summary` | Required; min 10 chars |
| `repoUrl` | Optional; valid URL; max 500 chars |
| `demoUrl` | Optional; valid URL; max 500 chars |
| `mediaAssetId` | Optional; must reference an existing `MediaAsset.id` |

### CaseStudy
| Field | Rule |
|---|---|
| `projectId` | Required; must reference an existing, non-deleted `Project.id` |
| `challenge` | Required; min 10 chars |
| `solution` | Required; min 10 chars |
| `outcomes` | Required; min 10 chars |
| `mediaAssetIds` | Optional; each entry must reference an existing `MediaAsset.id` |

### Skill
| Field | Rule |
|---|---|
| `name` | Required; max 100 chars; unique within `category` |
| `category` | Required; max 100 chars |
| `proficiency` | Optional; one of: `"beginner"`, `"intermediate"`, `"advanced"`, `"expert"` |

### Testimonial
| Field | Rule |
|---|---|
| `authorName` | Required; max 100 chars |
| `authorRole` | Required; max 150 chars |
| `authorCompany` | Required; max 150 chars |
| `quote` | Required; min 10 chars |

### SeoMetadata
| Field | Rule |
|---|---|
| `pageSlug` | Required; unique; format: leading `/` + alphanumeric path; max 100 chars |
| `pageTitle` | Required; max 70 chars (Google title display limit) |
| `metaDescription` | Required; max 160 chars (Google snippet limit) |
| `keywords` | Optional; each item max 50 chars; max 10 items |
| `ogTitle` | Optional; max 70 chars |
| `ogDescription` | Optional; max 200 chars |
| `ogImageUrl` | Optional; valid URL; max 500 chars |

### MediaAsset
| Field | Rule |
|---|---|
| `fileName` | Required; max 255 chars |
| `storageUrl` | Required; valid URL (S3-compatible MinIO URL); max 500 chars |
| `fileType` | Required; MIME type format (e.g., `image/jpeg`); max 50 chars |
| `ownerType` | Required; one of: `"project"`, `"case_study"`, `"profile"`, `"testimonial"` |
| `ownerId` | Required; max 36 chars (cuid length) |

---

## Required Indexes

The following composite indexes support the standard published+visible query (FR-017) and must be created in the migration:

```sql
-- social_links
CREATE INDEX idx_social_links_query ON social_links (published, "isVisible", "displayOrder" ASC);

-- experiences
CREATE INDEX idx_experiences_query ON experiences (published, "isVisible", "displayOrder" ASC);

-- skills
CREATE INDEX idx_skills_query ON skills (published, "isVisible", "displayOrder" ASC);

-- projects
CREATE INDEX idx_projects_query ON projects (published, "isVisible", "displayOrder" ASC);

-- testimonials
CREATE INDEX idx_testimonials_query ON testimonials (published, "isVisible", "displayOrder" ASC);
```

In Prisma schema syntax, add to each list entity:
```prisma
@@index([published, isVisible, displayOrder])
```

---

## Relationship Diagram

```
Profile (singleton) ─────────────────── (no FK relations)
Hero (singleton) ────────────────────── (no FK relations)
ContactSettings (singleton) ─────────── (no FK relations)

SocialLink ──────────────────────────── (no FK relations)
Experience ──────────────────────────── (no FK relations)
Testimonial ─────────────────────────── (no FK relations)

Skill ←───────────┐
                  │  ProjectSkill (projectId, skillId) composite PK
Project ──────────┘
   │
   ├──→ MediaAsset (mediaAssetId FK, optional, onDelete: SetNull)
   │
   └──→ CaseStudy (projectId unique FK, onDelete: Restrict)

SeoMetadata ─────────────────────────── keyed by pageSlug (no FK)
MediaAsset ──────────────────────────── referenced by Project.mediaAssetId
```

---

## Migration Notes (Phase 1 → Phase 2)

The Phase 2 Prisma migration must handle the following Phase 1 schema changes:

| Phase 1 | Phase 2 Action |
|---|---|
| `heroes` table (`name`, `title`, `tagline`, `ctaLabel`, `ctaHref`) | Replace columns: `headline`, `subHeadline`, `ctaText`, `ctaHref`; add `singletonKey` |
| `abouts` table (`bio`) | Drop table; `bio` moves to `profiles.bio` |
| `skills` table | Add: `proficiency`, `published`, `isVisible`; add index |
| `experience_entries` table | Drop and recreate as `experiences`; add `highlights`, `published`, `isVisible` |
| `projects` table | Add: `published`, `isVisible`, `mediaAssetId`; drop `technologies String[]` |
| `contact_references` table | Drop table; recreate as `social_links` with `published`, `isVisible` |
| New tables | `profiles`, `contact_settings`, `project_skills`, `case_studies`, `testimonials`, `seo_metadata`, `media_assets` |

> **Note**: Phase 1 is a dev-only environment. No production data migration is required.
> The migration may use `DROP TABLE` freely for renamed/restructured tables.
