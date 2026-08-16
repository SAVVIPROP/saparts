import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertCity,
  InsertInsight,
  InsertNewsletterSubscriber,
  InsertProperty,
  InsertPropertyImage,
  InsertShortlist,
  InsertShortlistItem,
  InsertUser,
  cities,
  insights,
  newsletterSubscribers,
  properties,
  propertyImages,
  shortlistItems,
  shortlists,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/** Used only by resumable offline enrichment workers after a database idle timeout. */
export function resetDbConnection() {
  _db = null;
}

/* -------------------- USERS -------------------- */

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/* -------------------- CITIES -------------------- */

export async function listCities() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(cities)
    .where(eq(cities.published, true))
    .orderBy(desc(cities.featured), asc(cities.sortOrder), asc(cities.name));
}

export async function getCityBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(cities).where(eq(cities.slug, slug)).limit(1);
  return rows[0];
}

export async function getCityById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(cities).where(eq(cities.id, id)).limit(1);
  return rows[0];
}

export async function upsertCity(input: InsertCity) {
  const db = await getDb();
  if (!db) return;
  await db.insert(cities).values(input).onDuplicateKeyUpdate({
    set: {
      name: input.name,
      country: input.country,
      region: input.region,
      tagline: input.tagline ?? null,
      heroImageUrl: input.heroImageUrl ?? null,
      coverImageUrl: input.coverImageUrl ?? null,
      dossier: input.dossier ?? null,
      businessDistricts: input.businessDistricts ?? null,
      neighborhoods: input.neighborhoods ?? null,
      avgMonthlyRateUsd: input.avgMonthlyRateUsd ?? null,
      avgDailyRateUsd: input.avgDailyRateUsd ?? null,
      currencyCode: input.currencyCode ?? "USD",
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      timezone: input.timezone ?? null,
      featured: input.featured ?? false,
      published: input.published ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

/* -------------------- PROPERTIES -------------------- */

export async function listPropertiesByCity(cityId: number, opts?: { limit?: number }) {
  const db = await getDb();
  if (!db) return [];
  const q = db
    .select()
    .from(properties)
    .where(and(eq(properties.cityId, cityId), eq(properties.published, true)))
    .orderBy(desc(properties.featured), asc(properties.sortOrder), desc(properties.ratingScore));
  if (opts?.limit) return q.limit(opts.limit);
  return q;
}

export async function getPropertyBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(properties).where(eq(properties.slug, slug)).limit(1);
  return rows[0];
}

export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return rows[0];
}

export async function getPropertiesByIds(ids: number[]) {
  const db = await getDb();
  if (!db || ids.length === 0) return [];
  return db.select().from(properties).where(inArray(properties.id, ids));
}

export async function searchProperties(params: {
  cityId?: number;
  category?: string;
  unitType?: string;
  minPrice?: number;
  maxPrice?: number;
  bestForTag?: string;
  q?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(properties.published, true)];
  if (params.cityId) conditions.push(eq(properties.cityId, params.cityId));
  if (params.category) conditions.push(eq(properties.category, params.category as any));
  if (params.minPrice) conditions.push(sql`${properties.priceFromDailyUsd} >= ${params.minPrice}`);
  if (params.maxPrice) conditions.push(sql`${properties.priceFromDailyUsd} <= ${params.maxPrice}`);
  if (params.q) {
    conditions.push(
      or(
        sql`${properties.name} LIKE ${"%" + params.q + "%"}`,
        sql`${properties.neighborhood} LIKE ${"%" + params.q + "%"}`,
        sql`${properties.brand} LIKE ${"%" + params.q + "%"}`,
      )!,
    );
  }

  const q = db
    .select()
    .from(properties)
    .where(and(...conditions))
    .orderBy(desc(properties.featured), desc(properties.ratingScore));
  if (params.limit) return q.limit(params.limit);
  return q;
}

export async function featuredPropertiesByTag(tag: string, limit: number = 12) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(properties)
    .where(and(eq(properties.published, true), sql`JSON_CONTAINS(${properties.bestForTags}, JSON_QUOTE(${tag}))`))
    .orderBy(desc(properties.featured), desc(properties.ratingScore))
    .limit(limit);
}

export async function upsertProperty(input: InsertProperty) {
  const db = await getDb();
  if (!db) return;
  await db.insert(properties).values(input).onDuplicateKeyUpdate({
    set: {
      cityId: input.cityId,
      name: input.name,
      brand: input.brand ?? null,
      category: input.category,
      tagline: input.tagline ?? null,
      description: input.description ?? null,
      neighborhood: input.neighborhood ?? null,
      address: input.address ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      heroImageUrl: input.heroImageUrl ?? null,
      unitTypes: input.unitTypes ?? null,
      amenities: input.amenities ?? null,
      minStayNights: input.minStayNights ?? 1,
      ratingScore: input.ratingScore ?? null,
      ratingSource: input.ratingSource ?? null,
      priceFromDailyUsd: input.priceFromDailyUsd ?? null,
      priceToDailyUsd: input.priceToDailyUsd ?? null,
      priceFromMonthlyUsd: input.priceFromMonthlyUsd ?? null,
      priceToMonthlyUsd: input.priceToMonthlyUsd ?? null,
      bookingUrl: input.bookingUrl ?? null,
      expediaUrl: input.expediaUrl ?? null,
      tripUrl: input.tripUrl ?? null,
      officialUrl: input.officialUrl ?? null,
      virtualTourUrl: input.virtualTourUrl ?? null,
      bestForTags: input.bestForTags ?? null,
      wfaScore: input.wfaScore ?? null,
      transitScore: input.transitScore ?? null,
      lifestyleScore: input.lifestyleScore ?? null,
      quietnessScore: input.quietnessScore ?? null,
      valueScore: input.valueScore ?? null,
      featured: input.featured ?? false,
      published: input.published ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

/* -------------------- PROPERTY IMAGES -------------------- */

export async function listPropertyImages(propertyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, propertyId))
    .orderBy(asc(propertyImages.sortOrder));
}

export async function insertPropertyImage(input: InsertPropertyImage) {
  const db = await getDb();
  if (!db) return;
  await db.insert(propertyImages).values(input);
}

/* -------------------- SHORTLISTS -------------------- */

export async function createShortlist(input: InsertShortlist) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result: any = await db.insert(shortlists).values(input);
  const insertId = (result?.[0]?.insertId ?? result?.insertId) as number;
  return insertId;
}

export async function getShortlistByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(shortlists).where(eq(shortlists.shareToken, token)).limit(1);
  return rows[0];
}

export async function listShortlistsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(shortlists)
    .where(eq(shortlists.userId, userId))
    .orderBy(desc(shortlists.updatedAt));
}

