import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "saparts_bookmarks";

export type BookmarkedProperty = {
  id: number;
  slug: string;
  name: string;
  cityName?: string;
  category?: string;
  heroImageUrl?: string | null;
  ratingScore?: number | null;
  priceFromMonthlyUsd?: number | null;
  priceToMonthlyUsd?: number | null;
};

function readStorage(): BookmarkedProperty[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BookmarkedProperty[];
  } catch {
    return [];
  }
}

function writeStorage(items: BookmarkedProperty[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage full or unavailable
  }
}

// Broadcast changes across tabs
const CHANNEL_KEY = "saparts_bookmarks_sync";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedProperty[]>(() => readStorage());

  // Sync across tabs via storage event
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setBookmarks(readStorage());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const isBookmarked = useCallback(
    (id: number) => bookmarks.some((b) => b.id === id),
    [bookmarks]
  );

  const toggle = useCallback((property: BookmarkedProperty) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === property.id);
      const next = exists
        ? prev.filter((b) => b.id !== property.id)
        : [...prev, property];
      writeStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: number) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      writeStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setBookmarks([]);
    writeStorage([]);
  }, []);

  /**
   * Generate a shareable URL encoding all bookmarked property slugs.
   * Format: /reading-list?ids=slug1,slug2,slug3
   */
  const getShareUrl = useCallback(() => {
    if (bookmarks.length === 0) return null;
    const slugs = bookmarks.map((b) => b.slug).join(",");
    const base = window.location.origin;
    return `${base}/reading-list?ids=${encodeURIComponent(slugs)}`;
  }, [bookmarks]);

  return {
    bookmarks,
    count: bookmarks.length,
    isBookmarked,
    toggle,
    remove,
    clear,
    getShareUrl,
  };
}
