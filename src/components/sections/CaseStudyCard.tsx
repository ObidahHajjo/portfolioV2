import Link from 'next/link';
import type { CaseStudy } from '@prisma/client';
import { MetricCallout } from './MetricCallout';

interface CaseStudyCardProps {
  caseStudy: CaseStudy & {
    metrics: { id: string; label: string; value: string; unit: string | null }[];
    project?: { id: string; title: string } | null;
  };
}

export function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  const excerpt =
    caseStudy.outcomes.substring(0, 150) + (caseStudy.outcomes.length > 150 ? '...' : '');
  const displayMetrics = caseStudy.metrics.slice(0, 3);

  return (
    <article className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-lg">
      <Link href={`/case-studies/${caseStudy.slug}`} className="block">
        <h3 className="text-xl font-semibold hover:underline">{caseStudy.title}</h3>
      </Link>
      {caseStudy.project && (
        <p className="mt-1 text-sm text-muted-foreground">Project: {caseStudy.project.title}</p>
      )}
      <p className="mt-3 text-sm text-muted-foreground">{excerpt}</p>
      {displayMetrics.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {displayMetrics.map((metric) => (
            <MetricCallout key={metric.id} {...metric} />
          ))}
        </div>
      )}
    </article>
  );
}