export async function getShortlistItems(shortlistId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(shortlistItems)
    .where(eq(shortlistItems.shortlistId, shortlistId))
    .orderBy(asc(shortlistItems.sortOrder));
}

export async function addShortlistItem(input: InsertShortlistItem) {
  const db = await getDb();
  if (!db) return;
  await db.insert(shortlistItems).values(input);
}

export async function removeShortlistItem(shortlistId: number, propertyId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(shortlistItems)
    .where(and(eq(shortlistItems.shortlistId, shortlistId), eq(shortlistItems.propertyId, propertyId)));
}

export async function updateShortlistMeta(id: number, userId: number, updates: Partial<InsertShortlist>) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(shortlists)
    .set(updates)
    .where(and(eq(shortlists.id, id), eq(shortlists.userId, userId)));
}

export async function deleteShortlist(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(shortlistItems).where(eq(shortlistItems.shortlistId, id));
  await db.delete(shortlists).where(and(eq(shortlists.id, id), eq(shortlists.userId, userId)));
}

/* -------------------- NEWSLETTER -------------------- */

export async function subscribeNewsletter(input: InsertNewsletterSubscriber) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(newsletterSubscribers).values(input);
  } catch (e) {
    // likely duplicate, ignore
  }
}

/* -------------------- INSIGHTS -------------------- */

export async function listInsights(opts?: { limit?: number; featured?: boolean; category?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (opts?.featured) conditions.push(eq(insights.featured, true));
  if (opts?.category) conditions.push(eq(insights.category, opts.category));
  const q = db
    .select()
    .from(insights)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(insights.publishedAt));
  if (opts?.limit) return q.limit(opts.limit);
  return q;
}

export async function getInsightBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(insights).where(eq(insights.slug, slug)).limit(1);
  return rows[0];
}

