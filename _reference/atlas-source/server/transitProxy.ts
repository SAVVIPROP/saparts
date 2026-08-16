import { Express, Request, Response } from "express";

/**
 * Proxy for OpenStreetMap Overpass API to avoid CORS issues on the frontend.
 * GET /api/transit?lat=51.5&lon=-0.1&radius=1200
 */
export function registerTransitProxy(app: Express) {
  app.get("/api/transit", async (req: Request, res: Response) => {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const radius = Math.min(parseInt(req.query.radius as string) || 1200, 2000);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: "Invalid lat/lon" });
    }

    const query = `
      [out:json][timeout:15];
      (
        node["railway"="station"](around:${radius},${lat},${lon});
        node["railway"="subway_entrance"](around:${radius},${lat},${lon});
        node["railway"="tram_stop"](around:${radius},${lat},${lon});
        node["highway"="bus_stop"](around:${radius},${lat},${lon});
        node["amenity"="ferry_terminal"](around:${radius},${lat},${lon});
      );
      out body;
    `;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const upstream = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
        headers: { "Content-Type": "text/plain" },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!upstream.ok) {
        return res.status(502).json({ error: "Overpass API error" });
      }

      const data = await upstream.json();
      res.set("Cache-Control", "public, max-age=86400"); // cache 24h
      res.json(data);
    } catch (err: any) {
      res.status(504).json({ error: "Transit data unavailable", detail: err.message });
    }
  });
}
