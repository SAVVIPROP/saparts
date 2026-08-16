import { useEffect, useState } from "react";

interface TransitStop {
  name: string;
  type: "rail" | "subway" | "tram" | "bus" | "ferry";
  distanceM: number;
}

function getTypeLabel(type: TransitStop["type"]) {
  const labels: Record<TransitStop["type"], string> = {
    rail: "Train",
    subway: "Metro",
    tram: "Tram",
    bus: "Bus",
    ferry: "Ferry",
  };
  return labels[type];
}

function getTypeIcon(type: TransitStop["type"]) {
  const icons: Record<TransitStop["type"], string> = {
    rail: "🚂",
    subway: "🚇",
    tram: "🚊",
    bus: "🚌",
    ferry: "⛴",
  };
  return icons[type];
}

function formatDistance(m: number) {
  if (m < 100) return "< 100m";
  if (m < 1000) return `${Math.round(m / 50) * 50}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface NearbyTransitProps {
  lat: number;
  lon: number;
}

export default function NearbyTransit({ lat, lon }: NearbyTransitProps) {
  const [stops, setStops] = useState<TransitStop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lat || !lon) return;

    const radius = 1200;
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

    // Call Overpass API directly from the browser (CORS is supported by Overpass)
    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "text/plain" },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Overpass error");
        return r.json();
      })
      .then((data) => {
        const elements = data.elements || [];
        const seen = new Set<string>();
        const result: TransitStop[] = [];

        for (const el of elements) {
          const name = el.tags?.["name:en"] || el.tags?.name || el.tags?.ref;
          if (!name || name.length < 2) continue;
          if (seen.has(name)) continue;
          seen.add(name);

          const tags = el.tags || {};
          let type: TransitStop["type"] = "bus";
          if (tags.railway === "station" || tags.railway === "halt") type = "rail";
          else if (tags.railway === "subway_entrance" || tags.station === "subway") type = "subway";
          else if (tags.railway === "tram_stop") type = "tram";
          else if (tags.amenity === "ferry_terminal") type = "ferry";

          const distanceM = haversineDistance(lat, lon, el.lat, el.lon);
          result.push({ name, type, distanceM });
        }

        result.sort((a, b) => a.distanceM - b.distanceM);
        setStops(result.slice(0, 6));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [lat, lon]);

  if (loading || stops.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">
        Getting Here
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {stops.map((stop, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-base mt-0.5 select-none">{getTypeIcon(stop.type)}</span>
            <div>
              <p className="text-sm font-medium leading-tight">{stop.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getTypeLabel(stop.type)} · {formatDistance(stop.distanceM)} walk
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
