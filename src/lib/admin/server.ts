import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { db } from '@/lib/db';
import {
  CaseStudySchema,
  ContactSettingsSchema,
  DisplayOrderSchema,
  ExperienceSchema,
  HeroSchema,
  ProfileSchema,
  ProjectSchema,
  SeoMetadataSchema,
  SkillSchema,
  SocialLinkSchema,
  TestimonialSchema,
} from '@/lib/admin/validation';
import { deleteFromMinio } from '@/lib/minio';

export const ADMIN_SINGLETON_SEGMENTS = ['profiles', 'heroes', 'contact-settings'] as const;
export const ADMIN_LIST_SEGMENTS = [
  'social-links',
  'experiences',
  'skills',
  'testimonials',
  'projects',
  'case-studies',
  'seo-metadata',
  'media-assets',
] as const;
export const ADMIN_ENTITY_SEGMENTS = [...ADMIN_SINGLETON_SEGMENTS, ...ADMIN_LIST_SEGMENTS] as const;
export const LIFECYCLE_SEGMENTS = [
  'social-links',
  'experiences',
  'skills',
  'testimonials',
  'projects',
] as const;
export const ACTION_SEGMENTS = ['publish', 'unpublish', 'hide', 'show', 'order'] as const;

export type AdminSingletonSegment = (typeof ADMIN_SINGLETON_SEGMENTS)[number];
export type AdminListSegment = (typeof ADMIN_LIST_SEGMENTS)[number];
export type AdminEntitySegment = (typeof ADMIN_ENTITY_SEGMENTS)[number];
export type LifecycleSegment = (typeof LIFECYCLE_SEGMENTS)[number];
export type ActionSegment = (typeof ACTION_SEGMENTS)[number];

const DISPLAY_ORDER = [{ displayOrder: 'asc' as const }, { createdAt: 'asc' as const }];

const singletonDefaults = {
  profiles: {
    singletonKey: 'singleton',
    fullName: '',
    tagline: '',
    bio: '',
    contactEmail: '',
    avatarUrl: null,
  },
  heroes: {
    singletonKey: 'singleton',
    headline: '',
    subHeadline: '',
    ctaText: '',
    ctaHref: '#',
  },
  'contact-settings': {
    singletonKey: 'singleton',
    contactEmail: '',
    formEnabled: true,
    ctaMessage: '',
  },
} satisfies Record<AdminSingletonSegment, Record<string, unknown>>;

export function isAdminEntitySegment(value: string): value is AdminEntitySegment {
  return (ADMIN_ENTITY_SEGMENTS as readonly string[]).includes(value);
}

export function isListSegment(value: string): value is AdminListSegment {
  return (ADMIN_LIST_SEGMENTS as readonly string[]).includes(value);
}

export function isSingletonSegment(value: string): value is AdminSingletonSegment {
  return (ADMIN_SINGLETON_SEGMENTS as readonly string[]).includes(value);
}

export function isLifecycleSegment(value: string): value is LifecycleSegment {
  return (LIFECYCLE_SEGMENTS as readonly string[]).includes(value);
}

export function isActionSegment(value: string): value is ActionSegment {
  return (ACTION_SEGMENTS as readonly string[]).includes(value);
}

export function getSchemaForEntity(entity: AdminEntitySegment) {
  switch (entity) {
    case 'profiles':
      return ProfileSchema;
    case 'heroes':
      return HeroSchema;
    case 'contact-settings':
      return ContactSettingsSchema;
    case 'social-links':
      return SocialLinkSchema;
    case 'experiences':
      return ExperienceSchema;
    case 'skills':
      return SkillSchema;
    case 'testimonials':
      return TestimonialSchema;
    case 'projects':
      return ProjectSchema;
    case 'case-studies':
      return CaseStudySchema;
    case 'seo-metadata':
      return SeoMetadataSchema;
    case 'media-assets':
      return null;
  }
}

