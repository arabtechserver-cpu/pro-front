"use client";

import { usePathname } from "next/navigation";
import { useState, useRef } from "react";

interface SocialLink {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  url: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "wa1",
    titleAr: "واتساب الإدارة 1",
    titleEn: "WhatsApp Admin 1",
    descAr: "+1 (672) 897-2935",
    descEn: "+1 (672) 897-2935",
    url: "https://wa.me/16728972935",
    color: "#25D366",
    bg: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.148-1.348c1.472.802 3.13 1.224 4.863 1.225h.005c5.505 0 9.989-4.478 9.99-9.985 0-2.668-1.039-5.176-2.927-7.062A9.923 9.923 0 0 0 12.012 2zm.005 16.521h-.004c-1.493 0-2.957-.401-4.232-1.157l-.304-.18-3.146.825.839-3.067-.198-.315c-.832-1.323-1.272-2.859-1.272-4.436 0-4.492 3.656-8.147 8.152-8.147 2.176 0 4.221.848 5.76 2.387a8.096 8.096 0 0 1 2.384 5.763c0 4.493-3.656 8.147-8.152 8.147zm4.469-6.108c-.245-.123-1.452-.716-1.677-.798-.225-.082-.389-.123-.553.123-.164.246-.635.798-.778.962-.143.164-.286.184-.531.062-.245-.123-1.037-.382-1.976-1.219-.73-.651-1.223-1.455-1.366-1.7-.143-.246-.015-.379.108-.501.111-.11.245-.286.368-.429.123-.143.164-.246.245-.409.082-.164.041-.307-.02-.429-.062-.123-.553-1.332-.757-1.822-.204-.49-.409-.419-.553-.429h-.471c-.164 0-.429.062-.654.307-.225.246-.86.84-.86 2.05 0 1.209.88 2.373 1.002 2.537.123.164 1.733 2.646 4.198 3.712.586.254 1.044.406 1.401.52.59.187 1.127.16 1.551.097.473-.07 1.452-.593 1.656-1.166.204-.573.204-1.064.143-1.166-.061-.102-.225-.164-.47-.287z"/>
      </svg>
    )
  },
  {
    id: "wa2",
    titleAr: "واتساب الإدارة 2",
    titleEn: "WhatsApp Admin 2",
    descAr: "+249 12 366 7227",
    descEn: "+249 12 366 7227",
    url: "https://wa.me/249123667227",
    color: "#10b981",
    bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.148-1.348c1.472.802 3.13 1.224 4.863 1.225h.005c5.505 0 9.989-4.478 9.99-9.985 0-2.668-1.039-5.176-2.927-7.062A9.923 9.923 0 0 0 12.012 2zm.005 16.521h-.004c-1.493 0-2.957-.401-4.232-1.157l-.304-.18-3.146.825.839-3.067-.198-.315c-.832-1.323-1.272-2.859-1.272-4.436 0-4.492 3.656-8.147 8.152-8.147 2.176 0 4.221.848 5.76 2.387a8.096 8.096 0 0 1 2.384 5.763c0 4.493-3.656 8.147-8.152 8.147zm4.469-6.108c-.245-.123-1.452-.716-1.677-.798-.225-.082-.389-.123-.553.123-.164.246-.635.798-.778.962-.143.164-.286.184-.531.062-.245-.123-1.037-.382-1.976-1.219-.73-.651-1.223-1.455-1.366-1.7-.143-.246-.015-.379.108-.501.111-.11.245-.286.368-.429.123-.143.164-.246.245-.409.082-.164.041-.307-.02-.429-.062-.123-.553-1.332-.757-1.822-.204-.49-.409-.419-.553-.429h-.471c-.164 0-.429.062-.654.307-.225.246-.86.84-.86 2.05 0 1.209.88 2.373 1.002 2.537.123.164 1.733 2.646 4.198 3.712.586.254 1.044.406 1.401.52.59.187 1.127.16 1.551.097.473-.07 1.452-.593 1.656-1.166.204-.573.204-1.064.143-1.166-.061-.102-.225-.164-.47-.287z"/>
      </svg>
    )
  },
  {
    id: "comm",
    titleAr: "مجتمع وقناة الواتساب",
    titleEn: "WhatsApp Community",
    descAr: "انضم لمجتمع الفنيين",
    descEn: "Join Tech Community",
    url: "https://chat.whatsapp.com/DINRDwU2lVjFcGRowxT3m5",
    color: "#34d399",
    bg: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    )
  },
  {
    id: "tg",
    titleAr: "قناة وتحديثات تيليجرام",
    titleEn: "Telegram Updates Channel",
    descAr: "@arabtechserveronline",
    descEn: "@arabtechserveronline",
    url: "https://t.me/arabtechserveronline",
    color: "#0088cc",
    bg: "linear-gradient(135deg, #0088cc 0%, #006699 100%)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.763-.169.711-.43 1.05-.683 1.073-.55.05-1.042-.366-1.575-.716-.834-.547-1.306-.888-2.116-1.421-.937-.618-.329-.958.204-1.512.14-.145 2.569-2.356 2.616-2.557.006-.025.011-.122-.047-.173-.058-.051-.144-.034-.206-.02-.089.02-1.501.954-4.238 2.802-.401.275-.764.41-1.089.403-.358-.008-1.047-.202-1.56-.369-.629-.205-1.129-.313-1.085-.661.023-.182.274-.369.753-.561 2.955-1.287 4.927-2.137 5.914-2.548 2.822-1.173 3.407-1.377 3.79-1.384.084-.001.272.02.394.119.103.084.132.197.145.276.014.08.03.26-.002.434z"/>
      </svg>
    )
  },
  {
    id: "tg_support",
    titleAr: "دعم تيليجرام المباشر",
    titleEn: "Direct Telegram Support",
    descAr: "@ARABTECHSUPPURT2",
    descEn: "@ARABTECHSUPPURT2",
    url: "https://t.me/ARABTECHSUPPURT2",
    color: "#38bdf8",
    bg: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    )
  },
  {
    id: "fb",
    titleAr: "صفحة الفيسبوك الرسمية",
    titleEn: "Official Facebook Page",
    descAr: "ARABTECHSERVEROnline",
    descEn: "ARABTECHSERVEROnline",
    url: "https://www.facebook.com/ARABTECHSERVEROnline",
    color: "#1877F2",
    bg: "linear-gradient(135deg, #1877F2 0%, #0056b3 100%)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  },
  {
    id: "tt",
    titleAr: "حساب التيك توك",
    titleEn: "TikTok Account",
    descAr: "@arabtechsuppurt",
    descEn: "@arabtechsuppurt",
    url: "https://tiktok.com/@arabtechsuppurt",
    color: "#fe2c55",
    bg: "linear-gradient(135deg, #111827 0%, #fe2c55 100%)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 2.378A6.347 6.347 0 0 0 3.5 15.672a6.35 6.35 0 0 0 10.84 4.492V12.38a8.217 8.217 0 0 0 5.25 1.862V10.8a4.79 4.79 0 0 1-3.77-4.114z"/>
      </svg>
    )
  },
  {
    id: "mail",
    titleAr: "البريد الإلكتروني الرسمي",
    titleEn: "Official Email Support",
    descAr: "arabtechserver@gmail.com",
    descEn: "arabtechserver@gmail.com",
    url: "mailto:arabtechserver@gmail.com",
    color: "#ea4335",
    bg: "linear-gradient(135deg, #ea4335 0%, #c5221f 100%)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
    )
  }
];

