import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { ChevronRight, ArrowRight } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function InsightDetail() {
  const { slug } = useParams();
  const { data: article } = trpc.insights.bySlug.useQuery({ slug: slug! });
  const { data: related = [] } = trpc.insights.list.useQuery({ limit: 3 });

  usePageMeta(
    article ? `${article.title} — SAparts Journal` : "Journal Article — SAparts",
    article ? (article.dek ?? article.title) : undefined
  );

  if (!article) {
    return (
      <div className="container pt-40 pb-24 text-center">
        <div className="eyebrow">One moment</div>
        <h2 className="serif-headline text-3xl mt-3">Loading article…</h2>
      </div>
    );
  }

  const others = (related as any[]).filter((a: any) => a.slug !== slug).slice(0, 3);

  return (
    <div className="pb-24">
      {/* Breadcrumb */}
      <div className="bg-ivory-warm hairline-bottom pt-24 pb-6">
        <div className="container flex items-center gap-2 text-xs tracking-wide text-muted-foreground">
          <Link href="/insights" className="hover:text-charcoal">Insights</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-charcoal">{article.category ?? "Article"}</span>
        </div>
      </div>

      {/* Masthead */}
      <article className="container pt-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="eyebrow">
            {article.category ?? "Feature"} · {article.readMinutes ?? 6} min read
          </div>
          <h1 className="serif-headline text-4xl lg:text-6xl mt-4 leading-[1.05]">
            {article.title}
          </h1>
          {article.dek && (
            <p className="mt-6 font-serif text-lg lg:text-xl text-muted-foreground leading-relaxed">
              {article.dek}
            </p>
          )}
          <div className="rule-gold mt-10 max-w-xs mx-auto" />
          {article.publishedAt && (
            <div className="mt-4 text-sm text-muted-foreground italic">
              SAparts Editorial ·{" "}
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          )}
        </div>

        {article.heroImageUrl && (
          <div className="mt-14 aspect-[16/9] overflow-hidden bg-ivory-warm max-w-6xl mx-auto">
            <img
              src={article.heroImageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {article.body && (
          <div className="mt-16 max-w-3xl mx-auto editorial-body font-serif text-lg leading-[1.85] text-charcoal/95">
            <Streamdown>{article.body}</Streamdown>
          </div>
        )}
      </article>

      {/* Related */}
      {others.length > 0 && (
        <section className="container mt-24 pt-16 hairline-top">
          <div className="eyebrow">Continue Reading</div>
          <h3 className="serif-headline text-3xl mt-3 mb-10">From the Dossier.</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {others.map((a: any) => (
              <Link key={a.id} href={`/insights/${a.slug}`} className="group block">
                  <div className="aspect-[4/3] overflow-hidden bg-ivory-warm border border-border">
                    {a.heroImageUrl && (
                      <img
                        src={a.heroImageUrl}
                        alt={a.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="pt-4">
                    <div className="eyebrow">
                      {a.category ?? "Article"} · {a.readMinutes ?? 5} min
                    </div>
                    <h4 className="serif-headline text-xl mt-2 leading-tight group-hover:text-brass-deep">
                      {a.title}
                    </h4>
                  </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/insights" className="inline-flex items-center gap-1 text-sm text-brass-deep font-medium hover:gap-2 transition-all">
              All insights <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
