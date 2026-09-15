"use client";

import React from "react";
import { Wrench, CheckCircle } from "lucide-react";

interface ToolMarqueeProps {
  tools?: string[];
  lang?: string;
}

export default function ToolMarquee({ tools, lang = "ar" }: ToolMarqueeProps) {
  const isAr = lang === "ar";
  const defaultTools = [
    "UnlockTool",
    "Chimera Tool",
    "Borneo Schematics",
    "DFT PRO",
    "AMT Multi Tool",
    "iRemoval Pro",
    "Pandora Box",
    "Cheetah Tool",
    "Phoenix Service Tool",
    "SamFW FRP",
    "EasyJTAG",
    "EFT Pro Dongle",
    "Octoplus Box",
    "UMT Tool"
  ];

  const list = tools && tools.length > 0 ? tools : defaultTools;

  return (
    <section className="w-full py-4 sm:py-6 border-y border-white/10 bg-[#070b12]/60 backdrop-blur-md relative overflow-hidden my-6 sm:my-8">
      <div className="absolute top-0 left-0 w-16 sm:w-32 h-full bg-gradient-to-r from-[#0b0f17] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-16 sm:w-32 h-full bg-gradient-to-l from-[#0b0f17] to-transparent z-10 pointer-events-none" />

      <div className="w-full flex items-center justify-center mb-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-slate-300 uppercase tracking-widest">
          <Wrench className="w-3.5 h-3.5 text-sky-400" />
          <span>{isAr ? "شبكة تراخيص وبرامج السوفت وير العالمية" : "Official Software & Tool Network"}</span>
        </span>
      </div>

      <div className="w-full flex whitespace-nowrap overflow-hidden" dir="ltr">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer select-none">
          <div className="flex shrink-0 items-center gap-8 sm:gap-12 px-6 text-sm sm:text-base font-semibold text-slate-300">
            {list.map((tool, idx) => (
              <span 
                key={`t1-${idx}`} 
                className="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors shrink-0 font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>{tool}</span>
              </span>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-8 sm:gap-12 px-6 text-sm sm:text-base font-semibold text-slate-300" aria-hidden="true">
            {list.map((tool, idx) => (
              <span 
                key={`t2-${idx}`} 
                className="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors shrink-0 font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>{tool}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
