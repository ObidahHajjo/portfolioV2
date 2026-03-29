import { z } from 'zod';
import { NextResponse } from 'next/server';

import { checkLockout, recordAttempt, verifyCredentials } from '@/lib/auth';
import { getSession } from '@/lib/session';

const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = LoginRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          fields: Object.fromEntries(
            Object.entries(result.error.flatten().fieldErrors).map(([key, value]) => [
              key,
              value?.[0],
            ])
          ),
        },
        { status: 422 }
      );
    }

    const { email, password } = result.data;
    const lockout = await checkLockout(email);

    if (lockout.locked) {
      return NextResponse.json(
        {
          error: `Too many attempts. Try again in ${lockout.minutesRemaining} minutes.`,
        },
        { status: 429 }
      );
    }

    const isValid = await verifyCredentials(email, password);

    if (!isValid) {
      await recordAttempt(email, false);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    await recordAttempt(email, true);

    const session = await getSession(req);
    session.adminId = 'admin';
    session.loginTime = Date.now();
    session.expiresAt = Date.now() + 28800000;
    await session.save();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
