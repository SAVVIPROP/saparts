import type { Express } from "express";
import { describe, expect, it } from "vitest";
import { registerStorageProxy } from "./storageProxy";

describe("registerStorageProxy", () => {
  it("registers a public media route alongside the legacy storage route", () => {
    const registeredPaths: string[] = [];
    const app = {
      get: (path: string) => {
        registeredPaths.push(path);
      },
    } as unknown as Express;

    registerStorageProxy(app);

    expect(registeredPaths).toContain("/manus-storage/*");
    expect(registeredPaths).toContain("/media/*");
  });
});
