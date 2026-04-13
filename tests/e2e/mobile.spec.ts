import { expect, test } from '@playwright/test';

test.describe('Mobile Viewport Tests', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('no horizontal overflow at 375px on homepage', async ({ page }) => {
    await page.goto('/');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });

  test('no horizontal overflow at 375px on case studies routes', async ({ page }) => {
    await page.goto('/case-studies');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });

  test('header and primary touch targets remain usable on mobile', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('header')).toBeVisible();

    const interactiveElements = page.locator(
      'button, a.min-h-11, .min-h-11, #hero a, #contact a, #projects a'
    );
    const count = await interactiveElements.count();

    for (let index = 0; index < count; index += 1) {
      const element = interactiveElements.nth(index);
      const box = await element.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