export default function ContactFloatingButton({ lang = "ar" }: { lang?: string }) {
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pathname = usePathname();
  const isAr = lang === "ar";
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    moved: false,
  });

  // Handle Dragging via Pointer Events (Touch & Mouse)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: dragPos ? dragPos.x : rect.left,
      initialY: dragPos ? dragPos.y : rect.top,
      moved: false,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - dragRef.current.startX;
      const deltaY = moveEvent.clientY - dragRef.current.startY;

      if (Math.hypot(deltaX, deltaY) > 8) {
        dragRef.current.moved = true;
        setIsDragging(true);

        const newX = Math.max(8, Math.min(window.innerWidth - 90, dragRef.current.initialX + deltaX));
        const newY = Math.max(8, Math.min(window.innerHeight - 110, dragRef.current.initialY + deltaY));
        setDragPos({ x: newX, y: newY });
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      setTimeout(() => setIsDragging(false), 50);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleButtonClick = () => {
    if (!dragRef.current.moved) {
      setOpen((prev) => !prev);
    }
  };

  if (pathname && (pathname.includes("/admin") || pathname.includes("/login") || pathname.includes("/register"))) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`fixed z-[9999] flex flex-col-reverse items-center select-none ${
        dragPos ? "" : isAr ? "bottom-5 left-3 sm:bottom-8 sm:left-6" : "bottom-5 right-3 sm:bottom-8 sm:right-6"
      }`}
      style={
        dragPos
          ? {
              left: `${dragPos.x}px`,
              top: `${dragPos.y}px`,
              cursor: isDragging ? "grabbing" : "grab",
              transition: isDragging ? "none" : "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }
          : {
              cursor: "grab",
            }
      }
    >
      {/* ── MAIN FULL-BODY SUPPORT AGENT MASCOT ── */}
      <div
        onPointerDown={handlePointerDown}
        onClick={handleButtonClick}
        className={`relative flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 group cursor-pointer select-none touch-none ${
          isDragging ? "scale-110 drop-shadow-[0_20px_35px_rgba(16,185,129,0.8)]" : "hover:scale-105 active:scale-95"
        }`}
      >
        {/* Interactive Speech Bubble Prompt (Mobile & Desktop Responsive) */}
        {!open && (
          <div className="flex flex-col items-center sm:items-start bg-[#0b0f19]/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl px-2.5 py-1 sm:px-3.5 sm:py-2 shadow-[0_8px_25px_rgba(0,0,0,0.6)] group-hover:border-emerald-400 transition-all pointer-events-none mb-1 sm:mb-0">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-black text-white whitespace-nowrap">
                {isAr ? "خدمة العملاء" : "Customer Care"}
              </span>
            </div>
            <div className="hidden sm:flex text-[9px] sm:text-[10px] text-emerald-300 font-medium items-center gap-1 mt-0.5">
              <span>{isAr ? "تواصل مباشر" : "Live Chat"}</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-1 rounded font-mono text-[8px]">7 قنوات</span>
            </div>
          </div>
        )}

        {/* Full-Body Vector Support Mascot Character */}
        <div className="relative w-14 h-18 sm:w-20 sm:h-24 flex items-center justify-center filter drop-shadow-[0_6px_16px_rgba(16,185,129,0.5)] group-hover:drop-shadow-[0_10px_24px_rgba(16,185,129,0.8)] transition-all">
          
          {/* Glowing Base Platform */}
          <div className="absolute bottom-0.5 w-10 sm:w-14 h-3 rounded-full bg-emerald-500/30 blur-md animate-pulse pointer-events-none"></div>

          {open ? (
            /* Close Trigger Circular Badge when Opened */
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 border-2 border-white/70 shadow-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl animate-spin-once">
              ✕
            </div>
          ) : (
            /* Full-Body Friendly Support Mascot SVG */
            <svg
              viewBox="0 0 120 160"
              className="w-full h-full animate-[bounce_3.2s_ease-in-out_infinite] pointer-events-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* ── 1. PRO HEADSET ARC ── */}
              <path
                d="M26 44 C26 16 94 16 94 44"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Headset Cushions */}
              <rect x="20" y="36" width="9" height="18" rx="4.5" fill="#047857" stroke="#6ee7b7" strokeWidth="1.5" />
              <rect x="91" y="36" width="9" height="18" rx="4.5" fill="#047857" stroke="#6ee7b7" strokeWidth="1.5" />

              {/* ── 2. HEAD & FACE ── */}
              {/* Cute Cap / Hair */}
              <path d="M32 38 C32 20 88 20 88 38 Z" fill="#065f46" stroke="#10b981" strokeWidth="1.5" />
              
              {/* Face */}
              <rect x="30" y="30" width="60" height="42" rx="18" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
              
              {/* Visor Area */}
              <rect x="36" y="38" width="48" height="22" rx="9" fill="#064e3b" stroke="#34d399" strokeWidth="1" />

              {/* Left Eye (Blinking) */}
              <ellipse cx="48" cy="48" rx="4" ry="5.5" fill="#34d399">
                <animate
                  attributeName="ry"
                  values="5.5;5.5;0.5;5.5;5.5"
                  dur="3.2s"
                  repeatCount="indefinite"
                />
              </ellipse>
              <circle cx="50" cy="46" r="1.5" fill="#ffffff" />

              {/* Right Eye (Blinking) */}
              <ellipse cx="72" cy="48" rx="4" ry="5.5" fill="#34d399">
                <animate
                  attributeName="ry"
                  values="5.5;5.5;0.5;5.5;5.5"
                  dur="3.2s"
                  repeatCount="indefinite"
                />
              </ellipse>
              <circle cx="74" cy="46" r="1.5" fill="#ffffff" />

              {/* Smiling Mouth */}
              <path d="M52 54 Q60 59 68 54" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* Headset Mic Extender & Glowing Green Light */}
              <path d="M25 48 Q28 66 42 64" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="44" cy="64" r="3" fill="#22c55e" className="animate-pulse" />

              {/* ── 3. NECK & COLLAR ── */}
              <rect x="53" y="71" width="14" height="6" rx="2" fill="#1e293b" stroke="#10b981" strokeWidth="1" />

              {/* ── 4. UPPER BODY & UNIFORM ── */}
              {/* Support Suit / Jacket */}
              <path
                d="M34 77 L86 77 L80 115 L40 115 Z"
                fill="#064e3b"
                stroke="#10b981"
                strokeWidth="2"
              />
              {/* Shirt V-Neck & Tie */}
              <path d="M52 77 L60 88 L68 77 Z" fill="#0f172a" stroke="#34d399" strokeWidth="1" />
              <polygon points="58,88 62,88 61,102 59,102" fill="#10b981" />

              {/* Support ID Badge */}
              <rect x="42" y="86" width="10" height="12" rx="2" fill="#0f172a" stroke="#6ee7b7" strokeWidth="1" />
              <line x1="44" y1="90" x2="50" y2="90" stroke="#34d399" strokeWidth="1" />
              <line x1="44" y1="93" x2="48" y2="93" stroke="#6ee7b7" strokeWidth="1" />

              {/* ── 5. LEFT ARM (WAVING / GESTURING) ── */}
              <g className="origin-[34px_80px]">
                <circle cx="34" cy="80" r="4.5" fill="#047857" stroke="#10b981" strokeWidth="1.5" />
                <path d="M34 80 Q16 68 18 48" stroke="#047857" strokeWidth="4" strokeLinecap="round" fill="none">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0 34 80; 12 34 80; -8 34 80; 0 34 80"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </path>
                {/* Waving Hand */}
                <circle cx="18" cy="46" r="5" fill="#34d399" stroke="#ffffff" strokeWidth="1.5">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0 34 80; 12 34 80; -8 34 80; 0 34 80"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>

              {/* ── 6. RIGHT ARM (HOLDING SMARTPHONE) ── */}
              <circle cx="86" cy="80" r="4.5" fill="#047857" stroke="#10b981" strokeWidth="1.5" />
              <path d="M86 80 Q96 92 90 106" stroke="#047857" strokeWidth="4" strokeLinecap="round" fill="none" />
              {/* Phone in Hand */}
              <rect x="86" y="98" width="10" height="15" rx="2" fill="#0f172a" stroke="#25D366" strokeWidth="1.5" />
              <circle cx="91" cy="105" r="2" fill="#25D366" className="animate-pulse" />

              {/* ── 7. LEGS & SNEAKERS ── */}
              <line x1="48" y1="115" x2="48" y2="134" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
              <line x1="72" y1="115" x2="72" y2="134" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />

              {/* Cute Tech Sneakers */}
              <rect x="42" y="132" width="14" height="7" rx="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
              <rect x="66" y="132" width="14" height="7" rx="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1" />

              {/* Energy Thruster Glow Under Shoes */}
              <ellipse cx="49" cy="142" rx="8" ry="2.5" fill="#34d399" className="animate-pulse" />
              <ellipse cx="73" cy="142" rx="8" ry="2.5" fill="#34d399" className="animate-pulse" />
            </svg>
          )}
        </div>
      </div>

      {/* ── EXPANDED POPUP SPEED DIAL OF CHANNELS ── */}
      {open && (
        <div
          className="flex flex-col-reverse gap-2.5 items-center mb-3 max-h-[55vh] overflow-y-auto p-1.5 scrollbar-none"
          style={{
            animation: "fadeInUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Header Banner Inside Pop-up */}
          <div className="px-3 py-1 rounded-xl bg-surface-container-high/95 border border-emerald-500/30 backdrop-blur-lg text-[10px] sm:text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 shadow-lg whitespace-nowrap">
            <span className="material-symbols-outlined text-sm">support_agent</span>
            <span>{isAr ? "قنوات الدعم الفني" : "Support Channels"}</span>
          </div>

          {SOCIAL_LINKS.map((item) => {
            const isHovered = hoveredId === item.id;

            return (
              <div
                key={item.id}
                className="relative flex items-center"
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Tooltip Card on Hover */}
                {isHovered && (
                  <div
                    className="absolute whitespace-nowrap py-1.5 px-3 rounded-xl bg-surface-container-lowest/95 backdrop-blur-xl border border-outline-variant/40 shadow-2xl text-xs z-50 pointer-events-none flex flex-col"
                    style={{
                      [isAr ? "left" : "right"]: "52px",
                      top: "4px",
                      animation: "fadeIn 0.2s ease-out",
                    }}
                  >
                    <span className="font-bold text-white text-xs">{isAr ? item.titleAr : item.titleEn}</span>
                    <span className="text-[10px] text-on-surface-variant font-mono">{isAr ? item.descAr : item.descEn}</span>
                  </div>
                )}

                {/* Circular Action Button with Touch/Hover Animation */}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={isAr ? item.titleAr : item.titleEn}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white transition-all duration-300 transform active:scale-75 shadow-lg group relative border border-white/20 hover:rotate-6"
                  style={{
                    background: item.bg,
                    transform: isHovered ? "scale(1.15) rotate(6deg)" : "scale(1)",
                    boxShadow: isHovered
                      ? `0 10px 25px ${item.color}88, 0 0 0 3px rgba(255,255,255,0.3)`
                      : "0 4px 15px rgba(0, 0, 0, 0.35)",
                  }}
                >
                  <div className="group-hover:scale-110 group-active:scale-90 transition-transform">
                    {item.icon}
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
