import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCity, getCities, getPropertiesForCity, cityMedianMonthlyUsd } from "@/lib/data";
import { getDestinationData } from "@/data/destinationData";
import { getDestinationStats } from "@/data/destinationStats";
import { getChecklist } from "@/data/travelChecklists";
import { CityRegister } from "./CityRegister";
import { ICON_MAP, Globe, Thermometer, Shield, Sun, ExternalLink, DollarSign, Wifi, Phone } from "@/components/icons";

export async function generateStaticParams() {
  return getCities().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) return { title: "City" };
  return {
    title: `${city.name} serviced apartments`,
    description: city.tagline || `The SAparts dossier for ${city.name}.`,
  };
}

export default async function CityHubPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; district?: string; category?: string; unitType?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const city = getCity(slug);
  if (!city) notFound();
  const properties = getPropertiesForCity(city.slug);
  const destData = getDestinationData(city.name);
  const destStats = getDestinationStats(slug) || getDestinationStats(city.name.toLowerCase().replace(/\s+/g, "-"));
  const checklist = getChecklist(slug) || getChecklist(city.name.toLowerCase().replace(/\s+/g, "-"));
  const districts = [...new Set(properties.map((p) => p.neighborhood).filter((v): v is string => Boolean(v)))].sort();
  const median = cityMedianMonthlyUsd(city.slug);
  const forthcoming = city.launch === false || properties.length === 0;

  return (
    <div>
      <section className="hairline-bottom">
        <div className="container py-4 flex items-center gap-3 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <Link href="/cities" className="hover:text-forest">Atlas</Link>
          <span>/</span>
          <span>{city.name}</span>
        </div>
      </section>

      <section className="hairline-bottom">
        <div className="container py-10 sm:py-14 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <span className="section-mark">{forthcoming ? "FORTHCOMING" : "DOSSIER"}</span>
              <span className="eyebrow">{city.region} · {city.country}</span>
            </div>
            <h1 className="display text-[2.8rem] sm:text-[3.6rem] md:text-[5rem] lg:text-[6.4rem] leading-[0.95]">{city.name}.</h1>
            {city.tagline && (
              <p className="mt-6 text-[1.15rem] text-muted-foreground max-w-xl leading-[1.65] font-serif italic">{city.tagline}</p>
            )}
            {destData && (
              <div className="mt-6 flex flex-wrap gap-4 tracker-muted">
                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {destData.currency} · {destData.language}</span>
                <span className="flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5" /> {destData.climate}</span>
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Safety {destData.safetyRating}/5</span>
                {destData.bestMonths.length > 0 && (
                  <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5" /> Best: {destData.bestMonths.slice(0, 2).join(", ")}</span>
                )}
              </div>
            )}
          </div>
          <div className="lg:col-span-5 paper p-5 sm:p-6 lg:p-7 grid grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <div className="stat-label">Residences</div>
              <div className="stat-value mt-1">{properties.length}</div>
            </div>
            <div>
              <div className="stat-label">Avg. monthly</div>
              <div className="stat-value mt-1">{median ? `$${(median / 1000).toFixed(1)}k` : "—"}</div>
            </div>
            <div className="col-span-2 hairline-top pt-4">
              <div className="tracker-muted">Districts on file</div>
              <div className="mt-2 font-serif leading-relaxed">{districts.length ? districts.slice(0, 8).join(" · ") : "Filed with the first listing pack."}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className={destStats ? "lg:col-span-8" : "lg:col-span-12"}>
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3">
                <span className="section-mark">§ 01</span>
                <h2 className="display text-[2rem] mt-4">The Brief.</h2>
              </div>
              <div className="lg:col-span-9">
                {destData?.notes ? (
                  <div className="p-4 bg-ivory-warm border border-border">
                    <div className="tracker-muted mb-2">Editor&apos;s note</div>
                    <p className="text-[0.95rem] leading-relaxed font-serif">{destData.notes}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground leading-relaxed font-serif">
                    {city.tagline || `The SAparts working notes for ${city.name}. Residences appear below when a listing pack has been filed.`}
                  </p>
                )}
              </div>
            </div>
          </div>
          {destStats && (
            <div className="lg:col-span-4">
              <div className="tracker-muted mb-4 flex items-center gap-2"><span className="dot" /> City Intelligence</div>
              <div className="paper p-5 space-y-4">
                {destStats.stats.map((stat) => {
                  const IconComp = ICON_MAP[stat.icon] || ICON_MAP.Info;
                  return (
                    <div key={stat.label} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-ivory-warm border border-border flex items-center justify-center shrink-0 mt-0.5">
                        {IconComp && <IconComp className="w-3.5 h-3.5 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <div className="tracker-muted text-[0.72rem]">{stat.label}</div>
                        <div className="font-serif text-[1.1rem] leading-tight mt-0.5">{stat.value}</div>
                        {stat.subtext && <div className="tracker-muted text-[0.7rem] mt-0.5">{stat.subtext}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {destStats.sources.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  <div className="tracker-muted text-[0.68rem]">Sources</div>
                  {destStats.sources.map((src) => (
                    <a key={src.url} href={src.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[0.72rem] text-muted-foreground hover:text-forest font-mono">
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" /> {src.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {checklist && (
        <section className="hairline-bottom">
          <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
              <span className="section-mark">§ 03</span>
              <h2 className="display text-[2rem] mt-4">Living Guide.</h2>
              <div className="mt-6 space-y-3">
                <div className="paper p-4">
                  <div className="tracker-muted text-[0.7rem] mb-1">Currency</div>
                  <div className="font-serif text-[1.1rem]">{checklist.currency.code} · {checklist.currency.name}</div>
                </div>
                <div className="paper p-4">
                  <div className="tracker-muted text-[0.7rem] mb-1">Timezone</div>
                  <div className="font-serif text-[1.1rem]">{checklist.timezone}</div>
                </div>
                <div className="paper p-4">
                  <div className="tracker-muted text-[0.7rem] mb-1">Safety Index</div>
                  <div className="font-serif text-[1.1rem]">{checklist.safetyScore}/100</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-9 grid sm:grid-cols-2 gap-6">
              <div className="paper p-5">
                <div className="flex items-center gap-2 mb-4"><Globe className="w-4 h-4 text-muted-foreground" /><div className="tracker">Visa & Entry</div></div>
                {checklist.visaNotes && <p className="text-[0.85rem] leading-relaxed">{checklist.visaNotes}</p>}
              </div>
              <div className="paper p-5">
                <div className="flex items-center gap-2 mb-4"><DollarSign className="w-4 h-4 text-muted-foreground" /><div className="tracker">Tipping</div></div>
                <div className="text-[0.88rem]">{checklist.tipping.restaurants}</div>
                {checklist.tipping.notes && <p className="text-[0.82rem] text-muted-foreground mt-3 pt-3 border-t border-border">{checklist.tipping.notes}</p>}
              </div>
              <div className="paper p-5">
                <div className="flex items-center gap-2 mb-4"><Wifi className="w-4 h-4 text-muted-foreground" /><div className="tracker">SIM & Connectivity</div></div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {checklist.simCard.providers.map((p) => (
                    <span key={p} className="px-2 py-0.5 bg-ivory-warm border border-border text-[0.78rem]">{p}</span>
                  ))}
                </div>
                <p className="text-[0.82rem] text-muted-foreground">{checklist.simCard.notes}</p>
              </div>
              <div className="paper p-5">
                <div className="flex items-center gap-2 mb-4"><Phone className="w-4 h-4 text-muted-foreground" /><div className="tracker">Emergency</div></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><div className="tracker-muted text-[0.7rem]">Police</div><div className="font-mono">{checklist.emergency.police}</div></div>
                  <div><div className="tracker-muted text-[0.7rem]">Ambulance</div><div className="font-mono">{checklist.emergency.ambulance}</div></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {destData && (
        <section className="hairline-bottom">
          <div className="container py-12 sm:py-16 lg:py-20">
            <div className="grid lg:grid-cols-12 gap-8 mb-10">
              <div className="lg:col-span-3">
                <span className="section-mark">§ 04</span>
                <h2 className="display text-[2rem] mt-4">City Checklist.</h2>
              </div>
              <div className="lg:col-span-9 grid sm:grid-cols-2 gap-5">
                {(["arrival", "transport", "dining", "culture"] as const).map((cat) => {
                  const items = destData.checklistCategories[cat];
                  if (!items?.length) return null;
                  const labels: Record<string, string> = { arrival: "Arrival", transport: "Getting Around", dining: "Dining", culture: "Culture" };
                  return (
                    <div key={cat} className="paper p-5">
                      <div className="tracker mb-3">{labels[cat]}</div>
                      <ul className="space-y-2">
                        {items.slice(0, 4).map((item) => (
                          <li key={item} className="flex items-start gap-2 text-[0.85rem]">
                            <span className="text-brass shrink-0 mt-0.5">→︎</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="container py-12 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-8 mb-8 items-end">
            <div className="lg:col-span-7">
              <span className="section-mark">§ 05</span>
              <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">The {city.name} <em>register</em>.</h2>
            </div>
            <div className="lg:col-span-5 text-muted-foreground text-sm leading-relaxed">
              {properties.length} residences indexed in this volume. Photography appears only when a usable still is on file.
            </div>
          </div>
          {forthcoming && properties.length === 0 ? (
            <div className="paper p-8 sm:p-12">
              <div className="tracker-muted">Forthcoming market</div>
              <h3 className="display text-3xl mt-3">{city.name} is on the atlas, not yet in the register.</h3>
              <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
                Destination intelligence above is from the Atlas living guide. Residences will appear here when a source-backed listing pack is filed for {city.name}. We will not invent inventory to fill the page.
              </p>
              <Link href="/search" className="btn-ghost mt-6">Search launch cities ↗︎</Link>
            </div>
          ) : (
            <CityRegister
              listings={properties}
              city={city}
              districts={districts}
              page={Number(sp.page) || 1}
              district={sp.district}
              category={sp.category}
              unitType={sp.unitType}
            />
          )}
        </div>
      </section>
    </div>
  );
}
