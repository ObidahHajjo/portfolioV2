'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface PageViewTrackerProps {
  enabled?: boolean;
}

export default function PageViewTracker({ enabled = true }: PageViewTrackerProps) {
  const pathname = usePathname();
  const trackedRef = useRef<string | null>(null);
  const currentPath = pathname ?? '/';

  useEffect(() => {
    if (!enabled) return;
    if (currentPath.startsWith('/admin')) return;
    if (trackedRef.current === currentPath) return;

    trackedRef.current = currentPath;

    const trackPageView = () => {
      fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          pagePath: currentPath,
          referrer: document.referrer || undefined,
        }),
      }).catch(() => {
        // Silently fail - analytics should never break user experience
      });
    };

    const timeoutId = setTimeout(trackPageView, 100);
    return () => clearTimeout(timeoutId);
  }, [currentPath, enabled]);

  return null;
}
