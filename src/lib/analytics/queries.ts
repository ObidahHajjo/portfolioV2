import { db } from '@/lib/db';

export async function getAnalyticsSummary(params: { from: Date; to: Date }) {
  const events = await db.analyticsEvent.findMany({
    where: {
      createdAt: {
        gte: params.from,
        lte: params.to,
      },
    },
    select: {
      pagePath: true,
      referrerHost: true,
      sessionHash: true,
      createdAt: true,
    },
  });

  const uniqueSessions = new Set(events.map((e) => e.sessionHash)).size;

  const pageCounts = new Map<string, number>();
  for (const event of events) {
    pageCounts.set(event.pagePath, (pageCounts.get(event.pagePath) ?? 0) + 1);
  }
  const topPages = Array.from(pageCounts.entries())
    .map(([pagePath, visits]) => ({ pagePath, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10);

  const referrerCounts = new Map<string, number>();
  for (const event of events) {
    const source = event.referrerHost ?? 'direct';
    referrerCounts.set(source, (referrerCounts.get(source) ?? 0) + 1);
  }
  const referralSources = Array.from(referrerCounts.entries())
    .map(([source, visits]) => ({ source, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10);

  const dailyMap = new Map<string, number>();
  for (const event of events) {
    const date = event.createdAt.toISOString().split('T')[0];
    if (date) {
      dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
    }
  }
  const dailyVisits = Array.from(dailyMap.entries())
    .map(([date, visits]) => ({ date, visits }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    range: {
      from: params.from.toISOString().split('T')[0] ?? '',
      to: params.to.toISOString().split('T')[0] ?? '',
    },
    totals: {
      visits: events.length,
      uniqueSessions,
    },
    topPages,
    referralSources,
    dailyVisits,
  };
}
