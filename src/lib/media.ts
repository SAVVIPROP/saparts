export function isPromoOrGenericUrl(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.includes("homepage-banner") ||
    u.includes("navigation-menu") ||
    u.includes("metatags-social") ||
    u.includes("metatags") ||
    /\/og[-_]?image/i.test(url) ||
    u.includes("ogimage") ||
    u.includes("og-image")
  );
}

export function isBlockedHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "nativeplaces.com" || host.endsWith(".nativeplaces.com");
  } catch {
    return url.toLowerCase().includes("nativeplaces.com");
  }
}

export function isRemoteHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim());
}

export function isLocalListingPhoto(url?: string | null): url is string {
  if (!url || !String(url).trim()) return false;
  const trimmed = url.trim();
  if (isRemoteHttpUrl(trimmed)) return false;
  if (!trimmed.startsWith("/listings/")) return false;
  if (isPromoOrGenericUrl(trimmed)) return false;
  return true;
}

/** Display photos must be self-hosted. Remote operator CDNs are never usable. */
export function isUsablePhotoUrl(url?: string | null): url is string {
  if (!url || !String(url).trim()) return false;
  const trimmed = url.trim();
  if (isRemoteHttpUrl(trimmed)) {
    // Keep promo/blocked-host filters for leftover remotes, but do not use them.
    if (isBlockedHost(trimmed)) return false;
    if (isPromoOrGenericUrl(trimmed)) return false;
    return false;
  }
  return isLocalListingPhoto(trimmed);
}

export type PhotoSource = {
  slug?: string | null;
  heroImageUrl?: string | null;
  imageUrls?: string[] | null;
  imageFiles?: string[] | null;
};

export function galleryUrls(input: PhotoSource): string[] {
  const fromFiles = (input.imageFiles ?? [])
    .filter((u): u is string => Boolean(u && String(u).trim()))
    .map((u) => u.trim())
    .filter(isLocalListingPhoto);
  if (fromFiles.length) return [...new Set(fromFiles)];

  // Do not fall back to heroImageUrl / imageUrls remotes. Local leftovers only.
  const leftovers = [input.heroImageUrl, ...(input.imageUrls ?? [])]
    .filter((u): u is string => Boolean(u && String(u).trim()))
    .map((u) => u.trim())
    .filter(isLocalListingPhoto);
  return [...new Set(leftovers)];
}

export function cardImageUrl(input: PhotoSource): string | null {
  const urls = galleryUrls(input);
  return urls[0] ?? null;
}

export function isMatterportUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "my.matterport.com" || host.endsWith(".matterport.com");
  } catch {
    return url.includes("my.matterport.com");
  }
}

export function matterportEmbedSrc(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.pathname.includes("/show")) return url;
    return url;
  } catch {
    return url;
  }
}

function youtubeWatchId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
      const shorts = parsed.pathname.match(/^\/shorts\/([\w-]{11})/);
      if (shorts) return shorts[1];
      const embed = parsed.pathname.match(/^\/embed\/([\w-]{11})/);
      if (embed) return embed[1];
    }
    return null;
  } catch {
    return null;
  }
}

function isYoutubeChannelHome(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (!host.includes("youtube")) return false;
    const path = parsed.pathname;
    return (
      path.startsWith("/@") ||
      path.startsWith("/channel/") ||
      path.startsWith("/c/") ||
      path.startsWith("/user/") ||
      path === "/" ||
      path === ""
    );
  } catch {
    return false;
  }
}

function vimeoVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;
    if (host === "player.vimeo.com") {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id && /^\d+$/.test(id) ? id : null;
    }
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length === 1 && /^\d+$/.test(parts[0])) return parts[0];
    if (parts[0] === "video" && parts[1] && /^\d+$/.test(parts[1])) return parts[1];
    return null;
  } catch {
    return null;
  }
}

export function isDirectVideoFile(url: string): boolean {
  try {
    const parsed = new URL(url);
    return /\.(mp4|webm|ogg)(\?|#|$)/i.test(parsed.pathname);
  } catch {
    return /\.mp4(\?|#|$)/i.test(url);
  }
}

export type VideoEmbed =
  | { kind: "youtube"; src: string; url: string }
  | { kind: "vimeo"; src: string; url: string }
  | { kind: "file"; src: string; url: string };

export function parseVideoEmbed(url: string): VideoEmbed | null {
  if (!url) return null;
  if (isYoutubeChannelHome(url)) return null;
  const yt = youtubeWatchId(url);
  if (yt) {
    return { kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${yt}`, url };
  }
  const vimeo = vimeoVideoId(url);
  if (vimeo) {
    return { kind: "vimeo", src: `https://player.vimeo.com/video/${vimeo}`, url };
  }
  if (isDirectVideoFile(url)) {
    return { kind: "file", src: url, url };
  }
  return null;
}

export function parseVideoEmbeds(urls?: string[] | null): VideoEmbed[] {
  return (urls ?? []).map(parseVideoEmbed).filter((v): v is VideoEmbed => Boolean(v));
}
