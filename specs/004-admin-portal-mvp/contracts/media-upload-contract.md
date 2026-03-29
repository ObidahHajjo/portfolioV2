# Contract: Media Upload

**Feature Branch**: `004-admin-portal-mvp`
**Date**: 2026-03-29

---

## Upload Flow

```
Admin browser
     │
     │  POST /api/admin/media-assets/upload
     │  Content-Type: multipart/form-data
     │  Fields: file (binary), ownerType (string), ownerId (string)
     │
     ▼
Next.js API Route
     │
     ├─ 1. Validate session (middleware)
     ├─ 2. Parse formData() → extract File
     ├─ 3. Validate file size (≤ 10 MB) and MIME type (allowlist)
     │      → 400 if invalid
     │
     ├─ 4. Upload to MinIO
     │      → If upload fails: return 500 error (nothing to clean up)
     │
     ├─ 5. Create MediaAsset record in PostgreSQL
     │      → If DB write fails:
     │           a. Attempt to delete uploaded file from MinIO (best-effort)
     │           b. Return 500: "Upload failed. Storage has been cleaned up."
     │
     └─ 6. Return 201 with { id, storageUrl, fileName, fileType }
```

---

## Constraints

| Parameter | Value |
|---|---|
| Max file size | 10 MB |
| Accepted MIME types | `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf` |
| Storage backend | MinIO (S3-compatible); path: `{bucket}/{ownerType}/{ownerId}/{timestamp}-{fileName}` |
| Naming collision handling | Timestamp prefix ensures uniqueness; no overwrite |

---

## MediaAsset Record Created

On successful upload, a `MediaAsset` row is written:

```json
{
  "id":         "generated cuid",
  "fileName":   "original file name, max 255 chars",
  "storageUrl": "MinIO public or presigned URL",
  "fileType":   "MIME type string",
  "fileSize":   "integer bytes",
  "ownerType":  "project | case_study | profile | testimonial",
  "ownerId":    "cuid of the owning entity"
}
```

**Note**: `fileSize` is added in Phase 3 to the `MediaAsset` model (Phase 2 did not include it). This requires a migration addendum.

---

## Orphan Cleanup Contract

If the MinIO upload succeeds but the PostgreSQL `MediaAsset` write fails:

1. The API route MUST attempt to call `minio.removeObject(bucket, objectName)`.
2. The cleanup attempt is best-effort — if it fails, the failure is logged but does NOT change the response to the client.
3. The response to the client is always `500` with the message: `"Upload failed. Storage has been cleaned up."` (regardless of whether cleanup succeeded).
4. No partial `MediaAsset` record is written.

---

## MinIO Configuration

| Env Variable | Description |
|---|---|
| `MINIO_ENDPOINT` | MinIO server hostname (e.g., `minio` in Docker network) |
| `MINIO_PORT` | MinIO server port (default: `9000`) |
| `MINIO_USE_SSL` | `true` / `false` |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `MINIO_BUCKET` | Target bucket name (e.g., `portfolio-assets`) |

The bucket MUST be created before the application starts. Bucket creation can be handled in the Docker Compose init script or a startup check.
