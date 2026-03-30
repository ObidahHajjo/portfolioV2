# Contract: Optional Sections Admin API

**Branch**: `005-advanced-portfolio` | **Date**: 2026-03-29

Covers: Articles, Open Source Contributions, Talks, and the Section Visibility toggle API.

**Auth**: All `/api/admin/*` endpoints require a valid `iron-session` admin cookie. Requests without a valid session return `401 { "error": "Unauthorized" }`.
**Content-Type**: All request and response bodies are `application/json`.

---

## Articles API

### GET /api/admin/articles

Returns all articles (includes drafts) for admin display, ordered by `displayOrder` ascending.

**Response 200**
```json
{
  "articles": [
    {
      "id": "cluid123",
      "title": "How I Halved Deploy Times with Feature Flags",
      "summary": "A walkthrough of adopting feature flags...",
      "externalUrl": "https://medium.com/@johndoe/feature-flags",
      "publishedAt": "2025-11-01T00:00:00.000Z",
      "displayOrder": 0,
      "published": true,
      "isVisible": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### POST /api/admin/articles

Creates a new article. Validated with `createArticleSchema`.

**Request Body**
```json
{
  "title": "How I Halved Deploy Times with Feature Flags",
  "summary": "A walkthrough of adopting feature flags...",
  "externalUrl": "https://medium.com/@johndoe/feature-flags",
  "publishedAt": "2025-11-01T00:00:00.000Z",
  "displayOrder": 0,
  "published": false,
  "isVisible": true
}
```

- `publishedAt`: optional ISO 8601 datetime string
- `externalUrl`: required; must be a valid URL

**Response 201** — returns the created article.

**Response 400** — validation error.

---

### GET /api/admin/articles/[id]

Returns a single article.

**Response 200** — `{ "article": { ...full article object... } }`

**Response 404** — `{ "error": "Not found" }`

---

### PUT /api/admin/articles/[id]

Updates an article. Validated with `updateArticleSchema` (all fields optional/partial).

**Response 200** — returns the updated article.

**Response 400** — validation error.

**Response 404** — `{ "error": "Not found" }`

---

### DELETE /api/admin/articles/[id]

Deletes an article.

**Response 204** — no body.

**Response 404** — `{ "error": "Not found" }`

---

## Open Source Contributions API

Pattern identical to Articles. Substitute `articles` with `open-source` in all paths.

### GET /api/admin/open-source — returns `{ "contributions": [...] }`
### POST /api/admin/open-source

**Request Body** (validated with `createOpenSourceSchema`)
```json
{
  "projectName": "Prisma",
  "description": "Fixed a bug in the migration engine that caused...",
  "contributionType": "Bug fix",
  "repositoryUrl": "https://github.com/prisma/prisma/pull/9999",
  "displayOrder": 0,
  "published": true,
  "isVisible": true
}
```

- `repositoryUrl`: optional

### GET /api/admin/open-source/[id] — returns `{ "contribution": { ... } }`
### PUT /api/admin/open-source/[id] — `updateOpenSourceSchema`
### DELETE /api/admin/open-source/[id]

All follow the same response codes as the Articles API above.

---

## Talks API

Pattern identical to Articles. Substitute `articles` with `talks` in all paths.

### GET /api/admin/talks — returns `{ "talks": [...] }`
### POST /api/admin/talks

**Request Body** (validated with `createTalkSchema`)
```json
{
  "title": "Scaling Your Team with Feature-Gated Deployments",
  "eventName": "JSConf 2025",
  "talkDate": "2025-09-15T09:00:00.000Z",
  "summary": "A 30-minute session on using feature flags to...",
  "recordingUrl": "https://youtube.com/watch?v=abc123",
  "slidesUrl": "https://speakerdeck.com/johndoe/feature-gates",
  "displayOrder": 0,
  "published": true,
  "isVisible": true
}
```

- `recordingUrl`: optional
- `slidesUrl`: optional
- `talkDate`: required ISO 8601 datetime string

### GET /api/admin/talks/[id] — returns `{ "talk": { ... } }`
### PUT /api/admin/talks/[id] — `updateTalkSchema`
### DELETE /api/admin/talks/[id]

---

## Section Visibility API

Controls the admin toggle that shows/hides an entire optional section on the public portfolio, independently of the published state of individual entries.

**Valid section names**: `"articles"`, `"open_source"`, `"talks"`

---

### GET /api/admin/section-visibility/[section]

Returns the current visibility state for the named section.

**Response 200** — if a `SectionVisibility` record exists:
```json
{
  "sectionVisibility": {
    "id": "cluid123",
    "section": "articles",
    "enabled": true,
    "updatedAt": "2026-03-29T00:00:00.000Z"
  }
}
```

If no record exists (never set): return the same shape with `enabled: true` (default):
```json
{
  "sectionVisibility": {
    "id": null,
    "section": "articles",
    "enabled": true,
    "updatedAt": null
  }
}
```

**Response 400** — invalid section name:
```json
{ "error": "Invalid section. Must be one of: articles, open_source, talks" }
```

---

### PUT /api/admin/section-visibility/[section]

Sets the visibility for the named section. Uses `prisma.sectionVisibility.upsert` — creates the row if it does not exist, otherwise updates it.

**Request Body**
```json
{ "enabled": false }
```

**Validation**:
- `section` param must be one of `["articles", "open_source", "talks"]` → `400` if not
- `enabled` must be a boolean → `400` if missing or wrong type

**Response 200** — returns the updated record:
```json
{
  "sectionVisibility": {
    "id": "cluid456",
    "section": "articles",
    "enabled": false,
    "updatedAt": "2026-03-29T12:00:00.000Z"
  }
}
```

---

## Public Section Rendering (No Auth)

All three optional section components are Next.js server components with `force-dynamic`. Each calls two functions:

1. The published entries query (e.g., `getPublishedArticles()`)
2. `getSectionVisibility(section)` for the toggle state

**Display rule**: A section renders ONLY when **both** conditions are true:
- `sectionVisibility.enabled === true` (or no record found — defaults to true)
- The entries array has at least one item

If either condition is false: the component returns `null` — no DOM output.

**Section headings** (used in components):

| Section | Public heading |
|---|---|
| articles | "Writing" |
| open_source | "Open Source" |
| talks | "Talks & Presentations" |

**Entry display fields**:

| Section | Required display fields |
|---|---|
| Article | title (as external link), summary, publishedAt (formatted, if present) |
| Open Source Contribution | projectName, description, contributionType (as badge), repositoryUrl (if present) |
| Talk | title, eventName, talkDate (formatted), summary, recordingUrl link (if present), slidesUrl link (if present) |
