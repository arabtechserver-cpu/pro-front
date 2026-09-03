"use client";

import React, { useEffect, useRef } from "react";

export default function CyberMouseBackground() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only run mouse tracking on devices with fine pointer (mouse/trackpad, NOT touchscreens)
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let mouseX = -500;
    let mouseY = -500;
    let ringX = -500;
    let ringY = -500;
    let isHovering = false;
    let isVisible = false;
    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        if (dotRef.current) dotRef.current.style.opacity = "1";
        if (ringRef.current) ringRef.current.style.opacity = "1";
        if (auraRef.current) auraRef.current.style.opacity = "1";
      }

      // Check if hovering clickable
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

      // Direct DOM update for instant dot & aura (No React re-renders!)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) ${
          isHovering ? "scale(1.5)" : "scale(1)"
        }`;
        dotRef.current.style.backgroundColor = isHovering ? "#34d399" : "#22d3ee";
        dotRef.current.style.boxShadow = isHovering ? "0 0 14px #34d399, 0 0 24px #34d399" : "0 0 10px #22d3ee, 0 0 20px #22d3ee";
      }

      if (auraRef.current) {
        auraRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
      if (auraRef.current) auraRef.current.style.opacity = "0";
    };

    // Smooth lerp for outer ring via RAF without React state re-renders
    const renderLoop = () => {
      if (isVisible) {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;

        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) ${
            isHovering ? "scale(1.4)" : "scale(1)"
          }`;
          ringRef.current.style.borderColor = isHovering ? "#34d399" : "rgba(34, 211, 238, 0.8)";
          ringRef.current.style.boxShadow = isHovering
            ? "0 0 20px rgba(52, 211, 153, 0.8), inset 0 0 10px rgba(52, 211, 153, 0.4)"
            : "0 0 14px rgba(34, 211, 238, 0.6)";
        }
      }
      rafId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* 1. Hardware-Accelerated Cyber Mouse Follower (Desktop only, 0% React re-render overhead) */}
      <div className="hidden md:block pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
        {/* Cursor Aura */}
        <div
          ref={auraRef}
          className="absolute w-[280px] h-[280px] rounded-full pointer-events-none transition-opacity duration-300 opacity-0 will-change-transform"
          style={{
            background: "radial-gradient(circle, rgba(34, 211, 238, 0.18) 0%, rgba(52, 211, 153, 0.10) 40%, transparent 70%)",
            filter: "blur(25px)",
            mixBlendMode: "screen",
          }}
        />

        {/* Trailing Ring */}
        <div
          ref={ringRef}
          className="absolute w-9 h-9 rounded-full pointer-events-none border border-cyan-400/80 transition-opacity duration-300 opacity-0 flex items-center justify-center will-change-transform"
          style={{
            boxShadow: "0 0 14px rgba(34, 211, 238, 0.6)",
          }}
        >
          <div className="w-full h-full rounded-full border border-dashed border-cyan-300/40 animate-spin-slow pointer-events-none"></div>
        </div>

        {/* Core Dot */}
        <div
          ref={dotRef}
          className="absolute w-2 h-2 rounded-full pointer-events-none bg-cyan-400 transition-opacity duration-300 opacity-0 will-change-transform"
          style={{
            boxShadow: "0 0 10px #22d3ee, 0 0 20px #22d3ee",
          }}
        />
      </div>

      {/* 2. Full-Page Vertical Cyber Light Beams (Optimized for Mobile & Desktop) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Track 1 - Visible on all devices */}
        <div className="absolute left-[6%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/15 to-transparent">
          <div className="w-full h-40 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-vertical-stream-1 will-change-transform"></div>
        </div>

        {/* Track 2 - Desktop only to save mobile GPU */}
        <div className="hidden sm:block absolute left-[22%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/15 to-transparent">
          <div className="w-full h-48 bg-gradient-to-b from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-vertical-stream-2 will-change-transform"></div>
        </div>

        {/* Track 3 - Visible on all devices (center-ish) */}
        <div className="absolute left-[48%] sm:left-[50%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/15 to-transparent">
          <div className="w-full h-44 bg-gradient-to-b from-transparent via-teal-300 to-transparent shadow-[0_0_14px_#5eead4] animate-vertical-stream-3 will-change-transform"></div>
        </div>

        {/* Track 4 - Desktop only to save mobile GPU */}
        <div className="hidden sm:block absolute left-[75%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-purple-500/15 to-transparent">
          <div className="w-full h-48 bg-gradient-to-b from-transparent via-purple-400 to-transparent shadow-[0_0_15px_#c084fc] animate-vertical-stream-up will-change-transform"></div>
        </div>

        {/* Track 5 - Visible on all devices (right side) */}
        <div className="absolute right-[6%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/15 to-transparent">
          <div className="w-full h-36 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-vertical-stream-2 will-change-transform"></div>
        </div>
      </div>
    </>
  );
}
