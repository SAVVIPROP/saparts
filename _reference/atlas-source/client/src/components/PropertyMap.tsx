interface PropertyMapProps {
  lat: number;
  lon: number;
  name: string;
  address?: string;
}

/**
 * PropertyMap — uses a Google Maps embed (no API key required for basic embeds).
 * Shows the property location with nearby transit, restaurants, and places of interest.
 */
export default function PropertyMap({ lat, lon, name, address }: PropertyMapProps) {
  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    return null;
  }

  // Google Maps embed URL — no API key required for basic place/coordinates embed
  const query = encodeURIComponent(address || name);
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed&hl=en`;

  return (
    <div className="relative rounded-sm overflow-hidden border border-border">
      <iframe
        title={`Map of ${name}`}
        src={embedUrl}
        width="100%"
        height="380"
        style={{ border: 0, display: "block" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
