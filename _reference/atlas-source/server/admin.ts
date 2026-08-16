import * as XLSX from "xlsx";
import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { getDb } from "./db";
import { storagePut } from "./storage";
import { cities, properties, propertyEnrichmentDrafts, propertyImages, propertySources } from "../drizzle/schema";

export const ADMIN_PROPERTY_FIELDS = [
  "name", "brand", "category", "tagline", "description", "neighborhood", "address",
  "officialUrl", "virtualTourUrl", "heroImageUrl", "unitTypes", "amenities", "minStayNights",
  "priceFromDailyUsd", "priceToDailyUsd", "priceFromMonthlyUsd", "priceToMonthlyUsd",
  "published", "featured",
] as const;

export type AdminPropertyPatch = Partial<Record<(typeof ADMIN_PROPERTY_FIELDS)[number], unknown>>;

const publicMediaUrl = (storageUrl: string) => storageUrl.replace(/^\/manus-storage\//, "/media/");
const toStringArray = (value: unknown) => Array.isArray(value)
  ? value.map(String).map((v) => v.trim()).filter(Boolean)
  : typeof value === "string"
    ? value.split(/[,;\n]/).map((v) => v.trim()).filter(Boolean)
    : [];
const nullableString = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : null;
const nullableInt = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : null;
};
const propertySlug = (value: string) => value.toLowerCase().normalize("NFKD")
  .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 150) || "listing";

export async function createAdminProperty(input: { cityId: number; name: string; category?: "Serviced Apartment" | "Aparthotel" | "Residence" | "Penthouse" }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const name = input.name.trim();
  if (name.length < 2) throw new Error("Listing name must contain at least two characters");
  const city = await db.select().from(cities).where(eq(cities.id, input.cityId)).limit(1);
  if (!city[0]) throw new Error("Selected city was not found");
  const duplicate = await db.select({ id: properties.id }).from(properties)
    .where(and(eq(properties.cityId, input.cityId), sql`LOWER(${properties.name}) = LOWER(${name})`)).limit(1);
  if (duplicate[0]) return getAdminProperty(duplicate[0].id);
  const base = propertySlug(name);
  let slug = base;
  let suffix = 2;
  while ((await db.select({ id: properties.id }).from(properties).where(eq(properties.slug, slug)).limit(1))[0]) slug = `${base}-${suffix++}`;
  const result: any = await db.insert(properties).values({
    cityId: input.cityId,
    name,
    slug,
    category: input.category ?? "Serviced Apartment",
    published: false,
    featured: false,
  });
  return getAdminProperty(Number(result?.[0]?.insertId ?? result?.insertId));
}

export async function listAdminProperties(input: { q?: string; cityId?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return [];
  const filters = [];
  if (input.cityId) filters.push(eq(properties.cityId, input.cityId));
  if (input.q?.trim()) {
    const term = `%${input.q.trim()}%`;
    filters.push(or(like(properties.name, term), like(properties.brand, term), like(properties.slug, term))!);
  }
  return db
    .select({ property: properties, city: cities, imageCount: sql<number>`COUNT(${propertyImages.id})` })
    .from(properties)
    .innerJoin(cities, eq(cities.id, properties.cityId))
    .leftJoin(propertyImages, eq(propertyImages.propertyId, properties.id))
    .where(filters.length ? and(...filters) : undefined)
    .groupBy(properties.id, cities.id)
    .orderBy(desc(properties.updatedAt), asc(properties.name))
    .limit(Math.min(input.limit ?? 200, 500));
}

export async function getAdminProperty(propertyId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select({ property: properties, city: cities })
    .from(properties)
    .innerJoin(cities, eq(cities.id, properties.cityId))
    .where(eq(properties.id, propertyId))
    .limit(1);
  if (!rows[0]) return null;
  const [images, sources, drafts] = await Promise.all([
    db.select().from(propertyImages).where(eq(propertyImages.propertyId, propertyId)).orderBy(asc(propertyImages.sortOrder)),
    db.select().from(propertySources).where(eq(propertySources.propertyId, propertyId)).orderBy(desc(propertySources.createdAt)).limit(12),
    db.select().from(propertyEnrichmentDrafts).where(eq(propertyEnrichmentDrafts.propertyId, propertyId)).orderBy(desc(propertyEnrichmentDrafts.createdAt)).limit(12),
  ]);
  return { ...rows[0], images, sources, drafts };
}

export async function assertPublicationFloor(propertyId: number, patch: AdminPropertyPatch = {}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
  const property = existing[0];
  if (!property) throw new Error("Property not found");
  const [countRow] = await db.select({ count: sql<number>`COUNT(*)` }).from(propertyImages).where(eq(propertyImages.propertyId, propertyId));
  const effectiveDescription = typeof patch.description === "string" ? patch.description : property.description;
  const effectiveOfficial = typeof patch.officialUrl === "string" ? patch.officialUrl : property.officialUrl;
  const effectiveHero = typeof patch.heroImageUrl === "string" ? patch.heroImageUrl : property.heroImageUrl;
  const issues: string[] = [];
  if (!effectiveOfficial) issues.push("Official website URL is required");
  if (!effectiveDescription || effectiveDescription.trim().length < 80) issues.push("A factual description of at least 80 characters is required");
  if (!effectiveHero) issues.push("A hero image is required");
  if (Number(countRow?.count ?? 0) < 9) issues.push("At least nine gallery images are required (ten total images including the hero)");
  return issues;
}

export async function updateAdminProperty(propertyId: number, patch: AdminPropertyPatch) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const normalized: Record<string, unknown> = {};
  for (const field of ADMIN_PROPERTY_FIELDS) {
    if (!(field in patch)) continue;
    const value = patch[field];
    if (field === "unitTypes" || field === "amenities") normalized[field] = toStringArray(value);
    else if (["minStayNights", "priceFromDailyUsd", "priceToDailyUsd", "priceFromMonthlyUsd", "priceToMonthlyUsd"].includes(field)) normalized[field] = nullableInt(value);
    else if (["published", "featured"].includes(field)) normalized[field] = Boolean(value);
    else normalized[field] = nullableString(value);
  }
  if (normalized.published === true) {
    const issues = await assertPublicationFloor(propertyId, normalized);
    if (issues.length) throw new Error(issues.join(" · "));
  }
  await db.update(properties).set(normalized as any).where(eq(properties.id, propertyId));
  return getAdminProperty(propertyId);
}

