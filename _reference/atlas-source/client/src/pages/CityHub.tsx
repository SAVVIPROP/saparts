import { Link, useParams } from "wouter";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import PropertyCard from "@/components/PropertyCard";
import { formatUSD } from "@/lib/format";
import { Streamdown } from "streamdown";
import { usePageMeta } from "@/hooks/usePageMeta";
import { DESTINATION_DATA, getDestinationData } from "@/data/destinationData";
import { DESTINATION_STATS, getDestinationStats } from "@/data/destinationStats";
import { TRAVEL_CHECKLISTS, getChecklist } from "@/data/travelChecklists";
import {
  Users, DollarSign, Building2, Landmark, Star, Sun, Plane,
  CalendarDays, Coins, Shield, Wifi, Phone, Car, AlertTriangle,
  CheckCircle, Info, MapPin, Clock, Globe, Thermometer, ExternalLink
} from "lucide-react";

// Icon map for dynamic icon rendering from destinationStats
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, DollarSign, Building2, Landmark, Star, Sun, Plane,
  CalendarDays, Coins, Shield, Wifi, Phone, Car, AlertTriangle,
  CheckCircle, Info, MapPin, Clock, Globe, Thermometer,
};

const PRICE_BANDS = [
  { label: "Under $3k / mo", min: 0, max: 3000 },
  { label: "$3k–$6k", min: 3000, max: 6000 },
  { label: "$6k–$10k", min: 6000, max: 10000 },
  { label: "$10k–$20k", min: 10000, max: 20000 },
  { label: "$20k+", min: 20000, max: 999999 },
];

const UNIT_TYPES = ["Studio", "1-Bed", "2-Bed", "3-Bed", "Penthouse", "Duplex", "House"];
const CATEGORIES = ["Serviced Apartment", "Aparthotel", "Residence", "Penthouse"];
const BEST_FOR = ["Best for Executives", "Best for Families", "Best for Extended Stays", "Best for Pets"];

