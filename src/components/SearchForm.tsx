"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { City } from "@/lib/types";

export function SearchForm({
  cities,
  neighborhoods,
  brands,
  initial,
}: {
  cities: City[];
  neighborhoods: string[];
  brands: string[];
  initial: { q?: string; city?: string; neighborhood?: string; brand?: string };
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [neighborhood, setNeighborhood] = useState(initial.neighborhood ?? "");
  const [brand, setBrand] = useState(initial.brand ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (city) params.set("city", city);
    if (neighborhood) params.set("neighborhood", neighborhood);
    if (brand) params.set("brand", brand);
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  }

  return (
    <form onSubmit={submit} className="paper p-5 sm:p-6 grid md:grid-cols-12 gap-5">
      <label className="md:col-span-4 block">
        <span className="field-label">Search</span>
        <input className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Residence, operator, district" />
      </label>
      <label className="md:col-span-3 block">
        <span className="field-label">City</span>
        <select className="field" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All launch cities</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="md:col-span-2 block">
        <span className="field-label">Neighbourhood</span>
        <select className="field" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}>
          <option value="">Any</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <label className="md:col-span-2 block">
        <span className="field-label">Brand</span>
        <select className="field" value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">Any</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>
      <div className="md:col-span-1 flex items-end">
        <button type="submit" className="btn-primary w-full">
          Filter
        </button>
      </div>
    </form>
  );
}
