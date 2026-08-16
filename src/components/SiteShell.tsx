import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { AIConciergeWidget } from "./AIConciergeWidget";
import { getCities, directoryStats } from "@/lib/data";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const cities = getCities();
  const stats = directoryStats();
  const citiesByRegion: Record<string, { name: string; slug: string; launch?: boolean }[]> = {};
  for (const c of cities) {
    const region = c.region === "Oceania" ? "Asia-Pacific" : c.region;
    if (!citiesByRegion[region]) citiesByRegion[region] = [];
    citiesByRegion[region].push({ name: c.name, slug: c.slug, launch: c.launch });
  }
  const navStats = { cities: cities.length, properties: stats.properties };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Nav citiesByRegion={citiesByRegion} stats={navStats} />
      <main className="flex-1">{children}</main>
      <Footer stats={navStats} />
      <AIConciergeWidget />
    </div>
  );
}
