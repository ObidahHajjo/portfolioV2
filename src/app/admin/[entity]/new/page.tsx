import { notFound } from 'next/navigation';

import { AdminEntityEditor } from '@/components/admin/AdminEntityEditor';
import { ProjectEditor } from '@/components/admin/ProjectEditor';
import { db } from '@/lib/db';
import { collectionPageConfigs } from '@/lib/admin/page-config';
import { isListSegment } from '@/lib/admin/server';

export default async function AdminNewEntityPage({ params }: { params: { entity: string } }) {
  if (!isListSegment(params.entity) || params.entity === 'media-assets') {
    notFound();
  }

  if (params.entity === 'projects') {
    const skills = await db.skill.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });

    return (
      <ProjectEditor
        title="New Project"
        description="Create a project and link related skills."
        defaultValues={{
          title: '',
          summary: '',
          repoUrl: '',
          demoUrl: '',
          displayOrder: 0,
          published: false,
          isVisible: true,
          skillIds: [],
        }}
        endpoint="/api/admin/projects"
        method="POST"
        successHref="/admin/projects"
        skillOptions={skills.map((skill) => ({
          value: skill.id,
          label: `${skill.name} (${skill.category})`,
        }))}
      />
    );
  }

  const config = collectionPageConfigs[params.entity];
  const defaultValues: Record<string, unknown> = Object.fromEntries(
    config.fields.map((field) => {
      if (field.type === 'boolean') return [field.name, field.name === 'isVisible'];
      if (field.type === 'number') return [field.name, 0];
      if (field.type === 'multiselect') return [field.name, []];
      return [field.name, ''];
    })
  );

  if (params.entity === 'case-studies') {
    const projects = await db.project.findMany({ orderBy: { title: 'asc' } });
    config.fields.find((field) => field.name === 'projectId')!.options = projects.map(
      (project) => ({
        value: project.id,
        label: project.title,
      })
    );
  }

  return (
    <AdminEntityEditor
      title={`New ${config.title.slice(0, -1)}`}
      description={config.description}
      schemaKey={config.schemaKey}
      fields={config.fields}
      defaultValues={defaultValues}
      endpoint={`/api/admin/${params.entity}`}
      method="POST"
      successHref={`/admin/${params.entity}`}
    />
  );
}
