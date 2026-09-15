"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

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

  const [playbackMode, setPlaybackMode] = useState<"scroll" | "auto">("scroll");
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let blobUrl: string | null = null;

    fetch(LOCAL_SCRUB_URL, { cache: "force-cache" })
      .then((res) => {
        if (!res.ok) throw new Error("Scrub video fetch failed");
        return res.blob();
      })
      .then((blob) => {
        if (isCancelled) return;
        blobUrl = URL.createObjectURL(blob);
        const video = videoRef.current;
        if (video) {
          const currentTime = video.currentTime;
          video.src = blobUrl;
          video.currentTime = currentTime;
          setIsVideoReady(true);
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, []);

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

    const pause = () => {
      if (!video.paused) video.pause();
    };

    if (playPromiseRef.current) {
      playPromiseRef.current.then(pause).catch(pause);
    } else {
      pause();
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
  }, []);

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

    video.loop = false;
    safePause();

    let rafId: number | null = null;
    let currentProgress = 0;

    const updateScrollTarget = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const scrollY = window.scrollY || window.pageYOffset || 0;
      targetProgressRef.current = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    };

    window.addEventListener("scroll", updateScrollTarget, { passive: true });
    window.addEventListener("resize", updateScrollTarget, { passive: true });
    updateScrollTarget();

    const loop = () => {
      if (video && video.duration && !Number.isNaN(video.duration)) {
        const target = targetProgressRef.current;
        currentProgress += (target - currentProgress) * 0.18;

        const targetTime = currentProgress * Math.max(0, video.duration - 0.05);

        if (!video.seeking && Math.abs(video.currentTime - targetTime) > 0.02) {
          try {
            if (typeof (video as any).fastSeek === "function") {
              (video as any).fastSeek(targetTime);
            } else {
              video.currentTime = targetTime;
            }
          } catch {}
        }
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("scroll", updateScrollTarget);
      window.removeEventListener("resize", updateScrollTarget);
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
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#0b0f17]"
        style={{ width: "100vw", height: "100vh", isolation: "isolate" }}
        aria-hidden="true"
      >
        <img
          src={POSTER_URL}
          alt=""
          aria-hidden="true"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
            isVideoReady ? "opacity-0" : "opacity-100"
          }`}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />

        <video
          ref={videoRef}
          poster={POSTER_URL}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          onLoadedData={() => setIsVideoReady(true)}
          onCanPlay={() => setIsVideoReady(true)}
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            willChange: "transform",
          }}
        >
          <source src={LOCAL_SCRUB_URL} type="video/mp4" />
          <source src={REMOTE_VIDEO_URL} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f17]/30 via-[#0b1426]/20 to-[#0b0f17]/45" />
        <div className="absolute inset-0 bg-blue-600/[0.04]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(11,15,23,0.25)_85%,rgba(11,15,23,0.5)_100%)]" />
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-[#0b0f17]/60 via-[#0b0f17]/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#0b0f17]/40 to-transparent" />
      </div>

      <div className="fixed bottom-5 end-5 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b1220]/80 backdrop-blur-xl border border-sky-400/40 shadow-[0_8px_25px_rgba(0,0,0,0.6)] text-xs text-slate-300 pointer-events-auto">
        <span className="font-mono text-[10px] text-sky-300 font-bold hidden sm:inline">
          {playbackMode === "scroll"
            ? (isAr ? "متزامن مع التمرير" : "SCROLL SYNC")
            : (isAr ? "تشغيل تلقائي" : "AUTO LOOP")}
        </span>
        <button
          type="button"
          onClick={togglePlaybackMode}
          title={
            playbackMode === "scroll"
              ? (isAr ? "التحويل للتشغيل التلقائي" : "Switch to Auto Loop")
              : (isAr ? "التحويل للتحكم مع التمرير" : "Switch to Scroll Sync")
          }
          className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 font-mono text-[10px] font-bold text-sky-300 transition-colors"
        >
          {playbackMode === "scroll" ? (isAr ? "تمرير" : "Scroll") : (isAr ? "تلقائي" : "Auto")}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? (isAr ? "تشغيل الصوت" : "Unmute audio") : (isAr ? "كتم الصوت" : "Mute audio")}
          title={isMuted ? (isAr ? "تشغيل الصوت" : "Unmute audio") : (isAr ? "كتم الصوت" : "Mute audio")}
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sky-300 transition-colors"
        >
          <i className={`fas ${isMuted ? "fa-volume-mute" : "fa-volume-up"} text-[10px]`} />
        </button>
      </div>
    </>
  );
}
