# Data Model: Phase 0 — Foundation & Constitution

**Branch**: `001-phase-0-foundation`
**Date**: 2026-03-28

Phase 0 produces no database schema. This document serves two purposes:

1. **Governance artefact model** — the document types Phase 0 produces and
   their relationships to one another and to subsequent phases.
2. **Conceptual content model** — the content entities that Phase 2 will
   implement, established here so all phases share the same mental model
   before any schema is written.

---

## Part A: Governance Artefact Model

These are the output artefacts of Phase 0. They live in the repository as
Markdown files. They have no database representation.

### Constitution
- **Location**: `.specify/memory/constitution.md`
- **Version**: 1.0.0 (ratified 2026-03-28)
- **Role**: Supersedes all other project documents. Governs amendment of all
  other artefacts.
- **Consumed by**: Every phase specification's Constitution Check section.

### Phase 0 Specification
- **Location**: `specs/001-phase-0-foundation/spec.md`
- **Role**: The formal requirement set for Phase 0. Contains the authoritative
  content classification (FR-003), security baseline (FR-004), performance
  targets (FR-005), deployment strategy (FR-006), and observability baseline
  (FR-009).
- **Consumed by**: Phase 1 spec as the source of constraints for the public
  portfolio build.

### Governance Contracts (Phase 0 outputs)
- **Location**: `specs/001-phase-0-foundation/contracts/`
- **Role**: Extracted, implementation-ready summaries of Phase 0's binding
  rules, formatted for direct consumption by later-phase plans.
- **Files**:
  - `content-classification.md` — admin-managed vs. static classification
  - `security-baseline.md` — security requirements per phase
  - `performance-contract.md` — public site perf targets
  - `deployment-contract.md` — service topology and availability posture

---

## Part B: Conceptual Content Model

These are the 11 admin-managed content entity types established in Phase 0
(FR-003). Phase 2 will translate these into a PostgreSQL schema. They are
listed here with their conceptual attributes and relationships so all phases
share a consistent understanding.

All admin-managed entities share these cross-cutting attributes:
- `id` — unique identifier
- `createdAt` — creation timestamp
- `updatedAt` — last modification timestamp
- `status` — `draft` | `published` (draft content is NEVER publicly visible)

### Profile
The portfolio owner's personal information. Singleton (one record only).

| Attribute | Type | Notes |
|---|---|---|
| name | string | Full display name |
| headline | string | One-line professional title |
| bio | text | Multi-paragraph about section |
| avatarAssetId | ref → Media | Profile photo |
| email | string | Contact email |
| location | string | Optional display location |

### HeroContent
The landing page hero block. Singleton.

| Attribute | Type | Notes |
|---|---|---|
| headline | string | Primary heading |
| subheadline | string | Supporting line |
| ctaText | string | Call-to-action button label |
| ctaUrl | string | Call-to-action destination |
| backgroundAssetId | ref → Media | Optional hero background |

### SocialLink
Platform links displayed in contact/footer areas. Multiple records, ordered.

| Attribute | Type | Notes |
|---|---|---|
| platform | string | e.g., GitHub, LinkedIn |
| url | string | Full URL |
| displayOrder | integer | Sort order |

### Experience
Work history entries. Multiple records, ordered by date descending.

| Attribute | Type | Notes |
|---|---|---|
| employer | string | Company name |
| role | string | Job title |
| startDate | date | Start month/year |
| endDate | date | End month/year (null = current) |
| description | text | Role summary |
| highlights | string[] | Bullet-point achievements |
| displayOrder | integer | Override sort order |

### Project
Portfolio projects. Multiple records, ordered.

| Attribute | Type | Notes |
|---|---|---|
| title | string | Project name |
| description | text | Summary |
| techStack | string[] | Technologies used |
| repoUrl | string | Optional source link |
| liveUrl | string | Optional demo link |
| featuredAssetId | ref → Media | Screenshot/thumbnail |
| displayOrder | integer | Sort order |
| featured | boolean | Show in featured section |

### CaseStudy
Deep-dive narratives linked to a project. One-to-one with Project (optional).

| Attribute | Type | Notes |
|---|---|---|
| projectId | ref → Project | Parent project |
| problem | text | Problem statement |
| solution | text | Approach and solution |
| outcome | text | Results and metrics |
| impact | string[] | Bullet-point measurable outcomes |
| assets | ref[] → Media | Supporting diagrams/screenshots |

### Skill
Technical skills and competencies. Multiple records, categorised and ordered.

| Attribute | Type | Notes |
|---|---|---|
| name | string | Skill name |
| category | string | e.g., Frontend, Backend, DevOps |
| proficiency | enum | `beginner` \| `intermediate` \| `advanced` \| `expert` |
| displayOrder | integer | Sort order within category |

### Testimonial
Professional references or endorsements. Multiple records.

| Attribute | Type | Notes |
|---|---|---|
| authorName | string | Testimonial author's name |
| authorRole | string | Author's job title |
| authorCompany | string | Author's employer |
| quote | text | The testimonial text |
| avatarAssetId | ref → Media | Optional author photo |
| displayOrder | integer | Sort order |

### ContactSettings
Configuration for the contact section. Singleton.

| Attribute | Type | Notes |
|---|---|---|
| contactEmail | string | Receiving email address |
| formEnabled | boolean | Show/hide contact form |
| customMessage | text | Optional intro text above form |

### SeoMetadata
Per-page SEO configuration. One record per page slug.

| Attribute | Type | Notes |
|---|---|---|
| pageSlug | string | e.g., `/`, `/projects`, `/about` |
| title | string | `<title>` tag content |
| description | string | Meta description |
| ogTitle | string | Open Graph title |
| ogDescription | string | Open Graph description |
| ogImageAssetId | ref → Media | Open Graph image |

### Media (Asset)
All uploaded files stored in MinIO. Referenced by other entities.

| Attribute | Type | Notes |
|---|---|---|
| filename | string | Original filename |
| mimeType | string | e.g., `image/jpeg`, `application/pdf` |
| bucket | string | MinIO bucket name |
| objectKey | string | MinIO object key (path) |
| url | string | Public-accessible URL via MinIO/proxy |
| size | integer | File size in bytes |
| altText | string | Accessibility alt text (images) |

---

## Entity Relationship Summary

```text
Profile ──────── avatarAssetId ──► Media
HeroContent ──── backgroundAssetId ► Media
Project ─────── featuredAssetId ──► Media
Project ◄─────── CaseStudy (1:1, optional)
CaseStudy ──────assets[] ─────────► Media[]
Testimonial ──── avatarAssetId ──► Media
SeoMetadata ──── ogImageAssetId ──► Media

SocialLink, Experience, Skill, ContactSettings → standalone
All entities → status: draft | published
```

---

## Explicitly Static Content (no database representation)

The following are hardcoded in the application and require no admin management:

- Brand name and logo
- Top-level navigation structure and link labels
- Copyright year in footer
- Legal and privacy page copy
