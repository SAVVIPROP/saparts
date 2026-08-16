import { useState } from "react";
import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Building2, Mail, BarChart3, Star, Globe } from "lucide-react";

export default function Operators() {
  usePageMeta(
    "For Operators — List Your Serviced Apartment on SAparts",
    "Claim your listing on SAparts, the world's leading independent serviced apartment directory. Receive direct enquiries from business professionals, families, and long-stay travellers. £100/month per property."
  );

  const [form, setForm] = useState({ name: "", email: "", company: "", properties: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    subscribe.mutate({
      email: form.email,
      source: `operator:${form.company}:${form.name}:${form.properties}`,
    });
  }

  const { data: stats } = trpc.stats.global.useQuery();

  return (
    <div>
      {/* Breadcrumb */}
      <section className="hairline-bottom">
        <div className="container py-4 flex items-center gap-3 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <span>For Operators</span>
        </div>
      </section>

      {/* Hero */}
      <section className="hairline-bottom">
        <div className="container py-16 sm:py-20 lg:py-28 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <span className="section-mark block mb-6">FOR OPERATORS</span>
            <h1 className="display text-[2.8rem] sm:text-[4rem] lg:text-[5.5rem] leading-[0.95]">
              Your properties<br />are already<br /><em>listed.</em>
            </h1>
            <p className="mt-6 text-[1.1rem] text-muted-foreground max-w-xl leading-relaxed" style={{ fontFamily: "var(--font-serif)" }}>
              SAparts has indexed {(stats?.totalProperties || 10000).toLocaleString()}+ serviced apartments across {stats?.totalCities || 200}+ cities. Your properties are already visible to business professionals, corporate mobility teams, and long-stay travellers worldwide. Claim your listing to receive direct enquiries.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#claim" className="btn-primary">Claim your listing →︎</a>
              <Link href="/collaboration" className="btn-ghost">Partnership enquiries →︎</Link>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-3">
            {[
              { label: "Properties indexed", value: `${(stats?.totalProperties || 10000).toLocaleString()}+` },
              { label: "Cities covered", value: `${stats?.totalCities || 200}+` },
              { label: "Monthly subscription", value: "£100 / property" },
              { label: "Contract", value: "Monthly · Cancel anytime" },
            ].map((s) => (
              <div key={s.label} className="paper p-4 flex items-center justify-between">
                <div className="tracker-muted text-[0.78rem]">{s.label}</div>
                <div className="font-serif text-[1.05rem]">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="hairline-bottom bg-ivory-warm">
        <div className="container py-14 sm:py-18 lg:py-24 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3">
            <span className="section-mark">§ 01</span>
            <h2 className="display text-[2rem] mt-4">What You Get.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
              A claimed listing on SAparts gives your properties direct access to a global audience of high-value long-stay guests.
            </p>
          </div>
          <div className="lg:col-span-9 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Mail,
                title: "Direct Enquiries",
                body: "Enquiries from guests go directly to your team — no intermediary, no commission on bookings. You own the relationship."
              },
              {
                icon: BarChart3,
                title: "Enquiry Analytics",
                body: "See how many users viewed your property, clicked your listing, and submitted enquiries. Monthly reporting included."
              },
              {
                icon: Building2,
                title: "Manage Your Listing",
                body: "Update your property description, photos, amenities, pricing, and contact details at any time through your operator dashboard."
              },
              {
                icon: Star,
                title: "Awards Eligibility",
                body: "Claimed properties are eligible for the SAparts Awards — Top 50, Top 30 Luxury, Top 30 Business, and Top 50 Family categories."
              },
              {
                icon: Globe,
                title: "Global Visibility",
                body: "Your properties appear in city searches, collection pages, and editorial features across 200+ city markets worldwide."
              },
              {
                icon: CheckCircle,
                title: "Verified Badge",
                body: "Claimed listings receive a verified operator badge, signalling to guests that the listing is managed by the property owner."
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="paper p-6">
                  <Icon className="w-5 h-5 text-muted-foreground mb-4" />
                  <div className="tracker mb-2">{item.title}</div>
                  <p className="text-[0.88rem] text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="hairline-bottom">
        <div className="container py-14 sm:py-18 lg:py-24 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3">
            <span className="section-mark">§ 02</span>
            <h2 className="display text-[2rem] mt-4">Pricing.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
              Simple, transparent pricing. No setup fees. No booking commissions. Cancel anytime.
            </p>
          </div>
          <div className="lg:col-span-9 grid sm:grid-cols-3 gap-5">
            <div className="paper p-6 border-2 border-border">
              <div className="tracker mb-4">Standard</div>
              <div className="display text-[2.5rem] leading-none mb-1">£100</div>
              <div className="tracker-muted text-[0.78rem] mb-6">per property / month</div>
              <ul className="space-y-2 mb-8">
                {["Direct enquiries to your team", "Manage listing & photos", "Enquiry analytics", "Verified operator badge", "Awards eligibility"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[0.85rem]">
                    <CheckCircle className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#claim" className="btn-primary w-full text-center block">Get started →︎</a>
            </div>
            <div className="paper p-6 bg-forest text-ivory-warm border-2 border-forest">
              <div className="tracker mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>Featured</div>
              <div className="display text-[2.5rem] leading-none mb-1">£200</div>
              <div className="text-[0.78rem] mb-6" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-mono)" }}>per property / month</div>
              <ul className="space-y-2 mb-8">
                {["Everything in Standard", "Featured placement in city search", "Highlighted badge", "Priority in collection pages", "Monthly performance report"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[0.85rem]">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#claim" className="btn-ghost w-full text-center block border-ivory-warm text-ivory-warm hover:bg-ivory-warm hover:text-forest">Get started →︎</a>
            </div>
            <div className="paper p-6 border-2 border-border">
              <div className="tracker mb-4">Premium</div>
              <div className="display text-[2.5rem] leading-none mb-1">£500</div>
              <div className="tracker-muted text-[0.78rem] mb-6">per property / month</div>
              <ul className="space-y-2 mb-8">
                {["Everything in Featured", "Dedicated city page feature", "Editorial write-up", "Homepage dossier feature", "Dedicated account manager"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[0.85rem]">
                    <CheckCircle className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#claim" className="btn-primary w-full text-center block">Get started →︎</a>
            </div>
          </div>
        </div>
      </section>

      {/* Claim Form */}
      <section id="claim" className="hairline-bottom bg-ivory-warm">
        <div className="container py-14 sm:py-18 lg:py-24 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <span className="section-mark">§ 03</span>
            <h2 className="display text-[2rem] mt-4">Claim Your Listing.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
              Fill in the form and our partnerships team will be in touch within 2 business days to set up your operator account.
            </p>
            <div className="mt-8 paper p-5">
              <div className="tracker-muted text-[0.7rem] mb-2">Questions?</div>
              <p className="text-[0.88rem]">Email us at <a href="mailto:partnerships@saparts.com" className="hover:text-forest">partnerships@saparts.com</a></p>
            </div>
          </div>
          <div className="lg:col-span-8">
            {submitted ? (
              <div className="paper p-10 text-center">
                <div className="tracker mb-4">Enquiry received</div>
                <h3 className="display text-[2rem] mb-4">Thank you.</h3>
                <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Our partnerships team will be in touch within 2 business days to set up your operator account.
                </p>
                <Link href="/" className="btn-ghost mt-8 inline-flex">Return home →︎</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="tracker-muted text-[0.72rem] block mb-2">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-border bg-transparent px-4 py-3 text-[0.92rem] focus:outline-none focus:border-forest"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="tracker-muted text-[0.72rem] block mb-2">Work Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-border bg-transparent px-4 py-3 text-[0.92rem] focus:outline-none focus:border-forest"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="tracker-muted text-[0.72rem] block mb-2">Company / Brand Name *</label>
                    <input
                      type="text"
                      required
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full border border-border bg-transparent px-4 py-3 text-[0.92rem] focus:outline-none focus:border-forest"
                      placeholder="e.g. Cheval Collection"
                    />
                  </div>
                  <div>
                    <label className="tracker-muted text-[0.72rem] block mb-2">Number of Properties</label>
                    <input
                      type="text"
                      value={form.properties}
                      onChange={(e) => setForm({ ...form, properties: e.target.value })}
                      className="w-full border border-border bg-transparent px-4 py-3 text-[0.92rem] focus:outline-none focus:border-forest"
                      placeholder="e.g. 12 properties in London"
                    />
                  </div>
                </div>
                <div>
                  <label className="tracker-muted text-[0.72rem] block mb-2">Message (optional)</label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full border border-border bg-transparent px-4 py-3 text-[0.92rem] focus:outline-none focus:border-forest resize-none"
                    placeholder="Tell us about your portfolio and what you're looking for..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribe.isPending}
                  className="btn-primary"
                >
                  {subscribe.isPending ? "Submitting..." : "Submit enquiry →︎"}
                </button>
                <p className="text-[0.78rem] text-muted-foreground">
                  By submitting this form you agree to our <Link href="/privacy" className="hover:text-forest">Privacy Policy</Link> and <Link href="/terms" className="hover:text-forest">Terms of Use</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
