# Research: Phase 3 — Admin Portal MVP

**Feature Branch**: `004-admin-portal-mvp`
**Date**: 2026-03-29
**Stack baseline**: Next.js 14.2.5, TypeScript 5.x, Prisma 6.x, PostgreSQL 16, MinIO, Tailwind CSS 3

---

## 1. Session Management

**Decision**: `iron-session` with HTTP-only cookie, `maxAge: 28800` (8 hours)

**Rationale**: `iron-session` is the Next.js core team's recommended approach for stateless, encrypted server-side sessions without a session store. It encrypts session data into the cookie payload using `iron.seal()`, provides HTTP-only and Secure flags by default, and enforces absolute timeouts via cookie `maxAge`. It is zero-external-store — no Redis, no Postgres session table required. The existing `.env` already references `SESSION_SECRET`, indicating this pattern was anticipated. Session payload: `{ adminId, loginTime, expiresAt }`.

**Alternatives considered**:
- `next-auth` v5: Overkill for single-credential login; adds ~200 KB bundle; designed for OAuth flows
- `lucia-auth`: Excellent but requires a dedicated `Session` table and adapter; adds complexity for a single-user system
- Manual JWT-in-cookie: Requires custom signing/encryption; `iron-session` is the battle-tested wrapper for this pattern

---

## 2. Admin Routing

**Decision**: Next.js Route Group `(admin)` with shared layout + `middleware.ts` for route protection

**Rationale**: The App Router route group pattern places all admin pages under `src/app/(admin)/` with a shared `layout.tsx` that provides the admin shell (sidebar, nav). A single `middleware.ts` at the project root intercepts all requests matching `/admin/*`, checks for a valid session cookie, and redirects unauthenticated requests to the login page before any layout renders. This is the canonical Next.js 14 pattern for protecting a route subtree — DRY, efficient, and easy to extend.

**Alternatives considered**:
- Middleware-only (no route group): Works but loses the ability to share admin layout state across routes cleanly
- In-page session checks: Too late in the render cycle; leaks partial HTML before auth is verified

---

## 3. Login Rate Limiting / Lockout

**Decision**: PostgreSQL-backed `LoginAttempt` table; 5 failed attempts within 15 minutes triggers a 15-minute lockout

**Rationale**: An in-memory Map is lost on process restart and does not survive redeployment — unacceptable on a self-hosted VPS. PostgreSQL is already the project's persistence layer and can durably store login events. A single indexed query per login request (`SELECT COUNT(*) WHERE email = ? AND attemptAt > now() - interval '15 minutes' AND success = false`) is negligible overhead. Old records can be pruned asynchronously. This approach requires no new infrastructure (no Redis, no additional container).

**New schema model required** (see data-model.md):
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

**Alternatives considered**:
- In-memory Map with cleanup: Data lost on restart; unsuitable for production VPS
- `express-rate-limit` style middleware: IP-based; too coarse; an attacker from one IP can target all accounts

---

## 4. Session Expiry Warning (5 Minutes Before)

**Decision**: Client-side polling — `setInterval` calling a lightweight `/api/admin/session/status` endpoint every 60 seconds; show warning modal at ≤ 5 minutes remaining

**Rationale**: `iron-session` encrypts the cookie opaquely; the client cannot decode the expiry timestamp directly. A server endpoint that unseals the cookie and returns `{ expiresAt: ISO string }` solves this with minimal overhead. A 60-second poll interval means the warning appears within 1 minute of the threshold — acceptable precision. Server-Sent Events would be more efficient at scale, but for a single-user admin portal, a periodic fetch is far simpler.

**Implementation note**: On warning display, offer a "Stay logged in" action that calls `/api/admin/session/extend` to re-issue a fresh 8-hour cookie. If the admin ignores the warning and the session expires, the next request redirects to login with a "session expired" message (FR-004b).

**Alternatives considered**:
- Server-Sent Events: Appropriate for multi-user real-time scenarios; overkill here
- JWT exp decode on client: Not applicable — `iron-session` is opaque to the client

---

## 5. MinIO Client

**Decision**: `minio` npm package (official MinIO Node.js SDK)

**Rationale**: The MinIO SDK is the purpose-built, officially maintained client for MinIO. It is lighter (~20 KB vs ~150 KB for AWS SDK v3), requires no AWS credential chains, and maps directly to the environment variables already present (`MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`). The AWS SDK works against MinIO's S3-compatible API but adds unnecessary complexity and weight.

**Alternatives considered**:
- `@aws-sdk/client-s3`: Works with MinIO but is designed for AWS; heavier; requires endpoint override configuration
- Presigned URL approach: Requires CORS configuration and client-side upload coordination; adds complexity without benefit for a server-to-server upload flow

---

## 6. Admin UI Components

**Decision**: `shadcn/ui` (Radix UI primitives + Tailwind CSS; copy-paste components)

**Rationale**: The project already uses Tailwind CSS 3. `shadcn/ui` provides accessible, pre-built form components (`Form`, `Input`, `Textarea`, `Button`, `Dialog`, `Table`, `Select`) that integrate natively with Tailwind. Components are copied into the project source — no framework lock-in. This significantly reduces the time to build 11 entity CRUD screens compared to building from raw Radix primitives or HTML inputs. `react-hook-form` + `zod` resolver integration (built into `shadcn/ui` `Form` component) matches the Zod validation schemas already defined in Phase 2.

**Alternatives considered**:
- Raw Radix UI primitives: Maximum control, 2-3x more development effort for the same output
- AdminJS / Refine: Auto-generates CRUD; too opinionated; conflicts with the custom content model; harder to customise validation UX
- Material UI: Heavy; less compatible with Tailwind utility-first approach

---

## 7. File Upload Parsing

**Decision**: Native `Request.formData()` in Next.js 14 App Router API routes

**Rationale**: Next.js 14 App Router natively supports `req.formData()` on the `Request` object, returning a standard `FormData` with `File` entries. No parser dependency is required. Files are buffered in memory, which is acceptable for the defined upload limit (10 MB). For a single-user admin portal, memory-buffered multipart handling is safe and idiomatic.

**Alternatives considered**:
- `formidable`: Battle-tested stream-to-disk parser; more appropriate for high-traffic or large-file scenarios; adds a dependency
- `busboy`: Low-level; full streaming control; more code to maintain for marginal gain at this scale

---

## Summary

| Area | Decision | New Dependency |
|---|---|---|
| Session management | `iron-session` | `iron-session` |
| Admin routing | Route Group `(admin)` + `middleware.ts` | none |
| Login rate limiting | PostgreSQL `LoginAttempt` table | none |
| Session expiry warning | Client polling + `/api/admin/session/status` | none |
| MinIO uploads | `minio` npm package | `minio` |
| Admin UI components | `shadcn/ui` + `react-hook-form` | `shadcn/ui`, `react-hook-form`, `@hookform/resolvers` |
| File upload parsing | Native `Request.formData()` | none |
