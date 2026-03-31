# Quickstart: Phase 5 - Production Hardening and Launch

**Branch**: `006-production-hardening-launch` | **Date**: 2026-03-31

This runbook is intentionally explicit so implementation can be executed step-by-step by smaller models with minimal inference.

---

## Prerequisites

- Phase 4 implementation is present and app runs locally.
- PostgreSQL and MinIO are running.
- Admin login works (`/admin/login`).
- Existing Prisma migrations are applied.

Verify baseline:

```bash
npx prisma migrate status
npm run dev
```

---

## Step 1: Install required package

```bash
npm install nodemailer
```

No other new runtime package is required for this phase.

---

## Step 2: Apply Prisma schema and migration

1. Update `prisma/schema.prisma` using `data-model.md`.
2. Generate migration:

```bash
npx prisma migrate dev --name phase5_production_hardening_launch
npx prisma generate
```

Expected migration impact:

- `SeoMetadata` canonical URL field
- `contact_submissions`
- `analytics_events`
- `error_events`
- `error_alerts`

---

## Step 3: Add environment variables

Add these variables to `.env` and `.env.example`:

| Variable         | Purpose                                               |
| ---------------- | ----------------------------------------------------- |
| `SMTP_HOST`      | SMTP server host                                      |
| `SMTP_PORT`      | SMTP server port                                      |
| `SMTP_SECURE`    | `true/false` TLS mode                                 |
| `SMTP_USER`      | SMTP username                                         |
| `SMTP_PASS`      | SMTP password                                         |
| `SMTP_FROM`      | Sender identity for contact and alert emails          |
| `ANALYTICS_SALT` | Secret random string used for session hash generation |

Use existing `ContactSettings.contactEmail` as destination recipient for both contact and alert emails.

---

## Step 4: Implement vertical slices in strict order

Implement exactly in this order:

1. SEO metadata resolution and `sitemap.ts`
2. Contact API and UI form integration
3. Analytics ingest endpoint and admin analytics page
4. Error monitoring endpoint, capture helpers, and threshold alerting
5. E2E/Lighthouse validation updates

Do not start a later slice until the previous slice runs locally.

---

## Step 5: Local verification checklist

### 5.1 SEO + sitemap

- Open home page and inspect `<head>` tags for title, description, canonical, OG, and Twitter.
- Load `http://localhost:3000/sitemap.xml` and confirm published URLs only.

### 5.2 Contact delivery

- Submit valid form; expect success UI and email arrival.
- Submit invalid payload; expect field errors and no request acceptance.
- Submit 6 valid requests from same origin within 60 min; expect 429 on sixth.
- Simulate SMTP failure; expect fallback email message shown.

### 5.3 Accessibility and performance

```bash
npm run test:e2e
npx lhci autorun
```

Pass criteria:

- Lighthouse Performance >= 0.90
- LCP <= 2500 ms
- CLS <= 0.1
- Keyboard navigation and visible focus confirmed

### 5.3.1 Performance Validation Steps (US4)

Run these steps to validate performance meets thresholds:

**Step 1: Desktop Lighthouse Audit**

```bash
npx lhci autorun --config=.lighthouserc.js
```

Expected results:

- Performance Score >= 0.90
- LCP <= 2500ms
- CLS <= 0.1
- INP <= 200ms

**Step 2: Mobile Lighthouse Audit**

```bash
npx lhci autorun --config=.lighthouserc.js --upload.target=lhci --collect.settings.preset=mobile
```

Expected results:

- Performance Score >= 0.90
- LCP <= 2500ms
- CLS <= 0.1
- TBT <= 450ms (higher threshold for mobile)

**Step 3: Run Performance Regression Tests**

```bash
npx playwright test tests/e2e/production-hardening.spec.ts --grep "Performance"
```

Expected: All tests pass

**Step 4: Manual Lighthouse Check (Chrome DevTools)**

1. Open Chrome DevTools (F12)
2. Navigate to Lighthouse tab
3. Select "Desktop" mode
4. Run audit
5. Verify:
   - Performance >= 90
   - LCP element is the hero heading
   - No layout shifts during load

**Step 5: Manual Mobile Check**

1. Open Chrome DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar
4. Run Lighthouse audit in mobile mode
5. Verify metrics meet mobile thresholds

