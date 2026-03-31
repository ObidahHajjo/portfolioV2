# Feature Specification: Production Hardening & Launch

**Feature Branch**: `006-production-hardening-launch`
**Created**: 2026-03-31
**Status**: Draft
**Input**: User description: "the phase 5 — Production Hardening & Launch"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - SEO Discovery & Social Sharing (Priority: P1)

A recruiter or potential employer searches for the portfolio owner by name or technical expertise on a search engine. The portfolio appears in search results with a meaningful title and description. When the recruiter shares the portfolio URL in Slack or LinkedIn, a rich preview card appears with a professional image, title, and summary — creating a strong first impression before anyone visits the page.

**Why this priority**: Discoverability drives all other value. Without SEO and social metadata, the portfolio is invisible to its primary audience. This is the highest-leverage launch prerequisite.

**Independent Test**: Can be fully tested by inspecting the page `<head>` tags, sharing a URL in a social media link debugger, and verifying Google Search Console crawl results — all without deploying other features.

**Acceptance Scenarios**:

1. **Given** a visitor searches Google for the portfolio owner's name, **When** the portfolio has been indexed, **Then** the result shows the correct page title, meta description, and canonical URL.
2. **Given** a user pastes the portfolio URL into a social platform (LinkedIn, Slack, X), **When** the platform fetches the preview, **Then** it displays the correct Open Graph title, description, and image.
3. **Given** a bot crawls the site, **When** it requests `/sitemap.xml`, **Then** it receives a valid sitemap listing all public pages with accurate last-modified dates.
4. **Given** the admin updates the SEO metadata fields, **When** the change is published, **Then** the updated meta tags appear on the next page load.

---

### User Story 2 - Contact Form Message Delivery (Priority: P2)

A recruiter or hiring manager fills out the contact form on the public portfolio and submits their message. The portfolio owner receives the message via email promptly. The submitter sees immediate confirmation that their message was sent, giving them confidence without needing to follow up.

**Why this priority**: The contact form is the primary conversion action of the entire portfolio. Without reliable delivery, the portfolio fails its main business goal. This must work before launch.

**Independent Test**: Can be fully tested by submitting the contact form and verifying email delivery to the portfolio owner's inbox, independent of SEO, analytics, or other launch features.

**Acceptance Scenarios**:

1. **Given** a visitor fills in name, email, and message fields correctly, **When** they submit the form, **Then** the portfolio owner receives an email with all submitted details within 2 minutes.
2. **Given** a visitor submits the contact form, **When** the submission is accepted, **Then** the visitor sees a success confirmation message on the page.
3. **Given** a visitor submits an invalid email address or empty required fields, **When** they attempt to submit, **Then** clear field-level error messages are shown and the form is not submitted.
4. **Given** a single origin submits the contact form more than 5 times within 60 minutes, **When** the 6th submission is attempted, **Then** it is rejected with a clear message and no email is sent.

---

### User Story 3 - Accessibility Compliance (Priority: P3)

A visitor using a screen reader navigates the portfolio from top to bottom. They can reach every section, understand all content, and activate all interactive elements using only a keyboard. The portfolio is usable by people with visual, motor, or cognitive impairments, reflecting the professional standards expected of a senior engineer.

**Why this priority**: Accessibility is a legal and ethical requirement and a direct signal of engineering quality to technical hiring managers. It must be verified before launch but does not block contact delivery or SEO.

**Independent Test**: Can be fully tested by running an automated accessibility audit and a manual keyboard-navigation walkthrough on the public portfolio, independent of other features.

**Acceptance Scenarios**:

1. **Given** a screen reader user visits the portfolio, **When** they navigate using standard screen reader commands, **Then** all sections, headings, links, and buttons are announced correctly and in logical order.
2. **Given** a keyboard-only user visits the portfolio, **When** they tab through interactive elements, **Then** focus is visible at all times and all interactive elements are reachable and activatable.
3. **Given** an automated accessibility audit is run, **When** the results are reviewed, **Then** there are zero critical violations and no more than 5 moderate violations.
4. **Given** the page contains images, **When** they are inspected, **Then** all meaningful images have descriptive alt text and decorative images have empty alt attributes.

