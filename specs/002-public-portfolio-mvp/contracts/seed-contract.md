# Seed Contract: Phase 1 — Public Portfolio MVP

**Branch**: `002-public-portfolio-mvp` | **Date**: 2026-03-28

This document defines the required structure and validation rules for `prisma/seed.ts`. The seed script is the sole mechanism for populating Phase 1 content. It must be idempotent (safe to re-run) and must validate all constraints before writing to the database.

---

## Seed Execution

```bash
# Run seed after migrations are applied:
npx prisma db seed

# Full reset + re-seed (development only):
npx prisma migrate reset
```

The `package.json` must include:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

---

## Required Seed Data

### Hero (exactly 1 record)

| Field | Required | Constraint |
|---|---|---|
| name | Yes | Non-empty string |
| title | Yes | Non-empty string |
| tagline | Yes | Non-empty, max 300 chars |
| ctaLabel | Yes | Non-empty string (e.g., "Get in touch") |
| ctaHref | Yes | Valid `mailto:email@example.com` or `#contact` anchor |

### About (exactly 1 record)

| Field | Required | Constraint |
|---|---|---|
| bio | Yes | Non-empty, min 50 chars; use `\n\n` to separate paragraphs |

### Skill (1..N records)

| Field | Required | Constraint |
|---|---|---|
| name | Yes | Non-empty; unique within its category |
| category | Yes | One of the declared category labels (consistent casing) |
| displayOrder | Yes | Integer ≥ 0; unique within its category |

Recommended categories (not enforced, but consistent):
- `"Languages"`
- `"Frameworks & Libraries"`
- `"Databases & Storage"`
- `"DevOps & Tooling"`
- `"Practices"`

### ExperienceEntry (1..N records)

| Field | Required | Constraint |
|---|---|---|
| company | Yes | Non-empty string |
| role | Yes | Non-empty string |
| startDate | Yes | Valid Date; must be before endDate if provided |
| endDate | No | Null = "Present" (current role) |
| description | Yes | Non-empty, min 20 chars |
| displayOrder | Yes | Integer ≥ 0; assign in reverse chronological order (most recent = highest number) |

### Project (1..N records)

| Field | Required | Constraint |
|---|---|---|
| title | Yes | Non-empty string |
| summary | Yes | Non-empty, min 20 chars |
| technologies | Yes | Non-empty string array; each element non-empty |
| repoUrl | Conditional | Required if demoUrl is null; must be valid HTTPS URL |
| demoUrl | Conditional | Required if repoUrl is null; must be valid HTTPS URL |
| displayOrder | Yes | Integer ≥ 0; featured/primary projects = highest numbers |

**Rule**: At least one of `repoUrl` or `demoUrl` must be non-null. The seed script must throw an error if both are null for any project record.

### ContactReference (1..N records)

| Field | Required | Constraint |
|---|---|---|
| label | Yes | Non-empty string (e.g., "Email", "LinkedIn", "GitHub") |
| href | Yes | Valid `https://` URL or valid `mailto:` URI |
| displayOrder | Yes | Integer ≥ 0; primary contact = 0 |

---

## Idempotency Pattern

The seed script must use `upsert` or `deleteMany` + `createMany` to be safely re-runnable. Recommended approach:

```ts
// Clear and re-seed (acceptable for Phase 1 — no referential constraints between models)
await db.hero.deleteMany()
await db.about.deleteMany()
await db.skill.deleteMany()
await db.experienceEntry.deleteMany()
await db.project.deleteMany()
await db.contactReference.deleteMany()

// Then createMany for each model
```

---

## Pre-Seed Validation Checklist

Before running `prisma db seed` in any environment, verify:

- [ ] Exactly 1 Hero record defined with all required fields
- [ ] Exactly 1 About record with bio ≥ 50 chars
- [ ] At least 1 Skill record per intended category; displayOrder values unique within category
- [ ] At least 1 ExperienceEntry; most recent role has highest displayOrder
- [ ] At least 1 Project; all projects have at least one of repoUrl / demoUrl as a valid HTTPS URL
- [ ] At least 1 ContactReference; primary contact has displayOrder = 0
- [ ] All dates are valid ISO strings (JS Date constructors accept them)
- [ ] No `DATABASE_URL` points to a production database when running `migrate reset`
