'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

import { EntityForm } from '@/components/admin/EntityForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function LoginForm({ sessionExpired }: { sessionExpired: boolean }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {sessionExpired ? (
        <Alert>
          <AlertTitle>Session expired</AlertTitle>
          <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>Sign in failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <EntityForm
        schema={LoginSchema}
        defaultValues={{ email: '', password: '' }}
        fields={[
          { name: 'email', label: 'Email', type: 'text' },
          { name: 'password', label: 'Password', type: 'text', inputType: 'password' },
        ]}
        submitLabel="Log in"
        onError={setErrorMessage}
        onSubmit={async (data) => {
          setErrorMessage(null);

          const response = await fetch('/api/admin/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            router.push('/admin/dashboard');
            router.refresh();
            return;
          }

          const payload = (await response.json().catch(() => ({ error: 'Unable to log in.' }))) as {
            error?: string;
            fields?: Record<string, string>;
          };

          if (response.status === 422) {
            throw {
              message: payload.error ?? 'Validation failed.',
              fields: payload.fields,
            };
          }

          if (response.status === 401) {
            throw { message: 'Invalid email or password' };
          }

          if (response.status === 429) {
            throw { message: payload.error ?? 'Too many attempts. Please try again later.' };
          }

          throw { message: payload.error ?? 'Unable to log in.' };
        }}
      />
    </div>
  );
}
