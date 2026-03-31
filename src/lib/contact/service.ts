import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email/transporter';
import { hashIp } from '@/lib/security/hash';
import { ContactSubmissionStatus } from '@prisma/client';
import { formatEmailBody, type ContactPayload } from './validation';

export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export interface ContactServiceResult {
  success: boolean;
  status: number;
  body: {
    ok: boolean;
    message?: string;
    error?: string;
    fallbackEmail?: string;
    fields?: Record<string, string>;
  };
}

export interface RateLimitCheck {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(ipHash: string): Promise<RateLimitCheck> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

  const recentSubmissions = await db.contactSubmission.count({
    where: {
      sourceIpHash: ipHash,
      createdAt: { gte: windowStart },
    },
  });

  const allowed = recentSubmissions < RATE_LIMIT_MAX;
  const remaining = Math.max(0, RATE_LIMIT_MAX - recentSubmissions);
  const resetAt = new Date(Date.now() + RATE_LIMIT_WINDOW_MS);

  return { allowed, remaining, resetAt };
}

export async function submitContactForm(
  payload: ContactPayload,
  clientIp: string,
  userAgent: string | null,
  toEmail: string
): Promise<ContactServiceResult> {
  const ipHash = hashIp(clientIp);
  const userAgentHash = userAgent ? hashIp(userAgent) : null;

  const rateLimit = await checkRateLimit(ipHash);
  if (!rateLimit.allowed) {
    await db.contactSubmission.create({
      data: {
        senderName: payload.name.slice(0, 120),
        senderEmail: payload.email.slice(0, 254),
        message: payload.message,
        sourceIpHash: ipHash,
        userAgentHash,
        status: ContactSubmissionStatus.RATE_LIMITED,
      },
    });

    return {
      success: false,
      status: 429,
      body: {
        ok: false,
        error: 'Too many submissions. Please try again later.',
      },
    };
  }

  const timestamp = new Date().toISOString();
  const emailBody = formatEmailBody(payload, timestamp);

  const emailResult = await sendEmail({
    to: toEmail,
    subject: `Contact Form: ${payload.name}`,
    text: emailBody,
    html: `<pre style="font-family: sans-serif; white-space: pre-wrap;">${escapeHtml(emailBody)}</pre>`,
  });

  if (!emailResult.success) {
    await db.contactSubmission.create({
      data: {
        senderName: payload.name.slice(0, 120),
        senderEmail: payload.email.slice(0, 254),
        message: payload.message,
        sourceIpHash: ipHash,
        userAgentHash,
        status: ContactSubmissionStatus.FAILED,
        failureReason: emailResult.error?.slice(0, 500),
      },
    });

    return {
      success: false,
      status: 503,
      body: {
        ok: false,
        error: 'We could not send your message right now.',
        fallbackEmail: toEmail,
        message: 'Please email us directly using the address above.',
      },
    };
  }

  await db.contactSubmission.create({
    data: {
      senderName: payload.name.slice(0, 120),
      senderEmail: payload.email.slice(0, 254),
      message: payload.message,
      sourceIpHash: ipHash,
      userAgentHash,
      status: ContactSubmissionStatus.DELIVERED,
    },
  });

  return {
    success: true,
    status: 200,
    body: {
      ok: true,
      message: 'Thanks - your message was sent successfully.',
    },
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
