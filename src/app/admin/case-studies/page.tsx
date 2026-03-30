import Link from 'next/link';

import { EntityList } from '@/components/admin/EntityList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminCaseStudiesPage() {
  const caseStudies = await db.caseStudy.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      project: { select: { id: true, title: true } },
      _count: { select: { metrics: true } },
    },
  });

  const items = caseStudies.map((cs) => ({
    id: cs.id,
    title: cs.title,
    slug: cs.slug,
    projectTitle: cs.project?.title ?? '-',
    published: cs.published,
    isVisible: cs.isVisible,
    displayOrder: cs.displayOrder,
    metricsCount: cs._count.metrics,
  }));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Case Studies</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage case studies with rich narratives and metrics.
          </p>
        </div>
        <Button render={<Link href="/admin/case-studies/new" />}>New Case Study</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Studies</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityList
            items={items}
            columns={[
              { key: 'title', label: 'Title' },
              { key: 'slug', label: 'Slug' },
              { key: 'projectTitle', label: 'Project' },
            ]}
            entityPath="/api/admin/case-studies"
            editBasePath="/admin/case-studies"
            lifecycleActions
            orderField
          />
        </CardContent>
      </Card>
    </section>
  );
}
