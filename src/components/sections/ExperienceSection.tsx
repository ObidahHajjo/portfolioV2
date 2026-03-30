import type { ExperienceData } from '@/types/portfolio';

interface ExperienceSectionProps {
  entries: ExperienceData[];
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function ExperienceSection({ entries }: ExperienceSectionProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section id="experience" aria-labelledby="experience-heading" className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h2 id="experience-heading" className="mb-8 text-3xl font-bold text-gray-900">
          Experience
        </h2>
        {entries.map((entry) => (
          <article
            className="mb-10 border-l-2 border-gray-200 pl-6"
            key={`${entry.company}-${entry.role}-${entry.displayOrder}`}
          >
            <h3 className="text-xl font-semibold text-gray-900">
              {entry.role} at {entry.company}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              <time dateTime={entry.startDate.toISOString()}>{formatDate(entry.startDate)}</time>
              {' – '}
              {entry.endDate ? (
                <time dateTime={entry.endDate.toISOString()}>{formatDate(entry.endDate)}</time>
              ) : (
                'Present'
              )}
            </p>
            <p className="mt-2 text-gray-700">{entry.description}</p>
            {entry.highlights.length > 0 && (
              <ul className="mt-3 list-inside list-disc space-y-1 text-gray-700">
                {entry.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
