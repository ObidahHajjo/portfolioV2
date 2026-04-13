import TerminalFrame from '@/components/theme/TerminalFrame';
import { getPublishedTalks, getSectionVisibility } from '@/lib/content/queries';

export async function TalksSection() {
  const [talks, visibility] = await Promise.all([
    getPublishedTalks(),
    getSectionVisibility('talks'),
  ]);

  if (talks.length === 0 || visibility?.enabled === false) {
    return null;
  }

  return (
    <section className="terminal-section" id="talks">
      <div className="mx-auto max-w-6xl">
        <TerminalFrame title="~/public/talks.log" label="Talks">
          <h2 className="terminal-heading text-[clamp(1.9rem,3vw,3rem)]">
            Talks &amp; Presentations
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {talks.map((talk) => (
              <article key={talk.id} className="terminal-shell rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground">{talk.title}</h3>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {talk.eventName} - {new Date(talk.talkDate).toLocaleDateString()}
                </p>
                <p className="mt-3 terminal-copy line-clamp-2">{talk.summary}</p>
                <div className="mt-4 flex flex-wrap gap-4">
                  {talk.recordingUrl && (
                    <a
                      href={talk.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terminal-link text-sm"
                    >
                      Watch Recording
                    </a>
                  )}
                  {talk.slidesUrl && (
                    <a
                      href={talk.slidesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terminal-link text-sm"
                    >
                      View Slides
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </TerminalFrame>
      </div>
    </section>
  );
}

export default TalksSection;
