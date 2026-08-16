export function PropertyMap({
  lat,
  lon,
  name,
}: {
  lat: number;
  lon: number;
  name: string;
}) {
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01}%2C${lat - 0.01}%2C${lon + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lon}`;
  return (
    <div className="border border-border overflow-hidden h-[360px] bg-ivory-warm">
      <iframe title={`Map of ${name}`} src={src} className="w-full h-full border-0" loading="lazy" />
    </div>
  );
}
