/**
 * Page Data Contracts — Phase 1: Public Portfolio MVP
 *
 * These TypeScript interfaces define the exact shape of data consumed by each
 * section component. They are derived from the Prisma models in data-model.md
 * and serve as the stable contract between the data layer and the UI layer.
 *
 * Rules:
 * - Section components MUST accept `null` for singleton entities (Hero, About)
 *   and an empty array `[]` for list entities. When null or empty, the section
 *   renders nothing (FR-010).
 * - No implementation details (Prisma internals, DB timestamps) should leak
 *   into component props beyond what is listed here.
 */

// ─── Hero ─────────────────────────────────────────────────────────────────────

export interface HeroData {
  name: string;
  title: string;
  tagline: string;
  ctaLabel: string;
  ctaHref: string; // mailto: or #anchor
}

// ─── About ───────────────────────────────────────────────────────────────────

export interface AboutData {
  bio: string; // May contain newlines; rendered as paragraphs
}

// ─── Skills ──────────────────────────────────────────────────────────────────

export interface SkillData {
  name: string;
  category: string;
  displayOrder: number;
}

/**
 * Skills are grouped by category before passing to SkillsSection.
 * The grouping is performed in the data access layer, not the component.
 */
export interface SkillGroup {
  category: string;
  skills: Pick<SkillData, 'name'>[];
}

// ─── Experience ───────────────────────────────────────────────────────────────

export interface ExperienceEntryData {
  company: string;
  role: string;
  startDate: Date;
  endDate: Date | null; // null = "Present"
  description: string;
  displayOrder: number;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface ProjectData {
  title: string;
  summary: string;
  technologies: string[];
  repoUrl: string | null;
  demoUrl: string | null;
  displayOrder: number;
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export interface ContactReferenceData {
  label: string;
  href: string; // https:// or mailto:
  displayOrder: number;
}

// ─── Page-Level Aggregate ────────────────────────────────────────────────────

/**
 * Full data shape fetched once in app/page.tsx (server component) and
 * distributed to section components. Null values or empty arrays cause
 * their respective sections to be omitted from the rendered page.
 */
export interface PortfolioPageData {
  hero: HeroData | null;
  about: AboutData | null;
  skillGroups: SkillGroup[]; // Empty array = SkillsSection hidden
  experience: ExperienceEntryData[]; // Empty array = ExperienceSection hidden
  projects: ProjectData[]; // Empty array = ProjectsSection hidden
  contactRefs: ContactReferenceData[]; // Empty array = ContactSection hidden
}

// ─── Navigation ──────────────────────────────────────────────────────────────

/**
 * Sticky header navigation links. Generated from the set of sections that
 * have data (i.e., sections that will actually render). Sections with no
 * data are excluded from navigation to avoid dead anchor links.
 */
export interface NavLink {
  label: string; // Display label (e.g., "About", "Projects")
  anchor: string; // Section element id (e.g., "about", "projects")
}
