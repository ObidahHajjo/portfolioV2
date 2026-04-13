# Contract: Public Theme Surface Contract

**Feature**: Public Portfolio Terminal Theme Alignment  
**Branch**: `007-align-terminal-theme`  
**Date**: 2026-04-08

## Purpose

Define the public-facing route and surface expectations for the terminal-theme refresh so implementation preserves the current content structure while applying a consistent visual system.

## In-Scope Public Surfaces

| Surface                | Required Contract                                                                                                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                    | Must present the terminal-style dark visual system, homepage or hero receives the strongest ambient treatment, existing public sections keep their current order and self-hiding behavior |
| `/case-studies`        | Must share the same dark terminal token set and chrome language, but use calmer atmosphere than the homepage                                                                              |
| `/case-studies/[slug]` | Must share the same dark terminal token set, prioritize long-form readability, and avoid heavy effects that compete with narrative content                                                |

## Cross-Surface Invariants

1. No in-scope public page may expose a visitor-facing light mode or theme toggle.
2. Existing database-backed content remains authoritative; no page may inject replacement copy to make the theme work.
3. Decorative styling may enhance content blocks, but page hierarchy must still emphasize name, role, impact, navigation, and contact actions first.
4. Existing section visibility rules remain unchanged; a hidden section must not leave behind an empty terminal shell or orphaned divider.
5. All in-scope public pages must remain horizontally stable from 320px upward.

## Surface-Level Required Behaviors

| Concern            | Contract                                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigation         | Sticky header remains visible, keyboard reachable, and visually coherent with the terminal theme                                                |
| Hero / primary CTA | Must remain the strongest action cluster on the homepage even after decorative theming is applied                                               |
| Lists and cards    | Project, article, talk, testimonial, and case-study summaries may adopt terminal chrome, but link readability and scan speed must remain intact |
| Long-form content  | Narrative pages must use calmer backgrounds, clearer spacing, and lower ambient density than landing surfaces                                   |
| Empty sections     | Continue to collapse completely when no published content exists                                                                                |

## Prohibited Outcomes

1. Copying the reference portfolio's layout one-for-one when it conflicts with the current portfolio's information architecture.
2. Creating terminal shells or decorative panels that appear without real content inside them.
3. Using atmosphere that makes long-form case-study content harder to read than the current baseline.
4. Introducing route-specific color systems that break visual consistency across public pages.
