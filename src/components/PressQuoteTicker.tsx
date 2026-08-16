"use client";

import { useEffect, useState } from "react";

const PRESS_QUOTES = [
  { text: "“Blending urban stays with home comforts has — in the past few years — seen the arrival of a stylish set of aparthotels.”", source: "Forbes, February 2025" },
  { text: "“Serviced apartments are increasingly the go-to for travellers seeking the comforts of home with the perks of a hotel.”", source: "Condé Nast Traveler" },
  { text: "“Serviced apartments have become a game-changer for modern travellers — offering the space, flexibility, and cost savings that hotels simply cannot match.”", source: "Financial Times" },
];

export function PressQuoteTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % PRESS_QUOTES.length);
        setVisible(true);
      }, 300);
    }, 4500);
    return () => clearInterval(interval);
  }, []);
  const q = PRESS_QUOTES[idx];
  return (
    <div className="sm:hidden text-center px-2 pb-2" style={{ minHeight: "5rem" }}>
      <div style={{ transition: "opacity 0.3s ease", opacity: visible ? 1 : 0 }}>
        <div className="font-serif text-[1rem] leading-relaxed text-charcoal">{q.text}</div>
        <div className="tracker-muted text-[0.78rem] mt-2">— {q.source}</div>
      </div>
    </div>
  );
}
