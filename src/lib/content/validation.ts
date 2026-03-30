import { z } from 'zod';

export const caseStudyMetricSchema = z.object({
  label: z.string().min(1).max(100),
  value: z.string().min(1).max(100),
  unit: z.string().max(50).optional(),
  displayOrder: z.number().int().min(0).default(0),
});

export const createCaseStudySchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(150)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'),
  title: z.string().min(1).max(200),
  projectId: z.string().optional(),
  challenge: z.string().min(10),
  solution: z.string().min(10),
  outcomes: z.string().min(10),
  architectureNotes: z.string().optional(),
  displayOrder: z.number().int().min(0).default(0),
  published: z.boolean().default(false),
  isVisible: z.boolean().default(true),
});

export const updateCaseStudySchema = createCaseStudySchema.partial();

export const ExperienceSchema = z
  .object({
    company: z.string().min(1).max(150),
    role: z.string().min(1).max(150),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    description: z.string().min(10),
    highlights: z.array(z.string().max(300)).max(20).optional(),
    displayOrder: z.number().int().min(0),
    published: z.boolean(),
    isVisible: z.boolean(),
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: 'endDate must be after startDate',
    path: ['endDate'],
  });

export const ProjectSchema = z.object({
  title: z.string().min(1).max(150),
  summary: z.string().min(10),
  repoUrl: z.string().url().max(500).optional(),
  demoUrl: z.string().url().max(500).optional(),
  mediaAssetId: z.string().cuid().optional(),
  displayOrder: z.number().int().min(0),
  published: z.boolean(),
  isVisible: z.boolean(),
  skillIds: z.array(z.string().cuid()),
});

export const SkillSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  displayOrder: z.number().int().min(0),
  published: z.boolean(),
  isVisible: z.boolean(),
});

export const SeoMetadataSchema = z.object({
  pageSlug: z
    .string()
    .regex(/^\/[\w/-]*$/)
    .max(100),
  pageTitle: z.string().min(1).max(70),
  metaDescription: z.string().min(1).max(160),
  keywords: z.array(z.string().max(50)).max(10).optional(),
  ogTitle: z.string().max(70).optional(),
  ogDescription: z.string().max(200).optional(),
  ogImageUrl: z.string().url().max(500).optional(),
});

export const MediaAssetSchema = z.object({
  fileName: z.string().min(1).max(255),
  storageUrl: z.string().url().max(500),
  fileType: z
    .string()
    .regex(/^\w+\/[\w.+-]+$/)
    .max(50),
  ownerType: z.enum(['project', 'case_study', 'profile', 'testimonial']),
  ownerId: z.string().cuid(),
});

export const cvAssetSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().min(1),
  published: z.boolean().default(false),
});

export const createArticleSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(10),
  externalUrl: z.string().url().max(500),
  publishedAt: z.string().datetime().optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
  published: z.boolean().default(false),
  isVisible: z.boolean().default(true),
});

export const updateArticleSchema = createArticleSchema.partial();

export const createOpenSourceSchema = z.object({
  projectName: z.string().min(1).max(150),
  description: z.string().min(10),
  contributionType: z.string().min(1).max(100),
  repositoryUrl: z.string().url().max(500).optional(),
  displayOrder: z.number().int().min(0).default(0),
  published: z.boolean().default(false),
  isVisible: z.boolean().default(true),
});

export const updateOpenSourceSchema = createOpenSourceSchema.partial();

export const createTalkSchema = z.object({
  title: z.string().min(1).max(200),
  eventName: z.string().min(1).max(200),
  talkDate: z.string().datetime(),
  summary: z.string().min(10),
  recordingUrl: z.string().url().max(500).optional(),
  slidesUrl: z.string().url().max(500).optional(),
  displayOrder: z.number().int().min(0).default(0),
  published: z.boolean().default(false),
  isVisible: z.boolean().default(true),
});

export const updateTalkSchema = createTalkSchema.partial();
