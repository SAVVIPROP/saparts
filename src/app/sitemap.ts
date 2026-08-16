import type { MetadataRoute } from "next";
import { getAllProperties, getLaunchCities } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = [
    "",
    "/cities",
    "/search",
    "/collections",
    "/insights",
    "/awards",
    "/resources",
    "/operators",
    "/corporate",
    "/contact",
    "/collaboration",
    "/about",
    "/privacy",
    "/terms",
  ];
  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/search" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));
  for (const city of getLaunchCities()) {
    entries.push({
      url: `${SITE_URL}/cities/${city.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }
  for (const listing of getAllProperties()) {
    entries.push({
      url: `${SITE_URL}/properties/${listing.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  return entries;
}
