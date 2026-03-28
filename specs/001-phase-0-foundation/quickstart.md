# Phase 0 Verification Guide

**Branch**: `001-phase-0-foundation`
**Date**: 2026-03-28

Phase 0 produces no runnable application. Verification is performed by
reviewing the governance artefacts against the success criteria defined in
`spec.md`. Use this checklist to confirm Phase 0 is complete before
beginning Phase 1.

---

## Verification Checklist

### SC-001 — Two-document accessibility

- [ ] Open `.specify/memory/constitution.md` — can you identify all ten
  principles, the mandatory tech stack, and the amendment procedure?
- [ ] Open `specs/001-phase-0-foundation/spec.md` — can you identify all
  content classifications, security requirements, performance targets,
  deployment strategy, and observability baseline?
- [ ] Confirm no foundational decision requires a third document to resolve.

### SC-002 — Constitution Check operability

- [ ] Open any future phase plan template. Fill the Constitution Check table
  using only the ten principles in the constitution. Confirm every row
  produces a clear pass/fail result with no ambiguous items.

### SC-003 — Content boundary completeness (100%)

- [ ] Open `contracts/content-classification.md`.
- [ ] Compare the admin-managed table against PLAN.md Phase 2 entity list:
  Profile, Hero content, Social links, Experiences, Projects, Case studies,
  Skills, Testimonials, Contact settings, SEO metadata, Media assets.
- [ ] Confirm every entity from Phase 2 appears in the contract and is
  classified as admin-managed.
- [ ] Confirm the explicitly static list is also present.

### SC-004 — Security baseline specificity

- [ ] Open `contracts/security-baseline.md`.
- [ ] Confirm a developer could produce a Phase 3 security compliance checklist
  from this document alone (auth model, session policy, validation mandate,
  transport security, secrets policy, headers, OWASP baseline).

### SC-005 — Performance targets machine-verifiable

- [ ] Open `contracts/performance-contract.md`.
- [ ] Confirm LCP, CLS, and INP thresholds are numerical and unambiguous.
- [ ] Confirm a Lighthouse CI configuration could be written from this
  document without additional input.

### SC-006 — Deployment strategy derivable

- [ ] Open `contracts/deployment-contract.md`.
- [ ] Confirm a Docker Compose manifest can be drafted listing all four
  required services (`app`, `db`, `storage`, `proxy`) with their
  responsibilities and inter-service communication.
- [ ] Confirm the availability posture (best-effort: restart policy, daily
  backups) is explicit and requires no further interpretation.

---

## Artefact Inventory

Confirm all the following files exist and are non-empty:

| File | Status |
|---|---|
| `.specify/memory/constitution.md` (v1.0.0) | ✅ |
| `specs/001-phase-0-foundation/spec.md` | ✅ |
| `specs/001-phase-0-foundation/plan.md` | ✅ |
| `specs/001-phase-0-foundation/research.md` | ✅ |
| `specs/001-phase-0-foundation/data-model.md` | ✅ |
| `specs/001-phase-0-foundation/contracts/content-classification.md` | ✅ |
| `specs/001-phase-0-foundation/contracts/security-baseline.md` | ✅ |
| `specs/001-phase-0-foundation/contracts/performance-contract.md` | ✅ |
| `specs/001-phase-0-foundation/contracts/deployment-contract.md` | ✅ |
| `specs/001-phase-0-foundation/quickstart.md` | ✅ |

---

## Next Step

When all checklist items pass: proceed to Phase 1 with `/speckit.specify`
on branch `002-public-portfolio-mvp` (or equivalent sequential number).

Phase 1 scope per PLAN.md:
- Landing / hero section
- About section
- Skills / tech stack
- Experience summary
- Featured projects
- Contact call-to-action
- Responsive design (mobile-first)
- Basic SEO structure
