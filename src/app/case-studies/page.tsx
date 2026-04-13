import { Metadata } from 'next';
import Link from 'next/link';

import { CaseStudyCard } from '@/components/sections/CaseStudyCard';
import TerminalFrame from '@/components/theme/TerminalFrame';
import { getPublishedCaseStudies } from '@/lib/content/queries';
import { resolveMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const resolved = await resolveMetadata('/case-studies');

  return {
    title: resolved.title,
    description: resolved.description,
    alternates: {
      canonical: resolved.canonicalUrl,
    },
    openGraph: {
      type: 'website',
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

export default async function CaseStudiesPage() {
  const caseStudies = await getPublishedCaseStudies();

  if (caseStudies.length === 0) {
    return (
      <div className="public-theme min-h-screen">
        <section className="terminal-section">
          <div className="mx-auto max-w-5xl">
            <TerminalFrame title="~/public/case-studies.empty" label="Case Studies">
              <h1 className="terminal-heading text-[clamp(1.9rem,3vw,3rem)]">Case Studies</h1>
              <p className="mt-4 terminal-copy">No case studies available yet.</p>
              <Link href="/" className="terminal-button-secondary focus-ring mt-6 inline-flex">
                Back to home
              </Link>
            </TerminalFrame>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="public-theme min-h-screen">
      <section className="terminal-section">
        <div className="mx-auto max-w-6xl">
          <TerminalFrame
            title="~/public/case-studies.index"
            label={`${caseStudies.length} entries`}
          >
            <h1 className="terminal-heading text-[clamp(1.9rem,3vw,3rem)]">Case Studies</h1>
            <p className="mt-4 max-w-3xl terminal-copy">
              Detailed explorations of engineering challenges, solutions, and outcomes presented
              with a calmer reading surface than the homepage.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {caseStudies.map((caseStudy) => (
                <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />
              ))}
            </div>
          </TerminalFrame>
        </div>
      </section>
    </div>
  );
}
