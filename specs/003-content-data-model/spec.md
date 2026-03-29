# Feature Specification: Phase 2 — Content Architecture & Data Model

**Feature Branch**: `003-content-data-model`
**Created**: 2026-03-29
**Status**: Draft
**Input**: User description: "Create the specification for Phase 2 only, based strictly on PLAN.md."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Content Lifecycle Management (Priority: P1)

As a content administrator, I need to create and edit portfolio content in a draft state before making it publicly visible, so I can prepare and review content without exposing incomplete or unfinished work to visitors.

**Why this priority**: The draft/published lifecycle is foundational to all content management. Without it, every content entity risks accidentally leaking incomplete work to the public site. All other user stories depend on this being correct.

**Independent Test**: Can be fully tested by creating a new content item (e.g., a project), saving it as a draft, verifying it does not appear anywhere on the public site, then publishing it and confirming it becomes visible.

**Acceptance Scenarios**:

1. **Given** a content item exists in draft state, **When** a visitor accesses the public site, **Then** the draft item is not returned or displayed anywhere on public-facing pages
2. **Given** an admin creates a new experience entry, **When** the admin saves it without publishing, **Then** it is stored with a "draft" status and excluded from all public content queries
3. **Given** a published content item, **When** the admin unpublishes it, **Then** it immediately becomes invisible on the public site without requiring a code deployment

---

### User Story 2 - Ordered Content Display (Priority: P2)

As a content administrator, I need to control the order in which items (such as skills, projects, and experiences) appear on the portfolio, so I can curate a meaningful narrative without touching code.

**Why this priority**: Display ordering directly impacts how visitors perceive the portfolio's story and professional progression. Without manageable ordering, the presentation is effectively locked to insertion order or arbitrary defaults.

**Independent Test**: Can be fully tested by having two or more published items in a given section, changing their display order, and verifying the public site reflects the updated sequence without a deployment.

**Acceptance Scenarios**:

1. **Given** three published projects with explicit display positions, **When** a public visitor loads the portfolio, **Then** the projects are rendered in the exact order set by the admin
2. **Given** an ordered list of skills, **When** the admin updates the position of one skill, **Then** the new order is reflected on the public portfolio without any code deployment or application restart

---

### User Story 3 - Per-Item Visibility Control (Priority: P3)

As a content administrator, I need to selectively show or hide individual content items without deleting them, so I can manage optional, seasonal, or sensitive content while preserving the underlying records.

**Why this priority**: Visibility control decouples the decision to temporarily hide content from the decision to permanently delete it, supporting flexible content curation without data loss.

**Independent Test**: Can be tested by toggling a testimonial to "hidden", confirming it disappears from the public site, then re-enabling it and confirming it reappears — all without modifying publish state or deleting the record.

**Acceptance Scenarios**:

1. **Given** a published testimonial, **When** the admin marks it as hidden, **Then** it does not appear on the public site but remains intact in the content system
2. **Given** a hidden project, **When** the admin re-enables its visibility, **Then** it becomes visible on the public site in its correct display position

---

### User Story 4 - Content Relationships and Cross-References (Priority: P4)

As a content administrator, I need related content entities to be properly linked (e.g., a project connected to relevant skills, or a case study tied to a project), so that the content model supports rich, cross-referenced presentation in later phases.

**Why this priority**: Relationships between entities are critical for building a coherent, senior-level portfolio narrative. Establishing them now prevents costly data migrations in Phase 3 and Phase 4.

**Independent Test**: Can be tested by creating a project, associating two or more skills with it, and verifying the relationship is stored and can be retrieved — independently of any UI.

**Acceptance Scenarios**:

1. **Given** a project entry exists, **When** the admin links skills to it, **Then** the system stores the association and can return the project with its linked skills in a single query
2. **Given** a case study is linked to a project, **When** the project is retrieved, **Then** its associated case study is accessible through the content model without a separate lookup

---

### Edge Cases

