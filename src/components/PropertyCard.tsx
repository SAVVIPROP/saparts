import Link from "next/link";
import type { City } from "@/lib/types";
import type { Listing } from "@/lib/types";
import { galleryUrls } from "@/lib/media";
import { formatPrice } from "@/lib/format";

export function PropertyCard({ listing, city }: { listing: Listing; city?: City }) {
  const image = galleryUrls(listing)[0];
  const price = formatPrice(listing);

  return (
    <article className="paper overflow-hidden group">
      <Link href={`/properties/${listing.slug}`} className="block">
        <div className="aspect-[16/10] bg-ivory-warm overflow-hidden">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-end p-4 tracker-muted">No photograph on file</div>
          )}
        </div>
        <div className="p-5">
          <div className="tracker-muted">
            {[listing.category, listing.neighborhood || city?.name].filter(Boolean).join(" · ")}
          </div>
          <h3 className="font-serif text-[1.45rem] leading-tight mt-2 group-hover:text-forest">{listing.name}</h3>
          {listing.brand && <p className="mt-1 text-sm text-muted-foreground">{listing.brand}</p>}
          {listing.tagline && (
            <p className="mt-3 text-[0.92rem] leading-relaxed text-muted-foreground line-clamp-2">{listing.tagline}</p>
          )}
          {price && <p className="mt-4 tracker">{price}</p>}
        </div>
      </Link>
    </article>
  );
}
