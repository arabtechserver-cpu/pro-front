"use client";

import React, { useEffect, useState, useRef } from "react";

export default function CyberMouseBackground() {
  const [mousePos, setMousePos] = useState({ x: -300, y: -300 });
  const [trailingPos, setTrailingPos] = useState({ x: -300, y: -300 });
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Detect if cursor is hovering over any interactive / clickable element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable =
          target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.closest("button") ||
          target.closest("a") ||
          target.closest("[role='button']") ||
          target.getAttribute("role") === "button";
        setIsHoveringClickable(!!isClickable);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    // Smooth trailing physics using requestAnimationFrame
    const animateTrail = () => {
      setTrailingPos((prev) => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        return {
          x: prev.x + dx * 0.2,
          y: prev.y + dy * 0.2,
        };
      });
      requestRef.current = requestAnimationFrame(animateTrail);
    };

    requestRef.current = requestAnimationFrame(animateTrail);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [mousePos, isVisible]);

  return (
    <>
      {/* =========================================================================
          1. VISIBLE CUSTOM CYBER CURSOR & GLOW (ألوان وحركة واضحة تماماً لفأرة الكمبيوتر)
         ========================================================================= */}
      {isVisible && (
        <div className="hidden md:block pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
          {/* Main Mouse Light Aura (lights up anything under the cursor) */}
          <div
            className="absolute rounded-full transition-all duration-300 ease-out"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              transform: "translate(-50%, -50%)",
              width: isHoveringClickable ? "340px" : "260px",
              height: isHoveringClickable ? "340px" : "260px",
              background: isHoveringClickable
                ? "radial-gradient(circle, rgba(52, 211, 153, 0.28) 0%, rgba(34, 211, 238, 0.18) 35%, rgba(168, 85, 247, 0.08) 60%, transparent 75%)"
                : "radial-gradient(circle, rgba(34, 211, 238, 0.24) 0%, rgba(52, 211, 153, 0.12) 40%, transparent 70%)",
              filter: "blur(25px)",
              mixBlendMode: "screen",
            }}
          />

          {/* Smooth Trailing Outer Ring (دائرة نيون ناعمة تلاحق الماوس وتتفاعل مع الأزرار) */}
          <div
            className={`absolute rounded-full transition-all duration-150 ease-out flex items-center justify-center ${
              isHoveringClickable ? "scale-150 border-emerald-400 bg-emerald-400/10" : "border-cyan-400/80"
            }`}
            style={{
              left: `${trailingPos.x}px`,
              top: `${trailingPos.y}px`,
              transform: "translate(-50%, -50%)",
              width: "36px",
              height: "36px",
              borderWidth: "1.5px",
              boxShadow: isHoveringClickable
                ? "0 0 22px rgba(52, 211, 153, 0.85), inset 0 0 10px rgba(52, 211, 153, 0.4)"
                : "0 0 16px rgba(34, 211, 238, 0.75)",
            }}
          >
            {/* Spinning Dashed Ring inside trailing circle */}
            <div className="w-full h-full rounded-full border border-dashed border-cyan-300/50 animate-spin-slow pointer-events-none"></div>
          </div>

          {/* Sharp Center Pointer Dot (نقطة ليزر دقيقة عند مؤشر الماوس بالضبط) */}
          <div
            className="absolute rounded-full transition-transform duration-0 pointer-events-none"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              transform: "translate(-50%, -50%)",
              width: isHoveringClickable ? "8px" : "6px",
              height: isHoveringClickable ? "8px" : "6px",
              backgroundColor: isHoveringClickable ? "#34d399" : "#22d3ee",
              boxShadow: isHoveringClickable
                ? "0 0 12px #34d399, 0 0 24px #34d399"
                : "0 0 10px #22d3ee, 0 0 20px #22d3ee",
            }}
          />
        </div>
      )}

      {/* =========================================================================
          2. FULL-PAGE CONTINUOUS VERTICAL CYBER BEAMS (خطوط رأسية بطول كل الموقع)
         ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Track 1 - Far Left (5%) */}
        <div className="absolute left-[4%] sm:left-[6%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent">
          <div className="w-full h-48 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_18px_#22d3ee] animate-vertical-stream-1"></div>
        </div>

        {/* Track 2 - Left Mid (18%) */}
        <div className="absolute left-[18%] sm:left-[20%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent">
          <div className="w-full h-56 bg-gradient-to-b from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#34d399] animate-vertical-stream-2"></div>
        </div>

        {/* Track 3 - Center Left (33%) Upward */}
        <div className="absolute left-[33%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-purple-500/20 to-transparent">
          <div className="w-full h-44 bg-gradient-to-b from-transparent via-purple-400 to-transparent shadow-[0_0_16px_#c084fc] animate-vertical-stream-up"></div>
        </div>

        {/* Track 4 - Center (50%) */}
        <div className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent">
          <div className="w-full h-52 bg-gradient-to-b from-transparent via-teal-300 to-transparent shadow-[0_0_18px_#5eead4] animate-vertical-stream-3"></div>
        </div>

        {/* Track 5 - Center Right (66%) */}
        <div className="absolute left-[66%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent">
          <div className="w-full h-48 bg-gradient-to-b from-transparent via-emerald-400 to-transparent shadow-[0_0_18px_#34d399] animate-vertical-stream-1"></div>
        </div>

        {/* Track 6 - Right Mid (82%) Upward */}
        <div className="absolute left-[80%] sm:left-[82%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-purple-500/20 to-transparent">
          <div className="w-full h-52 bg-gradient-to-b from-transparent via-purple-400 to-transparent shadow-[0_0_18px_#c084fc] animate-vertical-stream-up"></div>
        </div>

        {/* Track 7 - Far Right (95%) */}
        <div className="absolute left-[94%] sm:left-[95%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent">
          <div className="w-full h-44 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_18px_#22d3ee] animate-vertical-stream-2"></div>
        </div>
      </div>
    </>
  );
}
