import Link from "next/link";

export function Breadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <section className="hairline-bottom">
      <div className="container py-4 flex flex-wrap items-center gap-3 tracker-muted">
        <Link href="/" className="hover:text-forest">
          SAparts
        </Link>
        {items.map((item) => (
          <span key={item.label} className="flex items-center gap-3">
            <span>/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-forest">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}
