import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { NewsletterForm } from "./NewsletterForm";

export function Footer({ stats }: { stats: { cities: number; properties: number } }) {
  return (
    <footer className="mt-32 text-ivory" style={{ background: "var(--charcoal)" }}>
      <div className="border-b border-white/10">
        <div className="container flex items-center justify-between h-8 tracker text-ivory/70 gap-3 overflow-hidden">
          <span className="flex items-center gap-2 sm:gap-3 min-w-0 truncate">
            <span className="dot shrink-0" style={{ background: "var(--brass)" }} />
            <span className="truncate">
              The World&apos;s Leading Independent Serviced Apartment Directory · {stats.cities} cities · {stats.properties.toLocaleString()} properties
            </span>
          </span>
          <span className="hidden md:inline shrink-0">Updated {new Date().toISOString().slice(0, 10)}</span>
        </div>
      </div>
      <div className="container py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Wordmark variant="light" suffix={false} size="md" />
            <div className="tracker mt-4 text-ivory/60">The World&apos;s Leading Serviced Apartment Directory · MMXXVI</div>
            <p className="mt-6 text-[0.95rem] text-ivory/70 leading-relaxed max-w-md">
              SAparts is the world&apos;s leading independent directory supporting the best in class serviced apartments and aparthotels. Every commercial relationship is disclosed. If a claim cannot be traced to a verifiable source, it does not appear in the directory.
            </p>
            <div className="mt-8">
              <div className="tracker text-ivory/70">The SAparts Review · Monthly</div>
              <div className="mt-3">
                <NewsletterForm variant="dark" source="footer" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <SitemapCol title="Discover" links={[["/cities", "All cities"], ["/search", "All properties"], ["/collections", "Collections"], ["/awards", "Awards"], ["/resources", "Resources"]]} />
            <SitemapCol title="Collections" links={[["/collections/executives", "Best for Executives"], ["/collections/families", "Best for Families"], ["/collections/luxury", "Luxury Residences"], ["/collections/remote-work", "Remote Work Ready"], ["/collections/long-stay", "Extended Stay"]]} />
            <SitemapCol title="Awards" links={[["/awards", "Top 50 Serviced Apts"], ["/awards", "Top 30 Luxury"], ["/awards", "Top 30 Business"], ["/awards", "Top 50 Family"], ["/awards#nominate", "Nominate a property"]]} />
            <SitemapCol title="Company" links={[["/about", "About SAparts"], ["/operators", "For operators"], ["/corporate", "For mobility teams"], ["/contact", "Contact us"], ["/collaboration", "Collaborate"], ["/insights", "Journal"]]} />
          </div>
        </div>
        <div className="mt-14 pt-8 border-t border-white/10">
          <div className="tracker text-ivory/60 mb-4">References cited on this site</div>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-3" style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "rgba(244,239,223,0.7)" }}>
            <div>1. GSAIR 2025 — Global Serviced Apartment Industry Report. Ariosi / Travel Intelligence Network.{" "}
              <a className="text-brass hover:underline" href="https://ariosi.com/gsair/" target="_blank" rel="noopener noreferrer">ariosi.com/gsair</a>
            </div>
            <div>2. Serviced Apartment Market Size Report. Precedence Research.{" "}
              <a className="text-brass hover:underline" href="https://www.precedenceresearch.com/serviced-apartment-market" target="_blank" rel="noopener noreferrer">precedenceresearch.com</a>
            </div>
            <div>3. Corporate Housing Statistics. CHPA.{" "}
              <a className="text-brass hover:underline" href="https://www.chpaonline.org/" target="_blank" rel="noopener noreferrer">chpaonline.org</a>
            </div>
            <div>4. Non-hotel accommodation saves on corporate travel. Apartool / AEGVE.{" "}
              <a className="text-brass hover:underline" href="https://www.apartool.com/en/blog/companies-are-betting-on-non-hotel-accommodation-to-save-on-travel" target="_blank" rel="noopener noreferrer">apartool.com</a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="tracker-muted text-ivory/50">Set in Inter, Instrument Serif and IBM Plex Mono. Built on verified inventory.</div>
          <div className="tracker text-ivory/60 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-brass">Privacy</Link>
            <Link href="/terms" className="hover:text-brass">Terms</Link>
            <Link href="/about" className="hover:text-brass">About</Link>
            <Link href="/awards" className="hover:text-brass">Awards</Link>
          </div>
        </div>
        <div className="mt-6 tracker-muted text-ivory/40">
          © {new Date().getFullYear()} SAparts. The world&apos;s leading independent serviced apartment directory. Editorial curation independent of commercial arrangements.
        </div>
      </div>
    </footer>
  );
}

function SitemapCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="tracker text-ivory/80 mb-4">{title}</div>
      <ul className="space-y-2.5">
        {links.map(([href, label]) => (
          <li key={href + label}>
            <Link href={href} className="text-[0.92rem] text-ivory/75 hover:text-brass">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
