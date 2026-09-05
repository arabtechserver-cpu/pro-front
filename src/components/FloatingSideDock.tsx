"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface FloatingSideDockProps {
  lang?: string;
}

export default function FloatingSideDock({ lang = "ar" }: FloatingSideDockProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const pathname = usePathname();
  const isAr = lang === "ar";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hide on admin routes
  if (pathname && pathname.includes("/admin")) {
    return null;
  }

  return (
    <>
      {/* ── 1. FLOATING SIDE SOCIAL TABS (LEFT SCREEN EDGE) ── */}
      <aside 
        aria-label={isAr ? "قنوات التواصل السريع" : "Quick Social Channels"}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-start gap-1.5 pointer-events-auto select-none"
      >
        {/* WhatsApp Tab */}
        <a
          href="https://wa.me/16728972935"
          target="_blank"
          rel="noopener noreferrer"
          title="WhatsApp Support"
          className="group flex items-center bg-[#25D366] hover:bg-[#20bd5a] text-white p-2.5 sm:p-3 rounded-r-2xl shadow-[0_4px_15px_rgba(37,211,102,0.4)] transition-all duration-300 hover:translate-x-1.5 hover:shadow-[0_6px_22px_rgba(37,211,102,0.6)]"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.148-1.348c1.472.802 3.13 1.224 4.863 1.225h.005c5.505 0 9.989-4.478 9.99-9.985 0-2.668-1.039-5.176-2.927-7.062A9.923 9.923 0 0 0 12.012 2zm.005 16.521h-.004c-1.493 0-2.957-.401-4.232-1.157l-.304-.18-3.146.825.839-3.067-.198-.315c-.832-1.323-1.272-2.859-1.272-4.436 0-4.492 3.656-8.147 8.152-8.147 2.176 0 4.221.848 5.76 2.387a8.096 8.096 0 0 1 2.384 5.763c0 4.493-3.656 8.147-8.152 8.147zm4.469-6.108c-.245-.123-1.452-.716-1.677-.798-.225-.082-.389-.123-.553.123-.164.246-.635.798-.778.962-.143.164-.286.184-.531.062-.245-.123-1.037-.382-1.976-1.219-.73-.651-1.223-1.455-1.366-1.7-.143-.246-.015-.379.108-.501.111-.11.245-.286.368-.429.123-.143.164-.246.245-.409.082-.164.041-.307-.02-.429-.062-.123-.553-1.332-.757-1.822-.204-.49-.409-.419-.553-.429h-.471c-.164 0-.429.062-.654.307-.225.246-.86.84-.86 2.05 0 1.209.88 2.373 1.002 2.537.123.164 1.733 2.646 4.198 3.712.586.254 1.044.406 1.401.52.59.187 1.127.16 1.551.097.473-.07 1.452-.593 1.656-1.166.204-.573.204-1.064.143-1.166-.061-.102-.225-.164-.47-.287z"/>
          </svg>
        </a>

        {/* Telegram Tab */}
        <a
          href="https://t.me/arabtechserveronline"
          target="_blank"
          rel="noopener noreferrer"
          title="Telegram Channel"
          className="group flex items-center bg-[#0088cc] hover:bg-[#007ab8] text-white p-2.5 sm:p-3 rounded-r-2xl shadow-[0_4px_15px_rgba(0,136,204,0.4)] transition-all duration-300 hover:translate-x-1.5 hover:shadow-[0_6px_22px_rgba(0,136,204,0.6)]"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.763-.169.711-.43 1.05-.683 1.073-.55.05-1.042-.366-1.575-.716-.834-.547-1.306-.888-2.116-1.421-.937-.618-.329-.958.204-1.512.14-.145 2.569-2.356 2.616-2.557.006-.025.011-.122-.047-.173-.058-.051-.144-.034-.206-.02-.089.02-1.501.954-4.238 2.802-.401.275-.764.41-1.089.403-.358-.008-1.047-.202-1.56-.369-.629-.205-1.129-.313-1.085-.661.023-.182.274-.369.753-.561 2.955-1.287 4.927-2.137 5.914-2.548 2.822-1.173 3.407-1.377 3.79-1.384.084-.001.272.02.394.119.103.084.132.197.145.276.014.08.03.26-.002.434z"/>
          </svg>
        </a>

        {/* Facebook Tab */}
        <a
          href="https://www.facebook.com/ARABTECHSERVEROnline"
          target="_blank"
          rel="noopener noreferrer"
          title="Facebook Page"
          className="group flex items-center bg-[#1877F2] hover:bg-[#166fe5] text-white p-2.5 sm:p-3 rounded-r-2xl shadow-[0_4px_15px_rgba(24,119,242,0.4)] transition-all duration-300 hover:translate-x-1.5 hover:shadow-[0_6px_22px_rgba(24,119,242,0.6)]"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
      </aside>

      {/* ── 2. SCROLL TO TOP FLOATING BUTTON (BOTTOM CORNER) ── */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label={isAr ? "الرجوع لأعلى الصفحة" : "Scroll to top"}
          className="fixed bottom-5 left-4 sm:bottom-8 sm:left-8 z-40 w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(16,185,129,0.6)] transition-all duration-300 hover:scale-110 active:scale-90 animate-in fade-in zoom-in-75 relative group"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40 pointer-events-none"></span>
          <span className="material-symbols-outlined text-2xl font-bold group-hover:-translate-y-0.5 transition-transform">keyboard_arrow_up</span>
        </button>
      )}
    </>
  );
}
