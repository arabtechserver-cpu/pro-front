"use client";

import React from "react";
import Link from "next/link";

export interface SupportedTool {
  id: string;
  name: string;
  url?: string;
  image?: string;
}

interface SupportedToolsBarProps {
  lang?: string;
  tools?: SupportedTool[];
}

const DEFAULT_TOOLS: SupportedTool[] = [
  { id: "chimera", name: "Chimera", url: "/pricing?search=Chimera" },
  { id: "unlocktool", name: "UnlockTool", url: "/pricing?search=UnlockTool" },
  { id: "borneo", name: "Borneo", url: "/pricing?search=Borneo" },
  { id: "iremoval", name: "iRemoval", url: "/pricing?search=iRemoval" },
  { id: "dft", name: "DFT Pro", url: "/pricing?search=DFT%20Pro" },
  { id: "mobilesea", name: "MobileSea", url: "/pricing?search=MobileSea" },
  { id: "amt", name: "AMT", url: "/pricing?search=AMT" },
  { id: "phoenix", name: "Phoenix", url: "/pricing?search=Phoenix" },
  { id: "cheetah", name: "Cheetah", url: "/pricing?search=Cheetah" },
  { id: "fkey", name: "FKey", url: "/pricing?search=FKey" }
];

function renderToolIcon(tool: SupportedTool) {
  if (tool.image) {
    return (
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 dark:bg-[#091524] border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-xs">
        <img
          src={tool.image}
          alt={tool.name}
          className="w-full h-full object-contain p-0.5"
        />
      </div>
    );
  }

  const key = `${tool.id} ${tool.name}`.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (key.includes("chimera")) {
    return (
      <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7 fill-current text-[#b48325] dark:text-[#f3ba4b]" aria-hidden="true">
          <path d="M19.5 5.5c-1.2-1-2.8-1.5-4.5-1.5-1.5 0-2.9.4-4.1 1.2-1-.7-2.3-1.2-3.7-1.2-3.1 0-5.7 2.4-5.7 5.5 0 2.2 1.3 4.1 3.2 4.9-.1.5-.2 1.1-.2 1.6 0 3.3 2.7 6 6 6 1.8 0 3.4-.8 4.5-2.1 1.2.6 2.6.9 4 .9 1.1 0 2.1-.2 3-.7-.6-.8-1-1.8-1-2.9 0-.8.2-1.5.6-2.1-1.3-.8-2.1-2.2-2.1-3.8 0-1.2.5-2.3 1.3-3.1-.7-.8-1.3-1.8-1.3-2.9 0-.6.1-1.3.3-1.9z" />
        </svg>
      </div>
    );
  }

  if (key.includes("unlocktool")) {
    return (
      <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#f97316" strokeWidth="2.5" />
          <circle cx="12" cy="12" r="6" stroke="#f97316" strokeWidth="2.5" />
          <circle cx="12" cy="12" r="2.5" fill="#f97316" />
        </svg>
      </div>
    );
  }

  if (key.includes("borneo")) {
    return (
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#e11d48] flex items-center justify-center shadow-xs">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 3.5c.83 0 1.5.67 1.5 1.5v3h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v3c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5v-3h-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5h3V7c0-.83.67-1.5 1.5-1.5z" />
        </svg>
      </div>
    );
  }

  if (key.includes("iremoval")) {
    return (
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#581c87] flex items-center justify-center shadow-xs">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round">
          <rect width="14" height="18" x="5" y="3" rx="2" />
          <line x1="9" x2="15" y1="7" y2="7" />
          <circle cx="12" cy="17" r="1" fill="white" />
        </svg>
      </div>
    );
  }

  if (key.includes("dft")) {
    return (
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0284c7] flex items-center justify-center text-white font-black text-[9px] sm:text-[10px] tracking-tight shadow-xs">
        DFT
      </div>
    );
  }

  if (key.includes("mobilesea")) {
    return (
      <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7 fill-none stroke-[#06b6d4] stroke-[2.8]" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18V8a4 4 0 0 1 8 0v10M12 18V8a4 4 0 0 1 8 0v10" />
        </svg>
      </div>
    );
  }

  if (key.includes("amt")) {
    return (
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black flex items-center justify-center text-[#f59e0b] font-black text-[9px] sm:text-[10px] tracking-tight shadow-xs">
        AMT
      </div>
    );
  }

  if (key.includes("phoenix")) {
    return (
      <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7 fill-[#dc2626]">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
    );
  }

  if (key.includes("cheetah")) {
    return (
      <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7 fill-none stroke-[#eab308] stroke-[2.2]" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="7" />
          <path d="M9 10h.01M15 10h.01M10 14a2 2 0 0 0 4 0" />
          <path d="M6 6l2 2M18 6l-2 2" />
        </svg>
      </div>
    );
  }

  if (key.includes("fkey")) {
    return (
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#db2777] flex items-center justify-center text-white font-black text-[8px] sm:text-[9px] tracking-tight shadow-xs">
        FKey
      </div>
    );
  }

  const label = (tool.name || "Tool").trim().slice(0, 3).toUpperCase();
  return (
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center shadow-xs text-cyan-400 font-black text-[9px]">
      {label}
    </div>
  );
}

export default function SupportedToolsBar({ lang = "ar", tools }: SupportedToolsBarProps) {
  const isAr = lang === "ar";
  const displayTools = Array.isArray(tools) && tools.length > 0 ? tools : DEFAULT_TOOLS;
  const langPrefix = `/${lang}`;

  const resolveUrl = (tool: SupportedTool) => {
    const raw = tool.url || `/pricing?search=${encodeURIComponent(tool.name)}`;
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("/")) return `${langPrefix}${raw}`;
    return `${langPrefix}/${raw}`;
  };

  return (
    <section className="w-full mb-8 sm:mb-12">
      {/* Centered Header matching Mockup */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="h-[2px] w-5 sm:w-6 bg-cyan-500 dark:bg-cyan-400" />
          <h2 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? "أبرز الأدوات المدعومة" : "Featured Supported Tools"}
          </h2>
          <span className="h-[2px] w-5 sm:w-6 bg-cyan-500 dark:bg-cyan-400" />
        </div>
        <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-400">
          {isAr ? "مجموعة مختارة من الأدوات وسيرفرات المعتمدة" : "Selected set of certified tools & servers"}
        </p>
      </div>

      {/* Tools Grid: 5 cols on mobile (2 rows of 5), 10 cols on desktop */}
      <div className="grid grid-cols-5 lg:grid-cols-10 gap-1.5 sm:gap-3">
        {displayTools.map((tool) => (
          <Link
            key={tool.id || tool.name}
            href={resolveUrl(tool)}
            className="p-1.5 sm:p-2.5 rounded-2xl bg-white dark:bg-[#061224] border border-slate-200/80 dark:border-cyan-500/20 hover:border-slate-300 dark:hover:border-cyan-500/40 transition-all flex flex-col items-center justify-center text-center group shadow-xs hover:shadow-sm"
          >
            <div className="mb-1 sm:mb-1.5 group-hover:scale-105 transition-transform flex items-center justify-center h-7 sm:h-8">
              {renderToolIcon(tool)}
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors truncate w-full">
              {tool.name}
            </span>
          </Link>
        ))}
      </div>

      {/* 3 Indicator Dots on Mobile matching Mockup */}
      <div className="sm:hidden flex items-center justify-center gap-1 mt-3">
        <span className="w-4 h-1 rounded-full bg-emerald-500" />
        <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-white/20" />
        <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-white/20" />
      </div>
    </section>
  );
}
