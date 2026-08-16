"use client";

import { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { City, Listing } from "@/lib/types";
import { PropertyCard } from "@/components/PropertyCard";
import { unitTypeName } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/constants";

const CATEGORIES = ["Serviced Apartment", "Aparthotel", "Residence", "Penthouse"];
const UNIT_TYPES = ["Studio", "1-Bed", "2-Bed", "3-Bed", "Penthouse"];

export function CityRegister({
  listings,
  city,
  districts,
  page,
  district,
  category,
  unitType,
}: {
  listings: Listing[];
  city: City;
  districts: string[];
  page: number;
  district?: string;
  category?: string;
  unitType?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const filtered = useMemo(() => {
    return listings.filter((p) => {
      if (district && p.neighborhood !== district) return false;
      if (category && p.category !== category) return false;
      if (unitType) {
        const units = (p.unitTypes ?? []).map(unitTypeName).map((u) => u.toLowerCase());
        if (!units.some((u) => u.includes(unitType.toLowerCase()))) return false;
      }
      return true;
    });
  }, [listings, district, category, unitType]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages);
  const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function setParam(key: string, value?: string) {
    const p = new URLSearchParams();
    if (district) p.set("district", district);
    if (category) p.set("category", category);
    if (unitType) p.set("unitType", unitType);
    if (value) p.set(key, value);
    else p.delete(key);
    if (key !== "page") p.delete("page");
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div>
      <div className="mb-8 space-y-4 pb-8 border-b border-border">
        {districts.length > 0 && (
          <div>
            <div className="tracker-muted text-[0.7rem] mb-2">DISTRICT</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setParam("district")} className={`px-3 py-1 text-[0.78rem] border ${!district ? "bg-charcoal text-ivory border-charcoal" : "border-border"}`}>All</button>
              {districts.slice(0, 16).map((n) => (
                <button key={n} onClick={() => setParam("district", district === n ? undefined : n)} className={`px-3 py-1 text-[0.78rem] border ${district === n ? "bg-charcoal text-ivory border-charcoal" : "border-border"}`}>{n}</button>
              ))}
            </div>
          </div>
        )}
        <div>
          <div className="tracker-muted text-[0.7rem] mb-2">CATEGORY</div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setParam("category", category === c ? undefined : c)} className={`px-3 py-1 text-[0.78rem] border ${category === c ? "bg-charcoal text-ivory border-charcoal" : "border-border"}`}>{c}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="tracker-muted text-[0.7rem] mb-2">UNIT</div>
          <div className="flex flex-wrap gap-2">
            {UNIT_TYPES.map((u) => (
              <button key={u} onClick={() => setParam("unitType", unitType === u ? undefined : u)} className={`px-3 py-1 text-[0.78rem] border ${unitType === u ? "bg-charcoal text-ivory border-charcoal" : "border-border"}`}>{u}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="tracker-muted mb-6">{filtered.length} residences</div>
      {slice.length === 0 ? (
        <div className="paper p-8">Nothing in this pocket of {city.name} yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {slice.map((listing) => (
            <PropertyCard key={listing.slug} listing={listing} city={city} />
          ))}
        </div>
      )}
      {pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {current > 1 && (
            <button onClick={() => setParam("page", String(current - 1))} className="btn-outline">Previous</button>
          )}
          <span className="tracker-muted">Page {current} of {pages}</span>
          {current < pages && (
            <button onClick={() => setParam("page", String(current + 1))} className="btn-outline">Next</button>
          )}
        </div>
      )}
    </div>
  );
}
