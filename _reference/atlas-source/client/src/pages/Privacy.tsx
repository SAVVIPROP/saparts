import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Privacy() {
  usePageMeta(
    "Privacy Policy — SAparts",
    "SAparts privacy policy. How we collect, use, and protect your personal data."
  );

  const lastUpdated = "26 May 2026";

  return (
    <div>
      {/* Breadcrumb */}
      <section className="hairline-bottom">
        <div className="container py-4 flex items-center gap-3 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <span>Privacy Policy</span>
        </div>
      </section>

      {/* Masthead */}
      <section className="hairline-bottom">
        <div className="container py-12 sm:py-16">
          <span className="section-mark block mb-6">LEGAL</span>
          <h1 className="display text-[2.8rem] sm:text-[4rem] leading-[0.95]">Privacy Policy.</h1>
          <p className="mt-4 tracker-muted">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section>
        <div className="container py-12 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3">
            <nav className="sticky top-24 space-y-2">
              {["Overview", "Data We Collect", "How We Use Data", "Data Sharing", "Cookies", "Your Rights", "Data Retention", "Security", "Contact"].map((item) => (
                <div key={item} className="tracker-muted text-[0.78rem] hover:text-forest cursor-pointer">{item}</div>
              ))}
            </nav>
          </div>
          <div className="lg:col-span-9 editorial-body prose prose-lg max-w-none">
            <h2>Overview</h2>
            <p>
              SAparts ("we", "us", "our") operates the website at saparts.com (the "Platform"). This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our Platform or use our services.
            </p>
            <p>
              We are committed to protecting your privacy. We do not sell your personal data to third parties. We do not share your enquiry information with property operators without your explicit consent.
            </p>

            <h2>Data We Collect</h2>
            <p>We collect the following categories of personal data:</p>
            <ul>
              <li><strong>Account data:</strong> Name, email address, and password when you create an account.</li>
              <li><strong>Enquiry data:</strong> When you submit a property enquiry, we collect your name, email, phone number (if provided), and the content of your enquiry.</li>
              <li><strong>Newsletter data:</strong> Email address when you subscribe to The SAparts Review.</li>
              <li><strong>Usage data:</strong> Pages visited, search queries, and interactions with the Platform, collected via analytics tools.</li>
              <li><strong>Payment data:</strong> When you subscribe as an operator, payment is processed by Stripe. We do not store card details on our servers.</li>
              <li><strong>Technical data:</strong> IP address, browser type, device type, and operating system, collected automatically when you access the Platform.</li>
            </ul>

            <h2>How We Use Your Data</h2>
            <ul>
              <li>To provide and improve the Platform and its features</li>
              <li>To send you The SAparts Review newsletter (with your consent)</li>
              <li>To process operator subscriptions and manage accounts</li>
              <li>To respond to your enquiries and support requests</li>
              <li>To analyse usage patterns and improve the user experience</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2>Data Sharing</h2>
            <p>We do not sell your personal data. We share data only in the following circumstances:</p>
            <ul>
              <li><strong>Service providers:</strong> We use trusted third-party services (including Stripe for payments, and analytics providers) who process data on our behalf under strict data processing agreements.</li>
              <li><strong>Property operators:</strong> When you submit an enquiry for a specific property, your contact details and enquiry are shared with the relevant operator. You consent to this sharing when you submit the enquiry form.</li>
              <li><strong>Legal requirements:</strong> We may disclose data if required by law or to protect our legal rights.</li>
            </ul>

            <h2>Cookies</h2>
            <p>
              We use essential cookies to operate the Platform (session management, authentication). We use analytics cookies to understand how visitors use the Platform. You can disable non-essential cookies in your browser settings.
            </p>

            <h2>Your Rights</h2>
            <p>Under applicable data protection law (including GDPR where applicable), you have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict processing of your personal data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time (where processing is based on consent)</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="mailto:privacy@saparts.com">privacy@saparts.com</a>.</p>

            <h2>Data Retention</h2>
            <p>
              We retain account data for as long as your account is active. We retain enquiry data for 12 months. Newsletter subscription data is retained until you unsubscribe. Payment records are retained for 7 years as required by law.
            </p>

            <h2>Security</h2>
            <p>
              We implement industry-standard security measures including encrypted data transmission (TLS), hashed passwords, and access controls. No method of transmission over the internet is 100% secure; we cannot guarantee absolute security.
            </p>

            <h2>Contact</h2>
            <p>
              For privacy-related enquiries, contact us at <a href="mailto:privacy@saparts.com">privacy@saparts.com</a> or write to: SAparts, Privacy Team, [Address].
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