type ProjectInput = Record<string, unknown> & {
  skillIds?: string[];
  repoUrl?: string;
  demoUrl?: string;
  mediaAssetId?: string;
};

type CaseStudyInput = Record<string, unknown> & {
  slug: string;
  title: string;
  projectId?: string;
  challenge: string;
  solution: string;
  outcomes: string;
  architectureNotes?: string;
  mediaAssetIds?: string[];
  displayOrder?: number;
  published?: boolean;
  isVisible?: boolean;
};

type SeoInput = Record<string, unknown> & {
  keywords?: string[];
  canonicalUrl?: string | null;
};

function getListDelegate(entity: AdminListSegment): any {
  switch (entity) {
    case 'social-links':
      return db.socialLink;
    case 'experiences':
      return db.experience;
    case 'skills':
      return db.skill;
    case 'testimonials':
      return db.testimonial;
    case 'projects':
      return db.project;
    case 'case-studies':
      return db.caseStudy;
    case 'seo-metadata':
      return db.seoMetadata;
    case 'media-assets':
      return db.mediaAsset;
  }
}

function getSingletonDelegate(entity: AdminSingletonSegment): any {
  switch (entity) {
    case 'profiles':
      return db.profile;
    case 'heroes':
      return db.hero;
    case 'contact-settings':
      return db.contactSettings;
  }
}

function getListInclude(entity: AdminListSegment) {
  switch (entity) {
    case 'projects':
      return {
        skills: { include: { skill: true } },
        caseStudy: true,
        mediaAsset: true,
      };
    case 'case-studies':
      return { project: true, metrics: { orderBy: { displayOrder: 'asc' } } };
    default:
      return undefined;
  }
}

function getListOrderBy(entity: AdminListSegment) {
  switch (entity) {
    case 'social-links':
    case 'experiences':
    case 'skills':
    case 'testimonials':
    case 'projects':
      return DISPLAY_ORDER;
    default:
      return [{ createdAt: 'desc' as const }];
  }
}

function nullableString(value: unknown) {
  return typeof value === 'string' && value.trim() === '' ? null : (value ?? null);
}

function extractObjectName(storageUrl: string) {
  const bucket = process.env.MINIO_BUCKET ?? 'portfolio-assets';
  const marker = `/${bucket}/`;
  const index = storageUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return storageUrl.slice(index + marker.length);
}

export async function getSingletonRecord(entity: AdminSingletonSegment) {
  const delegate = getSingletonDelegate(entity);

  return delegate.upsert({
    where: { singletonKey: 'singleton' },
    create: singletonDefaults[entity],
    update: {},
  });
}

export async function updateSingletonRecord(
  entity: AdminSingletonSegment,
  data: Record<string, unknown>
) {
  const delegate = getSingletonDelegate(entity);
  const normalized =
    entity === 'profiles' ? { ...data, avatarUrl: nullableString(data.avatarUrl) } : data;

  return delegate.upsert({
    where: { singletonKey: 'singleton' },
    create: { singletonKey: 'singleton', ...normalized },
    update: normalized,
  });
}

export async function listEntityRecords(entity: AdminListSegment) {
  const delegate = getListDelegate(entity);
  return delegate.findMany({
    orderBy: getListOrderBy(entity),
    ...(getListInclude(entity) ? { include: getListInclude(entity) } : {}),
  });
}

export async function getEntityRecord(entity: AdminListSegment, id: string) {
  const delegate = getListDelegate(entity);
  return delegate.findUnique({
    where: { id },
    ...(getListInclude(entity) ? { include: getListInclude(entity) } : {}),
  });
}

