import { ok, withAdminAuth } from '@/lib/admin/api-helpers';
import { db } from '@/lib/db';

export const GET = withAdminAuth(async () => {
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

  return ok({
    projects: { published: projectsPublished, draft: projectsDraft },
    skills: { published: skillsPublished, draft: skillsDraft },
    experiences: { published: experiencesPublished, draft: experiencesDraft },
    testimonials: { published: testimonialsPublished, draft: testimonialsDraft },
    socialLinks: { published: socialLinksPublished, draft: socialLinksDraft },
  });
});
