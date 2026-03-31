'use client';

import { useEffect } from 'react';

function reportError(error: Error, pathname: string) {
  fetch('/api/monitoring/error-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      surface: 'ADMIN',
      pagePath: pathname,
      message: error.message,
      stack: error.stack,
    }),
  }).catch(() => {});
}

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, window.location.pathname);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#f9fafb',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        <div
          style={{
            width: '4rem',
            height: '4rem',
            backgroundColor: '#fef2f2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="#ef4444"
            style={{ width: '2rem', height: '2rem' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '0.75rem',
            color: '#111827',
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          An error occurred while loading the admin panel. This has been logged and will be
          investigated.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = '/admin')}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
