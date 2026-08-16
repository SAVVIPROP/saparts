import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PropertyCard } from "@/components/PropertyCard";
import { getCity, getCities, getPropertiesForCity } from "@/lib/data";

export async function generateStaticParams() {
  return getCities().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) return { title: "City" };
  return {
    title: `${city.name} serviced apartments`,
    description: city.tagline || `Serviced apartments and aparthotels in ${city.name}.`,
  };
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();
  const listings = getPropertiesForCity(city.slug);

  return (
    <div>
      <Breadcrumb items={[{ href: "/cities", label: "Cities" }, { label: city.name }]} />
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <span className="section-mark">{city.launch ? "Launch city" : "Forthcoming"}</span>
            <h1 className="display text-[3rem] sm:text-[4.5rem] mt-5">{city.name}.</h1>
            {city.tagline && (
              <p className="mt-6 font-serif text-[1.15rem] text-muted-foreground max-w-2xl leading-relaxed">
                {city.tagline}
              </p>
            )}
          </div>
          <div className="lg:col-span-4 space-y-3">
            <div className="paper p-4 flex justify-between">
              <span className="tracker-muted">Country</span>
              <span>{city.country}</span>
            </div>
            <div className="paper p-4 flex justify-between">
              <span className="tracker-muted">Region</span>
              <span>{city.region}</span>
            </div>
            <div className="paper p-4 flex justify-between">
              <span className="tracker-muted">Currency</span>
              <span>{city.currency}</span>
            </div>
            <div className="paper p-4 flex justify-between">
              <span className="tracker-muted">Residences filed</span>
              <span>{listings.length}</span>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="container py-12 lg:py-16">
          {listings.length === 0 ? (
            <div className="paper p-8 sm:p-12">
              <div className="tracker-muted">Empty city file</div>
              <h2 className="display text-3xl mt-3">No residences imported for {city.name}.</h2>
              <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
                <code className="font-mono text-sm">data/properties/{city.slug}.json</code> is an empty array until an
                ENRICHED.json pack is imported. The atlas will not invent inventory or rates.
              </p>
              <Link href="/search" className="btn-ghost mt-6">
                Search other cities ↗︎
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((listing) => (
                <PropertyCard key={listing.slug} listing={listing} city={city} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
