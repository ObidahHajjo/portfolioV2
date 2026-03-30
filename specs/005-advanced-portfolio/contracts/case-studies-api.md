# Contract: Case Studies Admin API

**Branch**: `005-advanced-portfolio` | **Date**: 2026-03-29
**Auth**: All endpoints require a valid `iron-session` admin cookie. Requests without a valid session return `401 { "error": "Unauthorized" }`.
**Content-Type**: All request and response bodies are `application/json`.

---

## Case Studies CRUD

### GET /api/admin/case-studies

Returns all case studies (no published filter — includes drafts) for admin display.

**Response 200**
```json
{
  "caseStudies": [
    {
      "id": "cluid123",
      "slug": "led-platform-migration",
      "title": "Led Platform Migration",
      "projectId": "cluid456",
      "published": true,
      "isVisible": true,
      "displayOrder": 1,
      "metricsCount": 3,
      "createdAt": "2026-03-29T00:00:00.000Z",
      "updatedAt": "2026-03-29T00:00:00.000Z"
    }
  ]
}
```

Note: `metricsCount` is the count of child metrics (not the full metrics list — use the dedicated metrics endpoint for that).

---

### POST /api/admin/case-studies

Creates a new case study.

**Request Body** (validated with `createCaseStudySchema`)
```json
{
  "slug": "led-platform-migration",
  "title": "Led Platform Migration",
  "projectId": "cluid456",
  "challenge": "The legacy monolith could not scale...",
  "solution": "We decomposed into microservices...",
  "outcomes": "Deployment frequency improved by 300%...",
  "architectureNotes": "Chose event sourcing because...",
  "displayOrder": 1,
  "published": false,
  "isVisible": true
}
```

- `slug`: optional — if omitted, auto-generated from `title` (lowercase, spaces → hyphens, strip non-alphanumeric except hyphens)
- `projectId`: optional
- `architectureNotes`: optional

**Response 201** — returns the created case study (full object, no metrics)

**Response 400** — validation error
```json
{ "error": "Slug already in use" }
```
or
```json
{ "errors": [{ "field": "challenge", "message": "String must contain at least 10 character(s)" }] }
```

---

### GET /api/admin/case-studies/[id]

Returns a single case study with full metrics list.

**Response 200**
```json
{
  "caseStudy": {
    "id": "cluid123",
    "slug": "led-platform-migration",
    "title": "Led Platform Migration",
    "projectId": null,
    "challenge": "...",
    "solution": "...",
    "outcomes": "...",
    "architectureNotes": "...",
    "displayOrder": 1,
    "published": true,
    "isVisible": true,
    "mediaAssetIds": [],
    "createdAt": "2026-03-29T00:00:00.000Z",
    "updatedAt": "2026-03-29T00:00:00.000Z",
    "metrics": [
      {
        "id": "metric1",
        "caseStudyId": "cluid123",
        "label": "Deployment time",
        "value": "-60%",
        "unit": "%",
        "displayOrder": 0,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

**Response 404**
```json
{ "error": "Not found" }
```

---

### PUT /api/admin/case-studies/[id]

Updates a case study. Validated with `updateCaseStudySchema` (all fields optional/partial).

**Request Body** — any subset of `createCaseStudySchema` fields.

**Response 200** — returns the updated case study (without metrics).

**Response 400** — validation error (same shape as POST).

**Response 404** — `{ "error": "Not found" }`

---

### DELETE /api/admin/case-studies/[id]

Deletes a case study and all its child metrics (cascade delete at DB level).

**Response 204** — no body.

**Response 404** — `{ "error": "Not found" }`

---

## Case Study Metrics Sub-Resource

### GET /api/admin/case-studies/[id]/metrics

Returns all metrics for the specified case study, ordered by `displayOrder` ascending.

**Response 200**
```json
{
  "metrics": [
    {
      "id": "metric1",
      "caseStudyId": "cluid123",
      "label": "Deployment time",
      "value": "-60%",
      "unit": "%",
      "displayOrder": 0,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**Response 404** — `{ "error": "Case study not found" }` (if parent case study doesn't exist)

---

### POST /api/admin/case-studies/[id]/metrics

Creates a new metric for the case study. Validated with `caseStudyMetricSchema`.

**Request Body**
```json
{
  "label": "Deploy frequency",
  "value": "+300%",
  "unit": "%",
  "displayOrder": 1
}
```

**Response 201** — returns the created metric.

**Response 400** — validation error.

**Response 404** — `{ "error": "Case study not found" }`

---

### PUT /api/admin/case-studies/[id]/metrics/[metricId]

Updates a metric. Validated with `caseStudyMetricSchema.partial()`.

**Response 200** — returns the updated metric.

**Response 404** — `{ "error": "Not found" }` (either case study or metric not found, or metric does not belong to the case study)

---

### DELETE /api/admin/case-studies/[id]/metrics/[metricId]

Deletes a single metric.

**Response 204** — no body.

**Response 404** — `{ "error": "Not found" }`

---

## Public Case Studies (No Auth)

### GET /case-studies (page)

Next.js server component. Calls `getPublishedCaseStudies()` — returns only `published: true, isVisible: true` records ordered by `displayOrder`. Renders `CaseStudyCard` components. No JSON API.

### GET /case-studies/[slug] (page)

Next.js server component. Calls `getCaseStudyBySlug(slug)`. Returns `notFound()` if the result is null (draft, hidden, or non-existent). No JSON API.
