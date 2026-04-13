import TerminalFrame from '@/components/theme/TerminalFrame';
import { getPublishedOpenSourceContributions, getSectionVisibility } from '@/lib/content/queries';

export async function OpenSourceSection() {
  const [contributions, visibility] = await Promise.all([
    getPublishedOpenSourceContributions(),
    getSectionVisibility('open_source'),
  ]);

  if (contributions.length === 0 || visibility?.enabled === false) {
    return null;
  }

  return (
    <section className="terminal-section" id="open-source">
      <div className="mx-auto max-w-6xl">
        <TerminalFrame title="~/public/open-source.log" label="Open Source">
          <h2 className="terminal-heading text-[clamp(1.9rem,3vw,3rem)]">Open Source</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contributions.map((contribution) => (
              <article key={contribution.id} className="terminal-shell rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {contribution.projectName}
                </h3>
                <span className="terminal-chip mt-3">{contribution.contributionType}</span>
                <p className="mt-3 terminal-copy line-clamp-3">{contribution.description}</p>
                {contribution.repositoryUrl && (
                  <a
                    href={contribution.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="terminal-link mt-4 inline-block text-sm"
                  >
                    View Repository
                  </a>
                )}
              </article>
            ))}
          </div>
        </TerminalFrame>
      </div>
    </section>
  );
}

export default OpenSourceSection;
