# Senior Developer Portfolio

Production-grade senior developer portfolio platform with a future admin portal
for dynamic content management.

## Phase 0 Status

This repository currently contains Phase 0 foundation and governance artefacts.
Phase 0 defines the product vision, architecture constraints, security rules,
performance expectations, and deployment strategy before application code is
introduced.

## Core Documents

- `VISION.md` - product purpose, audience, surfaces, and objectives
- `PLAN.md` - authoritative roadmap across all phases
- `.specify/memory/constitution.md` - binding engineering and governance rules
- `specs/001-phase-0-foundation/` - Phase 0 spec, contracts, research, and tasks

## What Phase 0 Includes

- Product vision and project goals
- Design and UX principles
- Content management boundaries
- Security baseline
- Performance targets
- Deployment contract for VPS + Docker Compose

## Local Development Setup

Prerequisites:

- Node.js 20
- Docker

Steps:

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Fill in the environment variable values
4. Run `npm install`
5. Run `docker compose -f docker/docker-compose.dev.yml up -d db storage`
6. Run `npx prisma migrate dev`
7. Run `npm run dev`

## Current Repository State

Phase 0 now includes the baseline Next.js, Docker, Prisma, and validation
scaffold required for later feature phases.
