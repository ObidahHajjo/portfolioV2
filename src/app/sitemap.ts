import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { env } from '@/lib/config/env';

function latestDate(dates: Array<Date | null | undefined>): Date {
  const valid = dates.filter((date): date is Date => Boolean(date));
  if (valid.length === 0) {
    return new Date();
  }

  return valid.reduce((latest, current) => (current > latest ? current : latest));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;

  try {
    const [
      profile,
      hero,
      latestExperience,
      latestSkill,
      latestProject,
      latestSocial,
      latestCaseStudy,
    ] = await Promise.all([
      db.profile.findUnique({ where: { singletonKey: 'singleton' }, select: { updatedAt: true } }),
      db.hero.findUnique({ where: { singletonKey: 'singleton' }, select: { updatedAt: true } }),
      db.experience.findFirst({
        where: { published: true, isVisible: true },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      db.skill.findFirst({
        where: { published: true, isVisible: true },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      db.project.findFirst({
        where: { published: true, isVisible: true },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      db.socialLink.findFirst({
        where: { published: true, isVisible: true },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      db.caseStudy.findFirst({
        where: { published: true, isVisible: true },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
    ]);

    const homeLastModified = latestDate([
      profile?.updatedAt,
      hero?.updatedAt,
      latestExperience?.updatedAt,
      latestSkill?.updatedAt,
      latestProject?.updatedAt,
      latestSocial?.updatedAt,
    ]);

    const caseStudiesLastModified = latestDate([latestCaseStudy?.updatedAt]);

    const staticUrls: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/`,
        lastModified: homeLastModified,
        changeFrequency: 'monthly',
        priority: 1,
      },
      {
        url: `${baseUrl}/case-studies`,
        lastModified: caseStudiesLastModified,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ];

    const publishedCaseStudies = await db.caseStudy.findMany({
      where: {
        published: true,
        isVisible: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const caseStudyUrls: MetadataRoute.Sitemap = publishedCaseStudies.map((cs) => ({
      url: `${baseUrl}/case-studies/${cs.slug}`,
      lastModified: cs.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    return [...staticUrls, ...caseStudyUrls];
  } catch {
    return [
      {
        url: `${baseUrl}/`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1,
      },
      {
        url: `${baseUrl}/case-studies`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ];
  }
}
