"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, CreditCard, Pause, Play, Satellite, ShieldCheck, Sparkles } from "lucide-react";
import { digitalServices } from "@/lib/digital-services";
import styles from "./DigitalServices.module.css";
import useServiceCarousel from "./useServiceCarousel";

export default function DigitalServices({ lang }: { lang: "ar" | "en" }) {
  const ar = lang === "ar";
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const Previous = ar ? ChevronRight : ChevronLeft;
  const Next = ar ? ChevronLeft : ChevronRight;
  const carousel = useServiceCarousel(digitalServices.length);
  const icons = { visa: CreditCard, starlink: Satellite, verification: ShieldCheck };
  return <section className={styles.section} aria-labelledby="digital-services-heading">
    <div data-reveal className={styles.heading}>
      <div>
        <span className={styles.kicker}><Sparkles size={15} aria-hidden="true" />{ar ? "تفعيلات وخدمات إلكترونية" : "Activations & digital services"}</span>
        <h2 id="digital-services-heading">{ar ? "خدماتك الرقمية، بخطوة أقرب." : "Your digital services, one step closer."}</h2>
      </div>
      <p>{ar ? "بطاقات افتراضية، اتصال ستارلينك، ومساعدة في توثيق حساباتك. اختار خدمتك وسيب الباقي علينا." : "Virtual cards, Starlink connectivity and account verification assistance. Choose a service and talk to our team."}</p>
    </div>
    <div className={styles.carousel}
      onPointerEnter={event => { if (event.pointerType === "mouse") carousel.setHovered(true); }}
      onPointerLeave={() => carousel.setHovered(false)}
      onFocusCapture={() => carousel.setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) carousel.setFocused(false); }}>
    <div className={styles.carouselToolbar}>
      <p className={styles.swipeHint} id="digital-services-swipe-hint">{ar ? "اكتشف خدمات أكتر" : "Discover more services"}<Arrow size={16} aria-hidden="true" /></p>
      <span className={styles.counter} aria-hidden="true">{carousel.active + 1} / {digitalServices.length}</span>
    </div>
    <div ref={carousel.gridRef} id="digital-services-cards" className={styles.grid} role="group" aria-labelledby="digital-services-heading" aria-describedby="digital-services-swipe-hint" tabIndex={0} onPointerDown={() => carousel.setDragging(true)}>
      {digitalServices.map((service, index) => {
        const Icon = icons[service.variant];
        return <article data-reveal key={service.id} className={`${styles.card} ${styles[service.variant]}`} role="group" aria-roledescription={ar ? "بطاقة خدمة" : "slide"} aria-label={`${index + 1} / ${digitalServices.length}: ${service.name[lang]}`}>
          <div className={styles.cardTop}><span><Icon size={15} aria-hidden="true" />{service.tag[lang]}</span><span className={styles.cornerMark} aria-hidden="true">↗</span></div>
          <div className={styles.art}><img src={`/images/homepage/${service.image}`} alt={service.alt[lang]} width={880} height={service.variant === "starlink" ? 660 : 880} loading="lazy" decoding="async" /></div>
          <div className={styles.copy}>
            <h3>{service.name[lang]}</h3>
            <p>{service.description[lang]}</p>
            <Link href={`/${lang}/contact?service=${service.id}`} className={styles.action}>{service.action[lang]}<Arrow size={18} aria-hidden="true" /></Link>
          </div>
        </article>;
      })}
    </div>
    <div className={styles.carouselControls} role="group" aria-label={ar ? "التنقل بين الخدمات" : "Service navigation"}>
      <button type="button" className={styles.navButton} onClick={() => carousel.goTo(carousel.active - 1)} aria-label={ar ? "الخدمة السابقة" : "Previous service"} aria-controls="digital-services-cards"><Previous size={20} aria-hidden="true" /></button>
      <div className={styles.dots}>
        {digitalServices.map((service, index) => <button type="button" key={service.id} className={styles.dotButton} aria-label={ar ? `عرض ${service.name[lang]}` : `Show ${service.name[lang]}`} aria-current={carousel.active === index ? "true" : undefined} aria-controls="digital-services-cards" onClick={() => carousel.goTo(index)}><span /></button>)}
      </div>
      <button type="button" className={styles.navButton} onClick={() => carousel.goTo(carousel.active + 1)} aria-label={ar ? "الخدمة التالية" : "Next service"} aria-controls="digital-services-cards"><Next size={20} aria-hidden="true" /></button>
      {!carousel.reducedMotion && <button type="button" className={styles.navButton} onClick={carousel.togglePaused} aria-label={carousel.paused ? (ar ? "تشغيل الحركة التلقائية" : "Start automatic rotation") : (ar ? "إيقاف الحركة التلقائية" : "Pause automatic rotation")} aria-controls="digital-services-cards">{carousel.paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}</button>}
    </div>
    </div>
  </section>;
}
