import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Terms() {
  usePageMeta(
    "Terms of Use — SAparts",
    "SAparts terms of use. The rules governing your use of the SAparts platform."
  );

  const lastUpdated = "26 May 2026";

  return (
    <div>
      {/* Breadcrumb */}
      <section className="hairline-bottom">
        <div className="container py-4 flex items-center gap-3 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <span>Terms of Use</span>
        </div>
      </section>

      {/* Masthead */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16">
          <span className="section-mark block mb-6">LEGAL</span>
          <h1 className="display text-[2.8rem] sm:text-[4rem] leading-[0.95]">Terms of Use.</h1>
          <p className="mt-4 tracker-muted">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section>
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3">
            <nav className="sticky top-24 space-y-2">
              {["Acceptance", "The Platform", "User Accounts", "Operator Subscriptions", "Intellectual Property", "Disclaimers", "Limitation of Liability", "Governing Law", "Contact"].map((item) => (
                <div key={item} className="tracker-muted text-[0.78rem] hover:text-forest cursor-pointer">{item}</div>
              ))}
            </nav>
          </div>
          <div className="lg:col-span-9 editorial-body prose prose-lg max-w-none">
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing or using the SAparts platform at saparts.com (the "Platform"), you agree to be bound by these Terms of Use. If you do not agree, please do not use the Platform.
            </p>

            <h2>The Platform</h2>
            <p>
              SAparts is an independent directory of serviced apartments and aparthotels. We provide information about properties for informational purposes only. We are not a booking agent, travel agent, or party to any accommodation contract between users and operators.
            </p>
            <p>
              Property data is sourced from publicly available information and operator submissions. While we take reasonable steps to ensure accuracy, we do not guarantee that property information is complete, current, or error-free. Rates, availability, and amenities are subject to change without notice.
            </p>

            <h2>User Accounts</h2>
            <p>
              You may create an account to access certain features of the Platform. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate information when creating your account.
            </p>

            <h2>Operator Subscriptions</h2>
            <p>
              Operators may subscribe to claim and manage their property listings. Subscriptions are charged at £100 per property per month (or as otherwise stated at time of purchase). Subscriptions are billed monthly and may be cancelled at any time. No refunds are provided for partial months.
            </p>
            <p>
              By subscribing, operators confirm that they have the right to manage the listed properties and that all information submitted is accurate. SAparts reserves the right to remove listings that violate our editorial standards.
            </p>

            <h2>Intellectual Property</h2>
            <p>
              All content on the Platform — including text, data, design, and code — is the property of SAparts or its licensors and is protected by copyright. You may not reproduce, distribute, or create derivative works without our written permission.
            </p>
            <p>
              Property images remain the property of their respective operators. SAparts uses property images under licence for editorial and directory purposes.
            </p>

            <h2>Disclaimers</h2>
            <p>
              The Platform is provided "as is" without warranties of any kind. SAparts does not warrant that the Platform will be uninterrupted, error-free, or free of viruses. We are not responsible for the content of third-party websites linked from the Platform.
            </p>
            <p>
              SAparts is an independent directory and is not affiliated with any property operator, hotel group, or booking platform. Inclusion in our directory does not constitute endorsement.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, SAparts shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform or any accommodation booked through operator contact facilitated by the Platform.
            </p>

            <h2>Governing Law</h2>
            <p>
              These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>

            <h2>Contact</h2>
            <p>
              For questions about these Terms, contact us at <a href="mailto:legal@saparts.com">legal@saparts.com</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
