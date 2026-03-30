import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getPublishedCaseStudies } from '@/lib/content/queries';
import { CaseStudyCard } from '@/components/sections/CaseStudyCard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Case Studies',
  description:
    'Detailed case studies showcasing problem-solving, engineering decisions, and measurable impact.',
};

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
