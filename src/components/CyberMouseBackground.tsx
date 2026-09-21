"use client";

import React, { useEffect, useRef } from "react";

export default function CyberMouseBackground() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let mouseX = -500;
    let mouseY = -500;
    let ringX = -500;
    let ringY = -500;
    let isHovering = false;
    let isVisible = false;
    let rafId: number | null = null;
    let isLoopRunning = false;

    const startLoop = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        rafId = requestAnimationFrame(renderLoop);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        if (dotRef.current) dotRef.current.style.opacity = "1";
        if (ringRef.current) ringRef.current.style.opacity = "1";
        if (auraRef.current) auraRef.current.style.opacity = "1";
      }

      const target = e.target as HTMLElement | null;
      if (target) {
        const clickable =
          target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.closest("button") ||
          target.closest("a") ||
          target.closest("[role='button']");
        isHovering = !!clickable;
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) ${
          isHovering ? "scale(1.5)" : "scale(1)"
        }`;
        dotRef.current.style.backgroundColor = isHovering ? "#38bdf8" : "#00f0ff";
        dotRef.current.style.boxShadow = isHovering
          ? "0 0 16px #38bdf8, 0 0 32px #00f0ff"
          : "0 0 12px #00f0ff, 0 0 24px #38bdf8";
      }

      if (auraRef.current) {
        auraRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      startLoop();
    };

    const handleMouseLeave = () => {
      isVisible = false;
      isLoopRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
      if (auraRef.current) auraRef.current.style.opacity = "0";
    };

    let isScrolling = false;
    let scrollTimer: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      isScrolling = true;
      if (dotRef.current) dotRef.current.style.opacity = "0.3";
      if (ringRef.current) ringRef.current.style.opacity = "0.3";
      if (auraRef.current) auraRef.current.style.opacity = "0.1";

      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling = false;
        if (isVisible) {
          if (dotRef.current) dotRef.current.style.opacity = "1";
          if (ringRef.current) ringRef.current.style.opacity = "1";
          if (auraRef.current) auraRef.current.style.opacity = "1";
        }
      }, 90);
    };

    const renderLoop = () => {
      if (!isVisible) {
        isLoopRunning = false;
        return;
      }

      if (!isScrolling) {
        const dx = mouseX - ringX;
        const dy = mouseY - ringY;
        ringX += dx * 0.18;
        ringY += dy * 0.18;

        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) ${
            isHovering ? "scale(1.4)" : "scale(1)"
          }`;
          ringRef.current.style.borderColor = isHovering ? "#38bdf8" : "rgba(0, 240, 255, 0.85)";
          ringRef.current.style.boxShadow = isHovering
            ? "0 0 24px rgba(56, 189, 248, 0.9), inset 0 0 12px rgba(0, 240, 255, 0.5)"
            : "0 0 18px rgba(0, 240, 255, 0.75)";
        }

        if (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2) {
          rafId = requestAnimationFrame(renderLoop);
        } else {
          isLoopRunning = false;
        }
      } else {
        rafId = requestAnimationFrame(renderLoop);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (scrollTimer) clearTimeout(scrollTimer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="pointer-events-none select-none">
      {/* 1. Hardware-Accelerated Cyber Mouse Follower (Desktop fine-pointer only) */}
      <div className="hidden md:block pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
        {/* Cursor Aura */}
        <div
          ref={auraRef}
          className="absolute w-[320px] h-[320px] rounded-full pointer-events-none transition-opacity duration-300 opacity-0 will-change-transform"
          style={{
            background: "radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, rgba(168, 85, 247, 0.15) 40%, transparent 70%)",
            filter: "blur(28px)",
            mixBlendMode: "screen",
          }}
        />

        {/* Trailing Ring */}
        <div
          ref={ringRef}
          className="absolute w-10 h-10 rounded-full pointer-events-none border border-cyan-400/90 transition-opacity duration-300 opacity-0 flex items-center justify-center will-change-transform"
          style={{
            boxShadow: "0 0 18px rgba(0, 240, 255, 0.75)",
          }}
        >
          <div className="w-full h-full rounded-full border border-dashed border-cyan-300/60 animate-spin-slow pointer-events-none" />
        </div>

        {/* Core Dot */}
        <div
          ref={dotRef}
          className="absolute w-2.5 h-2.5 rounded-full pointer-events-none bg-cyan-400 transition-opacity duration-300 opacity-0 will-change-transform"
          style={{
            boxShadow: "0 0 12px #00f0ff, 0 0 24px #38bdf8",
          }}
        />
      </div>

      {/* 2. Full-Canvas Dual-Axis Cyber Laser & Stream Engine (Active in Both Light & Dark Modes) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* A. Animated Coordinate Cyber Grid (Subtle matrix background across width and height) */}
        <div
          className="absolute inset-0 opacity-40 dark:opacity-60 animate-cyber-grid pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(56, 189, 248, 0.09) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(56, 189, 248, 0.09) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* B. Ambient Aurora Glowing Light Pools (Radiant, High-Luminescence, Shifting Colors) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden animate-cyber-color-cycle will-change-[filter]">
          {/* Aurora Pool 1 - Top Left / Center (Cyan / Sky) */}
          <div
            className="absolute -top-[10%] left-[5%] w-[680px] h-[680px] rounded-full pointer-events-none animate-cyber-aura-1 opacity-55 dark:opacity-75"
            style={{
              background: "radial-gradient(circle, rgba(0, 240, 255, 0.35) 0%, rgba(56, 189, 248, 0.20) 45%, transparent 70%)",
              filter: "blur(75px)",
            }}
          />
          {/* Aurora Pool 2 - Center Right (Violet / Orchid) */}
          <div
            className="absolute top-[35%] -right-[5%] w-[720px] h-[720px] rounded-full pointer-events-none animate-cyber-aura-2 opacity-50 dark:opacity-70"
            style={{
              background: "radial-gradient(circle, rgba(168, 85, 247, 0.32) 0%, rgba(236, 72, 153, 0.16) 45%, transparent 70%)",
              filter: "blur(85px)",
            }}
          />
          {/* Aurora Pool 3 - Bottom Left (Emerald / Aquamarine) */}
          <div
            className="absolute -bottom-[10%] left-[18%] w-[620px] h-[620px] rounded-full pointer-events-none animate-cyber-aura-3 opacity-50 dark:opacity-65"
            style={{
              background: "radial-gradient(circle, rgba(52, 211, 153, 0.30) 0%, rgba(14, 165, 233, 0.18) 45%, transparent 70%)",
              filter: "blur(75px)",
            }}
          />
        </div>

        {/* C. 10 Vertical Laser Tracks & Streams (الطول) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden animate-cyber-color-cycle will-change-[filter]">
          {/* V-Track 1 (3%) */}
          <div className="absolute left-[3%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/25 dark:via-cyan-400/30 to-transparent">
            <div className="w-full h-60 bg-gradient-to-b from-transparent via-cyan-400 to-white shadow-[0_0_22px_#00f0ff,0_0_40px_#38bdf8] animate-cyber-down-1 will-change-transform" />
          </div>

          {/* V-Track 2 (12%) */}
          <div className="hidden sm:block absolute left-[12%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-violet-500/25 dark:via-violet-400/30 to-transparent">
            <div className="w-full h-64 bg-gradient-to-t from-transparent via-purple-400 to-white shadow-[0_0_24px_#c084fc,0_0_42px_#a855f7] animate-cyber-up-1 will-change-transform" />
          </div>

          {/* V-Track 3 (22%) */}
          <div className="absolute left-[22%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-sky-500/25 dark:via-sky-400/30 to-transparent">
            <div className="w-full h-60 bg-gradient-to-b from-transparent via-sky-400 to-white shadow-[0_0_22px_#38bdf8,0_0_38px_#00f0ff] animate-cyber-down-2 will-change-transform" />
          </div>

          {/* V-Track 4 (34%) */}
          <div className="hidden md:block absolute left-[34%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/25 dark:via-emerald-400/30 to-transparent">
            <div className="w-full h-56 bg-gradient-to-t from-transparent via-emerald-400 to-white shadow-[0_0_20px_#34d399,0_0_36px_#2dd4bf] animate-cyber-up-2 will-change-transform" />
          </div>

          {/* V-Track 5 (45%) */}
          <div className="absolute left-[45%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/25 dark:via-cyan-400/30 to-transparent">
            <div className="w-full h-72 bg-gradient-to-b from-transparent via-cyan-300 to-white shadow-[0_0_26px_#00f0ff,0_0_46px_#a855f7] animate-cyber-down-3 will-change-transform" />
          </div>

          {/* V-Track 6 (55%) */}
          <div className="hidden sm:block absolute left-[55%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-violet-500/25 dark:via-violet-400/30 to-transparent">
            <div className="w-full h-60 bg-gradient-to-t from-transparent via-violet-400 to-white shadow-[0_0_22px_#a855f7,0_0_40px_#38bdf8] animate-cyber-up-1 will-change-transform" />
          </div>

          {/* V-Track 7 (67%) */}
          <div className="hidden md:block absolute left-[67%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-sky-500/25 dark:via-sky-400/30 to-transparent">
            <div className="w-full h-64 bg-gradient-to-b from-transparent via-sky-400 to-white shadow-[0_0_24px_#38bdf8,0_0_42px_#00f0ff] animate-cyber-down-1 will-change-transform" />
          </div>

          {/* V-Track 8 (78%) */}
          <div className="absolute left-[78%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-purple-500/25 dark:via-purple-400/30 to-transparent">
            <div className="w-full h-64 bg-gradient-to-t from-transparent via-purple-400 to-white shadow-[0_0_24px_#c084fc,0_0_44px_#00f0ff] animate-cyber-up-2 will-change-transform" />
          </div>

          {/* V-Track 9 (88%) */}
          <div className="hidden sm:block absolute left-[88%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/25 dark:via-cyan-400/30 to-transparent">
            <div className="w-full h-56 bg-gradient-to-b from-transparent via-cyan-400 to-white shadow-[0_0_20px_#00f0ff,0_0_36px_#38bdf8] animate-cyber-down-2 will-change-transform" />
          </div>

          {/* V-Track 10 (97%) */}
          <div className="absolute right-[3%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/25 dark:via-cyan-400/30 to-transparent">
            <div className="w-full h-68 bg-gradient-to-b from-transparent via-cyan-300 to-white shadow-[0_0_24px_#00f0ff,0_0_40px_#a855f7] animate-cyber-down-3 will-change-transform" />
          </div>
        </div>

        {/* D. 8 Horizontal Laser Tracks & Streams (العرض) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden animate-cyber-color-cycle will-change-[filter]">
          {/* H-Track 1 (8%) */}
          <div className="absolute top-[8%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/25 dark:via-cyan-400/30 to-transparent">
            <div className="h-full w-64 bg-gradient-to-r from-transparent via-cyan-400 to-white shadow-[0_0_22px_#00f0ff,0_0_38px_#38bdf8] animate-cyber-right-1 will-change-transform" />
          </div>

          {/* H-Track 2 (20%) */}
          <div className="hidden sm:block absolute top-[20%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/25 dark:via-purple-400/30 to-transparent">
            <div className="h-full w-72 bg-gradient-to-l from-transparent via-purple-400 to-white shadow-[0_0_24px_#c084fc,0_0_44px_#a855f7] animate-cyber-left-1 will-change-transform" />
          </div>

          {/* H-Track 3 (32%) */}
          <div className="absolute top-[32%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-500/25 dark:via-sky-400/30 to-transparent">
            <div className="h-full w-80 bg-gradient-to-r from-transparent via-sky-300 to-white shadow-[0_0_26px_#38bdf8,0_0_46px_#00f0ff] animate-cyber-right-2 will-change-transform" />
          </div>

          {/* H-Track 4 (44%) */}
          <div className="hidden md:block absolute top-[44%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/25 dark:via-emerald-400/30 to-transparent">
            <div className="h-full w-64 bg-gradient-to-l from-transparent via-emerald-400 to-white shadow-[0_0_20px_#34d399,0_0_36px_#2dd4bf] animate-cyber-left-2 will-change-transform" />
          </div>

          {/* H-Track 5 (56%) */}
          <div className="absolute top-[56%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/25 dark:via-cyan-400/30 to-transparent">
            <div className="h-full w-72 bg-gradient-to-r from-transparent via-cyan-400 to-white shadow-[0_0_24px_#00f0ff,0_0_42px_#c084fc] animate-cyber-right-3 will-change-transform" />
          </div>

          {/* H-Track 6 (68%) */}
          <div className="hidden sm:block absolute top-[68%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/25 dark:via-violet-400/30 to-transparent">
            <div className="h-full w-64 bg-gradient-to-l from-transparent via-violet-400 to-white shadow-[0_0_22px_#a855f7,0_0_40px_#38bdf8] animate-cyber-left-1 will-change-transform" />
          </div>

          {/* H-Track 7 (80%) */}
          <div className="absolute top-[80%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-500/25 dark:via-sky-400/30 to-transparent">
            <div className="h-full w-80 bg-gradient-to-r from-transparent via-sky-400 to-white shadow-[0_0_26px_#38bdf8,0_0_44px_#00f0ff] animate-cyber-right-2 will-change-transform" />
          </div>

          {/* H-Track 8 (92%) */}
          <div className="hidden sm:block absolute top-[92%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/25 dark:via-cyan-400/30 to-transparent">
            <div className="h-full w-68 bg-gradient-to-l from-transparent via-cyan-300 to-white shadow-[0_0_22px_#00f0ff,0_0_38px_#34d399] animate-cyber-left-2 will-change-transform" />
          </div>
        </div>

        {/* E. Overlay Surface Bleed Layer ("والالوان دي تخترق الخلفيات") */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden opacity-35 dark:opacity-50 mix-blend-screen animate-cyber-color-cycle will-change-[filter]"
        >
          {/* Luminous cross beams passing over content surfaces */}
          <div className="absolute left-[28%] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-300 to-transparent shadow-[0_0_28px_#00f0ff] animate-cyber-down-2 will-change-transform" />
          <div className="absolute left-[72%] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-purple-300 to-transparent shadow-[0_0_28px_#a855f7] animate-cyber-up-1 will-change-transform" />
          <div className="absolute top-[36%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-300 to-transparent shadow-[0_0_28px_#38bdf8] animate-cyber-right-1 will-change-transform" />
          <div className="absolute top-[74%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_28px_#00f0ff] animate-cyber-left-2 will-change-transform" />
        </div>
      </div>
    </div>
  );
}
