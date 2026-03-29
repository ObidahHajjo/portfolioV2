import Link from 'next/link';
import { notFound } from 'next/navigation';

import { requireSession } from '@/lib/session';
import { db } from '@/lib/db';

export default async function ProjectPreviewPage({ params }: { params: { id: string } }) {
  const session = await requireSession();

  if (session instanceof Response) {
    notFound();
  }

  const project = await db.project.findUnique({
    where: { id: params.id },
    include: {
      skills: { include: { skill: true } },
      caseStudy: true,
      mediaAsset: true,
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="rounded-xl border bg-background p-4">
          <p className="text-sm font-medium text-foreground">
            Preview mode — this content is not published.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.published
              ? 'This item is currently published.'
              : 'This item is currently a draft.'}
          </p>
          <Link
            className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline"
            href={`/admin/projects/${project.id}`}
          >
            Back to project editor
          </Link>
        </div>

        <article className="rounded-2xl border bg-background p-8 shadow-sm">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Project Preview
            </p>
            <h1 className="text-4xl font-semibold text-foreground">{project.title}</h1>
            <p className="text-lg text-muted-foreground">{project.summary}</p>
          </div>

          {project.mediaAsset ? (
            <div className="mt-8 rounded-xl border bg-muted/20 p-4">
              <a
                className="text-sm text-primary underline-offset-4 hover:underline"
                href={project.mediaAsset.storageUrl}
                target="_blank"
              >
                Open attached media
              </a>
            </div>
          ) : null}

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold">Skills</h2>
            <ul className="flex flex-wrap gap-2">
              {project.skills.map((entry) => (
                <li key={entry.skillId} className="rounded-full border px-3 py-1 text-sm">
                  {entry.skill.name}
                </li>
              ))}
            </ul>
          </section>

          {project.caseStudy ? (
            <section className="mt-8 grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="font-semibold">Challenge</h3>
                <p className="mt-2 text-sm text-muted-foreground">{project.caseStudy.challenge}</p>
              </div>
              <div>
                <h3 className="font-semibold">Solution</h3>
                <p className="mt-2 text-sm text-muted-foreground">{project.caseStudy.solution}</p>
              </div>
              <div>
                <h3 className="font-semibold">Outcomes</h3>
                <p className="mt-2 text-sm text-muted-foreground">{project.caseStudy.outcomes}</p>
              </div>
            </section>
          ) : null}
        </article>
      </div>
    </main>
  );
}
