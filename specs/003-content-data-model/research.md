# Research: Phase 2 — Content Architecture & Data Model

**Feature Branch**: `003-content-data-model`
**Date**: 2026-03-29
**Status**: Complete — all NEEDS CLARIFICATION items resolved

---

## R-001: Singleton Enforcement Pattern

**Question**: How should Profile, Hero, and ContactSettings be constrained to exactly one row each?

**Decision**: Application-layer upsert using a `singletonKey String @unique @default("singleton")` column. The application always calls `prisma.profile.upsert({ where: { singletonKey: "singleton" }, ... })`.

**Rationale**:
- Prisma Migrate does not support CHECK constraints with subqueries, making DB-level row-count constraints impractical
- A `@unique` boolean flag (`isSingleton Boolean @unique @default(true)`) is an alternative but semantically awkward
- `singletonKey` with a known constant value is idiomatic, readable, and prevents accidental duplicate inserts at the DB level via the unique index
- No trigger or stored procedure required

**Alternatives considered**:
- DB CHECK constraint (`CHECK (count(*) <= 1)`) — not supported in Prisma Migrate declaratively
- Application-only guard (no DB constraint) — rejected; a DB constraint is required as the last line of defense

---

## R-002: Experience Highlights Storage

**Question**: Should `Experience.highlights` be a separate `ExperienceHighlight` table or a JSON/text array?

**Decision**: `String[]` PostgreSQL text array (Prisma `String[]`).

**Rationale**:
- Highlights are an ordered list of short strings (bullet points), not entities with their own lifecycle
- They are always read together with their parent Experience record — no independent query need
- A join table would add a migration, a model, and extra query joins for no functional benefit in Phase 2 or 3
- If rich highlights (with metadata, ordering controls, media) are needed in Phase 4, a migration to a separate table remains straightforward

**Alternatives considered**:
- `ExperienceHighlight` join table — rejected as premature; highlights have no independent identity
- `Json` column — rejected; `String[]` provides better type safety and native PG array operators

---

## R-003: Project ↔ Skill Association

**Question**: Should the Project–Skill relationship use a join table or remain as `String[]` (as in Phase 1)?

**Decision**: Explicit `ProjectSkill` join table with composite primary key `(projectId, skillId)`.

**Rationale**:
- FR-010 and SC-004 require that "the system stores the association and can return the project with its linked skills in a single query"
- A `String[]` array cannot enforce referential integrity — a skill can be deleted while still referenced
- The join table enables Prisma `include: { skills: { include: { skill: true } } }` queries
- `onDelete: Cascade` on the project side means deleting a project automatically removes its skill associations
- `onDelete: Restrict` on the skill side prevents deleting a skill that is associated with a project

**Alternatives considered**:
- `technologies String[]` (Phase 1 approach) — rejected; violates referential integrity requirement (SC-004, FR-018)
- Prisma implicit many-to-many (`Project[] skills Skill[]`) — rejected; explicit join table is preferred for Phase 3 admin CRUD where associations are managed individually

---

## R-004: SEO Metadata Page Linking

**Question**: Should `SeoMetadata` link to content entities via FK or by page slug string?

**Decision**: `pageSlug String @unique` — a route-path string (e.g., `/`, `/projects`, `/experience`).

**Rationale**:
- SEO metadata is keyed to a public URL path, not to a content entity ID
- Some routes (e.g., `/`) have no corresponding single content entity
- A FK-based approach would require a polymorphic relation (unsupported natively by Prisma) or a separate FK per entity type (N columns for N entities)
- The `pageSlug` unique constraint ensures one SEO record per route, queryable by `prisma.seoMetadata.findUnique({ where: { pageSlug: "/" } })`

**Alternatives considered**:
- Polymorphic FK with `ownerType + ownerId` — rejected; SEO is route-scoped, not entity-scoped
- Separate SEO fields on each content entity — rejected; centralised `SeoMetadata` table is cleaner and matches Phase 5 admin management scope

---

## R-005: MediaAsset Ownership Reference

**Question**: Should `MediaAsset` use a typed FK back to owning entities, or a polymorphic string-based reference?

**Decision**: Polymorphic string reference: `ownerType String` (e.g., `"project"`, `"profile"`) + `ownerId String`. `Project` holds a direct `mediaAssetId String?` FK to `MediaAsset` for its primary image.

**Rationale**:
- Prisma does not support polymorphic FK relations natively
- Binary assets may be attached to multiple entity types (Project, CaseStudy, Profile avatar) — a separate FK column per entity type would require schema changes each time a new entity type needs media
- `ownerType/ownerId` provides "find all assets for this entity" lookups as application-layer queries
- `Project.mediaAssetId` provides a direct, typed FK for the common case of a project's primary image, supporting efficient `include: { mediaAsset: true }` Prisma queries

