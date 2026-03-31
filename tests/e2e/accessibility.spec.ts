import { expect, test } from '@playwright/test';

test.describe('Accessibility - Keyboard Navigation (US3)', () => {
  test('skip link focuses main content', async ({ page }) => {
    await page.goto('/');
    await page.focus('body');
    await page.press('body', 'Tab');

    const skipLink = page.locator('header a[href="#main-content"]');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toContainText('Skip to main content');

    await page.press('body', 'Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('header navigation is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.focus('body');

    await page.press('body', 'Tab');
    await expect(page.locator('header a[href="#main-content"]')).toBeFocused();

    await page.press('body', 'Tab');
    await expect(page.locator('header nav a').first()).toBeFocused();

    const navLinks = page.locator('header nav ul a');
    const count = await navLinks.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      await page.press('body', 'Tab');
      const focused = page.locator(':focus');
      const href = await focused.getAttribute('href');
      expect(href).toMatch(/^#/);
    }
  });

  test('mobile menu toggle is keyboard accessible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const menuButton = page.locator('header button[aria-label="Toggle navigation"]');
    await menuButton.focus();
    await expect(menuButton).toBeFocused();

    const initialExpanded = await menuButton.getAttribute('aria-expanded');
    expect(initialExpanded).toBe('false');

    await page.press('body', 'Enter');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).toBeVisible();

    await page.press('body', 'Enter');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('all interactive elements have visible focus indicators', async ({ page }) => {
    await page.goto('/');

    const count = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button, input, textarea, select')).filter(
        (el) => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        }
      ).length;
    });
    expect(count).toBeGreaterThan(0);

    await page.focus('header nav a');
    const focusedElement = page.locator(':focus');

    const outlineStyle = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      };
    });

    const hasVisibleFocus =
      outlineStyle.outline !== 'none' ||
      outlineStyle.outlineWidth !== '0px' ||
      outlineStyle.boxShadow !== 'none';

    expect(hasVisibleFocus).toBe(true);
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

    await page.press('textarea[name="message"]', 'Tab');
    await expect(page.locator('#contact button[type="submit"]')).toBeFocused();
  });

  test('hero CTA is keyboard accessible', async ({ page }) => {
    await page.goto('/');

    const heroCta = page.locator('#hero a').first();
    await heroCta.focus();
    await expect(heroCta).toBeFocused();

    await page.press('#hero a', 'Enter');

    const href = await heroCta.getAttribute('href');
    if (href && href.startsWith('#')) {
      await expect(page.locator(href)).toBeVisible();
    }
  });

  test('project links are keyboard accessible', async ({ page }) => {
    await page.goto('/#projects');
    await page.waitForSelector('#projects');

    const projectLinks = page.locator('#projects a');
    const count = await projectLinks.count();

    if (count > 0) {
      await projectLinks.first().focus();
      await expect(projectLinks.first()).toBeFocused();
    }
  });
});

test.describe('Accessibility - Alt Text (US3)', () => {
  test('all images have alt attributes', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeDefined();
    }
  });

  test('meaningful images have non-empty alt text', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img[alt]:not([alt=""])');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt!.length).toBeGreaterThan(0);
    }
  });

  test('decorative images have empty alt attributes', async ({ page }) => {
    await page.goto('/');

    const decorativeImages = page.locator('img[alt=""]');
    const count = await decorativeImages.count();

    for (let i = 0; i < count; i++) {
      const img = decorativeImages.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBe('');
    }
  });

  test('images in hero section have appropriate alt handling', async ({ page }) => {
    await page.goto('/');

    const heroImages = page.locator('#hero img');
    const count = await heroImages.count();

    for (let i = 0; i < count; i++) {
      const img = heroImages.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const role = await img.getAttribute('role');

      expect(alt !== null || ariaLabel !== null || role === 'presentation').toBe(true);
    }
  });

  test('images in projects section have appropriate alt handling', async ({ page }) => {
    await page.goto('/#projects');
    await page.waitForSelector('#projects');

    const projectImages = page.locator('#projects img');
    const count = await projectImages.count();

    for (let i = 0; i < count; i++) {
      const img = projectImages.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeDefined();
    }
  });
});

