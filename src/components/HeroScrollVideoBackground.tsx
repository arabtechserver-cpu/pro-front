"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Film, ScrollText } from "lucide-react";

interface HeroScrollVideoBackgroundProps {
  lang: string;
}

const POSTER_URL = "/videos/hero_poster.jpg";
const LOCAL_SCRUB_URL = "/videos/hero_scrub.mp4";
const REMOTE_VIDEO_URL =
  process.env.NEXT_PUBLIC_HERO_VIDEO_URL ||
  "https://pub-3440f02b971d4054906dd63d89e3cdb0.r2.dev/hero-showcase.mp4";

export default function HeroScrollVideoBackground({ lang }: HeroScrollVideoBackgroundProps) {
  const isAr = lang === "ar";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const targetProgressRef = useRef<number>(0);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Default mode is 'scroll' per user requirement
  const [playbackMode, setPlaybackMode] = useState<"scroll" | "auto">("scroll");
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);

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

    const doPause = () => {
      if (!video.paused) {
        try {
          video.pause();
        } catch {}
      }
    };

    if (playPromiseRef.current) {
      playPromiseRef.current.then(doPause).catch(doPause);
    } else {
      doPause();
    }
  }, []);

  // Ensure muted attributes for full autoplay and hardware acceleration support
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const handleReady = () => {
      setIsVideoReady(true);
    };

    if (video.readyState >= 2) {
      setIsVideoReady(true);
    } else {
      video.addEventListener("loadeddata", handleReady);
      video.addEventListener("canplay", handleReady);
    }

    return () => {
      video.removeEventListener("loadeddata", handleReady);
      video.removeEventListener("canplay", handleReady);
    };
  }, []);

  // Main playback controller
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playbackMode === "auto") {
      video.playbackRate = 0.85;
      video.loop = true;
      safePlay();
      return () => {
        safePause();
      };
    }

    // Scroll mode: driven dynamically by scroll progress
    video.loop = false;

    let rafId: number | null = null;
    let smoothProgress = 0;
    let isSeeking = false;
    let lastSeekTime = 0;

    const handleSeeked = () => {
      isSeeking = false;
    };
    video.addEventListener("seeked", handleSeeked);

    const updateScrollTarget = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;
      const maxScroll = Math.max(scrollHeight - clientHeight, 1);
      const scrollY = window.scrollY || window.pageYOffset || 0;
      targetProgressRef.current = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    };

    window.addEventListener("scroll", updateScrollTarget, { passive: true });
    window.addEventListener("resize", updateScrollTarget, { passive: true });
    updateScrollTarget();
    smoothProgress = targetProgressRef.current;

    const loop = (now: number) => {
      if (video) {
        const duration = video.duration;
        if (duration && !Number.isNaN(duration) && duration > 0) {
          const target = targetProgressRef.current;
          
          // Responsive smoothing factor
          smoothProgress += (target - smoothProgress) * 0.22;

          const targetTime = smoothProgress * Math.max(0, duration - 0.05);
          const currentTime = video.currentTime;
          const diff = targetTime - currentTime;

          // Case 1: Forward scrolling (user scrolling down)
          if (diff > 0.035) {
            if (diff > 1.6) {
              // Rapid jump / large gap: fast seek closer to target
              if (!isSeeking && now - lastSeekTime > 50) {
                lastSeekTime = now;
                isSeeking = true;
                try {
                  if (typeof (video as any).fastSeek === "function") {
                    (video as any).fastSeek(targetTime);
                  } else {
                    video.currentTime = targetTime;
                  }
                } catch {}
              }
            } else {
              // Normal forward scrolling: play smoothly forward using playbackRate without seeking!
              // Sequential GPU decoding eliminates all seek freezes
              const dynamicRate = Math.min(Math.max(diff * 3.0, 0.5), 3.2);
              if (Math.abs(video.playbackRate - dynamicRate) > 0.1) {
                video.playbackRate = dynamicRate;
              }
              if (video.paused && !playPromiseRef.current) {
                safePlay();
              }
            }
          } 
          // Case 2: In sync / at target / scroll stopped
          else if (diff >= -0.035) {
            if (!video.paused) {
              safePause();
            }
          } 
          // Case 3: Backward scrolling (user scrolling up)
          else {
            if (!video.paused) {
              safePause();
            }
            // Throttled backward seek to avoid decoder queuing
            if (!isSeeking && !video.seeking && now - lastSeekTime > 40) {
              lastSeekTime = now;
              isSeeking = true;
              try {
                if (typeof (video as any).fastSeek === "function") {
                  (video as any).fastSeek(targetTime);
                } else {
                  video.currentTime = targetTime;
                }
              } catch {}
            }
          }
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("scroll", updateScrollTarget);
      window.removeEventListener("resize", updateScrollTarget);
      video.removeEventListener("seeked", handleSeeked);
      if (rafId !== null) cancelAnimationFrame(rafId);
      safePause();
    };
  }, [playbackMode, safePause, safePlay]);

  const togglePlaybackMode = useCallback(() => {
    setPlaybackMode((prev) => (prev === "scroll" ? "auto" : "scroll"));
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  return (
    <>
      <div
        id="homepage-motion-background"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#090e17]"
        style={{ 
          width: "100vw", 
          height: "100vh", 
          isolation: "isolate",
          contain: "strict",
          transform: "translate3d(0, 0, 0)",
          willChange: "transform",
          backfaceVisibility: "hidden"
        }}
        aria-hidden="true"
      >
        <img
          src={POSTER_URL}
          alt=""
          aria-hidden="true"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${
            isVideoReady ? "opacity-0" : "opacity-100"
          }`}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />

        <video
          ref={videoRef}
          src={LOCAL_SCRUB_URL}
          poster={POSTER_URL}
          muted
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
            willChange: "transform",
          }}
        >
          <source src={LOCAL_SCRUB_URL} type="video/mp4" />
          <source src={REMOTE_VIDEO_URL} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-[#090e17]/40 via-[#0b1426]/25 to-[#090e17]/60" />
        <div className="absolute inset-0 bg-blue-600/[0.03]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(9,14,23,0.3)_85%,rgba(9,14,23,0.6)_100%)]" />
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#090e17]/80 via-[#090e17]/30 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#090e17]/60 to-transparent" />
      </div>

      <div className="fixed bottom-5 end-5 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b1322]/85 backdrop-blur-xl border border-sky-400/30 shadow-xl text-xs text-slate-300 pointer-events-auto">
        <span className="font-mono text-[10px] text-sky-300 font-bold hidden sm:inline">
          {playbackMode === "scroll"
            ? (isAr ? "متزامن مع التمرير" : "SCROLL SYNC")
            : (isAr ? "تشغيل تلقائي سلس" : "CINEMATIC LOOP")}
        </span>
        <button
          type="button"
          onClick={togglePlaybackMode}
          title={
            playbackMode === "scroll"
              ? (isAr ? "التحويل للتشغيل التلقائي المستمر" : "Switch to Smooth Loop")
              : (isAr ? "التحويل للتحكم مع التمرير" : "Switch to Scroll Sync")
          }
          className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 font-mono text-[10px] font-bold text-sky-300 transition-colors flex items-center gap-1"
        >
          {playbackMode === "scroll" ? (
            <>
              <ScrollText className="w-3 h-3 text-sky-400" />
              <span>{isAr ? "تمرير" : "Scroll"}</span>
            </>
          ) : (
            <>
              <Film className="w-3 h-3 text-sky-400" />
              <span>{isAr ? "تلقائي" : "Auto"}</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? (isAr ? "تشغيل الصوت" : "Unmute audio") : (isAr ? "كتم الصوت" : "Mute audio")}
          title={isMuted ? (isAr ? "تشغيل الصوت" : "Unmute audio") : (isAr ? "كتم الصوت" : "Mute audio")}
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sky-300 transition-colors"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </>
  );
}