**Alternatives considered**:
- One FK column per entity type on `MediaAsset` — rejected; bloats the table and requires migrations per new entity
- No FK from `Project` to `MediaAsset`, query only via `ownerType/ownerId` — rejected; loses Prisma relation type safety for the primary use case

---

## R-006: Display Order Tie-Breaking

**Question**: When two content items share the same `displayOrder` integer, how is the tie resolved?

**Decision**: Secondary sort by `createdAt ASC` (insertion order). No DB-level uniqueness constraint on `displayOrder`.

**Rationale**:
- A unique constraint on `displayOrder` would make reordering operations (e.g., swap two items) require transactional intermediate values or a full-table renumber
- `createdAt ASC` as a tiebreaker is stable, deterministic, and requires no additional column
- The Phase 3 admin portal will manage ordering via an integer field; the UI will prevent duplicate values visually

**Alternatives considered**:
- `@unique` on `displayOrder` — rejected; makes admin reorder operations unnecessarily complex
- Fractional ordering (e.g., `displayOrder Float`) — rejected; premature complexity for Phase 2

---

## R-007: Project Deletion and CaseStudy Orphan Handling

**Question**: When a Project is deleted, should its CaseStudy be cascade-deleted or should the delete be blocked?

**Decision**: `onDelete: Restrict` on the `CaseStudy.project` FK. Deleting a Project with an associated CaseStudy is blocked at the DB level.

**Rationale**:
- FR-018 says the system must "handle or block" orphaned case studies — blocking is the safer default
- An accidental project deletion cannot silently destroy associated case study content
- The Phase 3 admin portal UI will guide the admin to first delete or unlink the case study before deleting the project

**Alternatives considered**:
- `onDelete: Cascade` — rejected; risks silent data loss of case study content when a project is deleted
- Application-layer guard only — rejected; a DB FK constraint is the authoritative enforcement layer

---

## R-008: Phase 1 Schema Evolution Strategy

**Question**: The Phase 1 schema has `Hero`, `About`, `Skill`, `ExperienceEntry`, `Project`, `ContactReference`. How are these evolved for Phase 2 without breaking Phase 1 functionality?

**Decision**: Prisma Migrate generates a single Phase 2 migration that:
1. Renames `experience_entries` → `experiences` (new model); drops old table
2. Drops `abouts` table; creates `profiles` table (bio moves to Profile.bio)
3. Drops `contact_references` table; creates `social_links` table
4. Alters `heroes` table: rename/add columns for Phase 2 spec
5. Alters `skills` table: add `proficiency`, `published`, `isVisible`
6. Alters `projects` table: add `published`, `isVisible`, `mediaAssetId`; drop `technologies` array
7. Creates new tables: `project_skills`, `case_studies`, `testimonials`, `contact_settings`, `seo_metadata`, `media_assets`

Phase 1 UI components that query these tables will need corresponding data-layer updates in Phase 3, but no Phase 1 functionality is in production yet (dev environment only), so breaking changes are acceptable.

**Alternatives considered**:
- Additive-only migration (keep Phase 1 tables) — rejected; creates schema duplication and confusion
- Multiple small migrations — rejected; Phase 2 is a planning-only phase; the single migration runs at implementation time

---

## R-009: CaseStudy Lifecycle State

**Question**: Does `CaseStudy` need its own `published` and `isVisible` flags?

**Decision**: No. `CaseStudy` inherits visibility from its parent `Project`. A case study is shown if and only if `project.published = true AND project.isVisible = true`. No separate lifecycle flags on `CaseStudy`.

**Rationale**:
- The spec (FR-011) does not mention a publish state for CaseStudy
- A case study is conceptually part of its parent project — it has no independent public presence
- Adding duplicate lifecycle flags on CaseStudy would require coordinating two sets of flags per project

**Alternatives considered**:
- Independent `published`/`isVisible` on CaseStudy — rejected; over-engineering for Phase 2; case study visibility is entirely project-dependent

---

## R-010: SocialLink Publish State

**Question**: FR-001 says "all user-facing content entities" need draft/published lifecycle. FR-008 only mentions a visibility toggle for SocialLinks. Should SocialLinks have `published`?

**Decision**: Yes — all list entities including `SocialLink` and `Skill` get both `published Boolean @default(false)` and `isVisible Boolean @default(true)` for consistency with FR-001.

**Rationale**:
- FR-001 is explicit and non-qualified: "MUST support draft and published lifecycle states for ALL user-facing content entities"
- Uniform treatment simplifies the admin portal (Phase 3) — every list entity has the same controls
- The query contract (`getPublishedVisible`) applies identically across all list entities

**Alternatives considered**:
- Visibility-only (no `published`) for SocialLinks and Skills — rejected; contradicts FR-001