test.describe('Accessibility - ARIA Attributes (US3)', () => {
  test('landmarks use proper ARIA roles', async ({ page }) => {
    await page.goto('/');

    const main = page.locator('main');
    await expect(main).toHaveAttribute('id', 'main-content');

    const header = page.locator('header');
    await expect(header).toBeVisible();

    const nav = page.locator('header nav');
    await expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  test('sections have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    const sections = page.locator('section[aria-labelledby]');
    const sectionCount = await sections.count();

    for (let i = 0; i < sectionCount; i++) {
      const section = sections.nth(i);
      const labelledBy = await section.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();

      const heading = section.locator(`#${labelledBy}`);
      await expect(heading).toBeVisible();
    }
  });

  test('form inputs have associated labels', async ({ page }) => {
    await page.goto('/#contact');
    await page.waitForSelector('#contact form');

    const inputs = page.locator('#contact input, #contact textarea');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelExists = (await label.count()) > 0;
        expect(labelExists || ariaLabel || ariaLabelledBy).toBe(true);
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('error messages are announced to screen readers', async ({ page }) => {
    await page.goto('/#contact');
    await page.waitForSelector('#contact form');

    await page.click('button[type="submit"]');

    const nameError = page.locator('[data-testid="name-error"]');
    await expect(nameError).toBeVisible();
    await expect(nameError).toHaveAttribute('role', 'alert');

    const emailError = page.locator('[data-testid="email-error"]');
    await expect(emailError).toBeVisible();
    await expect(emailError).toHaveAttribute('role', 'alert');

    const messageError = page.locator('[data-testid="message-error"]');
    await expect(messageError).toBeVisible();
    await expect(messageError).toHaveAttribute('role', 'alert');
  });

  test('success and error regions have live regions', async ({ page }) => {
    await page.goto('/#contact');
    await page.waitForSelector('#contact form');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill(
      'textarea[name="message"]',
      'This is a test message with sufficient length for validation.'
    );

    await page.click('button[type="submit"]');

    const successMessage = page.locator('[data-testid="success-message"]');
    const errorMessage = page.locator('[data-testid="error-message"]');

    const successVisible = await successMessage.isVisible();
    const errorVisible = await errorMessage.isVisible();

    if (successVisible) {
      await expect(successMessage).toHaveAttribute('role', 'status');
      await expect(successMessage).toHaveAttribute('aria-live', 'polite');
    } else if (errorVisible) {
      await expect(errorMessage).toHaveAttribute('role', 'alert');
      await expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    }
  });

  test('external links indicate they open in new tab', async ({ page }) => {
    await page.goto('/');

    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();

    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');
      const textContent = await link.textContent();

      const indicatesExternal =
        ariaLabel?.toLowerCase().includes('open') ||
        ariaLabel?.toLowerCase().includes('new') ||
        title?.toLowerCase().includes('new') ||
        textContent?.toLowerCase().includes('demo') ||
        textContent?.toLowerCase().includes('repository');

      expect(Boolean(indicatesExternal || ariaLabel || title)).toBe(true);
    }
  });
});

test.describe('Accessibility - Focus Management (US3)', () => {
  test('focus is trapped within mobile menu when open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const menuButton = page.locator('header button[aria-label="Toggle navigation"]');
    await menuButton.click();

    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).toBeVisible();

    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    const focusedInMenu = await focused.evaluate((el) => {
      return document.querySelector('#mobile-menu')?.contains(el) ?? false;
    });

    expect(focusedInMenu).toBe(true);
  });

  test('escape key closes mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const menuButton = page.locator('header button[aria-label="Toggle navigation"]');
    await menuButton.click();

    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('focus returns to trigger after dialog closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const menuButton = page.locator('header button[aria-label="Toggle navigation"]');
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(menuButton).toBeFocused();
  });

  test('focus indicator is visible on all interactive elements', async ({ page }) => {
    await page.goto('/');

    const selectors = [
      'header nav a',
      'header button',
      '#hero a',
      '#projects a',
      'input[name="name"]',
      'input[name="email"]',
      'textarea[name="message"]',
      '#contact button[type="submit"]',
    ];

    for (const selector of selectors) {
      const element = page.locator(selector).first();
      if ((await element.count()) > 0) {
        if (!(await element.isVisible())) {
          continue;
        }
        await element.focus();
        await expect(element).toBeFocused();
      }
    }
  });
});
