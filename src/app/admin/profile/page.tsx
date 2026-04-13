import { AdminEntityEditor } from '@/components/admin/AdminEntityEditor';
import { singletonPageConfigs } from '@/lib/admin/page-config';
import { getSingletonRecord } from '@/lib/admin/server';

export const dynamic = 'force-dynamic';
export default async function AdminProfilePage() {
  const config = singletonPageConfigs.profile;
  const record = await getSingletonRecord('profiles');

  return (
    <AdminEntityEditor
      title={config.title}
      description={config.description}
      schemaKey={config.schemaKey}
      fields={config.fields}
      defaultValues={record as Record<string, unknown>}
      endpoint="/api/admin/profiles"
      method="PATCH"
      successHref="/admin/profile"
    />
  );
}
