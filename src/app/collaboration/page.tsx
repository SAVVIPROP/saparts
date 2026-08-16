import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Collaboration",
  description: "Editorial, research, and partnership collaborations with SAparts.",
};

export default function CollaborationPage() {
  return (
    <div>
      <section className="hairline-bottom">
        <div className="container py-3 flex items-center gap-2 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <span>Collaboration</span>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-24">
          <span className="section-mark">Collaborate</span>
          <h1 className="display text-[3rem] sm:text-[5rem] mt-5">
            Work with the <em>desk.</em>
          </h1>
          <p className="mt-6 font-serif text-[1.15rem] text-muted-foreground max-w-2xl leading-relaxed">
            SAparts is an independent register. We collaborate with researchers, journalists, mobility teams, and operators — never by selling a ranking.
          </p>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-0 grid md:grid-cols-3">
          {[
            ["Editorial", "City notes, corrections, and guest essays that meet the same source standard as the register."],
            ["Research", "Anonymised directory statistics for academic or industry work. We do not sell individual enquiry data."],
            ["Partnerships", "Claimed listings, disclosed commercial relationships, and press. Rankings are not for sale."],
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
            <span className="section-mark">Write</span>
            <h2 className="display text-[2rem] mt-4">Propose a collaboration.</h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Or write directly to partnerships@saparts.com / press@saparts.com.
            </p>
          </div>
          <div className="lg:col-span-8">
            <ContactForm
              source="collaboration"
              subjects={[
                { value: "editorial", label: "Editorial / guest note" },
                { value: "research", label: "Research access" },
                { value: "partnership", label: "Partnership" },
                { value: "press", label: "Press" },
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
