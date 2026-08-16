import { galleryUrls } from "@/lib/media";
import type { Listing } from "@/lib/types";

export function PropertyGallery({ listing }: { listing: Listing }) {
  const images = galleryUrls(listing);
  if (images.length === 0) {
    return (
      <div className="paper aspect-[16/8] flex items-center justify-center tracker-muted">
        Gallery awaits imported photography
      </div>
    );
  }
  const [hero, ...rest] = images;
  return (
    <div className="grid gap-2 md:grid-cols-12">
      <figure className="md:col-span-8 bg-ivory-warm overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hero} alt={`${listing.name} hero`} className="w-full h-full object-cover aspect-[16/10] md:aspect-auto md:min-h-[420px]" />
      </figure>
      <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-2">
        {rest.slice(0, 3).map((src) => (
          <figure key={src} className="bg-ivory-warm overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="w-full h-full object-cover aspect-[16/10] min-h-[100px]" />
          </figure>
        ))}
      </div>
    </div>
  );
}
