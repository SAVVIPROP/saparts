import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function contextFor(role: "admin" | "user" | null): TrpcContext {
  return {
    user: role
      ? {
          id: 1,
          openId: "portal-test-user",
          email: "test@example.com",
          name: "Portal Test",
          loginMethod: "manus",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin portal authorization", () => {
  it("rejects a signed-in non-admin before listing data is read", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.admin.listProperties()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects an anonymous visitor before a workbook can be exported", async () => {
    const caller = appRouter.createCaller(contextFor(null));
    await expect(caller.admin.exportWorkbook()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects a signed-in non-admin before a staged listing can be created", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.admin.createProperty({ cityId: 1, name: "Unapproved Test Listing" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
