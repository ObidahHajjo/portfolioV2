import Link from 'next/link';

import { EntityList } from '@/components/admin/EntityList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminTestimonialsPage() {
  const testimonials = await db.testimonial.findMany({
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
  });

  const items = testimonials.map((t) => ({
    id: t.id,
    authorName: t.authorName,
    authorCompany: t.authorCompany ?? '-',
    quotePreview: `${t.quote.slice(0, 80)}...`,
    published: t.published,
    isVisible: t.isVisible,
    displayOrder: t.displayOrder,
  }));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Testimonials</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage testimonial quotes and attribution.
          </p>
        </div>
        <Button render={<Link href="/admin/testimonials/new" />}>New Testimonial</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityList
            items={items}
            columns={[
              { key: 'authorName', label: 'Author' },
              { key: 'authorCompany', label: 'Company' },
              { key: 'quotePreview', label: 'Quote' },
            ]}
            entityPath="/api/admin/testimonials"
            editBasePath="/admin/testimonials"
            lifecycleActions
            orderField
          />
        </CardContent>
      </Card>
    </section>
  );
}
