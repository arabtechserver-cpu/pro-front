"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

interface HeroScrollVideoBackgroundProps {
  lang: string;
}

const DEFAULT_VIDEO_URL =
  process.env.NEXT_PUBLIC_HERO_VIDEO_URL ||
  "https://pub-3440f02b971d4054906dd63d89e3cdb0.r2.dev/hero-showcase.mp4";

const POSTER_URL = "/videos/hero_poster.jpg";
const DESKTOP_MEDIA_QUERY = "(min-width: 769px) and (prefers-reduced-motion: no-preference)";

export default function HeroScrollVideoBackground({ lang }: HeroScrollVideoBackgroundProps) {
  const isAr = lang === "ar";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastSeekTimeRef = useRef(0);
  const targetTimeRef = useRef(0);

  // Keep the first render lightweight. On mobile the poster remains the final background,
  // so the browser never downloads or repeatedly decodes a large video while touch-scrolling.
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<"scroll" | "auto">("scroll");
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const updateVideoEligibility = () => setShouldRenderVideo(mediaQuery.matches);

    updateVideoEligibility();
    mediaQuery.addEventListener("change", updateVideoEligibility);
    return () => mediaQuery.removeEventListener("change", updateVideoEligibility);
  }, []);

  const safePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.paused || playPromiseRef.current) return;

    try {
      const playPromise = video.play();
      if (playPromise) {
        playPromiseRef.current = playPromise;
        playPromise.catch(() => {}).finally(() => {
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
      void playPromiseRef.current.then(pause).catch(pause);
      return;
    }

    pause();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.pause();
  }, [shouldRenderVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldRenderVideo) return;

    if (playbackMode === "auto") {
      video.playbackRate = 0.85;
      safePlay();
      return safePause;
    }

    // Seeking on every animation frame was forcing mobile-class decoders to continuously
    // discard frames. Limit seeks and only do work in response to an actual scroll/resize.
    const syncToScroll = () => {
      frameRef.current = null;
      if (!video.duration || Number.isNaN(video.duration) || video.seeking) return;

      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      const target = progress * Math.max(0, video.duration - 0.05);
      targetTimeRef.current = target;

      const now = performance.now();
      if (Math.abs(video.currentTime - target) < 0.12 || now - lastSeekTimeRef.current < 100) return;

      lastSeekTimeRef.current = now;
      try {
        if (typeof video.fastSeek === "function") {
          video.fastSeek(target);
        } else {
          video.currentTime = target;
        }
      } catch {}
    };

    const scheduleSync = () => {
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(syncToScroll);
      }
    };

    const handleSeeked = () => {
      // Apply the newest scroll position once the decoder is ready, rather than queueing seeks.
      if (Math.abs(video.currentTime - targetTimeRef.current) >= 0.12) scheduleSync();
    };

    video.pause();
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("loadedmetadata", scheduleSync);
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync, { passive: true });
    scheduleSync();

    return () => {
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("loadedmetadata", scheduleSync);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      safePause();
    };
  }, [playbackMode, safePause, safePlay, shouldRenderVideo]);

  const togglePlaybackMode = useCallback(() => {
    setPlaybackMode((mode) => (mode === "scroll" ? "auto" : "scroll"));
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  return (
    <>
      <div
        id="homepage-motion-background"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#0b0f17]"
        aria-hidden="true"
      >
        <img
          src={POSTER_URL}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {shouldRenderVideo && (
          <video
            ref={videoRef}
            src={DEFAULT_VIDEO_URL}
            poster={POSTER_URL}
            loop={playbackMode === "auto"}
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            disableRemotePlayback
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f17]/25 via-[#0b1426]/15 to-[#0b0f17]/35" />
        <div className="absolute inset-0 bg-blue-600/[0.05]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_65%,rgba(11,15,23,0.15)_85%,rgba(11,15,23,0.35)_100%)]" />
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#0b0f17]/50 via-[#0b0f17]/15 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#0b0f17]/25 to-transparent" />
      </div>

      {shouldRenderVideo && (
        <div className="fixed bottom-5 end-5 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b1220]/80 backdrop-blur-xl border border-sky-400/40 shadow-[0_8px_25px_rgba(0,0,0,0.6)] text-xs text-slate-300 pointer-events-auto">
          <span className="font-mono text-[10px] text-sky-300 font-bold hidden sm:inline">
            {playbackMode === "scroll"
              ? (isAr ? "متزامن مع التمرير" : "SCROLL SYNC")
              : (isAr ? "تشغيل تلقائي" : "AUTO LOOP")}
          </span>
          <button
            type="button"
            onClick={togglePlaybackMode}
            title={playbackMode === "scroll"
              ? (isAr ? "التحويل للتشغيل التلقائي" : "Switch to Auto Loop")
              : (isAr ? "التحويل للتحكم مع التمرير" : "Switch to Scroll Sync")}
            className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 font-mono text-[10px] font-bold text-sky-300 transition-colors"
          >
            {playbackMode === "scroll" ? (isAr ? "تمرير" : "Scroll") : (isAr ? "تلقائي" : "Auto")}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? (isAr ? "تشغيل الصوت" : "Unmute audio") : (isAr ? "كتم الصوت" : "Mute audio")}
            className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-200"
          >
            <i className={`fas ${isMuted ? "fa-volume-mute" : "fa-volume-up"} text-sky-400 text-[11px]`} />
          </button>
        </div>
      )}
    </>
  );
}
