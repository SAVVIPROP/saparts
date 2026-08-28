import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { officialCopyPlainText, parseOfficialCopy } from "./official-copy.ts";

test("renders official markdown headings and keeps every sentence", () => {
  const source = [
    "Lead sentence stays a paragraph.",
    "",
    "## About the residence",
    "",
    "The Cheval story began in the vibrant streets of Knightsbridge.",
    "",
    "### Luxury One-Bedroom Apartment",
    "",
    "A second official sentence.",
    "",
    "- First filed amenity",
    "- Second filed amenity",
    "",
    "1. First official step",
    "2. Second official step",
  ].join("\n");

  const blocks = parseOfficialCopy(source);
  assert.equal(blocks[0]?.type, "p");
  assert.equal(blocks[0] && "text" in blocks[0] ? blocks[0].text : "", "Lead sentence stays a paragraph.");
  assert.deepEqual(
    blocks.filter((b) => b.type === "h2" || b.type === "h3").map((b) => ("text" in b ? b.text : "")),
    ["About the residence", "Luxury One-Bedroom Apartment"],
  );
  const list = blocks.find((b) => b.type === "ul");
  assert.ok(list && list.type === "ul");
  assert.deepEqual(list.items, ["First filed amenity", "Second filed amenity"]);
  const numbered = blocks.find((b) => b.type === "ol");
  assert.ok(numbered && numbered.type === "ol");
  assert.deepEqual(numbered.items, ["First official step", "Second official step"]);

  const flattened = officialCopyPlainText(blocks);
  assert.match(flattened, /Lead sentence stays a paragraph/);
  assert.match(flattened, /The Cheval story began/);
  assert.match(flattened, /A second official sentence/);
  assert.match(flattened, /First filed amenity/);
  assert.match(flattened, /Second official step/);
});

test("Cheval Knightsbridge official pack keeps every sentence and parses headings", () => {
  const rows = JSON.parse(readFileSync(join(process.cwd(), "data/properties/london.json"), "utf8")) as Array<{
    slug: string;
    description?: string;
  }>;
  const listing = rows.find((p) => p.slug === "cheval-knightsbridge-london");
  assert.ok(listing?.description);
  const raw = listing.description;
  const blocks = parseOfficialCopy(raw);
  const headings = blocks.filter((b) => b.type === "h2" || b.type === "h3").map((b) => ("text" in b ? b.text : ""));
  assert.ok(headings.includes("About the residence"));
  assert.ok(headings.includes("Apartment types"));
  assert.ok(headings.includes("Neighbourhood"));
  assert.ok(!blocks.some((b) => b.type === "p" && b.text.startsWith("## ")));

  const rawWords = raw.replace(/[#*\-•■]/g, " ").replace(/\s+/g, " ").trim();
  const keptWords = officialCopyPlainText(blocks);
  for (const sentence of [
    "The Cheval story began in the vibrant streets of Knightsbridge, to the west of central London.",
    "Soak up London’s vibrant culture whilst living in one of the city’s most exclusive areas.",
  ]) {
    assert.ok(raw.includes(sentence), `source missing ${sentence}`);
    assert.ok(keptWords.includes(sentence.replace(/\s+/g, " ")), `parser dropped ${sentence}`);
  }
  assert.ok(keptWords.length >= rawWords.length * 0.95);
});

test("indented official hashes still become headings", () => {
  const blocks = parseOfficialCopy("  ## About the residence\n\nA kept sentence.\n\n  ### Luxury One-Bedroom Apartment\n");
  assert.deepEqual(
    blocks.filter((b) => b.type === "h2" || b.type === "h3").map((b) => ("text" in b ? `${b.type}:${b.text}` : "")),
    ["h2:About the residence", "h3:Luxury One-Bedroom Apartment"],
  );
  assert.ok(!blocks.some((b) => b.type === "p" && /##/.test(b.text)));
});
