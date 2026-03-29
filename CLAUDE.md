# senior-dev-portfolio Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-29

## Active Technologies
- TypeScript 5.x / Node.js 20 LTS + Next.js 14+ (App Router), Tailwind CSS 3, Prisma 5, PostgreSQL 16 (002-public-portfolio-mvp)
- PostgreSQL 16 (content records only — no file uploads in Phase 1; MinIO not required) (002-public-portfolio-mvp)
- TypeScript 5.x / Node.js 20 LTS + Next.js 14+ (App Router), Prisma 5, Zod (003-content-data-model)
- PostgreSQL 16 (Prisma Migrate; MinIO for binary assets — referenced only, not uploaded in Phase 2) (003-content-data-model)
- TypeScript 5.x / Node.js 20 LTS + Next.js 14+ (App Router), Prisma 6.x, Zod, `iron-session`, `minio`, `shadcn/ui`, `react-hook-form`, `@hookform/resolvers`, `bcryptjs` (004-admin-portal-mvp)
- PostgreSQL 16 (Prisma Migrate — one new table: `login_attempts`); MinIO (S3-compatible, file uploads) (004-admin-portal-mvp)

- N/A — Phase 0 is documentation only (001-phase-0-foundation)

## Project Structure

```text
src/
tests/
```

## Commands

# Add commands for N/A — Phase 0 is documentation only

## Code Style

N/A — Phase 0 is documentation only: Follow standard conventions

## Recent Changes
- 004-admin-portal-mvp: Added TypeScript 5.x / Node.js 20 LTS + Next.js 14+ (App Router), Prisma 6.x, Zod, `iron-session`, `minio`, `shadcn/ui`, `react-hook-form`, `@hookform/resolvers`, `bcryptjs`
- 003-content-data-model: Added TypeScript 5.x / Node.js 20 LTS + Next.js 14+ (App Router), Prisma 5, Zod
- 002-public-portfolio-mvp: Added TypeScript 5.x / Node.js 20 LTS + Next.js 14+ (App Router), Tailwind CSS 3, Prisma 5, PostgreSQL 16


<!-- MANUAL ADDITIONS START -->
## Full Technology Stack (established in Phase 0)

These are the mandated technologies for all subsequent phases. Do not deviate
without a constitution amendment.

| Concern | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Object storage | MinIO (S3-compatible) |
| Input validation | Zod |
| Admin auth | Server-side session, HTTP-only cookie, 8h absolute timeout |
| API style | REST — standard HTTP verbs, JSON, Zod-validated |
| Deployment | Docker Compose on self-hosted VPS |
| Reverse proxy | Nginx (TLS termination) |
| Observability | Structured stdout logs (Phase 1+), audit trail table (Phase 3+) |

## Key Governance Files

- `.specify/memory/constitution.md` — binding rules for all phases
- `specs/001-phase-0-foundation/contracts/` — content, security, perf, deployment contracts
- `PLAN.md` — authoritative phase roadmap (do not modify)
- `AGENTS.md` — workflow rules (Claude = planning only; OpenCode = implementation)

## Content Rules

- ALL content from the admin-managed list in `contracts/content-classification.md`
  MUST use the database; none may be hardcoded.
- Draft content MUST NEVER appear on public routes.
- All admin API endpoints MUST validate input server-side with Zod.
<!-- MANUAL ADDITIONS END -->
