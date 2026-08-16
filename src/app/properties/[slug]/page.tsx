import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PropertyGallery } from "@/components/PropertyGallery";
import { PropertyMedia } from "@/components/PropertyMedia";
import { PropertyCard } from "@/components/PropertyCard";
import { getAllProperties, getCity, getProperty, getPropertiesForCity } from "@/lib/data";
import { formatPrice, unitTypeMeta, unitTypeName } from "@/lib/format";

export async function generateStaticParams() {
  return getAllProperties().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = getProperty(slug);
  if (!listing) return { title: "Residence" };
  const city = getCity(listing.citySlug);
  return {
    title: `${listing.name}${city ? ` — ${city.name}` : ""}`,
    description: listing.tagline || listing.description?.slice(0, 160) || `${listing.name} serviced apartment.`,
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = getProperty(slug);
  if (!listing) notFound();
  const city = getCity(listing.citySlug);
  const price = formatPrice(listing);
  const related = getPropertiesForCity(listing.citySlug)
    .filter((p) => p.slug !== listing.slug)
    .slice(0, 3);

  return (
    <div>
      <Breadcrumb
        items={[
          { href: "/cities", label: "Cities" },
          city ? { href: `/cities/${city.slug}`, label: city.name } : { label: listing.citySlug },
          { label: listing.name },
        ]}
      />

      <section className="hairline-bottom">
        <div className="container py-8 lg:py-12">
          <PropertyGallery listing={listing} />
          <div className="grid lg:grid-cols-12 gap-10 mt-10 items-start">
            <div className="lg:col-span-8">
              <div className="tracker-muted">
                {[listing.category, listing.brand, listing.neighborhood || city?.name].filter(Boolean).join(" · ")}
              </div>
              <h1 className="display text-[2.6rem] sm:text-[3.6rem] mt-3">{listing.name}</h1>
              {listing.tagline && (
                <p className="mt-4 font-serif text-[1.15rem] text-muted-foreground leading-relaxed">{listing.tagline}</p>
              )}
              {listing.address && <p className="mt-4 text-sm text-muted-foreground">{listing.address}</p>}
              {listing.description && (
                <div className="editorial-body mt-8">
                  {listing.description.split(/\n{2,}/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}
            </div>
            <aside className="lg:col-span-4 space-y-3">
              {city && (
                <div className="paper p-4 flex justify-between">
                  <span className="tracker-muted">City</span>
                  <Link href={`/cities/${city.slug}`} className="hover:text-forest">
                    {city.name}
                  </Link>
                </div>
              )}
              {listing.neighborhood && (
                <div className="paper p-4 flex justify-between">
                  <span className="tracker-muted">Neighbourhood</span>
                  <span>{listing.neighborhood}</span>
                </div>
              )}
              {listing.operatorGroup && (
                <div className="paper p-4 flex justify-between">
                  <span className="tracker-muted">Operator</span>
                  <span>{listing.operatorGroup}</span>
                </div>
              )}
              {listing.minStayNights ? (
                <div className="paper p-4 flex justify-between">
                  <span className="tracker-muted">Minimum stay</span>
                  <span>{listing.minStayNights} nights</span>
                </div>
              ) : null}
              {price && (
                <div className="paper p-4">
                  <div className="tracker-muted">From the source file</div>
                  <div className="font-serif text-xl mt-1">{price}</div>
                  {listing.priceNotes && <p className="mt-2 text-sm text-muted-foreground">{listing.priceNotes}</p>}
                </div>
              )}
              <div className="flex flex-col gap-2 pt-2">
                {listing.officialUrl && (
                  <a href={listing.officialUrl} target="_blank" rel="noreferrer" className="btn-primary">
                    Official site ↗︎
                  </a>
                )}
                {listing.bookingUrl && (
                  <a href={listing.bookingUrl} target="_blank" rel="noreferrer" className="btn-outline">
                    Booking link ↗︎
                  </a>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {listing.amenities && listing.amenities.length > 0 && (
        <section className="hairline-bottom">
          <div className="container py-12 lg:py-16 grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-3">
              <span className="section-mark">Amenities</span>
              <h2 className="display text-[2rem] mt-4">On the premises.</h2>
            </div>
            <ul className="lg:col-span-9 grid sm:grid-cols-2 gap-3">
              {listing.amenities.map((item) => (
                <li key={item} className="paper px-4 py-3 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {listing.unitTypes && listing.unitTypes.length > 0 && (
        <section className="hairline-bottom">
          <div className="container py-12 lg:py-16 grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-3">
              <span className="section-mark">Units</span>
              <h2 className="display text-[2rem] mt-4">Apartment types.</h2>
            </div>
            <div className="lg:col-span-9 space-y-3">
              {listing.unitTypes.map((unit, i) => {
                const meta = unitTypeMeta(unit);
                const facilities = typeof unit === "object" && Array.isArray(unit.facilities) ? unit.facilities : [];
                return (
                  <div key={`${unitTypeName(unit)}-${i}`} className="paper p-5">
                    <div className="font-serif text-xl">{unitTypeName(unit)}</div>
                    {meta.length > 0 && <div className="tracker-muted mt-2">{meta.join(" · ")}</div>}
                    {facilities.length > 0 && (
                      <p className="mt-3 text-sm text-muted-foreground">{facilities.join(" · ")}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <PropertyMedia listing={listing} />

      {listing.layoutUrls && listing.layoutUrls.length > 0 && (
        <section className="hairline-bottom">
          <div className="container py-12">
            <div className="section-mark mb-4">Floor plans</div>
            <div className="flex flex-wrap gap-3">
              {listing.layoutUrls.map((url) => (
                <a key={url} href={url} target="_blank" rel="noreferrer" className="btn-outline">
                  Layout
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {listing.sources && listing.sources.length > 0 && (
        <section className="hairline-bottom">
          <div className="container py-10">
            <div className="tracker-muted mb-3">Sources</div>
            <ul className="space-y-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
              {listing.sources.map((src) => (
                <li key={src}>
                  <a href={src} className="text-forest hover:underline" target="_blank" rel="noreferrer">
                    {src}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section>
          <div className="container py-12 lg:py-16">
            <div className="section-mark mb-6">Also in {city?.name ?? listing.citySlug}</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((item) => (
                <PropertyCard key={item.slug} listing={item} city={city} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
