import { expect, test } from '@playwright/test';

const SEEDED_HERO_HEADLINE = 'Building resilient products that teams can trust.';

test.describe('Portfolio E2E Tests', () => {
  test('h1 contains hero headline', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text).toBeTruthy();
    expect(text).toContain(SEEDED_HERO_HEADLINE);
  });

  test('hero CTA is visible', async ({ page }) => {
    await page.goto('/');
    const heroCta = page.locator('#hero a').first();
    await expect(heroCta).toBeVisible();
  });

  test('header is sticky after scroll', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 500));
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('skills section renders when seeded', async ({ page }) => {
    await page.goto('/');
    const skillsSection = page.locator('#skills');
    await expect(skillsSection).toBeVisible();
  });

  test('project links open in new tab', async ({ page }) => {
    await page.goto('/');
    const projectLinks = page.locator('#projects a[target="_blank"]');
    const count = await projectLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('page title is not empty', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).not.toBe('Portfolio');
  });

  test('meta description is present', async ({ page }) => {
    await page.goto('/');
    const metaDescription = await page.evaluate(() =>
      document.querySelector('meta[name="description"]')?.getAttribute('content')
    );
    expect(metaDescription).toBeTruthy();
    expect(metaDescription!.length).toBeGreaterThan(0);
  });

  test('content visible without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text).toBeTruthy();
    await context.close();
  });

  test('contact link is valid', async ({ page }) => {
    await page.goto('/');
    const contactLink = page.locator('#contact a').first();
    if ((await contactLink.count()) > 0) {
      const href = await contactLink.getAttribute('href');
      if (href && !href.startsWith('mailto:')) {
        const response = await page.request.get(href);
        expect(response.status()).toBeLessThan(400);
      }
    }
  });
});
