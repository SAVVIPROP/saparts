// Discovery: BFS crawl of an operator's index pages, collecting links that
// match op.propertyUrlTest. Uses a real-browser User-Agent.
import * as cheerio from "cheerio";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function fetchHtml(url, { timeoutMs = 20000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent": UA,
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-GB,en;q=0.9",
      },
      redirect: "follow",
      signal: ctrl.signal,
    });
    if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function sameOrigin(u, originOrigin) {
  try { return new URL(u, originOrigin).origin === new URL(originOrigin).origin; } catch { return false; }
}
function abs(u, base) {
  try { return new URL(u, base).toString().split("#")[0].replace(/\/$/, ""); } catch { return null; }
}

export async function discoverOperatorUrls(op, { maxPages = 120, maxUrls = 4000 } = {}) {
  const seen = new Set();
  const queue = [];
  for (const u of op.indexUrls ?? []) queue.push({ url: u, depth: 0 });

  const props = new Set();
  let pagesFetched = 0;
  while (queue.length && pagesFetched < maxPages && props.size < maxUrls) {
    const { url, depth } = queue.shift();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    let html;
    try {
      html = await fetchHtml(url, { timeoutMs: 20000 });
      pagesFetched++;
    } catch {
      continue;
    }
    const $ = cheerio.load(html);
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      const absUrl = abs(href, url);
      if (!absUrl) return;
      if (!sameOrigin(absUrl, op.home)) return;
      if (op.propertyUrlTest.test(absUrl)) {
        props.add(absUrl);
        return;
      }
      // crawl deeper only if we're still allowed to
      if (depth < (op.linkDiscoveryDepth ?? 1) && !seen.has(absUrl)) {
        // Avoid obvious non-helpful paths
        if (/\.(pdf|jpg|jpeg|png|webp|css|js|ico|svg|gif)(\?|$)/i.test(absUrl)) return;
        if (/\/(blog|press|legal|careers|privacy|terms|login|signup)/i.test(absUrl)) return;
        queue.push({ url: absUrl, depth: depth + 1 });
      }
    });
  }
  return Array.from(props);
}
