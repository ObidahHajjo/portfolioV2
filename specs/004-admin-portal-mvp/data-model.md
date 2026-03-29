# Data Model: Phase 3 — Admin Portal MVP

**Feature Branch**: `004-admin-portal-mvp`
**Date**: 2026-03-29
**ORM**: Prisma 6.x | **Database**: PostgreSQL 16

---

## Overview

Phase 3 does not introduce new content entities. All 11 content entities are defined in the Phase 2 data model (`specs/003-content-data-model/data-model.md`). This phase adds one operational table required by the admin authentication subsystem.

---

## New Entity: LoginAttempt

**Purpose**: Tracks authentication attempts per email address to enforce the 5-attempt, 15-minute lockout policy (FR-002a). Provides durability across process restarts — no in-memory state required.

### Prisma Schema Addition

```prisma
model LoginAttempt {
  id        String   @id @default(cuid())
  email     String   @db.VarChar(254)
  success   Boolean
  attemptAt DateTime @default(now())

  @@index([email, attemptAt])
  @@map("login_attempts")
}
```

### Field Reference

| Field | Type | Rules |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `email` | `String` VarChar(254) | The email address submitted on the login form |
| `success` | `Boolean` | `true` = successful login; `false` = failed attempt |
| `attemptAt` | `DateTime` | Auto-set to current timestamp on insert |

### Lockout Query

The lockout check is a single indexed read executed on every login attempt:

```sql
SELECT COUNT(*) FROM login_attempts
WHERE email = $1
  AND success = false
  AND attemptAt > NOW() - INTERVAL '15 minutes';
```

If the count is ≥ 5, the login is blocked and a lockout message is returned. No update is made to the record — each attempt is an immutable append.

### Record Pruning

`login_attempts` records older than 24 hours may be deleted asynchronously. This is a maintenance concern and does not block any application flow. A periodic cleanup can be added as a cron-style task or triggered on login.

---

## Admin Session (Runtime — not persisted in DB)

`iron-session` stores the session payload encrypted in an HTTP-only cookie. No `Session` table is required.

**Cookie name**: `admin_session` (configurable via env)
**Session payload**:
```typescript
{
  adminId: string;   // fixed identifier for the single admin account
  loginTime: number; // Unix timestamp of login
  expiresAt: number; // Unix timestamp of absolute expiry (loginTime + 28800s)
}
```

**TTL**: `maxAge: 28800` seconds (8 hours absolute). Not renewed on activity.

---

## No Other Schema Changes

All content entities (Profile, Hero, ContactSettings, SocialLink, Experience, Skill, Project, ProjectSkill, CaseStudy, Testimonial, SeoMetadata, MediaAsset) are defined and migrated in Phase 2. Phase 3 adds only the `login_attempts` table via a new Prisma migration.

**Migration name** (recommended): `add_login_attempts_table`
