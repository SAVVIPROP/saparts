import type { Metadata } from "next";
import Link from "next/link";
import { ShortlistsClient } from "./ShortlistsClient";

export const metadata: Metadata = {
  title: "Shortlists",
  description: "Your SAparts reading list — stored in this browser, no login.",
};

export default function ShortlistsPage() {
  return (
    <div>
      <section className="hairline-bottom">
        <div className="container py-3 flex items-center gap-2 tracker-muted">
          <Link href="/" className="hover:text-forest">SAparts</Link>
          <span>/</span>
          <span>Shortlists</span>
        </div>
      </section>
      <section className="hairline-bottom">
        <div className="container py-12 lg:py-16">
          <span className="section-mark">Reading list</span>
          <h1 className="display text-[3rem] sm:text-[4.2rem] mt-5">
            Shortlists, <em>on this device.</em>
          </h1>
          <p className="mt-5 font-serif text-[1.1rem] text-muted-foreground max-w-2xl leading-relaxed">
            Bookmarks are stored in localStorage. There is no account wall. A share link encodes slugs only — anyone with the URL can open the same residences from the register.
          </p>
        </div>
      </section>
      <section>
        <div className="container py-12">
          <ShortlistsClient />
        </div>
      </section>
    </div>
  );
}
