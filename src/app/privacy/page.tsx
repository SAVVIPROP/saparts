import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SAparts collects, uses, and protects personal data.",
};

export default function PrivacyPage() {
  return (
    <div>
      <Breadcrumb items={[{ label: "Privacy Policy" }]} />
      <section className="hairline-bottom">
        <div className="container py-12 lg:py-16">
          <span className="section-mark">Legal</span>
          <h1 className="display text-[2.8rem] sm:text-[4rem] mt-5">Privacy Policy.</h1>
          <p className="mt-4 tracker-muted">Last updated: 16 August 2026</p>
        </div>
      </section>
      <section>
        <div className="container py-12 lg:py-16 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3 tracker-muted space-y-2">
            {["Overview", "Data we collect", "How we use data", "Sharing", "Cookies", "Your rights", "Contact"].map(
              (item) => (
                <div key={item}>{item}</div>
              ),
            )}
          </div>
          <div className="lg:col-span-9 editorial-body">
            <h2>Overview</h2>
            <p>
              SAparts operates the public directory at saparts.com. This policy explains how we collect, use, and
              safeguard personal information when you visit the Platform.
            </p>
            <p>We do not sell personal data. We do not share enquiry information with operators without your consent.</p>
            <h2>Data we collect</h2>
            <p>This public replica has no account system. If you write to us, we receive whatever you include in the message:</p>
            <ul>
              <li>Name and email address when you use a contact form or subscribe to correspondence</li>
              <li>The content of your enquiry</li>
              <li>Technical data such as IP address and browser type, collected automatically by the host</li>
            </ul>
            <h2>How we use data</h2>
            <p>To answer enquiries, operate the directory, and improve the Platform. We do not use personal data to invent listings or prices.</p>
            <h2>Sharing</h2>
            <p>We share data only with processors who host the site or deliver email, and when required by law.</p>
            <h2>Cookies</h2>
            <p>Essential cookies may be set by the host. This replica does not include advertising or login cookies.</p>
            <h2>Your rights</h2>
            <p>
              Depending on your location you may request access, correction, deletion, or restriction. Write to
              hello@saparts.com.
            </p>
            <h2>Contact</h2>
            <p>Privacy enquiries: hello@saparts.com</p>
          </div>
        </div>
      </section>
    </div>
  );
}
