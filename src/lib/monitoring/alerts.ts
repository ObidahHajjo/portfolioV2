import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email/transporter';
import type { ErrorSurface } from '@prisma/client';

const ALERT_THRESHOLD = 3;
const WINDOW_MINUTES = 10;
const ALERT_COOLDOWN_MINUTES = 30;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function checkAndSendAlert(surface: ErrorSurface): Promise<void> {
  try {
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
    const windowEnd = new Date();

    const recentCount = await db.errorEvent.count({
      where: {
        surface,
        createdAt: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
    });

    if (recentCount < ALERT_THRESHOLD) {
      return;
    }

    const cooldownStart = new Date(Date.now() - ALERT_COOLDOWN_MINUTES * 60 * 1000);
    const existingAlertInCooldown = await db.errorAlert.findFirst({
      where: {
        surface,
        createdAt: {
          gte: cooldownStart,
        },
        deliveryStatus: 'SENT',
      },
    });

    if (existingAlertInCooldown) {
      return;
    }

    const topPages = await db.errorEvent.groupBy({
      by: ['pagePath'],
      where: {
        surface,
        createdAt: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const sampleErrors = await db.errorEvent.findMany({
      where: {
        surface,
        createdAt: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      select: { message: true },
      take: 3,
    });

    const contactSettings = await db.contactSettings.findUnique({
      where: { singletonKey: 'singleton' },
    });
    const alertEmail = contactSettings?.contactEmail;

    if (!alertEmail) {
      console.error('[alerts] No contact email configured for alerts');
      return;
    }

    const pageList = topPages
      .map((p) => `- ${p.pagePath || '/'} (${p._count.id} errors)`)
      .join('\n');

    const errorSamples = sampleErrors
      .map((e, i) => `${i + 1}. ${e.message.slice(0, 200)}`)
      .join('\n');

    const subject = `[Portfolio Alert] ${recentCount} errors detected on ${surface} surface`;
    const text = `Error Threshold Alert

${recentCount} errors have been recorded on the ${surface} surface in the last ${WINDOW_MINUTES} minutes.

Top affected pages:
${pageList}

Sample error messages:
${errorSamples}

Please investigate immediately.`;

    const html = `
<h2>Error Threshold Alert</h2>
<p><strong>${recentCount}</strong> errors have been recorded on the <strong>${escapeHtml(surface)}</strong> surface in the last ${WINDOW_MINUTES} minutes.</p>

<h3>Top affected pages:</h3>
<ul>
${topPages.map((p) => `<li>${escapeHtml(p.pagePath || '/')} (${p._count.id} errors)</li>`).join('')}
</ul>

<h3>Sample error messages:</h3>
<ol>
${sampleErrors.map((e) => `<li><code>${escapeHtml(e.message.slice(0, 200))}</code></li>`).join('')}
</ol>

<p>Please investigate immediately.</p>
`;

    const result = await sendEmail({
      to: alertEmail,
      subject,
      text,
      html,
    });

    await db.errorAlert.create({
      data: {
        surface,
        windowStart,
        windowEnd,
        eventCount: recentCount,
        deliveryStatus: result.success ? 'SENT' : 'FAILED',
        failureReason: result.success ? null : (result.error ?? null),
      },
    });
  } catch (error) {
    console.error('[alerts] Failed to check/send alert:', error);
  }
}
