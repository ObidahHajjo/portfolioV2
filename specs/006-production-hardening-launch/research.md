# Research: Phase 5 - Production Hardening and Launch

**Branch**: `006-production-hardening-launch` | **Date**: 2026-03-31

All technical unknowns from planning are resolved below. Each decision is intentionally concrete so a lower-capability model can implement directly without filling gaps.

---

## Decision 1: Email transport for both contact delivery and alerts

**Decision**: Use one SMTP integration via `nodemailer` for both contact form delivery and error-threshold alerts.

**Rationale**: A single transport reduces setup complexity, reuses secrets, and satisfies FR-004 plus FR-014 with one implementation path. This also aligns with the clarification that alert emails should reuse the contact recipient path.

**Alternatives considered**:

- Provider API SDKs (Resend, SendGrid, Mailgun): rejected for this phase because they lock implementation to one vendor and add extra auth/API error branches.
- Multiple transports (contact vs alert): rejected as unnecessary complexity.

---

## Decision 2: Contact rate limiting strategy

**Decision**: Enforce rate limiting in PostgreSQL by counting recent submissions from the same anonymized IP hash over a rolling 60-minute window; reject the 6th request with HTTP 429 and a clear UI message.

**Rationale**: This exactly matches FR-006, works across multiple app instances, and does not depend on in-memory state. Hashing the IP before persistence keeps rate limiting effective while avoiding personal data storage.

**Alternatives considered**:

- In-memory limiter: rejected because it breaks across restarts/replicas.
- Redis limiter: rejected to avoid adding new infrastructure for low traffic.

---

## Decision 3: SEO metadata resolution model

**Decision**: Keep `SeoMetadata` as the source of per-page overrides, extend it with `canonicalUrl`, and implement deterministic fallback rules for missing fields.

**Rationale**: FR-001 requires canonical URLs and non-empty metadata at launch. Adding one field to the existing model is minimal change, while fallback rules prevent empty tags when admin content is incomplete.

**Alternatives considered**:

- New separate SEO settings table: rejected because existing table already maps by page slug.
- Hardcoded metadata per page file: rejected because it bypasses admin management.

---

## Decision 4: Sitemap generation approach

**Decision**: Implement `src/app/sitemap.ts` using Next.js Metadata Route API and populate URLs from published content queries plus stable static routes.

**Rationale**: This keeps sitemap generation server-side, always current, and easy to test (`/sitemap.xml`). It directly satisfies FR-003 and edge case handling for unpublished/broken URLs.

**Alternatives considered**:

- Static sitemap file committed to repo: rejected because it can drift from published state.
- Build-time script only: rejected because content changes in admin should reflect without redeploy.

---

## Decision 5: Privacy-first analytics collection

**Decision**: Use a first-party non-blocking page-view beacon (`fetch(..., { keepalive: true })`) to a server endpoint that stores only `pagePath`, `referrerHost`, timestamp, and a daily anonymized session hash.

**Rationale**: This satisfies FR-016/FR-017 and GDPR assumptions without cookies or third-party scripts. The hash is derived from `ip + userAgent + day + ANALYTICS_SALT`, never storing raw IP/UA values.

**Alternatives considered**:

- Third-party analytics service: rejected by scope.
- Middleware-only capture: rejected for this phase due implementation complexity and limited header access patterns.

---

## Decision 6: Runtime error capture and threshold alerting

**Decision**: Implement app-native error capture endpoint with non-throwing helper utilities, store events in `ErrorEvent`, and send a threshold alert email when 3+ errors occur within 10 minutes (tracked with `ErrorAlert` cooldown records).

**Rationale**: This gives deterministic, testable behavior for FR-013/FR-014 and keeps failure isolation under app control. Monitoring failures are swallowed so they never break page/API responses (edge case requirement).

**Alternatives considered**:

- Hosted monitoring-only alerts (Sentry UI rules): rejected as non-deterministic for reproducible implementation and harder to test in spec workflow.
- No persistence, log only: rejected because admin needs diagnosable context after launch.

---

## Decision 7: Accessibility and performance verification gates

**Decision**: Keep existing Lighthouse CI config for performance thresholds, add focused Playwright specs for keyboard/focus behavior and metadata/contact regressions, and require manual screen-reader smoke verification before release.

**Rationale**: Automated checks catch regressions quickly, while a short manual pass covers assistive-tech behavior that automation misses. This maps directly to FR-008 through FR-012.

**Alternatives considered**:

- Manual-only testing: rejected due regression risk.
- Heavy custom a11y framework migration: rejected for phase scope and complexity.

---

## Decision 8: Deployment hardening boundary for this phase

**Decision**: Keep deployment target as VPS + Docker Compose and add only launch-hardening items inside current stack: env validation, health checks, migration/runbook ordering, and Nginx proxy/header review.

**Rationale**: This meets phase objectives without introducing infrastructure churn. It aligns with constitution Principle X and avoids over-scoping into platform re-architecture.

**Alternatives considered**:

- Move deployment to managed platform: rejected by constitution.
- Introduce additional services (queue, metrics stack): rejected as unnecessary for current scale.
