# Data Model: Public Portfolio Terminal Theme Alignment

**Branch**: `007-align-terminal-theme` | **Date**: 2026-04-08

## Overview

This feature introduces **no persistent data-model changes**. PostgreSQL tables, Prisma models, MinIO objects, and public content query shapes remain unchanged.

The only new model concerns are **presentation-layer entities** that describe how the existing public content is themed and displayed.

---

## Persistent Impact

| Area                            | Change        |
| ------------------------------- | ------------- |
| PostgreSQL schema               | None          |
| Prisma models                   | None          |
| Seed data                       | None required |
| MinIO objects                   | None          |
| Admin-managed content structure | None          |

---

## Presentation-Layer Entities

### 1. Theme Token Set

Represents the shared terminal-style visual semantics applied across all in-scope public pages.

| Field             | Type             | Rules                                                       |
| ----------------- | ---------------- | ----------------------------------------------------------- |
| `mode`            | Enum-like string | Fixed to `dark-terminal` for this feature                   |
| `background`      | Color token      | Primary page background; must support contrast-safe text    |
| `foreground`      | Color token      | Primary text color                                          |
| `panel`           | Color token      | Card, panel, and terminal window surfaces                   |
| `border`          | Color token      | Panel outlines, separators, and chrome                      |
| `primaryAccent`   | Color token      | Main terminal green emphasis                                |
| `secondaryAccent` | Color token      | Supporting accent for links, prompts, or secondary emphasis |
| `muted`           | Color token      | Lower-emphasis copy and metadata                            |
| `focusRing`       | Color token      | Visible keyboard focus indicator                            |
| `glow`            | Effect token     | Used sparingly for hero emphasis and terminal chrome        |

**Validation rules**:

- Normal text must maintain contrast of at least 4.5:1 against its surface
- Accent tokens cannot become the only signal for interactive state; focus and hover still need visible structural cues
- Token names remain semantic so sections and routes can share them consistently

---

### 2. Public Surface Theme Profile

Defines how strongly the terminal theme is expressed on each public route group.

| Field              | Type             | Rules                                                                       |
| ------------------ | ---------------- | --------------------------------------------------------------------------- |
| `surfaceKey`       | String           | Unique route-level key such as `home`, `caseStudiesList`, `caseStudyDetail` |
| `contentMode`      | Enum-like string | `landing`, `listing`, or `longForm`                                         |
| `ambientIntensity` | Enum-like string | `strong` for homepage or hero, `light` for supporting surfaces              |
| `chromeLevel`      | Enum-like string | Degree of terminal framing around nav, cards, and section wrappers          |
| `readingPriority`  | Boolean          | `true` on long-form surfaces where prose readability outweighs atmosphere   |

**Relationships**:

- Each `Public Surface Theme Profile` consumes the shared `Theme Token Set`
- Each public route group maps to exactly one surface profile

---

### 3. Ambient Effect Profile

Describes optional decorative layers such as matrix-style backdrops, scanlines, glow, or prompt styling.

| Field                   | Type             | Rules                                                                      |
| ----------------------- | ---------------- | -------------------------------------------------------------------------- |
| `effectKey`             | String           | Unique effect identifier                                                   |
| `scope`                 | String           | Route or component scope where the effect may appear                       |
| `defaultIntensity`      | Enum-like string | `strong`, `light`, or `off`                                                |
| `reducedMotionBehavior` | Enum-like string | `off` or `softened`; must never stay at full intensity                     |
| `assistiveExposure`     | Boolean          | Always `false`; decorative effects must stay out of the accessibility tree |

### Behavioral states

| State                    | Trigger                                  | Outcome                                         |
| ------------------------ | ---------------------------------------- | ----------------------------------------------- |
| Default                  | Standard browsing                        | Effect renders at its configured intensity      |
| Reduced motion           | Visitor preference present               | Effect is disabled or substantially softened    |
| Unsupported / suppressed | Browser blocks or fails to render effect | Core content remains unchanged and fully usable |

---

### 4. Section Presentation Contract

Represents how each existing public content section is wrapped by the theme without changing its data source.

| Field                 | Type             | Rules                                                                                                                                                        |
| --------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sectionKey`          | String           | Existing public section identifier such as `hero`, `about`, `skills`, `experience`, `projects`, `contact`, `testimonials`, `articles`, `openSource`, `talks` |
| `contentSource`       | Reference        | Existing loader or query remains authoritative                                                                                                               |
| `wrapperStyle`        | Enum-like string | Terminal panel, grid card, prose panel, or minimal section chrome                                                                                            |
| `emptyBehavior`       | Enum-like string | Must remain `hide` when underlying public content is absent                                                                                                  |
| `interactionPriority` | Enum-like string | `high` for navigation and CTAs, `standard` for supporting cards and links                                                                                    |

**Validation rules**:

- Themed wrappers must not render if the underlying public section already self-hides due to missing content
- CTA and navigation sections must retain the most prominent interaction styling on the page
- Long text content cannot be clipped or forced into fixed-height terminal shells

---

## Cross-Cutting Rules

1. No public theme preference is persisted or read from storage.
2. Existing published-only content filtering remains the source of truth for all public visibility decisions.
3. Decorative layers never carry business-critical information.
4. Public long-form surfaces always choose readability over atmospheric density.
