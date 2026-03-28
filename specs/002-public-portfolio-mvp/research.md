# Research: Phase 1 — Public Portfolio MVP

**Branch**: `002-public-portfolio-mvp` | **Date**: 2026-03-28

All NEEDS CLARIFICATION items from Technical Context resolved below.

---

## 1. Data Fetching Pattern — React Server Components vs. API Routes

**Decision**: React Server Components (RSC) with direct Prisma calls — no API routes for Phase 1 public rendering.

**Rationale**: The public portfolio is a read-only server-rendered page. RSC allows database queries to run at the server level with zero client bundle impact, satisfying FR-009 (content accessible without JavaScript) and the LCP < 2.5s target. Prisma is called directly in page/section components via a shared `lib/db.ts` singleton. No REST API route is needed for public content — that layer is introduced in Phase 3 for admin CRUD.

**Alternatives considered**:
- `getServerSideProps` (Next.js Pages Router) — rejected: App Router RSC is the current standard and better aligns with the mandated stack.
- API routes (`/api/content/*`) — rejected for Phase 1: adds a network round-trip and client-side fetch with no benefit on a read-only server-rendered page.

---

## 2. Next.js App Router Caching Strategy

**Decision**: Use Next.js default static/dynamic rendering with `cache: 'no-store'` on Prisma fetch wrappers during Phase 1, moving to `revalidate`-based ISR in Phase 5.

**Rationale**: Portfolio content changes infrequently (seed updates only in Phase 1). For simplicity, server components fetch fresh on each request during Phase 1. This avoids cache invalidation complexity before admin-triggered updates exist. Phase 5 (production hardening) introduces ISR or on-demand revalidation when the admin can trigger content changes.

**Alternatives considered**:
- Full static generation (`generateStaticParams`) — rejected: requires content to be known at build time; does not work cleanly once Phase 3 introduces runtime content updates.
- ISR with `revalidate: 60` — deferred to Phase 5; introduces complexity not justified in Phase 1.

---

## 3. Prisma Client Singleton Pattern

**Decision**: Export a single Prisma Client instance from `lib/db.ts` using the Node.js global pattern to avoid connection exhaustion in development (Next.js hot reload creates multiple module instances).

**Rationale**: Standard Next.js + Prisma best practice. Without the global singleton, each hot reload spawns a new PrismaClient and exhausts the PostgreSQL connection pool. The global pattern (checking `global.prisma`) prevents this.

