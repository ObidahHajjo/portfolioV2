# Feature Specification: Phase 3 — Admin Portal MVP

**Feature Branch**: `004-admin-portal-mvp`
**Created**: 2026-03-29
**Status**: Draft
**Input**: User description: "Create the specification for Phase 3 only, based strictly on PLAN.md."

## Clarifications

### Session 2026-03-29

- Q: When a Project with linked Case Studies is deleted, what should the system do? → A: Block the deletion and display an error listing the linked Case Studies that must be removed first (Option A)
- Q: How should the administrator set the display order for list-type content items? → A: Manual numeric input field per item — admin types a position number and saves (Option B)
- Q: How should the system respond to repeated failed login attempts? → A: Temporary lockout after N consecutive failed attempts (e.g., 5 attempts triggers a 15-minute lockout) (Option B)
- Q: If a media upload fails mid-transfer or the Media Asset record fails to save after the file is stored, what should the system do? → A: Auto-cleanup — system attempts to delete the orphaned file from storage on failure, returns error to admin (Option A)
- Q: When an admin session expires while the administrator has unsaved form changes, what should the system do? → A: Display a warning alert 5 minutes before session expiry; if the admin takes no action, discard form data and redirect to login with a "session expired" message

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Admin Authentication (Priority: P1)

As the portfolio administrator, I need to securely log in to the admin portal so that only I can access or modify portfolio content.

**Why this priority**: Authentication is the entry gate to all admin functionality. No other admin feature is useful or safe without a working, secure login mechanism. All other stories in this phase depend on it.

**Independent Test**: Can be fully tested by navigating to the admin login page, submitting valid credentials, being redirected to the dashboard, then verifying that accessing any admin route without a valid session returns a redirect to the login page.

**Acceptance Scenarios**:

1. **Given** I am an unauthenticated visitor, **When** I navigate to any admin route, **Then** I am redirected to the admin login page and denied access to the requested resource
2. **Given** I am on the login page, **When** I submit correct credentials, **Then** I am granted a session and redirected to the admin dashboard
3. **Given** I am on the login page, **When** I submit incorrect credentials, **Then** I receive an error message and no session is created
4. **Given** I am authenticated, **When** my session has been active for 8 hours, **Then** my session is automatically invalidated and I am redirected to the login page on the next request
5. **Given** I am authenticated, **When** I click the logout action, **Then** my session is destroyed and I am redirected to the login page

---

### User Story 2 - CRUD Management for All Content Entities (Priority: P2)

As the portfolio administrator, I need to create, view, edit, and delete records for every content entity (Profile, Hero, Experiences, Projects, Skills, Testimonials, Social Links, Contact Settings, SEO Metadata, Case Studies) so that I can fully manage my portfolio without touching code.

**Why this priority**: CRUD is the core purpose of the admin portal. Without it, the content model from Phase 2 has no input mechanism and the public portfolio cannot be populated.

**Independent Test**: Can be fully tested for any individual entity type (e.g., Skills) by creating a skill, viewing it in the list, editing its name, and deleting it — all through the admin UI — and confirming that each operation is reflected accurately in the system.

**Acceptance Scenarios**:

1. **Given** I am authenticated, **When** I navigate to an entity management screen and submit a valid creation form, **Then** the new record is persisted and appears in the entity list
2. **Given** an existing content record, **When** I open its edit form and save changes, **Then** the updated data is persisted and reflected in the admin list view
3. **Given** an existing content record, **When** I trigger the delete action and confirm, **Then** the record is removed from the system and no longer appears in the admin list
4. **Given** I submit a creation or edit form with invalid or missing required fields, **Then** the form displays field-level validation errors and no data is persisted
5. **Given** a singleton entity (Profile, Hero, Contact Settings), **When** I navigate to its management screen, **Then** I am presented with an edit form — not a create form — and cannot create a second record of that type

---

### User Story 3 - Publish / Unpublish and Visibility Controls (Priority: P3)

As the portfolio administrator, I need to publish, unpublish, and toggle the visibility of individual content items so that I control exactly what appears on the public portfolio at any given time.

