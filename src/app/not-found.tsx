import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container py-28 lg:py-36">
      <div className="max-w-2xl">
        <span className="section-mark">404</span>
        <h1 className="display text-[3rem] sm:text-[4.5rem] mt-6 leading-[0.95]">
          This folio is not in the <em>register.</em>
        </h1>
        <p className="mt-6 font-serif text-[1.15rem] text-muted-foreground leading-relaxed">
          The page may have moved, the listing has left the pack, or the city is still forthcoming. We will not invent a destination to fill the gap.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn-primary">Return home</Link>
          <Link href="/search" className="btn-outline">Browse the directory</Link>
          <Link href="/cities" className="btn-ghost">Open the atlas</Link>
        </div>
      </div>
    </section>
  );
}
