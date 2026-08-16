import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container py-28 text-center">
      <span className="section-mark">404</span>
      <h1 className="display text-5xl mt-6">This folio is not in the register.</h1>
      <p className="mt-4 text-muted-foreground">The page may have moved, or the listing has not yet been imported.</p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/" className="btn-primary">
          Return home
        </Link>
        <Link href="/search" className="btn-outline">
          Browse the directory
        </Link>
      </div>
    </section>
  );
}
