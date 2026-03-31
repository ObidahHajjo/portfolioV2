import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAnalyticsSummary } from '@/lib/analytics/queries';

type DateFilterPreset = '7d' | '30d' | '90d' | 'custom';

type AnalyticsSummary = {
  range: { from: string; to: string };
  totals: { visits: number; uniqueSessions: number };
  topPages: Array<{ pagePath: string; visits: number }>;
  referralSources: Array<{ source: string; visits: number }>;
  dailyVisits: Array<{ date: string; visits: number }>;
};

type AnalyticsPageProps = {
  searchParams?: {
    preset?: string;
    from?: string;
    to?: string;
  };
};

function toDateInput(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

function parseDateInput(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getEmptySummary(from: Date, to: Date): AnalyticsSummary {
  return {
    range: {
      from: toDateInput(from),
      to: toDateInput(to),
    },
    totals: { visits: 0, uniqueSessions: 0 },
    topPages: [],
    referralSources: [],
    dailyVisits: [],
  };
}

function resolveRange(searchParams?: AnalyticsPageProps['searchParams']) {
  const now = new Date();
  const presetRaw = searchParams?.preset;
  const preset: DateFilterPreset =
    presetRaw === '7d' || presetRaw === '30d' || presetRaw === '90d' || presetRaw === 'custom'
      ? presetRaw
      : '30d';

  const customFrom = parseDateInput(searchParams?.from);
  const customTo = parseDateInput(searchParams?.to);
  if (preset === 'custom' && customFrom && customTo && customFrom <= customTo) {
    return { preset, from: customFrom, to: customTo };
  }

  const from = new Date(now);
  if (preset === '7d') {
    from.setDate(from.getDate() - 7);
  } else if (preset === '90d') {
    from.setDate(from.getDate() - 90);
  } else {
    from.setDate(from.getDate() - 30);
  }

  return { preset, from, to: now };
}

async function loadSummary(from: Date, to: Date): Promise<AnalyticsSummary> {
  try {
    return await getAnalyticsSummary({ from, to });
  } catch {
    return getEmptySummary(from, to);
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const range = resolveRange(searchParams);
  const summary = await loadSummary(range.from, range.to);

  return (
    <section className="space-y-6">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
      <h1 className="text-3xl font-semibold text-foreground">Analytics</h1>
      <p className="max-w-2xl text-sm text-muted-foreground">
        Privacy-safe page view analytics with selectable date ranges.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[220px_1fr_1fr_auto]" method="get">
            <label className="flex flex-col gap-1 text-sm text-muted-foreground" htmlFor="preset">
              Preset
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                defaultValue={range.preset}
                id="preset"
                name="preset"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="custom">Custom range</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-muted-foreground" htmlFor="from">
              From
              <input
                className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                defaultValue={summary.range.from}
                id="from"
                name="from"
                type="date"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-muted-foreground" htmlFor="to">
              To
              <input
                className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
                defaultValue={summary.range.to}
                id="to"
                name="to"
                type="date"
              />
            </label>

            <div className="flex items-end">
              <button
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                type="submit"
              >
                Apply
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totals.visits}</div>
            <p className="text-xs text-muted-foreground">
              {formatDate(summary.range.from)} - {formatDate(summary.range.to)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Unique Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totals.uniqueSessions}</div>
            <p className="text-xs text-muted-foreground">Anonymized visitors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.topPages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No page views recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {summary.topPages.map((page) => (
                  <li key={page.pagePath} className="flex items-center justify-between">
                    <span className="max-w-[200px] truncate text-sm font-medium">
                      {page.pagePath}
                    </span>
                    <span className="text-sm text-muted-foreground">{page.visits} views</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.referralSources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No referrers recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {summary.referralSources.map((ref) => (
                  <li key={ref.source} className="flex items-center justify-between">
                    <span className="max-w-[200px] truncate text-sm font-medium">{ref.source}</span>
                    <span className="text-sm text-muted-foreground">{ref.visits} visits</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Visits</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.dailyVisits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No daily data available.</p>
          ) : (
            <div className="space-y-2">
              {summary.dailyVisits.slice(-14).map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <span className="w-20 text-sm text-muted-foreground">{formatDate(day.date)}</span>
                  <div className="h-4 flex-1 overflow-hidden rounded bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${
                          summary.totals.visits > 0 ? (day.visits / summary.totals.visits) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-medium">{day.visits}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Notice</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This analytics system captures page views without storing raw IP addresses, using
            cookies, or loading third-party scripts. Session identifiers are anonymized using a
            salted hash.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