export async function uploadAdminPropertyImage(input: { propertyId: number; filename: string; contentType: string; dataBase64: string; alt?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const bytes = Buffer.from(input.dataBase64, "base64");
  if (!bytes.length || bytes.length > 15 * 1024 * 1024) throw new Error("Image must be between 1 byte and 15 MB");
  if (!input.contentType.startsWith("image/")) throw new Error("Only image uploads are supported");
  const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "property-image";
  const { url } = await storagePut(`saparts/admin/${input.propertyId}/${safeName}`, bytes, input.contentType);
  const [maxRow] = await db.select({ max: sql<number>`COALESCE(MAX(${propertyImages.sortOrder}), -1)` }).from(propertyImages).where(eq(propertyImages.propertyId, input.propertyId));
  const publicUrl = publicMediaUrl(url);
  const result: any = await db.insert(propertyImages).values({
    propertyId: input.propertyId,
    url: publicUrl,
    alt: nullableString(input.alt),
    caption: null,
    sortOrder: Number(maxRow?.max ?? -1) + 1,
  });
  const imageId = Number(result?.[0]?.insertId ?? result?.insertId);
  const current = await db.select().from(properties).where(eq(properties.id, input.propertyId)).limit(1);
  if (current[0] && !current[0].heroImageUrl) await db.update(properties).set({ heroImageUrl: publicUrl }).where(eq(properties.id, input.propertyId));
  return { id: imageId, url: publicUrl };
}

export async function reorderAdminPropertyImages(propertyId: number, imageIds: number[], heroImageId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const images = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, propertyId));
  const allowed = new Map(images.map((image) => [image.id, image]));
  if (imageIds.length !== images.length || imageIds.some((id) => !allowed.has(id))) throw new Error("Image order does not match this property gallery");
  for (let index = 0; index < imageIds.length; index++) {
    await db.update(propertyImages).set({ sortOrder: index }).where(eq(propertyImages.id, imageIds[index]));
  }
  if (heroImageId) {
    const hero = allowed.get(heroImageId);
    if (!hero) throw new Error("Hero image must belong to this property");
    await db.update(properties).set({ heroImageUrl: hero.url }).where(eq(properties.id, propertyId));
  }
  return getAdminProperty(propertyId);
}

export async function removeAdminPropertyImage(propertyId: number, imageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const image = await db.select().from(propertyImages).where(and(eq(propertyImages.id, imageId), eq(propertyImages.propertyId, propertyId))).limit(1);
  if (!image[0]) throw new Error("Image not found");
  await db.delete(propertyImages).where(eq(propertyImages.id, imageId));
  const property = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
  if (property[0]?.heroImageUrl === image[0].url) {
    const remaining = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, propertyId)).orderBy(asc(propertyImages.sortOrder)).limit(1);
    await db.update(properties).set({ heroImageUrl: remaining[0]?.url ?? null, published: false }).where(eq(properties.id, propertyId));
  }
  return { success: true };
}

