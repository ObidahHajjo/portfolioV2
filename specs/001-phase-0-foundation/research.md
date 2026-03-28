# Research: Phase 0 — Foundation & Constitution

**Branch**: `001-phase-0-foundation`
**Date**: 2026-03-28
**Status**: Complete — all decisions resolved

All technology choices for this phase were either mandated by `AGENTS.md` and
the constitution, or resolved during the clarification session. No NEEDS
CLARIFICATION items remained at plan time.

---

## Decision 1: Next.js App Router vs Pages Router

**Decision**: App Router (Next.js 14+)

**Rationale**: App Router is the current recommended approach by Vercel/Next.js
team. It provides React Server Components, nested layouts, and server-side
data fetching that are well-suited to a content-driven portfolio. The `/admin`
route group can enforce authentication at the layout level cleanly. Pages
Router is in maintenance mode and offers no advantages for a new project.

**Alternatives considered**:
- Pages Router — stable and familiar, but no RSC support, less clean layout
  composition, actively de-prioritised by Next.js team.
- Separate frontend (e.g., Vite + React) + standalone API — adds deployment
  complexity with no benefit for a single-owner application.

---

## Decision 2: ORM — Prisma

**Decision**: Prisma (mandated by constitution)

**Rationale**: Prisma provides a type-safe database client generated from the
schema, first-class PostgreSQL support, and a versioned migration system
(`prisma migrate`). The Prisma schema serves as the single source of truth
for the data model, reducing type drift between database and application.

**Alternatives considered**:
- Drizzle ORM — lighter weight, SQL-first, excellent TypeScript support.
  Rejected because Prisma is more mature for migration management and has
  broader ecosystem coverage.
- Raw `pg` client — maximum control but no type safety or migration tooling.
  Rejected as inconsistent with production-grade standards.
- TypeORM — decorator-based, heavier, less idiomatic with Next.js.

---

## Decision 3: Input Validation — Zod

**Decision**: Zod (resolved in clarification Q5)

**Rationale**: Zod integrates naturally with TypeScript, produces inferred
types that can be shared between client and server, and is the de-facto
standard in the Next.js ecosystem. All REST API routes validate request bodies
server-side with Zod schemas before any database operation.

**Alternatives considered**:
- Yup — older, less TypeScript-native.
- Joi — Node.js-centric, heavier API.
- class-validator — decorator-based, doesn't align with functional Zod patterns.

---

## Decision 4: Styling — Tailwind CSS

**Decision**: Tailwind CSS (mandated by constitution)

**Rationale**: Utility-first CSS provides rapid iteration, consistent design
tokens, and zero runtime overhead (purged at build time). Mobile-first
responsive design is expressed naturally via breakpoint prefixes. Tailwind's
`prose` plugin handles typography for content-rich sections.

**Alternatives considered**:
- CSS Modules — good for scoping but verbose for a component-heavy app.
- styled-components / Emotion — runtime CSS-in-JS adds bundle weight.
- shadcn/ui — component library built on Tailwind; can be adopted in later
  phases for admin portal components without replacing the styling foundation.

---

## Decision 5: Admin Authentication — Secure Session (HTTP-only Cookie)

**Decision**: Server-side session with HTTP-only, Secure, SameSite=Strict cookie

**Rationale**: Mandated by constitution (Principle IV, FR-004). No third-party
OAuth for admin. HTTP-only cookies prevent XSS session theft. SameSite=Strict
provides CSRF protection without a separate token for same-origin requests.
Session stored server-side (database-backed or in-memory with Redis for
persistence). 8-hour absolute timeout (resolved in clarification Q2).

**Alternatives considered**:
- JWT (stateless) — no server-side revocation, token theft is irrecoverable.
  Rejected.
- NextAuth.js — adds flexibility for OAuth providers, unnecessary for a
  single-user admin with no third-party login. Can be revisited if needed.
- Basic Auth — not suitable for a full admin portal UI.

---

## Decision 6: API Design — REST

**Decision**: REST with standard HTTP verbs and JSON payloads (resolved in
clarification Q5)

**Rationale**: REST is the most appropriate model for a Next.js API routes
backend with a single admin user performing CRUD operations. HTTP verbs
(GET/POST/PUT/PATCH/DELETE) map cleanly to content lifecycle operations.
Status codes are well-understood for error handling. Typed with Zod on the
server and TypeScript interfaces on the client.

**Alternatives considered**:
- tRPC — excellent end-to-end type safety for Next.js monorepos. Rejected
  because it requires client-side tRPC hooks that add framework lock-in and
  are harder for OpenCode to implement consistently without type generation
  tooling in place.
- GraphQL — powerful for complex querying, overkill for a single-owner admin
  CRUD portal. Adds schema maintenance overhead.

---

## Decision 7: Object Storage — MinIO (S3-compatible)

**Decision**: MinIO (mandated by constitution)

**Rationale**: MinIO runs as a Docker container alongside the application,
exposing an S3-compatible API. All uploaded media (images, CV PDF, project
screenshots) are stored in MinIO buckets. The S3 API means the application
uses `@aws-sdk/client-s3` or a compatible SDK, enabling future migration to
any S3-compatible provider without application changes.

**Alternatives considered**:
- Local filesystem storage — no CDN capability, breaks in containerised
  environments, not portable. Rejected.
- AWS S3 — external dependency, requires AWS credentials, costs money.
  Rejected for self-hosted VPS target.
- Cloudflare R2 — good alternative but still external. MinIO keeps everything
  self-contained.

---

## Decision 8: Reverse Proxy — Nginx

**Decision**: Nginx

**Rationale**: Nginx is the most widely documented reverse proxy for self-hosted
Docker Compose stacks. It handles TLS termination (via Let's Encrypt / Certbot
or pre-supplied certs), HTTP→HTTPS redirection, static file serving, and
proxying to the Next.js application server. Battle-tested with extensive
Docker Compose examples.

**Alternatives considered**:
- Caddy — automatic TLS provisioning is compelling, simpler config. Rejected
  in favour of Nginx due to wider operational documentation and familiarity,
  though Caddy remains a viable swap in Phase 5.
- Traefik — good for dynamic service discovery in larger clusters. Overhead
  not justified for a single-host VPS.

---

## Decision 9: Availability Posture — Best-Effort

**Decision**: Best-effort availability (resolved in clarification Q1)

**Rationale**: This is a personal portfolio with a single owner. No commercial
SLA is required. Auto-restart via Docker Compose `restart: unless-stopped`
ensures recovery from crashes without manual intervention. Daily backups of
PostgreSQL (`pg_dump`) and MinIO bucket data to a secondary location protect
against data loss. Uptime monitoring (e.g., UptimeRobot free tier) provides
visibility without infrastructure overhead.

**Alternatives considered**:
- Formal 99.9% uptime — requires load balancing, multi-node failover.
  Unjustified for a personal portfolio.

---

## Decision 10: Observability Baseline

**Decision**: Structured stdout logging + admin audit trail (resolved in
clarification Q4)

**Rationale**: Structured JSON logs to stdout are captured by Docker's log
driver and available via `docker compose logs`. This is the minimal viable
observability baseline for phases 1–4. The admin action audit trail (Phase 3+)
records actor, action, entity, timestamp to the PostgreSQL `audit_log` table
— lightweight but essential for accountability in an admin portal.
Full error monitoring (e.g., Sentry) and metrics are Phase 5 concerns.

**Alternatives considered**:
- No logging until Phase 5 — leaves phases 1–4 debugging blind. Rejected.
- Full structured tracing from Phase 1 — premature infrastructure investment.
