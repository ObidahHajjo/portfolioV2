# Contract: CV Upload / Download / Delete

**Branch**: `005-advanced-portfolio` | **Date**: 2026-03-29

---

## Admin CV API

**Auth**: All `/api/admin/cv` endpoints require a valid `iron-session` admin cookie. Requests without a valid session return `401 { "error": "Unauthorized" }`.

### GET /api/admin/cv

Returns the current published CV asset metadata (for admin display). Returns `null` if no CV is published.

**Response 200**
```json
{
  "cv": {
    "id": "cluid123",
    "fileName": "john-doe-cv-2026.pdf",
    "fileSize": 204800,
    "published": true,
    "createdAt": "2026-03-29T00:00:00.000Z",
    "updatedAt": "2026-03-29T00:00:00.000Z"
  }
}
```

Note: `storageKey` is **never** included in this response — it is for internal use only.

Or, if no CV exists:
```json
{ "cv": null }
```

---

### POST /api/admin/cv

Uploads a new CV PDF. If a CV already exists, the old file is permanently deleted from MinIO and its DB record is removed before the new one is stored.

**Request**: `multipart/form-data` with a single `file` field containing the PDF.

**Validation**:
- Content-Type of the uploaded file must be `application/pdf`
- File size must be ≤ 10MB (10,485,760 bytes)
- If validation fails: return `400` before any storage operation

**Steps** (must execute atomically in order):
1. Validate file type and size
2. Fetch existing `CvAsset` where `published = true`
3. If exists:
   a. Delete MinIO object at `existing.storageKey`
   b. Delete the DB record
4. Upload new PDF to MinIO at key `cv/[cuid()].pdf`
5. Create new `CvAsset` record with `published: true`, the MinIO key as `storageKey`, the original filename as `fileName`, and the byte count as `fileSize`
6. Return the new record (without `storageKey`)

**Response 201**
```json
{
  "cv": {
    "id": "cluid456",
    "fileName": "john-doe-cv-2026.pdf",
    "fileSize": 204800,
    "published": true,
    "createdAt": "2026-03-29T00:00:00.000Z",
    "updatedAt": "2026-03-29T00:00:00.000Z"
  }
}
```

**Response 400**
```json
{ "error": "File must be a PDF" }
```
or
```json
{ "error": "File size exceeds 10MB limit" }
```

**Failure handling**: If the MinIO upload in step 4 succeeds but the DB insert in step 5 fails, the uploaded MinIO object must be deleted before returning `500`. Never leave an orphaned MinIO object.

---

### DELETE /api/admin/cv

Permanently removes the current CV from MinIO and deletes the DB record.

**Steps**:
1. Fetch `CvAsset` where `published = true`
2. If none: return `404 { "error": "No CV to delete" }`
3. Delete MinIO object at `storageKey`
4. Delete DB record
5. Return `204`

**Response 204** — no body.

**Response 404** — `{ "error": "No CV to delete" }`

---

## Public CV Download

**Auth**: No authentication required. This is a public endpoint.

### GET /api/cv/download

Serves the published CV PDF to the visitor.

**Steps**:
1. Query `prisma.cvAsset.findFirst({ where: { published: true } })`
2. If none: return `404` with a plain-text or JSON body `{ "error": "CV not available" }`
3. Fetch file bytes from MinIO using `storageKey`
4. If MinIO fetch fails: return `503 { "error": "CV temporarily unavailable — please check back shortly" }`
5. Stream or buffer the bytes to the client with headers:
   - `Content-Type: application/pdf`
   - `Content-Disposition: attachment; filename="[fileName]"`
   - `Cache-Control: no-store` (ensures visitors always receive the current version)

**Important**: The `storageKey` value must never appear in any response header or body. The MinIO object is accessed server-side only.

**Response 200** — PDF binary stream.

**Response 404** — `{ "error": "CV not available" }`

**Response 503** — `{ "error": "CV temporarily unavailable — please check back shortly" }`

---

## Admin UI Behaviour

`src/app/admin/cv/page.tsx` must:

- On load: call `GET /api/admin/cv` and display current state
- **No CV state**: Show "No CV uploaded" text; render a file `<input>` with label "Upload CV (PDF, max 10MB)"
- **CV active state**: Show `fileName`, formatted `fileSize` (e.g., "200 KB"), a green "Active" badge; render "Upload Replacement" file `<input>` and a "Delete" button
- On file selection: immediately POST to `/api/admin/cv` with `multipart/form-data`; show loading state during upload; on success refresh state; on error show inline error message
- Delete button: confirm before calling `DELETE /api/admin/cv`; on success reset to "No CV" state

---

## CvDownloadButton Component Behaviour

`src/components/ui/CvDownloadButton.tsx` (server component):

- Calls `getPublishedCvAsset()` at render time
- If result is `null`: renders `null` (no output — the button is entirely absent from the DOM)
- If result is present: renders `<a href="/api/cv/download" download>Download CV</a>` styled as a button
- No client-side state, no loading states — this is a simple conditional server render
