// Parse a property-detail page. Returns normalized fields if it qualifies.
import * as cheerio from "cheerio";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function fetchHtml(url, { timeoutMs = 20000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, "accept": "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function extractJsonLd($) {
  const blocks = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else if (parsed["@graph"]) blocks.push(...(parsed["@graph"] || []));
      else blocks.push(parsed);
    } catch {}
  });
  return blocks;
}

function first(...vals) {
  for (const v of vals) if (v !== undefined && v !== null && v !== "") return v;
  return null;
}

const LODGING_TYPES = new Set([
  "Hotel",
  "LodgingBusiness",
  "ApartmentComplex",
  "Accommodation",
  "Suite",
  "HotelRoom",
  "ExtendedStayHotel",
  "BedAndBreakfast",
  "Hostel",
  "Motel",
]);

function pickLodging(blocks) {
  for (const b of blocks) {
    const t = b?.["@type"];
    if (!t) continue;
    const types = Array.isArray(t) ? t : [t];
    if (types.some((x) => LODGING_TYPES.has(x))) return b;
  }
  return null;
}

export async function parsePropertyUrl(url, op) {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const blocks = extractJsonLd($);
  const ld = pickLodging(blocks);

  const name =
    first(ld?.name, $('meta[property="og:title"]').attr("content"), $("h1").first().text().trim(), $("title").text().trim())?.toString()
      .trim() ?? null;
  if (!name) return null;

  const description =
    first(
      ld?.description,
      $('meta[name="description"]').attr("content"),
      $('meta[property="og:description"]').attr("content"),
    )?.toString().trim() ?? null;

  const heroImage = first(
    Array.isArray(ld?.image) ? ld.image[0] : ld?.image,
    $('meta[property="og:image"]').attr("content"),
  );

  const gallery = [];
  if (Array.isArray(ld?.image)) for (const i of ld.image) if (typeof i === "string") gallery.push(i);
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src");
    if (!src) return;
    if (/^(https?:)?\/\//.test(src) && /\.(jpg|jpeg|png|webp)(\?|$)/i.test(src)) gallery.push(src);
  });

  const address = ld?.address ?? {};
  const geo = ld?.geo ?? {};
  const brand = ld?.brand?.name ?? op.brand;
  const telephone = ld?.telephone ?? null;
  const starRating = ld?.starRating?.ratingValue ?? null;
  const reviewAgg = ld?.aggregateRating ?? null;

  // Rooms / unitTypes heuristic
  let unitTypes = [];
  if (Array.isArray(ld?.containsPlace)) {
    unitTypes = ld.containsPlace
      .map((r) => r?.name)
      .filter(Boolean);
  }

  return {
    sourceUrl: url,
    operatorSlug: op.slug,
    brand,
    category: op.category,
    name,
    description,
    heroImageUrl: typeof heroImage === "string" ? heroImage : heroImage?.url ?? null,
    galleryUrls: Array.from(new Set(gallery)).slice(0, 24),
    address: {
      street: address.streetAddress ?? null,
      city: address.addressLocality ?? null,
      region: address.addressRegion ?? null,
      postalCode: address.postalCode ?? null,
      country: address.addressCountry?.name ?? address.addressCountry ?? null,
    },
    geo: {
      lat: geo.latitude ? Number(geo.latitude) : null,
      lng: geo.longitude ? Number(geo.longitude) : null,
    },
    telephone,
    starRating: starRating != null ? Number(starRating) : null,
    ratingScore: reviewAgg?.ratingValue != null ? Number(reviewAgg.ratingValue) : null,
    ratingCount: reviewAgg?.reviewCount != null ? Number(reviewAgg.reviewCount) : null,
    unitTypes,
  };
}
