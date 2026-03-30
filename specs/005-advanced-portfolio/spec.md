# Feature Specification: Advanced Portfolio — Senior-Level Depth

**Feature Branch**: `005-advanced-portfolio`
**Created**: 2026-03-29
**Status**: Draft
**Input**: User description: "Create the specification for Phase 4 only, based strictly on PLAN.md."

## Clarifications

### Session 2026-03-29

- Q: Are case studies presented as standalone dedicated pages (unique URL) or inline/expandable within the projects section? → A: Each case study has its own dedicated page with a unique URL (e.g., `/case-studies/[slug]`)
- Q: Do articles support embedded body text within the portfolio, or external URL linking only? → A: External URL only — articles always link out to where the content is hosted
- Q: How are case study metrics stored — structured key-value pairs or free-form text? → A: Structured key-value pairs: each metric has a label, a value, and an optional unit
- Q: When the admin uploads a replacement CV, what happens to the old file in storage? → A: Permanently deleted — the old CV file is removed from storage when replaced
- Q: Can the admin explicitly suppress an optional section even when it has published entries, or is visibility purely auto-driven by published content? → A: Explicit per-section toggle — admin can independently enable/disable each optional section regardless of published content

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recruiter Reads a Case Study (Priority: P1)

A recruiter or hiring manager visits the portfolio and reads a detailed case study for a featured project. The case study walks them through the problem the engineer faced, the solution designed, and the measurable outcome achieved. Supporting architecture or decision notes are included where relevant.

**Why this priority**: Case studies are the primary differentiator from a generic portfolio. They demonstrate business value, engineering depth, and decision-making — the core goal of Phase 4.

**Independent Test**: Can be fully tested by navigating to a case study's dedicated URL directly and verifying the narrative structure (problem, solution, outcome, metrics) renders correctly with published content.

**Acceptance Scenarios**:

1. **Given** the portfolio has at least one published case study, **When** a visitor navigates to that case study's dedicated page, **Then** they see a structured narrative covering: problem context, solution approach, measurable outcome, and any architecture or decision highlights.
2. **Given** a case study has recorded impact metrics, **When** it is displayed, **Then** specific measurable results (e.g., "reduced deployment time by 60%") are prominently shown.
3. **Given** a case study is in draft state, **When** a visitor accesses the public portfolio or requests its URL directly, **Then** the case study is not visible or linked anywhere on the public site and the URL returns a not-found response.
4. **Given** multiple published case studies exist, **When** a visitor views the case studies listing, **Then** each entry links to its own dedicated page via a unique URL slug.

---

### User Story 2 - Visitor Downloads the CV (Priority: P2)

A recruiter or hiring manager clicks a clearly labelled button or link on the portfolio to download the developer's CV as a PDF.

**Why this priority**: A downloadable CV is a standard expectation for senior-level candidates and directly supports the hiring workflow.

**Independent Test**: Can be fully tested by clicking the download control and verifying a valid, current PDF is delivered to the browser without requiring login.

**Acceptance Scenarios**:

1. **Given** a CV file has been published by the admin, **When** a visitor clicks the download CV control, **Then** a PDF file begins downloading immediately.
2. **Given** the admin has not yet published a CV, **When** a visitor views the portfolio, **Then** the download control is hidden or absent — no broken link is displayed.
3. **Given** the admin replaces the CV with an updated version, **When** a visitor next downloads the CV, **Then** they receive the updated file, not a cached version.

---

### User Story 3 - Visitor Reads Testimonials (Priority: P3)

A visitor reads written testimonials from colleagues, managers, or clients displayed on the portfolio, lending social proof to the developer's claims of impact.

**Why this priority**: Testimonials increase credibility and trust but are supplementary to case studies. They can be developed and tested independently from narrative content.

**Independent Test**: Can be fully tested by viewing the testimonials section with at least two published entries, verifying author attribution and content display.

**Acceptance Scenarios**:

