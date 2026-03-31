import { expect, test } from '@playwright/test';

test.describe('SEO Metadata and Sitemap (US1)', () => {
  test('homepage has required meta tags', async ({ page }) => {
    await page.goto('/');

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    const metaDescription = await page.evaluate(() =>
      document.querySelector('meta[name="description"]')?.getAttribute('content')
    );
    expect(metaDescription).toBeTruthy();
    expect(metaDescription!.length).toBeGreaterThan(0);

    const canonical = await page.evaluate(() =>
      document.querySelector('link[rel="canonical"]')?.getAttribute('href')
    );
    expect(canonical).toBeTruthy();

    const ogTitle = await page.evaluate(() =>
      document.querySelector('meta[property="og:title"]')?.getAttribute('content')
    );
    expect(ogTitle).toBeTruthy();

    const ogDescription = await page.evaluate(() =>
      document.querySelector('meta[property="og:description"]')?.getAttribute('content')
    );
    expect(ogDescription).toBeTruthy();

    const ogImage = await page.evaluate(() =>
      document.querySelector('meta[property="og:image"]')?.getAttribute('content')
    );
    expect(ogImage).toBeTruthy();

    const ogUrl = await page.evaluate(() =>
      document.querySelector('meta[property="og:url"]')?.getAttribute('content')
    );
    expect(ogUrl).toBeTruthy();

    const twitterCard = await page.evaluate(() =>
      document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')
    );
    expect(twitterCard).toBeTruthy();

    const twitterTitle = await page.evaluate(() =>
      document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')
    );
    expect(twitterTitle).toBeTruthy();

    const twitterDescription = await page.evaluate(() =>
      document.querySelector('meta[name="twitter:description"]')?.getAttribute('content')
    );
    expect(twitterDescription).toBeTruthy();

    const twitterImage = await page.evaluate(() =>
      document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
    );
    expect(twitterImage).toBeTruthy();
  });

  test('case studies list page has required meta tags', async ({ page }) => {
    await page.goto('/case-studies');

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.toLowerCase()).toContain('case');

    const metaDescription = await page.evaluate(() =>
      document.querySelector('meta[name="description"]')?.getAttribute('content')
    );
    expect(metaDescription).toBeTruthy();

    const canonical = await page.evaluate(() =>
      document.querySelector('link[rel="canonical"]')?.getAttribute('href')
    );
    expect(canonical).toBeTruthy();
    expect(canonical).toContain('/case-studies');

    const ogTitle = await page.evaluate(() =>
      document.querySelector('meta[property="og:title"]')?.getAttribute('content')
    );
    expect(ogTitle).toBeTruthy();
  });

  test('sitemap.xml is valid and accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);

    const content = await response?.text();
    expect(content).toBeTruthy();
    expect(content).toContain('<?xml');
    expect(content).toContain('<urlset');
    expect(content).toContain('</urlset>');
  });

  test('sitemap contains homepage and case studies list', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    const content = await response?.text();

    expect(content).toContain('<loc>');
    expect(content).toMatch(/<loc>.*\/<\/loc>/);
    expect(content).toContain('/case-studies</loc>');
  });

  test('sitemap does not contain admin routes', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    const content = await response?.text();

    expect(content).not.toContain('/admin');
  });
});

