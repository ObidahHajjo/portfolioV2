# Design Principles

This document defines the pass/fail standard for all public-facing UI work.
Every future public interface must satisfy these rules.

## 1. Mobile-First Responsive Design

- Design and implementation start from the smallest viewport first
- No desktop-only layouts are permitted
- Every public section must remain usable at a minimum width of 320px
- Breakpoints refine layouts; they must not rescue a broken base layout

## 2. Visual Hierarchy for Recruiters

- Key information must be scannable within seconds
- The most valuable signals stay above the fold whenever practical
- Headlines, role summaries, impact, and calls to action must be easy to spot
- Decorative patterns must never compete with hiring-relevant content

## 3. Accessibility Standard

- WCAG 2.1 AA is the minimum acceptable standard
- Semantic HTML is required for all public pages and components
- Keyboard navigation is required for all interactive elements
- All images require meaningful `alt` text or empty alt when decorative
- Normal text must maintain a contrast ratio of at least 4.5:1

## 4. Typography and Layout Consistency

- Use no more than 2 font families across the public experience
- Use a consistent spacing scale; Tailwind defaults are the baseline
- Avoid arbitrary pixel values when an existing scale token is available
- Layout rhythm, heading hierarchy, and content widths must remain consistent

## 5. User-Visible Performance

- Largest Contentful Paint (LCP) must stay below 2.5 seconds
- Cumulative Layout Shift (CLS) must stay below 0.1
- Interaction to Next Paint (INP) must stay below 200 milliseconds
- Full performance targets remain authoritative in `specs/001-phase-0-foundation/contracts/performance-contract.md`

## 6. Content Graceful Degradation

- Every public section must render safely when content is empty, partial, or missing
- No visitor-facing section may show a broken, crashed, or placeholder-failure state
- Missing optional content should collapse cleanly or fall back to sensible defaults
- Draft content must never leak into public routes or public API responses
