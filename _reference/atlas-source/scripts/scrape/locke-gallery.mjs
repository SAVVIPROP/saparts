/**
 * Locke/Cove/SACO gallery image scraper.
 * Fetches each property page and extracts image URLs from og:image, JSON-LD,
 * and <img> tags in the gallery/slider sections.
 * Inserts up to 8 images per property into propertyImages.
 * Skips properties that already have ≥ 5 images.
 */
import mysql from "mysql2/promise";
import * as cheerio from "cheerio";

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; SAparts-scraper/1.0)",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-GB,en;q=0.9",
};

const DELAY_MS = 1500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchHtml(url) {
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    console.warn(`  fetch error: ${e.message}`);
    return null;
  }
}

function extractImages(html, baseUrl) {
  const $ = cheerio.load(html);
  const seen = new Set();
  const imgs = [];

  const add = (url, caption) => {
    if (!url) return;
    // Normalize: remove query strings that aren't CDN params
    try {
      const u = new URL(url, baseUrl);
      // Only accept images from known CDNs
      if (!u.hostname.includes("cloudinary") && !u.hostname.includes("imgix") &&
          !u.hostname.includes("lockeliving") && !u.hostname.includes("edyn") &&
          !u.hostname.includes("cdn") && !u.hostname.includes("images")) return;
      const key = u.origin + u.pathname;
      if (seen.has(key)) return;
      seen.add(key);
      imgs.push({ url: u.href, caption: caption || null });
    } catch {}
  };

  // og:image
  $('meta[property="og:image"]').each((_, el) => add($(el).attr("content"), ""));

  // JSON-LD images
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || "{}");
      const walk = (obj) => {
        if (!obj || typeof obj !== "object") return;
        if (obj.image) {
          const imgs2 = Array.isArray(obj.image) ? obj.image : [obj.image];
          imgs2.forEach((i) => add(typeof i === "string" ? i : i?.url, ""));
        }
        Object.values(obj).forEach(walk);
      };
      walk(data);
    } catch {}
  });

  // Gallery/slider images
  const gallerySels = [
    ".gallery img", ".slider img", ".swiper-slide img",
    "[class*='gallery'] img", "[class*='slider'] img",
    "[class*='carousel'] img", "[class*='hero'] img",
    "picture source", "picture img",
    ".property-gallery img", ".property-images img",
  ];
  gallerySels.forEach((sel) => {
    $(sel).each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src") ||
                  $(el).attr("data-lazy") || $(el).attr("srcset")?.split(" ")[0] ||
                  $(el).attr("data-srcset")?.split(" ")[0];
      const alt = $(el).attr("alt") || "";
      add(src, alt);
    });
  });

  // All large images (width/height hints or large src)
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src");
    const w = parseInt($(el).attr("width") || "0");
    const h = parseInt($(el).attr("height") || "0");
    if (w >= 400 || h >= 300) {
      add(src, $(el).attr("alt") || "");
    }
  });

  return imgs.slice(0, 10);
}

async function main() {
  const conn = await mysql.createConnection(DB_URL);

  // Get Locke/Cove/SACO properties with < 5 images
  const [props] = await conn.execute(`
    SELECT p.id, p.name, p.officialUrl, COUNT(pi.id) as imgCount
    FROM properties p
    LEFT JOIN propertyImages pi ON pi.propertyId = p.id
    WHERE p.published = 1
      AND (p.brand LIKE '%Locke%' OR p.brand LIKE '%Cove%' OR p.brand LIKE '%SACO%' OR p.brand LIKE '%Edyn%')
      AND p.officialUrl IS NOT NULL
    GROUP BY p.id, p.name, p.officialUrl
    HAVING imgCount < 5
    ORDER BY imgCount ASC
  `);

  console.log(`Found ${props.length} Locke/Cove properties needing more images`);

  let totalAdded = 0;

  for (const prop of props) {
    console.log(`\n[${prop.id}] ${prop.name} (${prop.imgCount} imgs) — ${prop.officialUrl}`);
    await sleep(DELAY_MS);

    const html = await fetchHtml(prop.officialUrl);
    if (!html) {
      console.log("  → skipped (fetch failed)");
      continue;
    }

    const imgs = extractImages(html, prop.officialUrl);
    console.log(`  → found ${imgs.length} candidate images`);

    if (imgs.length === 0) continue;

    // Get existing image URLs to avoid duplicates
    const [existing] = await conn.execute(
      "SELECT url FROM propertyImages WHERE propertyId = ?",
      [prop.id]
    );
    const existingUrls = new Set(existing.map((r) => r.url));

    let added = 0;
    for (const img of imgs) {
      if (existingUrls.has(img.url)) continue;
      if (added + prop.imgCount >= 8) break;
      try {
        await conn.execute(
          "INSERT INTO propertyImages (propertyId, url, caption, sortOrder) VALUES (?, ?, ?, ?)",
          [prop.id, img.url, img.caption, prop.imgCount + added]
        );
        added++;
        existingUrls.add(img.url);
      } catch (e) {
        console.warn(`  insert error: ${e.message}`);
      }
    }
    console.log(`  → inserted ${added} new images`);
    totalAdded += added;
  }

  await conn.end();
  console.log(`\nDone. Total images added: ${totalAdded}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