**Pattern**:
```ts
// lib/db.ts
import { PrismaClient } from '@prisma/client'
const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const db = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

---

## 4. Image Handling in Phase 1

**Decision**: No image assets in Phase 1. Project cards show text-only (title, summary, tech tags, links). Hero section uses CSS/SVG decoration or no image. No `<Image>` component optimization required.

**Rationale**: The spec entities (Hero, Project, Skill, Experience, Contact) have no image field. Introducing images would require either MinIO (not in Phase 1 scope) or external URLs (inconsistent with "no assets" approach). Phase 4 introduces case study imagery and Phase 3 adds admin media upload. Keeping Phase 1 image-free simplifies the stack and removes a performance variable.

**Alternatives considered**:
- External image URLs stored in DB — rejected: MinIO is mandated for all media (Principle VI); using arbitrary external URLs bypasses that governance.
- Static images committed to repo — rejected: violates Principle II (content not admin-manageable) once Phase 3 lands.

---

## 5. Font Loading Strategy

**Decision**: Use Next.js `next/font` with a single Google Font (variable font) loaded via `font-display: swap`. Font subset to Latin only. Self-hosted via the `next/font` build step (fonts are downloaded at build time, served from the application's own domain).

**Rationale**: `next/font` eliminates layout shift (CLS) by inlining font-face declarations and removing external font CDN dependency. Self-hosting keeps all resources on the same origin, which benefits LCP and eliminates third-party latency. One variable font family (e.g., Inter) covers all weight needs without multiple HTTP requests.

**Alternatives considered**:
- Google Fonts CDN `<link>` — rejected: external origin, potential CLS, GDPR concern for EU visitors.
- System font stack — rejected: acceptable fallback but reduces typographic quality for a credibility-critical page.

---

## 6. SEO Implementation — Next.js Metadata API

**Decision**: Use the Next.js App Router `Metadata` export in `app/layout.tsx` and `app/page.tsx` for all SEO tags (title, description, Open Graph basic tags).

**Rationale**: Next.js Metadata API generates `<head>` tags server-side with no client JavaScript. It supports static and dynamic metadata, making it forward-compatible with Phase 5 (admin-managed SEO metadata). Open Graph basic tags (`og:title`, `og:description`, `og:type`) are included in Phase 1 even though full Open Graph management is Phase 5 — the cost is negligible and improves link previews immediately.

**Alternatives considered**:
- `react-helmet` or `next-seo` — rejected: not needed when App Router Metadata API provides equivalent functionality natively.

---

## 7. WCAG 2.1 AA Compliance Approach

**Decision**: Phase 1 delivers WCAG 2.1 AA compliance as a built-in requirement (see plan.md Constitution Check resolution), not a Phase 5 addition.

**Specific requirements for Phase 1 implementation**:
- All interactive elements (nav links, project links, contact CTA) must be keyboard-focusable with visible focus rings.
- Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text (validated against the chosen Tailwind palette).
- Sticky nav uses `<nav>` with `aria-label="Main navigation"`.
- Section landmarks use `<main>`, `<header>`, `<footer>`, `<section aria-labelledby="...">`.
- Icon-only links must have `aria-label` or visually hidden text.
- Scroll behavior respects `prefers-reduced-motion` media query.

**Rationale**: Achievable at design time with Tailwind. Deferring creates a live non-compliant public page between Phase 1 and Phase 5, which contradicts Principle VIII.

---

## 8. Docker Compose Setup for Phase 1

**Decision**: Three services — `next-app`, `postgres`, `nginx`. No MinIO service in Phase 1.

**Services**:
- `postgres`: `postgres:16-alpine`, persistent volume, health check
- `next-app`: Multi-stage Dockerfile (build → runner), depends on postgres health
- `nginx`: `nginx:alpine`, terminates TLS, proxies to next-app on port 3000

**Local development**: `docker compose up` brings up postgres only; Next.js runs with `npm run dev` pointing to the containerised DB via `DATABASE_URL`.

**Alternatives considered**:
- Vercel + managed DB — rejected: Principle X mandates self-hosted VPS Docker Compose as primary target.
- SQLite for local dev — rejected: Principle V mandates PostgreSQL; environment parity prevents "works on my machine" issues.

---

## 9. Testing Approach

**Decision**: Two layers:
1. **Playwright E2E** — tests the full rendered page against acceptance scenarios from the spec (section presence, responsive layout, links, SEO tags, keyboard nav).
2. **Vitest + Testing Library** — unit tests for section components against edge cases (empty data, long text, missing optional fields).

**Rationale**: E2E tests directly validate the acceptance scenarios in the spec, making them the primary correctness signal. Unit tests catch component-level edge cases (e.g., "hidden when no records") faster than full E2E runs.

**Alternatives considered**:
- Jest only — rejected: does not cover real browser rendering (CLS, layout) which is critical for the portfolio's visual acceptance criteria.
- Cypress — rejected: Playwright has better TypeScript support, faster execution, and is more actively maintained.

---

## All NEEDS CLARIFICATION Items

| Item | Resolution |
|---|---|
| Data fetching pattern | RSC + direct Prisma (no API routes in Phase 1) |
| Caching strategy | `no-store` in Phase 1; ISR deferred to Phase 5 |
| Image handling | No images in Phase 1; text-only cards |
| Font strategy | `next/font` with variable font, self-hosted |
| SEO tooling | Next.js Metadata API (native) |
| WCAG 2.1 AA | Delivered in Phase 1 (constitution-mandated) |
| Docker Compose | 3 services: postgres, next-app, nginx |
| Testing | Playwright (E2E) + Vitest/Testing Library (unit) |
