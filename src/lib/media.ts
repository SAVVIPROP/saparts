export function galleryUrls(input: {
  heroImageUrl?: string | null;
  imageUrls?: string[] | null;
}): string[] {
  const urls = [input.heroImageUrl, ...(input.imageUrls ?? [])]
    .filter((u): u is string => Boolean(u && String(u).trim()))
    .map((u) => u.trim());
  return [...new Set(urls)];
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
