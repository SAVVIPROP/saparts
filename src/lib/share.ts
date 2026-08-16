export function encodeShareToken(slugs: string[]): string {
  const payload = slugs.join(",");
  const encoded =
    typeof Buffer !== "undefined"
      ? Buffer.from(payload, "utf8").toString("base64")
      : btoa(unescape(encodeURIComponent(payload)));
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeShareToken(token: string): string[] {
  try {
    const padded = token.replace(/-/g, "+").replace(/_/g, "/");
    const raw =
      typeof Buffer !== "undefined"
        ? Buffer.from(padded, "base64").toString("utf8")
        : decodeURIComponent(escape(atob(padded)));
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}
