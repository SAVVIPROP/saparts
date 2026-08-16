import { useMemo, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import PropertyCard from "@/components/PropertyCard";
import { Search as SearchIcon, SlidersHorizontal, X, ChevronDown, MapPin } from "lucide-react";

const CATEGORIES = ["Serviced Apartment", "Aparthotel", "Residence", "Penthouse"];
const UNIT_TYPES = ["Studio", "1-Bed", "2-Bed", "3-Bed", "Penthouse", "Duplex", "House"];
const BEST_FOR = [
  "Best for Executives",
  "Best for Families",
  "Best for Extended Stays",
  "Best for Pets",
];

function getSearchParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    q: p.get("q") || "",
    citySlug: p.get("city") || undefined,
    category: p.get("category") || undefined,
    unitType: p.get("unitType") || undefined,
    bestForTag: p.get("bestFor") || undefined,
    minPrice: p.get("minPrice") ? Number(p.get("minPrice")) : undefined,
    maxPrice: p.get("maxPrice") ? Number(p.get("maxPrice")) : undefined,
  };
}

export default function Search() {
  const [, navigate] = useLocation();
  const { data: cities = [] } = trpc.cities.list.useQuery();

  // Initialise state from URL
  const init = getSearchParams();
  const [q, setQ] = useState(init.q);
  const [citySlug, setCitySlug] = useState<string | undefined>(init.citySlug);
  const [category, setCategory] = useState<string | undefined>(init.category);
  const [unitType, setUnitType] = useState<string | undefined>(init.unitType);
  const [bestForTag, setBestForTag] = useState<string | undefined>(init.bestForTag);
  const [minPrice, setMinPrice] = useState<number | undefined>(init.minPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(init.maxPrice);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [cityDropOpen, setCityDropOpen] = useState(false);

  // Sync state → URL whenever filters change
  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (citySlug) p.set("city", citySlug);
    if (category) p.set("category", category);
    if (unitType) p.set("unitType", unitType);
    if (bestForTag) p.set("bestFor", bestForTag);
    if (minPrice != null) p.set("minPrice", String(minPrice));
    if (maxPrice != null) p.set("maxPrice", String(maxPrice));
    const qs = p.toString();
    const newUrl = qs ? `/search?${qs}` : "/search";
    // Use replaceState to avoid polluting history on every keystroke
    window.history.replaceState(null, "", newUrl);
  }, [q, citySlug, category, unitType, bestForTag, minPrice, maxPrice]);

  // Restore state from URL when user presses back/forward
  useEffect(() => {
    const onPop = () => {
      const s = getSearchParams();
      setQ(s.q);
      setCitySlug(s.citySlug);
      setCategory(s.category);
      setUnitType(s.unitType);
      setBestForTag(s.bestForTag);
      setMinPrice(s.minPrice);
      setMaxPrice(s.maxPrice);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const searchParams = useMemo(
    () => ({
      q: q || undefined,
      citySlug,
      category,
      unitType,
      bestForTag,
      minPrice,
      maxPrice,
      limit: 500,
    }),
    [q, citySlug, category, unitType, bestForTag, minPrice, maxPrice],
  );

  const { data: results = [], isLoading } = trpc.properties.search.useQuery(searchParams);

  const reset = () => {
    setQ("");
    setCitySlug(undefined);
    setCategory(undefined);
    setUnitType(undefined);
    setBestForTag(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
  };

  const citiesList = cities as any[];

  const filteredCities = useMemo(() => {
    if (!citySearch) return citiesList.slice(0, 80);
    const lq = citySearch.toLowerCase();
    return citiesList.filter((c) =>
      c.name?.toLowerCase().includes(lq) || c.country?.toLowerCase().includes(lq)
    ).slice(0, 60);
  }, [citiesList, citySearch]);

  const selectedCity = citiesList.find((c) => c.slug === citySlug);

  const FilterPanel = (
    <div className="space-y-8">
      <div>
        <div className="eyebrow mb-3">City</div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setCityDropOpen((v) => !v)}
            className="w-full flex items-center justify-between border border-border bg-background px-3 py-2.5 text-sm text-left hover:border-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <MapPin size={13} className="text-muted-foreground shrink-0" />
              <span className={selectedCity ? "text-foreground" : "text-muted-foreground"}>
                {selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : "All cities"}
              </span>
            </span>
            <ChevronDown size={13} className={`text-muted-foreground transition-transform ${cityDropOpen ? "rotate-180" : ""}`} />
          </button>
          {cityDropOpen && (
            <div className="absolute z-50 top-full left-0 right-0 bg-background border border-border shadow-lg mt-0.5">
              <div className="p-2 border-b border-border">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search cities…"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="max-h-56 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => { setCitySlug(undefined); setCityDropOpen(false); setCitySearch(""); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                    !citySlug ? "font-medium text-foreground" : "text-muted-foreground"
                  }`}
                >
                  All cities
                </button>
                {filteredCities.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => { setCitySlug(c.slug); setCityDropOpen(false); setCitySearch(""); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between ${
                      citySlug === c.slug ? "font-medium text-foreground bg-muted" : "text-foreground"
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.country}</span>
                  </button>
                ))}
                {filteredCities.length === 0 && (
                  <div className="px-3 py-4 text-sm text-muted-foreground text-center">No cities found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="eyebrow mb-3">Category</div>
        <div className="space-y-2">
          {CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={category === c}
                onChange={() => setCategory(category === c ? undefined : c)}
                className="accent-brass-deep"
              />
              <span>{c}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="eyebrow mb-3">Unit Type</div>
        <div className="flex flex-wrap gap-2">
          {UNIT_TYPES.map((u) => (
            <button
              key={u}
              onClick={() => setUnitType(unitType === u ? undefined : u)}
              className={`px-3 py-1 text-xs border transition-colors ${
                unitType === u
                  ? "bg-charcoal text-ivory border-charcoal"
                  : "border-border hover:border-charcoal"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="eyebrow mb-3">Best For</div>
        <div className="flex flex-wrap gap-2">
          {BEST_FOR.map((t) => (
            <button
              key={t}
              onClick={() => setBestForTag(bestForTag === t ? undefined : t)}
              className={`px-3 py-1 text-xs border transition-colors ${
                bestForTag === t
                  ? "bg-brass text-charcoal border-brass"
                  : "border-border hover:border-brass"
              }`}
            >
              {t.replace("Best for ", "")}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="eyebrow mb-3">Price (USD / night)</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice ?? ""}
            onChange={(e) =>
              setMinPrice(e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full border border-border bg-background px-3 py-2 text-sm"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice ?? ""}
            onChange={(e) =>
              setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <button
        onClick={reset}
        className="text-xs text-muted-foreground hover:text-charcoal underline-offset-4 hover:underline"
      >
        Reset all filters
      </button>
    </div>
  );

  return (
    <div className="pb-24">
      {/* Masthead */}
      <div className="pt-32 pb-10 hairline-bottom">
        <div className="container">
          <div className="eyebrow">The Atlas</div>
          <h1 className="serif-headline text-5xl lg:text-6xl mt-3 leading-[1.05]">
            Search the Collection.
          </h1>
          <p className="mt-4 font-serif text-lg text-muted-foreground max-w-2xl">
            Filter the SAparts atlas across every indexed market and four categories. Refine by unit type,
            pricing band, and the occasion of stay.
          </p>
        </div>
      </div>

      <div className="container mt-10 grid lg:grid-cols-12 gap-10">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-28">{FilterPanel}</div>
        </aside>

        {/* Results */}
        <div className="lg:col-span-9">
          {/* Mobile: search + [Filters | count] row; Desktop: search + filters + count */}
          <div className="flex flex-col gap-3">
            <div className="relative flex-1">
              <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, neighborhood, or brand"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-background border border-border font-serif text-base focus:outline-none focus:border-brass"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden btn-outline flex-1 justify-center"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {isLoading ? "Searching…" : `${results.length} residences`}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[4/3] bg-ivory-warm animate-pulse" />
                  <div className="h-4 bg-ivory-warm w-1/2 animate-pulse" />
                  <div className="h-5 bg-ivory-warm w-3/4 animate-pulse" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="mt-20 text-center">
              <div className="eyebrow">No matches</div>
              <h3 className="serif-headline text-3xl mt-3">Nothing in this pocket yet.</h3>
              <p className="mt-3 font-serif text-muted-foreground">
                Relax a filter or broaden the city — the right residence is nearby.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {(results as any[]).map((p: any) => {
                const city = citiesList.find((c) => c.id === p.cityId);
                return (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    cityName={city?.name}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-background p-8 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="serif-headline text-2xl">Filter</h3>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {FilterPanel}
          </div>
        </div>
      )}
    </div>
  );
}
