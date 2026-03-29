# Contract: Admin API Endpoints

**Feature Branch**: `004-admin-portal-mvp`
**Date**: 2026-03-29
**Style**: REST — standard HTTP verbs, JSON bodies, Zod-validated server-side

---

## Authentication

All endpoints under `/api/admin/` (except `/api/admin/auth/login`) require a valid `admin_session` cookie. Requests without a valid session return `401 Unauthorized`.

---

## Auth Endpoints

### POST /api/admin/auth/login

Authenticate the administrator and issue a session cookie.

**Request body**:
```json
{ "email": "string", "password": "string" }
```

**Responses**:
| Status | Condition | Body |
|---|---|---|
| 200 | Credentials valid, no lockout | `{ "ok": true }` + `Set-Cookie: admin_session` |
| 401 | Invalid credentials | `{ "error": "Invalid email or password" }` |
| 429 | Account locked (5 failed attempts in 15 min) | `{ "error": "Too many attempts. Try again in N minutes." }` |
| 422 | Validation failure (malformed body) | `{ "error": "...", "fields": { ... } }` |

**Side effects**: Appends a `LoginAttempt` record on every attempt (success or failure).

---

### POST /api/admin/auth/logout

Destroy the current session.

**Responses**:
| Status | Condition | Body |
|---|---|---|
| 200 | Session destroyed | `{ "ok": true }` + `Set-Cookie: admin_session` (cleared) |
| 401 | No active session | `{ "error": "Not authenticated" }` |

---

### GET /api/admin/session/status

Return the current session expiry time. Used by the client-side expiry warning timer.

**Responses**:
| Status | Condition | Body |
|---|---|---|
| 200 | Session valid | `{ "expiresAt": "ISO 8601 timestamp" }` |
| 401 | No active session | `{ "error": "Not authenticated" }` |

---

### POST /api/admin/session/extend

Re-issue the session cookie with a fresh 8-hour window. Called when the admin accepts the "stay logged in" prompt.

**Responses**:
| Status | Condition | Body |
|---|---|---|
| 200 | Session extended | `{ "ok": true, "expiresAt": "ISO 8601 timestamp" }` + refreshed `Set-Cookie` |
| 401 | No active session | `{ "error": "Not authenticated" }` |

---

## Content CRUD Pattern

All content entity endpoints follow a consistent REST pattern. Replace `{entity}` with the plural kebab-case entity name: `profiles`, `heroes`, `contact-settings`, `social-links`, `experiences`, `projects`, `case-studies`, `skills`, `testimonials`, `seo-metadata`, `media-assets`.

### Non-Singleton Entities

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/{entity}` | List all records (admin view — includes drafts and hidden) |
| POST | `/api/admin/{entity}` | Create a new record |
| GET | `/api/admin/{entity}/{id}` | Fetch a single record by ID |
| PATCH | `/api/admin/{entity}/{id}` | Partial update of a record |
| DELETE | `/api/admin/{entity}/{id}` | Permanently delete a record |

### Singleton Entities (Profile, Hero, ContactSettings)

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/{entity}` | Fetch the single record (create if not exists) |
| PATCH | `/api/admin/{entity}` | Update the single record |

Singleton endpoints do NOT expose POST or DELETE.

---

## Lifecycle / Visibility Endpoints

These endpoints manage publish state and visibility independently of full record edits.

### PATCH /api/admin/{entity}/{id}/publish

Set `published = true`. Validates required fields are populated before allowing publish.

**Responses**: `200 { "ok": true }` | `400 { "error": "...", "fields": {...} }` | `404`

### PATCH /api/admin/{entity}/{id}/unpublish

Set `published = false`.

**Responses**: `200 { "ok": true }` | `404`

### PATCH /api/admin/{entity}/{id}/hide

Set `isVisible = false`. Record must be published.

**Responses**: `200 { "ok": true }` | `400 { "error": "Item must be published to hide" }` | `404`

### PATCH /api/admin/{entity}/{id}/show

Set `isVisible = true`.

**Responses**: `200 { "ok": true }` | `404`

---

## Ordering Endpoint

### PATCH /api/admin/{entity}/{id}/order

Update the `displayOrder` field for a single item.

**Request body**: `{ "displayOrder": number }` (integer ≥ 0)

**Responses**: `200 { "ok": true }` | `422 { "error": "displayOrder must be a non-negative integer" }` | `404`

---

## Media Upload

### POST /api/admin/media-assets/upload

Upload a file and register a MediaAsset record.

**Request**: `multipart/form-data` with field `file` (binary) and `ownerType` + `ownerId` (text fields)

**Constraints**:
- Max file size: 10 MB
- Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`

**Responses**:
| Status | Condition | Body |
|---|---|---|
| 201 | Upload and registration successful | `{ "id": "...", "storageUrl": "...", "fileName": "...", "fileType": "..." }` |
| 400 | File too large or disallowed type | `{ "error": "File type not allowed" / "File exceeds 10 MB limit" }` |
| 500 | Storage write succeeded but DB record failed (auto-cleanup attempted) | `{ "error": "Upload failed. Storage has been cleaned up." }` |

---

## Preview

### GET /api/admin/preview/{entity}/{id}

Render a draft item as it would appear when published. Requires valid admin session.

**Responses**: `200` (rendered page or JSON representation) | `401 Not authenticated` | `404 Not found`

---

## Dashboard

### GET /api/admin/dashboard/summary

Return summary counts for the dashboard.

**Response**:
```json
{
  "projects":     { "published": 3, "draft": 1 },
  "skills":       { "published": 12, "draft": 2 },
  "experiences":  { "published": 4, "draft": 0 },
  "testimonials": { "published": 2, "draft": 1 },
  "socialLinks":  { "published": 5, "draft": 0 }
}
```

---

## Standard Error Shape

All error responses follow a consistent shape:

```json
{
  "error": "Human-readable message",
  "fields": {
    "fieldName": "Field-specific validation message"
  }
}
```

`fields` is only present for 422 Unprocessable Entity responses.
