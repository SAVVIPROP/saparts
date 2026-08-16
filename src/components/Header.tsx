"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "./Wordmark";

const NAV = [
  { href: "/cities", label: "Cities" },
  { href: "/search", label: "Directory" },
  { href: "/collections", label: "Collections" },
  { href: "/corporate", label: "Corporate" },
  { href: "/operators", label: "Operators" },
  { href: "/resources", label: "Resources" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm hairline-bottom">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" aria-label="SAparts home" onClick={() => setOpen(false)}>
          <Wordmark size="md" />
        </Link>
        <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href || pathname.startsWith(item.href + "/") ? "text-forest" : ""}`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/search" className="btn-primary">
            Search the atlas
          </Link>
        </nav>
        <button
          type="button"
          className="lg:hidden tracker"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <div id="mobile-nav" className="lg:hidden hairline-top bg-background">
          <nav className="container py-4 flex flex-col gap-3" aria-label="Mobile">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link text-lg" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link href="/contact" className="btn-primary mt-2 w-fit" onClick={() => setOpen(false)}>
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
