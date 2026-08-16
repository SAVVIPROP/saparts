import { Link } from "wouter";
import { priceRangeMonthly, titleCaseTag } from "@/lib/format";
import BookmarkButton from "./BookmarkButton";

export type PropertyCardData = {
  id: number;
  slug: string;
  name: string;
  brand?: string | null;
  category: string;
  neighborhood?: string | null;
  heroImageUrl?: string | null;
  unitTypes?: unknown;
  ratingScore?: number | null;
  priceFromDailyUsd?: number | null;
  priceToDailyUsd?: number | null;
  priceFromMonthlyUsd?: number | null;
  priceToMonthlyUsd?: number | null;
  bestForTags?: unknown;
};

export default function PropertyCard({
  property,
  cityName,
  compact = false,
}: {
  property: PropertyCardData;
  cityName?: string;
  compact?: boolean;
}) {
  const unitTypes = (Array.isArray(property.unitTypes) ? property.unitTypes : []) as string[];
  const bestForTags = (Array.isArray(property.bestForTags) ? property.bestForTags : []) as string[];
  const tier =
    property.ratingScore && Number(property.ratingScore) >= 9.0
      ? "T·I"
      : property.ratingScore && Number(property.ratingScore) >= 8.5
      ? "T·II"
      : "T·III";

  return (
    <Link href={`/properties/${property.slug}`} className="group block">
      <div className="relative aspect-[3/2] sm:aspect-[4/5] overflow-hidden bg-ivory-warm border border-border">
        {property.heroImageUrl ? (
          <img
            src={property.heroImageUrl}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-ivory-warm to-muted" />
        )}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <span className="tag" style={{ background: "rgba(244,239,223,0.9)" }}>{property.category}</span>
          <div className="flex items-center gap-2">
            <span
              className="tag"
              style={{
                background: "rgba(20,20,18,0.78)",
                color: "var(--ivory)",
                borderColor: "transparent",
              }}
            >
              {tier}
            </span>
            <BookmarkButton property={{
              id: property.id,
              slug: property.slug,
              name: property.name,
              cityName: cityName,
              category: property.category,
              heroImageUrl: property.heroImageUrl,
              ratingScore: property.ratingScore ? Number(property.ratingScore) : null,
              priceFromMonthlyUsd: property.priceFromMonthlyUsd ? Number(property.priceFromMonthlyUsd) : null,
              priceToMonthlyUsd: property.priceToMonthlyUsd ? Number(property.priceToMonthlyUsd) : null,
            }} size="sm" />
          </div>
        </div>
      </div>

      <div className="pt-3">
        <div className="flex items-baseline justify-between gap-3">
          <div className="tracker text-muted-foreground">
            {property.neighborhood ?? cityName ?? "—"}
          </div>
          {property.ratingScore != null && (
            <div className="tracker text-charcoal">
              {Number(property.ratingScore).toFixed(1)} <span className="text-muted-foreground">/ 10</span>
            </div>
          )}
        </div>
        <h3 className="font-serif text-[1.35rem] leading-[1.1] mt-1 text-charcoal group-hover:text-forest transition-colors">
          {property.name}
        </h3>
        {property.brand && (
          <div className="tracker-muted mt-1">{property.brand}</div>
        )}

        {!compact && unitTypes.length > 0 && (
          <div className="mt-2 tracker-muted truncate">
            {unitTypes.slice(0, 4).join(" · ")}
          </div>
        )}

        <div className="mt-3 flex items-baseline justify-between gap-2 hairline-top pt-3">
          <div className="tracker-muted">From</div>
          <div className="text-charcoal" style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
            {priceRangeMonthly(property.priceFromMonthlyUsd ?? undefined, property.priceToMonthlyUsd ?? undefined)}
          </div>
        </div>

        {!compact && bestForTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bestForTags.slice(0, 2).map((t) => (
              <span key={t} className="tag">{titleCaseTag(t)}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
