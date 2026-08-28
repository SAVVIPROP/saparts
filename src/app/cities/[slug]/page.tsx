import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCity, getCities, getPropertiesForCity, cityMedianMonthlyUsd } from "@/lib/data";
import { cityRegisterBrief, summarizeCityPack } from "@/lib/city-brief";
import { CityRegister } from "./CityRegister";

export async function generateStaticParams() {
  return getCities().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) return { title: "City" };
  return {
    title: `${city.name} serviced apartments`,
    description: city.tagline || `The SAparts dossier for ${city.name}.`,
  };
}

export default async function CityHubPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; district?: string; category?: string; unitType?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const city = getCity(slug);
  if (!city) notFound();
  const properties = getPropertiesForCity(city.slug);
  const summary = summarizeCityPack(properties);
  const districts = [...summary.districts].sort((a, b) => a.name.localeCompare(b.name)).map((d) => d.name);
  const brief = cityRegisterBrief(city.name, summary);
  const median = cityMedianMonthlyUsd(city.slug);
  const empty = properties.length === 0;

  return (
    <div>
      <section className="hairline-bottom">
        <div className="container py-4 flex items-center gap-3 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <Link href="/cities" className="hover:text-forest">Atlas</Link>
          <span>/</span>
          <span>{city.name}</span>
        </div>
      </section>

      <section className="hairline-bottom">
        <div className="container py-10 sm:py-14 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <span className="section-mark">{empty ? "REGISTER" : "DOSSIER"}</span>
              <span className="eyebrow">{city.region} · {city.country}</span>
            </div>
            <h1 className="display text-[2.8rem] sm:text-[3.6rem] md:text-[5rem] lg:text-[6.4rem] leading-[0.95]">{city.name}.</h1>
            {city.tagline && (
              <p className="mt-6 text-[1.15rem] text-muted-foreground max-w-xl leading-[1.65] font-serif italic">{city.tagline}</p>
            )}
            {city.currency && (
              <div className="mt-6 tracker-muted">{city.currency} · filed with the listing pack</div>
            )}
          </div>
          <div className="lg:col-span-5 paper p-5 sm:p-6 lg:p-7 grid grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <div className="stat-label">Residences</div>
              <div className="stat-value mt-1">{properties.length}</div>
            </div>
            <div>
              <div className="stat-label">Avg. monthly</div>
              <div className="stat-value mt-1">{median ? `$${(median / 1000).toFixed(1)}k` : "—"}</div>
            </div>
            <div className="col-span-2 hairline-top pt-4">
              <div className="tracker-muted">
                {districts.length ? `${districts.length} districts on file` : "Districts on file"}
              </div>
              <div className="mt-2 font-serif leading-relaxed">
                {districts.length ? districts.join(" · ") : "None filed in this volume."}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-3">
            <span className="section-mark">§ 01</span>
            <h2 className="display text-[2rem] mt-4">The Brief.</h2>
          </div>
          <div className="lg:col-span-9">
            <div className="p-4 bg-ivory-warm border border-border">
              <div className="tracker-muted mb-2">From the listing pack</div>
              <div className="space-y-3">
                {brief.map((para) => (
                  <p key={para} className="text-[0.95rem] leading-relaxed font-serif">{para}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container py-12 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-8 mb-8 items-end">
            <div className="lg:col-span-7">
              <span className="section-mark">§ 02</span>
              <h2 className="display text-[2.4rem] lg:text-[3rem] mt-4">The {city.name} <em>register</em>.</h2>
            </div>
            <div className="lg:col-span-5 text-muted-foreground text-sm leading-relaxed">
              {properties.length} residences indexed in this volume. Photography appears only when a usable still is on file.
            </div>
          </div>
          {empty ? (
            <div className="paper p-8 sm:p-12">
              <div className="tracker-muted">Empty register</div>
              <h3 className="display text-3xl mt-3">{city.name} is on the atlas. No residences are filed yet.</h3>
              <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
                Residences will appear here when a source-backed listing pack is filed for {city.name}. We will not invent inventory to fill the page.
              </p>
              <Link href="/search" className="btn-ghost mt-6">Search published markets ↗︎</Link>
            </div>
          ) : (
            <CityRegister
              listings={properties}
              city={city}
              districts={districts}
              page={Number(sp.page) || 1}
              district={sp.district}
              category={sp.category}
              unitType={sp.unitType}
            />
          )}
        </div>
      </section>
    </div>
  );
}
