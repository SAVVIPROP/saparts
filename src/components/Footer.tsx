import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { getLaunchCities } from "@/lib/data";

function Col({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="tracker text-ivory/70 mb-4">{title}</div>
      <ul className="space-y-2">
        {links.map(([href, label]) => (
          <li key={href + label}>
            <Link href={href} className="text-[0.9rem] text-ivory/75 hover:text-brass">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const cities = getLaunchCities();

  return (
    <footer className="mt-24 text-ivory" style={{ background: "var(--charcoal)" }}>
      <div className="border-b border-white/10">
        <div className="container flex items-center justify-between h-8 tracker text-ivory/70">
          <span>The World&apos;s Leading Independent Serviced Apartment Directory</span>
          <span className="hidden md:inline">Launch cities · {cities.length}</span>
        </div>
      </div>
      <div className="container py-14 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Wordmark variant="light" suffix={false} />
            <div className="tracker mt-4 text-ivory/60">The World&apos;s Leading Serviced Apartment Directory · MMXXVI</div>
            <p className="mt-6 text-[0.95rem] text-ivory/70 leading-relaxed max-w-md">
              SAparts is the world&apos;s leading independent directory supporting the best in class serviced apartments
              and aparthotels. Every commercial relationship is disclosed. If a claim cannot be traced to a verifiable
              source, it does not appear in the directory.
            </p>
          </div>
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <Col
              title="Discover"
              links={[
                ["/cities", "All cities"],
                ["/search", "Directory"],
                ["/collections", "Collections"],
                ["/awards", "Awards"],
                ["/resources", "Resources"],
              ]}
            />
            <Col
              title="Launch cities"
              links={cities.slice(0, 7).map((c) => [`/cities/${c.slug}`, c.name] as [string, string])}
            />
            <Col
              title="Company"
              links={[
                ["/about", "About SAparts"],
                ["/operators", "For operators"],
                ["/corporate", "For mobility teams"],
                ["/contact", "Contact"],
                ["/insights", "Journal"],
              ]}
            />
            <Col
              title="Legal"
              links={[
                ["/privacy", "Privacy"],
                ["/terms", "Terms"],
                ["/admin", "Administration"],
              ]}
            />
          </div>
        </div>
        <div className="mt-14 pt-8 border-t border-white/10">
          <div className="tracker text-ivory/60 mb-4">References cited on this site</div>
          <div
            className="grid md:grid-cols-2 gap-x-10 gap-y-3 text-ivory/70"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}
          >
            <div>
              1. GSAIR — Global Serviced Apartment Industry Report. Ariosi / Travel Intelligence Network.{" "}
              <a className="text-brass hover:underline" href="https://ariosi.com/gsair/" target="_blank" rel="noreferrer">
                ariosi.com/gsair
              </a>
            </div>
            <div>
              2. Serviced Apartment Market Size Report. Precedence Research.{" "}
              <a
                className="text-brass hover:underline"
                href="https://www.precedenceresearch.com/serviced-apartment-market"
                target="_blank"
                rel="noreferrer"
              >
                precedenceresearch.com
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4">
          <div className="tracker-muted text-ivory/50">
            Set in Inter, Instrument Serif and IBM Plex Mono. Built on verified inventory.
          </div>
          <div className="tracker text-ivory/60 flex gap-5">
            <Link href="/privacy" className="hover:text-brass">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-brass">
              Terms
            </Link>
            <Link href="/about" className="hover:text-brass">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
