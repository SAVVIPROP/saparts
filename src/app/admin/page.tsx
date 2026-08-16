import type { Metadata } from "next";
import Link from "next/link";
import { directoryStats, getAllProperties, getCity, paginate, cityListingCounts } from "@/lib/data";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { galleryUrls } from "@/lib/media";

export const metadata: Metadata = {
  title: "Administration",
  description: "Read-only directory of the SAparts register. No login, no writes.",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const stats = directoryStats();
  const q = (sp.q ?? "").trim().toLowerCase();
  const all = getAllProperties().filter((p) => {
    if (!q) return true;
    return [p.name, p.slug, p.citySlug, p.brand, p.neighborhood].filter(Boolean).join(" ").toLowerCase().includes(q);
  });
  const { items, total, pages, page } = paginate(all, Number(sp.page) || 1, ADMIN_PAGE_SIZE);
  const counts = cityListingCounts();

  return (
    <div>
      <section className="hairline-bottom">
        <div className="container py-12 lg:py-16">
          <span className="section-mark">Register</span>
          <h1 className="display text-[3rem] sm:text-[4.2rem] mt-5">
            Administration, <em>read-only.</em>
          </h1>
          <p className="mt-5 font-serif text-[1.1rem] text-muted-foreground max-w-2xl leading-relaxed">
            No login and no hosted authentication. This screen lists what the official packs actually contain. Writes are not connected. This page is not linked from the public footer.
          </p>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ["Residences", String(stats.properties)],
            ["Launch cities", String(stats.launchCities)],
            ["With usable photos", String(stats.withPhotos)],
            ["With filed prices", String(stats.withPrices)],
            ["Brands", String(stats.brands)],
            ["Forthcoming cities", String(stats.forthcomingCities)],
            ["Tier I (scores ≥ 9)", String(stats.tierI)],
            ["Import path", "data/properties/*.json"],
          ].map(([label, value]) => (
            <div key={label} className="paper p-5">
              <div className="stat-label">{label}</div>
              <div className="mt-2 font-serif text-2xl break-words">{value}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-8">
          <div className="tracker-muted mb-3">Counts by city pack</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([slug, n]) => (
                <Link key={slug} href={`/cities/${slug}`} className="border border-border px-3 py-1 text-sm">
                  {getCity(slug)?.name ?? slug} · {n}
                </Link>
              ))}
          </div>
        </div>
      </section>
      <section>
        <div className="container py-10">
          <form className="mb-6 flex gap-3" action="/admin">
            <input className="field max-w-md" name="q" defaultValue={sp.q ?? ""} placeholder="Filter by name, slug, city, brand" />
            <button className="btn-primary" type="submit">Filter</button>
          </form>
          <div className="tracker-muted mb-4">{total} rows · page {page} of {pages}</div>
          <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm">
              <thead className="bg-ivory-warm tracker-muted text-left">
                <tr>
                  <th className="p-3 font-normal">Residence</th>
                  <th className="p-3 font-normal">City</th>
                  <th className="p-3 font-normal">Category</th>
                  <th className="p-3 font-normal">Photos</th>
                  <th className="p-3 font-normal">Rate</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.slug} className="border-t border-border">
                    <td className="p-3">
                      <Link href={`/properties/${p.slug}`} className="hover:text-forest">{p.name}</Link>
                      <div className="tracker-muted">{p.slug}</div>
                    </td>
                    <td className="p-3">{getCity(p.citySlug)?.name ?? p.citySlug}</td>
                    <td className="p-3">{p.category ?? "—"}</td>
                    <td className="p-3">{galleryUrls(p).length}</td>
                    <td className="p-3">{formatPrice(p) ?? "On request"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="mt-6 flex justify-center gap-3">
              {page > 1 && (
                <Link href={`/admin?${new URLSearchParams({ ...(q ? { q: sp.q! } : {}), page: String(page - 1) }).toString()}`} className="btn-outline">Previous</Link>
              )}
              <span className="tracker-muted self-center">Page {page} of {pages}</span>
              {page < pages && (
                <Link href={`/admin?${new URLSearchParams({ ...(q ? { q: sp.q! } : {}), page: String(page + 1) }).toString()}`} className="btn-outline">Next</Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
