import Link from "next/link";

export function Pagination({
  page,
  pages,
  hrefFor,
}: {
  page: number;
  pages: number;
  hrefFor: (page: number) => string;
}) {
  if (pages <= 1) return null;
  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className="btn-outline">
          Previous
        </Link>
      )}
      <span className="tracker-muted">
        Page {page} of {pages}
      </span>
      {page < pages && (
        <Link href={hrefFor(page + 1)} className="btn-outline">
          Next
        </Link>
      )}
    </div>
  );
}
