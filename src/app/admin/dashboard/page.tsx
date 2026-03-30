import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DashboardSummary = {
  projects: { published: number; draft: number };
  skills: { published: number; draft: number };
  experiences: { published: number; draft: number };
  testimonials: { published: number; draft: number };
  socialLinks: { published: number; draft: number };
};

export default async function AdminDashboardPage() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/admin/dashboard/summary`,
    {
      cache: 'no-store',
    }
  );

  const summary: DashboardSummary = response.ok
    ? await response.json()
    : {
        projects: { published: 0, draft: 0 },
        skills: { published: 0, draft: 0 },
        experiences: { published: 0, draft: 0 },
        testimonials: { published: 0, draft: 0 },
        socialLinks: { published: 0, draft: 0 },
      };

  const cards = [
    {
      title: 'Projects',
      href: '/admin/projects',
      published: summary.projects.published,
      draft: summary.projects.draft,
    },
    {
      title: 'Skills',
      href: '/admin/skills',
      published: summary.skills.published,
      draft: summary.skills.draft,
    },
    {
      title: 'Experiences',
      href: '/admin/experiences',
      published: summary.experiences.published,
      draft: summary.experiences.draft,
    },
    {
      title: 'Testimonials',
      href: '/admin/testimonials',
      published: summary.testimonials.published,
      draft: summary.testimonials.draft,
    },
    {
      title: 'Social Links',
      href: '/admin/social-links',
      published: summary.socialLinks.published,
      draft: summary.socialLinks.draft,
    },
  ];

  return (
    <section className="space-y-6">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
      <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
      <p className="max-w-2xl text-sm text-muted-foreground">
        Published and draft counts for the main portfolio content types.
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Badge>Published: {card.published}</Badge>
                <Badge variant="outline">Draft: {card.draft}</Badge>
              </div>
              <Link
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium transition-all hover:bg-muted hover:text-foreground"
                href={card.href}
              >
                Manage {card.title}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