export async function createEntityRecord(entity: AdminListSegment, data: Record<string, unknown>) {
  switch (entity) {
    case 'projects': {
      const { skillIds = [], ...projectData } = data as ProjectInput;
      const normalizedProjectData = {
        ...(projectData as Record<string, unknown>),
        repoUrl: nullableString(projectData.repoUrl) as string | null,
        demoUrl: nullableString(projectData.demoUrl) as string | null,
        mediaAssetId: nullableString(projectData.mediaAssetId) as string | null,
      };

      return db.$transaction(async (tx) => {
        const project = await tx.project.create({
          data: normalizedProjectData as any,
        });

        if (skillIds.length > 0) {
          await tx.projectSkill.createMany({
            data: skillIds.map((skillId) => ({ projectId: project.id, skillId })),
          });
        }

        return tx.project.findUniqueOrThrow({
          where: { id: project.id },
          include: { skills: { include: { skill: true } }, caseStudy: true, mediaAsset: true },
        });
      });
    }
    case 'case-studies': {
      const caseStudyData = data as CaseStudyInput;

      if (caseStudyData.projectId) {
        const project = await db.project.findUnique({ where: { id: caseStudyData.projectId } });
        if (!project) {
          return NextResponse.json({ error: 'Project not found' }, { status: 400 });
        }
      }

      return db.caseStudy.create({
        data: {
          slug: caseStudyData.slug,
          title: caseStudyData.title,
          projectId: caseStudyData.projectId || null,
          challenge: caseStudyData.challenge,
          solution: caseStudyData.solution,
          outcomes: caseStudyData.outcomes,
          architectureNotes: caseStudyData.architectureNotes,
          mediaAssetIds: caseStudyData.mediaAssetIds ?? [],
          displayOrder: caseStudyData.displayOrder ?? 0,
          published: caseStudyData.published ?? false,
          isVisible: caseStudyData.isVisible ?? true,
        },
        include: { project: true, metrics: true },
      });
    }
    case 'seo-metadata':
      return db.seoMetadata.create({
        data: { ...(data as SeoInput), keywords: (data as SeoInput).keywords ?? [] } as any,
      });
    case 'media-assets':
      return NextResponse.json(
        { error: 'Use the upload endpoint for media assets' },
        { status: 405 }
      );
    default:
      return getListDelegate(entity).create({ data });
  }
}

export async function updateEntityRecord(
  entity: AdminListSegment,
  id: string,
  data: Record<string, unknown>
) {
  switch (entity) {
    case 'projects': {
      const { skillIds = [], ...projectData } = data as ProjectInput;
      const normalizedProjectData = {
        ...(projectData as Record<string, unknown>),
        repoUrl: nullableString(projectData.repoUrl) as string | null,
        demoUrl: nullableString(projectData.demoUrl) as string | null,
        mediaAssetId: nullableString(projectData.mediaAssetId) as string | null,
      };

      return db.$transaction(async (tx) => {
        await tx.project.update({
          where: { id },
          data: normalizedProjectData as any,
        });

        await tx.projectSkill.deleteMany({ where: { projectId: id } });

        if (skillIds.length > 0) {
          await tx.projectSkill.createMany({
            data: skillIds.map((skillId) => ({ projectId: id, skillId })),
          });
        }

        return tx.project.findUniqueOrThrow({
          where: { id },
          include: { skills: { include: { skill: true } }, caseStudy: true, mediaAsset: true },
        });
      });
    }
    case 'case-studies': {
      const caseStudyData = data as CaseStudyInput;

      if (caseStudyData.projectId) {
        const project = await db.project.findUnique({ where: { id: caseStudyData.projectId } });
        if (!project) {
          return NextResponse.json({ error: 'Project not found' }, { status: 400 });
        }
      }

      return db.caseStudy.update({
        where: { id },
        data: {
          slug: caseStudyData.slug,
          title: caseStudyData.title,
          projectId: caseStudyData.projectId || null,
          challenge: caseStudyData.challenge,
          solution: caseStudyData.solution,
          outcomes: caseStudyData.outcomes,
          architectureNotes: caseStudyData.architectureNotes,
          mediaAssetIds: caseStudyData.mediaAssetIds ?? [],
          displayOrder: caseStudyData.displayOrder,
          published: caseStudyData.published,
          isVisible: caseStudyData.isVisible,
        },
        include: { project: true, metrics: true },
      });
    }
    case 'seo-metadata':
      return db.seoMetadata.update({
        where: { id },
        data: { ...(data as SeoInput), keywords: (data as SeoInput).keywords ?? [] } as any,
      });
    case 'media-assets':
      return db.mediaAsset.update({
        where: { id },
        data: {
          ownerType: String(data.ownerType),
          ownerId: String(data.ownerId),
        },
      });
    default:
      return getListDelegate(entity).update({ where: { id }, data });
  }
}

