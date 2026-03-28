---
description: "Task list for Phase 0 — Foundation & Constitution"
---

# Tasks: Phase 0 — Foundation & Constitution

**Input**: Design documents from `/specs/001-phase-0-foundation/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: Not requested. No test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent
implementation and verification of each story. The Spec Kit governance
artefacts (spec, plan, contracts, constitution) are already complete. These
tasks establish the **repository scaffold** that all subsequent phases build
into, plus the human-readable summary documents that satisfy each user story's
acceptance criteria.

**Important for the implementing LLM**: Each task is self-contained. Read
the referenced spec contracts in `specs/001-phase-0-foundation/contracts/`
for content to include in documentation tasks. Read `specs/001-phase-0-foundation/plan.md`
for the exact directory layout to create. Never guess — derive all content
from these source documents.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)

---

## Phase 1: Setup

**Purpose**: Initialize the Next.js project and establish the base repository
structure that all subsequent phases build into.

- [X] T001 Initialize Next.js 14 App Router project with TypeScript at repo root using: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` (answer prompts: yes to all recommended defaults) — this generates a `.gitignore`, `package.json`, and base config files
- [X] T002 Update the auto-generated `.gitignore` from T001 to also include entries not added by `create-next-app`: `.env.local`, `prisma/generated/`, `*.pem`, `*.key`, `docker/nginx/certs/*.pem`, `docker/nginx/certs/*.key`, `coverage/` — append these lines to the existing file; do not replace it
- [X] T003 [P] Verify `tailwind.config.ts` content array includes `"./src/**/*.{ts,tsx}"` — update if missing
- [X] T004 [P] Update `tsconfig.json`: set `"strict": true`, `"noUncheckedIndexedAccess": true`, confirm `paths` alias `"@/*": ["./src/*"]` is present
- [X] T005 [P] Create `.prettierrc` at repo root with: `{ "semi": false, "singleQuote": true, "trailingComma": "es5", "printWidth": 100 }`
- [X] T006 [P] Create `.eslintrc.json` extending `["next/core-web-vitals", "next/typescript"]` — replace any auto-generated content

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure files that MUST exist before any user story
can be implemented. Creates directory skeleton, Docker Compose, Nginx, Prisma,
MinIO client, and environment template.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [X] T007 Create directory structure at repo root (create empty `.gitkeep` in each leaf): `src/components/public/`, `src/components/admin/`, `src/components/shared/`, `src/lib/db/`, `src/lib/storage/`, `src/lib/auth/`, `src/lib/validation/`, `src/types/`, `docker/nginx/conf.d/`, `prisma/migrations/`
- [X] T008 Install Prisma: run `npm install prisma @prisma/client` then `npx prisma init --datasource-provider postgresql` — this creates `prisma/schema.prisma` and adds `DATABASE_URL` to `.env`
- [X] T009 Update `prisma/schema.prisma`: set `output = "../node_modules/.prisma/client"` in the generator block; confirm datasource provider is `"postgresql"` and `url = env("DATABASE_URL")`
- [X] T010 [P] Create `src/lib/db/index.ts` — Prisma client singleton:
  ```typescript
  import { PrismaClient } from "@prisma/client"

  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

  export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    })

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
  ```
- [X] T011 [P] Install MinIO SDK: run `npm install @aws-sdk/client-s3 @aws-sdk/lib-storage`
- [X] T012 [P] Create `src/lib/storage/index.ts` — MinIO S3 client stub:
  ```typescript
  import { S3Client } from "@aws-sdk/client-s3"

  export const storageClient = new S3Client({
    region: "us-east-1",
    endpoint: process.env.MINIO_ENDPOINT ?? "http://localhost:9000",
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY ?? "",
      secretAccessKey: process.env.MINIO_SECRET_KEY ?? "",
    },
    forcePathStyle: true,
  })

  export const MEDIA_BUCKET = process.env.MINIO_BUCKET ?? "portfolio-media"
  ```
