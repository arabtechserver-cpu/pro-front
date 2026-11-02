"use client";

export default function CatalogPager({ page, pageCount, onPageChange, lang, label }: {
  page: number; pageCount: number; onPageChange: (page: number) => void; lang: string; label: string;
}) {
  if (pageCount <= 1) return null;
  const ar = lang === "ar";
  return <nav aria-label={label} className="flex items-center justify-center gap-4 p-4 text-sm">
    <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-xl border border-outline-variant px-4 py-2 text-on-surface disabled:opacity-40">{ar ? "السابق" : "Previous"}</button>
    <span role="status" aria-live="polite" className="text-on-surface-variant">{page} / {pageCount}</span>
    <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} className="rounded-xl bg-primary px-4 py-2 text-on-primary disabled:opacity-40">{ar ? "التالي" : "Next"}</button>
  </nav>;
}
