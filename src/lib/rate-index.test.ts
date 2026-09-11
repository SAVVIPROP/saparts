import assert from "node:assert/strict";
import { test } from "node:test";
import { rateIndexHighlights } from "./rate-index.ts";

test("highest and best-value are different cities when two medians are filed", () => {
  const { highest, bestValue } = rateIndexHighlights([
    { slug: "new-york", name: "New York", avgMonthlyRateUsd: 5880 },
    { slug: "washington-dc", name: "Washington, D.C.", avgMonthlyRateUsd: 5250 },
  ]);
  assert.equal(highest?.slug, "new-york");
  assert.equal(highest?.avgMonthlyRateUsd, 5880);
  assert.equal(bestValue?.slug, "washington-dc");
  assert.equal(bestValue?.avgMonthlyRateUsd, 5250);
  assert.notEqual(highest?.slug, bestValue?.slug);
});

test("a single priced city is highest only — never also best value", () => {
  const { highest, bestValue } = rateIndexHighlights([
    { slug: "new-york", name: "New York", avgMonthlyRateUsd: 5480 },
  ]);
  assert.equal(highest?.slug, "new-york");
  assert.equal(bestValue, null);
});