---

### User Story 4 - Performance & Core Web Vitals (Priority: P4)

A recruiter visits the portfolio on a mid-range mobile device over a standard 4G connection. Pages load quickly, animations are smooth, and there is no layout shift. The experience signals engineering professionalism — a portfolio that is slow or janky would undermine the owner's credibility as a senior developer.

**Why this priority**: Performance is a quality signal, not a functional requirement. It matters for SEO rankings and recruiter perception, but does not block the core functionality of contact or discovery.

**Independent Test**: Can be fully tested by running a Lighthouse audit on the deployed public portfolio and reviewing Core Web Vitals metrics, independent of other features.

**Acceptance Scenarios**:

1. **Given** a Lighthouse audit is run on the home page, **When** results are reviewed, **Then** the Performance score is 90 or above.
2. **Given** a visitor loads the portfolio on a mobile device, **When** they view the page, **Then** no visible layout shift occurs after the initial render (Cumulative Layout Shift below 0.1).
3. **Given** a visitor loads the portfolio, **When** they interact with the page, **Then** the largest visible content element loads within 2.5 seconds on a simulated mid-range connection.
4. **Given** the portfolio includes images, **When** they are loaded, **Then** images are sized appropriately and do not block the critical rendering path.

---

### User Story 5 - Error Monitoring & Operational Visibility (Priority: P5)

The portfolio owner receives an alert when an unhandled error occurs on the platform — whether on the public site or the admin portal. They can investigate the cause without having to reproduce the issue manually. The system captures sufficient context (page, user action, timestamp) to diagnose and fix issues quickly after launch.

**Why this priority**: Production monitoring is essential for maintaining reliability post-launch but does not need to exist before the first deployment. It can be enabled alongside or immediately after launch.

**Independent Test**: Can be fully tested by triggering a deliberate error on a staging environment and verifying that the error is captured and an alert is generated, independent of other launch features.

**Acceptance Scenarios**:

1. **Given** an unhandled error occurs on any public page, **When** the error is triggered, **Then** it is captured with the page URL, timestamp, and error message within 60 seconds.
2. **Given** an unhandled error occurs on the admin portal, **When** the error is triggered, **Then** it is captured and the admin user sees a user-friendly error message (not a raw stack trace).
3. **Given** an error threshold is exceeded (3+ errors within 10 minutes), **When** the threshold is breached, **Then** the portfolio owner receives a notification alert.
4. **Given** the monitoring system is active, **When** all pages are functioning normally, **Then** no false-positive alerts are generated during normal operation.

---

### User Story 6 - Analytics Visibility (Priority: P6)

The portfolio owner logs into the admin portal and navigates to an analytics page that shows how many visitors have viewed the portfolio, which pages they visited most, and where traffic is coming from. All data is stored on the owner's own server — no third-party analytics service is involved. This data informs future content decisions and helps the owner understand the effectiveness of job applications.

**Why this priority**: Analytics are informational and do not affect visitor experience. They are valuable for post-launch optimization but are not a launch blocker.

**Independent Test**: Can be fully tested by visiting the portfolio from multiple browsers/devices and verifying that page views and referral sources appear in the admin portal analytics page within 24 hours.

**Acceptance Scenarios**:

1. **Given** a visitor views the public portfolio, **When** they navigate between pages, **Then** each page view is recorded server-side without identifying the visitor personally (no personal identifiers stored).
2. **Given** the portfolio owner opens the analytics page within the admin portal, **When** they filter by date range, **Then** they can see total visits, top pages, and referral sources for the selected period.
3. **Given** analytics are enabled, **When** any visitor views the portfolio, **Then** only anonymised, aggregate data is collected (no personal identifiers, no cookies tied to individuals), making consent management unnecessary under a privacy-first approach.

---

### Edge Cases

