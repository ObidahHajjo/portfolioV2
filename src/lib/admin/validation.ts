import { z } from 'zod';

export {
  ExperienceSchema,
  MediaAssetSchema,
  ProjectSchema,
  SeoMetadataSchema,
  SkillSchema,
  caseStudyMetricSchema,
  createCaseStudySchema,
  updateCaseStudySchema,
} from '@/lib/content/validation';

const UrlOrPathSchema = z
  .string()
  .max(500)
  .refine((value) => value.startsWith('/') || value.startsWith('#') || /^https?:\/\//.test(value), {
    message: 'Must be a valid URL or path',
  });

export const ProfileSchema = z.object({
  fullName: z.string().max(100),
  tagline: z.string().max(200),
  bio: z.string().min(10),
  contactEmail: z.string().email().max(254),
  avatarUrl: z.string().url().max(500).optional().or(z.literal('')),
});

export const HeroSchema = z.object({
  headline: z.string().max(150),
  subHeadline: z.string().max(300),
  ctaText: z.string().max(50),
  ctaHref: UrlOrPathSchema,
});

export const ContactSettingsSchema = z.object({
  contactEmail: z.string().email().max(254),
  formEnabled: z.boolean(),
  ctaMessage: z.string().max(500),
});

export const SocialLinkSchema = z.object({
  platform: z.string().max(50),
  url: z.string().url().max(500),
  displayOrder: z.number().int().min(0),
  published: z.boolean(),
  isVisible: z.boolean(),
});

export const TestimonialSchema = z.object({
  authorName: z.string().max(100),
  authorRole: z.string().max(150),
  authorCompany: z.string().max(150).optional(),
  avatarUrl: z.string().url().max(500).optional(),
  quote: z.string().min(10),
  displayOrder: z.number().int().min(0),
  published: z.boolean(),
  isVisible: z.boolean(),
});

export const CaseStudySchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(150)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'),
  title: z.string().min(1).max(200),
  projectId: z.string().cuid().optional(),
  challenge: z.string().min(10),
  solution: z.string().min(10),
  outcomes: z.string().min(10),
  architectureNotes: z.string().optional(),
  mediaAssetIds: z.array(z.string().cuid()).optional(),
  displayOrder: z.number().int().min(0),
  published: z.boolean(),
  isVisible: z.boolean(),
});

export const DisplayOrderSchema = z.object({
  displayOrder: z.number().int().min(0),
});

export const ArticleSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(10),
  externalUrl: z.string().url().max(500),
  publishedAt: z.string().datetime().optional().nullable(),
  displayOrder: z.number().int().min(0),
  published: z.boolean(),
  isVisible: z.boolean(),
});

export const OpenSourceSchema = z.object({
  projectName: z.string().min(1).max(150),
  description: z.string().min(10),
  contributionType: z.string().min(1).max(100),
  repositoryUrl: z.string().url().max(500).optional(),
  displayOrder: z.number().int().min(0),
  published: z.boolean(),
  isVisible: z.boolean(),
});

export const TalkSchema = z.object({
  title: z.string().min(1).max(200),
  eventName: z.string().min(1).max(200),
  talkDate: z.string().datetime(),
  summary: z.string().min(10),
  recordingUrl: z.string().url().max(500).optional(),
  slidesUrl: z.string().url().max(500).optional(),
  displayOrder: z.number().int().min(0),
  published: z.boolean(),
  isVisible: z.boolean(),
});

export const CvAssetSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().min(1),
  published: z.boolean().default(false),
});

export const SectionVisibilitySchema = z.object({
  enabled: z.boolean(),
});
