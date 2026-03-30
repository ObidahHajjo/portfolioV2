import Link from 'next/link';
import { toast } from 'sonner';

import { EntityList } from '@/components/admin/EntityList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminOpenSourcePage() {
  const [contributions, visibility] = await Promise.all([
    db.openSourceContribution.findMany({
      orderBy: { displayOrder: 'asc' },
    }),
    db.sectionVisibility.findUnique({ where: { section: 'open_source' } }),
  ]);

  const items = contributions.map((c) => ({
    id: c.id,
    projectName: c.projectName,
    contributionType: c.contributionType,
    published: c.published,
    isVisible: c.isVisible,
    displayOrder: c.displayOrder,
  }));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Open Source</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage open source contributions and section visibility.
          </p>
        </div>
        <Button render={<Link href="/admin/open-source/new" />}>New Contribution</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <VisibilityToggle section="open_source" enabled={visibility?.enabled ?? true} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contributions</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityList
            items={items}
            columns={[
              { key: 'projectName', label: 'Project' },
              { key: 'contributionType', label: 'Type' },
            ]}
            entityPath="/api/admin/open-source"
            editBasePath="/admin/open-source"
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
