"use client";

import { useEffect, useState } from "react";
import heroStyles from "./ProfileHero.module.css";

const GRATITUDE_MESSAGES = [
  {
    ar: "شكراً على ثقتكم بـ عرب تيك — اختياركم لنا هو سر تميزنا ونجاحنا الدائم.",
    en: "Thank you for trusting Arab Tech — your confidence drives our excellence every day.",
  },
  {
    ar: "عرب تيك معك خطوة بخطوة — سرعة في التنفيذ، أمان كامل، ودعم يليق بك.",
    en: "Arab Tech stands with you — fast execution, full security, and dedicated support.",
  },
  {
    ar: "نعتز بانضمامك لعائلة عرب تيك — ثقتك بنا محل تقديرنا ونسعد دائماً بخدمتك.",
    en: "Proud to have you in the Arab Tech family — your trust inspires our highest quality.",
  },
];

export default function ProfileGratitudeBanner({ isAr }: { isAr: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % GRATITUDE_MESSAGES.length);
    }, 4600);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion]);

  const current = GRATITUDE_MESSAGES[index];

  return (
    <div
      className={`${heroStyles.gratitudeBar} relative z-10 mb-5 sm:mb-6`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-[11px] font-black shrink-0">
          <span className={heroStyles.gratitudeDot} aria-hidden="true" />
          <span className="material-symbols-outlined text-[14px]">verified</span>
          <span>{isAr ? "عرب تيك" : "Arab Tech"}</span>
        </span>

        <p
          key={index}
          className={`${heroStyles.gratitudeText} text-xs sm:text-sm font-extrabold leading-relaxed`}
        >
          {isAr ? current.ar : current.en}
        </p>
      </div>

      <div
        className={heroStyles.gratitudeDots}
        role="tablist"
        aria-label={isAr ? "رسائل الترحيب" : "Welcome messages"}
      >
        {GRATITUDE_MESSAGES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-selected={idx === index}
            aria-label={isAr ? `الرسالة ${idx + 1}` : `Message ${idx + 1}`}
            onClick={() => setIndex(idx)}
            className={`${heroStyles.gratitudeDotBtn} ${idx === index ? heroStyles.gratitudeDotBtnActive : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
