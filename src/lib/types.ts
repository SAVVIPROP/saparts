export type City = {
  slug: string;
  name: string;
  country: string;
  region: string;
  tagline: string;
  currency: string;
  launch?: boolean;
};

export type ListingCategory =
  | "Serviced Apartment"
  | "Aparthotel"
  | "Residence"
  | "Penthouse"
  | string;

export type UnitType = {
  name?: string;
  beds?: string | string[];
  maxOccupancy?: number | null;
  sizeSqm?: number | null;
  facilities?: string[];
  [key: string]: unknown;
};

export type Listing = {
  slug: string;
  citySlug: string;
  name: string;
  brand?: string | null;
  category?: ListingCategory | null;
  tagline?: string | null;
  description?: string | null;
  neighborhood?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  heroImageUrl?: string | null;
  imageUrls?: string[];
  imageFiles?: string[];
  unitTypes?: Array<string | UnitType>;
  amenities?: string[];
  minStayNights?: number | null;
  priceFromMonthlyUsd?: number | null;
  priceFromMonthlyNative?: number | null;
  priceCurrencyNative?: string | null;
  priceNotes?: string | null;
  bookingUrl?: string | null;
  officialUrl?: string | null;
  virtualTourUrl?: string | null;
  videoUrls?: string[];
  layoutUrls?: string[];
  operatorGroup?: string | null;
  published?: boolean;
  sources?: string[];
  ratingScore?: number | null;
  ratingSource?: string | null;
  bestForTags?: string[];
};

export type SearchFilters = {
  q?: string;
  city?: string;
  neighborhood?: string;
  brand?: string;
  category?: string;
  unitType?: string;
  bestFor?: string;
  collection?: string;
  page?: number;
};
