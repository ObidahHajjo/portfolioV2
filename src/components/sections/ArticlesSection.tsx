import TerminalFrame from '@/components/theme/TerminalFrame';
import { getPublishedArticles, getSectionVisibility } from '@/lib/content/queries';

export async function ArticlesSection() {
  const [articles, visibility] = await Promise.all([
    getPublishedArticles(),
    getSectionVisibility('articles'),
  ]);

  if (articles.length === 0 || visibility?.enabled === false) {
    return null;
  }

  return (
    <section className="terminal-section" id="articles">
      <div className="mx-auto max-w-6xl">
        <TerminalFrame title="~/public/articles.json" label="Writing">
          <h2 className="terminal-heading text-[clamp(1.9rem,3vw,3rem)]">Writing</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article key={article.id} className="terminal-shell rounded-xl p-6">
                <a
                  href={article.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-foreground hover:text-primary hover:underline"
                >
                  {article.title}
                </a>
                <p className="mt-3 terminal-copy line-clamp-3">{article.summary}</p>
                {article.publishedAt && (
                  <p className="mt-3 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                )}
              </article>
            ))}
          </div>
        </TerminalFrame>
      </div>
    </section>
  );
}

export default ArticlesSection;