export async function deleteEntityRecord(entity: AdminListSegment, id: string) {
  switch (entity) {
    case 'skills': {
      try {
        await db.skill.delete({ where: { id } });
        return { ok: true };
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          (error.code === 'P2003' || error.code === 'P2014')
        ) {
          return NextResponse.json(
            { error: 'Skill is linked to one or more projects. Remove those links first.' },
            { status: 400 }
          );
        }

        throw error;
      }
    }
    case 'projects': {
      const caseStudy = await db.caseStudy.findUnique({ where: { projectId: id } });

      if (caseStudy) {
        return NextResponse.json(
          {
            error: `Cannot delete: this project has a linked case study (ID: ${caseStudy.id}, challenge: "${caseStudy.challenge.substring(0, 60)}..."). Delete the case study first.`,
          },
          { status: 400 }
        );
      }

      await db.project.delete({ where: { id } });
      return { ok: true };
    }
    case 'media-assets': {
      const asset = await db.mediaAsset.findUnique({ where: { id } });

      if (!asset) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const objectName = extractObjectName(asset.storageUrl);

      if (objectName) {
        await deleteFromMinio(objectName);
      }

      await db.mediaAsset.delete({ where: { id } });
      return { ok: true };
    }
    default:
      await getListDelegate(entity).delete({ where: { id } });
      return { ok: true };
  }
}

export async function updateLifecycleRecord(
  entity: LifecycleSegment,
  id: string,
  action: Exclude<ActionSegment, 'order'>
) {
  const delegate = getListDelegate(entity);
  const item = await delegate.findUnique({ where: { id } });

  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (action === 'publish') {
    const validationError = validatePublishable(entity, item);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
  }

  if (action === 'hide' && !item.published) {
    return NextResponse.json({ error: 'Item must be published to hide' }, { status: 400 });
  }

  const data =
    action === 'publish'
      ? { published: true }
      : action === 'unpublish'
        ? { published: false }
        : action === 'hide'
          ? { isVisible: false }
          : { isVisible: true };

  await delegate.update({ where: { id }, data });
  return { ok: true };
}

function validatePublishable(entity: LifecycleSegment, item: any) {
  switch (entity) {
    case 'projects':
      return !item.title?.trim() || !item.summary?.trim()
        ? 'Title and summary are required to publish'
        : null;
    case 'experiences':
      return !item.company?.trim() || !item.role?.trim() || !item.description?.trim()
        ? 'Company, role, and description are required to publish'
        : null;
    case 'social-links':
      return !item.platform?.trim() || !item.url?.trim()
        ? 'Platform and URL are required to publish'
        : null;
    case 'skills':
      return !item.name?.trim() ? 'Name is required to publish' : null;
    case 'testimonials':
      return !item.authorName?.trim() || !item.quote?.trim()
        ? 'Author name and quote are required to publish'
        : null;
  }
}

export async function updateEntityOrder(entity: LifecycleSegment, id: string, data: unknown) {
  const result = DisplayOrderSchema.safeParse(data);

  if (!result.success) {
    return NextResponse.json(
      { error: 'displayOrder must be a non-negative integer' },
      { status: 422 }
    );
  }

  const delegate = getListDelegate(entity);
  const existing = await delegate.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await delegate.update({ where: { id }, data: { displayOrder: result.data.displayOrder } });
  return { ok: true };
}