- What happens when a content item with linked relationships is deleted — are the linked records removed, blocked, or left orphaned?
- How does the system behave when a public section has zero published, visible items — does it signal an empty state or exclude the section silently?
- What happens when two items share the same numeric display order position — how is the tie resolved (e.g., by creation date, ID)?
- How does the system handle a required field being left blank when saving a content entity?
- What happens to SEO metadata associated with a content page when that page's primary content is unpublished?
- What happens when a case study is saved without a linked project — is it blocked or stored as an orphan?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support "draft" and "published" lifecycle states for all user-facing content entities
- **FR-002**: The system MUST ensure draft and hidden content is never returned by any public-facing content query
- **FR-003**: The system MUST support numeric display ordering for all list-type content entities (projects, skills, experiences, social links, testimonials)
- **FR-004**: The system MUST support per-item visibility toggles, independent of publish state, so content can be hidden without deletion
- **FR-005**: The system MUST define and enforce validation constraints for each content entity, including required fields, field length limits, and value restrictions
- **FR-006**: The system MUST define a Profile entity capturing the portfolio owner's core identity (full name, tagline, bio, contact email, avatar reference)
- **FR-007**: The system MUST define a Hero entity for the landing section (headline, sub-headline, call-to-action text and destination link)
- **FR-008**: The system MUST define a Social Links entity for external profile references (platform name, URL, display order, visibility toggle)
- **FR-009**: The system MUST define an Experience entity for employment history (company name, role title, start and end dates, description, highlights list, display order, publish state)
- **FR-010**: The system MUST define a Projects entity for featured work (title, summary, skill associations, external links, media reference, display order, publish and visibility states)
- **FR-011**: The system MUST define a Case Studies entity linked to a parent Project (challenge description, solution description, measurable outcomes, media references)
- **FR-012**: The system MUST define a Skills entity (skill name, category group, proficiency indication, display order, visibility toggle)
- **FR-013**: The system MUST define a Testimonials entity (author name, author role, author company, quote text, publish state, display order)
- **FR-014**: The system MUST define a Contact Settings entity (contact email address, contact form enabled flag, call-to-action message text)
- **FR-015**: The system MUST define an SEO Metadata entity for per-page configuration (page title, meta description, keywords, Open Graph title, Open Graph description, Open Graph image reference)
- **FR-016**: The system MUST define a Media Assets entity as a reference registry for stored files (file name, storage URL, file type, owning entity reference)
- **FR-017**: All list-type content entities MUST expose a standard interface for retrieving only published, visible records in ascending display order
- **FR-018**: The system MUST enforce referential integrity between related entities — a case study cannot be saved without a valid linked project; deleting a project must handle or block orphaned case studies
- **FR-019**: Profile, Hero, and Contact Settings MUST be treated as singleton entities — only one record of each may exist in the system at any time

### Key Entities

- **Profile**: The portfolio owner's core identity record. Contains name, tagline, biography, contact email, and a reference to an avatar image. Singleton.
- **Hero**: The primary landing section content. Contains the main headline, sub-headline, and call-to-action text with destination. Singleton.
- **Social Links**: Individual entries for external profile URLs (e.g., LinkedIn, GitHub). Each has a platform name, URL, display order, and visibility toggle.
- **Experience**: A single employment record. Contains company name, role title, employment date range, a narrative description, and a list of key highlights. Ordered and publishable.
- **Project**: A featured work item. Contains a title, summary, associated skills, relevant URLs, a media reference, display order, and both publish and visibility states.
- **Case Study**: An in-depth narrative tied to a parent Project. Covers the challenge faced, the solution delivered, and measurable outcomes achieved. Cannot exist without a linked Project.
- **Skill**: A technical or professional capability. Grouped by category, with an optional proficiency indicator, display order, and visibility toggle.
- **Testimonial**: A third-party endorsement. Stores author name, role, company, and quote text. Supports publish state and display ordering.
- **Contact Settings**: Configuration for the contact section. Contains the admin's contact email, whether a contact form is enabled, and a call-to-action message. Singleton.
- **SEO Metadata**: Per-page metadata records. Contains standard and Open Graph fields to support search engine and social sharing optimisation. Linked to a specific content page or route.
- **Media Asset**: A registry entry for an uploaded or referenced file. Captures file name, storage URL, file type, and the entity it belongs to.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 11 defined content entities are fully modeled with validation constraints and lifecycle states before any admin UI work begins in Phase 3
- **SC-002**: 100% of public content queries return only published, visible records — zero draft or hidden items are accessible through any public endpoint
- **SC-003**: Display ordering can be updated for any list-type entity and the change is reflected on the public side without a code deployment or application restart
- **SC-004**: All defined entity relationships (Project ↔ Case Study, Project ↔ Skills) are enforced at the data layer, rejecting invalid or orphaned associations
- **SC-005**: Every content entity has documented validation rules, ensuring no entity can be persisted in an invalid or incomplete state
- **SC-006**: The content model is sufficient to serve as the single authoritative contract between the admin portal (Phase 3) and the public portfolio (Phase 1 onward), with no structural changes required for either phase to proceed

## Assumptions

- The portfolio platform is managed by a single administrator; multi-user content ownership, team roles, and collaborative editing are out of scope for this phase
- Media assets are modeled as reference records only — actual file upload handling and binary storage are deferred to a later phase; URLs may be placeholder values during Phase 2
- The SEO Metadata entity covers standard per-page meta tags and Open Graph fields; structured data (JSON-LD / Schema.org) and advanced SEO features are deferred to Phase 5
- Case studies are optional — a Project may exist and be published without having an associated Case Study
- "Published" means the content item is complete and intentionally visible to the public; "draft" means it is under preparation; "hidden" means it is complete but deliberately not displayed
- All content is in a single language (English); internationalisation and localisation are out of scope for this phase
- Display ordering is managed via integer sort values; the mechanism for setting those values (e.g., drag-and-drop, manual input) is an admin portal concern addressed in Phase 3
- Profile, Hero, and Contact Settings are singletons — the system will always have exactly one record of each, seeded during initial setup
