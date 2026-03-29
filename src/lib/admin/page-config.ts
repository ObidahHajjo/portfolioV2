export type AdminSchemaKey =
  | 'profile'
  | 'hero'
  | 'contactSettings'
  | 'socialLink'
  | 'experience'
  | 'skill'
  | 'testimonial'
  | 'project'
  | 'caseStudy'
  | 'seoMetadata';

export type AdminFieldConfig = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'date' | 'multiselect';
  options?: { value: string; label: string }[];
  inputType?: string;
  serializeAs?: 'csv' | 'optional' | 'none-to-undefined';
};

export type AdminPageConfig = {
  title: string;
  description: string;
  schemaKey: AdminSchemaKey;
  fields: AdminFieldConfig[];
};

export const singletonPageConfigs: Record<
  'profile' | 'hero' | 'contact-settings',
  AdminPageConfig
> = {
  profile: {
    title: 'Profile',
    description: 'Update your main profile content shown in the portfolio.',
    schemaKey: 'profile',
    fields: [
      { name: 'fullName', label: 'Full Name', type: 'text' },
      { name: 'tagline', label: 'Tagline', type: 'text' },
      { name: 'bio', label: 'Bio', type: 'textarea' },
      { name: 'contactEmail', label: 'Contact Email', type: 'text', inputType: 'email' },
      { name: 'avatarUrl', label: 'Avatar URL', type: 'text' },
    ],
  },
  hero: {
    title: 'Hero',
    description: 'Edit the hero section headline and CTA.',
    schemaKey: 'hero',
    fields: [
      { name: 'headline', label: 'Headline', type: 'text' },
      { name: 'subHeadline', label: 'Sub Headline', type: 'textarea' },
      { name: 'ctaText', label: 'CTA Text', type: 'text' },
      { name: 'ctaHref', label: 'CTA Href', type: 'text' },
    ],
  },
  'contact-settings': {
    title: 'Contact Settings',
    description: 'Manage contact form behavior and CTA messaging.',
    schemaKey: 'contactSettings',
    fields: [
      { name: 'contactEmail', label: 'Contact Email', type: 'text', inputType: 'email' },
      { name: 'formEnabled', label: 'Form Enabled', type: 'boolean' },
      { name: 'ctaMessage', label: 'CTA Message', type: 'textarea' },
    ],
  },
};

export const collectionPageConfigs: Record<
  | 'social-links'
  | 'experiences'
  | 'skills'
  | 'testimonials'
  | 'projects'
  | 'case-studies'
  | 'seo-metadata',
  AdminPageConfig
> = {
  'social-links': {
    title: 'Social Links',
    description: 'Create and manage social links shown on the portfolio.',
    schemaKey: 'socialLink',
    fields: [
      { name: 'platform', label: 'Platform', type: 'text' },
      { name: 'url', label: 'URL', type: 'text' },
      { name: 'displayOrder', label: 'Display Order', type: 'number' },
      { name: 'published', label: 'Published', type: 'boolean' },
      { name: 'isVisible', label: 'Visible', type: 'boolean' },
    ],
  },
  experiences: {
    title: 'Experiences',
    description: 'Manage role history and highlights.',
    schemaKey: 'experience',
    fields: [
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'endDate', label: 'End Date', type: 'date', serializeAs: 'optional' },
      { name: 'description', label: 'Description', type: 'textarea' },
      {
        name: 'highlights',
        label: 'Highlights (comma-separated)',
        type: 'textarea',
        serializeAs: 'csv',
      },
      { name: 'displayOrder', label: 'Display Order', type: 'number' },
      { name: 'published', label: 'Published', type: 'boolean' },
      { name: 'isVisible', label: 'Visible', type: 'boolean' },
    ],
  },
  skills: {
    title: 'Skills',
    description: 'Manage categorized skill records.',
    schemaKey: 'skill',
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'category', label: 'Category', type: 'text' },
      {
        name: 'proficiency',
        label: 'Proficiency',
        type: 'select',
        serializeAs: 'none-to-undefined',
        options: [
          { value: 'none', label: 'None' },
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
          { value: 'expert', label: 'Expert' },
        ],
      },
      { name: 'displayOrder', label: 'Display Order', type: 'number' },
      { name: 'published', label: 'Published', type: 'boolean' },
      { name: 'isVisible', label: 'Visible', type: 'boolean' },
    ],
  },
  testimonials: {
    title: 'Testimonials',
    description: 'Manage testimonial quotes and attribution.',
    schemaKey: 'testimonial',
    fields: [
      { name: 'authorName', label: 'Author Name', type: 'text' },
      { name: 'authorRole', label: 'Author Role', type: 'text' },
      { name: 'authorCompany', label: 'Author Company', type: 'text' },
      { name: 'quote', label: 'Quote', type: 'textarea' },
      { name: 'displayOrder', label: 'Display Order', type: 'number' },
      { name: 'published', label: 'Published', type: 'boolean' },
      { name: 'isVisible', label: 'Visible', type: 'boolean' },
    ],
  },
  projects: {
    title: 'Projects',
    description: 'Manage project cards, case study links, and presentation order.',
    schemaKey: 'project',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'summary', label: 'Summary', type: 'textarea' },
      { name: 'repoUrl', label: 'Repository URL', type: 'text', serializeAs: 'optional' },
      { name: 'demoUrl', label: 'Demo URL', type: 'text', serializeAs: 'optional' },
      { name: 'displayOrder', label: 'Display Order', type: 'number' },
      { name: 'published', label: 'Published', type: 'boolean' },
      { name: 'isVisible', label: 'Visible', type: 'boolean' },
      { name: 'skillIds', label: 'Skills', type: 'multiselect' },
    ],
  },
  'case-studies': {
    title: 'Case Studies',
    description: 'Link project narratives and outcomes.',
    schemaKey: 'caseStudy',
    fields: [
      { name: 'projectId', label: 'Project', type: 'select' },
      { name: 'challenge', label: 'Challenge', type: 'textarea' },
      { name: 'solution', label: 'Solution', type: 'textarea' },
      { name: 'outcomes', label: 'Outcomes', type: 'textarea' },
    ],
  },
  'seo-metadata': {
    title: 'SEO Metadata',
    description: 'Manage page-level metadata for search and sharing.',
    schemaKey: 'seoMetadata',
    fields: [
      { name: 'pageSlug', label: 'Page Slug', type: 'text' },
      { name: 'pageTitle', label: 'Page Title', type: 'text' },
      { name: 'metaDescription', label: 'Meta Description', type: 'textarea' },
      { name: 'keywords', label: 'Keywords (comma-separated)', type: 'text', serializeAs: 'csv' },
      { name: 'ogTitle', label: 'OG Title', type: 'text' },
      { name: 'ogDescription', label: 'OG Description', type: 'textarea' },
      { name: 'ogImageUrl', label: 'OG Image URL', type: 'text', serializeAs: 'optional' },
    ],
  },
};
