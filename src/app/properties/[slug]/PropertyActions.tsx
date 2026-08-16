"use client";

import { Share2 } from "@/components/icons";

export function PropertyActions({ name }: { name: string }) {
  return (
    <button
      type="button"
      className="btn-outline w-full justify-center text-sm"
      onClick={() => {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
      }}
    >
      <Share2 className="w-3.5 h-3.5" /> Share {name}
    </button>
  );
}