**Step 6: Core Web Vitals Verification**

- LCP Target: < 2.5 seconds
- FID/INP Target: < 200 milliseconds
- CLS Target: < 0.1

If any metric fails:

1. Check for blocking resources in Network tab
2. Verify fonts are preloaded (display: swap)
3. Confirm images have explicit dimensions
4. Review Largest Contentful Paint element
5. Check for layout shifts in Performance tab

### 5.4 Monitoring and alerts

- Trigger controlled error in public route and admin route.
- Confirm `error_events` row appears within 60 seconds.
- Trigger 3+ errors in 10 minutes; confirm alert email arrives.

### 5.5 Analytics reporting

- Visit public pages from two browser sessions.
- Open `/admin/analytics` and verify totals, unique sessions, top pages, and referrer sources.

---

## Step 6: Launch readiness checks (pre-deploy)

1. `npm run build` succeeds.
2. Prisma migration applies cleanly on staging.
3. Smoke test contact, sitemap, analytics, and monitoring on staging.
4. Confirm no secrets committed and env vars documented.
5. Capture final Lighthouse report artifact for release notes.

---

## Step 7: Production deploy sequence

1. Pull branch on VPS.
2. Update `.env` with SMTP and analytics salt values.
3. Run migration:

```bash
npx prisma migrate deploy
```

4. Rebuild and restart Docker services:

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

5. Run post-deploy smoke checks:

- `/` metadata and page load
- `/sitemap.xml`
- contact submission
- `/admin/analytics`

If any smoke check fails, roll back to previous image and investigate using `error_events` records.

---

## Manual Accessibility Verification Checklist (US3)

### Screen Reader Verification

Complete this checklist using NVDA (Windows), VoiceOver (macOS), or JAWS:

#### Landmark Navigation

- [ ] Navigate by landmarks (Nav, Main, Section) and verify each landmark is announced correctly
- [ ] "Skip to main content" link is announced and functional
- [ ] Main content region is announced as "main" landmark

#### Heading Structure

- [ ] Verify single `<h1>` exists on the page
- [ ] Headings follow logical hierarchy (h1 -> h2 -> h3, no skipped levels)
- [ ] Section headings (About, Skills, Experience, Projects, Contact) are announced when navigating by headings

#### Form Accessibility

- [ ] Form fields are announced with their labels (Name, Email, Message)
- [ ] Required field indication is announced ("required" or similar)
- [ ] Error messages are announced when validation fails
- [ ] Success message is announced after form submission
- [ ] Error/success status changes are announced without losing context

#### Link and Button Announcements

- [ ] Navigation links are announced with their visible text
- [ ] External links indicate they open in new tab (aria-label or title)
- [ ] CTA buttons are announced with clear purpose
- [ ] Mobile menu toggle announces expanded/collapsed state

#### Image Announcements

- [ ] Meaningful images announce their alt text
- [ ] Decorative images are silent (empty alt attribute)
- [ ] Avatar images in testimonials announce the author name

#### Live Region Announcements

- [ ] Form validation errors are announced immediately (aria-live="assertive")
- [ ] Success messages are announced (aria-live="polite")
- [ ] Rate limit warnings are announced
- [ ] Error fallback messages are announced

### Keyboard Navigation Verification

Complete this checklist using keyboard only (Tab, Shift+Tab, Enter, Escape, Arrow keys):

#### Skip Link

- [ ] Press Tab on page load focuses skip link
- [ ] Press Enter on skip link moves focus to main content
- [ ] Skip link is visible when focused
- [ ] Skip link text clearly describes its purpose

#### Header Navigation

- [ ] Tab through all navigation links in order
- [ ] Focus indicator is clearly visible on each link
- [ ] Press Enter on nav link scrolls to section
- [ ] Home/logo link is focusable and functional

#### Mobile Menu (resize browser to mobile width)

- [ ] Hamburger button is focusable and has visible focus indicator
- [ ] Press Enter toggles menu open/closed
- [ ] aria-expanded attribute changes appropriately
- [ ] Escape key closes menu when open
- [ ] Focus moves to first menu item when menu opens
- [ ] Focus is trapped within menu while open
- [ ] Focus returns to hamburger button after closing menu