- [X] T013 Create `.env.example` at repo root with ALL required variables (copy the variable names from `specs/001-phase-0-foundation/contracts/deployment-contract.md` Secrets Management section), with placeholder values and comments explaining each:
  ```
  # Database
  DATABASE_URL="postgresql://portfolio:CHANGE_ME@localhost:5432/portfolio_db"
  # POSTGRES_PASSWORD must match the password in DATABASE_URL above.
  # Docker Compose reads this separately via ${POSTGRES_PASSWORD}.
  POSTGRES_PASSWORD="CHANGE_ME"

  # MinIO Object Storage
  MINIO_ENDPOINT="http://localhost:9000"
  MINIO_ACCESS_KEY="CHANGE_ME"
  MINIO_SECRET_KEY="CHANGE_ME"
  MINIO_BUCKET="portfolio-media"

  # Admin Session
  SESSION_SECRET="CHANGE_ME_minimum_32_random_characters"

  # App
  NEXT_PUBLIC_APP_URL="http://localhost:3000"
  NODE_ENV="development"
  ```
- [X] T014 Create `docker/docker-compose.yml` — production orchestration with four services (`app`, `db`, `storage`, `proxy`) as defined in `specs/001-phase-0-foundation/contracts/deployment-contract.md`. Use named volumes for `db` and `storage`. All services use `restart: unless-stopped`. App service reads from `.env`. Proxy binds ports 80 and 443.
  ```yaml
  version: "3.9"

  services:
    app:
      build:
        context: ..
        dockerfile: Dockerfile
      restart: unless-stopped
      env_file: ../.env
      depends_on:
        - db
        - storage
      expose:
        - "3000"

    db:
      image: postgres:16-alpine
      restart: unless-stopped
      environment:
        POSTGRES_USER: portfolio
        POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
        POSTGRES_DB: portfolio_db
      volumes:
        - db_data:/var/lib/postgresql/data

    storage:
      image: minio/minio
      restart: unless-stopped
      command: server /data --console-address ":9001"
      environment:
        MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
        MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
      volumes:
        - minio_data:/data
      expose:
        - "9000"

    proxy:
      image: nginx:alpine
      restart: unless-stopped
      ports:
        - "80:80"
        - "443:443"
      volumes:
        - ./nginx/conf.d:/etc/nginx/conf.d:ro
        - ./nginx/certs:/etc/nginx/certs:ro
      depends_on:
        - app

  volumes:
    db_data:
    minio_data:
  ```
- [X] T015 [P] Create `docker/docker-compose.dev.yml` — development overrides: exposes `db` on port 5432, `storage` on ports 9000 and 9001 (MinIO console), sets `NODE_ENV=development`
  ```yaml
  version: "3.9"

  services:
    db:
      ports:
        - "5432:5432"

    storage:
      ports:
        - "9000:9000"
        - "9001:9001"
  ```
- [X] T016 [P] Create `docker/nginx/certs/.gitkeep` — TLS certificate files (`fullchain.pem`, `privkey.pem`) must never be committed to source control; this placeholder makes the directory trackable in git. The full nginx proxy configuration (`docker/nginx/conf.d/default.conf`) is authored in T029 (US6), which has sole ownership of that file — do not create `default.conf` here
- [X] T017 [P] Create `Dockerfile` at repo root — multi-stage Next.js production build:
  ```dockerfile
  FROM node:20-alpine AS deps
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci

  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  RUN npx prisma generate
  RUN npm run build

  FROM node:20-alpine AS runner
  WORKDIR /app
  ENV NODE_ENV=production
  RUN addgroup --system --gid 1001 nodejs
  RUN adduser --system --uid 1001 nextjs
  COPY --from=builder /app/public ./public
  COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
  COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
  USER nextjs
  EXPOSE 3000
  CMD ["node", "server.js"]
  ```
- [X] T018 [P] Update `next.config.ts` — add `output: "standalone"` for Docker build, add security headers matching `specs/001-phase-0-foundation/contracts/security-baseline.md` Headers section, disable `x-powered-by`:
  ```typescript
  import type { NextConfig } from "next"

  const securityHeaders = [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Content-Security-Policy",
      // WARNING: 'unsafe-eval' and 'unsafe-inline' are required for Next.js
      // development mode (HMR, React error overlays). These MUST be removed
      // or replaced with nonces in Phase 5 (Production Hardening) before
      // going live. Do not treat this CSP as production-ready.
      value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;",
    },
  ]

  const nextConfig: NextConfig = {
    output: "standalone",
    poweredByHeader: false,
    async headers() {
      return [{ source: "/(.*)", headers: securityHeaders }]
    },
  }

  export default nextConfig
  ```

**Checkpoint**: Foundation ready — all user story tasks can now begin.

---

## Phase 3: User Story 1 — Product Vision Documented (Priority: P1) 🎯 MVP

**Goal**: A single readable document exists that any developer can open to
understand the platform's purpose, surfaces, audience, and core objectives.

