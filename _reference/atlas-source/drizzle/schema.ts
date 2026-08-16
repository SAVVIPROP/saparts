import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
} from "drizzle-orm/mysql-core";

/**
 * USERS
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * CITIES
 * One row per city (20 named cities).
 */
export const cities = mysqlTable("cities", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(), // e.g. "london"
  name: varchar("name", { length: 128 }).notNull(),
  country: varchar("country", { length: 128 }).notNull(),
  region: varchar("region", { length: 64 }).notNull(), // Europe, Americas, Asia-Pacific, Middle East & Africa
  tagline: text("tagline"), // short editorial teaser
  heroImageUrl: text("heroImageUrl"),
  coverImageUrl: text("coverImageUrl"),
  dossier: text("dossier"), // longer editorial body (markdown)
  businessDistricts: text("businessDistricts"), // JSON-encoded array of key business district names
  neighborhoods: json("neighborhoods"), // [{ name, description, vibe, pricingIndex }]
  avgMonthlyRateUsd: int("avgMonthlyRateUsd"),
  avgDailyRateUsd: int("avgDailyRateUsd"),
  currencyCode: varchar("currencyCode", { length: 8 }).default("USD"),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  timezone: varchar("timezone", { length: 64 }),
  featured: boolean("featured").default(false).notNull(),
  published: boolean("published").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type City = typeof cities.$inferSelect;
export type InsertCity = typeof cities.$inferInsert;

/**
 * PROPERTIES
 */
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  cityId: int("cityId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  brand: varchar("brand", { length: 128 }), // e.g. "The Ascott", "Frasers", independent
  category: mysqlEnum("category", [
    "Serviced Apartment",
    "Aparthotel",
    "Residence",
    "Penthouse",
  ]).notNull(),
  tagline: text("tagline"),
  description: text("description"), // editorial body (markdown)
  neighborhood: varchar("neighborhood", { length: 128 }),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  heroImageUrl: text("heroImageUrl"),
  unitTypes: json("unitTypes"), // ["Studio","1-Bed","2-Bed","3-Bed","Penthouse","Duplex","House"]
  amenities: json("amenities"), // ["Gym","Pool","Workspace","Laundry",...]
  minStayNights: int("minStayNights").default(1),
  ratingScore: decimal("ratingScore", { precision: 3, scale: 1 }), // e.g. 9.2
  ratingSource: varchar("ratingSource", { length: 64 }), // e.g. "Booking.com"
  priceFromDailyUsd: int("priceFromDailyUsd"),
  priceToDailyUsd: int("priceToDailyUsd"),
  priceFromMonthlyUsd: int("priceFromMonthlyUsd"),
  priceToMonthlyUsd: int("priceToMonthlyUsd"),
  bookingUrl: text("bookingUrl"),
  expediaUrl: text("expediaUrl"),
  tripUrl: text("tripUrl"),
  officialUrl: text("officialUrl"),
  virtualTourUrl: text("virtualTourUrl"),
  bestForTags: json("bestForTags"), // ["Best for Executives","Best for Families","Best for Extended Stays","Best for Pets"]
  operatorGroup: varchar("operatorGroup", { length: 128 }), // e.g. "Edyn", "Cheval Collection", "Sonder"
  rateCurve: json("rateCurve"), // [{ stayDays: 7|30|90|180, perNightUsd, perMonthUsd, savingsPct }]
  unitMix: json("unitMix"), // [{ type: "Studio"|"1-Bed"|..., m2, count, baseMonthlyUsd }]
  personaFit: json("personaFit"), // { executives, families, extended, pets } each 0–10
  wfaScore: int("wfaScore"), // 0-100 work-from-apartment score
  transitScore: int("transitScore"), // 0-100
  lifestyleScore: int("lifestyleScore"),
  quietnessScore: int("quietnessScore"),
  valueScore: int("valueScore"),
  featured: boolean("featured").default(false).notNull(),
  published: boolean("published").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

/**
 * PROPERTY IMAGES
 */
export const propertyImages = mysqlTable("propertyImages", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  url: text("url").notNull(),
  caption: text("caption"),
  alt: text("alt"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PropertyImage = typeof propertyImages.$inferSelect;
export type InsertPropertyImage = typeof propertyImages.$inferInsert;

/**
 * PROPERTY SOURCES
 * Source material pasted or uploaded by an administrator. It is retained so
 * every factual enrichment can be traced back to its originating material.
 */
export const propertySources = mysqlTable("propertySources", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  sourceUrl: text("sourceUrl"),
  sourceTitle: varchar("sourceTitle", { length: 256 }),
  sourceType: varchar("sourceType", { length: 64 }).default("pasted_text").notNull(),
  sourceText: text("sourceText").notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PropertySource = typeof propertySources.$inferSelect;

/**
 * PROPERTY ENRICHMENT DRAFTS
 * Structured factual suggestions extracted from a source. Drafts must be
 * explicitly approved by an administrator before changing a live listing.
 */
export const propertyEnrichmentDrafts = mysqlTable("propertyEnrichmentDrafts", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  sourceId: int("sourceId").notNull(),
  proposedFields: json("proposedFields").notNull(),
  evidence: json("evidence").notNull(),
  status: mysqlEnum("status", ["draft", "approved", "rejected"]).default("draft").notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  reviewedByUserId: int("reviewedByUserId"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyEnrichmentDraft = typeof propertyEnrichmentDrafts.$inferSelect;

/**
 * SHORTLISTS
 * Public read via shareToken; write requires owner.
 */
export const shortlists = mysqlTable("shortlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // nullable to allow guest-initiated lists later
  title: varchar("title", { length: 256 }).notNull(),
  note: text("note"),
  shareToken: varchar("shareToken", { length: 64 }).notNull().unique(),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Shortlist = typeof shortlists.$inferSelect;
export type InsertShortlist = typeof shortlists.$inferInsert;

export const shortlistItems = mysqlTable("shortlistItems", {
  id: int("id").autoincrement().primaryKey(),
  shortlistId: int("shortlistId").notNull(),
  propertyId: int("propertyId").notNull(),
  note: text("note"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShortlistItem = typeof shortlistItems.$inferSelect;
export type InsertShortlistItem = typeof shortlistItems.$inferInsert;

/**
 * NEWSLETTER SUBSCRIBERS
 */
export const newsletterSubscribers = mysqlTable("newsletterSubscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

/**
 * INSIGHTS ARTICLES (Market Insights editorial hub)
 */
export const insights = mysqlTable("insights", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  dek: text("dek"),
  body: text("body"), // markdown
  heroImageUrl: text("heroImageUrl"),
  category: varchar("category", { length: 64 }), // Market, Relocation, Corporate, City Guide
  cityId: int("cityId"),
  readMinutes: int("readMinutes"),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Insight = typeof insights.$inferSelect;
export type InsertInsight = typeof insights.$inferInsert;
