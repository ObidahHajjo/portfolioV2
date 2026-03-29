'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { EntityForm } from '@/components/admin/EntityForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AdminFieldConfig, AdminSchemaKey } from '@/lib/admin/page-config';
import {
  CaseStudySchema,
  ContactSettingsSchema,
  ExperienceSchema,
  HeroSchema,
  ProfileSchema,
  ProjectSchema,
  SeoMetadataSchema,
  SkillSchema,
  SocialLinkSchema,
  TestimonialSchema,
} from '@/lib/admin/validation';

const schemaMap = {
  profile: ProfileSchema,
  hero: HeroSchema,
  contactSettings: ContactSettingsSchema,
  socialLink: SocialLinkSchema,
  experience: ExperienceSchema,
  skill: SkillSchema,
  testimonial: TestimonialSchema,
  project: ProjectSchema,
  caseStudy: CaseStudySchema,
  seoMetadata: SeoMetadataSchema,
} satisfies Record<AdminSchemaKey, object>;

function normalizeDefaultValue(field: AdminFieldConfig, value: unknown) {
  if (field.serializeAs === 'csv') {
    return Array.isArray(value) ? value.join(', ') : '';
  }

  if (field.type === 'multiselect') {
    return Array.isArray(value) ? value : [];
  }

  if (field.type === 'boolean') {
    return Boolean(value);
  }

  if (field.type === 'number') {
    return typeof value === 'number' ? value : 0;
  }

  if (field.type === 'date') {
    if (!value) {
      return '';
    }

    return typeof value === 'string'
      ? value.slice(0, 10)
      : new Date(String(value)).toISOString().slice(0, 10);
  }

  if (field.serializeAs === 'none-to-undefined' && !value) {
    return 'none';
  }

  return value ?? '';
}

function transformSubmission(fields: AdminFieldConfig[], values: Record<string, unknown>) {
  const next = { ...values };

  for (const field of fields) {
    const value = next[field.name];

    if (field.serializeAs === 'csv') {
      next[field.name] = String(value ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      continue;
    }

    if (field.serializeAs === 'optional' && value === '') {
      next[field.name] = undefined;
      continue;
    }

    if (field.serializeAs === 'none-to-undefined' && value === 'none') {
      next[field.name] = undefined;
    }
  }

  return next;
}

export function AdminEntityEditor({
  title,
  description,
  schemaKey,
  fields,
  defaultValues,
  endpoint,
  method,
  successHref,
  deleteEndpoint,
  deleteHref,
  previewHref,
  children,
}: {
  title: string;
  description: string;
  schemaKey: AdminSchemaKey;
  fields: AdminFieldConfig[];
  defaultValues: Record<string, unknown>;
  endpoint: string;
  method: 'POST' | 'PATCH';
  successHref: string;
  deleteEndpoint?: string;
  deleteHref?: string;
  previewHref?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();

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
          {deleteEndpoint && deleteHref ? (
            <Button
              variant="destructive"
              onClick={async () => {
                if (!window.confirm('Delete this record?')) {
                  return;
                }

                const response = await fetch(deleteEndpoint, { method: 'DELETE' });
                const payload = (await response.json().catch(() => ({}))) as { error?: string };

                if (!response.ok) {
                  toast.error(payload.error ?? 'Delete failed');
                  return;
                }

                toast.success('Record deleted');
                router.push(deleteHref);
                router.refresh();
              }}
            >
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      <Card className={cn('max-w-4xl')}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <EntityForm
            schema={schemaMap[schemaKey] as any}
            defaultValues={Object.fromEntries(
              fields.map((field) => [
                field.name,
                normalizeDefaultValue(field, defaultValues[field.name]),
              ])
            )}
            fields={fields as any}
            submitLabel="Save"
            onSubmit={async (values) => {
              const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transformSubmission(fields, values)),
              });

              const payload = (await response.json().catch(() => ({}))) as {
                error?: string;
                fields?: Record<string, string>;
              };

              if (!response.ok) {
                throw { message: payload.error ?? 'Save failed', fields: payload.fields };
              }

              toast.success('Saved successfully');
              router.push(successHref);
              router.refresh();
            }}
          />
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