**Independent Test**: Open `VISION.md` from the repo root. Without reading
any other file, confirm you can answer: Who is this for? What are the two
surfaces? What does the admin portal do? What are the guiding principles?

- [X] T019 [US1] Create `VISION.md` at repo root — extract and expand on the product vision from `specs/001-phase-0-foundation/spec.md` FR-001 and the `## Executive Summary` section of `PLAN.md`. Include sections: Project Purpose, Target Audience, Two Primary Surfaces (public portfolio + admin portal), Core Objectives (4 bullet points), Guiding Principles (5 bullet points from PLAN.md), and a pointer to `.specify/memory/constitution.md` for binding rules.
- [X] T020 [US1] Update `README.md` at repo root — replace auto-generated Next.js content with: project name and one-line description, link to `VISION.md`, link to `PLAN.md` (roadmap), link to `.specify/memory/constitution.md` (constitution), link to `specs/001-phase-0-foundation/` (Phase 0 artefacts), local development setup instructions (prerequisites: Node.js 20, Docker, steps: clone → `cp .env.example .env` → fill values → `npm install` → `docker compose -f docker/docker-compose.dev.yml up -d db storage` → `npx prisma migrate dev` → `npm run dev`).

**Checkpoint**: User Story 1 complete — product vision is independently readable.

---

## Phase 4: User Story 2 — Design & UX Principles Defined (Priority: P2)

**Goal**: A document exists that any developer or designer can use to make a
binary pass/fail decision on any proposed UI pattern.

**Independent Test**: Read `docs/design-principles.md`. For a proposed UI
pattern (e.g., a section with no mobile layout), determine pass or fail
from the document alone without asking anyone.

- [X] T021 [US2] Create `docs/` directory and `docs/design-principles.md` — derive content from `specs/001-phase-0-foundation/spec.md` FR-002 and `specs/001-phase-0-foundation/contracts/performance-contract.md`. Structure the document with these sections:
  1. **Mobile-First Responsive Design** — explain breakpoint-first approach, no desktop-only layouts, test at 320px minimum width
  2. **Visual Hierarchy for Recruiters** — scanning patterns, key info above the fold, clear CTA placement
  3. **Accessibility Standard** — WCAG 2.1 AA is the minimum; semantic HTML required; keyboard navigation required; all images need `alt` text; colour contrast ratio ≥ 4.5:1 for normal text
  4. **Typography & Layout Consistency** — max 2 font families, consistent spacing scale (Tailwind defaults), no arbitrary pixel values
  5. **User-Visible Performance** — LCP < 2.5s, CLS < 0.1, INP < 200ms — reference `contracts/performance-contract.md` for full targets
  6. **Content Graceful Degradation** — every public section must render without error when content is empty or missing; no section may show a broken state to visitors

**Checkpoint**: User Story 2 complete — design principles are independently usable as a checklist.

---

## Phase 5: User Story 3 — Content Management Boundaries Defined (Priority: P2)

**Goal**: Every content type is classified as admin-managed or explicitly static
in a single authoritative reference.

**Independent Test**: Pick any content element from PLAN.md Phase 2.
Look it up in the content boundary reference. Determine its category
(admin-managed or static) without asking anyone.

- [X] T022 [US3] Verify `specs/001-phase-0-foundation/contracts/content-classification.md` exists and contains both the admin-managed table (11 entity types) and the explicitly static list (4 items). If any item from PLAN.md Phase 2 scope is missing, add it. No new file is created — this is a verification and completion task.
- [X] T022b [US3] Create `specs/001-phase-0-foundation/contracts/seo-contract.md` — document the SEO structural requirements from spec FR-008. Include these sections:
  1. **Structural Requirements (Phase 1+, non-negotiable)**: semantic HTML5 elements (`<main>`, `<nav>`, `<article>`, `<section>`, `<header>`, `<footer>`); every page MUST have a unique `<title>` and `<meta name="description">`; all images MUST have `alt` attributes; heading hierarchy MUST be logical (one `<h1>` per page)
  2. **Open Graph (Phase 1+)**: every public page MUST include `og:title`, `og:description`, `og:image`, `og:url`, `og:type` meta tags; `og:image` must be at least 1200×630px
  3. **Sitemap (Phase 5)**: an XML sitemap MUST be generated and submitted; sitemap URL MUST be referenced in `robots.txt`
  4. **Admin Configurability (Phase 5)**: page title, meta description, og:title, og:description, og:image are admin-configurable via the SeoMetadata entity defined in `content-classification.md`; structural HTML elements are never admin-managed
  5. **Canonical URLs**: every public page MUST include a `<link rel="canonical">` tag pointing to the canonical URL

