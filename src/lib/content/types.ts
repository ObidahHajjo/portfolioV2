export type {
  Article,
  CaseStudy,
  CaseStudyMetric,
  ContactSettings,
  CvAsset,
  Experience,
  Hero,
  MediaAsset,
  OpenSourceContribution,
  Profile,
  Project,
  ProjectSkill,
  SectionVisibility,
  SeoMetadata,
  Skill,
  SocialLink,
  Talk,
  Testimonial,
  ContactSubmission,
  AnalyticsEvent,
  ErrorEvent,
  ErrorAlert,
} from '@prisma/client';

import type {
  CaseStudy as PrismaCaseStudy,
  CaseStudyMetric as PrismaCaseStudyMetric,
  Project as PrismaProject,
} from '@prisma/client';

export type CaseStudyWithMetrics = PrismaCaseStudy & {
  metrics: PrismaCaseStudyMetric[];
  project?: Pick<PrismaProject, 'id' | 'title'> | null;
};
