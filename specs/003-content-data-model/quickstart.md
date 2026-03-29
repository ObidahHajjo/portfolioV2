# Quickstart: Phase 2 — Content Data Model

**Feature Branch**: `003-content-data-model`
**Date**: 2026-03-29

This runbook covers applying the Phase 2 schema migration and seeding initial data.

---

## Prerequisites

- Docker Compose running (`docker compose up -d db`)
- `.env` file with valid `DATABASE_URL` pointing to the local PostgreSQL instance
- Node.js 20 LTS installed
- `npm install` completed

---

## 1. Apply the Phase 2 Migration

```bash
# Generate and apply the migration (destructive — drops Phase 1 tables)
npx prisma migrate dev --name phase2-content-data-model

# Verify migration applied
npx prisma migrate status
```

> **Warning**: This migration drops `abouts`, `contact_references`, and `experience_entries` tables and restructures `heroes`, `projects`, `skills`. Phase 1 seed data will be lost. Re-run the seed after migrating.

---

## 2. Seed the Database

```bash
npx prisma db seed
```

The seed (`prisma/seed.ts`) creates:
- Profile singleton (placeholder values)
- Hero singleton (placeholder values)
- ContactSettings singleton (placeholder values)
- Sample skills across 2–3 categories
- Sample experience entries (published)
- Sample projects with skill associations

---

## 3. Verify Schema

```bash
# Open Prisma Studio to inspect data
npx prisma studio
```

Expected tables in Prisma Studio:
- `profiles`, `heroes`, `contact_settings` (singletons, each with 1 row after seed)
- `social_links`, `experiences`, `skills`, `projects`, `testimonials` (list entities)
- `project_skills` (join table)
- `case_studies`, `seo_metadata`, `media_assets` (empty after seed — populated in Phase 3)

---

## 4. Verify Public Query Contract

Run a quick smoke test from the Node REPL or a test file:

```typescript
import { prisma } from '@/lib/prisma';

// Should return only published + visible records
const skills = await prisma.skill.findMany({
  where: { published: true, isVisible: true },
  orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
});
console.assert(skills.every(s => s.published && s.isVisible));

// Singleton read
const profile = await prisma.profile.findUniqueOrThrow({
  where: { singletonKey: 'singleton' },
});
console.assert(profile.fullName.length > 0);
```

---

## 5. Common Operations

### Check if a singleton exists
```bash
npx prisma studio  # Open profiles table, confirm 1 row with singletonKey = "singleton"
```

### Reset and re-seed (development only)
```bash
npx prisma migrate reset  # Drops and recreates DB, re-runs all migrations + seed
```

### Generate updated Prisma client after schema change
```bash
npx prisma generate
```

---

## Troubleshooting

| Issue | Resolution |
|---|---|
| `P2025: Record not found` on singleton read | Run `npx prisma db seed` to create singleton records |
| `Foreign key constraint failed` on project delete | Delete or unlink associated CaseStudy first |
| `Unique constraint failed` on skill insert | `(name, category)` combination already exists — update instead |
| Migration fails with "table already exists" | Run `npx prisma migrate reset` to clean state |