**Checkpoint**: User Story 3 complete — content boundaries and SEO baseline are authoritative and complete.

---

## Phase 6: User Story 4 — Security Requirements Defined (Priority: P3)

**Goal**: A developer can produce a Phase 3 admin portal security compliance
checklist from the security baseline alone.

**Independent Test**: Open `specs/001-phase-0-foundation/contracts/security-baseline.md`.
Without any other reference, list: the authentication mechanism, cookie
attributes, session timeout, validation library, and required HTTP headers.

- [X] T023 [US4] Verify `specs/001-phase-0-foundation/contracts/security-baseline.md` is complete. Confirm it covers all six sections: Authentication, Admin Portal Access, Input Validation, Transport Security, Secrets Management, Security Headers. If any section is missing or has placeholder content, complete it using the rules from `specs/001-phase-0-foundation/spec.md` FR-004 and the clarification session record.
- [X] T024 [P] [US4] Create `src/lib/validation/index.ts` — export a comment-documented stub explaining that all admin API route handlers MUST import and use Zod schemas from this directory for server-side request validation. Include one example schema stub:
  ```typescript
  import { z } from "zod"
  // Install zod first: npm install zod
  //
  // All admin API route handlers MUST validate request bodies using Zod schemas.
  // Add domain-specific schemas here as features are implemented.
  //
  // Example schema (to be replaced with real entities in Phase 2+):
  export const exampleSchema = z.object({
    id: z.string().cuid(),
  })
  ```
- [X] T025 [P] [US4] Run `npm install zod` to add Zod as a dependency

**Checkpoint**: User Story 4 complete — security baseline is verifiable and Zod is available.

---

## Phase 7: User Story 5 — Performance Expectations Defined (Priority: P3)

**Goal**: Automated tooling can produce a pass/fail result against performance
targets without human interpretation.

**Independent Test**: Open `.lighthouserc.js`. Confirm LCP, CLS, and INP
thresholds are set to the values in `contracts/performance-contract.md`.

- [X] T026 [US5] Create `.lighthouserc.js` at repo root — configure Lighthouse CI with the numeric thresholds from `specs/001-phase-0-foundation/contracts/performance-contract.md`:
  ```javascript
  module.exports = {
    ci: {
      collect: {
        url: ["http://localhost:3000"],
        numberOfRuns: 3,
      },
      assert: {
        assertions: {
          "categories:performance": ["warn", { minScore: 0.9 }],
          "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
          "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
          "interaction-to-next-paint": ["error", { maxNumericValue: 200 }],
          "total-blocking-time": ["warn", { maxNumericValue: 300 }],
        },
      },
      upload: {
        target: "temporary-public-storage",
      },
    },
  }
  ```
- [X] T027 [P] [US5] Add Lighthouse CI dev dependency: run `npm install --save-dev @lhci/cli`

**Checkpoint**: User Story 5 complete — performance targets are machine-verifiable.

---

## Phase 8: User Story 6 — Deployment Strategy Defined (Priority: P3)

**Goal**: A developer can draft a complete Docker Compose service manifest
and know the availability posture from the deployment documents alone.

**Independent Test**: From `docker/docker-compose.yml` and `specs/001-phase-0-foundation/contracts/deployment-contract.md` alone, list all four required services, their responsibilities, inter-service connections, and restart policy.

- [X] T028 [US6] Verify `docker/docker-compose.yml` contains all four services (`app`, `db`, `storage`, `proxy`) with `restart: unless-stopped`, named volumes for `db` and `storage`, and correct port bindings (80, 443 on proxy only). Fix any gaps introduced during T014.
- [X] T029 [P] [US6] Create `docker/nginx/conf.d/default.conf` if not already complete from T016 — include HTTP-to-HTTPS redirect server block and HTTPS proxy block with all security headers from `contracts/security-baseline.md` Headers section:
  ```nginx
  server {
      listen 80;
      server_name _;
      return 301 https://$host$request_uri;
  }

  server {
      listen 443 ssl;
      server_name your-domain.com;

      ssl_certificate /etc/nginx/certs/fullchain.pem;
      ssl_certificate_key /etc/nginx/certs/privkey.pem;

      add_header X-Frame-Options "DENY";
      add_header X-Content-Type-Options "nosniff";
      add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
      add_header Referrer-Policy "strict-origin-when-cross-origin";

      location / {
          proxy_pass http://app:3000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }

      location /media/ {
          proxy_pass http://storage:9000/;
          proxy_set_header Host $host;
      }
  }
  ```
