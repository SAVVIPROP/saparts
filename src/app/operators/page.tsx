import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ContactForm } from "@/components/ContactForm";
import { directoryStats } from "@/lib/data";

export const metadata: Metadata = {
  title: "For Operators",
  description: "Claim or submit a serviced apartment listing on the SAparts Atlas.",
};

export default function OperatorsPage() {
  const stats = directoryStats();

  return (
    <div>
      <Breadcrumb items={[{ label: "For Operators" }]} />
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-24 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <span className="section-mark">For operators</span>
            <h1 className="display text-[2.8rem] sm:text-[4.5rem] mt-5">
              Your properties
              <br />
              belong in the
              <br />
              <em>register.</em>
            </h1>
            <p className="mt-6 font-serif text-[1.1rem] text-muted-foreground max-w-xl leading-relaxed">
              SAparts is an independent, source-backed directory. Listings enter the atlas from reviewed packs — not
              from invented inventory. Claim a published residence or submit an official source for editorial review.
            </p>
          </div>
          <div className="lg:col-span-5 space-y-3">
            {[
              ["Launch cities open", String(stats.launchCities)],
              ["Residences currently filed", String(stats.properties)],
              ["Editorial standard", "Source-backed"],
              ["Commercial relationships", "Disclosed"],
            ].map(([label, value]) => (
              <div key={label} className="paper p-4 flex justify-between">
                <span className="tracker-muted">{label}</span>
                <span className="font-serif">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="hairline-bottom bg-ivory-warm">
        <div className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <span className="section-mark">§ 01</span>
            <h2 className="display text-[2rem] mt-4">What a claimed listing is.</h2>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
            {[
              ["Direct enquiries", "Travellers and mobility teams reach you from the dossier, not through an opaque marketplace."],
              ["Source of record", "Official site, booking link, photography, and tour URLs stay under your control."],
              ["No invented rates", "Monthly figures appear only when you supply them. We will not estimate a price."],
              ["Editorial independence", "Paid claims are disclosed. Rankings are not sold."],
            ].map(([title, body]) => (
              <div key={title} className="paper p-5">
                <div className="tracker mb-2">{title}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="claim">
        <div className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <span className="section-mark">§ 02</span>
            <h2 className="display text-[2rem] mt-4">Write to the desk.</h2>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
              Include the official website and city. We reply within two business days.
            </p>
          </div>
          <div className="lg:col-span-8">
            <ContactForm
              source="operators"
              subjects={[
                { value: "claim", label: "Claim an existing listing" },
                { value: "submit", label: "Submit a new residence" },
                { value: "correction", label: "Request a correction" },
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
