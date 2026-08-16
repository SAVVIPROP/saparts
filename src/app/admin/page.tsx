import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { directoryStats } from "@/lib/data";

export const metadata: Metadata = {
  title: "Administration",
  description: "Administration stub for the public SAparts replica.",
};

export default function AdminPage() {
  const stats = directoryStats();

  return (
    <div>
      <Breadcrumb items={[{ label: "Administration" }]} />
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-20">
          <span className="section-mark">Stub</span>
          <h1 className="display text-[3rem] sm:text-[4.5rem] mt-5">
            Administration is <em>not connected.</em>
          </h1>
          <p className="mt-6 font-serif text-[1.1rem] text-muted-foreground max-w-2xl leading-relaxed">
            This public replica has no login and no hosted authentication. Listing packs are imported on the filesystem
            with the documented script. Connect your own identity provider before exposing any write tools.
          </p>
        </div>
      </section>
      <section>
        <div className="container py-12 grid sm:grid-cols-3 gap-5">
          <div className="paper p-6">
            <div className="stat-label">Launch cities</div>
            <div className="stat-value mt-2">{stats.launchCities}</div>
          </div>
          <div className="paper p-6">
            <div className="stat-label">Residences filed</div>
            <div className="stat-value mt-2">{stats.properties}</div>
          </div>
          <div className="paper p-6">
            <div className="stat-label">Import path</div>
            <p className="mt-3 font-mono text-sm">scripts/import-enriched.mjs</p>
          </div>
        </div>
      </section>
    </div>
  );
}
