import { z } from 'zod';

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