- What happens when the contact form email delivery service is unavailable? The visitor receives an immediate, user-friendly error message and the page displays a direct fallback contact method (e.g., the portfolio owner's email address). No queuing or retry logic is required; the visitor can use the fallback to make contact directly.
- What happens when the sitemap includes a page that returns a 404 error? Broken URLs must be excluded from the sitemap automatically.
- What happens when SEO metadata fields are empty in the admin? The system must fall back to sensible defaults rather than outputting empty or missing tags.
- What happens when analytics scripts fail to load (ad blockers, network errors)? The page must function normally without analytics — analytics are non-blocking.
- What happens when the monitoring system itself fails? The primary application must continue operating normally regardless of monitoring service availability.
- What happens when a contact form is submitted with a very long message or unusual Unicode characters? The input must be sanitised and stored safely, and the email must be delivered without formatting errors.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST generate and serve valid SEO metadata (title, meta description, canonical URL) for every public-facing page, with values manageable via the admin portal.
- **FR-002**: System MUST generate and serve Open Graph and Twitter Card metadata for all public pages, enabling rich link previews on social platforms.
- **FR-003**: System MUST automatically generate and serve a valid XML sitemap containing all published public pages, updated whenever content is published or unpublished.
- **FR-004**: System MUST deliver contact form submissions to the portfolio owner's configured email address within 2 minutes of submission.
- **FR-005**: System MUST provide field-level validation on the contact form, preventing submission of malformed or incomplete data.
- **FR-006**: System MUST apply rate limiting to the contact form endpoint, rejecting submissions once a single origin (IP address) exceeds 5 submissions within a 60-minute window, and returning a clear rejection message to the visitor.
- **FR-007**: System MUST display a success confirmation to the visitor after a valid contact form submission is accepted.
- **FR-019**: When email delivery fails at submission time, the system MUST display a user-friendly error message and surface a direct fallback contact method (the portfolio owner's email address) so the visitor can make contact without resubmitting.
- **FR-008**: System MUST meet WCAG 2.1 Level AA accessibility standards on all public-facing pages, with zero critical violations.
- **FR-009**: All public pages MUST be fully keyboard navigable, with visible focus indicators on all interactive elements at all times.
- **FR-010**: All meaningful images MUST have descriptive alt text; decorative images MUST have empty alt attributes.
- **FR-011**: System MUST achieve a Lighthouse Performance score of 90 or above on the home page.
- **FR-012**: Public pages MUST have a Cumulative Layout Shift (CLS) score below 0.1.
- **FR-013**: System MUST capture all unhandled runtime errors (public site and admin portal) with page URL, timestamp, and error message.
- **FR-014**: System MUST notify the portfolio owner via email when error thresholds are exceeded (3 or more errors within a 10-minute window), using the same configured email address as the contact form recipient.
- **FR-015**: Admin users MUST see a user-friendly error message (not a raw stack trace) when an unhandled error occurs in the admin portal.
- **FR-016**: System MUST record anonymised page view analytics server-side for all public pages — capturing page path, referrer, timestamp, and an anonymised session identifier — with no personal identifiers and no client-side third-party analytics scripts.
- **FR-017**: Analytics recording MUST NOT block page rendering or degrade visitor experience; server-side recording failures must be handled silently without affecting the page response.
- **FR-020**: The admin portal MUST include an analytics page displaying total visits, unique sessions, top pages, and referral sources, filterable by date range (last 7 days, 30 days, 90 days, custom).
- **FR-018**: The contact form recipient email address MUST be configurable via the admin portal or environment configuration without code changes.

### Key Entities

- **SEO Metadata Record**: Per-page configuration holding title, meta description, Open Graph image, and canonical URL overrides; linked to content records managed in the admin.
- **Contact Submission**: A record of a submitted contact form including sender name, email, message, submission timestamp, and delivery status.
- **Sitemap Entry**: A representation of a public-facing URL with its last-modified date, used to generate the XML sitemap dynamically.
- **Error Event**: A captured runtime error record containing page URL, error message, stack context (sanitised), timestamp, and severity level.
- **Analytics Event**: An anonymised page view record stored server-side, containing page path, referrer source, timestamp, and a non-personal session identifier (e.g., a daily hash derived from IP + user-agent, never stored raw). No client-side third-party script involved.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of public pages include valid, non-empty SEO title and meta description tags at the time of launch.
- **SC-002**: Portfolio URLs generate correct rich preview cards on LinkedIn, Slack, and X (verified via official link debugger tools for each platform).
- **SC-003**: The XML sitemap lists all published public pages with no broken or unpublished URLs included.
- **SC-004**: Contact form messages are received in the portfolio owner's inbox within 2 minutes of submission in 99% of test cases.
- **SC-005**: The contact form rejects submissions with missing required fields 100% of the time, with field-level error messages visible to the user.
- **SC-006**: An automated accessibility audit on the public portfolio returns zero critical violations and no more than 5 moderate violations.
- **SC-007**: All interactive elements on every public page are reachable and activatable using keyboard navigation alone.
- **SC-008**: The home page achieves a Lighthouse Performance score of 90 or above on both desktop and mobile profiles.
- **SC-009**: Cumulative Layout Shift is below 0.1 on all public pages when tested on a simulated mid-range mobile device.
- **SC-010**: Unhandled runtime errors are captured and visible in the monitoring system within 60 seconds of occurrence.
- **SC-011**: The portfolio owner receives an alert notification within 5 minutes when the error threshold (3 errors in 10 minutes) is breached.
- **SC-012**: Page view data for the public portfolio is visible in the admin portal analytics page within 24 hours of the first visit, with correct totals, top pages, and referral source breakdowns.

---

## Assumptions

- SEO metadata fields (title, description, Open Graph image) are editable per page via the existing admin portal, extending the content data model established in Phase 2.
- The portfolio owner has a single email address configured to receive contact form submissions; multi-recipient routing is out of scope for this phase.
- The portfolio is deployed in an EU/UK jurisdiction where GDPR applies. Analytics MUST use a privacy-first approach (no personal identifiers, no cross-session individual tracking) so that no consent banner is required. Cookie consent management is out of scope for this phase.
- The email delivery mechanism uses a third-party transactional email service (e.g., SMTP relay or API-based provider); the specific provider is selected at implementation time.
- Error monitoring uses a hosted service or self-hosted equivalent; the specific tool is selected at implementation time based on cost and operational preferences.
- The deployment environment (Docker Compose on self-hosted VPS with Nginx) is already established per Phase 0 constitution; this phase does not introduce new infrastructure, only configuration and observability tooling.
- Performance targets (Lighthouse 90+, CLS < 0.1) are measured on the deployed production environment, not local development.
- The public portfolio is a server-rendered application where SEO metadata can be injected at render time; client-side-only rendering of metadata is not acceptable.
- Accessibility compliance is scoped to the public-facing portfolio only; the admin portal accessibility improvements are a stretch goal for this phase.
- The sitemap is generated dynamically based on published content records; manual sitemap entries are not required.

---

## Clarifications

### Session 2026-03-31

- Q: When the email delivery service is unavailable at submission time, what should happen? → A: Fail immediately — display a user-friendly error message to the visitor and surface the portfolio owner's direct email address as a fallback contact method. No queuing or retry logic required.
- Q: How should the portfolio owner receive error alert notifications? → A: Email to the portfolio owner's configured address, reusing the same email integration as the contact form delivery.
- Q: Is the portfolio deployed in a jurisdiction where analytics consent is legally required? → A: Yes, EU/UK (GDPR applies) — resolved by adopting a privacy-first analytics approach with no personal identifiers, making consent management unnecessary by design.
- Q: What is the contact form rate limit threshold? → A: 5 submissions per IP address per 60-minute window; the 6th submission is rejected with a clear message.
- Q: Where does the portfolio owner view analytics data? → A: Custom analytics page inside the existing admin portal (server-side data collection, no third-party analytics service).
