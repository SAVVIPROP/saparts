import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInsight, getInsights } from "@/lib/editorial";

export function generateStaticParams() {
  return getInsights().map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const essay = getInsight(slug);
  if (!essay) return { title: "Journal" };
  return { title: essay.title, description: essay.dek };
}

export default async function InsightPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const essay = getInsight(slug);
  if (!essay) notFound();
  const others = getInsights().filter((i) => i.slug !== slug).slice(0, 3);

  return (
    <div>
      <section className="hairline-bottom">
        <div className="container py-3 flex items-center gap-2 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <Link href="/insights" className="hover:text-forest">Journal</Link>
          <span>/</span>
          <span>{essay.category}</span>
        </div>
      </section>
      <article className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-3">
          <div className="tracker-muted">{essay.category}</div>
          <div className="tracker-muted mt-2">{essay.publishedAt}</div>
          <div className="tracker-muted mt-2">{essay.readMinutes} minute read</div>
        </aside>
        <div className="lg:col-span-9">
          <h1 className="display text-[2.4rem] sm:text-[3.4rem] leading-[1.05]">{essay.title}</h1>
          <p className="mt-6 font-serif text-[1.2rem] text-muted-foreground leading-relaxed">{essay.dek}</p>
          <div className="editorial-body font-serif mt-10">
            {essay.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </article>
      {others.length > 0 && (
        <section className="container pb-20">
          <div className="tracker-muted mb-4">Also in the journal</div>
          <div className="grid md:grid-cols-3 gap-4">
            {others.map((o) => (
              <Link key={o.slug} href={`/insights/${o.slug}`} className="paper p-5 block hover:border-charcoal">
                <div className="tracker-muted">{o.category}</div>
                <h3 className="font-serif text-xl mt-2">{o.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
