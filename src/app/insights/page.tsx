import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Journal",
  description: "The SAparts Journal — editorial intelligence on corporate mobility and the serviced apartment market.",
};

export default function InsightsPage() {
  return (
    <div>
      <Breadcrumb items={[{ label: "Journal" }]} />
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <span className="section-mark">§ 06</span>
            <h1 className="display text-[3rem] sm:text-[4.5rem] mt-5">
              Intelligence, <em>not brochures.</em>
            </h1>
            <p className="mt-6 font-serif text-[1.1rem] text-muted-foreground max-w-2xl leading-relaxed">
              The SAparts Journal will publish market notes, relocation dossiers, and city intelligence on a deliberate
              schedule. This issue is a placeholder — essays are not invented to fill the page.
            </p>
          </div>
          <div className="lg:col-span-4 paper p-6">
            <div className="stat-label">Cadence</div>
            <div className="stat-value mt-1">Bi-weekly</div>
            <div className="tracker-muted mt-3">Conflicts disclosed</div>
          </div>
        </div>
      </section>
      <section>
        <div className="container py-14">
          <div className="paper p-8 sm:p-12">
            <div className="tracker-muted">Volume I</div>
            <h2 className="display text-3xl mt-3">No essays have been filed yet.</h2>
            <p className="mt-4 text-muted-foreground max-w-xl leading-relaxed">
              When the first note is ready, it will appear here with a source list. Until then, see Resources for
              standing guides and the directory for imported residences.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