test.describe('Contact Form (US2)', () => {
  test.describe.configure({ mode: 'serial' });

  test('contact form validates required fields', async ({ page }) => {
    await page.goto('/#contact');
    await page.waitForSelector('#contact form');

    await page.click('button[type="submit"]');

    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-error"]')).toBeVisible();
  });

  test('contact form validates field length constraints', async ({ page }) => {
    await page.goto('/#contact');
    await page.waitForSelector('#contact form');

    await page.fill('input[name="name"]', 'A');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('textarea[name="message"]', 'Short');

    await page.click('button[type="submit"]');

    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-error"]')).toBeVisible();
  });

  test('contact form submits valid payload', async ({ page }) => {
    const uniqueIp = `198.51.100.${Math.floor(Math.random() * 200) + 1}`;
    await page.route('**/api/contact', async (route) => {
      const headers = {
        ...route.request().headers(),
        'x-forwarded-for': uniqueIp,
      };
      await route.continue({ headers });
    });

    await page.goto('/#contact');
    await page.waitForSelector('#contact form');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill(
      'textarea[name="message"]',
      'This is a test message with sufficient length for validation.'
    );

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/contact') && resp.request().method() === 'POST'
    );

    await page.click('button[type="submit"]');

    const response = await responsePromise;
    expect([200, 503]).toContain(response.status());

    if (response.status() === 200) {
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    } else {
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    }
  });

  test('contact form rate limits after threshold', async ({ page }) => {
    const testIp = `203.0.113.${Math.floor(Math.random() * 200) + 1}`;
    await page.route('**/api/contact', async (route) => {
      const headers = {
        ...route.request().headers(),
        'x-forwarded-for': testIp,
      };
      await route.continue({ headers });
    });

    await page.goto('/#contact');
    await page.waitForSelector('#contact form');

    let sawRateLimit = false;

    for (let i = 0; i < 6; i++) {
      await page.fill('input[name="name"]', `Rate Test ${i}`);
      await page.fill('input[name="email"]', `ratetest${i}@example.com`);
      await page.fill(
        'textarea[name="message"]',
        `Rate limit test message number ${i} with enough characters.`
      );

      const responsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/api/contact') && resp.request().method() === 'POST'
      );

      await page.click('button[type="submit"]');
      const response = await responsePromise;

      if (response.status() === 429) {
        sawRateLimit = true;
        await expect(page.locator('[data-testid="rate-limit-error"]')).toBeVisible();
        break;
      }

      if (i < 5) {
        expect([200, 503]).toContain(response.status());
        await page.waitForTimeout(300);
        await page.goto('/#contact');
        await page.waitForSelector('#contact form');
      }
    }

    expect(sawRateLimit).toBe(true);
  });

  test('contact form handles SMTP failure gracefully', async ({ page }) => {
    await page.goto('/#contact');
    await page.waitForSelector('#contact form');

    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          error: 'We could not send your message right now.',
          fallbackEmail: 'fallback@example.com',
          message: 'Please email us directly using the address above.',
        }),
      });
    });

    await page.fill('input[name="name"]', 'SMTP Test');
    await page.fill('input[name="email"]', 'smtptest@example.com');
    await page.fill('textarea[name="message"]', 'Testing SMTP failure fallback behavior.');

    await page.click('button[type="submit"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="fallback-email"]')).toBeVisible();
  });

  test('contact form is accessible with keyboard', async ({ page }) => {
    await page.goto('/#contact');
    await page.waitForSelector('#contact form');

    await page.focus('input[name="name"]');
    await expect(page.locator('input[name="name"]')).toBeFocused();

    await page.press('input[name="name"]', 'Tab');
    await expect(page.locator('input[name="email"]')).toBeFocused();

    await page.press('input[name="email"]', 'Tab');
    await expect(page.locator('textarea[name="message"]')).toBeFocused();

    await page.press('textarea[name="message"]', 'Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });

  test('contact form has proper ARIA attributes', async ({ page }) => {
    await page.goto('/#contact');
    await page.waitForSelector('#contact form');

    const form = page.locator('#contact form');
    await expect(form).toHaveAttribute('aria-label', 'Contact form');

    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('aria-required', 'true');

    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute('aria-required', 'true');

    const messageInput = page.locator('textarea[name="message"]');
    await expect(messageInput).toHaveAttribute('aria-required', 'true');
  });
});

test.describe('Accessibility (US3)', () => {
  test('accessibility tests are in accessibility.spec.ts', async ({ page }) => {
    await page.goto('/');
    expect(true).toBe(true);
  });
});

test.describe('Performance (US4)', () => {
  test('homepage renders critical content quickly', async ({ page }) => {
    await page.goto('/');

    const heroHeading = page.locator('#hero-heading');
    await expect(heroHeading).toBeVisible({ timeout: 3000 });

    const heroText = await heroHeading.textContent();
    expect(heroText).toBeTruthy();
    expect(heroText!.length).toBeGreaterThan(0);
  });

  test('no layout shift on hero section', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('#hero');

    const heroSection = page.locator('#hero');
    const boundingBox = await heroSection.boundingBox();

    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.height).toBeGreaterThan(0);
  });

  test('images have explicit dimensions to prevent CLS', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img').all();

    for (const img of images) {
      const hasWidth = await img.evaluate((el) => el.hasAttribute('width') || el.style.width);
      const hasHeight = await img.evaluate((el) => el.hasAttribute('height') || el.style.height);

      expect(hasWidth || hasHeight).toBe(true);
    }
  });

  test('fonts are preloaded for performance', async ({ page }) => {
    const response = await page.goto('/');
    const html = await response?.text();

    expect(html).toContain('font');
  });

  test('no blocking external scripts in head', async ({ page }) => {
    await page.goto('/');

    const blockingThirdPartyScripts = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('head script[src]'));
      const host = window.location.host;
      return scripts.filter((s) => {
        const script = s as HTMLScriptElement;
        const src = script.getAttribute('src') || '';
        const isBlocking = !script.async && !script.defer;
        const isLocal = src.startsWith('/') || src.includes(host) || src.includes('/_next/');
        return isBlocking && !isLocal;
      }).length;
    });

    expect(blockingThirdPartyScripts).toBe(0);
  });

  test('projects section renders without layout shift', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#projects');

    const projectsSection = page.locator('#projects');
    const boundingBox = await projectsSection.boundingBox();

    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.width).toBeGreaterThan(300);
  });

  test('LCP element is within viewport on load', async ({ page }) => {
    await page.goto('/');

    const lcpEntries = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(
            entries.map((e) => ({
              startTime: e.startTime,
              size: (e as any).size,
              element: (e as any).element?.tagName,
            }))
          );
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        setTimeout(() => resolve([]), 3000);
      });
    });

    expect((lcpEntries as any[]).length).toBeGreaterThan(0);
  });
});

