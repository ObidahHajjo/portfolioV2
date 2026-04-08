import Link from 'next/link';

import { EntityList } from '@/components/admin/EntityList';
import { SectionVisibilityToggle } from '@/components/admin/SectionVisibilityToggle';
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
          <SectionVisibilityToggle section="talks" enabled={visibility?.enabled ?? true} />
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
