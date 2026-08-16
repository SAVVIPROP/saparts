import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the SAparts editorial team.",
};

const DESKS = [
  { label: "General enquiries", email: "hello@saparts.com" },
  { label: "Editorial & corrections", email: "editorial@saparts.com" },
  { label: "Operator partnerships", email: "partnerships@saparts.com" },
  { label: "Press & media", email: "press@saparts.com" },
];

export default function ContactPage() {
  return (
    <div>
      <Breadcrumb items={[{ label: "Contact" }]} />
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-24 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <span className="section-mark">Contact</span>
            <h1 className="display text-[3rem] sm:text-[5rem] mt-5">
              Get in
              <br />
              <em>touch.</em>
            </h1>
            <p className="mt-6 font-serif text-[1.1rem] text-muted-foreground max-w-lg leading-relaxed">
              Whether you are an operator claiming a listing, a mobility lead, or a journalist covering the industry —
              write to the desk.
            </p>
          </div>
          <div className="lg:col-span-5 space-y-3">
            {DESKS.map((d) => (
              <div key={d.email} className="paper p-4 flex justify-between gap-4">
                <span className="tracker-muted">{d.label}</span>
                <a href={`mailto:${d.email}`} className="text-sm hover:text-forest">
                  {d.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section>
        <div className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <span className="section-mark">§ 01</span>
            <h2 className="display text-[2rem] mt-4">Send a message.</h2>
            <p className="mt-4 text-sm text-muted-foreground">We respond within two business days.</p>
          </div>
          <div className="lg:col-span-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
