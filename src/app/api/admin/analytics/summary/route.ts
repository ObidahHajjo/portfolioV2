import { ok, withAdminAuth } from '@/lib/admin/api-helpers';
import { getAnalyticsSummary } from '@/lib/analytics/queries';
import { NextResponse } from 'next/server';

const DATE_PARAM_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function parseDateParam(value: string): Date | null {
  if (!DATE_PARAM_REGEX.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export const GET = withAdminAuth(async (request: Request) => {
  const url = new URL(request.url);
  const fromParam = url.searchParams.get('from');
  const toParam = url.searchParams.get('to');

  if (!fromParam || !toParam) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
  }

  const from = parseDateParam(fromParam);
  const toBase = parseDateParam(toParam);

  if (!from || !toBase) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
  }

  const to = new Date(toBase);
  to.setUTCHours(23, 59, 59, 999);

  if (from > to) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
  }

  const maxRangeMs = 365 * 24 * 60 * 60 * 1000;
  if (to.getTime() - from.getTime() > maxRangeMs) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
  }

  const summary = await getAnalyticsSummary({ from, to });
  return ok(summary);
});
