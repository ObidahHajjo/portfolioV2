'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const WARNING_WINDOW_MS = 5 * 60 * 1000;

export function SessionWarning() {
  const pathname = usePathname();
  const router = useRouter();
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      return;
    }

    let mounted = true;

    const checkStatus = async () => {
      const response = await fetch('/api/admin/session/status', {
        cache: 'no-store',
      });

      if (response.status === 401) {
        router.push('/admin/login?reason=session_expired');
        router.refresh();
        return;
      }

      if (!response.ok || !mounted) {
        return;
      }

      const data = (await response.json()) as { expiresAt: string };
      setExpiresAt(new Date(data.expiresAt).getTime());
    };

    void checkStatus();
    const intervalId = window.setInterval(() => {
      void checkStatus();
    }, 60_000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [pathname, router]);

  const minutesRemaining = useMemo(() => {
    if (!expiresAt) {
      return null;
    }

    const diff = expiresAt - Date.now();

    if (diff > WARNING_WINDOW_MS || diff <= 0) {
      return null;
    }

    return Math.max(1, Math.ceil(diff / 60000));
  }, [expiresAt]);

  if (pathname === '/admin/login') {
    return null;
  }

  if (!minutesRemaining) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 max-w-md">
      <Alert>
        <AlertTitle>Your session expires soon.</AlertTitle>
        <AlertDescription>
          Your session expires in {minutesRemaining} minute{minutesRemaining === 1 ? '' : 's'}. Stay
          logged in?
        </AlertDescription>
        <AlertAction className="flex gap-2">
          <Button
            size="sm"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const response = await fetch('/api/admin/session/extend', { method: 'POST' });
              setLoading(false);

              if (response.ok) {
                const data = (await response.json()) as { expiresAt: string };
                setExpiresAt(new Date(data.expiresAt).getTime());
                return;
              }

              router.push('/admin/login?reason=session_expired');
              router.refresh();
            }}
          >
            Stay logged in
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={async () => {
              await fetch('/api/admin/auth/logout', { method: 'POST' });
              router.push('/admin/login');
              router.refresh();
            }}
          >
            Log out now
          </Button>
        </AlertAction>
      </Alert>
    </div>
  );
}