export default function CityHub() {
  const params = useParams();
  const slug = params.slug!;

  // Filter state
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeUnitType, setActiveUnitType] = useState<string | null>(null);
  const [activeBestFor, setActiveBestFor] = useState<string | null>(null);
  const [activePriceBand, setActivePriceBand] = useState<number | null>(null);
  const { data: city } = trpc.cities.bySlug.useQuery({ slug });
  const { data: properties = [] } = trpc.properties.byCitySlug.useQuery({ citySlug: slug });
  const { data: insights = [] } = trpc.insights.list.useQuery({ limit: 4 });

  // Filtered properties — must be declared before any early return (Rules of Hooks)
  const filteredProperties = useMemo(() => {
    return properties.filter((p: any) => {
      if (activeDistrict && p.neighborhood !== activeDistrict) return false;
      if (activeCategory && p.category !== activeCategory) return false;
      if (activeUnitType) {
        const units = Array.isArray(p.unitTypes) ? p.unitTypes : [];
        if (!units.some((u: string) => u.toLowerCase() === activeUnitType.toLowerCase())) return false;
      }
      if (activeBestFor) {
        const tags = Array.isArray(p.bestForTags) ? p.bestForTags : [];
        if (!tags.some((t: string) => t.toLowerCase() === activeBestFor.toLowerCase())) return false;
      }
      if (activePriceBand !== null) {
        const band = PRICE_BANDS[activePriceBand];
        const monthly = Number(p.priceFromMonthlyUsd) || 0;
        if (monthly < band.min || monthly > band.max) return false;
      }
      return true;
    });
  }, [properties, activeDistrict, activeCategory, activeUnitType, activeBestFor, activePriceBand]);

  usePageMeta(
    city ? `${city.name} Serviced Apartments — SAparts Dossier` : "City Dossier — SAparts",
    city ? `The SAparts dossier for ${city.name}: ${properties.length} vetted long-stay residences, neighbourhood guides, pricing benchmarks, and corporate mobility intelligence.` : undefined
  );

  if (!city) {
    return (
      <div className="container py-32 text-center">
        <div className="tracker">§ — · loading dossier</div>
      </div>
    );
  }

  const neighborhoods = (Array.isArray(city.neighborhoods) ? city.neighborhoods : []) as Array<{
    name: string;
    description?: string;
  }>;
  const districts = (Array.isArray(city.businessDistricts) ? city.businessDistricts : []) as string[];
  const tierI = properties.filter((p: any) => Number(p.ratingScore) >= 9.0).length;

  // Match WBS intelligence data by city name or slug
  const cityNameLower = city.name.toLowerCase();
  const destData = getDestinationData(city.name);
  const destStats = getDestinationStats(slug) || getDestinationStats(cityNameLower.replace(/\s+/g, "-"));
  const checklist = getChecklist(slug) || getChecklist(cityNameLower.replace(/\s+/g, "-"));

  const hasIntelligence = !!(destData || destStats || checklist);

  return (
    <div>
      {/* Breadcrumb / TOC */}
      <section className="hairline-bottom">
        <div className="container py-4 flex items-center gap-3 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <Link href="/cities" className="hover:text-forest">Atlas</Link>
          <span>/</span>
          <span>{city.name}</span>
        </div>
      </section>

      {/* Masthead */}
      <section className="hairline-bottom">
        <div className="container py-10 sm:py-14 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <span className="section-mark">DOSSIER</span>
              <span className="eyebrow">{city.region} · {city.country}</span>
            </div>
            <h1 className="display text-[2.8rem] sm:text-[3.6rem] md:text-[5rem] lg:text-[6.4rem] leading-[0.95]">
              {city.name}.
            </h1>
            {city.tagline && (
              <p
                className="mt-6 text-[1.15rem] text-muted-foreground max-w-xl leading-[1.65]"
                style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
              >
                {city.tagline}
              </p>
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
          <div className="lg:col-span-5 paper p-5 sm:p-6 lg:p-7 grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-5 sm:gap-y-7">
            <Stat label="Residences" value={properties.length} />
            <Stat label="Tier I" value={tierI} suffix="rating ≥ 9.0" />
            <Stat
              label="Avg. monthly"
              value={city.avgMonthlyRateUsd ? `$${(Number(city.avgMonthlyRateUsd) / 1000).toFixed(1)}k` : "—"}
              raw
            />
            <Stat
              label="Avg. daily"
              value={city.avgDailyRateUsd ? formatUSD(Number(city.avgDailyRateUsd)) : "—"}
              raw
            />
            <div className="col-span-2 hairline-top pt-4">
              <div className="tracker-muted">Districts</div>
              <div
                className="mt-2 leading-relaxed"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {districts.join(" · ")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero photograph as Fig. 01 */}
      {city.heroImageUrl && (
        <section className="hairline-bottom">
          <div className="container py-8 sm:py-10">
            <div className="aspect-[16/9] sm:aspect-[16/7] overflow-hidden border border-border">
              <img
                src={city.heroImageUrl}
                alt={city.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="fig-caption mt-3">
              <strong>Fig. 01</strong> — {city.name}, {city.country}. Photograph for SAparts editorial use.
            </div>
          </div>
        </section>
      )}

      {/* Intelligence Sidebar + The Brief — two-column layout */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main content */}
          <div className={destStats ? "lg:col-span-8" : "lg:col-span-12"}>
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
              <div className="lg:col-span-3">
                <span className="section-mark">§ 01</span>
                <h2 className="display text-[2rem] mt-4">The Brief.</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
                  Editor's working notes — the kind we send to mobility teams before a relocation workshop.
                </p>
              </div>
              <div className="lg:col-span-9">
                <div className="editorial-body prose prose-lg max-w-none">
                  <Streamdown>{city.dossier || ""}</Streamdown>
                </div>
                {destData?.notes && (
                  <div className="mt-6 p-4 bg-ivory-warm border border-border">
                    <div className="tracker-muted mb-2">Editor's note</div>
                    <p className="text-[0.95rem] leading-relaxed" style={{ fontFamily: "var(--font-serif)" }}>
                      {destData.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Intelligence Sidebar */}
          {destStats && (
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <div className="tracker-muted mb-4 flex items-center gap-2">
                  <span className="dot" />
                  City Intelligence
                </div>
                <div className="paper p-5 space-y-4">
                  {destStats.stats.map((stat) => {
                    const IconComp = ICON_MAP[stat.icon] || Info;
                    return (
                      <div key={stat.label} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-ivory-warm border border-border flex items-center justify-center shrink-0 mt-0.5">
                          <IconComp className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="tracker-muted text-[0.72rem]">{stat.label}</div>
                          <div className="font-serif text-[1.1rem] leading-tight mt-0.5">{stat.value}</div>
                          {stat.subtext && <div className="tracker-muted text-[0.7rem] mt-0.5 text-muted-foreground">{stat.subtext}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Sources */}
                {destStats.sources.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    <div className="tracker-muted text-[0.68rem]">Sources</div>
                    {destStats.sources.map((src) => (
                      <a
                        key={src.url}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[0.72rem] text-muted-foreground hover:text-forest"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        {src.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Districts */}
      {neighborhoods.length > 0 && (
        <section className="hairline-bottom">
          <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-3">
              <span className="section-mark">§ 02</span>
              <h2 className="display text-[2rem] mt-4">Districts.</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
                Where to actually live, with the editor's reasoning per neighbourhood.
              </p>
            </div>
            <div className="lg:col-span-9">
              <div className="hairline-top hairline-bottom">
                {neighborhoods.map((n, i) => (
                  <div
                    key={n.name}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 py-6 border-t border-border"
                  >
                    <div className="sm:col-span-1 row-rank">{String(i + 1).padStart(2, "0")}</div>
                    <div className="sm:col-span-3 min-w-0">
                      <div className="font-serif text-[1.35rem] sm:text-[1.5rem] leading-tight break-words">{n.name}</div>
                    </div>
                    <div className="sm:col-span-8">
                      <p
                        className="text-[0.98rem] leading-[1.7] text-muted-foreground"
                        style={{ fontFamily: "var(--font-serif)" }}
                      >
                        {n.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Living Guide — Visa & Entry */}
      {checklist && (
        <section className="hairline-bottom">
          <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-3">
              <span className="section-mark">§ 03</span>
              <h2 className="display text-[2rem] mt-4">Living Guide.</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
                Practical intelligence for relocating professionals. Visa requirements, health, connectivity, and local essentials.
              </p>
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
                  <div className="tracker-muted text-[0.7rem] mb-1">Voltage</div>
                  <div className="font-serif text-[1.1rem]">{checklist.voltage}</div>
                  <div className="tracker-muted text-[0.7rem] mt-1">{checklist.plugTypes.join(", ")}</div>
                </div>
                <div className="paper p-4">
                  <div className="tracker-muted text-[0.7rem] mb-1">Safety Index</div>
                  <div className="font-serif text-[1.1rem]">{checklist.safetyScore}/100</div>
                  <div className="tracker-muted text-[0.7rem] mt-1">{checklist.safetySource}</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-9 grid sm:grid-cols-2 gap-6">
              {/* Visa */}
              <div className="paper p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <div className="tracker">Visa & Entry</div>
                </div>
                {checklist.visaOnArrival.length > 0 && (
                  <div className="mb-3">
                    <div className="tracker-muted text-[0.7rem] mb-1.5">Visa on Arrival</div>
                    {checklist.visaOnArrival.map((v, i) => (
                      <div key={i} className="flex items-start gap-2 text-[0.85rem] mb-1">
                        <CheckCircle className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                {checklist.eVisa.length > 0 && (
                  <div className="mb-3">
                    <div className="tracker-muted text-[0.7rem] mb-1.5">eVisa Available</div>
                    {checklist.eVisa.map((v, i) => (
                      <div key={i} className="flex items-start gap-2 text-[0.85rem] mb-1">
                        <CheckCircle className="w-3.5 h-3.5 text-brass shrink-0 mt-0.5" />
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                {checklist.visaNotes && (
                  <p className="text-[0.82rem] text-muted-foreground leading-relaxed mt-3 pt-3 border-t border-border">
                    {checklist.visaNotes}
                  </p>
                )}
              </div>

              {/* Tipping */}
              <div className="paper p-5">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div className="tracker">Tipping Norms</div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="tracker-muted text-[0.7rem]">Restaurants</div>
                    <div className="text-[0.88rem] mt-0.5">{checklist.tipping.restaurants}</div>
                  </div>
                  <div>
                    <div className="tracker-muted text-[0.7rem]">Hotels</div>
                    <div className="text-[0.88rem] mt-0.5">{checklist.tipping.hotels}</div>
                  </div>
                  <div>
                    <div className="tracker-muted text-[0.7rem]">Taxis</div>
                    <div className="text-[0.88rem] mt-0.5">{checklist.tipping.taxis}</div>
                  </div>
                  {checklist.tipping.notes && (
                    <p className="text-[0.82rem] text-muted-foreground pt-2 border-t border-border">{checklist.tipping.notes}</p>
                  )}
                </div>
              </div>

              {/* SIM & Connectivity */}
              <div className="paper p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Wifi className="w-4 h-4 text-muted-foreground" />
                  <div className="tracker">SIM & Connectivity</div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="tracker-muted text-[0.7rem] mb-1">Providers</div>
                    <div className="flex flex-wrap gap-1.5">
                      {checklist.simCard.providers.map((p) => (
                        <span key={p} className="px-2 py-0.5 bg-ivory-warm border border-border text-[0.78rem]">{p}</span>
                      ))}
                    </div>
                  </div>
                  {checklist.simCard.esim && (
                    <div className="flex items-center gap-2 text-[0.85rem] text-forest">
                      <CheckCircle className="w-3.5 h-3.5" />
                      eSIM supported
                    </div>
                  )}
                  <p className="text-[0.82rem] text-muted-foreground">{checklist.simCard.notes}</p>
                </div>
              </div>

              {/* Emergency & Transport */}
              <div className="paper p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div className="tracker">Emergency & Transport</div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="tracker-muted text-[0.7rem]">Police</div>
                      <div className="font-mono text-[1rem] font-semibold">{checklist.emergency.police}</div>
                    </div>
                    <div>
                      <div className="tracker-muted text-[0.7rem]">Ambulance</div>
                      <div className="font-mono text-[1rem] font-semibold">{checklist.emergency.ambulance}</div>
                    </div>
                    <div>
                      <div className="tracker-muted text-[0.7rem]">Fire</div>
                      <div className="font-mono text-[1rem] font-semibold">{checklist.emergency.fire}</div>
                    </div>
                    {checklist.emergency.tourist && (
                      <div>
                        <div className="tracker-muted text-[0.7rem]">Tourist</div>
                        <div className="font-mono text-[0.85rem]">{checklist.emergency.tourist}</div>
                      </div>
                    )}
                  </div>
                </div>
                {checklist.taxiApps.length > 0 && (
                  <div>
                    <div className="tracker-muted text-[0.7rem] mb-1.5">Taxi Apps</div>
                    <div className="flex flex-wrap gap-1.5">
                      {checklist.taxiApps.map((app) => (
                        <span key={app} className="px-2 py-0.5 bg-ivory-warm border border-border text-[0.78rem]">{app}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Health & Safety */}
              {checklist.vaccinations.length > 0 && (
                <div className="paper p-5 sm:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <div className="tracker">Health & Safety</div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <div className="tracker-muted text-[0.7rem] mb-2">Vaccinations</div>
                      <div className="space-y-2">
                        {checklist.vaccinations.map((v) => (
                          <div key={v.name} className="flex items-start gap-2">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${v.required ? "bg-red-500" : "bg-brass"}`} />
                            <div>
                              <div className="text-[0.85rem] font-medium">{v.name}</div>
                              <div className="text-[0.78rem] text-muted-foreground">{v.required ? "Required" : "Recommended"} · {v.notes}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="tracker-muted text-[0.7rem] mb-2">Health Notes</div>
                      <p className="text-[0.85rem] leading-relaxed text-muted-foreground">{checklist.healthNotes}</p>
                      {checklist.safetyNotes && (
                        <p className="text-[0.85rem] leading-relaxed text-muted-foreground mt-3 pt-3 border-t border-border">{checklist.safetyNotes}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Local Essentials */}
              {checklist.localEssentials.length > 0 && (
                <div className="paper p-5 sm:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    <div className="tracker">Local Essentials</div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {checklist.localEssentials.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-[0.85rem]">
                        <span className="text-brass mt-0.5 shrink-0">→︎</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Destination Checklist — Arrival, Dining, Culture, Transport */}
      {destData && (
        <section className="hairline-bottom">
          <div className="container py-12 sm:py-16 lg:py-20">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 mb-10">
              <div className="lg:col-span-3">
                <span className="section-mark">§ 04</span>
                <h2 className="display text-[2rem] mt-4">City Checklist.</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
                  Curated guidance for arriving professionals and long-stay residents.
                </p>
                {destData.avoidMonths.length > 0 && (
                  <div className="mt-6 paper p-4">
                    <div className="tracker-muted text-[0.7rem] mb-1">Avoid</div>
                    <div className="text-[0.88rem]">{destData.avoidMonths.join(", ")}</div>
                  </div>
                )}
              </div>
              <div className="lg:col-span-9 grid sm:grid-cols-2 gap-5">
                {(["arrival", "transport", "dining", "culture", "wellness", "shopping"] as const).map((cat) => {
                  const items = destData.checklistCategories[cat];
                  if (!items || items.length === 0) return null;
                  const labels: Record<string, string> = {
                    arrival: "Arrival", transport: "Getting Around", dining: "Dining",
                    culture: "Culture", wellness: "Wellness", shopping: "Shopping"
                  };
                  return (
                    <div key={cat} className="paper p-5">
                      <div className="tracker mb-3">{labels[cat]}</div>
                      <ul className="space-y-2">
                        {items.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-[0.85rem]">
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

      {/* The Register */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 mb-8 sm:mb-10 items-end">
            <div className="lg:col-span-7">
              <span className="section-mark">§ 05</span>
              <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">
                The {city.name} <em>register</em>.
              </h2>
            </div>
            <div className="lg:col-span-5 text-muted-foreground leading-relaxed text-sm">
              {properties.length} residences indexed in this volume. Each is benchmarked on five axes
              and tagged for the personas it serves best.
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mb-8 space-y-4 pb-8 border-b border-border">
            {/* District chips from neighbourhoods */}
            {neighborhoods.length > 0 && (
              <div>
                <div className="tracker-muted text-[0.7rem] mb-2">DISTRICT</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveDistrict(null)}
                    className={`px-3 py-1 text-[0.78rem] border transition-colors ${
                      activeDistrict === null
                        ? "bg-charcoal text-ivory border-charcoal"
                        : "bg-transparent text-muted-foreground border-border hover:border-charcoal hover:text-charcoal"
                    }`}
                    style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}
                  >
                    All
                  </button>
                  {neighborhoods.map((n) => (
                    <button
                      key={n.name}
                      onClick={() => setActiveDistrict(activeDistrict === n.name ? null : n.name)}
                      className={`px-3 py-1 text-[0.78rem] border transition-colors ${
                        activeDistrict === n.name
                          ? "bg-charcoal text-ivory border-charcoal"
                          : "bg-transparent text-muted-foreground border-border hover:border-charcoal hover:text-charcoal"
                      }`}
                      style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}
                    >
                      {n.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <div className="tracker-muted text-[0.7rem] mb-2">CATEGORY</div>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                      className={`px-2.5 py-1 text-[0.75rem] border transition-colors ${
                        activeCategory === cat
                          ? "bg-forest text-ivory border-forest"
                          : "bg-transparent text-muted-foreground border-border hover:border-forest hover:text-forest"
                      }`}
                      style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unit Type */}
              <div>
                <div className="tracker-muted text-[0.7rem] mb-2">UNIT SIZE</div>
                <div className="flex flex-wrap gap-1.5">
                  {UNIT_TYPES.map((ut) => (
                    <button
                      key={ut}
                      onClick={() => setActiveUnitType(activeUnitType === ut ? null : ut)}
                      className={`px-2.5 py-1 text-[0.75rem] border transition-colors ${
                        activeUnitType === ut
                          ? "bg-forest text-ivory border-forest"
                          : "bg-transparent text-muted-foreground border-border hover:border-forest hover:text-forest"
                      }`}
                      style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}
                    >
                      {ut}
                    </button>
                  ))}
                </div>
              </div>

              {/* Best For */}
              <div>
                <div className="tracker-muted text-[0.7rem] mb-2">BEST FOR</div>
                <div className="flex flex-wrap gap-1.5">
                  {BEST_FOR.map((bf) => (
                    <button
                      key={bf}
                      onClick={() => setActiveBestFor(activeBestFor === bf ? null : bf)}
                      className={`px-2.5 py-1 text-[0.75rem] border transition-colors ${
                        activeBestFor === bf
                          ? "bg-forest text-ivory border-forest"
                          : "bg-transparent text-muted-foreground border-border hover:border-forest hover:text-forest"
                      }`}
                      style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}
                    >
                      {bf.replace("Best for ", "")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Band */}
              <div>
                <div className="tracker-muted text-[0.7rem] mb-2">PRICE / MONTH</div>
                <div className="flex flex-wrap gap-1.5">
                  {PRICE_BANDS.map((band, i) => (
                    <button
                      key={band.label}
                      onClick={() => setActivePriceBand(activePriceBand === i ? null : i)}
                      className={`px-2.5 py-1 text-[0.75rem] border transition-colors ${
                        activePriceBand === i
                          ? "bg-forest text-ivory border-forest"
                          : "bg-transparent text-muted-foreground border-border hover:border-forest hover:text-forest"
                      }`}
                      style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}
                    >
                      {band.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filter summary + reset */}
            {(activeDistrict || activeCategory || activeUnitType || activeBestFor || activePriceBand !== null) && (
              <div className="flex items-center justify-between pt-2">
                <div className="tracker-muted text-[0.72rem]">
                  {filteredProperties.length} of {properties.length} residences
                </div>
                <button
                  onClick={() => {
                    setActiveDistrict(null);
                    setActiveCategory(null);
                    setActiveUnitType(null);
                    setActiveBestFor(null);
                    setActivePriceBand(null);
                  }}
                  className="tracker-muted text-[0.72rem] hover:text-forest underline underline-offset-2"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 sm:gap-x-6 gap-y-10 sm:gap-y-12">
            {filteredProperties.length > 0 ? (
              filteredProperties.filter((p: any) => p && p.id).map((p: any) => (
                <PropertyCard key={p.id} property={p} cityName={city.name} />
              ))
            ) : (
              <div className="col-span-3 py-16 text-center">
                <div className="tracker-muted">NO MATCHES</div>
                <p className="font-serif text-[1.4rem] mt-3">Nothing in this pocket yet.</p>
                <p className="text-muted-foreground text-sm mt-2">Relax a filter — the right residence is nearby.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Journal */}
      {insights.length > 0 && (
        <section>
          <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-4">
              <span className="section-mark">§ 06</span>
              <h2 className="display text-[2rem] mt-4">From the Journal.</h2>
              <Link href="/insights" className="btn-ghost mt-4 inline-flex">All essays ↗︎</Link>
            </div>
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-8">
              {insights.slice(0, 4).map((ins: any, i: number) => (
                <Link key={ins.id} href={`/insights/${ins.slug}`} className="group block">
                  <div className="aspect-[16/10] overflow-hidden bg-ivory-warm border border-border">
                    {ins.heroImageUrl && (
                      <img
                        src={ins.heroImageUrl}
                        alt={ins.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="pt-3">
                    <div className="tracker">
                      {String(i + 1).padStart(2, "0")} · {ins.category}
                    </div>
                    <div className="font-serif text-[1.3rem] mt-1 leading-tight group-hover:text-forest">
                      {ins.title}
                    </div>
                    <div className="tracker-muted mt-2">{ins.readMinutes ?? 6} min read</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  raw,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  raw?: boolean;
}) {
  return (
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-value mt-1">{raw ? value : value.toString()}</div>
      {suffix && <div className="stat-sub mt-1">{suffix}</div>}
    </div>
  );
}
