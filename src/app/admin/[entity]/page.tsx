import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EntityList } from '@/components/admin/EntityList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collectionPageConfigs } from '@/lib/admin/page-config';
import { isListSegment, listEntityRecords } from '@/lib/admin/server';

function formatCollectionItems(entity: keyof typeof collectionPageConfigs, items: any[]) {
  switch (entity) {
    case 'social-links':
      return {
        columns: [
          { key: 'platform', label: 'Platform' },
          { key: 'url', label: 'URL' },
        ],
        items,
        lifecycleActions: true,
        orderField: true,
      };
    case 'experiences':
      return {
        columns: [
          { key: 'company', label: 'Company' },
          { key: 'role', label: 'Role' },
          { key: 'period', label: 'Period' },
        ],
        items: items.map((item) => ({
          ...item,
          period: `${new Date(item.startDate).toLocaleDateString()} - ${item.endDate ? new Date(item.endDate).toLocaleDateString() : 'Present'}`,
        })),
        lifecycleActions: true,
        orderField: true,
      };
    case 'skills':
      return {
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'category', label: 'Category' },
          { key: 'proficiency', label: 'Proficiency' },
        ],
        items,
        lifecycleActions: true,
        orderField: true,
      };
    case 'testimonials':
      return {
        columns: [
          { key: 'authorName', label: 'Author' },
          { key: 'authorCompany', label: 'Company' },
          { key: 'quotePreview', label: 'Quote' },
        ],
        items: items.map((item) => ({
          ...item,
          quotePreview: `${String(item.quote).slice(0, 80)}...`,
        })),
        lifecycleActions: true,
        orderField: true,
      };
    case 'projects':
      return {
        columns: [
          { key: 'title', label: 'Title' },
          { key: 'skillSummary', label: 'Skills' },
          { key: 'caseStudySummary', label: 'Case Study' },
        ],
        items: items.map((item) => ({
          ...item,
          skillSummary: item.skills.map((entry: any) => entry.skill.name).join(', ') || '-',
          caseStudySummary: item.caseStudy ? 'Linked' : 'None',
        })),
        lifecycleActions: true,
        orderField: true,
        previewBasePath: '/admin/preview/projects',
      };
    case 'case-studies':
      return {
        columns: [
          { key: 'projectTitle', label: 'Project' },
          { key: 'challengePreview', label: 'Challenge' },
        ],
        items: items.map((item) => ({
          ...item,
          projectTitle: item.project?.title ?? '-',
          challengePreview: `${String(item.challenge).slice(0, 80)}...`,
        })),
      };
    case 'seo-metadata':
      return {
        columns: [
          { key: 'pageSlug', label: 'Page Slug' },
          { key: 'pageTitle', label: 'Page Title' },
        ],
        items,
      };
  }
}

export default async function AdminEntityPage({ params }: { params: { entity: string } }) {
  if (!isListSegment(params.entity)) {
    notFound();
  }

  if (params.entity === 'media-assets') {
    const assets = await listEntityRecords('media-assets');

    return (
      <section className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Media Assets</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Uploaded media assets and current ownership links.
          </p>
        </div>
        <EntityList
          items={assets.map((asset: any) => ({
            ...asset,
            fileSizeLabel: `${Math.round(asset.fileSize / 1024)} KB`,
          }))}
          columns={[
            { key: 'fileName', label: 'File Name' },
            { key: 'fileType', label: 'Type' },
            { key: 'fileSizeLabel', label: 'Size' },
            { key: 'storageUrl', label: 'Storage URL' },
          ]}
          entityPath="/api/admin/media-assets"
          editBasePath="/admin/media-assets"
          showEdit={false}
        />
      </section>
    );
  }

  const config = collectionPageConfigs[params.entity];
  const records = await listEntityRecords(params.entity);
  const listConfig = formatCollectionItems(params.entity, records as any[]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">{config.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{config.description}</p>
        </div>
        <Button render={<Link href={`/admin/${params.entity}/new`}>New</Link>}>New</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityList
            items={listConfig.items}
            columns={listConfig.columns}
            entityPath={`/api/admin/${params.entity}`}
            editBasePath={`/admin/${params.entity}`}
            lifecycleActions={listConfig.lifecycleActions}
            orderField={listConfig.orderField}
            previewBasePath={listConfig.previewBasePath}
          />
        </CardContent>
      </Card>
    </section>
  );
}
