import type { Metadata } from "next";
import Link from "next/link";
import { decodeShareToken } from "@/lib/share";
import { getCity, listingsBySlugs } from "@/lib/data";
import { PropertyCard } from "@/components/PropertyCard";

export const metadata: Metadata = {
  title: "Shared shortlist",
  description: "A shared SAparts reading list.",
};

export default async function SharedShortlistPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const slugs = decodeShareToken(token);
  const listings = listingsBySlugs(slugs);
  const missing = slugs.length - listings.length;

  return (
    <div>
      <section className="hairline-bottom">
        <div className="container py-3 flex items-center gap-2 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <Link href="/account/shortlists" className="hover:text-forest">Shortlists</Link>
          <span>/</span>
          <span>Shared</span>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-12 lg:py-16">
          <span className="section-mark">Shared list</span>
          <h1 className="display text-[3rem] sm:text-[4.2rem] mt-5">
            A reading list, <em>passed on.</em>
          </h1>
          <p className="mt-5 font-serif text-[1.1rem] text-muted-foreground max-w-2xl">
            {listings.length} {listings.length === 1 ? "residence" : "residences"} resolved from the register
            {missing > 0 ? ` · ${missing} slug${missing === 1 ? "" : "s"} no longer on file` : ""}.
          </p>
        </div>
      </section>
      <section>
        <div className="container py-12">
          {listings.length === 0 ? (
            <div className="paper p-8 sm:p-12">
              <h2 className="display text-3xl">This token did not resolve.</h2>
              <p className="mt-4 text-muted-foreground max-w-xl leading-relaxed">
                The link may be damaged, or the residences have left the pack. Open the directory instead.
              </p>
              <Link href="/search" className="btn-ghost mt-6">Browse the directory ↗︎</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {listings.map((listing) => (
                <PropertyCard key={listing.slug} listing={listing} city={getCity(listing.citySlug)} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
