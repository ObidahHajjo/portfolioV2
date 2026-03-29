import type {
  ContactSettings,
  Hero,
  Profile,
  Project,
  SeoMetadata,
  SocialLink,
  Testimonial,
  Experience,
  Skill,
} from '@prisma/client';

import { db } from '@/lib/db';

type PublicEntity = 'socialLink' | 'experience' | 'skill' | 'project' | 'testimonial';
type SingletonEntity = 'profile' | 'hero' | 'contactSettings';

type PublicEntityResultMap = {
  socialLink: SocialLink;
  experience: Experience;
  skill: Skill;
  project: Project;
  testimonial: Testimonial;
};

type SingletonResultMap = {
  profile: Profile;
  hero: Hero;
  contactSettings: ContactSettings;
};

const publicDelegates = {
  socialLink: db.socialLink,
  experience: db.experience,
  skill: db.skill,
  project: db.project,
  testimonial: db.testimonial,
} as const;

const singletonDelegates = {
  profile: db.profile,
  hero: db.hero,
  contactSettings: db.contactSettings,
} as const;

export async function getPublishedVisible<T extends PublicEntity>(
  entity: T,
  /**
   * Include clauses are forwarded to Prisma, but this helper intentionally keeps
   * a base entity return type. Use entity-specific helpers when include typing matters.
   */
  include?: object
): Promise<PublicEntityResultMap[T][]> {
  const delegate = publicDelegates[entity] as unknown as {
    findMany: (args: {
      where: { published: true; isVisible: true };
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }];
      include?: object;
    }) => Promise<PublicEntityResultMap[T][]>;
  };

  return delegate.findMany({
    where: { published: true, isVisible: true },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    ...(include ? { include } : {}),
  });
}

export async function getPublishedProjects() {
  return db.project.findMany({
    where: { published: true, isVisible: true },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      skills: { include: { skill: true } },
      caseStudy: true,
      mediaAsset: true,
    },
  });
}

export async function getSingleton<T extends SingletonEntity>(
  entity: T
): Promise<SingletonResultMap[T]> {
  const delegate = singletonDelegates[entity] as unknown as {
    findUniqueOrThrow: (args: {
      where: { singletonKey: 'singleton' };
    }) => Promise<SingletonResultMap[T]>;
  };

  return delegate.findUniqueOrThrow({
    where: { singletonKey: 'singleton' },
  });
}

export async function getSeoMetadata(pageSlug: string): Promise<SeoMetadata | null> {
  return db.seoMetadata.findUnique({
    where: { pageSlug },
  });
}
