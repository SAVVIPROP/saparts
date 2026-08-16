import type { Metadata } from "next";
import Link from "next/link";
import { StayCalculator } from "./StayCalculator";
import { getLaunchCities } from "@/lib/data";

export const metadata: Metadata = {
  title: "Resources",
  description: "Guides, stay calculator, and reference for serviced apartment stays and corporate housing.",
};

const GUIDES = [
  {
    id: "comparison",
    category: "Comparison",
    title: "Serviced apartment vs hotel",
    summary: "Space, a kitchen, and a monthly programme versus a nightly hotel bill. The kitchen test is the one that matters after two weeks.",
    body: "Industry surveys continue to show serviced apartments 20–40% more cost-effective than equivalent hotels once a stay exceeds 30 nights. The saving is groceries, laundry, and a table that is not also the desk. Use the calculator below for arithmetic — it is labelled as a market estimate, not a SAparts rate.",
  },
  {
    id: "corporate",
    category: "Corporate",
    title: "A housing brief for mobility teams",
    summary: "How HR and global mobility teams source, compare, and govern serviced apartment programmes.",
    body: "Ask for unit mix, kitchen, workspace, invoice billing, and the official site. The register will show what is on file. If a market is thin, that is the answer — we will not invent inventory for an RFI.",
  },
  {
    id: "checklist",
    category: "Checklist",
    title: "Thirty questions before you book",
    summary: "Lease terms, utilities, internet, laundry, storage, and the questions most travellers forget.",
    body: "Minimum stay, what the monthly rate includes, whether the kitchen is a kitchen, laundry in-unit or downstairs, desk and chair, pet policy, early check-in, and who holds the keys at 22:00. City dossiers carry visa and SIM notes.",
  },
  {
    id: "family",
    category: "Family",
    title: "Choosing a residence for relocation",
    summary: "School proximity, safety, space, and the domestic infrastructure that makes family stays work.",
    body: "Two-bed and larger units, laundry, and a neighbourhood you can walk. Filter the directory by unit type, then open the city living guide for schools-adjacent districts only when the source file names them.",
  },
];

export default function ResourcesPage() {
  const cities = getLaunchCities();

  return (
    <div>
      <section className="hairline-bottom">
        <div className="container py-3 flex items-center gap-2 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <span>Resources</span>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-20">
          <span className="section-mark">§ 05</span>
          <h1 className="display text-[3rem] sm:text-[4.5rem] mt-5">
            Resources for the <em>long stay.</em>
          </h1>
          <p className="mt-6 font-serif text-[1.1rem] text-muted-foreground max-w-2xl leading-relaxed">
            Editorial guides and a stay calculator labelled as market estimates. Figures that cannot be traced to a public source or to our listing packs are omitted from the register itself.
          </p>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-12 grid sm:grid-cols-2 gap-5">
          {GUIDES.map((g) => (
            <article key={g.id} id={g.id} className="paper p-6">
              <div className="tracker-muted">{g.category}</div>
              <h2 className="display text-[1.8rem] mt-3">{g.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{g.summary}</p>
              <p className="mt-3 text-sm leading-relaxed">{g.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="calculator" className="hairline-bottom">
        <div className="container py-12 lg:py-16">
          <StayCalculator />
        </div>
      </section>
      <section id="visa" className="hairline-bottom">
        <div className="container py-12 lg:py-16">
          <div className="tracker-muted mb-3">Visa & entry</div>
          <h2 className="display text-[2rem]">Open the city dossier.</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl leading-relaxed">
            Visa notes live on each launch-city living guide, cited to the destination files (IATA Timatic and the Atlas checklists). We do not reprint a global visa table here.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {cities.map((c) => (
              <Link key={c.slug} href={`/cities/${c.slug}`} className="btn-outline">{c.name}</Link>
            ))}
          </div>
        </div>
      </section>
      <section id="standards">
        <div className="container py-12 lg:py-16">
          <div className="tracker-muted mb-3">Operator standards</div>
          <h2 className="display text-[2rem]">What we file.</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl leading-relaxed">
            A residence enters the register from an official city pack: name, slug, city, neighbourhood, unit types, amenities, official URL, and — when supplied — a price or a photograph. Promo banners and hosts that 403 from our edge are dropped. Ratings appear only when a score is on file.
          </p>
          <div className="mt-8">
            <div className="tracker-muted mb-4">Cited industry references</div>
            <div className="space-y-4">
              {[
                ["GSAIR", "Global Serviced Apartment Industry Report — Ariosi / Travel Intelligence Network", "https://ariosi.com/gsair/"],
                ["Precedence Research", "Serviced Apartment Market Size Report", "https://www.precedenceresearch.com/serviced-apartment-market"],
                ["CHPA", "Corporate Housing Providers Association", "https://www.chpaonline.org/"],
              ].map(([name, full, url]) => (
                <div key={name} className="grid sm:grid-cols-12 gap-3 py-4 hairline-top">
                  <div className="sm:col-span-3 tracker">{name}</div>
                  <div className="sm:col-span-9 text-sm text-muted-foreground">
                    {full}{" "}
                    <a href={url} className="text-forest hover:underline" target="_blank" rel="noreferrer">Source</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
