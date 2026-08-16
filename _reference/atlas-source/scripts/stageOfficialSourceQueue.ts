import fs from "node:fs/promises";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "../server/db";
import { cities, properties, propertyEnrichmentDrafts, propertySources } from "../drizzle/schema";

const SOURCE_QUEUE = process.env.SOURCE_QUEUE || "/home/ubuntu/official-source-review-queue.json";
const OWNER_ID = 1;
const DRY_RUN = process.env.DRY_RUN === "1";
const LIMIT = Math.max(0, Number(process.env.LIMIT || 0));

type Candidate = {
  city: string;
  name: string;
  district?: string;
  officialWebsite: string;
  sourceUrl: string;
  description: string;
  headings: string[];
  imageCandidates: string[];
  sourcePack: string;
};

const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 150) || "listing";

async function uniqueSlug(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, base: string) {
  let slug = base;
  let suffix = 2;
  while ((await db.select({ id: properties.id }).from(properties).where(eq(properties.slug, slug)).limit(1))[0]) slug = `${base}-${suffix++}`;
  return slug;
}

async function main() {
  const raw = JSON.parse(await fs.readFile(SOURCE_QUEUE, "utf8")) as { reviewReady: Candidate[] };
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const results = { staged: 0, existing: 0, skipped: 0, errors: 0 };
  const queue = LIMIT ? raw.reviewReady.slice(0, LIMIT) : raw.reviewReady;
  for (const candidate of queue) {
    try {
      const city = (await db.select().from(cities).where(sql`LOWER(${cities.name}) = LOWER(${candidate.city})`).limit(1))[0];
      if (!city || !candidate.name || !candidate.officialWebsite || candidate.description.length < 80) { results.skipped++; continue; }
      const existing = (await db.select().from(properties).where(and(eq(properties.cityId, city.id), sql`LOWER(${properties.name}) = LOWER(${candidate.name})`)).limit(1))[0];
      if (DRY_RUN) {
        console.log(`[DRY RUN] ${existing ? "existing" : "new"} ${candidate.city} — ${candidate.name}`);
        results.staged++;
        continue;
      }
      const property = existing ?? (await (async () => {
        const created: any = await db.insert(properties).values({ cityId: city.id, name: candidate.name, slug: await uniqueSlug(db, slugify(candidate.name)), category: "Serviced Apartment", neighborhood: candidate.district || null, published: false, featured: false });
        return (await db.select().from(properties).where(eq(properties.id, Number(created?.[0]?.insertId ?? created?.insertId))).limit(1))[0];
      })());
      if (!property) { results.errors++; continue; }
      const duplicate = (await db.select({ id: propertySources.id }).from(propertySources).where(and(eq(propertySources.propertyId, property.id), eq(propertySources.sourceUrl, candidate.sourceUrl))).limit(1))[0];
      if (duplicate) { results.existing++; continue; }
      const sourceText = [candidate.description, ...candidate.headings.map((heading) => `Heading: ${heading}`)].join("\n\n").slice(0, 45000);
      const sourceResult: any = await db.insert(propertySources).values({ propertyId: property.id, sourceUrl: candidate.sourceUrl, sourceTitle: `Official source pack — ${candidate.name}`.slice(0, 256), sourceType: "official_site_extract", sourceText, createdByUserId: OWNER_ID });
      const sourceId = Number(sourceResult?.[0]?.insertId ?? sourceResult?.insertId);
      await db.insert(propertyEnrichmentDrafts).values({
        propertyId: property.id,
        sourceId,
        createdByUserId: OWNER_ID,
        proposedFields: { description: candidate.description, officialUrl: candidate.officialWebsite, neighborhood: candidate.district || null },
        evidence: [
          { field: "description", quote: candidate.description },
          { field: "officialUrl", quote: candidate.sourceUrl },
          { field: "imageCandidates", quote: `${candidate.imageCandidates.length} direct official-source image candidates retained in ${candidate.sourcePack}` },
        ],
      });
      results.staged++;
      console.log(`[STAGED] ${candidate.city} — ${candidate.name}`);
    } catch (error) {
      results.errors++;
      console.error(`[ERROR] ${candidate.city} — ${candidate.name}:`, error);
    }
  }
  console.log(JSON.stringify(results));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
