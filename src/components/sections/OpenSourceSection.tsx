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
    <section className="py-16" id="open-source">
      <div className="container">
        <h2 className="text-2xl font-bold">Open Source</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contributions.map((contribution) => (
            <article key={contribution.id} className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold text-foreground">{contribution.projectName}</h3>
              <span className="mt-1 inline-block rounded bg-muted px-2 py-0.5 text-xs">
                {contribution.contributionType}
              </span>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                {contribution.description}
              </p>
              {contribution.repositoryUrl && (
                <a
                  href={contribution.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-primary hover:underline"
                >
                  View Repository →
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OpenSourceSection;
