import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchForm } from "@/components/SearchForm";
import { getCity, getLaunchCities, searchProperties, uniqueBrands, uniqueNeighborhoods } from "@/lib/data";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the SAparts directory by city, neighbourhood, and brand.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; neighborhood?: string; brand?: string }>;
}) {
  const filters = await searchParams;
  const cities = getLaunchCities();
  const results = searchProperties(filters);
  const neighborhoods = uniqueNeighborhoods(filters.city);
  const brands = uniqueBrands(filters.city);

  return (
    <div>
      <Breadcrumb items={[{ label: "Directory" }]} />
      <section className="hairline-bottom">
        <div className="container py-12 lg:py-16">
          <span className="section-mark">§ 02</span>
          <h1 className="display text-[3rem] sm:text-[4.2rem] mt-5">
            The directory, <em>filtered.</em>
          </h1>
          <p className="mt-5 font-serif text-[1.1rem] text-muted-foreground max-w-2xl">
            Filter by city, neighbourhood, and brand. Results appear when an ENRICHED.json pack has been imported.
          </p>
          <div className="mt-8">
            <SearchForm cities={cities} neighborhoods={neighborhoods} brands={brands} initial={filters} />
          </div>
        </div>
      </section>
      <section>
        <div className="container py-12">
          <div className="tracker-muted mb-6">
            {results.length} {results.length === 1 ? "residence" : "residences"}
          </div>
          {results.length === 0 ? (
            <div className="paper p-8 sm:p-12">
              <h2 className="display text-3xl">Nothing matches — or nothing has been imported.</h2>
              <p className="mt-4 text-muted-foreground max-w-xl leading-relaxed">
                Launch city files start as empty arrays. Import a listing pack, then filter by city, neighbourhood, or
                brand.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((listing) => (
                <PropertyCard key={listing.slug} listing={listing} city={getCity(listing.citySlug)} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
