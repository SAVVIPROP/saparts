import { Link } from "wouter";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { usePageMeta } from "@/hooks/usePageMeta";

const CATEGORIES = ["All", "Relocation", "Lifestyle", "Corporate Mobility", "City Guides", "Methodology"] as const;

export default function Insights() {
  const { data: featured = [] } = trpc.insights.list.useQuery({ featured: true, limit: 3 });
  const { data: articles = [] } = trpc.insights.list.useQuery({ limit: 50 });
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");

  usePageMeta(
    "Journal — SAparts",
    "The SAparts Journal: editorial intelligence on corporate mobility, long-stay relocation, city guides, and the global serviced apartment market."
  );

  const lede = (featured as any[])[0] ?? (articles as any[])[0];
  const list = useMemo(() => {
    const base = (articles as any[]).filter((a) => a.id !== lede?.id);
    if (cat === "All") return base;
    return base.filter((a) => (a.category || "").toLowerCase().startsWith(cat.toLowerCase()));
  }, [articles, cat, lede]);

  return (
    <div>
      {/* Masthead */}
      <section className="hairline-bottom">
        <div className="container py-10 sm:py-14 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="section-mark">§ 06</span>
              <span className="eyebrow">The Journal · Volume I</span>
            </div>
            <h1 className="display text-[2.4rem] sm:text-[3rem] md:text-[4rem] lg:text-[5rem]">
              Intelligence, <em>not brochures.</em>
            </h1>
            <p
              className="mt-7 text-[1.05rem] text-muted-foreground max-w-2xl leading-[1.7]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Market intelligence, relocation analytics and the editorial dossiers we write for corporate mobility teams and long-stay professionals. The global serviced apartment market is projected to reach $420.9 billion by 2034. [Precedence Research, 2025] Published on a deliberate schedule, with every claim traceable to a verifiable source.
            </p>
          </div>
          <div className="lg:col-span-4 paper p-5 sm:p-6 lg:p-7 grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-5 sm:gap-y-7">
            <Stat label="Essays published" value={(articles as any[]).length} />
            <Stat label="Featured" value={(featured as any[]).length} />
            <Stat label="Cadence" value="Bi-weekly" raw />
            <Stat label="Conflicts" value="Disclosed" raw />
          </div>
        </div>
      </section>

      {/* Lede article */}
      {lede && (
        <section className="hairline-bottom">
          <div className="container py-10 sm:py-14 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-7">
              <Link href={`/insights/${lede.slug}`} className="group block">
                <div className="aspect-[16/10] bg-ivory-warm overflow-hidden border border-border">
                  {lede.heroImageUrl && (
                    <img
                      src={lede.heroImageUrl}
                      alt={lede.title}
                      className="w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-[1.04]"
                    />
                  )}
                </div>
                <div className="fig-caption mt-3">
                  <strong>Fig. {String(1).padStart(2, "0")}</strong> — Lede photograph for the current
                  volume's featured essay.
                </div>
              </Link>
            </div>
            <div className="lg:col-span-5">
              <div className="tracker">§ 06.01 · Lede</div>
              <Link href={`/insights/${lede.slug}`} className="block group">
                <h2 className="display text-[1.9rem] sm:text-[2.4rem] lg:text-[3rem] mt-4 leading-[1.1] group-hover:text-forest">
                  {lede.title}
                </h2>
              </Link>
              {lede.dek && (
                <p
                  className="mt-5 text-[1.05rem] leading-[1.7] text-muted-foreground"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {lede.dek}
                </p>
              )}
              <div className="hairline-top mt-8 pt-4 flex items-center gap-6 tracker-muted">
                <span>{lede.category}</span>
                <span>·</span>
                <span>{lede.readMinutes ?? 6} min read</span>
                <span>·</span>
                <span>Editor's pick</span>
              </div>
              <Link href={`/insights/${lede.slug}`} className="btn-ghost mt-8 inline-flex">
                Read essay ↗︎
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Filter strip */}
      <section className="hairline-bottom sticky top-[56px] sm:top-[64px] z-30 bg-ivory">
        <div className="container py-3 flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="tracker-muted mr-3">Section</span>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`tracker px-2.5 py-1 transition ${
                  cat === c ? "bg-charcoal text-ivory" : "hover:text-forest"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="tracker-muted">{list.length} essays</div>
        </div>
      </section>

      {/* Index of essays */}
      <section>
        <div className="container py-10 sm:py-12 lg:py-16">
          <div className="hairline-top hairline-bottom">
            <div className="hidden sm:grid grid-cols-12 gap-3 py-3 tracker-muted">
              <div className="col-span-1">#</div>
              <div className="col-span-7">Essay</div>
              <div className="col-span-2">Section</div>
              <div className="col-span-2 text-right">Length</div>
            </div>
            {list.map((a: any, i: number) => (
              <Link key={a.id} href={`/insights/${a.slug}`} className="block group">
                <div className="hidden sm:grid grid-cols-12 gap-3 py-5 border-t border-border items-baseline">
                  <div className="col-span-1 row-rank">{String(i + 2).padStart(2, "0")}</div>
                  <div className="col-span-7 min-w-0">
                    <div className="font-serif text-[1.4rem] leading-tight group-hover:text-forest break-words">
                      {a.title}
                    </div>
                    {a.dek && (
                      <div className="mt-1.5 text-[0.95rem] text-muted-foreground line-clamp-2" style={{ fontFamily: "var(--font-serif)" }}>
                        {a.dek}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 tracker">{a.category}</div>
                  <div className="col-span-2 text-right" style={{ fontFamily: "var(--font-mono)" }}>
                    {a.readMinutes ?? 6} min
                  </div>
                </div>
                {/* Mobile stacked */}
                <div className="sm:hidden border-t border-border py-5 grid grid-cols-[2.4rem_1fr] gap-x-2">
                  <div className="row-rank">{String(i + 2).padStart(2, "0")}</div>
                  <div className="min-w-0">
                    <div className="tracker mb-1">{a.category} · {a.readMinutes ?? 6} min</div>
                    <div className="font-serif text-[1.2rem] leading-tight group-hover:text-forest break-words">{a.title}</div>
                    {a.dek && (
                      <div className="mt-1.5 text-[0.92rem] text-muted-foreground line-clamp-2" style={{ fontFamily: "var(--font-serif)" }}>
                        {a.dek}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, raw }: { label: string; value: string | number; raw?: boolean }) {
  return (
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-value mt-1">{raw ? value : value.toString()}</div>
    </div>
  );
}
