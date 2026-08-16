import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { useBookmarks, type BookmarkedProperty } from "@/hooks/useBookmarks";

type Props = {
  property: BookmarkedProperty;
  size?: "sm" | "md";
  className?: string;
};

export default function BookmarkButton({ property, size = "md", className = "" }: Props) {
  const { isBookmarked, toggle } = useBookmarks();
  const saved = isBookmarked(property.id);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(property);
    toast.success(saved ? "Removed from reading list" : "Added to reading list", {
      duration: 1800,
    });
  };

  const px = size === "sm" ? "p-1.5" : "p-2";
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? "Remove from reading list" : "Save to reading list"}
      aria-pressed={saved}
      className={`inline-flex items-center justify-center ${px} border border-border bg-ivory/90 hover:bg-ivory text-charcoal rounded-sm transition-colors ${className}`}
      style={{ backdropFilter: "saturate(140%) blur(2px)" }}
    >
      <Bookmark
        size={iconSize}
        strokeWidth={1.6}
        fill={saved ? "currentColor" : "none"}
      />
    </button>
  );
}
