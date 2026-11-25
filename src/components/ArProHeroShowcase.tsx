"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Package,
  Receipt,
  Smartphone,
  Wrench,
} from "lucide-react";
import styles from "./StorefrontHome.module.css";

const SHOWCASE_SLIDES = [
  {
    src: "/images/ar-pro/sales.webp",
    icon: Receipt,
    labelAr: "نقطة البيع",
    labelEn: "POS Cashier",
    summaryAr: "فواتير سريعة، باركود ومرتجعات في ثوانٍ",
    summaryEn: "Fast barcode billing, invoices & returns",
  },
  {
    src: "/images/ar-pro/repairs.webp",
    icon: Wrench,
    labelAr: "إدارة الصيانة",
    labelEn: "Repairs",
    summaryAr: "تتبع كل جهاز من الاستلام حتى التسليم",
    summaryEn: "Track every device from intake to pickup",
  },
  {
    src: "/images/ar-pro/phone-lab.webp",
    icon: Smartphone,
    labelAr: "مختبر الهواتف",
    labelEn: "Phone Lab",
    summaryAr: "فحص USB وأدوات الفنيين من نفس الشاشة",
    summaryEn: "USB diagnostics & technician tools built in",
  },
  {
    src: "/images/ar-pro/inventory.webp",
    icon: Package,
    labelAr: "المخزون",
    labelEn: "Inventory",
    summaryAr: "جرد فوري وتنبيهات قبل نفاد قطع الغيار",
    summaryEn: "Live stock control & low-stock alerts",
  },
  {
    src: "/images/ar-pro/reports.webp",
    icon: BarChart3,
    labelAr: "التقارير والأرباح",
    labelEn: "Reports",
    summaryAr: "ملخص الخزنة والمصروفات وصافي الربح اليومي",
    summaryEn: "Daily cash drawer, expenses & net profit",
  },
];

export default function ArProHeroShowcase({ lang }: { lang: "ar" | "en" }) {
  const ar = lang === "ar";
  const t = (arabic: string, english: string) => (ar ? arabic : english);
  const base = `/${lang}`;
  const Arrow = ar ? ArrowLeft : ArrowRight;

  const [active, setActive] = useState(0);
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
      setActive((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion]);

  const currentSlide = SHOWCASE_SLIDES[active];
  const stepSlide = (delta: number) =>
    setActive((prev) => (prev + delta + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length);

  return (
    <div
      data-motion-scene
      className={`${styles.hero} ${styles.arProHero}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>
          <i className={styles.liveDot} aria-hidden="true" />
          {t("حصرياً · برنامج ar-pro للكمبيوتر", "Exclusive · ar-pro for Windows")}
        </span>
        <h1>
          {t("أدِر محل الموبايل.", "Run your phone shop.")}
          <strong>
            {t("كاشير، مخزون وصيانة في شاشة واحدة.", "POS, stock & repairs in one app.")}
          </strong>
        </h1>
        <p>
          {t(
            "برنامج سطح مكتب احترافي لمحلات الهواتف على ويندوز — جرّبه 3 أيام مجاناً وابدأ تنظيم مبيعاتك وأجهزة الصيانة بسهولة.",
            "A desktop app built for Windows phone shops — try it free for 3 days and run sales, stock, and repairs smoothly."
          )}
        </p>

        <ul className={styles.arProHighlights}>
          <li>
            <CheckCircle2 size={14} />
            <span>{t("تجربة 3 أيام مجاناً", "3-day free trial")}</span>
          </li>
          <li>
            <CheckCircle2 size={14} />
            <span>{t("يعمل على ويندوز", "Windows desktop")}</span>
          </li>
          <li>
            <CheckCircle2 size={14} />
            <span>{t("فواتير وصيانة وتقارير", "POS, repairs & reports")}</span>
          </li>
        </ul>

        <div className={styles.arProActions}>
          <Link className={styles.limeButton} href={`${base}/ar-pro`}>
            {t("اكتشف أداة ar-pro", "Explore ar-pro")}
            <Arrow size={19} />
          </Link>
          <Link className={styles.arProGhostBtn} href={`${base}/ar-pro#plans`}>
            {t("الباقات والتحميل", "Plans & download")}
          </Link>
        </div>
      </div>

      <div className={styles.arProStage}>
        <Link
          href={`${base}/ar-pro`}
          className={styles.arProWindow}
          aria-label={t(
            `معاينة شاشة ${currentSlide.labelAr} — الانتقال لصفحة ar-pro`,
            `Preview ${currentSlide.labelEn} screen — open ar-pro page`
          )}
        >
          <div className={styles.arProWindowBar}>
            <div className={styles.arProWindowDots} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className={styles.arProWindowTitle}>
              <Monitor size={13} />
              <span dir="ltr">ar-pro · Windows</span>
            </span>
            <span className={styles.arProWindowBadge}>
              {ar ? currentSlide.labelAr : currentSlide.labelEn}
            </span>
          </div>

          <div className={styles.arProViewport}>
            {SHOWCASE_SLIDES.map((item, idx) => (
              <img
                key={item.src}
                src={item.src}
                alt={ar ? `${item.labelAr} - ar-pro` : `${item.labelEn} - ar-pro`}
                width={1280}
                height={800}
                fetchPriority={idx === 0 ? "high" : undefined}
                loading={idx === 0 ? "eager" : "lazy"}
                className={`${styles.arProSlide} ${idx === active ? styles.arProSlideActive : ""}`}
              />
            ))}

            <div className={styles.arProCaption}>
              <strong>{ar ? currentSlide.labelAr : currentSlide.labelEn}</strong>
              <span>{ar ? currentSlide.summaryAr : currentSlide.summaryEn}</span>
            </div>

            {!reducedMotion && (
              <div className={styles.arProProgressTrack} aria-hidden="true">
                <span
                  key={`${active}-${paused}`}
                  className={styles.arProProgressBar}
                  style={{ animationPlayState: paused ? "paused" : "running" }}
                />
              </div>
            )}
          </div>
        </Link>

        <div className={styles.arProControls}>
          <div className={styles.arProTabs} role="tablist" aria-label={t("شاشات برنامج ar-pro", "ar-pro screens")}>
            {SHOWCASE_SLIDES.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === active;
              return (
                <button
                  key={item.src}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActive(idx)}
                  className={`${styles.arProTab} ${isSelected ? styles.arProTabActive : ""}`}
                >
                  <Icon size={13} />
                  <span>{ar ? item.labelAr : item.labelEn}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.arProNavGroup}>
            <button
              type="button"
              onClick={() => stepSlide(-1)}
              className={styles.arProNavBtn}
              aria-label={t("الشاشة السابقة", "Previous screen")}
            >
              {ar ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <button
              type="button"
              onClick={() => stepSlide(1)}
              className={styles.arProNavBtn}
              aria-label={t("الشاشة التالية", "Next screen")}
            >
              {ar ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
