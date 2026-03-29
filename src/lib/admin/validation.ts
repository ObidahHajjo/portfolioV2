import { z } from 'zod';

export {
  ExperienceSchema,
  MediaAssetSchema,
  ProjectSchema,
  SeoMetadataSchema,
  SkillSchema,
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
  authorCompany: z.string().max(150),
  quote: z.string().min(10),
  displayOrder: z.number().int().min(0),
  published: z.boolean(),
  isVisible: z.boolean(),
});

export const CaseStudySchema = z.object({
  projectId: z.string().cuid(),
  challenge: z.string().min(10),
  solution: z.string().min(10),
  outcomes: z.string().min(10),
  mediaAssetIds: z.array(z.string().cuid()).optional(),
});

export const DisplayOrderSchema = z.object({
  displayOrder: z.number().int().min(0),
});
