import type {
  Article,
  CaseStudy,
  ContactSettings,
  CvAsset,
  Experience,
  Hero,
  OpenSourceContribution,
  Profile,
  Project,
  SectionVisibility,
  SeoMetadata,
  Skill,
  SocialLink,
  Talk,
  Testimonial,
} from '@prisma/client';

import { db } from '@/lib/db';

export async function getPublishedCaseStudies() {
  return db.caseStudy.findMany({
    where: { published: true, isVisible: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      metrics: { orderBy: { displayOrder: 'asc' } },
      project: { select: { id: true, title: true } },
    },
  });
}

export async function getCaseStudyBySlug(slug: string) {
  return db.caseStudy.findFirst({
    where: { slug, published: true, isVisible: true },
    include: {
      metrics: { orderBy: { displayOrder: 'asc' } },
      project: { select: { id: true, title: true } },
    },
  });
}

export async function getPublishedCvAsset() {
  return db.cvAsset.findFirst({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPublishedTestimonials() {
  return db.testimonial.findMany({
    where: { published: true, isVisible: true },
    orderBy: { displayOrder: 'asc' },
  });
}

export async function getPublishedArticles() {
  return db.article.findMany({
    where: { published: true, isVisible: true },
    orderBy: { displayOrder: 'asc' },
  });
}

export async function getPublishedOpenSourceContributions() {
  return db.openSourceContribution.findMany({
    where: { published: true, isVisible: true },
    orderBy: { displayOrder: 'asc' },
  });
}

export async function getPublishedTalks() {
  return db.talk.findMany({
    where: { published: true, isVisible: true },
    orderBy: { displayOrder: 'asc' },
  });
}

export async function getSectionVisibility(section: string): Promise<SectionVisibility | null> {
  return db.sectionVisibility.findUnique({ where: { section } });
}

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
