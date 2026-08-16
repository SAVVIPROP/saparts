import type { Metadata } from "next";
import Link from "next/link";
import { AWARDS } from "@/lib/editorial";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Awards",
  description: "SAparts Awards 2026 — recognising excellence in the global serviced apartment sector. No entry fees.",
};

export default function AwardsPage() {
  return (
    <div>
      <section className="hairline-bottom">
        <div className="container py-3 flex items-center gap-2 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <span>Awards</span>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <span className="section-mark">§ 04 · MMXXVI</span>
            <h1 className="display text-[3rem] sm:text-[4.5rem] mt-5">
              Awards, <em>when earned.</em>
            </h1>
            <p className="mt-6 font-serif text-[1.1rem] text-muted-foreground max-w-2xl leading-relaxed">
              Four programmes. No entry fees. Nominations close 31 August 2026. Results are editorial — they are not for sale. Shortlists will be drawn from the register, not invented to fill a table.
            </p>
          </div>
          <div className="lg:col-span-4 paper p-6 space-y-3">
            <div className="flex justify-between"><span className="tracker-muted">Entry fee</span><span>None</span></div>
            <div className="flex justify-between"><span className="tracker-muted">Nominations close</span><span>31 Aug 2026</span></div>
            <div className="flex justify-between"><span className="tracker-muted">Results</span><span>Editorial</span></div>
          </div>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-12 space-y-5">
          {AWARDS.map((a) => (
            <article key={a.slug} className="paper p-6 sm:p-8 grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3">
                <div className="section-mark" style={{ color: a.color }}>{a.rank}</div>
                <h2 className="display text-[1.8rem] mt-4">{a.title}</h2>
                <div className="tracker-muted mt-2">{a.category}</div>
              </div>
              <div className="lg:col-span-9">
                <p className="text-muted-foreground leading-relaxed">{a.subtitle}</p>
                <p className="mt-3 text-sm leading-relaxed">{a.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {a.criteria.map((c) => (
                    <span key={c} className="tracker-muted border border-border px-2 py-1">{c}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="nominate">
        <div className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <span className="section-mark">Nominate</span>
            <h2 className="display text-[2rem] mt-4">Put a residence on the desk.</h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Operators, guests, and mobility teams may nominate. Include the official website and the programme. We reply within two business days.
            </p>
          </div>
          <div className="lg:col-span-8">
            <ContactForm
              source="awards"
              subjects={[
                { value: "top-50", label: "Nominate — Top 50 Serviced Apartments" },
                { value: "luxury", label: "Nominate — Top 30 Luxury" },
                { value: "business", label: "Nominate — Top 30 Business" },
                { value: "family", label: "Nominate — Top 50 Family" },
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
