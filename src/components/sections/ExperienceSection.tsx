import TerminalFrame from '@/components/theme/TerminalFrame';
import type { ExperienceData } from '@/types/portfolio';

interface ExperienceSectionProps {
  entries: ExperienceData[];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function ExperienceSection({ entries }: ExperienceSectionProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section id="experience" aria-labelledby="experience-heading" className="terminal-section">
      <div className="mx-auto max-w-4xl">
        <TerminalFrame title="~/public/experience.log" label="Experience">
          <h2 id="experience-heading" className="terminal-heading text-[clamp(1.9rem,3vw,3rem)]">
            Experience
          </h2>
          <div className="mt-8 space-y-6">
            {entries.map((entry) => (
              <article
                className="terminal-shell rounded-xl border-l-2 border-l-primary p-6"
                key={`${entry.company}-${entry.role}-${entry.displayOrder}`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {entry.role} at {entry.company}
                    </h3>
                    <p className="mt-2 terminal-copy">{entry.description}</p>
                  </div>
                  <p className="terminal-chip shrink-0">
                    <time dateTime={entry.startDate.toISOString()}>
                      {formatDate(entry.startDate)}
                    </time>
                    {' - '}
                    {entry.endDate ? (
                      <time dateTime={entry.endDate.toISOString()}>
                        {formatDate(entry.endDate)}
                      </time>
                    ) : (
                      'Present'
                    )}
                  </p>
                </div>
                {entry.highlights.length > 0 && (
                  <ul className="mt-4 space-y-2 terminal-copy">
                    {entry.highlights.map((highlight) => (
                      <li className="flex gap-3" key={highlight}>
                        <span className="text-primary">&gt;</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </TerminalFrame>
      </div>
    </section>
  );
}
