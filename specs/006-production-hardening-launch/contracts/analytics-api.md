# Contract: Analytics Event Ingest and Admin Reporting

**Branch**: `006-production-hardening-launch` | **Date**: 2026-03-31

---

## Public Ingest Endpoint

### POST /api/analytics/page-view

**Auth**: Public endpoint
**Content-Type**: `application/json`

Captures one page-view event. Endpoint must be non-blocking from UX perspective (caller does not await render-critical work).

#### Request Body

```json
{
  "pagePath": "/case-studies/led-platform-migration",
  "referrer": "https://linkedin.com/"
}
```

#### Server Processing Rules

1. Validate `pagePath` format and normalize trailing slash behavior.
2. Parse `referrer` and persist host only (`linkedin.com`), not full URL.
3. Build `sessionHash = sha256(yyyy-mm-dd + ip + userAgent + ANALYTICS_SALT)`.
4. Insert one `AnalyticsEvent` row.
5. Swallow persistence errors (log internally, return accepted status).

#### Response

**HTTP 202**

```json
{ "ok": true }
```

---

## Admin Reporting Endpoint

### GET /api/admin/analytics/summary?from=2026-03-01&to=2026-03-31

**Auth**: Requires valid admin session (`iron-session`)

Returns aggregate analytics for dashboard cards and charts.

#### Query Rules

- `from`, `to` are required ISO date strings.
- Reject ranges where `from > to`.
- Maximum range: 365 days.

#### Response

**HTTP 200**

```json
{
  "range": {
    "from": "2026-03-01",
    "to": "2026-03-31"
  },
  "totals": {
    "visits": 142,
    "uniqueSessions": 79
  },
  "topPages": [
    { "pagePath": "/", "visits": 71 },
    { "pagePath": "/case-studies/led-platform-migration", "visits": 34 }
  ],
  "referralSources": [
    { "source": "linkedin.com", "visits": 22 },
    { "source": "direct", "visits": 88 }
  ],
  "dailyVisits": [
    { "date": "2026-03-28", "visits": 9 },
    { "date": "2026-03-29", "visits": 11 }
  ]
}
```

#### Auth Error

**HTTP 401**

```json
{ "error": "Unauthorized" }
```

#### Validation Error

**HTTP 400**

```json
{ "error": "Invalid date range" }
```

---

## Privacy Contract

- No raw IP address storage.
- No cookie/user ID tied to person identity.
- No third-party tracking script dependencies.
- Analytics failures must not affect public page rendering.
