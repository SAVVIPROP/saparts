import crypto from "node:crypto";
import fs from "node:fs/promises";
import sharp from "sharp";
import { and, eq, sql } from "drizzle-orm";
import { getDb, resetDbConnection } from "../server/db";
import { storagePut } from "../server/storage";
import { cities, properties, propertyImages } from "../drizzle/schema";

const SOURCE_QUEUE = process.env.SOURCE_QUEUE || "/home/ubuntu/official-source-review-queue.json";
const PROGRESS_PATH = process.env.IMAGE_PROGRESS || "/home/ubuntu/official-draft-image-progress.json";
const LIMIT = Math.max(0, Number(process.env.LIMIT || 0));
const MAX_IMAGES = 10;
const MIN_WIDTH = 800;
const MAX_BYTES = 16 * 1024 * 1024;

type Candidate = { city: string; name: string; sourceUrl: string; imageCandidates: string[] };
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 140) || "listing";
const publicMediaUrl = (storageUrl: string) => storageUrl.replace(/^\/manus-storage\//, "/media/");

async function downloadImage(url: string, referer: string) {
  const response = await fetch(url, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (compatible; SAparts Source Review/1.0)", referer, accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const size = Number(response.headers.get("content-length") || 0);
  if (size > MAX_BYTES) throw new Error("source image exceeds size cap");
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length || buffer.length > MAX_BYTES) throw new Error("empty or oversized image");
  const metadata = await sharp(buffer, { animated: false }).metadata();
  if (!metadata.width || !metadata.height || metadata.width < MIN_WIDTH || metadata.height < 450) throw new Error("below minimum dimensions");
  const aspect = metadata.width / metadata.height;
  if (aspect < 0.55 || aspect > 2.6) throw new Error("extreme aspect ratio");
  const normalized = await sharp(buffer, { animated: false }).rotate().jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  return { normalized, width: metadata.width, height: metadata.height };
}

async function main() {
  const queue = JSON.parse(await fs.readFile(SOURCE_QUEUE, "utf8")).reviewReady as Candidate[];
  const progress = await fs.readFile(PROGRESS_PATH, "utf8").then(JSON.parse).catch(() => ({ complete: {}, outcomes: [] }));
  let db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const work = queue.filter((item) => !progress.complete[`${item.city}/${item.name}`]);
  const selected = LIMIT ? work.slice(0, LIMIT) : work;
  const summary = { processed: 0, mirrored: 0, held: 0, skipped: 0, errors: 0 };
  for (const candidate of selected) {
    const key = `${candidate.city}/${candidate.name}`;
    const city = (await db.select().from(cities).where(sql`LOWER(${cities.name}) = LOWER(${candidate.city})`).limit(1))[0];
    const property = city ? (await db.select().from(properties).where(and(eq(properties.cityId, city.id), sql`LOWER(${properties.name}) = LOWER(${candidate.name})`)).limit(1))[0] : undefined;
    if (!property) { progress.complete[key] = "property_missing"; summary.skipped++; continue; }
    const existing = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, property.id));
    if (existing.length >= 9 && property.heroImageUrl) { progress.complete[key] = "already_has_gallery"; summary.skipped++; continue; }
    const usable: Array<{ url: string; hash: string }> = [];
    const hashes = new Set<string>();
    for (const sourceUrl of candidate.imageCandidates) {
      if (usable.length >= MAX_IMAGES) break;
      try {
        const { normalized } = await downloadImage(sourceUrl, candidate.sourceUrl);
        const hash = crypto.createHash("sha256").update(normalized).digest("hex");
        if (hashes.has(hash)) continue;
        hashes.add(hash);
        const imageName = `${slugify(candidate.name)}-official-${String(usable.length + 1).padStart(2, "0")}.jpg`;
        const { url } = await storagePut(`saparts/drafts/${property.id}/${imageName}`, normalized, "image/jpeg");
        usable.push({ url: publicMediaUrl(url), hash });
      } catch { /* Candidate is held; try the next directly referenced image. */ }
    }
    summary.processed++;
    if (usable.length < MAX_IMAGES) {
      progress.complete[key] = { status: "held_insufficient_qualifying_images", qualifying: usable.length };
      summary.held++;
    } else {
      const persist = async () => {
        if (!db) throw new Error("Database unavailable");
        await db.transaction(async (tx) => {
          await tx.delete(propertyImages).where(eq(propertyImages.propertyId, property.id));
          for (let index = 1; index < usable.length; index++) {
            await tx.insert(propertyImages).values({ propertyId: property.id, url: usable[index].url, alt: `${candidate.name} official property image`, caption: "Official-source image", sortOrder: index - 1 });
          }
          await tx.update(properties).set({ heroImageUrl: usable[0].url, published: false }).where(eq(properties.id, property.id));
        });
      };
      try {
        await persist();
      } catch (error: any) {
        if (error?.cause?.code !== "PROTOCOL_CONNECTION_LOST") throw error;
        resetDbConnection();
        db = await getDb();
        await persist();
      }
      progress.complete[key] = { status: "mirrored_ten_images", images: usable.length };
      summary.mirrored++;
    }
    progress.outcomes.push({ city: candidate.city, name: candidate.name, ...progress.complete[key] });
    await fs.writeFile(PROGRESS_PATH, JSON.stringify(progress, null, 2));
    console.log(`[${candidate.city}] ${candidate.name}: ${JSON.stringify(progress.complete[key])}`);
  }
  console.log(JSON.stringify(summary));
  process.exit(0);
}

main().catch((error) => { console.error(error); process.exit(1); });
