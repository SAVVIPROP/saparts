import type { Metadata } from "next";
import Link from "next/link";
import { getInsights } from "@/lib/editorial";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Journal",
  description: "The SAparts Journal — editorial intelligence on corporate mobility and the serviced apartment market.",
};

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const all = getInsights();
  const essays = cat
    ? all.filter((e) => e.category.toLowerCase().includes(cat.toLowerCase()) || e.slug.includes(cat.toLowerCase()))
    : all;
  const featured = essays.find((e) => e.featured) ?? essays[0];
  const rest = essays.filter((e) => e.slug !== featured?.slug);

  return (
    <div>
      <section className="hairline-bottom">
        <div className="container py-3 flex items-center gap-2 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <span>Journal</span>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <span className="section-mark">§ 06</span>
            <h1 className="display text-[3rem] sm:text-[4.5rem] mt-5">
              Intelligence, <em>not brochures.</em>
            </h1>
            <p className="mt-6 font-serif text-[1.1rem] text-muted-foreground max-w-2xl leading-relaxed">
              Market notes, relocation dossiers, and methodology. Five essays are on file. We do not invent a newsroom to fill the folio.
            </p>
          </div>
          <div className="lg:col-span-4 paper p-6">
            <div className="stat-label">Volume I</div>
            <div className="stat-value mt-1">{all.length} essays</div>
            <div className="tracker-muted mt-3">Conflicts disclosed</div>
          </div>
        </div>
      </section>
      {featured && (
        <section className="hairline-bottom">
          <div className="container py-12">
            <Link href={`/insights/${featured.slug}`} className="paper p-8 sm:p-12 grid lg:grid-cols-12 gap-8 group block">
              <div className="lg:col-span-3">
                <div className="tracker-muted">{featured.category}</div>
                <div className="tracker-muted mt-2">{featured.readMinutes} min · {featured.publishedAt}</div>
              </div>
              <div className="lg:col-span-9">
                <h2 className="display text-[2rem] sm:text-[2.6rem] group-hover:text-forest">{featured.title}</h2>
                <p className="mt-4 font-serif text-muted-foreground leading-relaxed">{featured.dek}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-forest tracker">
                  Read the essay <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}
      <section>
        <div className="container py-12 space-y-4">
          {rest.map((e) => (
            <Link key={e.slug} href={`/insights/${e.slug}`} className="paper p-6 sm:p-8 grid lg:grid-cols-12 gap-6 group block">
              <div className="lg:col-span-3">
                <div className="tracker-muted">{e.category}</div>
                <div className="tracker-muted mt-1">{e.readMinutes} min</div>
              </div>
              <div className="lg:col-span-9">
                <h3 className="display text-[1.6rem] group-hover:text-forest">{e.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{e.dek}</p>
              </div>
            </Link>
          ))}
          {essays.length === 0 && (
            <div className="paper p-8">No essays in this category.</div>
          )}
        </div>
      </section>
    </div>
  );
}
