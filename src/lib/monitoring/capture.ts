import { db } from '@/lib/db';
import { truncateStack } from '@/lib/security/hash';
import type { ErrorSurface } from '@prisma/client';

export type CaptureErrorInput = {
  surface: ErrorSurface;
  pagePath?: string;
  message: string;
  stack?: string;
  fingerprint?: string;
};

export async function captureError(input: CaptureErrorInput): Promise<void> {
  try {
    await db.errorEvent.create({
      data: {
        surface: input.surface,
        pagePath: input.pagePath ?? null,
        message: input.message.slice(0, 4000),
        stackPreview: truncateStack(input.stack, 2000),
        fingerprint: input.fingerprint?.slice(0, 100) ?? null,
      },
    });
  } catch {
    // Swallow errors - monitoring must never break the application
    console.error('[monitoring] Failed to capture error:', input.message);
  }
}

export function sanitizeError(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }
  if (typeof error === 'string') {
    return { message: error };
  }
  return { message: 'Unknown error' };
}
