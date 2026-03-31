'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface PageViewTrackerProps {
  enabled?: boolean;
}

export default function PageViewTracker({ enabled = true }: PageViewTrackerProps) {
  const pathname = usePathname();
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (pathname.startsWith('/admin')) return;
    if (trackedRef.current === pathname) return;

    trackedRef.current = pathname;

    const trackPageView = () => {
      fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          pagePath: pathname,
          referrer: document.referrer || undefined,
        }),
      }).catch(() => {
        // Silently fail - analytics should never break user experience
      });
    };

    const timeoutId = setTimeout(trackPageView, 100);
    return () => clearTimeout(timeoutId);
  }, [pathname, enabled]);

  return null;
}
