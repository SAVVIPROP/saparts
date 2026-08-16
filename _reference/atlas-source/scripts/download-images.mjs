/**
 * Download images for London properties that have raw_images but no CDN images.
 * Uses curl for fast parallel downloads, then manus-upload-file --webdev for CDN upload.
 */
import * as fs from 'fs';
import * as path from 'path';
import { createConnection } from 'mysql2/promise';
import { execSync, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const DB_URL = process.env.DATABASE_URL;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const conn = await createConnection(DB_URL);

  // Get all London properties that have no heroImageUrl but have raw_images in scraped_properties
  const [props] = await conn.execute(`
    SELECT p.id, p.name, p.bookingUrl, sp.raw_images, sp.images as cdn_images
    FROM properties p
    JOIN scraped_properties sp ON sp.booking_com_url = p.bookingUrl
    WHERE p.cityId = 90019
      AND (p.heroImageUrl IS NULL OR p.heroImageUrl = '' OR p.heroImageUrl IS NULL)
      AND sp.raw_images IS NOT NULL
      AND JSON_LENGTH(sp.raw_images) > 0
    ORDER BY p.id
  `);

  console.log(`Found ${props.length} London properties needing images`);

  const tmpBase = '/tmp/saparts-imgs';
  fs.mkdirSync(tmpBase, { recursive: true });

  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    const rawImgs = Array.isArray(prop.raw_images) ? prop.raw_images : JSON.parse(prop.raw_images || '[]');
    if (!rawImgs.length) { console.log(`[${i+1}] ${prop.name}: no raw images`); continue; }

    console.log(`\n[${i+1}/${props.length}] ${prop.name} — ${rawImgs.length} raw images`);

    const propDir = path.join(tmpBase, `prop-${prop.id}`);
    fs.mkdirSync(propDir, { recursive: true });

    const cdnUrls = [];
    const toDownload = rawImgs.slice(0, 8);

    // Download all images in parallel using curl
    const downloads = toDownload.map((url, j) => {
      const ext = url.includes('.jpg') ? 'jpg' : 'webp';
      const file = path.join(propDir, `img-${j+1}.${ext}`);
      return execAsync(
        `curl -s -L --max-time 20 -H "Referer: https://www.booking.com/" -H "User-Agent: Mozilla/5.0" -o "${file}" "${url}" && echo "OK:${file}" || echo "FAIL:${file}"`,
        { timeout: 25000 }
      ).then(r => r.stdout.trim()).catch(() => `FAIL:${file}`);
    });

    const results = await Promise.all(downloads);
    const downloaded = results.filter(r => r.startsWith('OK:')).map(r => r.slice(3));
    console.log(`  Downloaded: ${downloaded.length}/${toDownload.length}`);

    // Upload each downloaded image to CDN
    for (const file of downloaded) {
      if (!fs.existsSync(file) || fs.statSync(file).size < 1000) { process.stdout.write('s'); continue; }
      try {
        const out = execSync(`manus-upload-file --webdev "${file}"`, { encoding: 'utf8', timeout: 60000 }).trim();
        // Output format: "Storage Path: /manus-storage/filename.webp"
        const storagePath = out.match(/Storage Path:\s*(\/manus-storage\/[^\s]+)/)?.[1];
        if (storagePath) {
          const cdnUrl = `https://sapartsdir-7tjeqx4c.manus.space${storagePath}`;
          cdnUrls.push(cdnUrl);
          process.stdout.write('.');
        } else {
          process.stdout.write('?');
        }
      } catch { process.stdout.write('!'); }
    }
    console.log(`\n  CDN uploaded: ${cdnUrls.length}`);

    if (cdnUrls.length > 0) {
      // Update heroImageUrl on property
      await conn.execute('UPDATE properties SET heroImageUrl = ? WHERE id = ?', [cdnUrls[0], prop.id]);
      // Insert propertyImages
      for (let j = 0; j < cdnUrls.length; j++) {
        await conn.execute(
          'INSERT IGNORE INTO propertyImages (propertyId, url, sortOrder) VALUES (?,?,?)',
          [prop.id, cdnUrls[j], j]
        );
      }
      // Update scraped_properties CDN cache
      await conn.execute(
        'UPDATE scraped_properties SET images = ?, scrape_status = "images_downloaded" WHERE booking_com_url = ?',
        [JSON.stringify(cdnUrls), prop.bookingUrl]
      );
      console.log(`  ✅ ${cdnUrls.length} images saved for property ${prop.id}`);
    }

    // Clean up
    try { fs.rmSync(propDir, { recursive: true, force: true }); } catch {}
    await sleep(200);
  }

  await conn.end();
  console.log('\n✅ Image download pass complete');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
