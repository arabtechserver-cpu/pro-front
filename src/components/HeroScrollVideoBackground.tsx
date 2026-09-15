"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

interface HeroScrollVideoBackgroundProps {
  lang: string;
}

const POSTER_URL = "/videos/hero_poster.jpg";
const LOCAL_VIDEO_URL = "/videos/hero-showcase.mp4";
const REMOTE_VIDEO_URL =
  process.env.NEXT_PUBLIC_HERO_VIDEO_URL ||
  "https://pub-3440f02b971d4054906dd63d89e3cdb0.r2.dev/hero-showcase.mp4";

export default function HeroScrollVideoBackground({ lang }: HeroScrollVideoBackgroundProps) {
  const isAr = lang === "ar";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const safePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    const promise = video.play();
    if (promise !== undefined) {
      playPromiseRef.current = promise;
      promise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        })
        .finally(() => {
          playPromiseRef.current = null;
        });
    }
  }, [isMuted]);

  const safePause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const pause = () => {
      video.pause();
      setIsPlaying(false);
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
    video.playbackRate = 1.0;

    const tryAutoPlay = () => {
      const promise = video.play();
      if (promise !== undefined) {
        promise
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
            const handleFirstGesture = () => {
              video.play().then(() => setIsPlaying(true)).catch(() => {});
              window.removeEventListener("touchstart", handleFirstGesture);
              window.removeEventListener("pointerdown", handleFirstGesture);
              window.removeEventListener("scroll", handleFirstGesture);
            };
            window.addEventListener("touchstart", handleFirstGesture, { passive: true, once: true });
            window.addEventListener("pointerdown", handleFirstGesture, { passive: true, once: true });
            window.addEventListener("scroll", handleFirstGesture, { passive: true, once: true });
          });
      }
    };

    tryAutoPlay();

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        safePause();
      } else if (isPlaying) {
        safePlay();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [safePause, safePlay]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            const scrollY = window.scrollY || window.pageYOffset;
            const offset = Math.min(scrollY * 0.12, 120);
            containerRef.current.style.transform = `translate3d(0, ${-offset}px, 0)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      safePause();
    } else {
      safePlay();
    }
  }, [isPlaying, safePause, safePlay]);

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
        aria-hidden="true"
      >
        <div
          ref={containerRef}
          className="absolute -inset-y-16 inset-x-0 w-full h-[calc(100%+128px)] will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)", backfaceVisibility: "hidden" }}
        >
          <img
            src={POSTER_URL}
            alt=""
            aria-hidden="true"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
              isLoaded ? "opacity-0" : "opacity-100"
            }`}
          />

          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            poster={POSTER_URL}
            onPlaying={() => setIsLoaded(true)}
            onLoadedData={() => setIsLoaded(true)}
            className="absolute inset-0 h-full w-full object-cover object-center"
          >
            <source src={LOCAL_VIDEO_URL} type="video/mp4" />
            <source src={REMOTE_VIDEO_URL} type="video/mp4" />
          </video>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f17]/30 via-[#0b1426]/20 to-[#0b0f17]/45" />
        <div className="absolute inset-0 bg-blue-600/[0.04]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(11,15,23,0.25)_85%,rgba(11,15,23,0.5)_100%)]" />
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-[#0b0f17]/60 via-[#0b0f17]/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#0b0f17]/40 to-transparent" />
      </div>

      <div className="fixed bottom-5 end-5 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b1220]/80 backdrop-blur-xl border border-sky-400/40 shadow-[0_8px_25px_rgba(0,0,0,0.6)] text-xs text-slate-300 pointer-events-auto">
        <span className="font-mono text-[10px] text-sky-300 font-bold hidden sm:inline">
          {isAr ? "خلفية سينمائية" : "CINEMATIC BG"}
        </span>
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? (isAr ? "إيقاف مؤقت" : "Pause") : (isAr ? "تشغيل" : "Play")}
          title={isPlaying ? (isAr ? "إيقاف مؤقت" : "Pause") : (isAr ? "تشغيل" : "Play")}
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sky-300 transition-colors"
        >
          <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"} text-[10px]`} />
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
