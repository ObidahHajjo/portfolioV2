import { db } from '@/lib/db';
import { getContactRecipientFallback } from '@/lib/config/env';
import { submitContactForm } from '@/lib/contact/service';
import { validateContactPayload } from '@/lib/contact/validation';
import { NextResponse } from 'next/server';

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',');
    const ip = ips[0];
    return ip ? ip.trim() : '127.0.0.1';
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return '127.0.0.1';
}

async function getContactEmail(): Promise<string | null> {
  try {
    const settings = await db.contactSettings.findUnique({
      where: { singletonKey: 'singleton' },
    });
    return settings?.contactEmail ?? getContactRecipientFallback();
  } catch {
    return getContactRecipientFallback();
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validation = validateContactPayload(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Validation failed',
          fields: validation.errors,
        },
        { status: 422 }
      );
    }

    const contactEmail = await getContactEmail();
    if (!contactEmail) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Contact form is not configured.',
        },
        { status: 503 }
      );
    }

    const clientIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent');

    const result = await submitContactForm(validation.data, clientIp, userAgent, contactEmail);

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
