import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { cityRegisterBrief, summarizeCityPack } from "./city-brief.ts";
import type { Listing } from "./types.ts";

test("New York brief is written from the listing pack only", () => {
  const rows = JSON.parse(readFileSync(join(process.cwd(), "data/properties/new-york.json"), "utf8")) as Listing[];
  const published = rows.filter((p) => p?.slug && p.published !== false);
  const s = summarizeCityPack(published);
  assert.equal(s.residences, 214);
  assert.ok(s.districts.length > 8);
  assert.equal(s.districts.reduce((n, d) => n + d.count, 0), published.filter((p) => p.neighborhood?.trim()).length);
  assert.equal(s.medianUsd, 5880);
  assert.ok(s.pricedUsd > 0 && s.pricedUsd <= 214);

  const brief = cityRegisterBrief("New York", s).join(" ");
  assert.match(brief, /214 residences/);
  assert.match(brief, /\$5,880/);
  assert.doesNotMatch(brief, /Resy|OMNY|Tipping|Brooklyn restaurants|MetroCard/i);
  assert.ok(s.districts.some((d) => d.name === "Chelsea"));
});

test("empty register brief does not invent inventory", () => {
  const brief = cityRegisterBrief("Toronto", summarizeCityPack([])).join(" ");
  assert.match(brief, /empty/);
  assert.match(brief, /will not invent inventory/);
});
