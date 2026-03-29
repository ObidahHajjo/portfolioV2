# Contract: Singleton Entity Enforcement

**Feature Branch**: `003-content-data-model`
**Date**: 2026-03-29
**Applies to**: Profile, Hero, ContactSettings (FR-019)

---

## Singleton Pattern

Singleton entities enforce exactly one row per table. The enforcement mechanism is:

1. **DB layer**: `singletonKey String @unique @default("singleton")` — a unique index prevents inserting a second row with the same key
2. **App layer**: All writes use `upsert` with `where: { singletonKey: "singleton" }` — never `create`

```typescript
// Correct — always upsert, never create
await prisma.profile.upsert({
  where: { singletonKey: 'singleton' },
  update: { fullName: 'Jane Doe', tagline: 'Full-Stack Engineer' },
  create: {
    singletonKey: 'singleton',
    fullName: 'Jane Doe',
    tagline: 'Full-Stack Engineer',
    bio: 'Bio text here',
    contactEmail: 'jane@example.com',
  },
});

// Wrong — do not use create() for singletons
// await prisma.profile.create({ data: { ... } }); // FORBIDDEN
```

---

## Singleton Read Pattern

```typescript
// Always use findUniqueOrThrow with singletonKey
const profile = await prisma.profile.findUniqueOrThrow({
  where: { singletonKey: 'singleton' },
});
```

If the singleton does not exist (first-run / fresh DB), `findUniqueOrThrow` throws `PrismaClientKnownRequestError` with code `P2025`. Callers on public routes MUST catch this and either:
- Return a safe default/fallback value, or
- Redirect to a setup page (admin context)

---

## Seeding

The initial seed (`prisma/seed.ts`) MUST create all three singletons with placeholder values so the application never encounters a missing singleton in development:

```typescript
await prisma.profile.upsert({
  where: { singletonKey: 'singleton' },
  update: {},
  create: {
    singletonKey: 'singleton',
    fullName: 'Your Name',
    tagline: 'Senior Software Engineer',
    bio: 'Update this bio via the admin portal.',
    contactEmail: 'you@example.com',
  },
});

await prisma.hero.upsert({
  where: { singletonKey: 'singleton' },
  update: {},
  create: {
    singletonKey: 'singleton',
    headline: 'Building things that matter.',
    subHeadline: 'Senior software engineer with X years of experience.',
    ctaText: 'View my work',
    ctaHref: '#projects',
  },
});

await prisma.contactSettings.upsert({
  where: { singletonKey: 'singleton' },
  update: {},
  create: {
    singletonKey: 'singleton',
    contactEmail: 'you@example.com',
    formEnabled: true,
    ctaMessage: 'Let\'s work together. Reach out below.',
  },
});
```

---

## Deletion Policy

Singletons MUST NOT be deleted. The admin portal (Phase 3) MUST NOT expose a delete action for Profile, Hero, or ContactSettings. Any admin API endpoint that receives a DELETE request for a singleton entity MUST return HTTP 405 Method Not Allowed.
