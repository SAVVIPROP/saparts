import type { Metadata } from "next";
import Link from "next/link";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchForm } from "@/components/SearchForm";
import { Pagination } from "@/components/Pagination";
import { COLLECTIONS } from "@/lib/collections";
import {
  getCity,
  getLaunchCities,
  paginate,
  searchProperties,
  uniqueBrands,
  uniqueCategories,
  uniqueNeighborhoods,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Directory",
  description: "Search the SAparts register by city, neighbourhood, brand, category, and collection.",
};

type SP = {
  q?: string;
  city?: string;
  neighborhood?: string;
  brand?: string;
  category?: string;
  unitType?: string;
  bestFor?: string;
  collection?: string;
  page?: string;
};

function qs(filters: SP, page?: number) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (k === "page") continue;
    if (v) p.set(k, v);
  }
  if (page && page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `/search?${s}` : "/search";
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const filters = await searchParams;
  const cities = getLaunchCities();
  const results = searchProperties({
    q: filters.q,
    city: filters.city,
    neighborhood: filters.neighborhood,
    brand: filters.brand,
    category: filters.category,
    unitType: filters.unitType,
    bestFor: filters.bestFor,
    collection: filters.collection,
  });
  const page = Number(filters.page) || 1;
  const { items, total, pages, page: current } = paginate(results, page);
  const neighborhoods = uniqueNeighborhoods(filters.city);
  const brands = uniqueBrands(filters.city);
  const categories = uniqueCategories(filters.city);

  return (
    <div>
      <section className="hairline-bottom">
        <div className="container py-3 flex items-center gap-2 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <span>Directory</span>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-12 lg:py-16">
          <span className="section-mark">§ 02</span>
          <h1 className="display text-[3rem] sm:text-[4.2rem] mt-5">
            The directory, <em>filtered.</em>
          </h1>
          <p className="mt-5 font-serif text-[1.1rem] text-muted-foreground max-w-2xl">
            {total.toLocaleString()} residences match the current brief. Results are paginated — twenty-four to a folio.
          </p>
          <div className="mt-8">
            <SearchForm
              cities={cities}
              neighborhoods={neighborhoods}
              brands={brands}
              categories={categories}
              collections={COLLECTIONS}
              initial={filters}
            />
          </div>
        </div>
      </section>
      <section>
        <div className="container py-12">
          <div className="tracker-muted mb-6">
            {total} {total === 1 ? "residence" : "residences"}
            {pages > 1 ? ` · page ${current} of ${pages}` : ""}
          </div>
          {items.length === 0 ? (
            <div className="paper p-8 sm:p-12">
              <h2 className="display text-3xl">Nothing matches this brief.</h2>
              <p className="mt-4 text-muted-foreground max-w-xl leading-relaxed">
                Clear a filter, or open a city dossier. We will not invent inventory to fill the page.
              </p>
              <Link href="/cities" className="btn-ghost mt-6">Open the atlas ↗︎</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {items.map((listing) => (
                <PropertyCard key={listing.slug} listing={listing} city={getCity(listing.citySlug)} />
              ))}
            </div>
          )}
          <Pagination page={current} pages={pages} hrefFor={(p) => qs(filters, p)} />
        </div>
      </section>
    </div>
  );
}
