import { notFound } from 'next/navigation';

import { AdminEntityEditor } from '@/components/admin/AdminEntityEditor';
import { ProjectEditor } from '@/components/admin/ProjectEditor';
import { db } from '@/lib/db';
import { collectionPageConfigs } from '@/lib/admin/page-config';
import { getEntityRecord, isListSegment } from '@/lib/admin/server';

export default async function AdminEditEntityPage({
  params,
}: {
  params: { entity: string; id: string };
}) {
  if (!isListSegment(params.entity) || params.entity === 'media-assets') {
    notFound();
  }

  const record = await getEntityRecord(params.entity, params.id);

  if (!record) {
    notFound();
  }

  if (params.entity === 'projects') {
    const skills = await db.skill.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
    const project = record as any;

    return (
      <ProjectEditor
        title={`Edit ${project.title}`}
        description="Update project details, linked skills, and media."
        defaultValues={{
          ...project,
          skillIds: project.skills.map((entry: any) => entry.skillId),
          mediaAssetId: project.mediaAsset?.id,
          mediaAssetUrl: project.mediaAsset?.storageUrl,
        }}
        endpoint={`/api/admin/projects/${params.id}`}
        method="PATCH"
        successHref="/admin/projects"
        deleteEndpoint={`/api/admin/projects/${params.id}`}
        projectId={params.id}
        skillOptions={skills.map((skill) => ({
          value: skill.id,
          label: `${skill.name} (${skill.category})`,
        }))}
        previewHref={`/admin/preview/projects/${params.id}`}
      />
    );
  }

  const config = collectionPageConfigs[params.entity];
  const defaultValues = { ...(record as Record<string, unknown>) };

  if (params.entity === 'case-studies') {
    const projects = await db.project.findMany({ orderBy: { title: 'asc' } });
    config.fields.find((field) => field.name === 'projectId')!.options = projects.map(
      (project) => ({
        value: project.id,
        label: project.title,
      })
    );
  }

  if (params.entity === 'seo-metadata' && Array.isArray(defaultValues.keywords)) {
    defaultValues.keywords = defaultValues.keywords;
  }

  return (
    <AdminEntityEditor
      title={`Edit ${config.title.slice(0, -1)}`}
      description={config.description}
      schemaKey={config.schemaKey}
      fields={config.fields}
      defaultValues={defaultValues}
      endpoint={`/api/admin/${params.entity}/${params.id}`}
      method="PATCH"
      successHref={`/admin/${params.entity}`}
      deleteEndpoint={`/api/admin/${params.entity}/${params.id}`}
      deleteHref={`/admin/${params.entity}`}
    />
  );
}
