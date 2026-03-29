import { AdminEntityEditor } from '@/components/admin/AdminEntityEditor';
import { singletonPageConfigs } from '@/lib/admin/page-config';
import { getSingletonRecord } from '@/lib/admin/server';

export default async function AdminHeroPage() {
  const config = singletonPageConfigs.hero;
  const record = await getSingletonRecord('heroes');

  return (
    <AdminEntityEditor
      title={config.title}
      description={config.description}
      schemaKey={config.schemaKey}
      fields={config.fields}
      defaultValues={record as Record<string, unknown>}
      endpoint="/api/admin/heroes"
      method="PATCH"
      successHref="/admin/hero"
    />
  );
}
