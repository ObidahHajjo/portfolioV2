export interface HeroData {
  headline: string;
  subHeadline: string;
  ctaText: string;
  ctaHref: string;
}

export interface ProfileData {
  fullName: string;
  tagline: string;
  bio: string;
}

export interface SkillData {
  name: string;
  category: string;
  displayOrder: number;
}

export interface SkillGroup {
  category: string;
  skills: Pick<SkillData, 'name'>[];
}

export interface ExperienceData {
  company: string;
  role: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  highlights: string[];
  displayOrder: number;
  published: boolean;
  isVisible: boolean;
}

export interface ProjectData {
  title: string;
  summary: string;
  repoUrl: string | null;
  demoUrl: string | null;
  mediaAssetId: string | null;
  displayOrder: number;
  published: boolean;
  isVisible: boolean;
}

export interface SocialLinkData {
  platform: string;
  url: string;
  displayOrder: number;
  published: boolean;
  isVisible: boolean;
}

export interface PortfolioPageData {
  hero: HeroData | null;
  profile: ProfileData | null;
  skillGroups: SkillGroup[];
  experience: ExperienceData[];
  projects: ProjectData[];
  socialLinks: SocialLinkData[];
}

export interface NavLink {
  label: string;
  anchor: string;
}