**Why this priority**: Controlling what the public sees is a core safety and editorial requirement. Without this, every saved record would either always or never be visible, with no runtime control.

**Independent Test**: Can be fully tested by creating a project in draft state, confirming it does not appear on the public site, publishing it, confirming it appears, then unpublishing it and confirming it disappears — all without code changes.

**Acceptance Scenarios**:

1. **Given** a draft content item, **When** I publish it via the admin UI, **Then** the item becomes publicly visible and its status changes to "published"
2. **Given** a published content item, **When** I unpublish it via the admin UI, **Then** the item is immediately removed from the public site and its status reverts to "draft"
3. **Given** a published content item, **When** I toggle its visibility to "hidden", **Then** it disappears from the public site but its data and publish state are preserved
4. **Given** a hidden content item, **When** I re-enable its visibility, **Then** it reappears on the public site in its correct display position

---

### User Story 4 - Content Display Ordering (Priority: P4)

As the portfolio administrator, I need to control the sequence in which content items (projects, skills, experiences, social links, testimonials) appear on the public portfolio, so that I can curate the narrative without code changes.

**Why this priority**: Ordering directly shapes the visitor's perception of the portfolio's story. Without it, content appears in arbitrary or insertion order.

**Independent Test**: Can be fully tested for any list entity by reordering two or more items in the admin UI and confirming the public portfolio reflects the new sequence without a deployment.

**Acceptance Scenarios**:

1. **Given** a list of published skills with explicit positions, **When** I update the order of two skills in the admin UI and save, **Then** the public portfolio renders them in the updated sequence immediately
2. **Given** a reordering action, **When** I save the new positions, **Then** the sort order is persisted server-side and survives an application restart

---

### User Story 5 - Media Upload for Portfolio Assets (Priority: P5)

As the portfolio administrator, I need to upload images and documents (e.g., CV PDF, project screenshots) so that media content is available for association with portfolio entities.

**Why this priority**: Media enriches the portfolio significantly, but the underlying content model and CRUD interfaces can be validated without it. It is a valuable but deferrable capability within this phase.

**Independent Test**: Can be fully tested by uploading an image file via the admin UI, receiving a confirmed storage reference, and associating that reference with a project record — independently of any public rendering changes.

**Acceptance Scenarios**:

1. **Given** I am on an entity edit screen that supports media, **When** I upload a valid image file, **Then** the file is stored in the object storage backend and a reference URL is saved against the entity
2. **Given** I attempt to upload a file that exceeds the permitted size or is of a disallowed type, **Then** the upload is rejected with a clear error message and no file is stored
3. **Given** a media asset is uploaded and linked to an entity, **When** that entity is displayed on the public portfolio, **Then** the media asset is accessible and rendered correctly

---

### User Story 6 - Content Preview (Priority: P6)

As the portfolio administrator, I need to preview how draft content will appear on the public portfolio before publishing it, so that I can review the presentation without exposing it to real visitors.

**Why this priority**: Preview reduces publish errors and improves editorial confidence, but it is a usability enhancement layered on top of functional CRUD. Delivers value only after core management is working.

**Independent Test**: Can be fully tested by placing a draft item in preview mode, accessing the preview URL, and confirming the draft content is visible in that context but not on the standard public URL.

**Acceptance Scenarios**:

1. **Given** a draft content item, **When** I activate preview mode for it, **Then** I can access a preview URL that renders the item as it would appear when published
2. **Given** a preview URL is active, **When** an unauthenticated visitor accesses that URL without a valid preview token, **Then** the draft content is not exposed

---

### User Story 7 - Admin Dashboard Overview (Priority: P7)

As the portfolio administrator, I need a dashboard overview showing the current state of my content (record counts, draft items) so that I can quickly orient myself when I return to the admin portal.

**Why this priority**: The dashboard is a navigational and awareness aid. All management tasks can be completed without it, but it significantly improves operational efficiency once core features are working.

**Independent Test**: Can be fully tested by loading the dashboard and verifying that summary counts (e.g., number of published projects, number of draft items) match the actual data in the system.

**Acceptance Scenarios**:

