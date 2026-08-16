import type { Express, Request, Response } from "express";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  const proxyStoredAsset = async (req: Request, res: Response) => {
    const key = (req.params as unknown as { [k: string]: string })[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  };

  // /manus-storage is reserved by the hosted platform and is intercepted on
  // custom domains before Express can issue the signed redirect. Use /media for
  // public application assets while retaining the legacy route for local use.
  app.get("/manus-storage/*", proxyStoredAsset);
  app.get("/media/*", proxyStoredAsset);
}
