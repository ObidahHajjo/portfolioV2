import { AdminEntityEditor } from '@/components/admin/AdminEntityEditor';
import { singletonPageConfigs } from '@/lib/admin/page-config';
import { getSingletonRecord } from '@/lib/admin/server';

export const dynamic = 'force-dynamic';
export default async function AdminContactSettingsPage() {
  const config = singletonPageConfigs['contact-settings'];
  const record = await getSingletonRecord('contact-settings');

  return (
    <AdminEntityEditor
      title={config.title}
      description={config.description}
      schemaKey={config.schemaKey}
      fields={config.fields}
      defaultValues={record as Record<string, unknown>}
      endpoint="/api/admin/contact-settings"
      method="PATCH"
      successHref="/admin/contact-settings"
    />
  );
}