1. **Given** I am authenticated and on the dashboard, **When** the page loads, **Then** I see summary counts for each major entity type showing published and draft record totals
2. **Given** I make a content change (e.g., publish a project), **When** I return to the dashboard, **Then** the relevant count is updated to reflect the change

---

### Edge Cases

- When a singleton (Profile, Hero, Contact Settings) does not yet exist, the system auto-creates it with empty defaults on first admin access (upsert pattern); the admin is presented with the edit form pre-filled with empty values and prompted to save.
- When a Project is deleted and linked Case Studies exist, the system blocks deletion and displays an error listing the Case Studies that must be removed first.
- When an admin session is within 5 minutes of its 8-hour expiry, the system displays a visible warning alert. If the admin takes no action before expiry, form data is discarded and the admin is redirected to login with a "session expired" message.
- When a media upload partially fails or the Media Asset record cannot be saved after upload, the system attempts to delete the orphaned file from object storage and returns a clear error to the admin.
- When two items share the same `displayOrder` value, the system accepts the duplicate silently; ties are resolved by `createdAt` ascending (insertion order), consistent with the Phase 2 query contract tiebreaker.
- How does the system behave when a form is submitted but the server-side validation returns field-level errors for nested or array fields (e.g., experience highlights)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a dedicated admin login page accessible at a known admin route
- **FR-002**: The system MUST authenticate the administrator using an email-and-password credential pair, validated server-side
- **FR-002a**: The system MUST enforce a temporary login lockout after 5 consecutive failed authentication attempts; the lockout MUST last 15 minutes, after which the administrator may try again
- **FR-002b**: The system MUST display a clear lockout message when the login is blocked, including the remaining wait time
- **FR-003**: The system MUST issue a server-side session backed by an HTTP-only cookie upon successful authentication
- **FR-004**: Admin sessions MUST expire after an absolute timeout of 8 hours regardless of activity
- **FR-004a**: The system MUST display a visible warning alert to the administrator 5 minutes before the session expires
- **FR-004b**: If the administrator takes no action after the session expiry warning and the session expires, any unsaved form data is abandoned (browser state is cleared on redirect) and the administrator MUST be redirected to the login page with a "session expired" message
- **FR-005**: The system MUST require a valid session for all admin routes and API endpoints; unauthenticated requests MUST be redirected to the login page or receive a 401 response
- **FR-006**: The system MUST provide a logout action that destroys the session and invalidates the cookie immediately
- **FR-007**: The system MUST provide management screens for every content entity defined in Phase 2: Profile, Hero, Social Links, Experiences, Projects, Case Studies, Skills, Testimonials, Contact Settings, SEO Metadata, and Media Assets
- **FR-008**: The system MUST allow the administrator to create new records for all non-singleton entity types
- **FR-009**: The system MUST allow the administrator to view a scrollable list of existing records for each non-singleton entity type; full pagination is not required given the expected scale of 50–200 total records, but the list API MUST apply consistent `orderBy` sorting
- **FR-010**: The system MUST allow the administrator to edit any existing record for all entity types
- **FR-011**: The system MUST allow the administrator to delete any non-singleton record, with a confirmation step before permanent removal
- **FR-011a**: The system MUST block deletion of a Project that has one or more linked Case Studies; the error response MUST list the linked Case Study IDs (or a preview of the `challenge` field) that must be removed before the Project can be deleted
- **FR-012**: Singleton entities (Profile, Hero, Contact Settings) MUST be presented as edit-only forms; the system MUST prevent creation of a second record of any singleton type
- **FR-013**: All form submissions MUST be validated server-side before data is persisted; validation errors MUST be returned with field-level detail
- **FR-014**: The system MUST provide publish and unpublish controls for all entities that carry a publish state (Experiences, Projects, Case Studies, Skills, Testimonials)
- **FR-015**: The system MUST provide a visibility toggle (show/hide) for all entities that support per-item visibility
- **FR-016**: Publishing, unpublishing, or toggling visibility of a content item MUST take effect immediately on the public site without requiring a code deployment or application restart
- **FR-017**: The system MUST allow the administrator to set the display order for all list-type entities (Projects, Skills, Experiences, Social Links, Testimonials) via a manual numeric input field per item; the admin enters a position number and saves
- **FR-018**: Display order changes MUST be persisted server-side and reflected on the public portfolio immediately
- **FR-019**: The system MUST provide a file upload interface for associating images and documents with content entities
- **FR-020**: Uploaded files MUST be stored in the designated object storage backend; direct filesystem storage of uploaded assets is prohibited
- **FR-021**: The system MUST reject file uploads that exceed a defined size limit or are of a disallowed file type, returning a descriptive error message
- **FR-021a**: If an upload succeeds at the storage level but the Media Asset record fails to save, the system MUST attempt to delete the orphaned file from object storage and return a clear error message to the administrator; no partial or inconsistent state should be left in the asset registry
- **FR-022**: The system MUST register each successfully uploaded file as a Media Asset record with its storage URL, file name, file size, and MIME type
- **FR-023**: The system MUST provide a preview mechanism that renders a draft **Project** as it would appear when published, accessible only to the authenticated administrator; preview for other entity types is deferred to a future phase
- **FR-024**: The preview mechanism MUST deny access to unauthenticated visitors; draft content accessed via preview MUST NOT be indexed by search engines
- **FR-025**: The admin dashboard MUST display summary counts of published and draft records for each major entity type
- **FR-026**: The admin dashboard MUST provide navigational links to all entity management screens

