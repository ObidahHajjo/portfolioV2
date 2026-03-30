import { expect, test } from '@playwright/test';

test.describe('Mobile Viewport Tests', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('no horizontal overflow at 375px', async ({ page }) => {
    await page.goto('/');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });

  test('all sections visible when seeded', async ({ page }) => {
    await page.goto('/');
    const sectionIds = ['hero', 'about', 'skills', 'experience', 'projects', 'contact'];
    for (const id of sectionIds) {
      const section = page.locator(`#${id}`);
      const count = await section.count();
      if (count > 0) {
        await expect(section).toBeVisible();
      }
    }
  });

  test('header is visible on mobile', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('primary touch targets are at least 44x44', async ({ page }) => {
    await page.goto('/');
    const interactiveElements = page.locator(
      'button, a.min-h-11, .min-h-11, #hero a, #contact a, #projects a'
    );
    const count = await interactiveElements.count();

    for (let i = 0; i < count; i++) {
      const element = interactiveElements.nth(i);
      const box = await element.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