export async function upsertInsight(input: InsertInsight) {
  const db = await getDb();
  if (!db) return;
  await db.insert(insights).values(input).onDuplicateKeyUpdate({
    set: {
      title: input.title,
      dek: input.dek ?? null,
      body: input.body ?? null,
      heroImageUrl: input.heroImageUrl ?? null,
      category: input.category ?? null,
      cityId: input.cityId ?? null,
      readMinutes: input.readMinutes ?? null,
      featured: input.featured ?? false,
    },
  });
}

/* -------------------- BOOKMARKS (default shortlist) -------------------- */

import { nanoid as _nanoid } from "nanoid";

export async function getOrCreateBookmarkShortlistId(userId: number): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  const lists = await db
    .select()
    .from(shortlists)
    .where(and(eq(shortlists.userId, userId), eq(shortlists.title, "Bookmarks")))
    .limit(1);
  if (lists[0]) return lists[0].id;
  const result: any = await db.insert(shortlists).values({
    userId,
    title: "Bookmarks",
    note: null,
    shareToken: _nanoid(16),
    isPublic: false,
  });
  const insertId = (result?.[0]?.insertId ?? result?.insertId) as number;
  return insertId;
}

export async function listBookmarkedPropertyIds(userId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const id = await getOrCreateBookmarkShortlistId(userId);
  if (!id) return [];
  const rows = await db
    .select({ propertyId: shortlistItems.propertyId })
    .from(shortlistItems)
    .where(eq(shortlistItems.shortlistId, id));
  return rows.map((r) => r.propertyId);
}

export async function toggleBookmark(userId: number, propertyId: number): Promise<{ bookmarked: boolean }> {
  const db = await getDb();
  if (!db) return { bookmarked: false };
  const id = await getOrCreateBookmarkShortlistId(userId);
  if (!id) return { bookmarked: false };
  const existing = await db
    .select()
    .from(shortlistItems)
    .where(and(eq(shortlistItems.shortlistId, id), eq(shortlistItems.propertyId, propertyId)))
    .limit(1);
  if (existing[0]) {
    await db
      .delete(shortlistItems)
      .where(and(eq(shortlistItems.shortlistId, id), eq(shortlistItems.propertyId, propertyId)));
    return { bookmarked: false };
  }
  await db.insert(shortlistItems).values({ shortlistId: id, propertyId, sortOrder: 0 });
  return { bookmarked: true };
}

/* -------------------- ROOM TYPES -------------------- */

export interface RoomType {
  id: number;
  name: string;
  beds: string[];
  maxOccupancy: number | null;
  sizeSqm: number | null;
  price30NightsUsd: number | null;
  facilities: string[];
}

export async function getRoomTypesByBookingUrl(bookingUrl: string): Promise<RoomType[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const mysql = await import("mysql2/promise");
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    const [rows] = await conn.execute<any[]>(
      `SELECT rt.id, rt.name, rt.beds, rt.max_guests, rt.size_sqm, rt.price_30nights_usd, rt.facilities
       FROM room_types rt
       JOIN scraped_properties sp ON rt.scraped_property_id = sp.id
       WHERE sp.booking_com_url = ?
       ORDER BY rt.price_30nights_usd ASC`,
      [bookingUrl]
    );
    await conn.end();
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      beds: r.beds ? (typeof r.beds === "string" ? JSON.parse(r.beds) : r.beds) : [],
      maxOccupancy: r.max_guests ?? null,
      sizeSqm: r.size_sqm ?? null,
      price30NightsUsd: r.price_30nights_usd ? Number(r.price_30nights_usd) : null,
      facilities: r.facilities ? (typeof r.facilities === "string" ? JSON.parse(r.facilities) : r.facilities) : [],
    }));
  } catch (err) {
    console.error("[getRoomTypesByBookingUrl] error:", err);
    return [];
  }
}

/* -------------------- STATS -------------------- */

export async function getPropertyStats() {
  const db = await getDb();
  if (!db) return { totalProperties: 0, totalCities: 0, tierIProperties: 0 };
  const [propRows, cityRows, tierRows] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` }).from(properties).where(eq(properties.published, true)),
    db.select({ count: sql<number>`COUNT(*)` }).from(cities).where(eq(cities.published, true)),
    db.select({ count: sql<number>`COUNT(*)` }).from(properties).where(and(eq(properties.published, true), sql`${properties.ratingScore} >= 9.0`)),
  ]);
  return {
    totalProperties: Number(propRows[0]?.count ?? 0),
    totalCities: Number(cityRows[0]?.count ?? 0),
    tierIProperties: Number(tierRows[0]?.count ?? 0),
  };
}