export async function createSourceAndDraft(input: { propertyId: number; userId: number; sourceUrl?: string; sourceTitle?: string; sourceText: string; proposedFields: Record<string, unknown>; evidence: Array<{ field: string; quote: string }> }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const sourceResult: any = await db.insert(propertySources).values({
    propertyId: input.propertyId,
    sourceUrl: nullableString(input.sourceUrl),
    sourceTitle: nullableString(input.sourceTitle),
    sourceType: "pasted_text",
    sourceText: input.sourceText.trim(),
    createdByUserId: input.userId,
  });
  const sourceId = Number(sourceResult?.[0]?.insertId ?? sourceResult?.insertId);
  const draftResult: any = await db.insert(propertyEnrichmentDrafts).values({
    propertyId: input.propertyId,
    sourceId,
    proposedFields: input.proposedFields,
    evidence: input.evidence,
    createdByUserId: input.userId,
  });
  return { sourceId, draftId: Number(draftResult?.[0]?.insertId ?? draftResult?.insertId) };
}

export async function approveEnrichmentDraft(draftId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db.select().from(propertyEnrichmentDrafts).where(eq(propertyEnrichmentDrafts.id, draftId)).limit(1);
  const draft = rows[0];
  if (!draft || draft.status !== "draft") throw new Error("Draft is unavailable");
  await updateAdminProperty(draft.propertyId, draft.proposedFields as AdminPropertyPatch);
  await db.update(propertyEnrichmentDrafts).set({ status: "approved", reviewedByUserId: userId, reviewedAt: new Date() }).where(eq(propertyEnrichmentDrafts.id, draftId));
  return getAdminProperty(draft.propertyId);
}

export async function rejectEnrichmentDraft(draftId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(propertyEnrichmentDrafts).set({ status: "rejected", reviewedByUserId: userId, reviewedAt: new Date() }).where(eq(propertyEnrichmentDrafts.id, draftId));
  return { success: true };
}

function exportRows(rows: Awaited<ReturnType<typeof listAdminProperties>>) {
  return rows.map(({ property, city, imageCount }) => ({
    "Property ID": property.id,
    "Slug (do not edit)": property.slug,
    "City": city.name,
    "Name": property.name,
    "Brand / operator": property.brand ?? "",
    "Category": property.category,
    "District / neighbourhood": property.neighborhood ?? "",
    "Address": property.address ?? "",
    "Official website": property.officialUrl ?? "",
    "Virtual tour": property.virtualTourUrl ?? "",
    "Description": property.description ?? "",
    "Amenities (comma-separated)": Array.isArray(property.amenities) ? property.amenities.join(", ") : "",
    "Residence types (comma-separated)": Array.isArray(property.unitTypes) ? property.unitTypes.join(", ") : "",
    "Minimum stay nights": property.minStayNights ?? "",
    "Daily price from USD": property.priceFromDailyUsd ?? "",
    "Daily price to USD": property.priceToDailyUsd ?? "",
    "Monthly price from USD": property.priceFromMonthlyUsd ?? "",
    "Monthly price to USD": property.priceToMonthlyUsd ?? "",
    "Published": property.published ? "TRUE" : "FALSE",
    "Featured": property.featured ? "TRUE" : "FALSE",
    "Gallery image count": Number(imageCount),
  }));
}

export async function exportAdminWorkbook(input: { cityId?: number }) {
  const rows = exportRows(await listAdminProperties({ cityId: input.cityId, limit: 500 }));
  const workbook = XLSX.utils.book_new();
  const dataSheet = XLSX.utils.json_to_sheet(rows);
  const guideSheet = XLSX.utils.aoa_to_sheet([
    ["SAparts admin workbook"],
    ["Use Property ID to update an existing listing. Leave Property ID blank and supply City + Name to create a new unpublished draft."],
    ["Paste factual, source-backed updates only. Publication is blocked until official website, 80+ character description, hero, and 10 total images exist."],
    ["Upload images through the Admin Portal; this workbook does not upload file bytes."],
    ["Rows with invalid values are returned in an error report during import."],
  ]);
  XLSX.utils.book_append_sheet(workbook, dataSheet, "Listings");
  XLSX.utils.book_append_sheet(workbook, guideSheet, "Read me");
  return XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
}

