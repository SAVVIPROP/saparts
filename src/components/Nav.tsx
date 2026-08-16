"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "./Wordmark";
import { useBookmarks } from "@/hooks/useBookmarks";
import {
  ChevronDown, Menu, Search, X, MapPin, Globe, Building2, Star, BookOpen,
  Briefcase, Calculator, FileText, Award, Users, Heart, PawPrint, Plane,
  LayoutGrid, Home, Hotel, Crown, Newspaper, Map, TrendingUp, Coffee,
  ArrowRight, Bookmark, Share2, Trash2,
} from "./icons";

const TOC_SECTIONS = [
  { num: "01", label: "Atlas", href: "/cities" },
  { num: "02", label: "Directory", href: "/search" },
  { num: "03", label: "Collections", href: "/collections" },
  { num: "04", label: "Awards", href: "/awards" },
  { num: "05", label: "Resources", href: "/resources" },
  { num: "06", label: "Journal", href: "/insights" },
  { num: "07", label: "Corporate", href: "/corporate" },
];

type MegaCity = { name: string; slug: string; launch?: boolean };
type MegaKey = "atlas" | "directory" | "resources" | "journal" | null;

export function Nav({
  citiesByRegion,
  stats,
}: {
  citiesByRegion: Record<string, MegaCity[]>;
  stats: { cities: number; properties: number };
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<MegaKey>(null);
  const [bookmarkPanelOpen, setBookmarkPanelOpen] = useState(false);
  const pathname = usePathname();
  const { bookmarks, count: bookmarkCount, remove, getShareUrl } = useBookmarks();
  const navRef = useRef<HTMLElement>(null);
  const isHome = pathname === "/";

  useEffect(() => {
    setMobileOpen(false);
    setActiveMega(null);
  }, [pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setActiveMega(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const toggle = (key: MegaKey) => setActiveMega((prev) => (prev === key ? null : key));

  return (
    <header ref={navRef} className="sticky top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="border-b border-border">
        <div className="container flex items-center justify-between h-7 gap-3 sm:gap-6 overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 truncate text-[0.7rem] tracking-wider uppercase text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-forest shrink-0" />
            <span className="hidden sm:inline">The World&apos;s Leading Serviced Apartment Directory</span>
            <span className="sm:hidden">SAparts Directory</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden xs:inline">{stats.cities} Cities</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{stats.properties.toLocaleString()} Properties</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline">Updated {today}</span>
          </div>
          <div className="hidden lg:flex items-center gap-5 text-[0.7rem] tracking-wider uppercase text-muted-foreground shrink-0">
            <Link href="/awards" className="hover:text-charcoal transition-colors">Awards ↗︎</Link>
            <Link href="/operators" className="hover:text-charcoal transition-colors">For Operators ↗︎</Link>
            <Link href="/corporate" className="hover:text-charcoal transition-colors">For Mobility Teams ↗︎</Link>
          </div>
          <Link href="/awards" className="text-[0.7rem] tracking-wider uppercase text-muted-foreground lg:hidden shrink-0 hover:text-charcoal">Awards ↗︎</Link>
        </div>
      </div>

      <div className="container flex items-center justify-between h-14 sm:h-16 gap-4 sm:gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Wordmark />
        </Link>
        <nav className="hidden lg:flex items-center gap-0.5">
          <button onClick={() => toggle("atlas")} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium hover:text-forest rounded-sm ${activeMega === "atlas" ? "text-forest bg-ivory-warm" : "text-charcoal"}`}>
            <Globe className="w-3.5 h-3.5" /> Atlas <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMega === "atlas" ? "rotate-180" : ""}`} />
          </button>
          <button onClick={() => toggle("directory")} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium hover:text-forest rounded-sm ${activeMega === "directory" ? "text-forest bg-ivory-warm" : "text-charcoal"}`}>
            <Building2 className="w-3.5 h-3.5" /> Directory <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMega === "directory" ? "rotate-180" : ""}`} />
          </button>
          <Link href="/collections" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-charcoal hover:text-forest rounded-sm">
            <Star className="w-3.5 h-3.5" /> Collections
          </Link>
          <button onClick={() => toggle("resources")} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium hover:text-forest rounded-sm ${activeMega === "resources" ? "text-forest bg-ivory-warm" : "text-charcoal"}`}>
            <BookOpen className="w-3.5 h-3.5" /> Resources <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMega === "resources" ? "rotate-180" : ""}`} />
          </button>
          <button onClick={() => toggle("journal")} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium hover:text-forest rounded-sm ${activeMega === "journal" ? "text-forest bg-ivory-warm" : "text-charcoal"}`}>
            <Newspaper className="w-3.5 h-3.5" /> Journal <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMega === "journal" ? "rotate-180" : ""}`} />
          </button>
          <Link href="/awards" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-charcoal hover:text-forest rounded-sm">
            <Award className="w-3.5 h-3.5" /> Awards
          </Link>
        </nav>
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/search" className="flex items-center gap-2 text-charcoal hover:text-forest" aria-label="Search">
            <Search className="w-[16px] h-[16px]" />
            <span className="text-[0.7rem] tracking-wider uppercase">Search</span>
          </Link>
          <button onClick={() => setBookmarkPanelOpen(true)} className="relative flex items-center gap-1.5 text-charcoal hover:text-forest" aria-label="Reading list">
            <Bookmark className="w-[16px] h-[16px]" strokeWidth={1.6} />
            {bookmarkCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-forest text-ivory text-[0.6rem] flex items-center justify-center px-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                {bookmarkCount}
              </span>
            )}
          </button>
          <Link href="/account/shortlists" className="text-sm text-charcoal hover:text-forest">Shortlists</Link>
          <Link href="/operators" className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-charcoal bg-background text-charcoal hover:bg-charcoal hover:text-ivory font-medium">
            List a property →︎
          </Link>
        </div>
        <div className="lg:hidden flex items-center gap-2 shrink-0">
          <Link href="/operators" className="inline-flex items-center px-2.5 py-1.5 text-[0.72rem] tracking-[0.08em] uppercase border border-charcoal">List →︎</Link>
          <button className="p-2 text-charcoal" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isHome && (
        <div className="border-t border-border hidden md:block">
          <div className="container flex items-center gap-5 lg:gap-7 h-9 overflow-x-auto no-scrollbar">
            <span className="text-[0.68rem] tracking-wider uppercase text-muted-foreground shrink-0">Contents</span>
            {TOC_SECTIONS.map((s) => (
              <Link key={s.num} href={s.href} className="text-[0.72rem] tracking-wider uppercase text-muted-foreground hover:text-charcoal shrink-0">
                <span className="mr-1">§ {s.num}</span>{s.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {bookmarkPanelOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-charcoal/20 backdrop-blur-sm" onClick={() => setBookmarkPanelOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-background border-l border-border flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <div className="tracker text-[0.72rem]">READING LIST</div>
                <div className="font-serif text-[1.1rem] mt-0.5">{bookmarkCount} {bookmarkCount === 1 ? "residence" : "residences"} saved</div>
              </div>
              <button onClick={() => setBookmarkPanelOpen(false)} className="p-1.5 text-muted-foreground hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {bookmarks.length === 0 ? (
                <div className="py-12 text-center">
                  <Bookmark className="w-8 h-8 mx-auto text-muted-foreground mb-3" strokeWidth={1.2} />
                  <p className="text-sm text-muted-foreground">No residences saved yet.</p>
                </div>
              ) : (
                bookmarks.map((b) => (
                  <div key={b.id} className="flex gap-3 items-start group">
                    <Link href={`/properties/${b.slug}`} onClick={() => setBookmarkPanelOpen(false)} className="block w-16 h-16 shrink-0 overflow-hidden bg-ivory-warm border border-border">
                      {b.heroImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.heroImageUrl} alt={b.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/properties/${b.slug}`} onClick={() => setBookmarkPanelOpen(false)} className="block font-serif text-[0.95rem] leading-tight hover:text-forest line-clamp-2">
                        {b.name}
                      </Link>
                      {b.category && <div className="tracker-muted text-[0.65rem] mt-1">{b.category}</div>}
                    </div>
                    <button onClick={() => remove(b.id)} className="p-1 text-muted-foreground hover:text-red-500" aria-label="Remove">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
            {bookmarks.length > 0 && (
              <div className="px-6 py-4 border-t border-border space-y-2">
                <button
                  onClick={() => {
                    const url = getShareUrl();
                    if (url) navigator.clipboard.writeText(url);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border text-sm hover:bg-ivory-warm"
                  style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em", fontSize: "0.72rem" }}
                >
                  <Share2 className="w-3.5 h-3.5" /> SHARE READING LIST
                </button>
                <Link href="/account/shortlists" onClick={() => setBookmarkPanelOpen(false)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-charcoal text-ivory text-sm hover:bg-forest" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em", fontSize: "0.72rem" }}>
                  VIEW SHORTLISTS
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {activeMega === "atlas" && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-xl z-50">
          <div className="container py-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-border">
              {Object.entries(citiesByRegion).map(([region, cities]) => (
                <div key={region} className="px-6 first:pl-0 last:pr-0">
                  <div className="flex items-center gap-2 text-forest mb-4 pb-3 border-b border-border">
                    <Globe className="w-3.5 h-3.5" />
                    <span className="text-[0.68rem] tracking-[0.18em] uppercase font-medium">{region}</span>
                  </div>
                  <div className="space-y-1">
                    {cities.map((c) => (
                      <Link key={c.slug} href={`/cities/${c.slug}`} onClick={() => setActiveMega(null)} className="flex items-center justify-between group py-1.5 px-2 -mx-2 rounded-sm hover:bg-ivory-warm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-muted-foreground group-hover:text-forest shrink-0" />
                          <span className="font-serif text-[0.95rem] group-hover:text-forest">{c.name}</span>
                        </div>
                        <span className="text-[0.68rem] text-muted-foreground font-mono">{c.launch === false ? "Soon" : "View"}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
              <span className="text-[0.72rem] tracking-wider uppercase text-muted-foreground">Source-backed city coverage</span>
              <Link href="/cities" onClick={() => setActiveMega(null)} className="flex items-center gap-1.5 text-[0.72rem] tracking-wider uppercase text-forest hover:underline font-medium">
                View all cities <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeMega === "directory" && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-xl z-50">
          <div className="container py-8 grid grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 text-forest mb-4 pb-3 border-b border-border">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[0.68rem] tracking-[0.18em] uppercase font-medium">By Category</span>
              </div>
              {[
                { label: "Serviced Apartments", href: "/search?category=Serviced+Apartment", icon: <Building2 className="w-4 h-4" />, desc: "Full apartment with hotel services" },
                { label: "Aparthotels", href: "/search?category=Aparthotel", icon: <Hotel className="w-4 h-4" />, desc: "Hybrid hotel & apartment format" },
                { label: "Residences", href: "/search?category=Residence", icon: <Home className="w-4 h-4" />, desc: "Private residential-style stays" },
                { label: "Penthouses", href: "/search?category=Penthouse", icon: <Crown className="w-4 h-4" />, desc: "Premium top-floor suites" },
              ].map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setActiveMega(null)} className="flex items-start gap-3 group py-2 px-2 -mx-2 rounded-sm hover:bg-ivory-warm">
                  <div className="mt-0.5 text-muted-foreground group-hover:text-forest">{l.icon}</div>
                  <div>
                    <div className="font-serif text-[0.95rem] group-hover:text-forest leading-tight">{l.label}</div>
                    <div className="text-[0.7rem] text-muted-foreground mt-0.5">{l.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-2 text-forest mb-4 pb-3 border-b border-border">
                <Star className="w-3.5 h-3.5" />
                <span className="text-[0.68rem] tracking-[0.18em] uppercase font-medium">Best For</span>
              </div>
              {[
                { label: "Best for Executives", href: "/search?bestFor=executives", icon: <Briefcase className="w-3.5 h-3.5" /> },
                { label: "Best for Families", href: "/search?bestFor=families", icon: <Users className="w-3.5 h-3.5" /> },
                { label: "Extended Stays", href: "/search?bestFor=extended", icon: <Heart className="w-3.5 h-3.5" /> },
                { label: "Pet Friendly", href: "/search?bestFor=pets", icon: <PawPrint className="w-3.5 h-3.5" /> },
              ].map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setActiveMega(null)} className="flex items-center gap-3 group py-2 px-2 -mx-2 rounded-sm hover:bg-ivory-warm">
                  <div className="text-muted-foreground group-hover:text-forest">{l.icon}</div>
                  <span className="font-serif text-[0.95rem] group-hover:text-forest">{l.label}</span>
                </Link>
              ))}
            </div>
            <div className="bg-ivory-warm border border-border p-5 rounded-sm">
              <div className="flex items-center gap-2 text-forest mb-3">
                <Search className="w-4 h-4" />
                <span className="text-[0.68rem] tracking-[0.18em] uppercase font-medium">Quick Search</span>
              </div>
              <p className="font-serif text-[0.9rem] text-muted-foreground leading-relaxed mb-5">
                Filter source-backed residences by location, type, and stay requirements.
              </p>
              <Link href="/search" onClick={() => setActiveMega(null)} className="inline-flex items-center gap-2 text-sm border border-charcoal px-4 py-2 hover:bg-charcoal hover:text-ivory font-medium">
                Open Directory <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeMega === "resources" && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-xl z-50">
          <div className="container py-8 grid grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 text-forest mb-4 pb-3 border-b border-border">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="text-[0.68rem] tracking-[0.18em] uppercase font-medium">Resources</span>
              </div>
              {[
                { label: "Guides & Intelligence", href: "/resources", icon: <BookOpen className="w-4 h-4" />, desc: "In-depth market guides" },
                { label: "Stay Calculator", href: "/resources#calculator", icon: <Calculator className="w-4 h-4" />, desc: "Compare costs vs hotels" },
                { label: "Visa & Entry Guide", href: "/resources#visa", icon: <Plane className="w-4 h-4" />, desc: "Entry requirements by city" },
                { label: "Operator Standards", href: "/resources#standards", icon: <FileText className="w-4 h-4" />, desc: "SAparts quality criteria" },
              ].map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setActiveMega(null)} className="flex items-start gap-3 group py-2 px-2 -mx-2 rounded-sm hover:bg-ivory-warm">
                  <div className="mt-0.5 text-muted-foreground group-hover:text-forest">{l.icon}</div>
                  <div>
                    <div className="font-serif text-[0.95rem] group-hover:text-forest leading-tight">{l.label}</div>
                    <div className="text-[0.7rem] text-muted-foreground mt-0.5">{l.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-2 text-forest mb-4 pb-3 border-b border-border">
                <Briefcase className="w-3.5 h-3.5" />
                <span className="text-[0.68rem] tracking-[0.18em] uppercase font-medium">For Corporates</span>
              </div>
              {[
                { label: "Corporate Travel Policy", href: "/corporate" },
                { label: "HR Mobility Teams", href: "/corporate#mobility" },
                { label: "Submit an RFI", href: "/corporate#rfi" },
              ].map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setActiveMega(null)} className="flex items-center gap-3 group py-2 px-2 -mx-2 rounded-sm hover:bg-ivory-warm">
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground group-hover:text-forest" />
                  <span className="font-serif text-[0.95rem] group-hover:text-forest">{l.label}</span>
                </Link>
              ))}
            </div>
            <div className="bg-ivory-warm border border-border p-5 rounded-sm">
              <div className="flex items-center gap-2 text-forest mb-3">
                <Calculator className="w-4 h-4" />
                <span className="text-[0.68rem] tracking-[0.18em] uppercase font-medium">Stay Calculator</span>
              </div>
              <p className="font-serif text-[0.9rem] text-muted-foreground leading-relaxed mb-5">
                Calculate your savings vs hotel for any city and stay length.
              </p>
              <Link href="/resources#calculator" onClick={() => setActiveMega(null)} className="inline-flex items-center gap-2 text-sm border border-charcoal px-4 py-2 hover:bg-charcoal hover:text-ivory font-medium">
                Open Calculator <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeMega === "journal" && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-xl z-50">
          <div className="container py-8 grid grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 text-forest mb-4 pb-3 border-b border-border">
                <Newspaper className="w-3.5 h-3.5" />
                <span className="text-[0.68rem] tracking-[0.18em] uppercase font-medium">Categories</span>
              </div>
              {[
                { label: "City Reports", href: "/insights?cat=city", icon: <Map className="w-4 h-4" /> },
                { label: "Relocation Guides", href: "/insights?cat=relocation", icon: <Plane className="w-4 h-4" /> },
                { label: "Corporate Mobility", href: "/insights?cat=corporate", icon: <Briefcase className="w-4 h-4" /> },
                { label: "Lifestyle", href: "/insights?cat=lifestyle", icon: <Coffee className="w-4 h-4" /> },
                { label: "Market Intelligence", href: "/insights?cat=market", icon: <TrendingUp className="w-4 h-4" /> },
              ].map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setActiveMega(null)} className="flex items-center gap-3 group py-2 px-2 -mx-2 rounded-sm hover:bg-ivory-warm">
                  <div className="text-muted-foreground group-hover:text-forest">{l.icon}</div>
                  <span className="font-serif text-[0.95rem] group-hover:text-forest">{l.label}</span>
                </Link>
              ))}
            </div>
            <div className="col-span-2 bg-ivory-warm border border-border p-5 rounded-sm">
              <div className="flex items-center gap-2 text-forest mb-4">
                <BookOpen className="w-4 h-4" />
                <span className="text-[0.68rem] tracking-[0.18em] uppercase font-medium">From the Journal</span>
              </div>
              <Link href="/insights/relocating-to-london" onClick={() => setActiveMega(null)} className="flex gap-4 group">
                <div className="w-16 h-16 bg-ivory-warm rounded-sm shrink-0 flex items-center justify-center">
                  <Map className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[0.65rem] tracking-wider uppercase text-forest font-medium">Relocation</span>
                    <span className="text-muted-foreground text-[0.65rem]">· 8 min read</span>
                  </div>
                  <div className="font-serif text-[0.95rem] group-hover:text-forest leading-snug">
                    Relocating to London — The Serviced Apartment Playbook for Finance Executives
                  </div>
                </div>
              </Link>
              <div className="border-t border-border my-4" />
              <Link href="/insights/kitchen-test" onClick={() => setActiveMega(null)} className="flex gap-4 group">
                <div className="w-16 h-16 bg-ivory-warm rounded-sm shrink-0 flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[0.65rem] tracking-wider uppercase text-forest font-medium">Lifestyle</span>
                    <span className="text-muted-foreground text-[0.65rem]">· 6 min read</span>
                  </div>
                  <div className="font-serif text-[0.95rem] group-hover:text-forest leading-snug">
                    The Kitchen Test — Why Serviced Apartments Are Beating Hotels for Long Stays
                  </div>
                </div>
              </Link>
              <Link href="/insights" onClick={() => setActiveMega(null)} className="mt-5 inline-flex items-center gap-1.5 text-[0.72rem] tracking-wider uppercase text-forest hover:underline font-medium">
                All articles <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container py-6 flex flex-col gap-4">
            {[
              ["/cities", "Atlas"],
              ["/search", "Directory"],
              ["/collections", "Collections"],
              ["/resources", "Resources"],
              ["/insights", "Journal"],
              ["/awards", "Awards"],
              ["/corporate", "Corporate"],
              ["/account/shortlists", "My Shortlists"],
              ["/about", "About"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="text-sm font-medium text-charcoal hover:text-forest">{label}</Link>
            ))}
            <Link href="/operators" className="mt-2 inline-flex items-center justify-center px-4 py-3 text-sm border border-charcoal">
              List a property →︎
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
