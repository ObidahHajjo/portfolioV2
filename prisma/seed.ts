import { db } from '../src/lib/db'

async function main() {
  await db.contactReference.deleteMany()
  await db.project.deleteMany()
  await db.experienceEntry.deleteMany()
  await db.skill.deleteMany()
  await db.about.deleteMany()
  await db.hero.deleteMany()

  await db.hero.create({
    data: {
      name: 'Alex Carter',
      title: 'Senior Software Engineer',
      tagline:
        'Senior software engineer building resilient web platforms, thoughtful developer tools, and scalable product experiences.',
      ctaLabel: 'Get in touch',
      ctaHref: 'mailto:dev@example.com',
    },
  })

  await db.about.create({
    data: {
      bio: `I design and ship full-stack systems that keep product teams moving quickly without trading away reliability. My work spans product discovery, architecture, and hands-on delivery for customer-facing platforms.\n\nI care deeply about pragmatic engineering: strong foundations, measurable outcomes, and interfaces that feel clear under pressure. That usually means pairing modern TypeScript stacks with thoughtful data modeling, automation, and performance discipline.\n\nAcross startups and established teams, I have led major migrations, built internal tooling that removes delivery friction, and partnered closely with design and product to turn complex requirements into maintainable software.`,
    },
  })

  await db.skill.createMany({
    data: [
      { name: 'TypeScript', category: 'Languages', displayOrder: 0 },
      { name: 'Python', category: 'Languages', displayOrder: 1 },
      { name: 'SQL', category: 'Languages', displayOrder: 2 },
      { name: 'Next.js', category: 'Frameworks & Libraries', displayOrder: 0 },
      { name: 'React', category: 'Frameworks & Libraries', displayOrder: 1 },
      { name: 'Prisma', category: 'Frameworks & Libraries', displayOrder: 2 },
      { name: 'PostgreSQL', category: 'Infrastructure', displayOrder: 0 },
      { name: 'Docker', category: 'Infrastructure', displayOrder: 1 },
    ],
  })

  await db.experienceEntry.createMany({
    data: [
      {
        company: 'Northstar Labs',
        role: 'Principal Engineer',
        startDate: new Date('2022-04-01'),
        endDate: null,
        description:
          'Lead architecture and delivery for multi-product platform initiatives, improving release confidence, operability, and developer throughput across several teams.',
        displayOrder: 2,
      },
      {
        company: 'Signal Forge',
        role: 'Senior Full-Stack Engineer',
        startDate: new Date('2019-02-01'),
        endDate: new Date('2022-03-01'),
        description:
          'Built customer-facing analytics workflows and internal tooling that reduced time-to-insight and strengthened observability during rapid product growth.',
        displayOrder: 1,
      },
      {
        company: 'Atlas Digital',
        role: 'Software Engineer',
        startDate: new Date('2016-06-01'),
        endDate: new Date('2019-01-01'),
        description:
          'Delivered responsive web applications, API integrations, and maintainable UI systems for a portfolio of client and internal products.',
        displayOrder: 0,
      },
    ],
  })

  await db.project.createMany({
    data: [
      {
        title: 'Developer Operations Console',
        summary:
          'A unified internal platform for release tracking, incident visibility, and environment diagnostics used by engineering and support teams.',
        technologies: ['Next.js', 'TypeScript', 'PostgreSQL'],
        repoUrl: 'https://github.com/example/devops-console',
        demoUrl: null,
        displayOrder: 1,
      },
      {
        title: 'Insights Delivery Platform',
        summary:
          'A reporting workflow that turns complex operational data into role-specific dashboards and scheduled stakeholder updates.',
        technologies: ['React', 'Prisma', 'Docker'],
        repoUrl: null,
        demoUrl: 'https://example.com/insights-platform',
        displayOrder: 0,
      },
    ],
  })

  await db.contactReference.createMany({
    data: [
      { label: 'Email', href: 'mailto:dev@example.com', displayOrder: 0 },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dev-example', displayOrder: 1 },
    ],
  })
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
