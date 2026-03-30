import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getCaseStudyBySlug } from '@/lib/content/queries';
import { MetricCallout } from '@/components/sections/MetricCallout';

export const dynamic = 'force-dynamic';

interface CaseStudyPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const caseStudy = await getCaseStudyBySlug(params.slug);

  if (!caseStudy) {
    return { title: 'Case Study Not Found' };
  }

  return {
    title: caseStudy.title,
    description: caseStudy.outcomes.substring(0, 160),
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const caseStudy = await getCaseStudyBySlug(params.slug);

  if (!caseStudy) {
    notFound();
  }

  return (
    <div className="container py-12">
      <Link href="/case-studies" className="text-sm text-muted-foreground hover:underline">
        ← All Case Studies
      </Link>

      <article className="mt-6">
        <h1 className="text-3xl font-bold">{caseStudy.title}</h1>

        {caseStudy.project && (
          <p className="mt-2 text-muted-foreground">
            Project:{' '}
            <Link href={`/#projects`} className="text-primary hover:underline">
              {caseStudy.project.title}
            </Link>
          </p>
        )}

        <section className="mt-8">
          <h2 className="text-xl font-semibold">The Challenge</h2>
          <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{caseStudy.challenge}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">The Solution</h2>
          <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{caseStudy.solution}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">The Outcome</h2>
          <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{caseStudy.outcomes}</p>
        </section>

        {caseStudy.architectureNotes && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold">Architecture &amp; Decisions</h2>
            <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
              {caseStudy.architectureNotes}
            </p>
          </section>
        )}

        {caseStudy.metrics.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold">Key Metrics</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {caseStudy.metrics.map((metric) => (
                <MetricCallout key={metric.id} {...metric} />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
