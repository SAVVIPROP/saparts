import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getCities, getPropertiesForCity } from "@/lib/data";
import { regionOrder } from "@/lib/format";

export const metadata: Metadata = {
  title: "Cities",
  description: "Launch cities in the SAparts Atlas — an independent index of serviced apartments.",
};

export default function CitiesPage() {
  const cities = [...getCities()].sort((a, b) => {
    const launch = Number(Boolean(b.launch)) - Number(Boolean(a.launch));
    if (launch) return launch;
    const region = regionOrder(a.region) - regionOrder(b.region);
    if (region) return region;
    return a.name.localeCompare(b.name);
  });
  const launch = cities.filter((c) => c.launch);
  const later = cities.filter((c) => !c.launch);

  return (
    <div>
      <Breadcrumb items={[{ label: "Cities" }]} />
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <span className="section-mark">§ 01</span>
            <h1 className="display text-[3rem] sm:text-[4.5rem] mt-5">
              The Atlas, <em>by city.</em>
            </h1>
            <p className="mt-6 font-serif text-[1.1rem] text-muted-foreground max-w-2xl leading-relaxed">
              Seven launch markets open the register. Forthcoming cities are listed as stubs until a listing pack is
              imported. Counts reflect imported inventory only.
            </p>
          </div>
          <div className="lg:col-span-4 paper p-6">
            <div className="stat-label">Launch markets</div>
            <div className="stat-value mt-1">{launch.length}</div>
            <div className="tracker-muted mt-3">{later.length} forthcoming stubs</div>
          </div>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-12 lg:py-16">
          <div className="tracker-muted mb-6">Launch cities</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {launch.map((city) => {
              const count = getPropertiesForCity(city.slug).length;
              return (
                <Link key={city.slug} href={`/cities/${city.slug}`} className="paper p-6 hover:border-charcoal">
                  <div className="tracker-muted">
                    {city.region} · {city.currency}
                  </div>
                  <h2 className="display text-[2rem] mt-3">{city.name}</h2>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{city.tagline}</p>
                  <div className="tracker mt-5">{count} {count === 1 ? "residence" : "residences"} filed</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      {later.length > 0 && (
        <section>
          <div className="container py-12 lg:py-16">
            <div className="tracker-muted mb-6">Forthcoming stubs</div>
            <div className="hairline-top">
              {later.map((city) => (
                <Link
                  key={city.slug}
                  href={`/cities/${city.slug}`}
                  className="grid grid-cols-12 gap-3 py-4 hairline-bottom items-baseline hover:bg-ivory-warm/60"
                >
                  <div className="col-span-4 sm:col-span-3 font-serif text-xl">{city.name}</div>
                  <div className="col-span-5 sm:col-span-5 tracker-muted">{city.country}</div>
                  <div className="col-span-3 tracker-muted text-right">{city.region}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
