'use client';

import { useId, useState } from 'react';

import TerminalFrame from '@/components/theme/TerminalFrame';
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

function ContactLinks({ links }: { links: SocialLinkData[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {links.map((link) => {
        const isMailto = link.url.startsWith('mailto:');
        return (
          <a
            aria-label={link.platform}
            className="terminal-button-secondary focus-ring"
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
  );
}

export default function ContactSection({ links, contactSettings }: ContactSectionProps) {
  const formId = useId();
  const nameErrorId = `${formId}-name-error`;
  const emailErrorId = `${formId}-email-error`;
  const messageErrorId = `${formId}-message-error`;

  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [fallbackEmail, setFallbackEmail] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      <section id="contact" aria-labelledby="contact-heading" className="terminal-section">
        <div className="mx-auto max-w-4xl">
          <TerminalFrame title="~/public/contact.links" label="Contact">
            <div className="text-center">
              <p className="terminal-kicker">contact.init()</p>
              <h2 id="contact-heading" className="terminal-heading text-[clamp(1.9rem,3vw,3rem)]">
                Get In Touch
              </h2>
              <p className="mx-auto mt-4 max-w-2xl terminal-copy">
                Reach out through any of the channels below. The contact path stays obvious even
                inside the terminal-style presentation.
              </p>
            </div>
            <div className="mt-8">
              <ContactLinks links={links} />
            </div>
          </TerminalFrame>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" aria-labelledby="contact-heading" className="terminal-section">
      <div className="mx-auto max-w-4xl">
        <TerminalFrame title="~/public/contact.form" label="Contact">
          <div className="text-center">
            <p className="terminal-kicker">contact.init()</p>
            <h2 id="contact-heading" className="terminal-heading text-[clamp(1.9rem,3vw,3rem)]">
              Get In Touch
            </h2>
            <p className="mx-auto mt-4 max-w-2xl terminal-copy">
              {contactSettings.ctaMessage || 'Feel free to reach out.'}
            </p>
          </div>

          {status === 'success' && (
            <div
              data-testid="success-message"
              className="terminal-alert mt-8 border-emerald-400/30 text-center"
              role="status"
              aria-live="polite"
            >
              <p className="font-medium text-emerald-200">
                Thanks - your message was sent successfully.
              </p>
              <button onClick={handleReset} className="terminal-link mt-3 text-sm" type="button">
                Send Another Message
              </button>
            </div>
          )}

          {status === 'rate_limited' && (
            <div
              data-testid="rate-limit-error"
              className="terminal-alert mt-8 border-amber-300/30 text-center"
              role="alert"
              aria-live="assertive"
            >
              <p className="font-medium text-amber-200">
                Too many submissions. Please try again later.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div
              data-testid="error-message"
              className="terminal-alert mt-8 border-red-400/30 text-center"
              role="alert"
              aria-live="assertive"
            >
              <p className="font-medium text-red-200">We could not send your message right now.</p>
              {fallbackEmail && (
                <p className="mt-2 terminal-copy" data-testid="fallback-email">
                  Please email us directly at{' '}
                  <a href={`mailto:${fallbackEmail}`} className="terminal-link">
                    {fallbackEmail}
                  </a>
                </p>
              )}
            </div>
          )}

          {status !== 'success' && status !== 'rate_limited' && (
            <form
              onSubmit={handleSubmit}
              aria-label="Contact form"
              className="mt-8 space-y-6"
              noValidate
            >
              <div>
                <label
                  htmlFor={`${formId}-name`}
                  className="mb-2 block text-sm font-medium text-foreground"
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
                  className="terminal-input focus-ring"
                  placeholder="Your name"
                />
                {errors.name && (
                  <p
                    id={nameErrorId}
                    data-testid="name-error"
                    className="mt-2 text-sm text-red-300"
                    role="alert"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`${formId}-email`}
                  className="mb-2 block text-sm font-medium text-foreground"
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
                  className="terminal-input focus-ring"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p
                    id={emailErrorId}
                    data-testid="email-error"
                    className="mt-2 text-sm text-red-300"
                    role="alert"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`${formId}-message`}
                  className="mb-2 block text-sm font-medium text-foreground"
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
                  className="terminal-input focus-ring resize-y"
                  placeholder="Your message..."
                />
                {errors.message && (
                  <p
                    id={messageErrorId}
                    data-testid="message-error"
                    className="mt-2 text-sm text-red-300"
                    role="alert"
                  >
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="terminal-button-primary focus-ring w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}

          {links.length > 0 && (
            <div className="mt-8 border-t border-border pt-8">
              <p className="mb-4 text-center text-sm uppercase tracking-[0.24em] text-muted-foreground">
                Alternate channels
              </p>
              <ContactLinks links={links} />
            </div>
          )}
        </TerminalFrame>
      </div>
    </section>
  );
}