1. **Given** at least one testimonial is published, **When** a visitor views the portfolio, **Then** each testimonial shows the quote, the author's name, role, and organisation (where provided).
2. **Given** testimonials have an assigned display order, **When** the section is rendered, **Then** they appear in the admin-defined order.
3. **Given** all testimonials are unpublished, **When** a visitor views the portfolio, **Then** the testimonials section is hidden entirely.

---

### User Story 4 - Visitor Reads Optional Sections (Priority: P4)

A visitor who wants further depth can explore optional content sections — articles written by the developer, open-source contributions, or conference talks — each presented in a consistent and readable format.

**Why this priority**: These sections are valuable for strongly engaged visitors (e.g., technical leads) but are explicitly optional and lower-priority than core narrative content.

**Independent Test**: Each optional section (articles, open source, talks) can be tested independently by enabling only that section and verifying it renders with published entries and is hidden when empty.

**Acceptance Scenarios**:

1. **Given** an optional section has published entries and its visibility toggle is enabled, **When** a visitor views the portfolio, **Then** that section is visible and each entry displays its title, summary, and a link or reference.
2. **Given** an optional section has published entries but its visibility toggle is disabled, **When** a visitor views the portfolio, **Then** that section is not rendered — no heading, entry, or placeholder is shown.
3. **Given** an optional section has no published entries (regardless of toggle state), **When** a visitor views the portfolio, **Then** that section is not rendered.
4. **Given** multiple optional sections have published content and enabled toggles, **When** a visitor views the portfolio, **Then** all applicable sections appear in a consistent format.

---

### Edge Cases

- What happens when a case study has no metrics recorded? The outcome section must still render gracefully with a narrative-only description; the metrics block is hidden rather than showing empty.
- What happens if the CV file is unavailable at the time of download? The visitor sees a user-friendly message (e.g., "CV temporarily unavailable — please check back shortly") rather than a broken download.
- What happens when a testimonial has no organisation listed? The display shows name and role only, without an empty organisation field.
- What happens if a case study's linked project no longer exists (was deleted)? The case study renders independently without a broken project link; any project reference becomes optional supplementary data.
- How does the system handle very long case study narratives? Content must remain readable with appropriate visual hierarchy; no truncation or overflow on any viewport size.
- What happens when a visitor requests a draft case study's URL directly? The system returns a not-found response; no case study content is exposed to unauthenticated visitors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display detailed case studies, each structured with at minimum: problem statement, solution approach, and measurable outcome.
- **FR-002**: The system MUST support optional case study sections for architecture explanations and engineering decision rationale.
- **FR-003**: Case studies MUST support draft and published states; only published case studies may appear on the public portfolio.
- **FR-004**: Each published case study MUST be accessible via its own dedicated page at a unique URL slug (e.g., `/case-studies/[slug]`).
- **FR-005**: A case studies listing page or section MUST link to each published case study's dedicated page.
- **FR-006**: The system MUST provide a mechanism for visitors to download the developer's CV as a PDF file.
- **FR-007**: The CV download control MUST only be shown when a CV has been published by the admin; it MUST be hidden if no CV is available.
- **FR-008**: The system MUST display a testimonials section showing quotes with author attribution (name, role, and optionally organisation).
- **FR-009**: Testimonials MUST support draft and published states; only published testimonials appear publicly.
- **FR-010**: Testimonials MUST respect an admin-defined display order.
- **FR-011**: The testimonials section MUST be hidden entirely when no published testimonials exist.
- **FR-012**: The system MUST support optional content sections for articles, open-source contributions, and conference talks.
- **FR-013**: Each optional section (articles, open-source contributions, talks) MUST have an independent admin-controlled visibility toggle. A section MUST only appear on the public portfolio when BOTH its toggle is enabled AND it contains at least one published entry. If either condition is false, the section MUST be hidden entirely with no empty heading or placeholder rendered.
- **FR-014**: Each optional section entry MUST display at minimum a title, a brief summary, and a reference or external link. Article entries MUST link out to an external URL; body text is not stored internally.
- **FR-015**: All Phase 4 content types MUST be manageable via the admin portal (create, edit, publish/unpublish, reorder, delete).
- **FR-015a**: The admin portal MUST provide a per-section visibility toggle for each optional section (articles, open-source contributions, talks), independently of the published state of individual entries within that section.
- **FR-016**: All Phase 4 content MUST integrate with the existing content data model's draft/publish lifecycle defined in Phase 2.
- **FR-017**: Case study metrics MUST be stored as a list of structured key-value pairs, each with a label, a value, and an optional unit (e.g., label: "Deployment time", value: "-60%", unit: "%"), so that measurable impact figures can be rendered as consistent visual callouts.

