# Contract: Deployment Strategy

**Version**: 1.0 | **Phase**: 0 | **Date**: 2026-03-28
**Authority**: Constitution Principle X; Spec FR-006

This contract defines the deployment topology, service responsibilities,
availability posture, and environment requirements for the platform. All phases
MUST design services to be deployable within this model.

---

## Target Environment

| Property | Value |
|---|---|
| Platform | Self-hosted VPS (Linux) |
| Orchestration | Docker Compose |
| Availability posture | Best-effort (see below) |
| HTTPS | Mandatory in production |

---

## Required Services (Docker Compose)

| Service | Image | Responsibility |
|---|---|---|
| `app` | Custom (Next.js) | Public portfolio + admin portal + REST API |
| `db` | `postgres:16-alpine` | All persistent relational data |
| `storage` | `minio/minio` | All uploaded media assets |
| `proxy` | `nginx:alpine` | TLS termination, HTTP→HTTPS redirect, reverse proxy |

### Service Communication

```text
Internet
  └─► proxy (443/80)
        ├─► app (3000) — all application requests
        └─► storage (9000) — public media asset access (read-only bucket)

app ──► db (5432)
app ──► storage (9000) — upload/manage assets
```

---

## Environment Separation

### Production (`docker-compose.yml`)

- All services run in Docker containers.
- Secrets injected via environment variables (never baked into image).
- Named Docker volumes for `db` (PostgreSQL data) and `storage` (MinIO data).
- Nginx terminates TLS; app container listens on internal port only.
- `NODE_ENV=production`; Next.js runs in production mode.

### Development (`docker-compose.dev.yml` — overrides)

- `db` and `storage` services containerised (same images).
- `app` may run on host (`npm run dev`) for hot-reload convenience.
- Nginx proxy optional in dev; app accessible directly on `localhost:3000`.
- `.env.local` used for secrets; `.env.example` committed as reference.

---

## Availability Posture (Best-Effort)

| Concern | Policy |
|---|---|
| Crash recovery | `restart: unless-stopped` on all services |
| Formal SLA | None — personal portfolio |
| Database backup | Daily `pg_dump` to a secondary location (cron job on host) |
| MinIO backup | Daily bucket sync to a secondary location |
| Uptime monitoring | Optional: UptimeRobot free tier or equivalent |
| Maintenance window | No formal window required; single-owner tolerance |

---

## Secrets Management

| Secret | Injection method |
|---|---|
| PostgreSQL password | `POSTGRES_PASSWORD` environment variable |
| MinIO root credentials | `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` env vars |
| Session secret | `SESSION_SECRET` environment variable (≥ 32 random bytes) |
| MinIO app credentials | `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` env vars |

All secrets MUST be defined in `.env` (production) or `.env.local` (dev).
Neither file is committed to source control. `.env.example` with placeholder
values is committed as a setup reference.

---

## Phase Applicability

| Service | First required |
|---|---|
| `proxy` (Nginx + TLS) | Phase 1 (local), Phase 5 (production with real TLS) |
| `db` (PostgreSQL) | Phase 2 (schema defined), Phase 3 (first writes) |
| `storage` (MinIO) | Phase 3 (media upload in admin) |
| `app` (Next.js) | Phase 1 |

Local development in Phase 1 MAY use HTTP only. Production HTTPS is enforced
from Phase 5 onward. Database and MinIO containers SHOULD be available locally
from Phase 2 onward for schema development.
