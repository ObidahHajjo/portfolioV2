# Contract: Security Baseline

**Version**: 1.0 | **Phase**: 0 | **Date**: 2026-03-28
**Authority**: Constitution Principle IV, Principle VIII; Spec FR-004

This contract defines the minimum security requirements for all phases.
Every phase MUST comply with all applicable rules before implementation begins.

---

## Authentication (Phase 3+)

| Rule | Requirement |
|---|---|
| Mechanism | Secure server-side session — no third-party OAuth for admin |
| Cookie attributes | HTTP-only, Secure (HTTPS only), SameSite=Strict |
| Session lifetime | 8-hour absolute timeout — no idle extension |
| Session storage | Server-side (database-backed or Redis); not stored in client |
| Revocation | Sessions MUST be invalidatable server-side on logout |

## Admin Portal Access (Phase 3+)

| Rule | Requirement |
|---|---|
| Route protection | All `/admin` routes MUST redirect unauthenticated requests to login |
| Server-side guard | Authentication check MUST occur server-side on every admin request |
| Client guard | Client-side auth checks are UX aids only; never sole enforcement |

## Input Validation (Phase 3+)

| Rule | Requirement |
|---|---|
| Enforcement layer | ALL admin API endpoints MUST validate input server-side before persistence |
| Schema library | Zod schemas MUST be used for all request body validation |
| Client validation | Permitted as UX enhancement; MUST NOT be the sole guard |
| Sanitisation | User-supplied strings used in HTML context MUST be sanitised |

## Transport Security (All phases from Phase 1+)

| Rule | Requirement |
|---|---|
| Protocol | HTTPS-only in production; HTTP requests MUST be redirected to HTTPS |
| TLS termination | Handled by the reverse proxy (Nginx) |
| HSTS | Strict-Transport-Security header MUST be set in production |

## Secrets Management (All phases)

| Rule | Requirement |
|---|---|
| Source control | Secrets (DB passwords, MinIO keys, session secrets) MUST NOT appear in source |
| Environment files | `.env` files MUST be in `.gitignore`; `.env.example` with placeholder values only |
| Runtime injection | Secrets injected via environment variables at runtime (Docker Compose) |

## Headers (Phase 1+)

| Header | Requirement |
|---|---|
| Content-Security-Policy | MUST be set; restrict script/style sources appropriately |
| X-Frame-Options | `DENY` — prevent clickjacking |
| X-Content-Type-Options | `nosniff` |
| Referrer-Policy | `strict-origin-when-cross-origin` |

## OWASP Top 10 Baseline (Phase 3+)

All admin API routes MUST be evaluated against OWASP Top 10 before Phase 3
implementation is considered complete:

- A01 Broken Access Control — all routes protected by server-side auth check
- A02 Cryptographic Failures — HTTPS enforced, no plaintext secrets
- A03 Injection — Prisma parameterised queries; Zod input validation
- A05 Security Misconfiguration — security headers set; dev config not in prod
- A07 Identification & Authentication Failures — session rules above applied