- [X] T030 [P] [US6] Verify the `docker/docker-compose.yml` proxy service volume mount `./nginx/certs:/etc/nginx/certs:ro` correctly references the directory created in T016, and confirm the nginx config from T029 uses the matching path `ssl_certificate /etc/nginx/certs/fullchain.pem;` — fix any path mismatch

**Checkpoint**: User Story 6 complete — deployment strategy is fully documented and Docker files are ready.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, cleanup, and constitution compliance check.

- [X] T031 Run the Phase 0 verification checklist from `specs/001-phase-0-foundation/quickstart.md` — confirm all six success criteria (SC-001 through SC-006) pass. Document any failures as issues.
- [X] T032 [P] Verify `package.json` `scripts` section includes: `"dev": "next dev"`, `"build": "next build"`, `"start": "next start"`, `"lint": "next lint"`, `"db:generate": "prisma generate"`, `"db:migrate": "prisma migrate dev"`, `"db:studio": "prisma studio"`. Add any missing scripts.
- [X] T033 [P] Confirm `.gitignore` covers: `.env`, `.env.local`, `node_modules/`, `.next/`, `prisma/generated/`, `*.pem`, `*.key`
- [X] T034 [P] Confirm `docs/` directory exists and `docs/design-principles.md` (T021) is complete
- [X] T035 Run `npm run lint` — fix any lint errors before marking Phase 0 complete
- [X] T036 Run `npx prisma validate` — confirm `prisma/schema.prisma` is valid (no schema errors)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion — BLOCKS all user stories
- **User Stories (Phases 3–8)**: All depend on Foundational (Phase 2)
  - US1 (P1) → US2 (P2), US3 (P2) in parallel → US4, US5, US6 (P3) in parallel
- **Polish (Phase 9)**: Depends on all user stories complete

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|---|---|---|
| US1 (P1) — Vision | Foundational | Nothing (first) |
| US2 (P2) — Design | Foundational | US3 |
| US3 (P2) — Content | Foundational | US2 |
| US4 (P3) — Security | Foundational | US5, US6 |
| US5 (P3) — Performance | Foundational | US4, US6 |
| US6 (P3) — Deployment | Foundational | US4, US5 |

### Within Each Phase

- Setup: T001 → T002 → T003–T006 [parallel] *(T001 = Next.js init; T002 = gitignore update after)*
- Foundational: T007 → T008 → T009 → T010–T018 [parallel groups]
- User stories: each is self-contained; tasks within a story run sequentially unless [P] marked

### Parallel Opportunities

```bash
# Phase 2 parallel group (after T009 Prisma init):
Task: T010 — Prisma client singleton
Task: T011+T012 — MinIO SDK install + client stub
Task: T013 — .env.example
Task: T014 — docker-compose.yml
Task: T015 — docker-compose.dev.yml
Task: T016 — nginx default.conf
Task: T017 — Dockerfile
Task: T018 — next.config.ts

# Phase 3–8 (after Foundational complete):
Task: US1 (T019, T020)
Task: US2 (T021)              ← parallel with US3
Task: US3 (T022, T022b)       ← parallel with US2
# Then:
Task: US4 (T023–T025)  ← parallel with US5 and US6
Task: US5 (T026–T027)  ← parallel with US4 and US6
Task: US6 (T028–T030)  ← parallel with US4 and US5
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Vision)
4. **STOP and VALIDATE**: `VISION.md` exists, `README.md` updated, dev setup works
5. Phase 0 is minimally viable — other stories add governance depth

### Incremental Delivery

1. Setup + Foundational → repository scaffold is runnable (`npm run dev` works)
2. US1 → product vision readable by any developer
3. US2 + US3 → design and content principles documented
4. US4 + US5 + US6 → security, performance, and deployment fully defined
5. Polish → lint clean, Prisma valid, checklist passes

### Notes

- All [P] tasks within a phase can be launched simultaneously
- Every task references an exact file path — no guessing required
- Tasks T007–T018 (Foundational) are the most complex; complete them in the listed order for dependencies, then parallelize the [P] group
- Phase 0 produces NO public-facing UI — `npm run dev` should show the default Next.js page only
- Do NOT start implementing portfolio sections (hero, about, projects) — that is Phase 1