#### Hero Section

- [ ] CTA button is reachable via Tab
- [ ] CTA button has visible focus indicator
- [ ] Press Enter activates CTA (scrolls to section or navigates)

#### Projects Section

- [ ] All project links are reachable via Tab
- [ ] Repository and Demo links have visible focus indicators
- [ ] Links that open in new tab have appropriate indication

#### Contact Form

- [ ] Tab order: Name -> Email -> Message -> Submit button
- [ ] All form fields are focusable
- [ ] Focus indicator is visible on all inputs
- [ ] Error messages appear below fields on validation failure
- [ ] Submit button is focusable and has visible focus state
- [ ] Submit button disabled state is announced during submission
- [ ] Tab cycles back to skip link after last focusable element

#### Social Links

- [ ] All social links are reachable via Tab
- [ ] Links have visible focus indicators
- [ ] External links indicate new tab behavior

#### General Keyboard Behavior

- [ ] No keyboard traps (user can Tab through entire page)
- [ ] Focus order matches visual order
- [ ] Focus is never lost or hidden
- [ ] Focus indicator is clearly visible (not just color change)
- [ ] Focus indicator has sufficient contrast

### Visual Focus Indicator Checklist

- [ ] Focus ring has minimum 2px width
- [ ] Focus ring color has sufficient contrast (minimum 3:1)
- [ ] Focus ring offset prevents overlap with element
- [ ] Focus indicator is visible in both light and dark themes
- [ ] Focus indicator appears on all interactive elements (links, buttons, inputs)
- [ ] Focus indicator uses outline or ring, not just background color

### Color and Contrast

- [ ] All text meets WCAG AA contrast requirements (4.5:1 for normal text)
- [ ] Focus indicators meet contrast requirements (3:1 minimum)
- [ ] Information is not conveyed by color alone
- [ ] Error states use both color and text/icons

### Motion and Animation

- [ ] prefers-reduced-motion is respected
- [ ] Animations can be paused or disabled
- [ ] No content flashes more than 3 times per second

### Testing Tools Used

Record the tools used for verification:

- [ ] NVDA version: \***\*\_\_\_\_\*\***
- [ ] VoiceOver version: \***\*\_\_\_\_\*\***
- [ ] JAWS version: \***\*\_\_\_\_\*\***
- [ ] Browser tested: \***\*\_\_\_\_\*\***
- [ ] axe DevTools extension used: Yes/No
- [ ] Lighthouse accessibility audit score: \***\*\_\_\_\_\*\***

### Issues Found

Document any accessibility issues discovered during testing:

| Issue | WCAG Criterion | Severity | Resolution |
| ----- | -------------- | -------- | ---------- |
|       |                |          |            |

### Sign-off

- Tester: \***\*\_\_\_\_\*\***
- Date: \***\*\_\_\_\_\*\***
- All critical issues resolved: Yes/No
- Ready for production: Yes/No

---

## Full Verification Commands (Phase 9)

Run these commands to verify Phase 5 implementation is complete and working.

### 8.1 Environment Validation

```bash
# Check all Phase 5 env vars are documented
grep -E "^(SMTP_|ANALYTICS_)" .env.example
# Expected output:
# SMTP_HOST="smtp.example.com"
# SMTP_PORT="587"
# SMTP_SECURE="false"
# SMTP_USER="your-smtp-user"
# SMTP_PASS="your-smtp-password"
# SMTP_FROM="noreply@example.com"
# ANALYTICS_SALT="CHANGE_ME_random_32_characters_minimum"

# Validate env loads without errors
npm run build
# Expected: Build succeeds with no env-related errors
```

### 8.2 Database Schema Verification

```bash
# Check migration status
npx prisma migrate status
# Expected: "Database schema is up to date!"

# Verify Phase 5 tables exist
npx prisma db execute --stdin <<EOF
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('ContactSubmission', 'AnalyticsEvent', 'ErrorEvent', 'ErrorAlert');
EOF
# Expected: All four tables listed
```

### 8.3 Build and Type Check

```bash
# Type check
npm run typecheck || npx tsc --noEmit
# Expected: No errors

# Lint check
npm run lint
# Expected: No errors

# Production build
npm run build
# Expected: Build succeeds
```

