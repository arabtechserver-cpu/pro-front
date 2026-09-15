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
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldShow = window.scrollY > 250;
          setShowScrollTop((prev) => (prev !== shouldShow ? shouldShow : prev));
          ticking = false;
        });
        ticking = true;
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
          aria-label={isAr ? "دعم واتساب الفوري" : "WhatsApp Support"}
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
          aria-label={isAr ? "قناة تيليجرام الرسمية" : "Telegram Channel"}
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
          aria-label={isAr ? "صفحة الفيسبوك" : "Facebook Page"}
          className="group flex items-center bg-[#1877F2] hover:bg-[#166fe5] text-white p-2.5 sm:p-3 rounded-r-2xl shadow-[0_4px_15px_rgba(24,119,242,0.4)] transition-all duration-300 hover:translate-x-1.5 hover:shadow-[0_6px_22px_rgba(24,119,242,0.6)]"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>

        {/* AI Support Robot Mascot Tab (Directly Under Facebook) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("toggle-ai-chat"));
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("toggle-ai-chat"));
              }
            }
          }}
          title={isAr ? "المساعد الذكي AI 24/7" : "AI Support Assistant"}
          className="flex items-center justify-center group select-none hover:scale-110 active:scale-95 cursor-pointer pt-1 pl-0.5 transition-transform"
          aria-label={isAr ? "المساعد الذكي AI 24/7" : "Open AI Support Chat"}
        >
          {/* Animated 3D/Vector Cyber Robot Mascot */}
          <div className="relative w-12 h-16 sm:w-16 sm:h-20 flex items-center justify-center filter drop-shadow-[0_6px_16px_rgba(14,165,233,0.5)] group-hover:drop-shadow-[0_10px_24px_rgba(14,165,233,0.8)] transition-all shrink-0">
            <div className="absolute bottom-0.5 w-9 sm:w-12 h-2.5 rounded-full bg-cyan-500/30 blur-md animate-pulse pointer-events-none" />
            <svg
              viewBox="0 0 120 160"
              className="w-full h-full animate-[bounce_3s_ease-in-out_infinite] pointer-events-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="60" y1="12" x2="60" y2="28" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              <circle cx="60" cy="10" r="5" fill="#38bdf8" className="animate-pulse" />
              <circle cx="60" cy="10" r="8" fill="#38bdf8" opacity="0.4" className="animate-ping" />
              <rect x="22" y="38" width="9" height="18" rx="4.5" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1.5" />
              <rect x="89" y="38" width="9" height="18" rx="4.5" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1.5" />
              <rect x="30" y="26" width="60" height="42" rx="16" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
              <rect x="36" y="34" width="48" height="24" rx="10" fill="#082f49" stroke="#0ea5e9" strokeWidth="1.5" />
              <ellipse cx="48" cy="46" rx="4.5" ry="6" fill="#38bdf8">
                <animate attributeName="ry" values="6;6;0.5;6;6" dur="3s" repeatCount="indefinite" />
              </ellipse>
              <circle cx="50" cy="44" r="1.5" fill="#ffffff" />
              <ellipse cx="72" cy="46" rx="4.5" ry="6" fill="#38bdf8">
                <animate attributeName="ry" values="6;6;0.5;6;6" dur="3s" repeatCount="indefinite" />
              </ellipse>
              <circle cx="74" cy="44" r="1.5" fill="#ffffff" />
              <path d="M52 52 Q60 57 68 52" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <rect x="53" y="68" width="14" height="8" rx="2" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
              <path d="M36 76 L84 76 L78 114 L42 114 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="60" cy="94" r="9" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="60" cy="94" r="5" fill="#38bdf8" className="animate-pulse" />
              <circle cx="60" cy="94" r="2" fill="#ffffff" />
              <line x1="44" y1="84" x2="52" y2="84" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="68" y1="84" x2="76" y2="84" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
              <g className="origin-[36px_80px]">
                <circle cx="36" cy="80" r="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                <path d="M36 80 Q18 68 20 48" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" fill="none">
                  <animateTransform attributeName="transform" type="rotate" values="0 36 80; 12 36 80; -8 36 80; 0 36 80" dur="2s" repeatCount="indefinite" />
                </path>
                <circle cx="20" cy="46" r="5.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5">
                  <animateTransform attributeName="transform" type="rotate" values="0 36 80; 12 36 80; -8 36 80; 0 36 80" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
              <circle cx="84" cy="80" r="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              <path d="M84 80 Q98 94 94 106" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" fill="none" />
              <circle cx="94" cy="108" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
              <rect x="42" y="114" width="36" height="6" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
              <path d="M46 120 L54 120 L52 130 L48 130 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <path d="M66 120 L74 120 L72 130 L68 130 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <path d="M48 130 Q50 146 52 130" fill="#38bdf8" className="animate-pulse" />
              <path d="M68 130 Q70 146 72 130" fill="#38bdf8" className="animate-pulse" />
              <path d="M49 130 Q50 140 51 130" fill="#ffffff" />
              <path d="M69 130 Q70 140 71 130" fill="#ffffff" />
            </svg>
          </div>
        </div>
      </aside>

      {/* ── 2. SCROLL TO TOP FLOATING BUTTON (BOTTOM CORNER) ── */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label={isAr ? "الرجوع لأعلى الصفحة" : "Scroll to top"}
          className="fixed bottom-5 left-4 sm:bottom-8 sm:left-8 z-40 w-12 h-12 rounded-full bg-violet-500 hover:bg-violet-400 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(124,58,237,0.6)] transition-all duration-300 hover:scale-110 active:scale-90 animate-in fade-in zoom-in-75 relative group"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-40 pointer-events-none"></span>
          <span className="material-symbols-outlined text-2xl font-bold group-hover:-translate-y-0.5 transition-transform">keyboard_arrow_up</span>
        </button>
      )}
    </>
  );
}