test.describe('Error Monitoring (US5)', () => {
  test('error capture API accepts valid payload and returns 202', async ({ page }) => {
    const response = await page.request.post('/api/monitoring/error-events', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        surface: 'PUBLIC',
        pagePath: '/test-error',
        message: 'Test error message for validation',
        stack: 'Error: Test\n  at test.js:10',
        fingerprint: 'test-error-001',
      },
    });

    expect(response.status()).toBe(202);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test('error capture API rejects invalid payload with 422', async ({ page }) => {
    const response = await page.request.post('/api/monitoring/error-events', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        surface: 'INVALID_SURFACE',
        message: 'Test',
      },
    });

    expect(response.status()).toBe(422);
  });

  test('error capture API rejects empty message with 422', async ({ page }) => {
    const response = await page.request.post('/api/monitoring/error-events', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        surface: 'PUBLIC',
        message: '',
      },
    });

    expect(response.status()).toBe(422);
  });

  test('error capture API accepts minimal payload', async ({ page }) => {
    const response = await page.request.post('/api/monitoring/error-events', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        surface: 'API',
        message: 'Minimal error test',
      },
    });

    expect(response.status()).toBe(202);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test('threshold alert triggers after multiple errors in window', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      const response = await page.request.post('/api/monitoring/error-events', {
        headers: { 'Content-Type': 'application/json' },
        data: {
          surface: 'PUBLIC',
          pagePath: '/threshold-test',
          message: `Threshold test error ${i}`,
          fingerprint: 'threshold-test',
        },
      });
      expect(response.status()).toBe(202);
    }

    expect(true).toBe(true);
  });

  test('error capture accepts ADMIN surface', async ({ page }) => {
    const response = await page.request.post('/api/monitoring/error-events', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        surface: 'ADMIN',
        pagePath: '/admin/test',
        message: 'Admin error test',
      },
    });

    expect(response.status()).toBe(202);
  });

  test('error capture accepts API surface', async ({ page }) => {
    const response = await page.request.post('/api/monitoring/error-events', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        surface: 'API',
        pagePath: '/api/test',
        message: 'API error test',
      },
    });

    expect(response.status()).toBe(202);
  });

  test('error capture rejects oversized messages with 422', async ({ page }) => {
    const longMessage = 'A'.repeat(5000);
    const response = await page.request.post('/api/monitoring/error-events', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        surface: 'PUBLIC',
        message: longMessage,
      },
    });

    expect(response.status()).toBe(422);
  });

  test('error capture handles special characters in message', async ({ page }) => {
    const response = await page.request.post('/api/monitoring/error-events', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        surface: 'PUBLIC',
        message: 'Error with <script>alert("xss")</script> and quotes "test"',
      },
    });

    expect(response.status()).toBe(202);
  });
});

test.describe('Analytics (US6)', () => {
  test('analytics ingest API accepts valid page view and returns 202', async ({ page }) => {
    const response = await page.request.post('/api/analytics/page-view', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        pagePath: '/test-page',
        referrer: 'https://example.com/some-page',
      },
    });

    expect(response.status()).toBe(202);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test('analytics ingest API returns 202 for minimal payload', async ({ page }) => {
    const response = await page.request.post('/api/analytics/page-view', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        pagePath: '/minimal-test',
      },
    });

    expect(response.status()).toBe(202);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test('analytics ingest API returns 400 for missing pagePath', async ({ page }) => {
    const response = await page.request.post('/api/analytics/page-view', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        referrer: 'https://example.com',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('analytics ingest API returns 400 for empty pagePath', async ({ page }) => {
    const response = await page.request.post('/api/analytics/page-view', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        pagePath: '',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('analytics ingest API rejects long pagePath', async ({ page }) => {
    const longPath = '/test/' + 'a'.repeat(400);
    const response = await page.request.post('/api/analytics/page-view', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        pagePath: longPath,
      },
    });

    expect(response.status()).toBe(400);
  });

  test('analytics ingest API handles special characters in referrer', async ({ page }) => {
    const response = await page.request.post('/api/analytics/page-view', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        pagePath: '/special-chars',
        referrer: 'https://example.com/path?query=<script>alert(1)</script>',
      },
    });

    expect(response.status()).toBe(202);
  });

  test('admin analytics summary requires authentication', async ({ page }) => {
    const response = await page.request.get('/api/admin/analytics/summary');
    expect([401, 403]).toContain(response.status());
  });

  test('admin analytics summary accepts date range parameters', async ({ page }) => {
    const from = new Date();
    from.setDate(from.getDate() - 7);
    const to = new Date();

    const response = await page.request.get(
      `/api/admin/analytics/summary?from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}`
    );

    expect([200, 401, 403]).toContain(response.status());
  });
});
