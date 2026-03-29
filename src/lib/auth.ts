import bcrypt from 'bcryptjs';

import { db } from '@/lib/db';

const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminPasswordHash) {
    return false;
  }

  if (email !== adminEmail) {
    return false;
  }

  return bcrypt.compare(password, adminPasswordHash);
}

export async function checkLockout(
  email: string
): Promise<{ locked: boolean; minutesRemaining?: number }> {
  const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MS);
  const failedCount = await db.loginAttempt.count({
    where: {
      email,
      success: false,
      attemptAt: {
        gte: windowStart,
      },
    },
  });

  if (failedCount < 5) {
    return { locked: false };
  }

  const newestAttempt = await db.loginAttempt.findFirst({
    where: {
      email,
      success: false,
      attemptAt: {
        gte: windowStart,
      },
    },
    orderBy: {
      attemptAt: 'desc',
    },
  });

  if (!newestAttempt) {
    return { locked: false };
  }

  const lockoutEndsAt = newestAttempt.attemptAt.getTime() + LOCKOUT_WINDOW_MS;
  const minutesRemaining = Math.max(1, Math.ceil((lockoutEndsAt - Date.now()) / 60000));

  return { locked: true, minutesRemaining };
}

export async function recordAttempt(email: string, success: boolean): Promise<void> {
  await db.loginAttempt.create({
    data: {
      email,
      success,
    },
  });
}
