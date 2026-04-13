# Research: Public Portfolio Terminal Theme Alignment

**Branch**: `007-align-terminal-theme` | **Date**: 2026-04-08

All user-facing scope ambiguities were resolved during `/speckit.clarify`. This document captures the implementation-level decisions needed to execute the feature cleanly on the existing stack.

---

## Decision 1: Theme Alignment Strategy

**Decision**: Align the public portfolio to the reference portfolio's core visual system and signature terminal effects, but preserve the current route structure, section order, and content composition rather than attempting a page-for-page reproduction.

**Rationale**: The current application already has a data-driven homepage, public case-study pages, advanced content sections, and an accessibility/performance baseline. Rebuilding the public experience to mirror the reference layout exactly would create unnecessary churn, weaken content continuity, and increase regression risk without adding business value.

**Alternatives considered**:

- Near-exact reproduction of the reference portfolio: rejected — too much structural churn for a presentation-only feature
- Broad stylistic inspiration only: rejected — too weak to satisfy the requested alignment

---

## Decision 2: Theme Token Strategy

**Decision**: Drive the terminal theme through shared global design tokens and reusable utilities in the public theme layer, then restyle existing public components to consume those semantics instead of embedding ad hoc one-off colors in each section.

**Rationale**: The current app already centralizes color primitives through `src/app/globals.css` and `tailwind.config.ts`. Moving the terminal palette, contrast-safe emphasis states, glow treatments, and shared chrome into global tokens preserves consistency across the homepage and case-study routes while keeping future adjustments small and low-risk.

**Alternatives considered**:

- Per-component restyling with hardcoded colors: rejected — inconsistent and hard to maintain
- Separate parallel stylesheet for only the homepage: rejected — breaks coherence across public routes

---

## Decision 3: Ambient Effects Placement

**Decision**: Apply lightweight terminal styling across all in-scope public pages, while reserving the strongest ambient effects for the homepage or hero area. Long-form pages such as case-study detail views use calmer decoration and prioritize content readability.

**Rationale**: The homepage benefits most from atmosphere because it sets first impression. Long-form content pages need stronger reading ergonomics and lower visual noise. This split preserves the reference feel without harming scannability, accessibility, or performance on narrative-heavy pages.

**Alternatives considered**:

- Strong ambient effects everywhere: rejected — too distracting on long-form content and higher performance risk
- No ambient effects at all: rejected — loses too much of the reference portfolio's signature identity

---

## Decision 4: Motion and Decorative Rendering Rules

**Decision**: Any animated decorative layer must be non-essential, client-isolated, and disabled or substantially softened when reduced-motion preferences are present. Decorative surfaces must be excluded from the accessibility tree.

**Rationale**: The reference portfolio uses ambient motion as atmosphere, not as content. Treating these layers as optional avoids breaking server-rendered core content, preserves no-JavaScript readability for meaningful text, and keeps keyboard and screen-reader behavior deterministic.

**Alternatives considered**:

- Server-render decorative animation into the critical page path: rejected — unnecessary for non-essential presentation
- Ignore reduced-motion preferences: rejected — violates existing accessibility requirements

---

## Decision 5: Validation Strategy

**Decision**: Reuse the existing Playwright public regression suite as the acceptance baseline, extending it where necessary for terminal-theme-specific expectations such as no horizontal overflow, preserved focus visibility, and stable behavior on homepage and case-study routes. Manual verification remains necessary for overall visual fidelity and reduced-motion behavior.

**Rationale**: The repo already contains coverage for public content visibility, keyboard navigation, and mobile overflow. Those tests directly map to the biggest risks of a theme refactor. Screenshot-diff testing is not required to get meaningful confidence because the primary pass/fail criteria are usability, stability, and preserved structure rather than pixel-perfect rendering.

**Alternatives considered**:

- Manual review only: rejected — too weak for a cross-cutting UI refactor
- Snapshot-heavy visual regression suite: rejected — higher setup cost than justified for this feature branch

---

## Decision 6: Dependency and Persistence Scope

**Decision**: Introduce no new database schema, environment variables, object-storage paths, or npm dependencies for this feature unless implementation reveals a blocker that cannot be solved within the current stack.

**Rationale**: The requested change is presentation-oriented. The existing Next.js, Tailwind, shadcn, and Playwright stack is sufficient to express a terminal-style theme, handle ambient client-side decoration, and validate public regressions. Avoiding new dependencies reduces security review, bundle growth, and implementation noise.

**Alternatives considered**:

- Add new animation or theming libraries up front: rejected — unnecessary until proven otherwise
- Persist public theme state or expose a theme toggle: rejected — explicitly out of scope after clarification
