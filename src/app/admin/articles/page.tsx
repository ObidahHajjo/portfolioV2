import Link from 'next/link';

import { EntityList } from '@/components/admin/EntityList';
import { SectionVisibilityToggle } from '@/components/admin/SectionVisibilityToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminArticlesPage() {
  const [articles, visibility] = await Promise.all([
    db.article.findMany({
      orderBy: { displayOrder: 'asc' },
    }),
    db.sectionVisibility.findUnique({ where: { section: 'articles' } }),
  ]);

  const items = articles.map((article) => ({
    id: article.id,
    title: article.title,
    externalUrl: article.externalUrl,
    published: article.published,
    isVisible: article.isVisible,
    displayOrder: article.displayOrder,
  }));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Articles</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage external article links and section visibility.
          </p>
        </div>
        <Button render={<Link href="/admin/articles/new" />}>New Article</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <SectionVisibilityToggle section="articles" enabled={visibility?.enabled ?? true} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityList
            items={items}
            columns={[
              { key: 'title', label: 'Title' },
              { key: 'externalUrl', label: 'URL' },
            ]}
            entityPath="/api/admin/articles"
            editBasePath="/admin/articles"
            lifecycleActions
            orderField
          />
        </CardContent>
      </Card>
    </section>
  );
}