### 8.4 API Endpoint Verification

```bash
# Start dev server (in separate terminal)
npm run dev

# Contact API - valid payload
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"This is a test message for verification"}'
# Expected: {"ok":true,"message":"Thanks - your message was sent successfully."}

# Contact API - invalid payload
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"invalid","message":"short"}'
# Expected: {"ok":false,"error":"Validation failed","fields":{...}}

# Analytics ingest
curl -X POST http://localhost:3000/api/analytics/page-view \
  -H "Content-Type: application/json" \
  -d '{"pagePath":"/","referrer":"https://google.com"}'
# Expected: {"ok":true}

# Monitoring ingest
curl -X POST http://localhost:3000/api/monitoring/error-events \
  -H "Content-Type: application/json" \
  -d '{"surface":"PUBLIC","pagePath":"/","message":"Test error for verification"}'
# Expected: {"ok":true}
```

### 8.5 Sitemap Verification

```bash
# Fetch sitemap
curl http://localhost:3000/sitemap.xml
# Expected: Valid XML with <urlset> containing public URLs
# Should NOT include /admin routes
# Should NOT include draft/unpublished content

# Validate XML structure
curl -s http://localhost:3000/sitemap.xml | grep -c "<url>"
# Expected: Count of published public URLs
```

### 8.6 SEO Metadata Verification

```bash
# Check homepage metadata
curl -s http://localhost:3000/ | grep -E "<title>|<meta name=\"description\"|og:|twitter:"
# Expected: Title, description, og:title, og:description, twitter:card tags present
```

### 8.7 Error Response Format Verification

All Phase 5 API endpoints should return consistent error format:

```typescript
// Expected format for errors:
{ ok: false, error?: string, fields?: Record<string, string> }

// Contact validation error (422):
{ ok: false, error: "Validation failed", fields: { email: "Invalid email" } }

// Contact rate limit (429):
{ ok: false, error: "Too many submissions. Please try again later." }

// Contact SMTP failure (503):
{ ok: false, error: "We could not send your message right now.", fallbackEmail: "..." }
```

### 8.8 Launch Checklist Document

```bash
# Verify launch checklist exists
ls docs/phase-5-launch-checklist.md
# Expected: File exists

# Verify README has Phase 5 section
grep -A5 "Phase 5" README.md
# Expected: Phase 5 documentation section present
```

### 8.9 Full E2E Test Suite

```bash
# Run all E2E tests
npm run test:e2e
# Expected: All tests pass

# Run specific Phase 5 tests (if tagged)
npx playwright test tests/e2e/production-hardening.spec.ts
# Expected: All tests pass
```

### 8.10 Lighthouse Audit

```bash
# Run Lighthouse CI
npx lhci autorun
# Expected:
# - Performance >= 0.90
# - Accessibility >= 0.90
# - Best Practices >= 0.90
# - SEO >= 0.90
```

---

## Verification Results Template

Record verification results below:

| Check                            | Status              | Notes |
| -------------------------------- | ------------------- | ----- |
| Environment variables documented | [ ] Pass / [ ] Fail |       |
| Database migration applied       | [ ] Pass / [ ] Fail |       |
| Type check passes                | [ ] Pass / [ ] Fail |       |
| Lint passes                      | [ ] Pass / [ ] Fail |       |
| Build succeeds                   | [ ] Pass / [ ] Fail |       |
| Contact API works                | [ ] Pass / [ ] Fail |       |
| Analytics API works              | [ ] Pass / [ ] Fail |       |
| Monitoring API works             | [ ] Pass / [ ] Fail |       |
| Sitemap valid                    | [ ] Pass / [ ] Fail |       |
| SEO metadata present             | [ ] Pass / [ ] Fail |       |
| Error format consistent          | [ ] Pass / [ ] Fail |       |
| Launch checklist exists          | [ ] Pass / [ ] Fail |       |
| E2E tests pass                   | [ ] Pass / [ ] Fail |       |
| Lighthouse >= 90                 | [ ] Pass / [ ] Fail |       |

**Verified by**: \***\*\_\_\_\_\*\***
**Date**: \***\*\_\_\_\_\*\***
**Ready for production**: Yes/No
