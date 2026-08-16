import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ContactForm } from "@/components/ContactForm";
import { getLaunchCities } from "@/lib/data";

export const metadata: Metadata = {
  title: "Corporate mobility",
  description: "SAparts for global mobility and corporate housing teams.",
};

export default function CorporatePage() {
  const cities = getLaunchCities();

  return (
    <div>
      <Breadcrumb items={[{ label: "Corporate" }]} />
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-24 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <span className="eyebrow text-forest">For enterprise</span>
            <h1 className="display text-[2.8rem] sm:text-[4.5rem] mt-5">
              Global mobility,
              <br />
              <em>quietly handled.</em>
            </h1>
            <p className="mt-6 font-serif text-[1.15rem] text-muted-foreground max-w-2xl leading-relaxed">
              SAparts is an independent index of serviced apartments for corporate mobility. Launch coverage opens in{" "}
              {cities.length} cities. Listings are published only after factual review.
            </p>
          </div>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-0 grid md:grid-cols-3">
          {[
            ["Policy-safe sourcing", "Every residence is reviewed against licensing, safety, and serviced-apartment credentials before it enters the register."],
            ["Procurement-ready data", "Unit mix, amenities, official links, and — when supplied — source rates. Comparable, exportable, never invented."],
            ["One editorial standard", "The same dossier structure in every launch city. No marketplace ranking, no opaque commission."],
          ].map(([title, body], i) => (
            <div key={title} className={`p-8 md:p-10 ${i < 2 ? "md:border-r border-border" : ""}`}>
              <div className="section-mark">{String(i + 1).padStart(2, "0")}</div>
              <h2 className="display text-2xl mt-4">{title}</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <div className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <span className="section-mark">Briefing</span>
            <h2 className="display text-[2rem] mt-4">Request a conversation.</h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              For mobility leads and procurement. We do not sell a booking engine.
            </p>
          </div>
          <div className="lg:col-span-8">
            <ContactForm
              source="corporate"
              subjects={[
                { value: "briefing", label: "Request a briefing" },
                { value: "pilot", label: "Discuss a city pilot" },
                { value: "data", label: "Data / export enquiry" },
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
