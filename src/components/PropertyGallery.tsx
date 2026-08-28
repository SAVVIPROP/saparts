import type { Listing } from "@/lib/types";
import { galleryUrls } from "@/lib/media";
import { SafeImage } from "./SafeImage";

export function PropertyGallery({ listing }: { listing: Listing }) {
  const images = galleryUrls(listing);
  if (images.length === 0) {
    return (
      <div className="paper flex items-center justify-center tracker-muted listing-hero">
        No photograph on file
      </div>
    );
  }
  const [hero, ...rest] = images;
  const thumbs = rest.slice(0, 4);
  return (
    <div>
      <div className="flex gap-2 listing-hero">
        <div className="flex-[3] overflow-hidden bg-ivory-warm min-w-0">
          <SafeImage src={hero} alt={listing.name} className="w-full h-full object-cover" loading="eager" />
        </div>
        <div className="hidden md:flex flex-[2] flex-col gap-2 min-w-0">
          <div className="flex gap-2 flex-1">
            {[0, 1].map((i) => (
              <div key={i} className="flex-1 overflow-hidden bg-ivory-warm">
                {thumbs[i] ? (
                  <SafeImage
                    src={thumbs[i]}
                    alt={`${listing.name} — photo ${i + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-ivory-warm" />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-1">
            {[2, 3].map((i) => (
              <div key={i} className="flex-1 overflow-hidden bg-ivory-warm">
                {thumbs[i] ? (
                  <SafeImage
                    src={thumbs[i]}
                    alt={`${listing.name} — photo ${i + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-ivory-warm" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {images.length > 1 && (
        <div className="md:hidden flex gap-2 mt-2 overflow-x-auto no-scrollbar">
          {images.slice(1, 6).map((src, i) => (
            <div key={src} className="shrink-0 w-24 h-14 sm:w-32 sm:h-20 overflow-hidden bg-ivory-warm">
              <SafeImage src={src} alt={`${listing.name} — photo ${i + 2}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
