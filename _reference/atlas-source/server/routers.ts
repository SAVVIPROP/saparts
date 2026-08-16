import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  applyAdminWorkbook,
  approveEnrichmentDraft,
  createAdminProperty,
  createSourceAndDraft,
  exportAdminWorkbook,
  getAdminProperty,
  listAdminProperties,
  previewAdminWorkbook,
  rejectEnrichmentDraft,
  removeAdminPropertyImage,
  reorderAdminPropertyImages,
  updateAdminProperty,
  uploadAdminPropertyImage,
} from "./admin";
import {
  addShortlistItem,
  createShortlist,
  deleteShortlist,
  featuredPropertiesByTag,
  getCityById,
  getCityBySlug,
  getInsightBySlug,
  getPropertiesByIds,
  getPropertyBySlug,
  getShortlistByToken,
  getShortlistItems,
  listCities,
  listInsights,
  listPropertiesByCity,
  listPropertyImages,
  listShortlistsForUser,
  listBookmarkedPropertyIds,
  removeShortlistItem,
  searchProperties,
  subscribeNewsletter,
  toggleBookmark,
  updateShortlistMeta,
  getRoomTypesByBookingUrl,
  getPropertyStats,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  /* -------------------- CITIES -------------------- */
  cities: router({
    list: publicProcedure.query(() => listCities()),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => getCityBySlug(input.slug)),
  }),

  /* -------------------- PROPERTIES -------------------- */
  properties: router({
    byCitySlug: publicProcedure
      .input(z.object({ citySlug: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        const city = await getCityBySlug(input.citySlug);
        if (!city) return [];
        return listPropertiesByCity(city.id, { limit: input.limit });
      }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const property = await getPropertyBySlug(input.slug);
        if (!property) return null;
        const images = await listPropertyImages(property.id);
        const city = await getCityById(property.cityId);
        const roomTypes = property.bookingUrl
          ? await getRoomTypesByBookingUrl(property.bookingUrl)
          : [];
        return { property, images, city, roomTypes };
      }),

    search: publicProcedure
      .input(
        z.object({
          citySlug: z.string().optional(),
          category: z.string().optional(),
          unitType: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          bestForTag: z.string().optional(),
          q: z.string().optional(),
          limit: z.number().optional().default(500),
        }),
      )
      .query(async ({ input }) => {
        let cityId: number | undefined;
        if (input.citySlug) {
          const city = await getCityBySlug(input.citySlug);
          cityId = city?.id;
        }
        return searchProperties({
          cityId,
          category: input.category,
          unitType: input.unitType,
          minPrice: input.minPrice,
          maxPrice: input.maxPrice,
          bestForTag: input.bestForTag,
          q: input.q,
          limit: input.limit,
        });
      }),

    featuredByTag: publicProcedure
      .input(z.object({ tag: z.string(), limit: z.number().optional().default(12) }))
      .query(({ input }) => featuredPropertiesByTag(input.tag, input.limit)),
  }),

  /* -------------------- HOME ANALYTICS -------------------- */
  home: router({
    analytics: publicProcedure.query(async () => {
      const [cities, properties] = await Promise.all([
        listCities(),
        searchProperties({ limit: 1000 }),
      ]);

      // operator group concentration
      const groupCounts: Record<string, number> = {};
      for (const p of properties) {
        const g = (p as any).operatorGroup ?? p.brand ?? "Independent";
        groupCounts[g] = (groupCounts[g] ?? 0) + 1;
      }
      const groups = Object.entries(groupCounts)
        .map(([name, count]) => ({ name, count, sharePct: Math.round((count / properties.length) * 1000) / 10 }))
        .sort((a, b) => b.count - a.count);

      // rate curve aggregate (per stay length)
      const curveSum: Record<number, { sum: number; n: number; savings: number }> = {
        7: { sum: 0, n: 0, savings: 0 },
        30: { sum: 0, n: 0, savings: 0 },
        90: { sum: 0, n: 0, savings: 0 },
        180: { sum: 0, n: 0, savings: 0 },
      };
      for (const p of properties) {
        const curve = (p as any).rateCurve as Array<any> | null;
        if (!Array.isArray(curve)) continue;
        for (const point of curve) {
          const slot = curveSum[point.stayDays];
          if (slot) {
            slot.sum += point.perMonthUsd;
            slot.n++;
            slot.savings = point.savingsPct;
          }
        }
      }
      const rateCurve = Object.entries(curveSum).map(([days, v]) => ({
        stayDays: Number(days),
        avgMonthlyUsd: v.n ? Math.round(v.sum / v.n) : 0,
        savingsPct: v.savings,
      }));

      // review themes by tier
      const tier = (p: any) => (Number(p.ratingScore) >= 9.0 ? "I" : Number(p.ratingScore) >= 8.5 ? "II" : "III");
      const themeKeys = ["wfaScore", "transitScore", "lifestyleScore", "quietnessScore", "valueScore"] as const;
      const themeLabel: Record<string, string> = {
        wfaScore: "Workspace",
        transitScore: "Transit",
        lifestyleScore: "Lifestyle",
        quietnessScore: "Quietness",
        valueScore: "Value",
      };
      const themeAgg: Record<string, Record<string, { sum: number; n: number }>> = {};
      for (const p of properties) {
        const t = tier(p);
        themeAgg[t] = themeAgg[t] ?? {};
        for (const k of themeKeys) {
          if (typeof (p as any)[k] === "number") {
            themeAgg[t][k] = themeAgg[t][k] ?? { sum: 0, n: 0 };
            themeAgg[t][k].sum += (p as any)[k];
            themeAgg[t][k].n++;
          }
        }
      }
      const reviewByTier = Object.entries(themeAgg).map(([t, themes]) => ({
        tier: t,
        themes: themeKeys.map((k) => ({
          key: themeLabel[k],
          score: themes[k] ? Math.round((themes[k].sum / themes[k].n) / 10 * 10) / 10 : 0,
        })),
      }));

      // supply gap matrix (region x persona)
      const personaKeys = ["executives", "families", "extended", "pets"] as const;
      const regions = ["Europe", "Americas", "Asia-Pacific", "Middle East & Africa"];
      const cityById: Record<number, any> = {};
      for (const c of cities) cityById[c.id] = c;
      const supply: Record<string, Record<string, number>> = {};
      for (const r of regions) {
        supply[r] = { executives: 0, families: 0, extended: 0, pets: 0 };
      }
      for (const p of properties) {
        const city = cityById[(p as any).cityId];
        if (!city) continue;
        const region = city.region;
        const fit = (p as any).personaFit || {};
        for (const k of personaKeys) {
          if ((fit[k] ?? 0) >= 8) supply[region][k] = (supply[region][k] ?? 0) + 1;
        }
      }
      const supplyGap = regions.map((r) => ({
        region: r,
        ...supply[r],
      }));

      // unit mix totals across portfolio
      const mixCounts: Record<string, { count: number; m2sum: number; n: number; baseSum: number }> = {};
      for (const p of properties) {
        const mix = (p as any).unitMix as Array<any> | null;
        if (!Array.isArray(mix)) continue;
        for (const u of mix) {
          mixCounts[u.type] = mixCounts[u.type] ?? { count: 0, m2sum: 0, n: 0, baseSum: 0 };
          mixCounts[u.type].count += u.count ?? 1;
          mixCounts[u.type].m2sum += (u.m2 ?? 0) * (u.count ?? 1);
          mixCounts[u.type].n += u.count ?? 1;
          mixCounts[u.type].baseSum += (u.baseMonthlyUsd ?? 0) * (u.count ?? 1);
        }
      }
      const totalUnits = Object.values(mixCounts).reduce((a, v) => a + v.count, 0) || 1;
      const unitMix = Object.entries(mixCounts).map(([type, v]) => ({
        type,
        units: v.count,
        sharePct: Math.round((v.count / totalUnits) * 1000) / 10,
        avgM2: v.n ? Math.round(v.m2sum / v.n) : 0,
        avgMonthlyUsd: v.n ? Math.round(v.baseSum / v.n) : 0,
      }));

      return {
        totals: {
          cities: cities.length,
          properties: properties.length,
          tierIProperties: properties.filter((p) => Number((p as any).ratingScore) >= 9.0).length,
          medianMonthlyUsd: (() => {
            const arr = properties
              .map((p) => (p as any).priceFromMonthlyUsd)
              .filter((n) => typeof n === "number" && n > 0)
              .sort((a: number, b: number) => a - b);
            return arr.length ? arr[Math.floor(arr.length / 2)] : 0;
          })(),
          totalUnits,
        },
        groups,
        rateCurve,
        reviewByTier,
        supplyGap,
        unitMix,
      };
    }),
  }),

  /* -------------------- STATS -------------------- */
  stats: router({
    global: publicProcedure.query(() => getPropertyStats()),
  }),

  /* -------------------- SHORTLISTS -------------------- */
  shortlists: router({
    listMine: protectedProcedure.query(async ({ ctx }) => {
      return listShortlistsForUser(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({ title: z.string().min(1), note: z.string().optional(), propertyIds: z.array(z.number()).optional() }))
      .mutation(async ({ ctx, input }) => {
        const shareToken = nanoid(16);
        const id = await createShortlist({
          userId: ctx.user.id,
          title: input.title,
          note: input.note ?? null,
          shareToken,
          isPublic: true,
        });
        if (input.propertyIds?.length) {
          for (let i = 0; i < input.propertyIds.length; i++) {
            await addShortlistItem({ shortlistId: id, propertyId: input.propertyIds[i], sortOrder: i });
          }
        }
        return { id, shareToken };
      }),

    addItem: protectedProcedure
      .input(z.object({ shortlistId: z.number(), propertyId: z.number() }))
      .mutation(async ({ input }) => {
        await addShortlistItem({ shortlistId: input.shortlistId, propertyId: input.propertyId });
        return { success: true };
      }),

    removeItem: protectedProcedure
      .input(z.object({ shortlistId: z.number(), propertyId: z.number() }))
      .mutation(async ({ input }) => {
        await removeShortlistItem(input.shortlistId, input.propertyId);
        return { success: true };
      }),

    rename: protectedProcedure
      .input(z.object({ id: z.number(), title: z.string().min(1), note: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await updateShortlistMeta(input.id, ctx.user.id, { title: input.title, note: input.note ?? null });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteShortlist(input.id, ctx.user.id);
        return { success: true };
      }),

    /** Public read by share token (no auth required). */
    byToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const shortlist = await getShortlistByToken(input.token);
        if (!shortlist || !shortlist.isPublic) return null;
        const items = await getShortlistItems(shortlist.id);
        const propertyIds = items.map((i) => i.propertyId);
        const props = await getPropertiesByIds(propertyIds);
        const cityIds = Array.from(new Set(props.map((p) => p.cityId)));
        const cities = await Promise.all(cityIds.map((cid) => getCityById(cid)));
        return {
          shortlist,
          items,
          properties: props,
          cities: cities.filter(Boolean),
        };
      }),

    /** Bookmarks helpers (uses a default 'Bookmarks' shortlist per user). */
    bookmarkedIds: protectedProcedure.query(async ({ ctx }) => {
      return listBookmarkedPropertyIds(ctx.user.id);
    }),

    toggleBookmark: protectedProcedure
      .input(z.object({ propertyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return toggleBookmark(ctx.user.id, input.propertyId);
      }),

    itemsForUserShortlist: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const shortlists = await listShortlistsForUser(ctx.user.id);
        const sl = shortlists.find((s) => s.id === input.id);
        if (!sl) throw new TRPCError({ code: "NOT_FOUND" });
        const items = await getShortlistItems(sl.id);
        const props = await getPropertiesByIds(items.map((i) => i.propertyId));
        return { shortlist: sl, items, properties: props };
      }),
  }),

  /* -------------------- NEWSLETTER -------------------- */
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email(), source: z.string().optional() }))
      .mutation(async ({ input }) => {
        await subscribeNewsletter({ email: input.email, source: input.source ?? "footer" });
        return { success: true };
      }),
  }),

  /* -------------------- INSIGHTS -------------------- */
  insights: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional(), featured: z.boolean().optional(), category: z.string().optional() }).optional())
      .query(({ input }) => listInsights(input ?? {})),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => getInsightBySlug(input.slug)),
  }),

  /* -------------------- ADMIN PORTAL -------------------- */
  admin: router({
    listProperties: adminProcedure
      .input(z.object({ q: z.string().optional(), cityId: z.number().int().optional(), limit: z.number().int().min(1).max(500).optional() }).optional())
      .query(({ input }) => listAdminProperties(input ?? {})),
    property: adminProcedure
      .input(z.object({ propertyId: z.number().int().positive() }))
      .query(({ input }) => getAdminProperty(input.propertyId)),
    createProperty: adminProcedure
      .input(z.object({ cityId: z.number().int().positive(), name: z.string().min(2).max(256), category: z.enum(["Serviced Apartment", "Aparthotel", "Residence", "Penthouse"]).optional() }))
      .mutation(({ input }) => createAdminProperty(input)),
    updateProperty: adminProcedure
      .input(z.object({
        propertyId: z.number().int().positive(),
        patch: z.object({
          name: z.string().min(2).max(256).optional(),
          brand: z.string().max(128).nullable().optional(),
          category: z.enum(["Serviced Apartment", "Aparthotel", "Residence", "Penthouse"]).optional(),
          tagline: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
          neighborhood: z.string().max(128).nullable().optional(),
          address: z.string().nullable().optional(),
          officialUrl: z.string().url().nullable().optional(),
          virtualTourUrl: z.string().url().nullable().optional(),
          unitTypes: z.array(z.string().min(1).max(80)).optional(),
          amenities: z.array(z.string().min(1).max(80)).optional(),
          minStayNights: z.number().int().min(1).max(3650).nullable().optional(),
          priceFromDailyUsd: z.number().int().min(0).nullable().optional(),
          priceToDailyUsd: z.number().int().min(0).nullable().optional(),
          priceFromMonthlyUsd: z.number().int().min(0).nullable().optional(),
          priceToMonthlyUsd: z.number().int().min(0).nullable().optional(),
          published: z.boolean().optional(),
          featured: z.boolean().optional(),
        }).strict(),
      }))
      .mutation(({ input }) => updateAdminProperty(input.propertyId, input.patch)),
    uploadImage: adminProcedure
      .input(z.object({ propertyId: z.number().int().positive(), filename: z.string().min(1).max(160), contentType: z.string().min(6).max(100), dataBase64: z.string().min(1).max(22_000_000), alt: z.string().max(512).optional() }))
      .mutation(({ input }) => uploadAdminPropertyImage(input)),
    reorderImages: adminProcedure
      .input(z.object({ propertyId: z.number().int().positive(), imageIds: z.array(z.number().int().positive()).min(1), heroImageId: z.number().int().positive().optional() }))
      .mutation(({ input }) => reorderAdminPropertyImages(input.propertyId, input.imageIds, input.heroImageId)),
    removeImage: adminProcedure
      .input(z.object({ propertyId: z.number().int().positive(), imageId: z.number().int().positive() }))
      .mutation(({ input }) => removeAdminPropertyImage(input.propertyId, input.imageId)),
    exportWorkbook: adminProcedure
      .input(z.object({ cityId: z.number().int().positive().optional() }).optional())
      .query(({ input }) => exportAdminWorkbook(input ?? {})),
    previewWorkbook: adminProcedure
      .input(z.object({ dataBase64: z.string().min(1).max(22_000_000) }))
      .mutation(({ input }) => previewAdminWorkbook(input.dataBase64)),
    applyWorkbook: adminProcedure
      .input(z.object({ dataBase64: z.string().min(1).max(22_000_000) }))
      .mutation(({ input }) => applyAdminWorkbook(input.dataBase64)),
    extractSource: adminProcedure
      .input(z.object({ propertyId: z.number().int().positive(), sourceUrl: z.string().url().optional(), sourceTitle: z.string().max(256).optional(), sourceText: z.string().min(80).max(50_000) }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          model: "gpt-5-mini",
          maxTokens: 4000,
          messages: [
            { role: "system", content: "You extract only factual, explicitly supported serviced-apartment information. Never infer, embellish, or invent. If a field is absent, return an empty string, empty array, or null. A description must be a neutral paraphrase of the source and must not claim a rating, price, policy, room type, or amenity unless stated." },
            { role: "user", content: `Extract factual listing updates from the following source material.\n\n${input.sourceText}` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "listing_enrichment",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  tagline: { type: "string" },
                  neighborhood: { type: "string" },
                  address: { type: "string" },
                  brand: { type: "string" },
                  officialUrl: { type: "string" },
                  virtualTourUrl: { type: "string" },
                  amenities: { type: "array", items: { type: "string" } },
                  unitTypes: { type: "array", items: { type: "string" } },
                  minStayNights: { type: ["integer", "null"] },
                  evidence: { type: "array", items: { type: "object", properties: { field: { type: "string" }, quote: { type: "string" } }, required: ["field", "quote"], additionalProperties: false } },
                },
                required: ["description", "tagline", "neighborhood", "address", "brand", "officialUrl", "virtualTourUrl", "amenities", "unitTypes", "minStayNights", "evidence"],
                additionalProperties: false,
              },
            },
          },
        });
        const raw = response.choices?.[0]?.message?.content;
        if (typeof raw !== "string") throw new TRPCError({ code: "BAD_GATEWAY", message: "Extraction service returned no content" });
        const extracted = JSON.parse(raw) as Record<string, unknown> & { evidence: Array<{ field: string; quote: string }> };
        const proposedFields = Object.fromEntries(Object.entries(extracted).filter(([key, value]) => key !== "evidence" && value !== "" && value !== null && (!Array.isArray(value) || value.length > 0)));
        const draft = await createSourceAndDraft({ ...input, userId: ctx.user.id, proposedFields, evidence: extracted.evidence });
        return { ...draft, proposedFields, evidence: extracted.evidence };
      }),
    approveDraft: adminProcedure
      .input(z.object({ draftId: z.number().int().positive() }))
      .mutation(({ ctx, input }) => approveEnrichmentDraft(input.draftId, ctx.user.id)),
    rejectDraft: adminProcedure
      .input(z.object({ draftId: z.number().int().positive() }))
      .mutation(({ ctx, input }) => rejectEnrichmentDraft(input.draftId, ctx.user.id)),
  }),

  /* -------------------- AI CONCIERGE -------------------- */
  concierge: router({
    chat: publicProcedure
      .input(
        z.object({
          messages: z.array(
            z.object({
              role: z.enum(["user", "assistant", "system"]),
              content: z.string(),
            }),
          ),
          context: z
            .object({
              propertySlug: z.string().optional(),
              citySlug: z.string().optional(),
            })
            .optional(),
        }),
      )
      .mutation(async ({ input }) => {
        let systemPrompt = `You are the SAparts Global Concierge — an authoritative, refined, and warm advisor for premium long-stay serviced apartments worldwide. You write in a confident editorial voice in the spirit of the Financial Times and Monocle. You help executives, corporate mobility teams, and relocating professionals find the right home for a long stay.

Guidelines:
- Answer concisely but with editorial polish. Use short paragraphs.
- You may discuss 30 cities: London, New York, Hong Kong, Singapore, Dubai, Tokyo, Paris, Sydney, Frankfurt, San Francisco, Amsterdam, Zurich, Madrid, Los Angeles, Toronto, Shanghai, Seoul, Abu Dhabi, Mumbai, Berlin, Cambridge, Dublin, Copenhagen, Edinburgh, Lisbon, Liverpool, Manchester, Munich, The Hague, Jersey.
- Discuss neighborhoods, commute, kitchens, workspaces, gyms, family suitability, pet policies, rough pricing ranges, and relocation logistics (visas, utilities, schools).
- When asked about pricing, give rough ranges in USD and state that rates vary by OTA partner (Booking.com, Expedia).
- If a user asks for specific booking, advise they use the property page's "Check availability" button which deep-links to Booking.com.
- Never invent ratings. If unsure, say so gracefully.
- Keep responses under 180 words unless asked for more.`;

        if (input.context?.citySlug) {
          const city = await getCityBySlug(input.context.citySlug);
          if (city) {
            systemPrompt += `\n\nCurrent city context: ${city.name}, ${city.country}. Region: ${city.region}. ${city.tagline ?? ""}`;
          }
        }
        if (input.context?.propertySlug) {
          const property = await getPropertyBySlug(input.context.propertySlug);
          if (property) {
            systemPrompt += `\n\nCurrent property context: ${property.name} (${property.category}) in ${property.neighborhood}. Price range: ~$${property.priceFromDailyUsd}-${property.priceToDailyUsd}/night.`;
          }
        }

        const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
          { role: "system", content: systemPrompt },
          ...input.messages,
        ];

        try {
          const resp = await invokeLLM({ messages });
          const content = resp?.choices?.[0]?.message?.content ?? "";
          return { reply: typeof content === "string" ? content : "" };
        } catch (err) {
          console.error("[concierge.chat] LLM error:", err);
          return {
            reply:
              "I apologise — the concierge service is momentarily unavailable. Please try again shortly, or continue browsing the curated city hubs in the meantime.",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
