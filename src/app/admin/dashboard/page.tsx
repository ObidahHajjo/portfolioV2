import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';

export default async function AdminDashboardPage() {
  const [
    projectsPublished,
    projectsDraft,
    skillsPublished,
    skillsDraft,
    experiencesPublished,
    experiencesDraft,
    testimonialsPublished,
    testimonialsDraft,
    socialLinksPublished,
    socialLinksDraft,
  ] = await Promise.all([
    db.project.count({ where: { published: true } }),
    db.project.count({ where: { published: false } }),
    db.skill.count({ where: { published: true } }),
    db.skill.count({ where: { published: false } }),
    db.experience.count({ where: { published: true } }),
    db.experience.count({ where: { published: false } }),
    db.testimonial.count({ where: { published: true } }),
    db.testimonial.count({ where: { published: false } }),
    db.socialLink.count({ where: { published: true } }),
    db.socialLink.count({ where: { published: false } }),
  ]);

  const cards = [
    {
      title: 'Projects',
      href: '/admin/projects',
      published: projectsPublished,
      draft: projectsDraft,
    },
    { title: 'Skills', href: '/admin/skills', published: skillsPublished, draft: skillsDraft },
    {
      title: 'Experiences',
      href: '/admin/experiences',
      published: experiencesPublished,
      draft: experiencesDraft,
    },
    {
      title: 'Testimonials',
      href: '/admin/testimonials',
      published: testimonialsPublished,
      draft: testimonialsDraft,
    },
    {
      title: 'Social Links',
      href: '/admin/social-links',
      published: socialLinksPublished,
      draft: socialLinksDraft,
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
              <Button variant="outline" render={<Link href={card.href} />}>
                Manage {card.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