const spreadsheetFields: Record<string, keyof AdminPropertyPatch> = {
  "Name": "name", "Brand / operator": "brand", "Category": "category", "District / neighbourhood": "neighborhood",
  "Address": "address", "Official website": "officialUrl", "Virtual tour": "virtualTourUrl", "Description": "description",
  "Amenities (comma-separated)": "amenities", "Residence types (comma-separated)": "unitTypes", "Minimum stay nights": "minStayNights",
  "Daily price from USD": "priceFromDailyUsd", "Daily price to USD": "priceToDailyUsd", "Monthly price from USD": "priceFromMonthlyUsd",
  "Monthly price to USD": "priceToMonthlyUsd", "Published": "published", "Featured": "featured",
};

function parseSpreadsheetValue(field: keyof AdminPropertyPatch, value: unknown): unknown {
  if (field === "amenities" || field === "unitTypes") return toStringArray(value);
  if (["minStayNights", "priceFromDailyUsd", "priceToDailyUsd", "priceFromMonthlyUsd", "priceToMonthlyUsd"].includes(field)) return nullableInt(value);
  if (field === "published" || field === "featured") return [true, "true", "yes", "1", 1].includes(typeof value === "string" ? value.trim().toLowerCase() : value as any);
  return nullableString(value);
}

export async function previewAdminWorkbook(dataBase64: string) {
  const workbook = XLSX.read(Buffer.from(dataBase64, "base64"), { type: "buffer" });
  const sheet = workbook.Sheets["Listings"];
  if (!sheet) throw new Error("Workbook must include a Listings worksheet");
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const results: Array<{ row: number; action: "update" | "create"; propertyId?: number; cityId?: number; name?: string; changes?: AdminPropertyPatch; errors: string[] }> = [];
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const propertyId = Number(row["Property ID"]);
    const errors: string[] = [];
    const isCreate = !Number.isInteger(propertyId);
    const existing = isCreate ? undefined : (await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1))[0];
    if (!isCreate && !existing) errors.push("Property ID was not found");
    const cityName = String(row["City"] || "").trim();
    const city = isCreate && cityName ? (await db.select().from(cities).where(sql`LOWER(${cities.name}) = LOWER(${cityName})`).limit(1))[0] : undefined;
    const requestedName = String(row["Name"] || "").trim();
    if (isCreate && !city) errors.push("New rows require a valid City");
    if (isCreate && requestedName.length < 2) errors.push("New rows require a listing Name");
    const changes: AdminPropertyPatch = {};
    if (existing || isCreate) {
      for (const [column, field] of Object.entries(spreadsheetFields)) {
        if (!(column in row)) continue;
        const next = parseSpreadsheetValue(field, row[column]);
        const current = existing ? (existing as any)[field] : null;
        if (isCreate || JSON.stringify(next) !== JSON.stringify(current ?? null)) changes[field] = next;
      }
      if (isCreate) changes.published = false;
      if (changes.category && !["Serviced Apartment", "Aparthotel", "Residence", "Penthouse"].includes(String(changes.category))) {
        errors.push("Category must be Serviced Apartment, Aparthotel, Residence, or Penthouse");
      }
      if (changes.officialUrl && !URL.canParse(String(changes.officialUrl))) {
        errors.push("Official website must be a valid URL");
      }
      if (changes.virtualTourUrl && !URL.canParse(String(changes.virtualTourUrl))) {
        errors.push("Virtual tour must be a valid URL");
      }
      if (!isCreate && changes.published === true) {
        const issues = await assertPublicationFloor(propertyId, changes);
        errors.push(...issues);
      }
    }
    results.push({ row: index + 2, action: isCreate ? "create" : "update", propertyId: existing?.id, cityId: city?.id, name: existing?.name || requestedName, changes, errors });
  }
  return results;
}

export async function applyAdminWorkbook(dataBase64: string) {
  const preview = await previewAdminWorkbook(dataBase64);
  const applied: number[] = [];
  const errors = preview.filter((row) => row.errors.length);
  if (errors.length) return { applied, errors, preview };
  for (const row of preview) {
    if (row.action === "create" && row.cityId && row.name) {
      const created = await createAdminProperty({ cityId: row.cityId, name: row.name, category: row.changes?.category as any });
      if (!created) throw new Error("Could not create draft listing");
      const patch = { ...row.changes } as AdminPropertyPatch;
      delete patch.name; delete patch.category; delete patch.published;
      if (Object.keys(patch).length) await updateAdminProperty(created.property.id, patch);
      applied.push(created.property.id);
    } else if (row.propertyId && row.changes && Object.keys(row.changes).length) {
      await updateAdminProperty(row.propertyId, row.changes);
      applied.push(row.propertyId);
    }
  }
  return { applied, errors: [], preview };
}
