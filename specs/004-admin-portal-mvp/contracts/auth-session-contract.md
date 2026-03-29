# Contract: Admin Authentication & Session

**Feature Branch**: `004-admin-portal-mvp`
**Date**: 2026-03-29

---

## Credential Model

- **Single account**: One administrator. No registration endpoint.
- **Credential storage**: Hashed password (bcrypt, cost factor ≥ 12) stored in environment variable or seeded record. Plaintext passwords MUST never be persisted.
- **Credential provisioning**: Via environment variable `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` at container startup, or via a one-time seed script.

---

## Session Lifecycle

```
  Login (valid creds)
        │
        ▼
  [Create iron-session]
  adminId, loginTime, expiresAt = now + 8h
        │
        ▼
  Set-Cookie: admin_session (HTTP-only, Secure, SameSite=Strict)
        │
  ┌─────┴─────┐
  │  Active   │  ◄── All admin requests pass through middleware.ts
  │  Session  │      which checks cookie validity on every request
  └─────┬─────┘
        │
  At T-5min: client polling detects ≤5min remaining → warning shown
        │
  [Admin accepts "Stay logged in"]
        │
        ▼
  POST /api/admin/session/extend
  Re-issue cookie with new expiresAt = now + 8h
        │
  ─ OR ─
        │
  [Admin ignores warning → session expires]
        │
        ▼
  Next request: middleware detects expired/invalid cookie
  Redirect → /admin/login?reason=session_expired
  Form data discarded (client-side)

  [Admin clicks Logout]
        │
        ▼
  POST /api/admin/auth/logout
  Cookie cleared; redirect → /admin/login
```

---

## Cookie Attributes

| Attribute | Value | Reason |
|---|---|---|
| `httpOnly` | `true` | Prevents JS access; mitigates XSS cookie theft |
| `secure` | `true` (production) | HTTPS-only; configurable for local dev |
| `sameSite` | `Strict` | Prevents CSRF via cross-site requests |
| `maxAge` | `28800` (8 hours) | Absolute timeout; not extended by activity |
| `path` | `/` | Sent with all requests; middleware needs it |

---

## Login Lockout Rules

| Parameter | Value |
|---|---|
| Max failed attempts before lockout | 5 |
| Observation window | 15 minutes |
| Lockout duration | 15 minutes from the 5th failed attempt |
| Attempt record retention | 24 hours (pruned async) |
| Lock scope | Per email address (not per IP) |

**Lockout check (pseudo-code)**:
```
failedCount = COUNT(login_attempts WHERE email=$1 AND success=false AND attemptAt > NOW()-15min)
IF failedCount >= 5:
  RETURN 429 with message "Too many attempts. Try again in N minutes."
```

**On successful login**: A `LoginAttempt` record with `success=true` is written. This does NOT reset the failed count — the count window is purely time-based.

---

## Route Protection Contract

All routes under `/admin/*` (except `/admin/login`) are protected by `middleware.ts`.

```typescript
// middleware.ts (pseudocode)
matcher: ['/admin/:path*']
if path === '/admin/login': pass through
else:
  session = unseal(cookie)
  if !session OR session.expiresAt < now():
    redirect to /admin/login?reason=...
  else: pass through
```

No admin page component performs its own auth check — the middleware is the sole enforcement layer for route access.

---

## Security Constraints

- Plaintext `ADMIN_PASSWORD` MUST NOT appear in source code, git history, or logs
- The `SESSION_SECRET` used by `iron-session` MUST be at least 32 characters, stored only in environment variables
- Session cookie MUST be cleared on logout — not merely ignored
- The login endpoint MUST NOT reveal whether an email address is registered (uniform error message for both invalid email and invalid password)
- Lockout response MUST include remaining minutes but MUST NOT expose internal attempt count
