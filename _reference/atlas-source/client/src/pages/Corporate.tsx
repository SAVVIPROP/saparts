import { Link } from "wouter";
import {
  Briefcase,
  ShieldCheck,
  ArrowRight,
  Globe,
  Users,
  FileText,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export default function Corporate() {
  const { data: cities = [] } = trpc.cities.list.useQuery();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [needs, setNeeds] = useState("");
  const submit = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Thank you. Our enterprise team will reach out within one business day.");
      setName("");
      setCompany("");
      setEmail("");
      setNeeds("");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    submit.mutate({
      email,
      source: "corporate",
      context: { name, company, needs },
    } as any);
  };

  return (
    <div className="pb-24">
      {/* Hero masthead */}
      <section className="border-b border-border pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="container grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <div className="eyebrow text-forest mb-4">For Enterprise</div>
            <h1 className="font-serif text-5xl lg:text-[4.5rem] leading-[1.02] text-charcoal">
              Global mobility,
              <br />
              <em className="text-brass-deep">quietly handled.</em>
            </h1>
            <p className="mt-8 font-serif text-xl text-muted-foreground leading-relaxed max-w-2xl">
              SAparts is the world's leading index of serviced apartments for corporate mobility. With global ADR at £145 and investor appetite for the sector rising to 27% in 2025, the demand for a rigorous, independent standard has never been greater. [GSAIR 2025]
            </p>
          </div>
          <div className="lg:col-span-5 flex lg:justify-end">
            <div className="flex items-center gap-3 text-muted-foreground italic font-serif text-sm border-l border-border pl-5">
              <Globe className="w-4 h-4 text-forest shrink-0" />
              {(cities as any[]).length || 30} markets indexed · four categories · one editorial standard.
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="container mt-24 grid md:grid-cols-3 gap-0 border border-border">
        {[
          {
            icon: ShieldCheck,
            title: "Policy-safe sourcing",
            body:
              "Every residence is vetted against corporate housing standards — licensing, safety, and serviced apartment credentials. Accommodation accounts for nearly 30% of total corporate travel spend. [GBTA] Our standard ensures that spend is defensible.",
          },
          {
            icon: FileText,
            title: "Procurement-ready data",
            body:
              "Transparent rate ranges, unit mix, lease flexibility, and standardised amenity sheets — exportable, comparable. Serviced apartments are typically 20–40% more cost-effective than hotels for stays exceeding 30 nights. [Apartool / AEGVE, 2026] Our data makes that case for you.",
          },
          {
            icon: Users,
            title: "Shared shortlists",
            body:
              "Your teams build branded shortlists and share a single link with candidates or approvers — no logins required. The average corporate relocation stay exceeds 83 days. [CHPA, 2026] A shortlist built on this index is a shortlist built for that duration.",
          },
        ].map((v, i) => {
          const Icon = v.icon;
          return (
            <div
              key={i}
              className={`p-10 ${i < 2 ? "md:border-r border-border" : ""} ${
                i < 2 ? "border-b md:border-b-0 border-border" : ""
              }`}
            >
              <Icon className="w-6 h-6 text-brass-deep" />
              <h3 className="serif-headline text-2xl mt-5">{v.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{v.body}</p>
            </div>
          );
        })}
      </section>

      {/* Use cases */}
      <section className="container mt-24">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div className="eyebrow">Who We Serve</div>
            <h2 className="serif-headline text-4xl mt-3 leading-tight">
              Built for the way modern mobility teams actually work.
            </h2>
            <div className="rule-gold mt-6" />
          </div>
          <div className="lg:col-span-8 divide-y divide-border">
            {[
              {
                tag: "Global Mobility",
                title: "Relocation programmes with a global standard.",
                body:
                  "Set internal policy bands by city and role; we surface only residences that clear your cost-per-day, amenity, and neighbourhood criteria. Europe's branded serviced apartment pipeline is expected to grow by 16,500 rooms by 2030. [GSAIR 2025] We track every new address as it enters the market.",
              },
              {
                tag: "HR & Talent",
                title: "Executive assignments and short rotations.",
                body:
                  "A curated first impression for senior hires. Elegant, editorial, and private — without the coldness of a corporate portal. The global serviced apartment market is projected to reach $420.9 billion by 2034. [Precedence Research, 2025] Your assignees deserve the best of that market, independently assessed.",
              },
              {
                tag: "Procurement",
                title: "Preferred supplier lists, sharpened.",
                body:
                  "Build approved inventory lists by city with rate history, amenities, and documentation — ready for sourcing and audit. Investor interest in the sector rose three percentage points to 27% in 2025. [GSAIR 2025] Our data gives procurement teams the intelligence to negotiate from a position of knowledge.",
              },
              {
                tag: "Relocation Consultants",
                title: "A research layer for your client services.",
                body:
                  "Deep neighbourhood and market intelligence to accelerate candidate shortlisting and approval cycles. Nearly half (48%) of all business travellers have used extended-stay accommodation. [GBTA / WWStay] Our register is the most rigorous independent source for that decision.",
              },
            ].map((u) => (
              <div key={u.tag} className="py-7 flex flex-col md:flex-row md:items-start gap-4">
                <div className="md:w-40 flex-shrink-0">
                  <div className="pill">{u.tag}</div>
                </div>
                <div>
                  <h4 className="serif-headline text-xl">{u.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{u.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ivory-warm hairline-top hairline-bottom mt-24 py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <div className="eyebrow">Engagement</div>
            <h2 className="serif-headline text-4xl mt-3">A quiet process, purpose-built.</h2>
            <div className="rule-gold mt-6 max-w-xs mx-auto" />
          </div>
          <div className="mt-14 grid md:grid-cols-4 gap-8">
            {[
              {
                n: "01",
                title: "Brief",
                body: "Share your destinations, duration bands, and policy requirements.",
              },
              {
                n: "02",
                title: "Curate",
                body:
                  "Our editors assemble a bespoke shortlist drawn from our vetted atlas.",
              },
              {
                n: "03",
                title: "Compare",
                body:
                  "Share the list internally or with candidates — amenities, rates, and unit types standardized.",
              },
              {
                n: "04",
                title: "Book",
                body: "Confirm through our booking partners or via direct operator contact.",
              },
            ].map((s) => (
              <div key={s.n} className="paper p-8">
                <div className="font-serif text-brass-deep text-sm">{s.n}</div>
                <h4 className="serif-headline text-xl mt-2">{s.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Enterprise enquiry */}
      <section className="container mt-24 grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5">
          <div className="eyebrow">Enterprise Enquiry</div>
          <h2 className="serif-headline text-4xl mt-3 leading-tight">
            Speak with the world's leading serviced apartment desk.
          </h2>
          <div className="rule-gold mt-6" />
          <p className="mt-6 font-serif text-lg text-muted-foreground leading-relaxed">
            Whether you are preparing a single executive relocation or structuring a global mobility programme across multiple markets, our team will respond within one business day. Every brief is treated with the same editorial rigour we apply to the register itself.
          </p>
          <div className="mt-8 space-y-5 text-sm">
            <div className="flex items-start gap-3">
              <Briefcase className="w-4 h-4 text-brass-deep mt-1" />
              <div>
                <div className="font-medium">Enterprise programs</div>
                <div className="text-muted-foreground">
                  Preferred-supplier arrangements, policy integration, reporting.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-brass-deep mt-1" />
              <div>
                <div className="font-medium">Bespoke curation</div>
                <div className="text-muted-foreground">
                  Off-directory sourcing for unique briefs and senior relocations.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7">
          <form
            onSubmit={onSubmit}
            className="bg-ivory-warm p-8 lg:p-12 border border-border space-y-5"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="eyebrow mb-2 block">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-3 font-serif focus:outline-none focus:border-brass"
                />
              </div>
              <div>
                <label className="eyebrow mb-2 block">Organisation</label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-3 font-serif focus:outline-none focus:border-brass"
                />
              </div>
            </div>
            <div>
              <label className="eyebrow mb-2 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border px-3 py-3 font-serif focus:outline-none focus:border-brass"
              />
            </div>
            <div>
              <label className="eyebrow mb-2 block">Programme needs</label>
              <textarea
                rows={4}
                value={needs}
                onChange={(e) => setNeeds(e.target.value)}
                placeholder="Cities, duration bands, number of assignees, policy considerations…"
                className="w-full bg-background border border-border px-3 py-3 font-serif focus:outline-none focus:border-brass resize-none"
              />
            </div>
            <button type="submit" className="btn-primary">
              Request consultation <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-muted-foreground italic">
              We respond within one business day. Your data is held in confidence.
            </p>
          </form>
        </div>
      </section>

      {/* Related insights */}
      <section className="container mt-24">
        <div className="flex items-center justify-between">
          <div>
            <div className="eyebrow">Further Reading</div>
            <h3 className="serif-headline text-2xl mt-2">Intelligence for programme leaders.</h3>
          </div>
          <Link href="/insights" className="text-sm text-brass-deep font-medium hover:underline inline-flex items-center gap-1">
            Browse all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
