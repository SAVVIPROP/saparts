import type { City, Listing } from "./types";
import { cardImageUrl } from "./media";
import { cleanDescription, dedupeAddress } from "./format";

export const SITE_URL = "https://saparts.vercel.app";

export function absUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function listingJsonLd(listing: Listing, city?: City) {
  const image = cardImageUrl(listing);
  const url = absUrl(`/properties/${listing.slug}`);
  const address = dedupeAddress(listing.address);
  const desc = cleanDescription(listing.description) || listing.tagline || `${listing.name} serviced apartment.`;
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: listing.name,
    url,
    description: desc.slice(0, 300),
    image: image && image.startsWith("/") ? absUrl(image) : undefined,
    telephone: undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: address || undefined,
      addressLocality: listing.neighborhood || city?.name,
      addressCountry: city?.country,
    },
    geo:
      listing.latitude != null && listing.longitude != null
        ? { "@type": "GeoCoordinates", latitude: listing.latitude, longitude: listing.longitude }
        : undefined,
  };
}
