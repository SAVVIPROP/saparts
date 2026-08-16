import { Link } from "wouter";
import { Wordmark } from "./Wordmark";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function Footer() {
  const subscribe = trpc.newsletter.subscribe.useMutation();
  const [email, setEmail] = useState("");
  const { data: cities = [] } = trpc.cities.list.useQuery();
  const { data: stats } = trpc.stats.global.useQuery();

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Please enter a valid email");
    try {
      await subscribe.mutateAsync({ email, source: "footer" });
      toast.success("You're subscribed to The SAparts Review.");
      setEmail("");
    } catch {
      toast.error("Unable to subscribe right now. Please try again.");
    }
  };

  return (
    <footer className="mt-32 text-ivory" style={{background: 'var(--charcoal)'}}>
      {/* Top tracker strip */}
      <div className="border-b border-white/10">
        <div className="container flex items-center justify-between h-8 tracker text-ivory/70 gap-3 overflow-hidden">
          <span className="flex items-center gap-2 sm:gap-3 min-w-0 truncate">
            <span className="dot shrink-0" style={{ background: "var(--brass)" }} />
            <span className="truncate">The World's Leading Independent Serviced Apartment Directory · {stats?.totalCities || cities.length || 200}+ cities · {(stats?.totalProperties || 10000).toLocaleString()}+ properties</span>
          </span>
          <span className="hidden md:inline shrink-0">Updated {new Date().toISOString().slice(0, 10)}</span>
        </div>
      </div>

      <div className="container py-12 sm:py-16 lg:py-20">
        {/* Identity + newsletter + sitemap */}
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Wordmark variant="light" suffix={false} size="md" />
            <div className="tracker mt-4 text-ivory/60">The World's Leading Serviced Apartment Directory · MMXXVI</div>
            <p className="mt-6 text-[0.95rem] text-ivory/70 leading-relaxed max-w-md">
              SAparts is the world's leading independent directory supporting the best in class serviced apartments and aparthotels. Trusted by business professionals, travellers, and families. Every commercial relationship is disclosed. If a claim cannot be traced to a verifiable source, it does not appear in the directory.
            </p>

            <div className="mt-8">
              <div className="tracker text-ivory/70">The SAparts Review · Monthly</div>
              <form onSubmit={onSubscribe} className="mt-3 flex items-center gap-3 border-b border-white/25 focus-within:border-brass">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@firm.com"
                  className="flex-1 bg-transparent outline-none text-ivory placeholder:text-ivory/40 py-2"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}
                />
                <button
                  type="submit"
                  className="tracker text-ivory hover:text-brass py-2"
                  style={{ letterSpacing: "0.14em" }}
                >
                  Subscribe ↗︎
                </button>
              </form>
              <div className="tracker-muted mt-2 text-ivory/50">
                One issue every other Sunday. No marketing, no sponsored content.
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <SitemapCol
              title="Discover"
              links={[
                ["/cities", "All cities"],
                ["/search", "All properties"],
                ["/collections", "Collections"],
                ["/awards", "Awards"],
                ["/resources", "Resources"],
              ]}
            />
            <SitemapCol
              title="Collections"
              links={[
                ["/collections", "Best for Executives"],
                ["/collections", "Best for Families"],
                ["/collections", "Luxury Residences"],
                ["/collections", "Remote Work Ready"],
                ["/collections", "Extended Stay"],
              ]}
            />
            <SitemapCol
              title="Awards"
              links={[
                ["/awards", "Top 50 Serviced Apts"],
                ["/awards", "Top 30 Luxury"],
                ["/awards", "Top 30 Business"],
                ["/awards", "Top 50 Family"],
                ["/awards#nominate", "Nominate a property"],
              ]}
            />
            <SitemapCol
              title="Company"
              links={[
                ["/about", "About SAparts"],
                ["/operators", "For operators"],
                ["/corporate", "For mobility teams"],
                ["/contact", "Contact us"],
                ["/insights", "Journal"],
              ]}
            />
          </div>
        </div>

        {/* References cited block */}
        <div className="mt-14 pt-8 border-t border-white/10">
          <div className="tracker text-ivory/60 mb-4">References cited on this site</div>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-3" style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "rgba(244,239,223,0.7)" }}>
            <div>
              1. GSAIR 2025 — Global Serviced Apartment Industry Report. Ariosi / Travel Intelligence Network, October 2025.{" "}
              <a className="text-brass hover:underline" href="https://ariosi.com/gsair/" target="_blank" rel="noopener noreferrer">ariosi.com/gsair</a>
            </div>
            <div>
              2. Serviced Apartment Market Size Report. Precedence Research, August 2025.{" "}
              <a className="text-brass hover:underline" href="https://www.precedenceresearch.com/serviced-apartment-market" target="_blank" rel="noopener noreferrer">precedenceresearch.com</a>
            </div>
            <div>
              3. Corporate Housing Statistics. CHPA / chsoilfield.com, January 2026.{" "}
              <a className="text-brass hover:underline" href="https://www.chsoilfield.com/resources/blog/corporate-housing-statistics/" target="_blank" rel="noopener noreferrer">chsoilfield.com</a>
            </div>
            <div>
              4. Non-hotel accommodation saves on corporate travel. Apartool / AEGVE, April 2026.{" "}
              <a className="text-brass hover:underline" href="https://www.apartool.com/en/blog/companies-are-betting-on-non-hotel-accommodation-to-save-on-travel" target="_blank" rel="noopener noreferrer">apartool.com</a>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="tracker-muted text-ivory/50">
            Set in Inter, Instrument Serif and IBM Plex Mono. Built on verified inventory.
          </div>
          <div className="tracker text-ivory/60 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-brass">Privacy</Link>
            <Link href="/terms" className="hover:text-brass">Terms</Link>
            <Link href="/about" className="hover:text-brass">About</Link>
            <Link href="/awards" className="hover:text-brass">Awards</Link>
          </div>
        </div>

        <div className="mt-6 tracker-muted text-ivory/40">
          © {new Date().getFullYear()} SAparts. The world's leading independent serviced apartment directory. Editorial curation independent of commercial arrangements.
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
            {href.startsWith("/") ? (
              <Link
                href={href}
                className="text-[0.92rem] text-ivory/75 hover:text-brass"
              >
                {label}
              </Link>
            ) : (
              <a
                href={href}
                className="text-[0.92rem] text-ivory/75 hover:text-brass"
              >
                {label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
