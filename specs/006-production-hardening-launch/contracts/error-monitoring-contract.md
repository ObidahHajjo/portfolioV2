# Contract: Error Monitoring and Alerting

**Branch**: `006-production-hardening-launch` | **Date**: 2026-03-31

---

## Error Event Ingest

### POST /api/monitoring/error-events

**Auth**: Internal/public caller allowed, payload validated strictly
**Content-Type**: `application/json`

Used by:

- Public global error boundary
- Admin error boundary
- Server/API catch wrappers

### Request Body

```json
{
  "surface": "PUBLIC",
  "pagePath": "/",
  "message": "TypeError: Cannot read properties of undefined",
  "stack": "TypeError...",
  "fingerprint": "home-hero-null"
}
```

### Validation Rules

- `surface`: required enum `PUBLIC | ADMIN | API`
- `message`: required, max 4000 chars
- `pagePath`: optional, must start with `/` when provided
- `stack`: optional, truncated before persistence
- `fingerprint`: optional, max 100 chars

### Response

**HTTP 202**

```json
{ "ok": true }
```

### Failure Contract

- Endpoint never returns stack traces.
- Persistence failure returns `202` with internal logging only (monitoring must not break product UX).

---

## Alert Threshold Contract

### Rule

- If 3 or more `ErrorEvent` rows are recorded within a rolling 10-minute window, send one alert email to configured owner address.

### Cooldown Behavior

- Do not send duplicate alert emails for the same active threshold window.
- Persist alert attempt in `ErrorAlert` with status `SENT` or `FAILED`.

### Alert Email Payload

Must include:

- threshold count
- time window
- top affected page paths (up to 5)
- sample error messages (up to 3)

---

## Admin UX Contract for Unhandled Errors

- Admin pages show friendly error UI on failure (`src/app/admin/error.tsx`).
- UI message must avoid raw stack trace.
- Error report should still be sent to monitoring endpoint in background.
