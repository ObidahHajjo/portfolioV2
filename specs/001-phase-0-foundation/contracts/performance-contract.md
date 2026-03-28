# Contract: Performance Targets

**Version**: 1.0 | **Phase**: 0 | **Date**: 2026-03-28
**Authority**: Constitution Principle VIII; Spec FR-005

This contract defines the public portfolio's performance targets. All targets
apply to the public-facing site only. The admin portal is exempt from Core
Web Vitals enforcement but MUST remain usable under normal single-user load.

These targets serve as the acceptance criteria for Phase 5 (Production
Hardening) and as design constraints for all earlier phases.

---

## Core Web Vitals (Public Site)

| Metric | Target | Measurement Tool |
|---|---|---|
| Largest Contentful Paint (LCP) | < 2.5 s | Lighthouse, CrUX |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse, CrUX |
| Interaction to Next Paint (INP) | < 200 ms | Lighthouse, CrUX |

## Page Weight Budget (Public Site)

| Resource | Budget |
|---|---|
| Total page weight (initial load) | < 300 KB transferred (compressed) |
| JavaScript bundle (initial) | < 150 KB compressed |
| Images | Served in modern formats (WebP/AVIF); responsive `srcset` |
| Fonts | ≤ 2 font families; subset and preloaded |

## Server Response

| Metric | Target |
|---|---|
| Time to First Byte (TTFB) | < 200 ms (server-rendered pages) |
| Static asset cache | `Cache-Control: max-age=31536000, immutable` for hashed assets |

## Enforcement

- Phase 1 MUST be designed with these targets in mind (no deferred
  optimisation that would require architectural rework in Phase 5).
- Phase 5 MUST produce a Lighthouse CI report demonstrating all targets met.
- Any Phase 1–4 implementation that would prevent meeting these targets
  MUST be flagged in that phase's Constitution Check and resolved before
  implementation proceeds.

## Admin Portal (Non-enforced, best-effort)

- Pages MUST load within 3 seconds on a standard broadband connection.
- Form submissions MUST provide user feedback within 1 second.
- No performance targets enforced beyond usability — the admin portal is
  used only by the single owner and is not public-facing.
