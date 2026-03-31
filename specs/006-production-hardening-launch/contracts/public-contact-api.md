# Contract: Public Contact API

**Branch**: `006-production-hardening-launch` | **Date**: 2026-03-31
**Auth**: Public endpoint (no login required)
**Content-Type**: `application/json`

---

## POST /api/contact

Accepts a public contact form submission, enforces validation + rate limiting, and attempts immediate email delivery.

### Request Body

```json
{
  "name": "Jane Recruiter",
  "email": "jane@company.com",
  "message": "Hi Alex, we have a senior backend role that matches your profile."
}
```

### Field Rules

- `name`: required, trimmed, 2-120 chars
- `email`: required, valid email, <= 254 chars
- `message`: required, trimmed, 10-5000 chars, Unicode-safe

### Success Response

**HTTP 200**

```json
{
  "ok": true,
  "message": "Thanks - your message was sent successfully."
}
```

### Validation Failure

**HTTP 422**

```json
{
  "ok": false,
  "error": "Validation failed",
  "fields": {
    "email": "Please enter a valid email address",
    "message": "Message must be at least 10 characters"
  }
}
```

### Rate Limit Rejection

Limit: 5 submissions per source IP hash in rolling 60 minutes.

**HTTP 429**

```json
{
  "ok": false,
  "error": "Too many submissions. Please try again later."
}
```

### Delivery Failure with Fallback Contact

If SMTP delivery fails, return user-friendly message plus direct fallback contact channel.

**HTTP 503**

```json
{
  "ok": false,
  "error": "We could not send your message right now.",
  "fallbackEmail": "owner@example.com",
  "message": "Please email us directly using the address above."
}
```

### Non-Functional Contract Rules

- Endpoint must never return raw stack traces.
- Request handling must sanitize and persist payload before final response.
- Email body must include sender name, sender email, message, timestamp, and source label.
- Persisted IP is hash only; raw IP must not be stored.
