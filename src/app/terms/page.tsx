import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing use of the SAparts directory.",
};

export default function TermsPage() {
  return (
    <div>
      <Breadcrumb items={[{ label: "Terms of Use" }]} />
      <section className="hairline-bottom">
        <div className="container py-12 lg:py-16">
          <span className="section-mark">Legal</span>
          <h1 className="display text-[2.8rem] sm:text-[4rem] mt-5">Terms of Use.</h1>
          <p className="mt-4 tracker-muted">Last updated: 16 August 2026</p>
        </div>
      </section>
      <section>
        <div className="container py-12 lg:py-16 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3 tracker-muted space-y-2">
            {["Acceptance", "The Platform", "Listings", "Intellectual property", "Disclaimers", "Contact"].map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
          <div className="lg:col-span-9 editorial-body">
            <h2>Acceptance</h2>
            <p>By using the SAparts Platform you agree to these Terms. If you do not agree, do not use the Platform.</p>
            <h2>The Platform</h2>
            <p>
              SAparts is an independent directory of serviced apartments and aparthotels. We provide information for
              editorial purposes. We are not a booking agent and are not party to any contract between you and an
              operator.
            </p>
            <h2>Listings</h2>
            <p>
              Property data is sourced from publicly available information and operator submissions imported as listing
              packs. We take reasonable steps toward accuracy but do not guarantee that information is complete or
              current. Rates appear only when supplied by a source. Availability and amenities may change without notice.
            </p>
            <h2>Intellectual property</h2>
            <p>
              Site design, editorial text, and the SAparts wordmark are the property of SAparts or its licensors.
              Property images remain the property of their operators and are used for directory purposes.
            </p>
            <h2>Disclaimers</h2>
            <p>
              The Platform is provided as is. SAparts is not responsible for the content of third-party websites linked
              from a dossier, including official and booking URLs.
            </p>
            <h2>Contact</h2>
            <p>hello@saparts.com</p>
          </div>
        </div>
      </section>
    </div>
  );
}
