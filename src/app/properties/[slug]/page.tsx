import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProperties, getCity, getProperty, relatedInCity } from "@/lib/data";
import { cleanDescription, dedupeAddress, formatPrice, publicPriceNote, titleCaseTag, unitTypeMeta, unitTypeName } from "@/lib/format";
import { isMatterportUrl } from "@/lib/media";
import { PropertyGallery } from "@/components/PropertyGallery";
import { PropertyMedia } from "@/components/PropertyMedia";
import { PropertyMap } from "@/components/PropertyMap";
import { PropertyCard } from "@/components/PropertyCard";
import { BookmarkButton } from "@/components/BookmarkButton";
import { PropertyActions } from "./PropertyActions";
import { Bed, Check, ExternalLink, MapPin, ArrowRight } from "@/components/icons";
import { cardImageUrl } from "@/lib/media";
import { listingJsonLd } from "@/lib/seo";

export async function generateStaticParams() {
  return getAllProperties().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = getProperty(slug);
  if (!listing) return { title: "Residence" };
  const city = getCity(listing.citySlug);
  const image = cardImageUrl(listing);
  const title = `${listing.name}${city ? ` — ${city.name}` : ""}`;
  const description = listing.tagline || listing.description?.slice(0, 160) || `${listing.name} serviced apartment in ${city?.name ?? "the SAparts directory"}.`;
  return {
    title,
    description,
    alternates: { canonical: `/properties/${listing.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/properties/${listing.slug}`,
      images: image && image.startsWith("/listings/") ? [{ url: image, alt: listing.name }] : undefined,
    },
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = getProperty(slug);
  if (!listing) notFound();
  const city = getCity(listing.citySlug);
  const price = formatPrice(listing);
  const note = publicPriceNote(listing);
  const related = relatedInCity(listing, 3);
  const unitTypes = (listing.unitTypes ?? []).map(unitTypeName).filter(Boolean);
  const amenities = listing.amenities ?? [];
  const desc = cleanDescription(listing.description);
  const hasCoords = listing.latitude != null && listing.longitude != null;
  const image = cardImageUrl(listing);
  const address = dedupeAddress(listing.address);
  const tour = listing.virtualTourUrl && !isMatterportUrl(listing.virtualTourUrl) ? listing.virtualTourUrl : null;

  const jsonLd = listingJsonLd(listing, city);
  return (
    <div className="pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="hairline-bottom">
        <div className="container py-3 flex items-center gap-2 tracker-muted overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <Link href="/cities" className="hover:text-forest">Atlas</Link>
          {city && (
            <>
              <span>/</span>
              <Link href={`/cities/${city.slug}`} className="hover:text-forest">{city.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground">{listing.name}</span>
        </div>
      </div>

      <section className="container pt-6 sm:pt-8 lg:pt-10">
        <PropertyGallery listing={listing} />
      </section>

      <section className="container mt-8 sm:mt-10 lg:mt-12 grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-7">
          <div className="tracker-muted flex items-center gap-3 mb-3">
            <span>§ 01</span>
            <span>·</span>
            <span>{listing.category ?? "Serviced Apartment"}</span>
            {city && <><span>·</span><span>{city.name}</span></>}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] break-words">{listing.name}</h1>
          {listing.brand && <div className="mt-2 tracker-muted">by {listing.brand}</div>}
          {listing.neighborhood && (
            <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{listing.neighborhood}{city ? `, ${city.name}` : ""}</span>
            </div>
          )}
          {listing.tagline && <p className="mt-5 font-serif text-lg text-muted-foreground leading-relaxed">{listing.tagline}</p>}
        </div>
        <aside className="lg:col-span-5 lg:sticky lg:top-28">
          <div className="border border-border bg-background p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="tracker-muted mb-1">Rate indication</div>
                <div className="font-serif text-2xl">{price ?? "On request"}</div>
                {note && (
                  <div className="tracker-muted mt-1">{note}</div>
                )}
              </div>
              <BookmarkButton
                property={{
                  id: listing.slug,
                  slug: listing.slug,
                  name: listing.name,
                  cityName: city?.name,
                  category: listing.category ?? undefined,
                  heroImageUrl: image,
                  priceFromMonthlyUsd: listing.priceFromMonthlyUsd ?? null,
                }}
                size="md"
              />
            </div>
            <div className="hairline-bottom mb-4" />
            <div className="space-y-2.5 text-sm mb-5">
              {listing.minStayNights != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min. stay</span>
                  <span>{listing.minStayNights} nights</span>
                </div>
              )}
              {listing.operatorGroup && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operator</span>
                  <span>{listing.operatorGroup}</span>
                </div>
              )}
            </div>
            <div className="space-y-2.5">
              <a
                href={`mailto:reservations@saparts.com?subject=${encodeURIComponent(`Enquiry: ${listing.name}`)}&body=${encodeURIComponent(`Hello,\n\nI am interested in ${listing.name}.\n\nPlease send availability and rates.\n`)}`}
                className="btn-primary w-full justify-center"
              >
                Book Direct <ArrowRight className="w-3.5 h-3.5" />
              </a>
              {listing.officialUrl && (
                <a href={listing.officialUrl} target="_blank" rel="noreferrer" className="btn-ghost w-full justify-center">
                  Visit official website <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {listing.bookingUrl && listing.bookingUrl !== listing.officialUrl && (
                <a href={listing.bookingUrl} target="_blank" rel="noreferrer" className="btn-outline w-full justify-center">
                  Booking link <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <div className="hairline-top mt-5 pt-4">
              <PropertyActions name={listing.name} />
            </div>
          </div>
        </aside>
      </section>

      {desc && (
        <section className="container mt-14 sm:mt-16 lg:mt-20 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="tracker-muted flex items-center gap-3 mb-3"><span>§ 02</span><span>·</span><span>The Feature</span></div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl leading-tight">A closer read.</h2>
          </div>
          <div className="lg:col-span-8 editorial-body font-serif">
            {desc.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>
      )}

      <section className="container mt-14 sm:mt-16 lg:mt-20">
        <div className="tracker-muted flex items-center gap-3 mb-6"><span>§ 03</span><span>·</span><span>Specifications</span></div>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="tracker-muted mb-3">Residence types</div>
            <div className="hairline-bottom mb-5" />
            <div className="grid grid-cols-2 gap-3">
              {unitTypes.length > 0 ? (
                listing.unitTypes!.map((u, i) => (
                  <div key={`${unitTypeName(u)}-${i}`} className="border border-border p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <Bed className="w-4 h-4 text-forest shrink-0" />
                      <span className="font-serif text-base sm:text-lg">{unitTypeName(u)}</span>
                    </div>
                    {unitTypeMeta(u).length > 0 && (
                      <div className="tracker-muted mt-2">{unitTypeMeta(u).join(" · ")}</div>
                    )}
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
              {amenities.slice(0, 16).map((a) => (
                <div key={a} className="flex items-center gap-2 text-sm">
                  <Check className="w-3.5 h-3.5 text-forest shrink-0" />
                  <span>{titleCaseTag(a)}</span>
                </div>
              ))}
              {amenities.length === 0 && <div className="text-muted-foreground text-sm italic col-span-2">On enquiry</div>}
            </div>
          </div>
        </div>
      </section>

      {hasCoords && (
        <section className="container mt-14 sm:mt-16 lg:mt-20">
          <div className="tracker-muted flex items-center gap-3 mb-6"><span>§ 04</span><span>·</span><span>Location</span></div>
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            <div className="lg:col-span-4">
              <div className="font-serif text-2xl sm:text-3xl">{listing.neighborhood ?? city?.name ?? ""}</div>
              {address && (
                <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{address}</span>
                </div>
              )}
              {city && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((address ?? listing.name) + ", " + city.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-forest hover:underline"
                >
                  Open in Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="lg:col-span-8">
              <PropertyMap lat={Number(listing.latitude)} lon={Number(listing.longitude)} name={listing.name} />
            </div>
          </div>
        </section>
      )}

      <PropertyMedia listing={listing} />

      {listing.layoutUrls && listing.layoutUrls.length > 0 && (
        <section className="container mt-14">
          <div className="tracker-muted mb-4">§ 05 · Floor plans</div>
          <div className="flex flex-wrap gap-3">
            {listing.layoutUrls.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="btn-outline">Layout ↗︎</a>
            ))}
          </div>
        </section>
      )}

      {tour && (
        <section className="container mt-10">
          <a href={tour} target="_blank" rel="noreferrer" className="btn-ghost">Virtual tour ↗︎</a>
        </section>
      )}

      {related.length > 0 && city && (
        <section className="container mt-14 sm:mt-16 lg:mt-20">
          <div className="tracker-muted flex items-center gap-3 mb-3"><span>§ 06</span><span>·</span><span>Also in {city.name}</span></div>
          <h3 className="font-serif text-2xl sm:text-3xl mt-1 mb-8">Nearby residences to consider.</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {related.map((r) => (
              <PropertyCard key={r.slug} listing={r} city={city} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
