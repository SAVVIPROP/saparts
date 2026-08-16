import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { directoryStats } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description: "SAparts is the world's leading independent directory of serviced apartments and aparthotels.",
};

export default function AboutPage() {
  const stats = directoryStats();

  return (
    <div>
      <Breadcrumb items={[{ label: "About" }]} />
      <section className="hairline-bottom">
        <div className="container py-16 lg:py-28 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <span className="section-mark">About</span>
            <h1 className="display text-[2.8rem] sm:text-[5rem] mt-5 leading-[0.95]">
              Independent.
              <br />
              <em>Authoritative.</em>
              <br />
              Global.
            </h1>
          </div>
          <div className="lg:col-span-4 space-y-3">
            <div className="paper p-5">
              <div className="stat-label">Residences filed</div>
              <div className="stat-value mt-1">{stats.properties}</div>
            </div>
            <div className="paper p-5">
              <div className="stat-label">Launch cities</div>
              <div className="stat-value mt-1">{stats.launchCities}</div>
            </div>
            <div className="paper p-5">
              <div className="stat-label">Founded</div>
              <div className="stat-value mt-1">MMXXVI</div>
            </div>
          </div>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3">
            <span className="section-mark">§ 01</span>
            <h2 className="display text-[2rem] mt-4">Our mission.</h2>
          </div>
          <div className="lg:col-span-9 editorial-body">
            <p>
              SAparts is the world&apos;s leading independent directory supporting the best in class serviced apartments
              and aparthotels. We exist to make the global serviced apartment market transparent, navigable, and
              trustworthy — for business professionals, families, and long-stay travellers alike.
            </p>
            <p>
              Unlike hotel booking platforms, we do not take commissions on bookings. Unlike operator-owned directories,
              we are not affiliated with any single brand or portfolio. Our editorial independence is the foundation of
              our authority.
            </p>
            <p>
              Every property in our register is indexed from authoritative sources. Every claim can be traced. If it
              cannot, it does not appear here. We do not invent inventory or prices.
            </p>
          </div>
        </div>
      </section>
      <section className="hairline-bottom bg-ivory-warm">
        <div className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3">
            <span className="section-mark">§ 02</span>
            <h2 className="display text-[2rem] mt-4">Editorial standards.</h2>
          </div>
          <div className="lg:col-span-9 grid sm:grid-cols-2 gap-5">
            {[
              ["Independence", "SAparts is not owned by, affiliated with, or funded by any serviced apartment operator, hotel group, or booking platform."],
              ["Verifiability", "Every statistic and claim cited on this platform is sourced from a publicly available, authoritative reference."],
              ["Transparency", "When operators pay to claim a listing, this is disclosed. Organic presentation is not sold."],
              ["Accuracy", "Where data is unavailable or unverifiable, we display a dash rather than an estimate. We do not fabricate figures."],
              ["Privacy", "We do not sell user data. Enquiry information is not shared without explicit consent."],
              ["Corrections", "Write to editorial@saparts.com. Verified corrections are applied promptly."],
            ].map(([title, body]) => (
              <div key={title} className="paper p-6">
                <div className="tracker mb-3">{title}</div>
                <p className="text-[0.92rem] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section>
        <div className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3">
            <span className="section-mark">§ 03</span>
            <h2 className="display text-[2rem] mt-4">What we cover.</h2>
          </div>
          <div className="lg:col-span-9 editorial-body">
            <p>SAparts indexes serviced apartments and aparthotels. Our coverage spans:</p>
            <ul>
              <li>Serviced apartments — furnished residences with hotel-grade services for short and extended stays</li>
              <li>Aparthotels — hybrid properties combining apartment living with hotel amenities</li>
              <li>Residences and penthouses operated to a serviced standard</li>
            </ul>
            <p>
              We do not index traditional hotels, short-term holiday lettings, or unverified private rentals. Our focus
              is the professional long-stay market.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
