# Quickstart: Phase 1 — Public Portfolio MVP

**Branch**: `002-public-portfolio-mvp` | **Date**: 2026-03-28

---

## Prerequisites

- Node.js 20 LTS
- Docker Desktop (for PostgreSQL + Nginx containers)
- pnpm (preferred) or npm

---

## Local Development Setup

### 1. Clone and install

```bash
git checkout 002-public-portfolio-mvp
pnpm install
```

### 2. Start the database

```bash
docker compose up postgres -d
```

This starts PostgreSQL 16 on port 5432 with credentials from `.env.local`.

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/portfolio_dev"
```

### 4. Run migrations and seed

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Running Tests

### E2E (Playwright)

```bash
# Start dev server first, then:
pnpm test:e2e

# Or with UI:
pnpm test:e2e --ui
```

Playwright tests cover:
- All six sections render with seeded data
- Sticky navigation is visible and links function
- Mobile layout at 375px viewport
- SEO tags present in `<head>`
- External project/contact links have correct `target="_blank"`
- Keyboard navigation through interactive elements

### Unit (Vitest)

```bash
pnpm test
```

Unit tests cover:
- Section components return null when passed empty/null data
- `ExperienceEntry` with `endDate: null` renders "Present"
- `Project` card renders only the links that are non-null
- `Skill` groups are sorted correctly by `displayOrder`

---

## Full Stack with Docker Compose

To run the full production-equivalent stack (Next.js + PostgreSQL + Nginx):

```bash
docker compose up --build
```

Services:
- `postgres` — PostgreSQL 16 on port 5432
- `next-app` — Built Next.js app on port 3000 (internal)
- `nginx` — Reverse proxy on port 80 (HTTP) and 443 (HTTPS)

After startup, run migrations and seed against the containerised DB:

```bash
docker compose exec next-app npx prisma migrate deploy
docker compose exec next-app npx prisma db seed
```

---

## Key Files Reference

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Database schema — source of truth for all models |
| `prisma/seed.ts` | Seed script — all portfolio content defined here |
| `src/lib/db.ts` | Prisma client singleton |
| `src/app/page.tsx` | Home page — fetches all data, renders sections |
| `src/app/layout.tsx` | Root layout — sticky header, metadata, font loading |
| `src/components/sections/` | One component per portfolio section |
| `docker/docker-compose.yml` | Full-stack orchestration |
| `.env.example` | Environment variable template |
| `specs/002-public-portfolio-mvp/` | All planning artifacts for this phase |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NODE_ENV` | Auto | Set to `production` in Docker build |

No secrets or API keys are required for Phase 1.
