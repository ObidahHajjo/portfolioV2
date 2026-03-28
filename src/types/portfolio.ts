export interface HeroData {
  name: string;
  title: string;
  tagline: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface AboutData {
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

export interface ExperienceEntryData {
  company: string;
  role: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  displayOrder: number;
}

export interface ProjectData {
  title: string;
  summary: string;
  technologies: string[];
  repoUrl: string | null;
  demoUrl: string | null;
  displayOrder: number;
}

export interface ContactReferenceData {
  label: string;
  href: string;
  displayOrder: number;
}

export interface PortfolioPageData {
  hero: HeroData | null;
  about: AboutData | null;
  skillGroups: SkillGroup[];
  experience: ExperienceEntryData[];
  projects: ProjectData[];
  contactRefs: ContactReferenceData[];
}

export interface NavLink {
  label: string;
  anchor: string;
}
