export function PropertyMap({
  lat,
  lon,
  name,
}: {
  lat: number;
  lon: number;
  name: string;
}) {
  const src = `/map-embed.html?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}&name=${encodeURIComponent(name)}`;
  return (
    <div className="border border-border overflow-hidden h-[360px] bg-ivory-warm">
      <iframe title={`Map of ${name}`} src={src} className="w-full h-full border-0" loading="lazy" />
    </div>
  );
}
