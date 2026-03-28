# Data Model: Phase 1 — Public Portfolio MVP

**Branch**: `002-public-portfolio-mvp` | **Date**: 2026-03-28

All models below map directly to the Key Entities defined in `spec.md`. Fields are expressed as Prisma schema types. This is the authoritative schema definition for Phase 1.

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Singleton: Hero ─────────────────────────────────────────────────────────
// Exactly one record is expected. If none exists, HeroSection is hidden.
model Hero {
  id           String   @id @default(cuid())
  name         String   // Developer's full name
  title        String   // Professional title (e.g., "Senior Software Engineer")
  tagline      String   // Short positioning statement (1-2 sentences)
  ctaLabel     String   // Primary CTA button label (e.g., "Get in touch")
  ctaHref      String   // CTA destination — email mailto: or anchor (#contact)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("heroes")
}

// ─── Singleton: About ─────────────────────────────────────────────────────────
// Exactly one record is expected. If none exists, AboutSection is hidden.
model About {
  id        String   @id @default(cuid())
  bio       String   @db.Text  // Full professional biography (supports multi-paragraph)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("abouts")
}

// ─── Skill ───────────────────────────────────────────────────────────────────
// Skills are grouped by category for display. displayOrder is per-category.
// If no Skill records exist, SkillsSection is hidden.
model Skill {
  id           String   @id @default(cuid())
  name         String   // Skill display name (e.g., "TypeScript", "PostgreSQL")
  category     String   // Grouping label (e.g., "Languages", "Frameworks", "Tools")
  displayOrder Int      @default(0)  // Sort order within the category group
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([name, category])
  @@map("skills")
}

// ─── Experience ───────────────────────────────────────────────────────────────
// Displayed in descending displayOrder (most recent first).
// If no ExperienceEntry records exist, ExperienceSection is hidden.
model ExperienceEntry {
  id           String    @id @default(cuid())
  company      String    // Company or organisation name
  role         String    // Job title
  startDate    DateTime  // Employment start date (stored as date, time ignored)
  endDate      DateTime? // Null = current role ("Present")
  description  String    @db.Text  // Responsibilities and achievements narrative
  displayOrder Int       @default(0)  // Higher = shown first (most recent)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@map("experience_entries")
}

// ─── Project ─────────────────────────────────────────────────────────────────
// At least one of repoUrl or demoUrl MUST be non-null (enforced in seed + app layer).
// If no Project records exist, ProjectsSection is hidden.
model Project {
  id           String   @id @default(cuid())
  title        String   // Project display name
  summary      String   @db.Text  // Short description (2-4 sentences)
  technologies String[] // Array of technology/domain labels (e.g., ["Next.js", "PostgreSQL"])
  repoUrl      String?  // GitHub repository URL (optional)
  demoUrl      String?  // Live demo URL (optional)
  displayOrder Int      @default(0)  // Higher = shown first
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("projects")
}

// ─── ContactReference ─────────────────────────────────────────────────────────
// One or more records. Each represents a contact method (email, LinkedIn, etc.).
// If no ContactReference records exist, ContactSection is hidden.
model ContactReference {
  id           String   @id @default(cuid())
  label        String   // Display label (e.g., "Email", "LinkedIn", "GitHub")
  href         String   // Full URL or mailto: link
  displayOrder Int      @default(0)  // Lower = shown first
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("contact_references")
}
```

---

## Entity Relationships

All Phase 1 entities are independent (no foreign keys between them). The data model is intentionally flat — relationships between entities (e.g., skills linked to a project) are introduced in Phase 2 when the content architecture is formally designed.

```text
Hero            (0..1 records)  — singleton
About           (0..1 records)  — singleton
Skill           (0..N records)  — grouped by `category` in application layer
ExperienceEntry (0..N records)  — ordered by `displayOrder` DESC
Project         (0..N records)  — ordered by `displayOrder` DESC
ContactReference(1..N records)  — ordered by `displayOrder` ASC
```

---

## Validation Rules

These rules are enforced at the application layer (Zod) in Phase 3+ for admin inputs. In Phase 1, they are enforced by the seed script.

| Model | Field | Rule |
|---|---|---|
| Hero | name | Non-empty string |
| Hero | title | Non-empty string |
| Hero | tagline | Non-empty string, max 300 chars |
| Hero | ctaHref | Must be a valid `mailto:` URI or anchor starting with `#` |
| About | bio | Non-empty string, min 50 chars |
| Skill | name | Non-empty string |
| Skill | category | Non-empty string |
| Skill | displayOrder | Integer ≥ 0 |
| ExperienceEntry | company | Non-empty string |
| ExperienceEntry | role | Non-empty string |
| ExperienceEntry | startDate | Valid date; must be before endDate if endDate present |
| ExperienceEntry | description | Non-empty string, min 20 chars |
| Project | title | Non-empty string |
| Project | summary | Non-empty string, min 20 chars |
| Project | technologies | Non-empty array, each element a non-empty string |
| Project | repoUrl / demoUrl | At least one must be a valid HTTPS URL |
| ContactReference | label | Non-empty string |
| ContactReference | href | Valid URL (https://) or valid mailto: URI |

---

## State Transitions

No state transitions in Phase 1. All seeded records are implicitly "published/active". Draft and publish states are introduced in Phase 2 (Content Architecture).

---

## Display Order Convention

- **ExperienceEntry**: `displayOrder` DESC — highest number displayed first (most recent role). Alternatively, seed in chronological order and reverse in query; `displayOrder` approach is preferred for Phase 3 admin drag-to-reorder compatibility.
- **Project**: `displayOrder` DESC — highest number displayed first (featured/primary projects).
- **Skill**: `displayOrder` ASC within each `category` group — lowest number displayed first.
- **ContactReference**: `displayOrder` ASC — primary contact method (e.g., email) at index 0.

---

## Seed Script Contract

See `contracts/seed-contract.md` for required seed data fields, example seed structure, and validation before `prisma db seed` is run.
