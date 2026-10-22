import Link from "next/link";

export default function Pagination({
  page,
  pages,
  params,
}: {
  page: number;
  pages: number;
  params: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v && k !== "page") sp.set(k, v);
    });
    sp.set("page", String(p));
    return `/events?${sp.toString()}`;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4 mt-10">
      {page > 1 ? <Link href={href(page - 1)} rel="prev">← Previous</Link> : <span className="text-white/30">← Previous</span>}
      <span className="text-white/70">Page {page} of {pages}</span>
      {page < pages ? <Link href={href(page + 1)} rel="next">Next →</Link> : <span className="text-white/30">Next →</span>}
    </nav>
  );
}