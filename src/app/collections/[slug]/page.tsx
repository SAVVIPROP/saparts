import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COLLECTIONS, getCollection } from "@/lib/collections";
import { getCity, listingsForCollection, paginate } from "@/lib/data";
import { PropertyCard } from "@/components/PropertyCard";
import { Pagination } from "@/components/Pagination";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const col = getCollection(slug);
  if (!col) return { title: "Collection" };
  return { title: col.title, description: col.subtitle };
}

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const col = getCollection(slug);
  if (!col) notFound();
  const matches = listingsForCollection(slug);
  const { items, total, pages, page } = paginate(matches, Number(sp.page) || 1);

  return (
    <div>
      <section className="hairline-bottom">
        <div className="container py-3 flex items-center gap-2 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <Link href="/collections" className="hover:text-forest">Collections</Link>
          <span>/</span>
          <span>{col.title}</span>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <span className="section-mark">{col.symbol}</span>
            <h1 className="display text-[2.8rem] sm:text-[4.2rem] mt-5">{col.title}</h1>
            <p className="mt-5 font-serif text-[1.15rem] text-muted-foreground max-w-2xl leading-relaxed">{col.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {col.tags.map((tag) => (
                <span key={tag} className="tracker-muted border border-border px-2 py-1">{tag}</span>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 paper p-6">
            <div className="stat-label">Residences matching this brief</div>
            <div className="stat-value mt-2">{total}</div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Heuristic match on amenities and unit types already filed. Empty is allowed.
            </p>
          </div>
        </div>
      </section>
      <section>
        <div className="container py-12">
          {items.length === 0 ? (
            <div className="paper p-8 sm:p-12">
              <h2 className="display text-3xl">No residences match this collection yet.</h2>
              <p className="mt-4 text-muted-foreground max-w-xl leading-relaxed">
                Membership is inferred from source fields. We will not invent a shortlist to fill the page.
              </p>
              <Link href="/search" className="btn-ghost mt-6">Browse the directory ↗︎</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {items.map((listing) => (
                <PropertyCard key={listing.slug} listing={listing} city={getCity(listing.citySlug)} />
              ))}
            </div>
          )}
          <Pagination page={page} pages={pages} hrefFor={(p) => (p > 1 ? `/collections/${slug}?page=${p}` : `/collections/${slug}`)} />
        </div>
      </section>
    </div>
  );
}
