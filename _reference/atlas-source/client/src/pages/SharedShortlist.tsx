import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowRight, MapPin, Bed } from "lucide-react";
import { priceRangeDaily, priceRangeMonthly } from "@/lib/format";

export default function SharedShortlist() {
  const { token } = useParams();
  const { data, isLoading } = trpc.shortlists.byToken.useQuery(
    { token: token! },
    { enabled: !!token },
  );

  if (isLoading) {
    return (
      <div className="container pt-40 pb-24 text-center">
        <div className="eyebrow">One moment</div>
        <h2 className="serif-headline text-3xl mt-3">Loading shortlist…</h2>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container pt-40 pb-24 text-center max-w-2xl">
        <div className="eyebrow">Unavailable</div>
        <h1 className="serif-headline text-4xl mt-3">Shortlist not found.</h1>
        <p className="mt-4 font-serif text-muted-foreground">
          This link may have been revoked. Please request a new one.
        </p>
        <Link href="/" className="mt-8 inline-flex btn-brass">Return home</Link>
      </div>
    );
  }

  const { shortlist, items } = data as any;

  return (
    <div className="pb-24">
      {/* Masthead */}
      <section className="bg-ivory-warm hairline-bottom pt-32 pb-14">
        <div className="container">
          <div className="eyebrow">Curated Shortlist · SAparts</div>
          <h1 className="serif-headline text-5xl lg:text-6xl mt-4 leading-[1.03]">
            {shortlist.title}
          </h1>
          <div className="rule-gold mt-6" />
          <p className="mt-6 font-serif text-lg text-muted-foreground max-w-2xl">
            A privately curated selection of serviced residences, shared for your consideration.
          </p>
          <div className="mt-6 text-xs text-muted-foreground italic">
            {(items || []).length} {(items || []).length === 1 ? "residence" : "residences"} ·
            Prepared on{" "}
            {new Date(shortlist.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </section>

      {/* Items */}
      <div className="container mt-16">
        {(items || []).length === 0 ? (
          <div className="text-center py-20">
            <h3 className="serif-headline text-3xl">This list is currently empty.</h3>
          </div>
        ) : (
          <div className="space-y-14">
            {(items as any[]).map((it: any, idx: number) => {
              const p = it.property;
              if (!p) return null;
              return (
                <article
                  key={it.id}
                  className={`grid lg:grid-cols-12 gap-8 items-start ${
                    idx > 0 ? "pt-14 hairline-top" : ""
                  }`}
                >
                  <div className="lg:col-span-6 aspect-[4/3] overflow-hidden bg-ivory-warm">
                    {p.heroImageUrl && (
                      <img
                        src={p.heroImageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="lg:col-span-6">
                    <div className="eyebrow">
                      {p.category} · {p.cityName ?? ""}
                    </div>
                    <h2 className="serif-headline text-3xl mt-3 leading-tight">{p.name}</h2>
                    {p.tagline && (
                      <p className="mt-3 font-serif text-lg text-muted-foreground italic">
                        {p.tagline}
                      </p>
                    )}
                    <div className="mt-5 space-y-2 text-sm">
                      {p.neighborhood && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-brass-deep" />
                          {p.neighborhood}
                        </div>
                      )}
                      {(p.unitTypes || []).length > 0 && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <Bed className="w-3.5 h-3.5 text-brass-deep mt-1" />
                          <div className="flex flex-wrap gap-1.5">
                            {(p.unitTypes as string[]).map((u) => (
                              <span key={u} className="pill">
                                {u}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {p.description && (
                      <p className="mt-6 font-serif text-[17px] leading-[1.75] text-charcoal/90">
                        {p.description}
                      </p>
                    )}
                    <div className="mt-6 flex flex-wrap items-center gap-6 hairline-top pt-6">
                      <div>
                        <div className="eyebrow">Daily</div>
                        <div className="serif-headline text-xl mt-1">
                          {priceRangeDaily(p.dailyFrom, p.dailyTo)}
                        </div>
                      </div>
                      <div>
                        <div className="eyebrow">Monthly</div>
                        <div className="serif-headline text-xl mt-1">
                          {priceRangeMonthly(p.monthlyFrom, p.monthlyTo)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-4">
                      <Link href={`/properties/${p.slug}`} className="btn-brass">
                        View full details <ArrowRight className="w-4 h-4" />
                      </Link>
                      {p.bookingUrl && (
                        <a
                          href={p.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline"
                        >
                          Check availability
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <section className="container mt-24 text-center max-w-2xl">
        <div className="rule-gold mx-auto max-w-xs" />
        <h3 className="serif-headline text-3xl mt-8">Discover more with SAparts.</h3>
        <p className="mt-3 font-serif text-muted-foreground">
          Explore the full atlas of editorially curated serviced residences across every indexed market.
        </p>
        <Link href="/" className="mt-6 inline-flex btn-brass">
          Visit SAparts <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
