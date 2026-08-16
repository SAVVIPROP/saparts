"use client";

import { useMemo, useState } from "react";

const MARKET_ESTIMATES: Record<string, { hotelNight: number; aptMonth: number }> = {
  London: { hotelNight: 320, aptMonth: 6200 },
  "New York": { hotelNight: 380, aptMonth: 7200 },
  Paris: { hotelNight: 290, aptMonth: 5400 },
  "Hong Kong": { hotelNight: 260, aptMonth: 4800 },
  Singapore: { hotelNight: 240, aptMonth: 4500 },
  Dubai: { hotelNight: 220, aptMonth: 3800 },
  Tokyo: { hotelNight: 250, aptMonth: 4200 },
};

export function StayCalculator() {
  const cities = Object.keys(MARKET_ESTIMATES);
  const [city, setCity] = useState("London");
  const [nights, setNights] = useState(30);
  const est = MARKET_ESTIMATES[city];
  const result = useMemo(() => {
    const hotel = est.hotelNight * nights;
    const apt = (est.aptMonth / 30) * nights;
    return { hotel, apt, save: hotel - apt, pct: hotel > 0 ? Math.round(((hotel - apt) / hotel) * 100) : 0 };
  }, [est, nights]);

  return (
    <div className="paper p-6 sm:p-8">
      <div className="tracker-muted mb-2">Illustrative only</div>
      <h3 className="display text-2xl">Stay calculator</h3>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        These figures are market estimates for planning, not rates from the SAparts register. The current packs file nine prices; we will not present a calculator as if it were our JSON.
      </p>
      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="field-label">City</span>
          <select className="field" value={city} onChange={(e) => setCity(e.target.value)}>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Nights</span>
          <input
            className="field"
            type="number"
            min={1}
            max={365}
            value={nights}
            onChange={(e) => setNights(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
      </div>
      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <div>
          <div className="stat-label">Hotel estimate</div>
          <div className="stat-value mt-1">${result.hotel.toLocaleString()}</div>
          <div className="tracker-muted mt-1">${est.hotelNight}/night</div>
        </div>
        <div>
          <div className="stat-label">Serviced apt estimate</div>
          <div className="stat-value mt-1">${Math.round(result.apt).toLocaleString()}</div>
          <div className="tracker-muted mt-1">${est.aptMonth.toLocaleString()}/month pro-rata</div>
        </div>
        <div>
          <div className="stat-label">Indicative difference</div>
          <div className="stat-value mt-1">{result.save > 0 ? `$${Math.round(result.save).toLocaleString()}` : "—"}</div>
          <div className="tracker-muted mt-1">{result.pct > 0 ? `${result.pct}% vs hotel` : "Compare on request"}</div>
        </div>
      </div>
    </div>
  );
}
