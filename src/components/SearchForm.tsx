"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { City } from "@/lib/types";
import type { CollectionDef } from "@/lib/collections";

const UNIT_TYPES = ["Studio", "1-Bed", "2-Bed", "3-Bed", "Penthouse"];
const BEST_FOR = [
  { value: "executives", label: "Executives" },
  { value: "families", label: "Families" },
  { value: "extended", label: "Extended stay" },
  { value: "pets", label: "Pet-friendly" },
];

export function SearchForm({
  cities,
  neighborhoods,
  brands,
  categories,
  collections,
  initial,
}: {
  cities: City[];
  neighborhoods: string[];
  brands: string[];
  categories: string[];
  collections: CollectionDef[];
  initial: {
    q?: string;
    city?: string;
    neighborhood?: string;
    brand?: string;
    category?: string;
    unitType?: string;
    bestFor?: string;
    collection?: string;
  };
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [neighborhood, setNeighborhood] = useState(initial.neighborhood ?? "");
  const [brand, setBrand] = useState(initial.brand ?? "");
  const [category, setCategory] = useState(initial.category ?? "");
  const [unitType, setUnitType] = useState(initial.unitType ?? "");
  const [bestFor, setBestFor] = useState(initial.bestFor ?? "");
  const [collection, setCollection] = useState(initial.collection ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (city) params.set("city", city);
    if (neighborhood) params.set("neighborhood", neighborhood);
    if (brand) params.set("brand", brand);
    if (category) params.set("category", category);
    if (unitType) params.set("unitType", unitType);
    if (bestFor) params.set("bestFor", bestFor);
    if (collection) params.set("collection", collection);
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  }

  return (
    <form onSubmit={submit} className="paper p-5 sm:p-6 grid md:grid-cols-12 gap-4">
      <label className="md:col-span-4 block">
        <span className="field-label">Search</span>
        <input className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Residence, operator, district" />
      </label>
      <label className="md:col-span-2 block">
        <span className="field-label">City</span>
        <select className="field" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All launch cities</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </label>
      <label className="md:col-span-2 block">
        <span className="field-label">Neighbourhood</span>
        <select className="field" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}>
          <option value="">Any</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
      <label className="md:col-span-2 block">
        <span className="field-label">Brand</span>
        <select className="field" value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">Any</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </label>
      <label className="md:col-span-2 block">
        <span className="field-label">Category</span>
        <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Any</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="md:col-span-2 block">
        <span className="field-label">Unit</span>
        <select className="field" value={unitType} onChange={(e) => setUnitType(e.target.value)}>
          <option value="">Any</option>
          {UNIT_TYPES.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </label>
      <label className="md:col-span-2 block">
        <span className="field-label">Best for</span>
        <select className="field" value={bestFor} onChange={(e) => setBestFor(e.target.value)}>
          <option value="">Any</option>
          {BEST_FOR.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
      </label>
      <label className="md:col-span-3 block">
        <span className="field-label">Collection</span>
        <select className="field" value={collection} onChange={(e) => setCollection(e.target.value)}>
          <option value="">Any</option>
          {collections.map((c) => (
            <option key={c.slug} value={c.slug}>{c.title}</option>
          ))}
        </select>
      </label>
      <div className="md:col-span-5 flex items-end gap-3">
        <button type="submit" className="btn-primary">Filter</button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setQ(""); setCity(""); setNeighborhood(""); setBrand("");
            setCategory(""); setUnitType(""); setBestFor(""); setCollection("");
            router.push("/search");
          }}
        >
          Clear
        </button>
      </div>
    </form>
  );
}
