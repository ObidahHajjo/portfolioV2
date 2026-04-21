'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';

import { EntityForm } from '@/components/admin/EntityForm';
import { MediaUploadField } from '@/components/admin/MediaUploadField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectSchema } from '@/lib/admin/validation';
import type { AdminFieldConfig } from '@/lib/admin/page-config';

function normalizeProjectDefaults(defaultValues: Record<string, unknown>) {
  return {
    title: String(defaultValues.title ?? ''),
    summary: String(defaultValues.summary ?? ''),
    repoUrl: String(defaultValues.repoUrl ?? ''),
    demoUrl: String(defaultValues.demoUrl ?? ''),
    displayOrder: Number(defaultValues.displayOrder ?? 0),
    published: Boolean(defaultValues.published),
    isVisible: defaultValues.isVisible === undefined ? true : Boolean(defaultValues.isVisible),
    skillIds: Array.isArray(defaultValues.skillIds) ? defaultValues.skillIds : [],
  };
}

function normalizeProjectSubmission(
  fields: AdminFieldConfig[],
  values: Record<string, unknown>
) {
  const next = { ...values };

  for (const field of fields) {
    if (field.serializeAs === 'optional' && next[field.name] === '') {
      next[field.name] = undefined;
    }
  }

  return next;
}

export function ProjectEditor({
  title,
  description,
  defaultValues,
  endpoint,
  method,
  successHref,
  deleteEndpoint,
  projectId,
  skillOptions,
  previewHref,
}: {
  title: string;
  description: string;
  defaultValues: Record<string, unknown>;
  endpoint: string;
  method: 'POST' | 'PATCH';
  successHref: string;
  deleteEndpoint?: string;
  projectId?: string;
  skillOptions: { value: string; label: string }[];
  previewHref?: string;
}) {
  const router = useRouter();
  const [mediaAsset, setMediaAsset] = useState<{ id: string; storageUrl: string } | null>(
    defaultValues.mediaAssetId && defaultValues.mediaAssetUrl
      ? { id: String(defaultValues.mediaAssetId), storageUrl: String(defaultValues.mediaAssetUrl) }
      : null
  );

  const fields = useMemo<AdminFieldConfig[]>(
    () => [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'summary', label: 'Summary', type: 'textarea' },
      { name: 'repoUrl', label: 'Repository URL', type: 'text', serializeAs: 'optional' },
      { name: 'demoUrl', label: 'Demo URL', type: 'text', serializeAs: 'optional' },
      { name: 'displayOrder', label: 'Display Order', type: 'number' },
      { name: 'published', label: 'Published', type: 'boolean' },
      { name: 'isVisible', label: 'Visible', type: 'boolean' },
      { name: 'skillIds', label: 'Skills', type: 'multiselect', options: skillOptions },
    ],
    [skillOptions]
  );

  const clientSchema = useMemo(
    () =>
      z.preprocess(
        (raw) => {
          if (!raw || typeof raw !== 'object') {
            return raw;
          }

          return normalizeProjectSubmission(fields, raw as Record<string, unknown>);
        },
        ProjectSchema as z.ZodType<Record<string, unknown>>
      ),
    [fields]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2">
          {previewHref ? (
            <Button variant="outline" render={<Link href={previewHref} target="_blank" />}>
              Preview
            </Button>
          ) : null}
          <Button variant="outline" render={<Link href={successHref} />}>
            Back
          </Button>
          {deleteEndpoint ? (
            <Button
              variant="destructive"
              onClick={async () => {
                if (!window.confirm('Delete this project?')) {
                  return;
                }

                const response = await fetch(deleteEndpoint, { method: 'DELETE' });
                const payload = (await response.json().catch(() => ({}))) as { error?: string };

                if (!response.ok) {
                  toast.error(payload.error ?? 'Delete failed');
                  return;
                }

                toast.success('Project deleted');
                router.push(successHref);
                router.refresh();
              }}
            >
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <EntityForm
            schema={clientSchema as any}
            defaultValues={normalizeProjectDefaults(defaultValues)}
            fields={fields as any}
            onSubmit={async (values) => {
              const payload = {
                ...values,
                repoUrl: values.repoUrl === '' ? undefined : values.repoUrl,
                demoUrl: values.demoUrl === '' ? undefined : values.demoUrl,
                mediaAssetId: mediaAsset?.id,
              };

              const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });

              const result = (await response.json().catch(() => ({}))) as {
                error?: string;
                fields?: Record<string, string>;
              };

              if (!response.ok) {
                throw { message: result.error ?? 'Save failed', fields: result.fields };
              }

              toast.success('Project saved');
              router.push(successHref);
              router.refresh();
            }}
          />

          {projectId ? (
            <MediaUploadField
              ownerType="project"
              ownerId={projectId}
              currentUrl={mediaAsset?.storageUrl}
              onUploaded={(asset) => setMediaAsset(asset)}
            />
          ) : (
            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              Save the project first to upload and attach media.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
