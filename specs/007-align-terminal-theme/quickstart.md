# Quickstart: Public Portfolio Terminal Theme Alignment

**Branch**: `007-align-terminal-theme` | **Date**: 2026-04-08

This runbook verifies the public terminal-theme refresh locally after implementation.

---

## Prerequisites

The existing portfolio stack must already be working locally:

- PostgreSQL available and populated with current portfolio data
- MinIO available if public media assets are already configured in your environment
- Existing public pages render successfully before the theme refresh
- Node modules installed

If your local database is empty, run the existing seed flow before validation so homepage and case-study content are available.

---

## Step 1: Confirm No Schema or Dependency Setup Is Needed

This feature should not require:

- a new Prisma migration
- new environment variables
- new object-storage configuration
- new npm packages

If any of those become necessary during implementation, stop and reassess the feature scope before continuing.

---

## Step 2: Start the App

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Step 3: Validate Homepage Theme Alignment

Review the homepage and confirm:

1. The public experience is a single dark terminal-style theme.
2. The hero or first viewport carries the strongest ambient treatment.
3. The developer name, role, and primary CTA remain more prominent than decoration.
4. Existing public sections still appear in their current order and hidden sections remain absent.

---

## Step 4: Validate Supporting Public Routes

Open the public routes that already exist in local data:

1. `http://localhost:3000/case-studies`
2. `http://localhost:3000/case-studies/[slug]`
3. `http://localhost:3000/case-studies/not-a-real-case-study`

Confirm:

1. They use the same terminal-style dark visual system as the homepage.
2. Their atmosphere is calmer than the homepage or hero.
3. Long-form content remains easy to read with no clipping, overlap, or excessive glow.
4. Missing case-study routes fail gracefully with themed fallback UI.

---

## Step 5: Validate Reduced Motion Behavior

Enable reduced-motion preference in the browser or operating system, then reload the homepage and a case-study page.

Confirm:

1. Non-essential ambient motion is removed or substantially softened.
2. The page still feels coherent and polished without full animation.
3. Navigation and CTAs are unaffected.

---

## Step 6: Run Public Regression Coverage

```bash
npm run test:e2e
npm run test:mobile
npx playwright test tests/e2e/accessibility.spec.ts
npx playwright test tests/e2e/performance.spec.ts
```

Expected outcomes:

1. Homepage content remains visible and navigable.
2. Mobile overflow checks continue to pass.
3. Keyboard navigation and visible-focus checks continue to pass.
4. Performance guardrails remain within the feature targets for homepage and case-study routes.

---

## Step 7: Accessibility Audit Pass

Perform an accessibility scan in browser devtools or your preferred audit tool and confirm:

1. No critical issues are reported on the homepage.
2. Decorative motion/background layers remain outside the accessibility tree.
3. Focus order and landmark structure remain intact.

---

## Step 8: Manual Acceptance Checklist

- [ ] Homepage presents a strong terminal-style first impression
- [ ] Public pages share one dark visual system
- [ ] No public theme toggle or light mode is exposed
- [ ] Hero retains strongest atmospheric treatment
- [ ] Case-study pages are calmer and easier to read than the homepage
- [ ] Case-study not-found UI is themed and graceful
- [ ] No horizontal overflow at mobile widths
- [ ] Focus indicators remain obvious on the dark theme
- [ ] Missing sections still self-hide cleanly
- [ ] Draft content behavior remains unchanged
- [ ] Homepage and case-study routes stay within user-visible performance guardrails

---

## Environment Variables

No new environment variables are introduced for this feature.
