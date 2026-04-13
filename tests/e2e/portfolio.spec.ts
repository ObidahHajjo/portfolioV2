import { expect, test } from '@playwright/test';

const SEEDED_HERO_HEADLINE = 'Building resilient products that teams can trust.';

test.describe('Public Portfolio Theme', () => {
  test('homepage renders terminal-styled hero and primary CTA', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.public-theme')).toBeVisible();
    await expect(page.locator('#hero h1')).toContainText(SEEDED_HERO_HEADLINE);
    await expect(page.locator('#hero a').first()).toBeVisible();
    await expect(page.getByTestId('matrix-backdrop')).toBeVisible();
  });

  test('header stays visible after scroll and no public theme toggle is exposed', async ({
    page,
  }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 600));

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('button[aria-label*="theme" i]')).toHaveCount(0);
  });

  test('project links open in new tab when present', async ({ page }) => {
    await page.goto('/#projects');

    const projectLinks = page.locator('#projects a[target="_blank"]');
    const count = await projectLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('case studies routes render with public theme and graceful fallbacks', async ({ page }) => {
    await page.goto('/case-studies');
    await expect(page.locator('.public-theme')).toBeVisible();

    const caseStudyLinks = page.locator('a[href^="/case-studies/"]');
    if ((await caseStudyLinks.count()) > 0) {
      const href = await caseStudyLinks.first().getAttribute('href');
      if (href) {
        await page.goto(href);
        await expect(page.locator('article h1')).toBeVisible();
        await expect(page.locator('.public-theme')).toBeVisible();
      }
    }

    await page.goto('/case-studies/not-a-real-case-study');
    await expect(page.locator('h1')).toContainText('Case Study Not Found');
  });

  test('content remains visible without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');

    await expect(page.locator('h1')).toContainText(SEEDED_HERO_HEADLINE);

    await context.close();
  });
});
