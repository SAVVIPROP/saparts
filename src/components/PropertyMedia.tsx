import { isMatterportUrl, matterportEmbedSrc, parseVideoEmbeds } from "@/lib/media";
import type { Listing } from "@/lib/types";

export function PropertyMedia({ listing }: { listing: Listing }) {
  const matterport = isMatterportUrl(listing.virtualTourUrl) ? listing.virtualTourUrl! : null;
  const videos = parseVideoEmbeds(listing.videoUrls);

  if (!matterport && videos.length === 0) return null;

  return (
    <section className="hairline-bottom">
      <div className="container py-12 lg:py-16 space-y-10">
        {matterport && (
          <div>
            <div className="section-mark mb-4">Virtual tour</div>
            <div className="paper overflow-hidden aspect-video">
              <iframe
                src={matterportEmbedSrc(matterport)}
                title={`${listing.name} Matterport tour`}
                className="w-full h-full"
                allow="xr-spatial-tracking; gyroscope; accelerometer"
                allowFullScreen
              />
            </div>
          </div>
        )}
        {videos.length > 0 && (
          <div className="space-y-6">
            <div className="section-mark">Moving image</div>
            <div className="grid md:grid-cols-2 gap-6">
              {videos.map((video) => (
                <div key={video.url} className="paper overflow-hidden aspect-video bg-charcoal">
                  {video.kind === "file" ? (
                    <video src={video.src} controls className="w-full h-full" preload="metadata" />
                  ) : (
                    <iframe
                      src={video.src}
                      title={`${listing.name} video`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
