import { expect, test } from '@playwright/test';

test.describe('Accessibility - Public Theme', () => {
  test('skip link focuses main content', async ({ page }) => {
    await page.goto('/');
    await page.focus('body');
    await page.press('body', 'Tab');

    const skipLink = page.locator('header a[href="#main-content"]');
    await expect(skipLink).toBeFocused();

    await page.press('body', 'Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('header navigation is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.focus('body');

    await page.press('body', 'Tab');
    await page.press('body', 'Tab');
    await expect(page.locator('header nav a').first()).toBeFocused();
  });

  test('mobile menu toggle is keyboard accessible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const menuButton = page.locator('header button[aria-label="Toggle navigation"]');
    await menuButton.focus();
    await expect(menuButton).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('interactive elements have visible focus indicators', async ({ page }) => {
    await page.goto('/');
    await page.locator('#hero a').first().focus();

    const focusStyles = await page.locator(':focus').evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return {
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      };
    });

    expect(focusStyles.outlineWidth !== '0px' || focusStyles.boxShadow !== 'none').toBeTruthy();
  });

  test('matrix backdrop remains decorative and reduced motion hides it', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('matrix-backdrop')).toHaveAttribute('aria-hidden', 'true');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByTestId('matrix-backdrop')).toBeHidden();
  });

  test('contact form tab order is logical', async ({ page }) => {
    await page.goto('/#contact');
    await page.waitForSelector('#contact form');

    await page.focus('input[name="name"]');
    await expect(page.locator('input[name="name"]')).toBeFocused();

    await page.press('input[name="name"]', 'Tab');
    await expect(page.locator('input[name="email"]')).toBeFocused();

    await page.press('input[name="email"]', 'Tab');
    await expect(page.locator('textarea[name="message"]')).toBeFocused();
  });
});
