import { expect, test } from '@playwright/test';

async function captureMetrics(page: Parameters<typeof test>[0]['page'], url: string) {
  await page.goto(url, { waitUntil: 'load' });

  await page.addInitScript(() => {
    (window as typeof window & { __perfMetrics?: { cls: number; lcp: number } }).__perfMetrics = {
      cls: 0,
      lcp: 0,
    };

    new PerformanceObserver((list) => {
      const metrics = (window as typeof window & { __perfMetrics: { cls: number; lcp: number } })
        .__perfMetrics;
      for (const entry of list.getEntries() as PerformanceEntry[]) {
        metrics.lcp = entry.startTime;
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    new PerformanceObserver((list) => {
      const metrics = (window as typeof window & { __perfMetrics: { cls: number; lcp: number } })
        .__perfMetrics;
      for (const entry of list.getEntries() as Array<
        PerformanceEntry & { value?: number; hadRecentInput?: boolean }
      >) {
        if (!entry.hadRecentInput) {
          metrics.cls += entry.value ?? 0;
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });

  await page.goto(url, { waitUntil: 'load' });

  return page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const metrics = (window as typeof window & { __perfMetrics: { cls: number; lcp: number } })
      .__perfMetrics;

    return {
      cls: metrics.cls,
      lcp: metrics.lcp,
      responseEnd: navigation.responseEnd,
      domContentLoaded: navigation.domContentLoadedEventEnd,
    };
  });
}

test.describe('Public Theme Performance', () => {
  test('homepage stays within user-visible performance guardrails', async ({ page }) => {
    const metrics = await captureMetrics(page, '/');

    expect(metrics.responseEnd).toBeLessThan(3000);
    expect(metrics.cls).toBeLessThan(0.1);
    if (metrics.lcp > 0) {
      expect(metrics.lcp).toBeLessThan(3000);
    }
  });

  test('case-study listing stays within user-visible performance guardrails', async ({ page }) => {
    const metrics = await captureMetrics(page, '/case-studies');

    expect(metrics.responseEnd).toBeLessThan(3000);
    expect(metrics.cls).toBeLessThan(0.1);
    expect(metrics.domContentLoaded).toBeLessThan(3000);
  });
});
