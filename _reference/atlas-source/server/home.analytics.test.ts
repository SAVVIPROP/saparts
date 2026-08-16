import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

describe("home.analytics", () => {
  it("returns aggregate analytics shaped for the homepage cards", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.home.analytics();

    // Rate curve: four stay-length tiers with descending savings
    expect(Array.isArray(result.rateCurve)).toBe(true);
    expect(result.rateCurve.length).toBe(4);
    const seven = result.rateCurve.find((p: any) => p.stayDays === 7);
    const oneEighty = result.rateCurve.find((p: any) => p.stayDays === 180);
    expect(seven?.savingsPct).toBe(0);
    if (oneEighty && seven && (seven.avgMonthlyUsd as number) > 0) {
      expect(oneEighty.savingsPct).toBeGreaterThan(0);
    }

    // Review-by-tier: each tier returns five themes on a 0..10 scale
    expect(Array.isArray(result.reviewByTier)).toBe(true);
    for (const t of result.reviewByTier) {
      expect(Array.isArray(t.themes)).toBe(true);
      for (const theme of t.themes) {
        expect(theme.score).toBeGreaterThanOrEqual(0);
        expect(theme.score).toBeLessThanOrEqual(10);
      }
    }

    // Operator concentration: shares should sum to roughly 100%
    expect(Array.isArray(result.groups)).toBe(true);
    if (result.groups.length > 0) {
      const sum = result.groups.reduce((acc: number, g: any) => acc + g.sharePct, 0);
      expect(sum).toBeGreaterThan(80);
      expect(sum).toBeLessThan(120);
    }

    // Supply-gap: one row per region with non-negative cells
    expect(Array.isArray(result.supplyGap)).toBe(true);
    for (const r of result.supplyGap) {
      expect(typeof r.region).toBe("string");
      for (const key of ["executives", "families", "extended", "pets"]) {
        expect((r as any)[key] >= 0).toBe(true);
      }
    }
  });
});
