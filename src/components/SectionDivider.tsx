import React from "react";

interface SectionDividerProps {
  className?: string;
  flip?: boolean;
}

export default function SectionDivider({ className = "", flip = false }: SectionDividerProps) {
  return (
    <div
      className={`relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden flex items-center justify-center py-6 sm:py-10 select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Pure Ambient Spotlight Illumination - 100% Lineless, Feathered & Soft Glow */}
      <div className="w-full h-28 sm:h-36 flex items-center justify-center relative">
        {/* Layer 1: Wide Edge-to-Edge Ambient Wash across the entire screen */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background:
              "radial-gradient(ellipse 90% 100% at 50% 50%, rgba(56, 189, 248, 0.18) 0%, rgba(37, 99, 235, 0.08) 50%, transparent 80%)",
            filter: "blur(28px)"
          }}
        />

        {/* Layer 2: Concentrated Radiant Spotlight Beam (Smooth, melted illumination pool) */}
        <div
          className="w-full max-w-5xl h-20 sm:h-28 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse 70% 85% at 50% 50%, rgba(56, 189, 248, 0.28) 0%, rgba(37, 99, 235, 0.14) 50%, transparent 85%)",
            filter: "blur(20px)"
          }}
        />

        {/* Layer 3: Central Luminous Core (Soft light puddle, absolutely no lines or edges) */}
        <div
          className="absolute w-80 sm:w-[32rem] h-12 sm:h-16 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse 65% 70% at 50% 50%, rgba(224, 242, 254, 0.45) 0%, rgba(56, 189, 248, 0.22) 50%, transparent 90%)",
            filter: "blur(14px)"
          }}
        />
      </div>
    </div>
  );
}
