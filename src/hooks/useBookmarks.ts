"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "saparts_bookmarks";

import { encodeShareToken } from "@/lib/share";
export { encodeShareToken, decodeShareToken } from "@/lib/share";

export type BookmarkedProperty = {
  id: string;
  slug: string;
  name: string;
  cityName?: string;
  category?: string;
  heroImageUrl?: string | null;
  ratingScore?: number | null;
  priceFromMonthlyUsd?: number | null;
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

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedProperty[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setBookmarks(readStorage());
    setReady(true);
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setBookmarks(readStorage());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const isBookmarked = useCallback((id: string) => bookmarks.some((b) => b.id === id), [bookmarks]);

  const toggle = useCallback((property: BookmarkedProperty) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === property.id);
      const next = exists ? prev.filter((b) => b.id !== property.id) : [...prev, property];
      writeStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
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

  const getShareUrl = useCallback(() => {
    if (bookmarks.length === 0) return null;
    const token = encodeShareToken(bookmarks.map((b) => b.slug));
    return `${window.location.origin}/s/${token}`;
  }, [bookmarks]);

  return {
    bookmarks,
    count: bookmarks.length,
    ready,
    isBookmarked,
    toggle,
    remove,
    clear,
    getShareUrl,
  };
}
