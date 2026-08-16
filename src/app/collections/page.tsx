import type { Metadata } from "next";
import Link from "next/link";
import { COLLECTIONS } from "@/lib/collections";
import { listingsForCollection } from "@/lib/data";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Collections",
  description: "Editorial collections of serviced apartments — executives, families, luxury, remote work, and extended stay.",
};

export default function CollectionsPage() {
  return (
    <div>
      <section className="hairline-bottom">
        <div className="container py-3 flex items-center gap-2 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <span>Collections</span>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-20">
          <span className="section-mark">§ 03</span>
          <h1 className="display text-[3rem] sm:text-[4.5rem] mt-5">
            Collections, <em>not catalogues.</em>
          </h1>
          <p className="mt-6 font-serif text-[1.1rem] text-muted-foreground max-w-2xl leading-relaxed">
            Editorial shortlists. Membership is inferred from amenities and unit types already on file — we do not invent counts, and an empty collection is an honest answer.
          </p>
        </div>
      </section>
      <section>
        <div className="container py-12 lg:py-16 space-y-6">
          {COLLECTIONS.map((c, i) => {
            const n = listingsForCollection(c.slug).length;
            return (
              <Link key={c.slug} href={`/collections/${c.slug}`} className="paper p-6 sm:p-8 grid lg:grid-cols-12 gap-6 group block">
                <div className="lg:col-span-3">
                  <div className="section-mark">{String(i + 1).padStart(2, "0")} · {c.symbol}</div>
                  <h2 className="display text-[2rem] mt-4 group-hover:text-forest">{c.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{c.subtitle}</p>
                </div>
                <div className="lg:col-span-7">
                  <p className="leading-relaxed text-muted-foreground">{c.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {c.tags.map((tag) => (
                      <span key={tag} className="tracker-muted border border-border px-2 py-1">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-2 flex flex-col justify-between items-start lg:items-end">
                  <div>
                    <div className="stat-value">{n}</div>
                    <div className="tracker-muted mt-1">on file</div>
                  </div>
                  <span className="tracker text-forest mt-4 inline-flex items-center gap-1">
                    Open <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