### Key Entities

- **Case Study**: A rich narrative record linked to a project or standalone, with fields for problem, solution, outcome, optional architecture notes, and a structured metrics list (zero or more entries, each with label, value, and optional unit). Has a unique URL slug. Supports draft/published states and display ordering.
- **CV Asset**: A binary asset record (PDF) managed by the admin, with a published flag controlling public visibility. Only one CV is active at a time; uploading a new one permanently deletes the previous file from storage.
- **Testimonial**: A quote with author name, role, optional organisation, and optional avatar. Supports draft/published states and admin-defined display order.
- **Article**: An optional content entry with title, summary, publication date, and an external URL pointing to where the article is hosted. Supports draft/published states. Body text is not stored internally.
- **Open Source Contribution**: An optional entry with project name, description, role/contribution type, and a repository or project URL. Supports draft/published states.
- **Talk**: An optional entry with title, event name, date, summary, and an optional recording or slides URL. Supports draft/published states.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every published case study presents a complete problem-solution-outcome narrative; no published case study is missing any of these three structural elements.
- **SC-002**: Every published case study is reachable via its own unique URL; navigating directly to a case study URL renders that case study's content without error.
- **SC-003**: Visitors can download a published CV in a single click with no additional navigation steps required.
- **SC-004**: The portfolio's advanced content sections (case studies, testimonials, optional sections) load and are fully readable within standard web performance expectations — no section causes perceptible layout shift or delay relative to the rest of the page.
- **SC-005**: All optional sections (articles, open source, talks) are entirely absent from the rendered page when either their visibility toggle is disabled or they have no published content — verified by a visitor seeing zero empty headings in either condition.
- **SC-006**: 100% of Phase 4 content types are editable via the admin portal without requiring any code changes or redeployment.
- **SC-007**: Draft content for all Phase 4 types is never accessible via any public URL; accessing a draft case study URL directly returns a not-found response to unauthenticated visitors.
- **SC-008**: The portfolio page containing case studies and advanced content sections is accessible and renders correctly on mobile, tablet, and desktop viewports.

## Assumptions

- Phase 2 (Content Architecture & Data Model) and Phase 3 (Admin Portal MVP) are complete; the data model and admin CRUD infrastructure are already in place and can be extended for Phase 4 entities.
- The existing admin authentication and session management from Phase 3 will be reused without modification for managing Phase 4 content.
- Binary asset storage (for CV PDF upload) uses the MinIO-compatible object storage already established in the project stack.
- Only one CV is active at any time; when the admin uploads a replacement, the previous CV file is permanently deleted from storage. Version history is out of scope for Phase 4.
- Case studies may be standalone or optionally linked to an existing project entry from Phase 2; the linkage is not mandatory.
- Articles in the optional section link exclusively to external URLs (e.g., a personal blog, Medium, or dev.to); full body text is not stored or rendered within the portfolio system.
- The testimonials section is a single flat list; grouping or categorising testimonials is out of scope.
- Display ordering for case studies and testimonials is controlled by the admin; the public site renders them in that order without allowing visitor-side sorting or filtering.
- Accessibility compliance for the new content sections follows the same baseline established in Phase 1 (semantic HTML, sufficient colour contrast, keyboard navigability).
- Case study URL slugs are generated from the case study title and must be unique; slug management is handled by the admin portal.
