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
    <section className="py-16" id="talks">
      <div className="container">
        <h2 className="text-2xl font-bold">Talks &amp; Presentations</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {talks.map((talk) => (
            <article key={talk.id} className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold text-foreground">{talk.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {talk.eventName} • {new Date(talk.talkDate).toLocaleDateString()}
              </p>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{talk.summary}</p>
              <div className="mt-3 flex gap-4">
                {talk.recordingUrl && (
                  <a
                    href={talk.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Watch Recording
                  </a>
                )}
                {talk.slidesUrl && (
                  <a
                    href={talk.slidesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Slides
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TalksSection;
