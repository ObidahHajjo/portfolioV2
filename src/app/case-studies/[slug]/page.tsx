import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MetricCallout } from '@/components/sections/MetricCallout';
import TerminalFrame from '@/components/theme/TerminalFrame';
import { getCaseStudyBySlug } from '@/lib/content/queries';
import { resolveMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';

interface CaseStudyPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const caseStudy = await getCaseStudyBySlug(params.slug);

  if (!caseStudy) {
    return { title: 'Case Study Not Found' };
  }

  const pagePath = `/case-studies/${params.slug}`;
  const descriptionFallback =
    caseStudy.outcomes.length > 160 ? `${caseStudy.outcomes.slice(0, 157)}...` : caseStudy.outcomes;
  const resolved = await resolveMetadata(pagePath, {
    title: caseStudy.title,
    description: descriptionFallback,
  });

  return {
    title: resolved.title,
    description: resolved.description,
    alternates: {
      canonical: resolved.canonicalUrl,
    },
    openGraph: {
      type: 'article',
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      url: resolved.canonicalUrl,
      images: [{ url: resolved.ogImageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      images: [resolved.ogImageUrl],
    },
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const caseStudy = await getCaseStudyBySlug(params.slug);

  if (!caseStudy) {
    notFound();
  }

  return (
    <div className="public-theme min-h-screen">
      <section className="terminal-section">
        <div className="mx-auto max-w-5xl">
          <Link href="/case-studies" className="terminal-button-secondary focus-ring inline-flex">
            Back to case studies
          </Link>

          <article className="mt-6">
            <TerminalFrame title={`~/public/case-studies/${params.slug}.md`} label="Long-form">
              <h1 className="terminal-heading text-[clamp(2rem,3.4vw,3.5rem)]">
                {caseStudy.title}
              </h1>

              {caseStudy.project && (
                <p className="mt-4 font-mono text-xs uppercase tracking-[0.24em] text-accent">
                  Project:{' '}
                  <Link href={`/#projects`} className="terminal-link">
                    {caseStudy.project.title}
                  </Link>
                </p>
              )}

              <section className="mt-10">
                <h2 className="text-2xl font-semibold text-foreground">The Challenge</h2>
                <p className="mt-3 whitespace-pre-wrap terminal-copy">{caseStudy.challenge}</p>
              </section>

              <section className="mt-10">
                <h2 className="text-2xl font-semibold text-foreground">The Solution</h2>
                <p className="mt-3 whitespace-pre-wrap terminal-copy">{caseStudy.solution}</p>
              </section>

              <section className="mt-10">
                <h2 className="text-2xl font-semibold text-foreground">The Outcome</h2>
                <p className="mt-3 whitespace-pre-wrap terminal-copy">{caseStudy.outcomes}</p>
              </section>

              {caseStudy.architectureNotes && (
                <section className="mt-10">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Architecture &amp; Decisions
                  </h2>
                  <p className="mt-3 whitespace-pre-wrap terminal-copy">
                    {caseStudy.architectureNotes}
                  </p>
                </section>
              )}

              {caseStudy.metrics.length > 0 && (
                <section className="mt-10">
                  <h2 className="text-2xl font-semibold text-foreground">Key Metrics</h2>
                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {caseStudy.metrics.map((metric) => (
                      <MetricCallout key={metric.id} {...metric} />
                    ))}
                  </div>
                </section>
              )}
            </TerminalFrame>
          </article>
        </div>
      </section>
    </div>
  );
}
