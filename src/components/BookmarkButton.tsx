"use client";

import { Bookmark } from "./icons";
import { useBookmarks, type BookmarkedProperty } from "@/hooks/useBookmarks";

export function BookmarkButton({
  property,
  size = "md",
  className = "",
}: {
  property: BookmarkedProperty;
  size?: "sm" | "md";
  className?: string;
}) {
  const { isBookmarked, toggle } = useBookmarks();
  const saved = isBookmarked(property.id);
  const px = size === "sm" ? "p-1.5" : "p-2";
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(property);
      }}
      aria-label={saved ? "Remove from reading list" : "Save to reading list"}
      aria-pressed={saved}
      className={`inline-flex items-center justify-center ${px} border border-border bg-ivory/90 hover:bg-ivory text-charcoal rounded-sm transition-colors ${className}`}
      style={{ backdropFilter: "saturate(140%) blur(2px)" }}
    >
      <Bookmark size={iconSize} strokeWidth={1.6} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
