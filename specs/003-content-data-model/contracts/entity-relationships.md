# Contract: Entity Relationships & Referential Integrity

**Feature Branch**: `003-content-data-model`
**Date**: 2026-03-29
**Applies to**: All FK-constrained entity pairs (FR-018)

---

## Relationship Map

```
Project (1) ─────────── (0..1) CaseStudy
    │                         onDelete: Restrict
    │
Project (M) ─────────── (M) Skill
    │              via ProjectSkill join table
    │              Project onDelete: Cascade
    │              Skill onDelete: Restrict
    │
Project (M) ─────────── (0..1) MediaAsset
                         onDelete: SetNull
```

---

## FK Constraints

### Project → CaseStudy (`case_studies.projectId`)

| Property | Value |
|---|---|
| Cardinality | One Project : Zero-or-One CaseStudy |
| `projectId` nullable | No — `projectId` is required |
| `projectId` unique | Yes — one case study per project |
| `onDelete` | **Restrict** — deleting a project with a case study is blocked |
| `onUpdate` | Cascade |

**Enforcement rules**:
- A `CaseStudy` MUST NOT be created without a valid `projectId` referencing an existing `Project`
- A `Project` with an associated `CaseStudy` CANNOT be deleted — the admin must first delete the case study
- A `Project` without a case study MAY be deleted freely (cascade on `ProjectSkill` handles skill links)

### Project ↔ Skill (`project_skills`)

| Property | Value |
|---|---|
| Cardinality | Many Projects : Many Skills |
| Composite PK | `(projectId, skillId)` |
| `onDelete` (Project side) | **Cascade** — deleting a project removes all its skill associations |
| `onDelete` (Skill side) | **Restrict** — deleting a skill that is referenced by any project is blocked |

**Enforcement rules**:
- A `ProjectSkill` row MUST reference a valid `projectId` and `skillId`
- Deleting a `Skill` that appears in `ProjectSkill` is blocked — the admin must first unlink it from all projects
- Deleting a `Project` automatically removes all rows in `project_skills` for that project (Cascade)

### Project → MediaAsset (`projects.mediaAssetId`)

| Property | Value |
|---|---|
| Cardinality | Many Projects : One MediaAsset (optional) |
| `mediaAssetId` nullable | Yes — project image is optional |
| `onDelete` | **SetNull** — deleting a MediaAsset sets `projects.mediaAssetId = NULL` |

**Enforcement rules**:
- A `Project` MAY reference a `MediaAsset` for its primary image
- If the referenced `MediaAsset` is deleted, `projects.mediaAssetId` becomes `NULL` automatically
- The public query layer MUST handle `mediaAsset: null` gracefully — no image fallback is shown

---

## Deletion Decision Matrix

| Action | Blocked? | Side Effect |
|---|---|---|
| Delete `Project` with no CaseStudy | No | `project_skills` rows cascade-deleted |
| Delete `Project` with CaseStudy | **Yes — Restrict** | Admin must delete CaseStudy first |
| Delete `Skill` not linked to any Project | No | None |
| Delete `Skill` linked to one or more Projects | **Yes — Restrict** | Admin must unlink from all projects first |
| Delete `MediaAsset` referenced by a Project | No | `projects.mediaAssetId` → NULL |
| Delete `CaseStudy` | No | `Project` record unaffected |
| Delete `Profile` / `Hero` / `ContactSettings` | **Blocked by app layer** | Singletons must not be deleted |

---

## Orphan Prevention Rules

1. **No orphaned CaseStudy** — `projectId NOT NULL` enforced at DB level
2. **No orphaned ProjectSkill** — composite FK on both sides; cascade on project deletion
3. **No orphaned MediaAsset reference** — `SetNull` prevents dangling FK on project
4. **Singletons are never deleted** — application layer must reject delete operations on Profile, Hero, ContactSettings
