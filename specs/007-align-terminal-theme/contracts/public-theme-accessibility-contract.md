# Contract: Public Theme Accessibility and Motion Contract

**Feature**: Public Portfolio Terminal Theme Alignment  
**Branch**: `007-align-terminal-theme`  
**Date**: 2026-04-08

## Purpose

Define the non-functional interaction rules that the terminal-theme refresh must preserve across the public portfolio.

## Accessibility Contract

| Concern            | Requirement                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| Focus visibility   | Every public interactive element must retain a clearly visible focus indicator against the dark terminal theme |
| Contrast           | Normal text must maintain at least 4.5:1 contrast against its surface                                          |
| Semantic structure | Decorative wrappers must not break existing heading hierarchy, landmarks, or link semantics                    |
| Decorative media   | Ambient canvases, scanlines, and glow-only visuals must be hidden from assistive technologies                  |
| Keyboard order     | Navigation, hero actions, content links, and contact controls must keep a logical tab order                    |

## Motion Contract

| Concern            | Requirement                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| Ambient animation  | Decorative only; must never carry essential information                                                         |
| Reduced motion     | Animated ambient effects must be disabled or substantially softened when reduced-motion preferences are present |
| Long-form surfaces | Case-study list and detail pages use calmer motion and lower atmospheric density than the homepage or hero      |
| Failure mode       | If a decorative layer fails to render, the page must remain readable and operable with no layout breakage       |

## Performance Protection Contract

1. Decorative effects must not create perceptible layout instability.
2. Core content must remain visible promptly even if atmospheric layers initialize late or not at all.
3. Ambient effects must not block navigation, keyboard input, or contact interactions.

## Validation Expectations

1. Existing keyboard and accessibility Playwright coverage must continue to pass.
2. Mobile overflow checks must continue to pass at 375px.
3. Manual reduced-motion verification must confirm that the themed experience remains coherent without full ambient animation.
