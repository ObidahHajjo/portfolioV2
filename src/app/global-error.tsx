'use client';

import { useEffect } from 'react';

function reportError(error: Error, pathname: string) {
  fetch('/api/monitoring/error-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      surface: 'PUBLIC',
      pagePath: pathname,
      message: error.message,
      stack: error.stack,
    }),
  }).catch(() => {});
}

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  useEffect(() => {
    reportError(error, window.location.pathname);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: '#666',
              marginBottom: '1.5rem',
              textAlign: 'center',
              maxWidth: '400px',
            }}
          >
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  );
}
