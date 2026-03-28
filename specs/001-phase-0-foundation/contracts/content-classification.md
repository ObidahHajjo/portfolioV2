# Contract: Content Classification

**Version**: 1.0 | **Phase**: 0 | **Date**: 2026-03-28
**Authority**: Constitution Principle II; Spec FR-003

This contract is the single source of truth for all phases. Every content
element in the portfolio MUST be classified here before implementation.
Amendments require a constitution amendment per the governance procedure.

---

## Admin-Managed Content Types

All types below MUST be editable via the admin portal. None may be hardcoded
in the UI. All support draft/published lifecycle (draft content is NEVER
publicly visible).

| Entity | Description | Draft/Publish |
|---|---|---|
| Profile | Owner name, bio, headline, avatar, location, email | Yes |
| HeroContent | Landing page headline, subheadline, CTA text and link | Yes |
| SocialLink | Platform links with display order | Yes |
| Experience | Work history: employer, role, dates, description, highlights | Yes |
| Project | Portfolio projects: title, description, tech, links, media | Yes |
| CaseStudy | Deep-dive narrative linked to a Project | Yes |
| Skill | Technical skills with category, proficiency, display order | Yes |
| Testimonial | Author quote with attribution and optional photo | Yes |
| ContactSettings | Contact email, form toggle, custom message | Yes |
| SeoMetadata | Per-page title, description, Open Graph fields | Yes |
| Media | Uploaded files (images, PDFs) stored in MinIO | Yes |

## Explicitly Static Content

The following MAY be hardcoded in the UI and do NOT require admin management.

| Element | Rationale |
|---|---|
| Brand name and logo | Identity asset, changes require a deployment by design |
| Top-level navigation structure | Route names and link labels are structural |
| Copyright year in footer | Can be rendered dynamically from current year |
| Legal and privacy page copy | Rarely changes; version-controlled in source |

## Universal Rules

1. Draft content MUST NOT appear in any public-facing route, API response,
   or statically generated page.
2. Published content MAY be publicly visible subject to other display rules
   (e.g., `featured` flag on Project).
3. Content ordering MUST be admin-manageable via `displayOrder` fields —
   no reordering requires a code change.
4. Deletion of a published record MUST not break the public UI — graceful
   fallback rendering is required (Constitution Principle VII).
