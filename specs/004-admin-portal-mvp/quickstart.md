# Quickstart: Phase 3 — Admin Portal MVP

**Feature Branch**: `004-admin-portal-mvp`
**Date**: 2026-03-29

This document describes how to set up the Phase 3 admin portal locally, run the required migration, and verify the environment before implementation begins.

---

## Prerequisites

- Phase 2 implementation complete and merged (all 11 content entities migrated)
- Docker Compose running (PostgreSQL 16 + MinIO containers)
- Node.js 20 LTS installed
- `.env.local` configured (see below)

---

## New Environment Variables (Phase 3)

Add the following to `.env.local` (never commit to source control):

```bash
# Admin credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=<bcrypt hash of your chosen password, cost 12>

# iron-session secret (min 32 chars, random)
SESSION_SECRET=<generate with: openssl rand -hex 32>
SESSION_COOKIE_NAME=admin_session

# MinIO (if not already set from Phase 2)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=portfolio-assets
```

### Generate a password hash

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('yourpassword', 12).then(console.log)"
```

---

## Phase 3 Migration

Phase 3 adds one table: `login_attempts`.

```bash
# From the project root
npx prisma migrate dev --name add_login_attempts_table
```

Verify migration applied:
```bash
npx prisma studio
# Check: login_attempts table exists with id, email, success, attemptAt columns
```

---

## MinIO Bucket Setup

If not already created in Phase 2:

```bash
# Using MinIO Client (mc) — connect to local MinIO
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/portfolio-assets
mc anonymous set download local/portfolio-assets
```

Or use the MinIO Console at `http://localhost:9001` (credentials: minioadmin / minioadmin) to create the `portfolio-assets` bucket manually.

---

## Install New Dependencies

```bash
npm install iron-session minio react-hook-form @hookform/resolvers
npx shadcn-ui@latest init
npx shadcn-ui@latest add form button input textarea label select dialog table badge toast
```

---

## Verify Setup

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/admin/login`
3. The login page should render
4. Submit valid credentials — you should reach the admin dashboard
5. Submit invalid credentials 5 times — the 6th attempt should return a lockout message
6. Check `login_attempts` table in Prisma Studio for recorded attempts

---

## File Structure (Phase 3 additions)

```text
src/
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx               # Admin shell (sidebar, nav)
│   │   ├── login/
│   │   │   └── page.tsx             # Login form
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Dashboard overview
│   │   ├── profile/page.tsx         # Singleton edit
│   │   ├── hero/page.tsx            # Singleton edit
│   │   ├── contact-settings/page.tsx
│   │   ├── social-links/
│   │   │   ├── page.tsx             # List
│   │   │   ├── new/page.tsx         # Create
│   │   │   └── [id]/page.tsx        # Edit
│   │   ├── experiences/[...]
│   │   ├── projects/[...]
│   │   ├── case-studies/[...]
│   │   ├── skills/[...]
│   │   ├── testimonials/[...]
│   │   ├── seo-metadata/[...]
│   │   └── media-assets/[...]
│   └── api/
│       └── admin/
│           ├── auth/
│           │   ├── login/route.ts
│           │   └── logout/route.ts
│           ├── session/
│           │   ├── status/route.ts
│           │   └── extend/route.ts
│           ├── dashboard/
│           │   └── summary/route.ts
│           ├── media-assets/
│           │   └── upload/route.ts
│           ├── profiles/route.ts
│           ├── heroes/route.ts
│           ├── contact-settings/route.ts
│           ├── social-links/
│           │   ├── route.ts         # GET list, POST create
│           │   └── [id]/
│           │       ├── route.ts     # GET, PATCH, DELETE
│           │       ├── publish/route.ts
│           │       ├── unpublish/route.ts
│           │       ├── hide/route.ts
│           │       ├── show/route.ts
│           │       └── order/route.ts
│           └── [...same pattern for other list entities]
├── lib/
│   ├── session.ts                   # iron-session config + getSession helper
│   ├── auth.ts                      # verifyCredentials, checkLockout, recordAttempt
│   └── minio.ts                     # MinIO client singleton
middleware.ts                        # Route protection for /admin/*
```
