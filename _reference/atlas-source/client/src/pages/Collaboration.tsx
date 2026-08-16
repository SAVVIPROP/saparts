import { ArrowRight, Building2, LineChart, Handshake, Landmark } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Collaboration() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const submit = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Thank you — our partnerships team will be in touch.");
      setEmail("");
      setCompany("");
      setNotes("");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    submit.mutate({
      email,
      source: "partnerships",
      context: { company, notes },
    } as any);
  };

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="pt-40 pb-20 bg-ivory-warm hairline-bottom">
        <div className="container grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <div className="eyebrow">Partnerships</div>
            <h1 className="serif-headline text-5xl lg:text-7xl mt-4 leading-[1.03]">
              The network for
              <br />
              <span className="italic text-brass-deep">long-stay residential capital.</span>
            </h1>
          </div>
          <p className="lg:col-span-4 font-serif text-lg text-muted-foreground leading-snug">
            SAparts partners with developers, operators, and real estate funds to connect
            purpose-built long-stay assets with the world&apos;s most valuable mobility demand.
          </p>
        </div>
      </section>

      {/* Partner types */}
      <section className="container mt-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 border border-border">
          {[
            {
              icon: Building2,
              tag: "Developers",
              title: "Purpose-built residences.",
              body:
                "Launch new long-stay assets to a pre-qualified corporate and executive audience. Accelerate lease-up, build brand equity.",
            },
            {
              icon: Handshake,
              tag: "Operators",
              title: "Existing residences.",
              body:
                "Join the curated SAparts atlas. Featured placement, editorial coverage, and direct enquiry pipelines.",
            },
            {
              icon: Landmark,
              tag: "Real Estate Funds",
              title: "Asset repositioning.",
              body:
                "Convert underperforming residential and hospitality stock into serviced, long-stay income-producing assets.",
            },
            {
              icon: LineChart,
              tag: "Mobility Providers",
              title: "Referral partnerships.",
              body:
                "Relocation firms, DSPs, and global mobility tech — integrate SAparts inventory into your workflow.",
            },
          ].map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.tag}
                className={`p-8 ${i < 3 ? "md:border-r" : ""} ${
                  i < 2 ? "border-b md:border-b-0" : ""
                } ${i === 2 ? "border-b lg:border-b-0" : ""} border-border`}
              >
                <Icon className="w-6 h-6 text-brass-deep" />
                <div className="eyebrow mt-4">{p.tag}</div>
                <h3 className="serif-headline text-xl mt-2 leading-snug">{p.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Vision */}
      <section className="container mt-28 grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5">
          <div className="eyebrow">The Flywheel</div>
          <h2 className="serif-headline text-4xl mt-3 leading-tight">
            Demand aggregation is the moat.
          </h2>
          <div className="rule-gold mt-6" />
        </div>
        <div className="lg:col-span-7 font-serif text-lg leading-[1.8] text-charcoal/90 space-y-5">
          <p>
            SAparts aggregates the world&apos;s most valuable corporate long-stay demand. Executives,
            global mobility programmes, relocation consultants — concentrated in one editorial
            platform, with clear intent signals and policy visibility.
          </p>
          <p>
            That demand, curated and qualified, becomes the reason developers, operators, and
            capital allocators collaborate with us. Over time, exclusive inventory and co-developed
            properties become the difference between a listing service and a strategic partner.
          </p>
          <p className="italic">
            We are building the quiet default for long-stay — and the partner of choice for those
            who build the residences themselves.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-charcoal text-ivory mt-28 py-24">
        <div className="container grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <div className="eyebrow text-brass">Begin a Conversation</div>
            <h2 className="serif-headline text-4xl mt-3 leading-tight">
              Partnership enquiries.
            </h2>
            <div className="rule-gold mt-6" />
            <p className="mt-6 font-serif text-lg text-ivory/80 leading-relaxed">
              Introduce your project, portfolio, or fund. We respond personally, within one
              business day.
            </p>
            <div className="mt-8 text-sm text-ivory/70">
              partnerships@servicedaparts.com
            </div>
          </div>
          <form
            onSubmit={onSubmit}
            className="lg:col-span-7 space-y-5"
          >
            <div>
              <label className="eyebrow text-brass mb-2 block">Organisation</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-ivory/10 border border-ivory/20 px-3 py-3 font-serif text-ivory focus:outline-none focus:border-brass placeholder:text-ivory/40"
              />
            </div>
            <div>
              <label className="eyebrow text-brass mb-2 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-ivory/10 border border-ivory/20 px-3 py-3 font-serif text-ivory focus:outline-none focus:border-brass placeholder:text-ivory/40"
              />
            </div>
            <div>
              <label className="eyebrow text-brass mb-2 block">
                Project or partnership interest
              </label>
              <textarea
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-ivory/10 border border-ivory/20 px-3 py-3 font-serif text-ivory focus:outline-none focus:border-brass resize-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-brass text-charcoal px-6 py-3 font-sans text-xs font-medium tracking-widest uppercase hover:bg-brass-deep transition-colors"
            >
              Submit enquiry <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
