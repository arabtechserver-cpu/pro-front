"use client";

import React, { useEffect, useState, useRef } from "react";

export default function CyberMouseBackground() {
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [isMoving, setIsMoving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsMoving(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsMoving(false);
      }, 1500);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* --- Dynamic Interactive Mouse Glow Spotlight (ألوان وحركة تفاعلية مع الماوس) --- */}
      <div
        className="absolute rounded-full transition-opacity duration-500 ease-out"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          transform: "translate(-50%, -50%)",
          width: isMoving ? "750px" : "600px",
          height: isMoving ? "750px" : "600px",
          background: `radial-gradient(circle, rgba(45, 212, 191, 0.14) 0%, rgba(34, 211, 238, 0.10) 25%, rgba(168, 85, 247, 0.06) 50%, transparent 70%)`,
          filter: "blur(40px)",
          opacity: mousePos.x === -500 ? 0 : 1,
        }}
      />

      {/* Secondary Accent Cursor Follower (Sharper Core Light) */}
      <div
        className="absolute rounded-full transition-transform duration-100 ease-out pointer-events-none"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          transform: "translate(-50%, -50%)",
          width: "240px",
          height: "240px",
          background: `radial-gradient(circle, rgba(87, 241, 219, 0.18) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 75%)`,
          filter: "blur(20px)",
          opacity: mousePos.x === -500 ? 0 : 0.85,
        }}
      />

      {/* --- Full-Page Continuous Vertical Cyber Beams (خطوط رأسية بطول الموقع بتتحرك وتنوّر) --- */}
      <div className="absolute inset-0 w-full h-full">
        {/* Track 1 - Far Left (5%) */}
        <div className="absolute left-[4%] sm:left-[6%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/15 to-transparent">
          <div className="w-full h-44 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-vertical-stream-1"></div>
        </div>

        {/* Track 2 - Left Mid (18%) */}
        <div className="absolute left-[18%] sm:left-[20%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/15 to-transparent">
          <div className="w-full h-52 bg-gradient-to-b from-transparent via-emerald-400 to-transparent shadow-[0_0_18px_#34d399] animate-vertical-stream-2"></div>
        </div>

        {/* Track 3 - Center Left (33%) Upward */}
        <div className="absolute left-[33%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-purple-500/15 to-transparent">
          <div className="w-full h-40 bg-gradient-to-b from-transparent via-purple-400 to-transparent shadow-[0_0_14px_#c084fc] animate-vertical-stream-up"></div>
        </div>

        {/* Track 4 - Center (50%) */}
        <div className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/15 to-transparent">
          <div className="w-full h-48 bg-gradient-to-b from-transparent via-teal-300 to-transparent shadow-[0_0_16px_#5eead4] animate-vertical-stream-3"></div>
        </div>

        {/* Track 5 - Center Right (66%) */}
        <div className="absolute left-[66%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/15 to-transparent">
          <div className="w-full h-44 bg-gradient-to-b from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-vertical-stream-1"></div>
        </div>

        {/* Track 6 - Right Mid (80%) Upward */}
        <div className="absolute left-[80%] sm:left-[82%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-purple-500/15 to-transparent">
          <div className="w-full h-48 bg-gradient-to-b from-transparent via-purple-400 to-transparent shadow-[0_0_15px_#c084fc] animate-vertical-stream-up"></div>
        </div>

        {/* Track 7 - Far Right (95%) */}
        <div className="absolute left-[94%] sm:left-[95%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/15 to-transparent">
          <div className="w-full h-36 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_14px_#22d3ee] animate-vertical-stream-2"></div>
        </div>
      </div>

      {/* Ambient Corner Radial Gradients */}
      <div className="absolute top-0 left-0 w-[45vw] h-[45vh] bg-gradient-to-b from-cyan-500/5 to-transparent rounded-full blur-[140px]"></div>
      <div className="absolute bottom-0 right-0 w-[45vw] h-[45vh] bg-gradient-to-tl from-emerald-500/5 to-transparent rounded-full blur-[140px]"></div>
      <div className="absolute top-1/2 right-[5%] w-[35vw] h-[35vh] bg-gradient-to-l from-purple-500/5 to-transparent rounded-full blur-[120px]"></div>
    </div>
  );
}
