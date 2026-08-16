import Link from "next/link";
import type { City, Listing } from "@/lib/types";
import { cardImageUrl } from "@/lib/media";
import { formatPrice, titleCaseTag, unitTypeName } from "@/lib/format";
import { SafeImage } from "./SafeImage";
import { BookmarkButton } from "./BookmarkButton";

export function PropertyCard({
  listing,
  city,
  compact = false,
}: {
  listing: Listing;
  city?: City;
  compact?: boolean;
}) {
  const image = cardImageUrl(listing);
  const price = formatPrice(listing);
  const unitTypes = (listing.unitTypes ?? []).map(unitTypeName).filter(Boolean);
  const bestForTags = listing.bestForTags ?? [];
  const score = listing.ratingScore;
  const tier =
    score && Number(score) >= 9.0 ? "T·I" : score && Number(score) >= 8.5 ? "T·II" : score ? "T·III" : null;

  return (
    <Link href={`/properties/${listing.slug}`} className="group block">
      <div className="relative aspect-[3/2] sm:aspect-[4/5] overflow-hidden bg-ivory-warm border border-border">
        {image ? (
          <SafeImage
            src={image}
            alt={listing.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-ivory-warm to-muted" />
        )}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <span className="tag" style={{ background: "rgba(244,239,223,0.9)" }}>
            {listing.category ?? "Residence"}
          </span>
          <div className="flex items-center gap-2">
            {tier && (
              <span className="tag" style={{ background: "rgba(20,20,18,0.78)", color: "var(--ivory)", borderColor: "transparent" }}>
                {tier}
              </span>
            )}
            <BookmarkButton
              property={{
                id: listing.slug,
                slug: listing.slug,
                name: listing.name,
                cityName: city?.name,
                category: listing.category ?? undefined,
                heroImageUrl: image,
                ratingScore: score ?? null,
                priceFromMonthlyUsd: listing.priceFromMonthlyUsd ?? null,
              }}
              size="sm"
            />
          </div>
        </div>
      </div>
      <div className="pt-3">
        <div className="flex items-baseline justify-between gap-3">
          <div className="tracker text-muted-foreground">{listing.neighborhood ?? city?.name ?? "—"}</div>
          {score != null && (
            <div className="tracker text-charcoal">
              {Number(score).toFixed(1)} <span className="text-muted-foreground">/ 10</span>
            </div>
          )}
        </div>
        <h3 className="font-serif text-[1.35rem] leading-[1.1] mt-1 text-charcoal group-hover:text-forest transition-colors">
          {listing.name}
        </h3>
        {listing.brand && <div className="tracker-muted mt-1">{listing.brand}</div>}
        {!compact && unitTypes.length > 0 && (
          <div className="mt-2 tracker-muted truncate">{unitTypes.slice(0, 4).join(" · ")}</div>
        )}
        <div className="mt-3 flex items-baseline justify-between gap-2 hairline-top pt-3">
          <div className="tracker-muted">From</div>
          <div className="text-charcoal" style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
            {price ?? "On request"}
          </div>
        </div>
        {!compact && bestForTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bestForTags.slice(0, 2).map((t) => (
              <span key={t} className="tag">
                {titleCaseTag(t)}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
