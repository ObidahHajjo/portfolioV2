import { db } from '../src/lib/db';

async function main() {
  await db.caseStudy.deleteMany();
  await db.projectSkill.deleteMany();
  await db.project.deleteMany();
  await db.testimonial.deleteMany();
  await db.experience.deleteMany();
  await db.socialLink.deleteMany();
  await db.skill.deleteMany();
  await db.seoMetadata.deleteMany();
  await db.mediaAsset.deleteMany();
  await db.contactSettings.deleteMany();
  await db.profile.deleteMany();
  await db.hero.deleteMany();

  await db.profile.upsert({
    where: { singletonKey: 'singleton' },
    update: {
      fullName: 'Alex Carter',
      tagline: 'Senior Software Engineer',
      bio: 'I design and ship full-stack systems that keep product teams moving quickly without trading away reliability. My work spans product discovery, architecture, and hands-on delivery for customer-facing platforms.\n\nI care deeply about pragmatic engineering: strong foundations, measurable outcomes, and interfaces that feel clear under pressure. That usually means pairing modern TypeScript stacks with thoughtful data modeling, automation, and performance discipline.\n\nAcross startups and established teams, I have led major migrations, built internal tooling that removes delivery friction, and partnered closely with design and product to turn complex requirements into maintainable software.',
      contactEmail: 'alex@example.com',
      avatarUrl: 'https://images.example.com/alex-carter.jpg',
    },
    create: {
      singletonKey: 'singleton',
      fullName: 'Alex Carter',
      tagline: 'Senior Software Engineer',
      bio: 'I design and ship full-stack systems that keep product teams moving quickly without trading away reliability. My work spans product discovery, architecture, and hands-on delivery for customer-facing platforms.\n\nI care deeply about pragmatic engineering: strong foundations, measurable outcomes, and interfaces that feel clear under pressure. That usually means pairing modern TypeScript stacks with thoughtful data modeling, automation, and performance discipline.\n\nAcross startups and established teams, I have led major migrations, built internal tooling that removes delivery friction, and partnered closely with design and product to turn complex requirements into maintainable software.',
      contactEmail: 'alex@example.com',
      avatarUrl: 'https://images.example.com/alex-carter.jpg',
    },
  });

  await db.hero.upsert({
    where: { singletonKey: 'singleton' },
    update: {
      headline: 'Building resilient products that teams can trust.',
      subHeadline:
        'Senior software engineer designing modern web platforms, internal tooling, and portfolio-grade product experiences.',
      ctaText: 'View my work',
      ctaHref: '#projects',
    },
    create: {
      singletonKey: 'singleton',
      headline: 'Building resilient products that teams can trust.',
      subHeadline:
        'Senior software engineer designing modern web platforms, internal tooling, and portfolio-grade product experiences.',
      ctaText: 'View my work',
      ctaHref: '#projects',
    },
  });

  await db.contactSettings.upsert({
    where: { singletonKey: 'singleton' },
    update: {
      contactEmail: 'alex@example.com',
      formEnabled: true,
      ctaMessage: "Let's work together. Reach out below.",
    },
    create: {
      singletonKey: 'singleton',
      contactEmail: 'alex@example.com',
      formEnabled: true,
      ctaMessage: "Let's work together. Reach out below.",
    },
  });

  await db.socialLink.createMany({
    data: [
      {
        platform: 'LinkedIn',
        url: 'https://www.linkedin.com/in/alex-carter',
        displayOrder: 20,
        published: true,
        isVisible: true,
      },
      {
        platform: 'GitHub',
        url: 'https://github.com/alex-carter',
        displayOrder: 10,
        published: true,
        isVisible: true,
      },
      {
        platform: 'Email',
        url: 'mailto:alex@example.com',
        displayOrder: 30,
        published: true,
        isVisible: true,
      },
    ],
  });

  await db.experience.createMany({
    data: [
      {
        company: 'Northstar Labs',
        role: 'Principal Engineer',
        startDate: new Date('2022-04-01'),
        endDate: null,
        description:
          'Lead architecture and delivery for multi-product platform initiatives, improving release confidence, operability, and developer throughput across several teams.',
        highlights: [
          'Guided a platform modernization program spanning several internal products.',
          'Introduced delivery automation that improved release confidence and incident visibility.',
        ],
        displayOrder: 10,
        published: true,
        isVisible: true,
      },
      {
        company: 'Signal Forge',
        role: 'Senior Full-Stack Engineer',
        startDate: new Date('2019-02-01'),
        endDate: new Date('2022-03-01'),
        description:
          'Built customer-facing analytics workflows and internal tooling that reduced time-to-insight and strengthened observability during rapid product growth.',
        highlights: [
          'Delivered role-specific dashboards for operations and support teams.',
          'Expanded tracing and alerting coverage across critical product workflows.',
        ],
        displayOrder: 20,
        published: true,
        isVisible: true,
      },
      {
        company: 'Atlas Digital',
        role: 'Software Engineer',
        startDate: new Date('2016-06-01'),
        endDate: new Date('2019-01-01'),
        description:
          'Delivered responsive web applications, API integrations, and maintainable UI systems for a portfolio of client and internal products.',
        highlights: ['Partnered closely with product and design on fast-moving client delivery.'],
        displayOrder: 30,
        published: false,
        isVisible: true,
      },
    ],
  });

  await db.skill.createMany({
    data: [
      {
        name: 'Prisma',
        category: 'Frameworks',
        proficiency: 'advanced',
        displayOrder: 30,
        published: true,
        isVisible: true,
      },
      {
        name: 'TypeScript',
        category: 'Languages',
        proficiency: 'expert',
        displayOrder: 10,
        published: true,
        isVisible: true,
      },
      {
        name: 'PostgreSQL',
        category: 'Data',
        proficiency: 'advanced',
        displayOrder: 20,
        published: true,
        isVisible: true,
      },
      {
        name: 'GraphQL',
        category: 'APIs',
        proficiency: 'advanced',
        displayOrder: 40,
        published: true,
        isVisible: false,
      },
    ],
  });

  await db.testimonial.createMany({
    data: [
      {
        authorName: 'Jordan Lee',
        authorRole: 'VP of Engineering',
        authorCompany: 'Northstar Labs',
        quote:
          'Alex brings strong technical judgment, keeps teams aligned, and consistently turns messy product problems into dependable systems.',
        displayOrder: 10,
        published: true,
        isVisible: true,
      },
      {
        authorName: 'Mina Patel',
        authorRole: 'Product Director',
        authorCompany: 'Signal Forge',
        quote:
          'Working with Alex meant we could move fast on strategy while still trusting the implementation details were handled with care.',
        displayOrder: 20,
        published: true,
        isVisible: true,
      },
      {
        authorName: 'Rafael Gomez',
        authorRole: 'CTO',
        authorCompany: 'Atlas Digital',
        quote:
          'Alex created the technical foundation we needed, but also coached the team through the delivery challenges that came with it.',
        displayOrder: 30,
        published: false,
        isVisible: true,
      },
      {
        authorName: 'Sam Brooks',
        authorRole: 'Founder',
        authorCompany: 'Studio Eleven',
        quote:
          "The quality of Alex's systems thinking made a clear difference in how confidently we could scale the product.",
        displayOrder: 40,
        published: true,
        isVisible: false,
      },
    ],
  });

  const [firstProject, secondProject] = await Promise.all([
    db.project.create({
      data: {
        title: 'Developer Operations Console',
        summary:
          'A unified internal platform for release tracking, incident visibility, and environment diagnostics used by engineering and support teams.',
        repoUrl: 'https://github.com/example/devops-console',
        demoUrl: null,
        mediaAssetId: null,
        displayOrder: 10,
        published: true,
        isVisible: true,
      },
    }),
    db.project.create({
      data: {
        title: 'Insights Delivery Platform',
        summary:
          'A reporting workflow that turns complex operational data into role-specific dashboards and scheduled stakeholder updates.',
        repoUrl: null,
        demoUrl: 'https://example.com/insights-platform',
        mediaAssetId: null,
        displayOrder: 20,
        published: true,
        isVisible: true,
      },
    }),
  ]);

  const mediaAsset = await db.mediaAsset.create({
    data: {
      fileName: 'developer-operations-console-cover.jpg',
      storageUrl: 'https://minio.example.com/portfolio/projects/devops-console-cover.jpg',
      fileType: 'image/jpeg',
      ownerType: 'project',
      ownerId: firstProject.id,
    },
  });

  await db.project.update({
    where: { id: firstProject.id },
    data: { mediaAssetId: mediaAsset.id },
  });

  const skills = await db.skill.findMany({
    where: {
      name: { in: ['Prisma', 'TypeScript', 'PostgreSQL'] },
    },
  });

  const skillIdByName = new Map(skills.map((skill) => [skill.name, skill.id]));

  await db.projectSkill.createMany({
    data: [
      {
        projectId: firstProject.id,
        skillId: skillIdByName.get('TypeScript')!,
      },
      {
        projectId: firstProject.id,
        skillId: skillIdByName.get('Prisma')!,
      },
      {
        projectId: secondProject.id,
        skillId: skillIdByName.get('TypeScript')!,
      },
      {
        projectId: secondProject.id,
        skillId: skillIdByName.get('PostgreSQL')!,
      },
    ],
  });

  await db.caseStudy.create({
    data: {
      projectId: firstProject.id,
      challenge:
        'Engineering teams lacked a unified operational view, forcing support and delivery workflows across several disconnected tools.',
      solution:
        'Designed a consolidated operations console with shared release telemetry, diagnostics, and incident context in one workflow.',
      outcomes:
        'Reduced incident triage time and gave release managers a single source of truth during high-pressure launches.',
      mediaAssetIds: [mediaAsset.id],
    },
  });

  await db.seoMetadata.createMany({
    data: [
      {
        pageSlug: '/',
        pageTitle: 'Alex Carter | Senior Software Engineer',
        metaDescription:
          'Portfolio of Alex Carter, a senior software engineer building resilient platforms and product experiences.',
        keywords: ['software engineer', 'portfolio', 'typescript'],
        ogTitle: 'Alex Carter | Senior Software Engineer',
        ogDescription:
          'Explore projects, experience, and case studies from Alex Carter, senior software engineer.',
        ogImageUrl: 'https://images.example.com/og-home.jpg',
      },
      {
        pageSlug: '/projects',
        pageTitle: 'Projects | Alex Carter',
        metaDescription: 'Selected projects and case studies from Alex Carter.',
        keywords: ['projects', 'case studies', 'engineering'],
        ogTitle: 'Projects | Alex Carter',
        ogDescription: 'Selected engineering projects and delivery case studies.',
        ogImageUrl: 'https://images.example.com/og-projects.jpg',
      },
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
