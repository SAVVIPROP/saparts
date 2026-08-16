import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { priceRangeDaily, priceRangeMonthly, titleCaseTag, formatUSD } from "@/lib/format";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  ArrowRight,
  MapPin,
  Star,
  Wifi,
  Utensils,
  Dumbbell,
  Car,
  Share2,
  ExternalLink,
  ChevronRight,
  Bed,
  Check,
  Briefcase,
  Bookmark,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { Suspense, lazy, useState } from "react";
import NearbyTransit from "@/components/NearbyTransit";
import { useAuth } from "@/_core/hooks/useAuth";
const PropertyMap = lazy(() => import("@/components/PropertyMap"));
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import BookmarkButton from "@/components/BookmarkButton";

const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi,
  "high-speed wifi": Wifi,
  kitchen: Utensils,
  "full kitchen": Utensils,
  gym: Dumbbell,
  fitness: Dumbbell,
  parking: Car,
  workspace: Briefcase,
  desk: Briefcase,
};

export default function Property() {
  const { slug } = useParams();
  const { data } = trpc.properties.bySlug.useQuery({ slug: slug! });
  const property = data?.property;
  const images = data?.images ?? [];
  const city = data?.city;
  const roomTypes = (data?.roomTypes ?? []) as Array<{
    id: number;
    name: string;
    beds: string[];
    maxOccupancy: number | null;
    sizeSqm: number | null;
    price30NightsUsd: number | null;
    facilities: string[];
  }>;

  const { data: related = [] } = trpc.properties.byCitySlug.useQuery(
    { citySlug: city?.slug ?? "" },
    { enabled: !!city?.slug },
  );
  const { isAuthenticated } = useAuth();
  const { data: myShortlists = [] } = trpc.shortlists.listMine.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const utils = trpc.useUtils();
  const addToShortlist = trpc.shortlists.addItem.useMutation({
    onSuccess: () => {
      toast.success("Added to your shortlist.");
      utils.shortlists.listMine.invalidate();
    },
  });
  const createShortlist = trpc.shortlists.create.useMutation({
    onSuccess: (newList) => {
      if (property) {
        addToShortlist.mutate({ shortlistId: newList.id, propertyId: property.id });
      }
    },
  });
  const [showSave, setShowSave] = useState(false);

  usePageMeta(
    property ? `${property.name} — ${city?.name ?? ""} Serviced Apartment — SAparts` : "Residence — SAparts",
    property ? `${property.name} in ${city?.name ?? ""}: ${property.description?.slice(0, 140) ?? "Premium long-stay residence vetted by SAparts editors."}` : undefined
  );

  if (!data || !property) {
    return (
      <div className="container pt-40 pb-24 text-center">
        <div className="tracker">§ — · loading dossier</div>
        <h2 className="font-serif text-3xl mt-3">Loading residence…</h2>
      </div>
    );
  }

  const unitTypes = (Array.isArray(property.unitTypes) ? property.unitTypes : []).map((u: unknown) =>
    typeof u === 'string' ? u : (u as { name?: string })?.name ?? String(u)
  ).filter(Boolean) as string[];
  const amenities = (Array.isArray(property.amenities) ? property.amenities : []) as string[];
  const bestForTags = (Array.isArray(property.bestForTags) ? property.bestForTags : []) as string[];
  // Prefer S3-stored gallery images over external CDN URLs (which may be blocked)
  const s3HeroImg = images[0]?.url;
  const heroImg = s3HeroImg || property.heroImageUrl;
  const galleryImgs = images.filter((img) => img.url !== heroImg).slice(0, 4);

  // Strip Booking.com boilerplate from descriptions
  const cleanDescription = property.description
    ? property.description
        .replace(/You might be eligible for a Genius discount at [^.]+\./gi, "")
        .replace(/Genius discounts[^.]+\./gi, "")
        .replace(/Sign in[^.]+discount[^.]+\./gi, "")
        .trim()
    : null;

  const hasCoords = property.latitude != null && property.longitude != null;

  const onSave = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setShowSave(true);
  };
  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard.");
    } catch {
      toast.error("Couldn't copy link.");
    }
  };

  const related3 = (related as any[])
    .filter((r: any) => r.id !== property.id)
    .slice(0, 3);

  const tierLabel = Number(property.ratingScore) >= 9.0 ? "Tier I" : Number(property.ratingScore) >= 7.5 ? "Tier II" : "Tier III";

  return (
    <div className="pb-24">
      {/* ── Breadcrumb strip ── */}
      <div className="hairline-bottom">
        <div className="container py-3 flex items-center gap-2 tracker-muted overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/cities" className="hover:text-forest">Atlas</Link>
          {city && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/cities/${city.slug}`} className="hover:text-forest">{city.name}</Link>
            </>
          )}
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{property.name}</span>
        </div>
      </div>

      {/* ── § 01 · Gallery ── */}
      <section className="container pt-6 sm:pt-8 lg:pt-10">
        {/* 1+4 grid: hero left (60%), 2×2 thumbnails right (40%) */}
        <div className="flex gap-2" style={{height: 'clamp(240px, 42vw, 500px)'}}>
          {/* Hero — 60% width */}
          <div className="flex-[3] overflow-hidden bg-ivory-warm min-w-0">
            {heroImg ? (
              <img src={heroImg} alt={property.name} className="w-full h-full object-cover" loading="eager" />
            ) : (
              <div className="w-full h-full flex items-center justify-center tracker-muted text-xs">No image available</div>
            )}
          </div>
          {/* 2×2 thumbnail grid — 40% width, hidden on mobile */}
          <div className="hidden md:flex flex-[2] flex-col gap-2 min-w-0">
            <div className="flex gap-2 flex-1">
              {[0, 1].map((i) => {
                const img = galleryImgs[i];
                return (
                  <div key={i} className="flex-1 overflow-hidden bg-ivory-warm">
                    {img?.url ? (
                      <img src={img.url} alt={img.caption ?? `${property.name} — photo ${i + 2}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : <div className="w-full h-full bg-ivory-warm" />}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 flex-1">
              {[2, 3].map((i) => {
                const img = galleryImgs[i];
                return (
                  <div key={i} className="flex-1 overflow-hidden bg-ivory-warm">
                    {img?.url ? (
                      <img src={img.url} alt={img.caption ?? `${property.name} — photo ${i + 2}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : <div className="w-full h-full bg-ivory-warm" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Mobile: horizontal scrollable strip */}
        {images.length > 1 && (
          <div className="md:hidden flex gap-2 mt-2 overflow-x-auto no-scrollbar">
            {images.slice(1, 6).map((img, i) => (
              <div key={i} className="shrink-0 w-32 h-20 overflow-hidden bg-ivory-warm">
                <img src={img.url} alt={img.caption ?? property.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── § 02 · Masthead + Sticky Booking Aside ── */}
      <section className="container mt-8 sm:mt-10 lg:mt-12 grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: editorial masthead */}
        <div className="lg:col-span-7">
          <div className="tracker-muted flex items-center gap-3 mb-3">
            <span>§ 01</span>
            <span>·</span>
            <span>{property.category ?? "Serviced Apartment"}</span>
            {city && <><span>·</span><span>{city.name}</span></>}
            {property.ratingScore != null && (
              <><span>·</span><span className="text-forest font-medium">{tierLabel}</span></>
            )}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] break-words">
            {property.name}
          </h1>
          {property.brand && (
            <div className="mt-2 tracker-muted">by {property.brand}</div>
          )}
          {property.neighborhood && (
            <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{property.neighborhood}{city ? `, ${city.name}` : ""}</span>
            </div>
          )}
          {property.ratingScore != null && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 fill-brass text-brass" />
              <span className="font-medium">{Number(property.ratingScore).toFixed(1)}</span>
              <span className="text-muted-foreground">/ 10 · {property.ratingSource ?? "OTA partners"}</span>
            </div>
          )}

          {/* Best-for tags */}
          {bestForTags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {bestForTags.map((t) => (
                <span key={t} className="pill pill-dark">{titleCaseTag(t)}</span>
              ))}
            </div>
          )}

          {/* Mobile CTA strip (shown below lg) */}
          <div className="lg:hidden mt-6 space-y-3">
            {property.bookingUrl && (
              <a href={property.bookingUrl} target="_blank" rel="noreferrer"
                className="btn-brass w-full justify-center">
                Check availability <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {property.expediaUrl && (
              <a href={property.expediaUrl} target="_blank" rel="noreferrer"
                className="btn-outline w-full justify-center">
                View on Expedia <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {property.tripUrl && (
              <a href={property.tripUrl} target="_blank" rel="noreferrer"
                className="btn-outline w-full justify-center">
                Compare on Trip.com <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {property.officialUrl && (
              <a href={property.officialUrl} target="_blank" rel="noreferrer"
                className="text-sm text-center block text-muted-foreground hover:text-forest">
                Visit official site <ArrowRight className="inline w-3 h-3 ml-0.5" />
              </a>
            )}
            <div className="flex gap-3 pt-1">
              <button onClick={onSave} className="btn-outline flex-1 justify-center">
                <Bookmark className="w-4 h-4" /> Shortlist
              </button>
              <button onClick={onShare} className="btn-outline flex-1 justify-center">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Right: sticky booking aside (desktop only) */}
        <aside className="hidden lg:block lg:col-span-5 lg:sticky lg:top-28">
          <div className="border border-border bg-background p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="tracker-muted mb-1">Rate indication</div>
                <div className="font-serif text-2xl">
                  {priceRangeMonthly(property.priceFromMonthlyUsd, property.priceToMonthlyUsd)}
                </div>
                <div className="tracker-muted mt-0.5">per month</div>
              </div>
              <BookmarkButton property={{ id: property.id, name: property.name, slug: property.slug, category: property.category, heroImageUrl: property.heroImageUrl, priceFromMonthlyUsd: property.priceFromMonthlyUsd != null ? Number(property.priceFromMonthlyUsd) : null, ratingScore: property.ratingScore != null ? Number(property.ratingScore) : null }} size="md" />
            </div>

            <div className="hairline-bottom mb-4" />

            <div className="space-y-2.5 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily range</span>
                <span>{priceRangeDaily(property.priceFromDailyUsd, property.priceToDailyUsd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly range</span>
                <span className="font-medium">{priceRangeMonthly(property.priceFromMonthlyUsd, property.priceToMonthlyUsd)}</span>
              </div>
              {property.minStayNights != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min. stay</span>
                  <span>{property.minStayNights} nights</span>
                </div>
              )}
              {property.ratingScore != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SAparts rating</span>
                  <span className="text-forest font-medium">{Number(property.ratingScore).toFixed(1)} · {tierLabel}</span>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              {/* Book Direct — primary CTA */}
              <a
                href={`mailto:reservations@saparts.com?subject=Enquiry%3A%20${encodeURIComponent(property.name)}&body=Hello%2C%0A%0AI%20am%20interested%20in%20booking%20${encodeURIComponent(property.name)}.%0A%0APlease%20send%20me%20availability%20and%20rates.%0A%0AThank%20you.`}
                className="btn-primary w-full justify-center"
              >
                Book Direct <ArrowRight className="w-3.5 h-3.5" />
              </a>

              {property.officialUrl && (
                <a href={property.officialUrl} target="_blank" rel="noreferrer"
                  className="btn-ghost w-full justify-center">
                  Visit official website <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="hairline-top mt-5 pt-4 flex gap-2">
              <button onClick={onSave} className="btn-outline flex-1 justify-center text-sm">
                <Bookmark className="w-3.5 h-3.5" /> Shortlist
              </button>
              <button onClick={onShare} className="btn-outline flex-1 justify-center text-sm">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>
        </aside>
      </section>

      {/* ── § 02 · Editorial description ── */}
      {cleanDescription && (
        <section className="container mt-14 sm:mt-16 lg:mt-20 grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="tracker-muted flex items-center gap-3 mb-3">
              <span>§ 02</span>
              <span>·</span>
              <span>The Feature</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl leading-tight">
              A closer read.
            </h2>
            <div className="hairline-bottom mt-6" />
          </div>
          <div className="lg:col-span-8 font-serif text-base sm:text-lg leading-[1.8] text-foreground/90 max-w-3xl">
            <Streamdown>{cleanDescription}</Streamdown>
          </div>
        </section>
      )}

      {/* ── § 03 · Residence types + Amenities ── */}
      <section className="container mt-14 sm:mt-16 lg:mt-20">
        <div className="tracker-muted flex items-center gap-3 mb-6">
          <span>§ 03</span>
          <span>·</span>
          <span>Specifications</span>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="tracker-muted mb-3">Residence types</div>
            <div className="hairline-bottom mb-5" />
            <div className="grid grid-cols-2 gap-3">
              {unitTypes.length > 0 ? (
                unitTypes.map((u) => (
                  <div key={u} className="border border-border p-3 sm:p-4 flex items-center gap-3">
                    <Bed className="w-4 h-4 text-forest flex-shrink-0" />
                    <span className="font-serif text-base sm:text-lg">{u}</span>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-sm italic col-span-2">On enquiry</div>
              )}
            </div>
          </div>
          <div>
            <div className="tracker-muted mb-3">Amenities</div>
            <div className="hairline-bottom mb-5" />
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              {amenities.slice(0, 14).map((a) => {
                const Icon = AMENITY_ICONS[a.toLowerCase()] || Check;
                return (
                  <div key={a} className="flex items-center gap-2 text-sm">
                    <Icon className="w-3.5 h-3.5 text-forest flex-shrink-0" />
                    <span>{titleCaseTag(a)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── § 03b · Room types ── */}
      {roomTypes.length > 0 && (
        <section className="container mt-14 sm:mt-16 lg:mt-20">
          <div className="tracker-muted flex items-center gap-3 mb-6">
            <span>§ 03b</span>
            <span>·</span>
            <span>Room types &amp; rates</span>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[600px] text-sm border-collapse">
              <thead>
                <tr className="hairline-bottom">
                  <th className="text-left py-3 pr-4 tracker-muted font-normal">Room type</th>
                  <th className="text-left py-3 pr-4 tracker-muted font-normal">Beds</th>
                  <th className="text-left py-3 pr-4 tracker-muted font-normal">Size</th>
                  <th className="text-right py-3 tracker-muted font-normal">Indicative rate / month</th>
                </tr>
              </thead>
              <tbody>
                {roomTypes.map((rt) => (
                  <tr key={rt.id} className="hairline-bottom hover:bg-ivory-warm/40 transition-colors">
                    <td className="py-3.5 pr-4 font-serif text-base">{rt.name}</td>
                    <td className="py-3.5 pr-4 text-muted-foreground">
                      {rt.beds.length > 0 ? rt.beds.join(" · ") : "—"}
                    </td>
                    <td className="py-3.5 pr-4 text-muted-foreground">
                      {rt.sizeSqm ? `${rt.sizeSqm} m²` : "—"}
                    </td>
                    <td className="py-3.5 text-right font-medium">
                      {rt.price30NightsUsd
                        ? formatUSD(rt.price30NightsUsd)
                        : "On request"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground italic">
            Rates are indicative 30-night benchmarks sourced from Booking.com. Actual rates vary by date and availability.
          </p>
        </section>
      )}

      {/* ── § 04 · Location map ── */}
      {hasCoords && (
        <section className="container mt-14 sm:mt-16 lg:mt-20">
          <div className="tracker-muted flex items-center gap-3 mb-6">
            <span>§ 04</span>
            <span>·</span>
            <span>Location</span>
          </div>
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            <div className="lg:col-span-4">
              <div className="hairline-bottom mb-5" />
              <div className="font-serif text-2xl sm:text-3xl">
                {property.neighborhood ?? city?.name ?? ""}
              </div>
              {property.address && (
                <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{(() => {
                    // Deduplicate address: take only the first unique part before any repetition
                    const addr = property.address!;
                    const parts = addr.split(',').map(p => p.trim());
                    const seen = new Set<string>();
                    const unique = parts.filter(p => {
                      const key = p.toLowerCase().replace(/\s+/g, ' ');
                      if (seen.has(key)) return false;
                      seen.add(key);
                      return true;
                    });
                    return unique.join(', ');
                  })()}</span>
                </div>
              )}
              {city && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((property.address ?? property.name) + ", " + city.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-forest hover:underline"
                >
                  Open in Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="lg:col-span-8">
              <Suspense fallback={<div className="h-[360px] bg-ivory-warm border border-border flex items-center justify-center tracker-muted">Loading map…</div>}>
                <PropertyMap
                  lat={Number(property.latitude)}
                  lon={Number(property.longitude)}
                  name={property.name}
                  address={property.address ?? undefined}
                />
              </Suspense>
            </div>
          </div>
          {/* Nearby transit stops */}
          <NearbyTransit
            lat={Number(property.latitude)}
            lon={Number(property.longitude)}
          />
        </section>
      )}

      {(property.brand || property.officialUrl) && (
        <section className="container mt-14 sm:mt-16 lg:mt-20">
          <div className="tracker-muted flex items-center gap-3 mb-6">
            <span>§ 05</span>
            <span>·</span>
            <span>Operator</span>
          </div>
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            <div className="lg:col-span-4">
              <div className="hairline-bottom mb-5" />
              <div className="font-serif text-2xl sm:text-3xl">{property.brand ?? "Independent"}</div>
              {property.officialUrl && (
                <a href={property.officialUrl} target="_blank" rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-forest hover:underline">
                  Official website <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="lg:col-span-8">
              <div className="hairline-bottom mb-5" />
              <div className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {property.brand === "Cheval Collection" || property.brand === "Cheval Maison" || property.brand === "Cheval Residences"
                  ? "Cheval Collection is a family-owned portfolio of luxury serviced residences operating since 1981. Properties are independently managed with white-glove housekeeping, concierge, and long-stay packages tailored to executives and extended-stay guests."
                  : property.brand === "Locke" || property.brand === "Cove"
                  ? "Locke is a lifestyle aparthotel brand by Edyn, combining design-led interiors with flexible long-stay rates. Properties feature co-working spaces, curated F&B, and a community-first ethos suited to extended-stay professionals and creative travellers."
                  : "This property is operated by an independent or boutique operator. Contact the property directly for long-stay packages and corporate rates."}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── § 06 · Related residences ── */}
      {related3.length > 0 && city && (
        <section className="container mt-14 sm:mt-16 lg:mt-20">
          <div className="tracker-muted flex items-center gap-3 mb-3">
            <span>§ 06</span>
            <span>·</span>
            <span>Also in {city.name}</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl mt-1 mb-6 sm:mb-8">Nearby residences to consider.</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-8 sm:gap-y-10">
            {related3.map((r: any) => (
              <Link key={r.id} href={`/properties/${r.slug}`} className="group block">
                <div className="aspect-[4/3] overflow-hidden bg-ivory-warm border border-border">
                  {r.heroImageUrl && (
                    <img
                      src={r.heroImageUrl}
                      alt={r.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="pt-3">
                  <div className="tracker-muted">{r.category}</div>
                  <div className="font-serif text-xl mt-1 group-hover:text-forest">{r.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{r.neighborhood}</div>
                  <div className="text-sm mt-2">
                    {r.priceFromMonthlyUsd
                      ? `From ${formatUSD(r.priceFromMonthlyUsd)}/mo`
                      : "Rates on request"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Save to shortlist dialog ── */}
      {showSave && isAuthenticated && (
        <div
          className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
          onClick={() => setShowSave(false)}
        >
          <div
            className="bg-background max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tracker-muted">Save to Shortlist</div>
            <h3 className="font-serif text-2xl mt-2">Where should we file this?</h3>
            <div className="hairline-bottom mt-4 mb-6" />
            <div className="space-y-2">
              {(myShortlists as any[]).map((s: any) => (
                <button
                  key={s.id}
                  className="w-full text-left p-3 border border-border hover:border-forest transition-colors"
                  onClick={() => {
                    addToShortlist.mutate({ shortlistId: s.id, propertyId: property.id });
                    setShowSave(false);
                  }}
                >
                  <div className="font-serif text-lg">{s.title}</div>
                </button>
              ))}
              <button
                className="w-full p-3 border border-dashed border-forest text-forest font-serif text-sm"
                onClick={() => {
                  createShortlist.mutate({
                    title: `Shortlist — ${city?.name ?? property.name}`,
                  });
                  setShowSave(false);
                }}
              >
                + Create new shortlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
