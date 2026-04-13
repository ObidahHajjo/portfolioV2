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
    <article className="terminal-shell rounded-xl p-6 transition hover:-translate-y-0.5 hover:border-primary/30">
      <Link href={`/case-studies/${caseStudy.slug}`} className="block">
        <h3 className="text-xl font-semibold text-foreground hover:text-primary hover:underline">
          {caseStudy.title}
        </h3>
      </Link>
      {caseStudy.project && (
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.22em] text-accent">
          Project: {caseStudy.project.title}
        </p>
      )}
      <p className="mt-4 terminal-copy">{excerpt}</p>
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
