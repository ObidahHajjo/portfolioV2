# Contract: SEO Structural Requirements

**Version**: 1.0 | **Phase**: 0 | **Date**: 2026-03-28
**Authority**: Spec FR-008

This contract defines the structural SEO requirements that apply from Phase 1
onward. These requirements are non-negotiable unless superseded by a future
constitution amendment.

---

## Structural Requirements (Phase 1+, non-negotiable)

- Every public page MUST use semantic HTML5 structure, including relevant use
  of `<main>`, `<nav>`, `<article>`, `<section>`, `<header>`, and `<footer>`
- Every page MUST have a unique `<title>`
- Every page MUST have a unique `<meta name="description">`
- All images MUST include an `alt` attribute
- Heading hierarchy MUST be logical and each page MUST contain exactly one `<h1>`

## Open Graph (Phase 1+)

- Every public page MUST include `og:title`, `og:description`, `og:image`,
  `og:url`, and `og:type`
- `og:image` assets MUST be at least 1200x630 pixels

## Sitemap (Phase 5)

- An XML sitemap MUST be generated and submitted
- The sitemap URL MUST be referenced in `robots.txt`

## Admin Configurability (Phase 5)

- `title`, `meta description`, `og:title`, `og:description`, and `og:image`
  MUST be admin-configurable via the `SeoMetadata` entity defined in
  `content-classification.md`
- Structural HTML elements are never admin-managed

## Canonical URLs

- Every public page MUST include a `<link rel="canonical">` tag pointing to
  the canonical URL for that page