### Key Entities

- **Admin Session**: A server-side session record for the authenticated administrator. Contains a session identifier (delivered via HTTP-only cookie), creation timestamp, and absolute expiry time. Managed by the authentication subsystem; not a content entity.
- **Media Asset** (Phase 2 definition — upload surface added in this phase): A registry entry for an uploaded file. Captures file name, storage URL, MIME type, file size, and owning entity reference. Created during upload; updated when associated with a content entity.

All other content entities (Profile, Hero, Social Links, Experience, Project, Case Study, Skill, Testimonial, Contact Settings, SEO Metadata) are defined in the Phase 2 specification. This phase adds the admin management surfaces for all of them.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The administrator can log in, create or edit at least one record for each of the 11 content entity types, and log out without encountering errors or data loss
- **SC-002**: 100% of admin routes and API endpoints reject unauthenticated requests; no content modification is possible without a valid session
- **SC-003**: A content change (create, edit, publish, unpublish, reorder) made in the admin portal is reflected on the public portfolio without a code deployment or application restart
- **SC-004**: Every form in the admin portal enforces the validation rules defined in the Phase 2 content model; no invalid or incomplete record can be persisted through the admin interface
- **SC-005**: A media file (image or document) can be uploaded, stored, and linked to a content entity in a single admin workflow without manual URL entry
- **SC-006**: Draft content is never accessible on public-facing routes under any admin portal state, including when preview tokens are not in use
- **SC-007**: Admin sessions expire automatically after 8 hours; re-authentication is required to resume
- **SC-008**: The administrator can complete a full content editing workflow — create, set order, preview, publish — for any entity type in under 5 minutes after initial familiarisation

## Assumptions

- There is exactly one administrator account; multi-user roles, team access, and permission tiers are out of scope for this phase
- The administrator credential (email and password) is provisioned at setup time via an environment variable or seed mechanism; self-registration is not supported
- The admin portal is a protected internal interface used only by the owner; it does not need to meet public-facing accessibility standards, though basic usability is expected
- Media upload file size limits and accepted MIME types will be finalised during planning; reasonable defaults (10 MB maximum, images and PDF) are assumed unless specified otherwise
- The preview mechanism uses a session-scoped access check; a shareable public preview link for third-party review is out of scope for this phase
- All content entities and their validation rules are already defined in the Phase 2 data model; this phase does not redefine entity schemas, only adds management surfaces for them
- The admin portal is accessible at a dedicated route within the same application (e.g., `/admin`); a separate subdomain or standalone deployment is not required
- Deletion is permanent and immediate; soft-delete or archive behaviour is out of scope for this phase
- Audit logging of admin actions is deferred to a later phase; this phase focuses on functional CRUD without a full audit trail
- Bulk operations (bulk publish, bulk delete, CSV import/export) are out of scope for this phase
