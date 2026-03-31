import { Metadata } from 'next';
import Link from 'next/link';

import { getPublishedCaseStudies } from '@/lib/content/queries';
import { resolveMetadata } from '@/lib/seo/metadata';
import { CaseStudyCard } from '@/components/sections/CaseStudyCard';

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
      <div className="container py-12">
        <h1 className="text-3xl font-bold">Case Studies</h1>
        <p className="mt-4 text-muted-foreground">No case studies available yet.</p>
        <Link href="/" className="mt-4 inline-block text-primary hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">Case Studies</h1>
      <p className="mt-2 text-muted-foreground">
        Detailed explorations of engineering challenges, solutions, and outcomes.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {caseStudies.map((caseStudy) => (
          <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />
        ))}
      </div>
    </div>
  );
}
