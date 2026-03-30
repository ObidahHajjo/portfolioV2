import { getPublishedArticles, getSectionVisibility } from '@/lib/content/queries';

export const dynamic = 'force-dynamic';

export async function ArticlesSection() {
  const [articles, visibility] = await Promise.all([
    getPublishedArticles(),
    getSectionVisibility('articles'),
  ]);

  if (articles.length === 0 || visibility?.enabled === false) {
    return null;
  }

  return (
    <section className="py-16" id="articles">
      <div className="container">
        <h2 className="text-2xl font-bold">Writing</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article key={article.id} className="rounded-lg border bg-card p-6">
              <a
                href={article.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:underline"
              >
                {article.title}
              </a>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{article.summary}</p>
              {article.publishedAt && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ArticlesSection;
