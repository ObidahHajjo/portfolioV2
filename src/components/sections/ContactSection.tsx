'use client';

import { useState, useId } from 'react';
import type { ContactSettingsData, SocialLinkData } from '@/types/portfolio';

interface ContactSectionProps {
  links: SocialLinkData[];
  contactSettings: ContactSettingsData | null;
}

interface FormState {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error' | 'rate_limited';

export default function ContactSection({ links, contactSettings }: ContactSectionProps) {
  const formId = useId();
  const nameErrorId = `${formId}-name-error`;
  const emailErrorId = `${formId}-email-error`;
  const messageErrorId = `${formId}-message-error`;
  const statusMessageId = `${formId}-status`;

  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [fallbackEmail, setFallbackEmail] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrors({});
    setFallbackEmail(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.status === 422 && data.fields) {
        setErrors(data.fields);
        setStatus('idle');
        return;
      }

      if (response.status === 429) {
        setStatus('rate_limited');
        return;
      }

      if (response.status === 503) {
        setStatus('error');
        setFallbackEmail(data.fallbackEmail || contactSettings?.contactEmail || null);
        return;
      }

      if (response.ok && data.ok) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
        return;
      }

      setStatus('error');
    } catch {
      setStatus('error');
      setFallbackEmail(contactSettings?.contactEmail || null);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setErrors({});
    setFallbackEmail(null);
  };

  if (!contactSettings?.formEnabled) {
    if (links.length === 0) {
      return null;
    }

    return (
      <section id="contact" aria-labelledby="contact-heading" className="px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 id="contact-heading" className="mb-4 text-3xl font-bold text-gray-900">
            Get In Touch
          </h2>
          <p className="mb-8 text-gray-600">
            Feel free to reach out through any of the following channels.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {links.map((link) => {
              const isMailto = link.url.startsWith('mailto:');
              return (
                <a
                  aria-label={link.platform}
                  className="inline-flex min-h-11 items-center rounded-full bg-slate-950 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  href={link.url}
                  key={`${link.platform}-${link.displayOrder}`}
                  rel={isMailto ? undefined : 'noopener noreferrer'}
                  target={isMailto ? undefined : '_blank'}
                >
                  {link.platform}
                </a>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" aria-labelledby="contact-heading" className="px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h2 id="contact-heading" className="mb-4 text-3xl font-bold text-gray-900">
            Get In Touch
          </h2>
          <p className="text-gray-600">{contactSettings.ctaMessage || 'Feel free to reach out.'}</p>
        </div>

        {status === 'success' && (
          <div
            data-testid="success-message"
            className="mb-6 rounded-lg bg-green-50 p-4 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-green-800 font-medium">
              Thanks - your message was sent successfully.
            </p>
            <button
              onClick={handleReset}
              className="mt-3 text-sm text-green-700 underline hover:no-underline"
            >
              Send Another Message
            </button>
          </div>
        )}

        {status === 'rate_limited' && (
          <div
            data-testid="rate-limit-error"
            className="mb-6 rounded-lg bg-yellow-50 p-4 text-center"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-yellow-800 font-medium">
              Too many submissions. Please try again later.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div
            data-testid="error-message"
            className="mb-6 rounded-lg bg-red-50 p-4 text-center"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-red-800 font-medium">We could not send your message right now.</p>
            {fallbackEmail && (
              <p className="mt-2 text-red-700" data-testid="fallback-email">
                Please email us directly at{' '}
                <a href={`mailto:${fallbackEmail}`} className="underline hover:no-underline">
                  {fallbackEmail}
                </a>
              </p>
            )}
          </div>
        )}

        {status !== 'success' && status !== 'rate_limited' && (
          <form onSubmit={handleSubmit} aria-label="Contact form" className="space-y-6" noValidate>
            <div>
              <label
                htmlFor={`${formId}-name`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                id={`${formId}-name`}
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                disabled={status === 'submitting'}
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? nameErrorId : undefined}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Your name"
              />
              {errors.name && (
                <p
                  id={nameErrorId}
                  data-testid="name-error"
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor={`${formId}-email`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id={`${formId}-email`}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={status === 'submitting'}
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? emailErrorId : undefined}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p
                  id={emailErrorId}
                  data-testid="email-error"
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor={`${formId}-message`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Message
              </label>
              <textarea
                id={`${formId}-message`}
                name="message"
                value={form.message}
                onChange={handleChange}
                disabled={status === 'submitting'}
                rows={5}
                aria-required="true"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? messageErrorId : undefined}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-y"
                placeholder="Your message..."
              />
              {errors.message && (
                <p
                  id={messageErrorId}
                  data-testid="message-error"
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {errors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full rounded-lg bg-slate-950 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'submitting' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}

        {links.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500 mb-4">Or connect with me on:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {links.map((link) => {
                const isMailto = link.url.startsWith('mailto:');
                return (
                  <a
                    aria-label={link.platform}
                    className="inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    href={link.url}
                    key={`${link.platform}-${link.displayOrder}`}
                    rel={isMailto ? undefined : 'noopener noreferrer'}
                    target={isMailto ? undefined : '_blank'}
                  >
                    {link.platform}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
