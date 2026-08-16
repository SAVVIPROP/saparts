"use client";

import Link from "next/link";
import { useBookmarks } from "@/hooks/useBookmarks";
import { SafeImage } from "@/components/SafeImage";
import { Share2, Trash2 } from "@/components/icons";
import { formatUSD } from "@/lib/format";

export function ShortlistsClient() {
  const { bookmarks, ready, remove, clear, getShareUrl } = useBookmarks();

  if (!ready) {
    return <div className="paper p-8 tracker-muted">Opening the reading list…</div>;
  }

  if (bookmarks.length === 0) {
    return (
      <div className="paper p-8 sm:p-12">
        <h2 className="display text-3xl">The reading list is empty.</h2>
        <p className="mt-4 text-muted-foreground max-w-xl leading-relaxed">
          Bookmark a residence from a card or a dossier. Shortlists live in this browser — there is no login.
        </p>
        <Link href="/search" className="btn-primary mt-6">Browse the directory</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="tracker-muted">{bookmarks.length} residences</div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              const url = getShareUrl();
              if (url) navigator.clipboard.writeText(url).catch(() => {});
            }}
          >
            <Share2 className="w-3.5 h-3.5" /> Copy share link
          </button>
          <button type="button" className="btn-ghost" onClick={clear}>
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {bookmarks.map((b) => (
          <div key={b.id} className="paper p-4 sm:p-5 grid grid-cols-12 gap-4 items-center">
            <Link href={`/properties/${b.slug}`} className="col-span-3 sm:col-span-2 aspect-[4/3] overflow-hidden bg-ivory-warm border border-border">
              {b.heroImageUrl ? (
                <SafeImage src={b.heroImageUrl} alt={b.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-ivory-warm" />
              )}
            </Link>
            <div className="col-span-7 sm:col-span-8 min-w-0">
              <div className="tracker-muted">{b.cityName ?? "—"}{b.category ? ` · ${b.category}` : ""}</div>
              <Link href={`/properties/${b.slug}`} className="font-serif text-xl hover:text-forest block truncate">{b.name}</Link>
              <div className="tracker-muted mt-1">
                {b.priceFromMonthlyUsd ? `From ${formatUSD(b.priceFromMonthlyUsd)} / month` : "On request"}
              </div>
            </div>
            <div className="col-span-2 text-right">
              <button type="button" className="btn-ghost" onClick={() => remove(b.id)} aria-label={`Remove ${b.name}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
