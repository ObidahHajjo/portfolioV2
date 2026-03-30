import Link from 'next/link';
import { toast } from 'sonner';

import { EntityList } from '@/components/admin/EntityList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminTalksPage() {
  const [talks, visibility] = await Promise.all([
    db.talk.findMany({
      orderBy: { displayOrder: 'asc' },
    }),
    db.sectionVisibility.findUnique({ where: { section: 'talks' } }),
  ]);

  const items = talks.map((t) => ({
    id: t.id,
    title: t.title,
    eventName: t.eventName,
    published: t.published,
    isVisible: t.isVisible,
    displayOrder: t.displayOrder,
  }));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Talks</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage talks and presentations.</p>
        </div>
        <Button render={<Link href="/admin/talks/new" />}>New Talk</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <VisibilityToggle section="talks" enabled={visibility?.enabled ?? true} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Talks</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityList
            items={items}
            columns={[
              { key: 'title', label: 'Title' },
              { key: 'eventName', label: 'Event' },
            ]}
            entityPath="/api/admin/talks"
            editBasePath="/admin/talks"
            lifecycleActions
            orderField
          />
        </CardContent>
      </Card>
    </section>
  );
}

function VisibilityToggle({ section, enabled }: { section: string; enabled: boolean }) {
  return (
    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        defaultChecked={enabled}
        onChange={async (e) => {
          try {
            const response = await fetch(`/api/admin/section-visibility/${section}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ enabled: e.target.checked }),
            });
            if (!response.ok) {
              toast.error('Failed to update visibility');
            }
          } catch {
            toast.error('Failed to update visibility');
          }
        }}
        className="size-4 rounded border-gray-300"
      />
      <span className="text-sm">Show section on public portfolio</span>
    </label>
  );
}
