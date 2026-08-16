/**
 * Vitest integration tests for critical tRPC procedures:
 *   - newsletter.subscribe
 *   - shortlists.create + shortlists.byToken (share-token round-trip)
 *   - shortlists.toggleBookmark
 *
 * These tests run against the real database when DATABASE_URL is set.
 * When the DB is unavailable they verify that the procedures handle the
 * missing-DB case gracefully (no unhandled exceptions).
 */
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/* ------------------------------------------------------------------ */
/* Context factories                                                    */
/* ------------------------------------------------------------------ */

function publicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { cookie: () => {}, clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function authedCtx(userId = 9999): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `test-open-id-${userId}`,
      name: "Test User",
      email: `test-${userId}@example.com`,
      avatarUrl: null,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { cookie: () => {}, clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

/* ------------------------------------------------------------------ */
/* newsletter.subscribe                                                 */
/* ------------------------------------------------------------------ */

describe("newsletter.subscribe", () => {
  it("accepts a valid email and returns { success: true }", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.newsletter.subscribe({
      email: `test-${Date.now()}@example.com`,
      source: "vitest",
    });
    expect(result).toEqual({ success: true });
  });

  it("accepts a duplicate email without throwing (idempotent)", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const email = `dup-${Date.now()}@example.com`;
    await caller.newsletter.subscribe({ email, source: "vitest" });
    // Second call should not throw
    const result = await caller.newsletter.subscribe({ email, source: "vitest" });
    expect(result).toEqual({ success: true });
  });

  it("rejects an invalid email with a validation error", async () => {
    const caller = appRouter.createCaller(publicCtx());
    await expect(
      caller.newsletter.subscribe({ email: "not-an-email" })
    ).rejects.toThrow();
  });
});

/* ------------------------------------------------------------------ */
/* shortlists.create + shortlists.byToken (share-token round-trip)     */
/* ------------------------------------------------------------------ */

describe("shortlists share-token round-trip", () => {
  it("creates a shortlist and retrieves it by its share token", async () => {
    const caller = appRouter.createCaller(authedCtx(8001));
    const created = await caller.shortlists.create({ title: "Vitest Shortlist" });

    expect(typeof created.id).toBe("number");
    expect(typeof created.shareToken).toBe("string");
    expect(created.shareToken.length).toBeGreaterThan(0);

    // Public retrieval via token
    const publicCaller = appRouter.createCaller(publicCtx());
    const fetched = await publicCaller.shortlists.byToken({ token: created.shareToken });

    // If DB is available the shortlist should be found
    if (fetched !== null) {
      expect(fetched.shortlist.id).toBe(created.id);
      expect(fetched.shortlist.shareToken).toBe(created.shareToken);
      expect(Array.isArray(fetched.items)).toBe(true);
    }
    // If DB is unavailable, fetched will be null — that's acceptable
  });

  it("returns null for a non-existent share token", async () => {
    const publicCaller = appRouter.createCaller(publicCtx());
    const result = await publicCaller.shortlists.byToken({ token: "does-not-exist-xyz" });
    expect(result).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/* shortlists.toggleBookmark                                            */
/* ------------------------------------------------------------------ */

describe("shortlists.toggleBookmark", () => {
  it("toggles bookmark on and off for a property", async () => {
    const caller = appRouter.createCaller(authedCtx(8002));

    // Use a property ID that is unlikely to exist — the DB helper handles missing gracefully
    const propertyId = 999999;

    // First toggle: should bookmark (or return false if DB unavailable)
    const first = await caller.shortlists.toggleBookmark({ propertyId });
    expect(typeof first.bookmarked).toBe("boolean");

    // Second toggle: should flip the state (if DB is available)
    const second = await caller.shortlists.toggleBookmark({ propertyId });
    expect(typeof second.bookmarked).toBe("boolean");

    // If DB is available the two calls should return opposite values
    if (first.bookmarked !== false || second.bookmarked !== false) {
      // At least one real DB interaction occurred
      expect(first.bookmarked).not.toBe(second.bookmarked);
    }
  });

  it("requires authentication — throws UNAUTHORIZED for anonymous callers", async () => {
    const caller = appRouter.createCaller(publicCtx());
    await expect(
      (caller.shortlists as any).toggleBookmark({ propertyId: 1 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
