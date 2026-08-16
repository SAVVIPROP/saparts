import { useState } from "react";
import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { trpc } from "@/lib/trpc";

export default function Contact() {
  usePageMeta(
    "Contact SAparts — Get in Touch",
    "Contact the SAparts editorial team for general enquiries, partnerships, operator listings, press, and corrections."
  );

  const [form, setForm] = useState({ name: "", email: "", subject: "general", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    subscribe.mutate({
      email: form.email,
      source: `contact:${form.subject}:${form.name}:${form.message.slice(0, 200)}`,
    });
  }

  return (
    <div>
      {/* Breadcrumb */}
      <section className="hairline-bottom">
        <div className="container py-4 flex items-center gap-3 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <span>Contact</span>
        </div>
      </section>

      {/* Masthead */}
      <section className="hairline-bottom">
        <div className="container py-14 sm:py-20 lg:py-24 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <span className="section-mark mb-6 block">CONTACT</span>
            <h1 className="display text-[3rem] sm:text-[4.5rem] lg:text-[6rem] leading-[0.95]">
              Get in<br /><em>Touch.</em>
            </h1>
            <p className="mt-6 text-[1.1rem] text-muted-foreground max-w-lg leading-relaxed" style={{ fontFamily: "var(--font-serif)" }}>
              Whether you're an operator looking to claim your listing, a professional seeking accommodation advice, or a journalist covering the industry — we're here.
            </p>
          </div>
          <div className="lg:col-span-5 space-y-4">
            {[
              { label: "General Enquiries", email: "hello@saparts.com" },
              { label: "Editorial & Corrections", email: "editorial@saparts.com" },
              { label: "Operator Partnerships", email: "partnerships@saparts.com" },
              { label: "Press & Media", email: "press@saparts.com" },
            ].map((c) => (
              <div key={c.label} className="paper p-4 flex items-center justify-between">
                <div className="tracker-muted text-[0.78rem]">{c.label}</div>
                <a href={`mailto:${c.email}`} className="text-[0.9rem] hover:text-forest">{c.email}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="hairline-bottom">
        <div className="container py-14 sm:py-18 lg:py-24 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <span className="section-mark">§ 01</span>
            <h2 className="display text-[2rem] mt-4">Send a Message.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
              We respond to all enquiries within 2 business days. For urgent matters, please email us directly.
            </p>
            <div className="mt-8 space-y-4">
              <div className="paper p-4">
                <div className="tracker-muted text-[0.7rem] mb-1">Response time</div>
                <div className="text-[0.9rem]">Within 2 business days</div>
              </div>
              <div className="paper p-4">
                <div className="tracker-muted text-[0.7rem] mb-1">Operator listings</div>
                <div className="text-[0.9rem]">
                  <Link href="/collaboration" className="hover:text-forest">Claim your listing →︎</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            {submitted ? (
              <div className="paper p-10 text-center">
                <div className="tracker mb-4">Message received</div>
                <h3 className="display text-[2rem] mb-4">Thank you.</h3>
                <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                  We've received your message and will respond within 2 business days.
                </p>
                <Link href="/" className="btn-ghost mt-8 inline-flex">Return home →︎</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="tracker-muted text-[0.72rem] block mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-border bg-transparent px-4 py-3 text-[0.92rem] focus:outline-none focus:border-forest"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="tracker-muted text-[0.72rem] block mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-border bg-transparent px-4 py-3 text-[0.92rem] focus:outline-none focus:border-forest"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="tracker-muted text-[0.72rem] block mb-2">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-border bg-transparent px-4 py-3 text-[0.92rem] focus:outline-none focus:border-forest"
                  >
                    <option value="general">General Enquiry</option>
                    <option value="operator">Operator / Claim Listing</option>
                    <option value="editorial">Editorial / Data Correction</option>
                    <option value="press">Press & Media</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="tracker-muted text-[0.72rem] block mb-2">Message *</label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full border border-border bg-transparent px-4 py-3 text-[0.92rem] focus:outline-none focus:border-forest resize-none"
                    placeholder="How can we help?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribe.isPending}
                  className="btn-primary"
                >
                  {subscribe.isPending ? "Sending..." : "Send message →︎"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
