"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface HeroScrollVideoBackgroundProps {
  lang: string;
}

const DEFAULT_VIDEO_URL =
  process.env.NEXT_PUBLIC_HERO_VIDEO_URL ||
  "https://pub-3440f02b971d4054906dd63d89e3cdb0.r2.dev/hero-showcase.mp4";

export default function HeroScrollVideoBackground({ lang }: HeroScrollVideoBackgroundProps) {
  const isAr = lang === "ar";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoWrapperRef = useRef<HTMLDivElement | null>(null);
  const progressTextRef = useRef<HTMLSpanElement | null>(null);
  const statusLabelRef = useRef<HTMLSpanElement | null>(null);

  // Default to scroll-sync so video never autoplays without user interaction
  const [playbackMode, setPlaybackMode] = useState<"scroll" | "auto">("scroll");
  const [isMuted, setIsMuted] = useState(true);

  // Playback promise locking to prevent browser unhandled interruption errors
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const targetTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const lastSeekTimeRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(1);

  const safePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.paused || playPromiseRef.current) return;

    try {
      const promise = video.play();
      if (promise !== undefined) {
        playPromiseRef.current = promise;
        promise
          .catch(() => {})
          .finally(() => {
            playPromiseRef.current = null;
          });
      }
    } catch {}
  }, []);

  const safePause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playPromiseRef.current) {
      playPromiseRef.current
        .then(() => {
          if (video && !video.paused) video.pause();
        })
        .catch(() => {
          if (video && !video.paused) video.pause();
        });
    } else if (!video.paused) {
      video.pause();
    }
  }, []);

  // Force scroll-to-top and reinitialize state on page refresh / reload
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const resetToTop = () => {
      window.scrollTo(0, 0);
      const vid = videoRef.current;
      if (vid) {
        vid.currentTime = 0.01;
        vid.pause();
      }
      targetTimeRef.current = 0;
      if (progressTextRef.current) {
        progressTextRef.current.textContent = "0%";
      }
      if (statusLabelRef.current) {
        statusLabelRef.current.textContent = isAr ? "متزامن مع التمرير" : "SCROLL SYNC";
      }
    };

    resetToTop();
    const t1 = setTimeout(resetToTop, 20);
    const t2 = setTimeout(resetToTop, 100);

    window.addEventListener("beforeunload", resetToTop);
    return () => {
      window.removeEventListener("beforeunload", resetToTop);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isAr]);

  // Initialize video settings
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.pause();

    const updateDimensions = () => {
      maxScrollRef.current = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
    };

    const handleLoadedMetadata = () => {
      video.currentTime = 0.01;
      video.pause();
      updateDimensions();
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions, { passive: true });
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      window.removeEventListener("resize", updateDimensions);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  // Main scroll-driven engine with active scrolling tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playbackMode === "auto") {
      video.playbackRate = 0.85;
      safePlay();
      return () => {
        safePause();
      };
    }

    // Scroll mode: video strictly pauses until scroll events occur
    safePause();

    const updateDimensions = () => {
      maxScrollRef.current = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
    };

    const updateScrollTarget = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const progress = Math.min(Math.max(scrollY / maxScrollRef.current, 0), 1);

      if (progressTextRef.current) {
        progressTextRef.current.textContent = `${Math.round(progress * 100)}%`;
      }

      if (video.duration && !isNaN(video.duration)) {
        targetTimeRef.current = progress * Math.max(0, video.duration - 0.05);
      }

      lastScrollTimeRef.current = performance.now();
    };

    const handleScroll = () => {
      updateScrollTarget();
    };

    // Ultra-smooth RAF loop with decoder back-pressure protection
    const renderLoop = () => {
      if (playbackMode !== "scroll") return;

      const vid = videoRef.current;
      if (vid && vid.duration && !isNaN(vid.duration)) {
        const now = performance.now();
        const isActivelyScrolling = now - lastScrollTimeRef.current < 200;
        const target = targetTimeRef.current;
        const current = vid.currentTime;
        const diff = target - current;

        if (isActivelyScrolling) {
          if (diff > 0.08) {
            // Forward scrolling: hardware decode playback
            if (diff > 1.2 && !vid.seeking) {
              vid.currentTime = target - 0.15;
            }
            const rate = Math.min(2.8, Math.max(0.75, diff * 2.0));
            vid.playbackRate = rate;
            safePlay();

            if (statusLabelRef.current) {
              statusLabelRef.current.textContent = isAr ? "تفاعل التمرير" : "SCROLLING";
            }
          } else if (diff < -0.08) {
            // Backward scrolling: pause forward playback
            safePause();

            // Guard against decoder overload: never seek while previous seek is decoding
            const isDecoderBusy = vid.seeking && now - lastSeekTimeRef.current < 250;
            if (!isDecoderBusy && now - lastSeekTimeRef.current >= 40) {
              lastSeekTimeRef.current = now;
              const nextTime = diff < -0.8 ? target : current + (target - current) * 0.45;
              const boundedTime = Math.max(0, Math.min(vid.duration - 0.02, nextTime));

              if (typeof vid.fastSeek === "function") {
                vid.fastSeek(boundedTime);
              } else {
                vid.currentTime = boundedTime;
              }
            }

            if (statusLabelRef.current) {
              statusLabelRef.current.textContent = isAr ? "تراجع مع التمرير" : "REWIND";
            }
          } else {
            // In sync with scroll position
            safePause();
            if (statusLabelRef.current) {
              statusLabelRef.current.textContent = isAr ? "متزامن مع التمرير" : "SCROLL SYNC";
            }
          }
        } else {
          // User is NOT scrolling: strictly pause video
          safePause();

          // Settle precisely on target when idle if slightly misaligned
          const isDecoderBusy = vid.seeking && now - lastSeekTimeRef.current < 250;
          if (Math.abs(diff) > 0.06 && !isDecoderBusy && now - lastSeekTimeRef.current >= 60) {
            lastSeekTimeRef.current = now;
            const finalTime = Math.max(0, Math.min(vid.duration - 0.02, target));
            if (typeof vid.fastSeek === "function") {
              vid.fastSeek(finalTime);
            } else {
              vid.currentTime = finalTime;
            }
          }

          if (statusLabelRef.current) {
            statusLabelRef.current.textContent = isAr ? "متزامن مع التمرير" : "SCROLL SYNC";
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(renderLoop);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScrollTarget();
    rafIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      safePause();
    };
  }, [playbackMode, safePlay, safePause, isAr]);

  // Mode change handler
  const togglePlaybackMode = useCallback(() => {
    setPlaybackMode((prev) => (prev === "scroll" ? "auto" : "scroll"));
  }, []);

  // Audio toggle
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  return (
    <>
      {/* Fixed Background Video Canvas */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-transparent"
        aria-hidden="true"
      >
        <div
          ref={videoWrapperRef}
          className="absolute inset-0 w-full h-full"
          style={{
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            willChange: "transform",
            opacity: 1,
          }}
        >
          <video
            ref={videoRef}
            src={DEFAULT_VIDEO_URL}
            loop={playbackMode === "auto"}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            className="w-full h-full object-cover object-center"
          >
            <source src={DEFAULT_VIDEO_URL} type="video/mp4" />
          </video>
        </div>

        {/* Crystal Clear Balanced Video Background Overlays (طبقة متوازنة لصفاء ووضوح الفيديو بالكامل) */}
        {/* 1. Subtle Dark Contrast Veil to keep text readable while video is 100% clear */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f17]/25 via-[#0b1426]/15 to-[#0b0f17]/35 pointer-events-none" />

        {/* 2. Soft Cyber Blue Ambiance */}
        <div className="absolute inset-0 bg-blue-600/[0.05] pointer-events-none" />

        {/* 3. Soft Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_65%,rgba(11,15,23,0.15)_85%,rgba(11,15,23,0.35)_100%)] pointer-events-none" />

        {/* 4. Fine Cyber Grid for GSM Aesthetic */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.025)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000_60%,transparent_100%)] pointer-events-none opacity-20"
        />

        {/* 5. Top Edge Fade for Header Legibility */}
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#0b0f17]/50 via-[#0b0f17]/15 to-transparent pointer-events-none" />

        {/* 6. Subtle Bottom Edge Fade */}
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#0b0f17]/25 to-transparent pointer-events-none" />
      </div>

      {/* Floating Control Pill */}
      <div
        className="fixed bottom-5 end-5 z-40 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0b1220]/80 backdrop-blur-xl border border-sky-400/40 shadow-[0_8px_25px_rgba(0,0,0,0.6),0_0_15px_rgba(56,189,248,0.2)] text-xs text-slate-300 transition-all hover:border-sky-400/70 pointer-events-auto"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
        </span>

        <span
          ref={statusLabelRef}
          className="font-mono text-[11px] font-bold text-sky-300 tracking-wider hidden sm:inline"
        >
          {playbackMode === "scroll"
            ? (isAr ? "متزامن مع التمرير" : "SCROLL SYNC")
            : (isAr ? "تشغيل تلقائي" : "AUTO LOOP")}
        </span>

        <span ref={progressTextRef} className="font-mono text-[10px] text-slate-400 font-semibold">
          0%
        </span>

        <span className="w-[1px] h-3 bg-white/15" />

        {/* Mode Toggle Button */}
        <button
          type="button"
          onClick={togglePlaybackMode}
          title={
            playbackMode === "scroll"
              ? (isAr ? "التحويل للتشغيل التلقائي" : "Switch to Auto Loop")
              : (isAr ? "التحويل للتحكم مع التمرير" : "Switch to Scroll Sync")
          }
          className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 font-mono text-[10px] font-bold text-sky-300 transition-colors flex items-center gap-1"
        >
          <i
            className={`fas ${
              playbackMode === "scroll" ? "fa-mouse" : "fa-sync-alt"
            } text-[10px] text-sky-400`}
          />
          <span className="hidden md:inline">
            {playbackMode === "scroll"
              ? (isAr ? "مع التمرير" : "Scroll")
              : (isAr ? "تلقائي" : "Auto")}
          </span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          type="button"
          onClick={toggleMute}
          aria-label={
            isMuted
              ? (isAr ? "تشغيل الصوت" : "Unmute audio")
              : (isAr ? "كتم الصوت" : "Mute audio")
          }
          className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-200 hover:text-white transition-colors"
        >
          <i
            className={`fas ${isMuted ? "fa-volume-mute" : "fa-volume-up"} text-sky-400 text-[11px]`}
          />
        </button>
      </div>
    </>
  );
}
