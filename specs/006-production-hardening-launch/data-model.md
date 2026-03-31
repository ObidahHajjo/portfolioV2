# Data Model: Phase 5 - Production Hardening and Launch

**Branch**: `006-production-hardening-launch` | **Date**: 2026-03-31
**ORM**: Prisma 6.x | **Database**: PostgreSQL 16

---

## Overview

Phase 5 extends one existing model and introduces four new models.

| Change | Model               | Type                                 | Action                                           |
| ------ | ------------------- | ------------------------------------ | ------------------------------------------------ |
| Extend | `SeoMetadata`       | Existing singleton/list by page slug | Add canonical URL override                       |
| New    | `ContactSubmission` | Event/Audit                          | Persist contact attempts and delivery outcomes   |
| New    | `AnalyticsEvent`    | Event                                | Persist anonymized page-view events              |
| New    | `ErrorEvent`        | Event                                | Persist runtime error telemetry                  |
| New    | `ErrorAlert`        | Event/Audit                          | Persist threshold alert sends and cooldown state |

No existing Phase 1-4 entities are removed.

---

## Model Extension: SeoMetadata

`SeoMetadata` already stores title/description/OG fields per page. Phase 5 adds canonical URL support required by FR-001.

### Schema Delta

```prisma
model SeoMetadata {
  id              String   @id @default(cuid())
  pageSlug        String   @unique @db.VarChar(100)
  pageTitle       String   @db.VarChar(70)
  metaDescription String   @db.VarChar(160)
  keywords        String[]
  ogTitle         String?  @db.VarChar(70)
  ogDescription   String?  @db.VarChar(200)
  ogImageUrl      String?  @db.VarChar(500)
  canonicalUrl    String?  @db.VarChar(500) // NEW
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("seo_metadata")
}
```

### Validation Rules

- `canonicalUrl`: optional, valid absolute URL, max 500 chars
- If `canonicalUrl` is null, runtime falls back to `NEXT_PUBLIC_APP_URL + pagePath`
- `og*` fields remain optional; runtime falls back to `pageTitle`/`metaDescription`

---

## New Model: ContactSubmission

Stores validated contact form attempts and delivery outcomes.

### Schema

```prisma
enum ContactSubmissionStatus {
  DELIVERED
  FAILED
  RATE_LIMITED
}

model ContactSubmission {
  id            String                  @id @default(cuid())
  senderName    String                  @db.VarChar(120)
  senderEmail   String                  @db.VarChar(254)
  message       String                  @db.Text
  sourceIpHash  String                  @db.VarChar(64)
  userAgentHash String?                 @db.VarChar(64)
  status        ContactSubmissionStatus @default(DELIVERED)
  failureReason String?                 @db.VarChar(500)
  createdAt     DateTime                @default(now())

  @@index([sourceIpHash, createdAt])
  @@index([status, createdAt])
  @@map("contact_submissions")
}
```

### Validation Rules

- `senderName`: required, trim, min 2, max 120
- `senderEmail`: required RFC-valid email, max 254
- `message`: required, trim, min 10, max 5000; preserve Unicode safely
- `sourceIpHash`: required SHA-256 hash string (hex length 64), never raw IP

### Lifecycle

1. Incoming request is validated with Zod.
2. Rate limit check counts prior `DELIVERED` + `FAILED` submissions from same `sourceIpHash` in the last 60 minutes.
3. If count >= 5, create `RATE_LIMITED` record and return `429`.
4. If under limit, attempt SMTP delivery:
   - Success -> create `DELIVERED` record.
   - Failure -> create `FAILED` record and return fallback email in response.

---

## New Model: AnalyticsEvent

Stores anonymized page-view events for admin reporting.

### Schema

```prisma
model AnalyticsEvent {
  id           String   @id @default(cuid())
  pagePath     String   @db.VarChar(300)
  referrerHost String?  @db.VarChar(255)
  sessionHash  String   @db.VarChar(64)
  createdAt    DateTime @default(now())

  @@index([createdAt])
  @@index([pagePath, createdAt])
  @@index([referrerHost, createdAt])
  @@index([sessionHash, createdAt])
  @@map("analytics_events")
}
```

### Validation Rules

- `pagePath`: required, must start with `/`, max 300
- `referrerHost`: optional host only (no full URL persistence), max 255
- `sessionHash`: required SHA-256 hash from `day + ip + userAgent + ANALYTICS_SALT`

### Privacy Constraints

- No raw IP address, full user-agent, or cookie identifier is stored.
- Hash rotates daily by including UTC date in hash input.

---

## New Model: ErrorEvent

Stores captured runtime errors from public site and admin portal.

### Schema

```prisma
enum ErrorSurface {
  PUBLIC
  ADMIN
  API
}

model ErrorEvent {
  id           String       @id @default(cuid())
  surface      ErrorSurface
  pagePath     String?      @db.VarChar(300)
  message      String       @db.Text
  stackPreview String?      @db.Text
  fingerprint  String?      @db.VarChar(100)
  createdAt    DateTime     @default(now())

  @@index([surface, createdAt])
  @@index([createdAt])
  @@index([fingerprint, createdAt])
  @@map("error_events")
}
```

### Validation Rules

- `surface`: required enum (`PUBLIC`, `ADMIN`, `API`)
- `pagePath`: optional, max 300
- `message`: required, min 1, max 4000
- `stackPreview`: optional, truncated to safe length (for storage and email)

---

## New Model: ErrorAlert

Tracks threshold alert emails to enforce cooldown and avoid duplicate notifications.

### Schema

```prisma
enum AlertDeliveryStatus {
  SENT
  FAILED
}

model ErrorAlert {
  id             String              @id @default(cuid())
  windowStart    DateTime
  windowEnd      DateTime
  eventCount     Int
  deliveryStatus AlertDeliveryStatus
  failureReason  String?             @db.VarChar(500)
  createdAt      DateTime            @default(now())

  @@index([windowStart, windowEnd])
  @@index([deliveryStatus, createdAt])
  @@map("error_alerts")
}
```

### Lifecycle

1. Each persisted `ErrorEvent` triggers a threshold check: count events in `now - 10 minutes`.
2. If count >= 3 and no `SENT` alert exists with overlapping window, send alert email.
3. Persist `ErrorAlert` as `SENT` or `FAILED` with failure reason.
4. Alert failures do not throw into user-facing request paths.

---

## Relationship and Query Notes

- `ContactSubmission`, `AnalyticsEvent`, `ErrorEvent`, and `ErrorAlert` are independent event tables; no FK joins required for core flows.
- Admin analytics reporting queries aggregate from `AnalyticsEvent` only.
- Error alerting reads from `ErrorEvent`, writes to `ErrorAlert`.

---

## Migration Plan

Single migration name: `phase5_production_hardening_launch`

Expected SQL operations:

1. `ALTER TABLE seo_metadata ADD COLUMN canonicalUrl VARCHAR(500);`
2. Create enums: `ContactSubmissionStatus`, `ErrorSurface`, `AlertDeliveryStatus`
3. Create new tables and indexes for:
   - `contact_submissions`
   - `analytics_events`
   - `error_events`
   - `error_alerts`

Rollback safety:

- No destructive column drops in this migration.
- Existing Phase 1-4 read paths remain valid after migration.
