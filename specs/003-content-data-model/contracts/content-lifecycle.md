# Contract: Content Lifecycle States

**Feature Branch**: `003-content-data-model`
**Date**: 2026-03-29
**Applies to**: All list entities — SocialLink, Experience, Skill, Project, Testimonial

---

## State Machine

```
         ┌───────────┐
  create │           │ publish()
 ───────▶│   DRAFT   │──────────▶ PUBLISHED
         │           │
         └───────────┘
               ▲
               │ unpublish()
               │
         ┌─────┴─────┐
         │ PUBLISHED  │
         └───────────┘
               │
               │ hide() / show()
               ▼
         ┌───────────┐
         │  HIDDEN   │ (published=true, isVisible=false)
         └───────────┘
```

## State Definitions

| State | `published` | `isVisible` | Public Visible? | Admin Visible? |
|---|---|---|---|---|
| DRAFT | `false` | `true` | No | Yes |
| PUBLISHED | `true` | `true` | **Yes** | Yes |
| HIDDEN | `true` | `false` | No | Yes |

> **DRAFT** with `isVisible=false` is treated identically to DRAFT — still not public.

## Transition Rules

| Transition | From | To | Condition |
|---|---|---|---|
| `publish()` | DRAFT | PUBLISHED | All required fields must be non-null |
| `unpublish()` | PUBLISHED | DRAFT | None |
| `unpublish()` | HIDDEN | DRAFT | None |
| `hide()` | PUBLISHED | HIDDEN | Must be currently published |
| `show()` | HIDDEN | PUBLISHED | None |

## Enforcement

- Transitions are performed via admin API endpoints (Phase 3)
- All transitions MUST be validated server-side with Zod before persistence
- The public rendering layer MUST filter `WHERE published = true AND isVisible = true`
- No transition may result in draft or hidden content appearing on any public route

## CaseStudy Exception

`CaseStudy` has no lifecycle state of its own. Its public visibility is entirely determined by its parent `Project`:
- A case study is publicly visible if and only if `project.published = true AND project.isVisible = true`
- Hiding or unpublishing a project automatically hides its case study

## Singleton Exception

`Profile`, `Hero`, and `ContactSettings` have no lifecycle state. They are always active and always readable. There is no mechanism to "draft" or "hide" a singleton — they represent required site configuration.
