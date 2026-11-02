"use client";

import { usePathname } from "next/navigation";

export default function LoadingPage() {
  const isEnglish = usePathname().startsWith("/en");
  return <div role="status" aria-live="polite" className="min-h-[45vh] flex flex-col items-center justify-center gap-4 text-on-surface-variant">
    <span aria-hidden="true" className="h-9 w-9 rounded-full border-2 border-outline-variant border-t-primary animate-spin" />
    <p className="text-sm">{isEnglish ? "Opening your page…" : "جارٍ فتح الصفحة…"}</p>
  </div>;
}
