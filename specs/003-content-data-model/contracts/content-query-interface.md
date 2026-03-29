# Contract: Content Query Interface

**Feature Branch**: `003-content-data-model`
**Date**: 2026-03-29
**Applies to**: All public-facing data access (FR-017)

---

## Standard Published+Visible Query (FR-017)

All list entity queries serving public routes MUST use the following filter and ordering:

```typescript
// Canonical filter for all public list queries
const PUBLIC_FILTER = {
  where: {
    published: true,
    isVisible: true,
  },
  orderBy: [
    { displayOrder: 'asc' },
    { createdAt: 'asc' },       // tiebreaker: insertion order
  ],
} as const;
```

### Per-Entity Public Query Helpers

```typescript
// src/lib/content/queries.ts

import { prisma } from '@/lib/prisma';

// Generic helper — returns typed array, empty array if no results
export async function getPublishedVisible<T>(
  entity: 'socialLink' | 'experience' | 'skill' | 'project' | 'testimonial',
  include?: object
): Promise<T[]> {
  // @ts-expect-error — dynamic access is safe here; entity is enumerated
  return prisma[entity].findMany({
    where: { published: true, isVisible: true },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    ...(include ? { include } : {}),
  });
}

// Projects with skills
export async function getPublishedProjects() {
  return prisma.project.findMany({
    where: { published: true, isVisible: true },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      skills: { include: { skill: true } },
      caseStudy: true,
      mediaAsset: true,
    },
  });
}

// Singleton accessor — always returns the one record (upsert ensures it exists)
export async function getSingleton<T>(
  entity: 'profile' | 'hero' | 'contactSettings'
): Promise<T> {
  // @ts-expect-error — dynamic access is safe; entity is enumerated
  return prisma[entity].findUniqueOrThrow({
    where: { singletonKey: 'singleton' },
  });
}

// SEO metadata by route
export async function getSeoMetadata(pageSlug: string) {
  return prisma.seoMetadata.findUnique({
    where: { pageSlug },
  });
}
```

## Query Contract Rules

1. **Public routes MUST NOT** call `findMany` without `where: { published: true, isVisible: true }` on list entities.

2. **Empty results** MUST be handled gracefully — `findMany` returns `[]`, never throws. Public UI sections with zero results render an empty/hidden state (Principle VII).

3. **Singleton access** uses `findUniqueOrThrow` with `{ where: { singletonKey: "singleton" } }`. If the singleton does not exist (e.g., fresh install), the caller MUST handle the thrown error with a fallback or setup redirect.

4. **Admin routes** MAY query all records without the `published/isVisible` filter.

5. **No raw SQL** for public content queries — all queries go through Prisma client for type safety and injection prevention.

## Zod Validation Schemas (Phase 3 admin API)

These schemas define the server-side validation contract for admin create/update operations. They are defined here as the authoritative contract; implementation is Phase 3.

```typescript
import { z } from 'zod';

export const ExperienceSchema = z.object({
  company: z.string().min(1).max(150),
  role: z.string().min(1).max(150),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  description: z.string().min(10),
  highlights: z.array(z.string().max(300)).max(20).optional(),
  displayOrder: z.number().int().min(0),
  published: z.boolean(),
  isVisible: z.boolean(),
}).refine(
  (data) => !data.endDate || data.endDate >= data.startDate,
  { message: 'endDate must be after startDate', path: ['endDate'] }
);

export const ProjectSchema = z.object({
  title: z.string().min(1).max(150),
  summary: z.string().min(10),
  repoUrl: z.string().url().max(500).optional(),
  demoUrl: z.string().url().max(500).optional(),
  mediaAssetId: z.string().cuid().optional(),
  displayOrder: z.number().int().min(0),
  published: z.boolean(),
  isVisible: z.boolean(),
  skillIds: z.array(z.string().cuid()),
});

export const SkillSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  displayOrder: z.number().int().min(0),
  published: z.boolean(),
  isVisible: z.boolean(),
});

export const SeoMetadataSchema = z.object({
  pageSlug: z.string().regex(/^\/[\w/-]*$/).max(100),
  pageTitle: z.string().min(1).max(70),
  metaDescription: z.string().min(1).max(160),
  keywords: z.array(z.string().max(50)).max(10).optional(),
  ogTitle: z.string().max(70).optional(),
  ogDescription: z.string().max(200).optional(),
  ogImageUrl: z.string().url().max(500).optional(),
});

export const MediaAssetSchema = z.object({
  fileName: z.string().min(1).max(255),
  storageUrl: z.string().url().max(500),
  fileType: z.string().regex(/^\w+\/[\w.+-]+$/).max(50),
  ownerType: z.enum(['project', 'case_study', 'profile', 'testimonial']),
  ownerId: z.string().cuid(),
});
```
