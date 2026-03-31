# Phase 5 Launch Checklist

**Branch**: `006-production-hardening-launch` | **Date**: 2026-03-31

Pre-production checklist for Phase 5 - Production Hardening and Launch.

---

## 1. Environment Validation

### 1.1 Required Environment Variables

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `SESSION_SECRET` - Minimum 32 random characters
- [ ] `NEXT_PUBLIC_APP_URL` - Public URL of the application
- [ ] `SMTP_HOST` - SMTP server hostname
- [ ] `SMTP_USER` - SMTP authentication username
- [ ] `SMTP_PASS` - SMTP authentication password
- [ ] `ANALYTICS_SALT` - Random 32+ character string

### 1.2 Optional Environment Variables

- [ ] `SMTP_PORT` - Defaults to 587
- [ ] `SMTP_SECURE` - Set to `true` for TLS
- [ ] `SMTP_FROM` - Sender email (defaults to SMTP_USER)

### 1.3 Validation Command

```bash
# Check all required variables are set
node -e "
const required = ['DATABASE_URL', 'SESSION_SECRET', 'NEXT_PUBLIC_APP_URL', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'ANALYTICS_SALT'];
const missing = required.filter(v => !process.env[v]);
if (missing.length) { console.error('Missing:', missing.join(', ')); process.exit(1); }
console.log('All required env vars present');
"
```

---

## 2. Database Migration

### 2.1 Pre-Migration Checks

- [ ] Database backup completed
- [ ] Current migration status verified: `npx prisma migrate status`
- [ ] No pending migrations from previous phases

### 2.2 Migration Execution

```bash
# Apply Phase 5 schema changes
npx prisma migrate deploy

# Verify migration applied
npx prisma migrate status
```

### 2.3 Expected Schema Changes

- `SeoMetadata.canonicalUrl` field added
- `ContactSubmission` table created
- `AnalyticsEvent` table created
- `ErrorEvent` table created
- `ErrorAlert` table created

---

## 3. Docker Rebuild

### 3.1 Rebuild Commands

```bash
# Stop existing containers
docker compose -f docker/docker-compose.yml down

# Rebuild and restart
docker compose -f docker/docker-compose.yml up -d --build

# Check container status
docker compose -f docker/docker-compose.yml ps
```

### 3.2 Container Health Checks

- [ ] `app` container running
- [ ] `db` container running and accepting connections
- [ ] `storage` (MinIO) container running

---

## 4. Smoke Tests

### 4.1 Public Routes

```bash
# Homepage loads
curl -s -o /dev/null -w "%{http_code}" https://your-domain.com/
# Expected: 200

# Sitemap accessible
curl -s -o /dev/null -w "%{http_code}" https://your-domain.com/sitemap.xml
# Expected: 200

# Robots.txt accessible
curl -s -o /dev/null -w "%{http_code}" https://your-domain.com/robots.txt
# Expected: 200
```

### 4.2 Contact Form

```bash
# Test contact submission (replace with actual values)
curl -X POST https://your-domain.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Smoke test message"}'
# Expected: {"ok":true,"message":"Thanks - your message was sent successfully."}
```

### 4.3 Admin Routes

- [ ] Admin login accessible: `/admin/login`
- [ ] Admin dashboard loads after login: `/admin`
- [ ] Analytics page accessible: `/admin/analytics`

### 4.4 API Health

```bash
# Analytics ingest accepts requests (should return 202)
curl -X POST https://your-domain.com/api/analytics/page-view \
  -H "Content-Type: application/json" \
  -d '{"pagePath":"/","referrer":""}'
# Expected: {"ok":true}

# Monitoring ingest accepts requests (should return 202)
curl -X POST https://your-domain.com/api/monitoring/error-events \
  -H "Content-Type: application/json" \
  -d '{"surface":"PUBLIC","message":"Smoke test"}'
# Expected: {"ok":true}
```

---

## 5. Feature Verification

### 5.1 SEO Metadata

- [ ] Homepage `<title>` tag present
- [ ] Homepage `<meta name="description">` present
- [ ] Open Graph tags present: `og:title`, `og:description`, `og:url`
- [ ] Twitter card tags present: `twitter:card`, `twitter:title`
- [ ] Canonical URL set correctly

### 5.2 Sitemap

- [ ] `/sitemap.xml` returns valid XML
- [ ] Only published pages included
- [ ] Admin routes excluded
- [ ] Draft content excluded

### 5.3 Contact Form

- [ ] Valid submission returns success
- [ ] Invalid email returns validation error
- [ ] Rate limiting enforced (5 submissions per hour per IP)
- [ ] SMTP failure shows fallback contact

### 5.4 Accessibility

- [ ] Keyboard navigation works throughout
- [ ] Focus indicators visible
- [ ] Skip link functional
- [ ] Form error messages announced to screen readers

### 5.5 Performance

- [ ] Lighthouse Performance >= 90
- [ ] LCP < 2.5 seconds
- [ ] CLS < 0.1
- [ ] INP < 200ms

### 5.6 Error Monitoring

- [ ] Errors captured to database
- [ ] Threshold alerts sent (3 errors in 10 minutes)
- [ ] Admin error boundary shows friendly message

### 5.7 Analytics

- [ ] Page views captured
- [ ] Admin analytics dashboard shows data
- [ ] Date filtering works
- [ ] Top pages displayed

---

## 6. Security Checks

- [ ] No secrets in `.env.example`
- [ ] `.env` excluded from git (in `.gitignore`)
- [ ] No hardcoded credentials in code
- [ ] Rate limiting active on contact form
- [ ] Input sanitization working
- [ ] Error responses don't leak stack traces

---

## 7. Post-Deploy Monitoring

### 7.1 First Hour Checks

- [ ] Check application logs: `docker logs <container>`
- [ ] Verify contact submissions arriving in database
- [ ] Verify analytics events being captured
- [ ] Monitor for error spikes in `/admin` (future: error dashboard)

### 7.2 First Day Checks

- [ ] Review analytics dashboard for traffic patterns
- [ ] Check for any threshold alert emails
- [ ] Verify contact form deliverability

---

## 8. Rollback Procedure

If critical issues found:

```bash
# Revert to previous Docker image
docker compose -f docker/docker-compose.yml down
docker tag <previous-image> <current-image>
docker compose -f docker/docker-compose.yml up -d

# If database migration caused issues
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## Sign-Off

| Role      | Name | Date | Status       |
| --------- | ---- | ---- | ------------ |
| Developer |      |      | [ ] Ready    |
| Reviewer  |      |      | [ ] Approved |
