"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Cpu, Database, FileText, Gamepad2, CreditCard, Headset, Wallet, MousePointer2, ClipboardList, MessageCircle } from "lucide-react";
import ToolMark from "./ToolMark";
import { Gift, Percent, ShoppingBag } from "lucide-react";
import styles from "./StorefrontHome.module.css";
import useHomeMotion from "./useHomeMotion";

export default function StorefrontHome({ lang }: { lang: "ar" | "en" }) {
  const ar = lang === "ar";
  const { rootRef, progressRef } = useHomeMotion();
  const t = (arabic: string, english: string) => ar ? arabic : english;
  const base = `/${lang}`;
  const [filter, setFilter] = useState("all");
  const [slide, setSlide] = useState(0);
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const services = [
    { title: t("خدمات IMEI", "IMEI services"), desc: t("خدمات فك القفل والمعالجات", "Phone unlocking and servicing"), icon: Cpu, href: "/pricing?category=imei" },
    { title: t("أرصدة السيرفرات", "Server credits"), desc: t("شحن أرصدة أقوى السيرفرات", "Top up your professional tools"), icon: Database, href: "/pricing?category=server" },
    { title: t("تفعيل التراخيص", "Tool activations"), desc: t("تفعيل وتجديد أدواتك", "Activate and renew your tools"), icon: FileText, href: "/pricing?category=server" },
    { title: t("البطاقات والاشتراكات", "Cards & subscriptions"), desc: t("بطاقات رقمية واشتراكات متنوعة", "Digital cards and subscriptions"), icon: CreditCard, href: "/gaming" },
    { title: t("شحن الألعاب", "Gaming top-ups"), desc: t("بطاقات وأرصدة الألعاب", "Game cards and credits"), icon: Gamepad2, href: "/gaming" },
    { title: t("الدعم عن بُعد", "Remote support"), desc: t("مساعدة فنية سريعة", "Fast technical assistance"), icon: Headset, href: "/pricing?category=remote" },
  ];
  const tools = [
    { name: "UnlockTool", icon: "unlocktool", type: "licenses", desc: t("تفعيل وتجديد", "Activation & renewal") },
    { name: "Chimera Tool", icon: "chimera", type: "licenses", desc: t("تراخيص وأرصدة", "Licenses & credits") },
    { name: "Borneo Schematics", icon: "borneo", type: "licenses", desc: t("مخططات وصيانة", "Schematics & repair") },
    { name: "Android Multi Tool", icon: "amt", type: "credits", desc: t("أرصدة سيرفر", "Server credits") },
  ];
  const gameTabs = [
    { label: t("شحن الألعاب", "Game top-ups"), href: `${base}/gaming?section=topups` },
    { label: t("بطاقات المتاجر", "Store cards"), href: `${base}/gaming?section=appStores` },
    { label: t("الاشتراكات", "Subscriptions"), href: `${base}/gaming?section=subscriptions` },
    { label: t("السوفت وير والتفعيلات", "Software & activations"), href: `${base}/pricing?category=server` },
  ];
  const url = (href: string) => `${base}${href}`;

  return <div ref={rootRef} className={`${styles.container} ${styles.motionRoot}`}>
      <div ref={progressRef} className={styles.scrollProgress} aria-hidden="true" />
      <section className={styles.heroGrid} aria-label={t("الخدمات والعروض", "Services and offers")}>
        <div data-motion-scene className={`${styles.hero} ${styles.remoteHero}`}>
          <img className={styles.remoteHeroImage} src="/images/homepage/hero-phone-remote.webp" width={1000} height={750} alt={t("هواتف مع قفل مفتوح واتصال عن بُعد", "Smartphones with an open padlock and remote connection")} fetchPriority="high" />
          <div key={slide} className={styles.heroCopy}>
            <span className={styles.eyebrow}>{t("تفعيل وفك الهواتف عن بُعد", "Phone activation & remote unlocking")}</span>
            <h1>{slide === 0 ? <>{t("تفعيل وفك الهواتف.", "Phone activation.")}<strong>{t("عن بُعد، بكل سهولة.", "& remote unlocking.")}</strong></> : <>{t("خدمات هاتفك.", "Your phone services.")}<strong>{t("تصلك أينما كنت.", "Wherever you are.")}</strong></>}</h1>
            <p>{slide === 0 ? t("خدمات تفعيل وفك الهواتف والشبكات عن بُعد", "Phone activation and network unlocking, delivered remotely") : t("اختر خدمة التفعيل أو فك القفل المناسبة لهاتفك", "Choose the right activation or unlocking service for your phone")}</p>
            <Link className={styles.limeButton} href={`${base}/pricing?category=remote`}>{t("استعرض خدمات الهواتف", "Browse phone services")}<Arrow size={20} /></Link>
          </div>
          <button className={`${styles.slideArrow} ${styles.prev}`} onClick={() => setSlide(slide === 0 ? 1 : 0)} aria-label={t("العرض السابق", "Previous offer")}><ChevronLeft size={24} /></button>
          <button className={`${styles.slideArrow} ${styles.next}`} onClick={() => setSlide(slide === 0 ? 1 : 0)} aria-label={t("العرض التالي", "Next offer")}><ChevronRight size={24} /></button>
          <div className={styles.dots}>{[0, 1].map(index => <button key={index} onClick={() => setSlide(index)} className={slide === index ? styles.activeDot : ""} aria-label={t(`العرض ${index + 1}`, `Offer ${index + 1}`)} aria-pressed={slide === index} />)}</div>
        </div>
        <div className={styles.sidePromos}>
          <div className={`${styles.promo} ${styles.gamePromo}`}>
            <img className={styles.productArt} src="/images/homepage/controller.webp" alt="" width={1536} height={1024} />
            <div className={styles.promoCopy}><span>{t("عالم الألعاب", "Gaming world")}</span><h2>{t("اشحن لعبتك.", "Top up your game.")}<br />{t("كمل الحماس.", "Keep playing.")}</h2><Link className={styles.greenButton} href={`${base}/gaming`}>{t("شحن وبطاقات", "Top-ups & cards")}<Arrow size={18} /></Link></div>
          </div>
          <div className={`${styles.promo} ${styles.toolPromo}`}>
            <img className={styles.productArt} src="/images/homepage/activation.webp" alt="" width={1536} height={1024} />
            <div className={styles.promoCopy}><span>{t("أدواتك جاهزة", "Your tools, ready")}</span><h2>{t("فعّل أدواتك.", "Activate your tools.")}<br />{t("وانطلق.", "Get started.")}</h2><Link className={styles.greenButton} href={`${base}/pricing?category=server`}>{t("تصفح التفعيلات", "Browse activations")}<Arrow size={18} /></Link></div>
          </div>
        </div>
      </section>

      <section data-reveal className={styles.partners} aria-label={t("الأدوات المدعومة", "Supported tools")}><p>{t("أدوات تعرفها. تجربة أفضل.", "Tools you know. A better experience.")}</p><div className={styles.toolPartners}>{[["unlocktool", "UnlockTool"], ["chimera", "CHIMERA"], ["borneo", "BORNEO"], ["dft", "DFT PRO"], ["amt", "AMT"]].map(([key, name]) => <span key={key}>{key !== "dft" && <ToolMark tool={key} className={styles.toolLogo} />}<b>{name}</b></span>)}</div></section>

      <section id="services" className={styles.services}>
        <div data-reveal className={styles.sectionHeading}><h2>{t("كل خدمة، في مكانها.", "Every service, in its place.")}</h2><Link href={`${base}/pricing`}>{t("استعرض الأقسام", "Browse categories")}<Arrow size={17} /></Link></div>
        <div className={styles.serviceGrid}>{services.map(service => <Link key={service.title} href={url(service.href)} data-reveal className={styles.serviceCard}><service.icon className={styles.serviceIcon} size={30} strokeWidth={1.6} /><div><h3>{service.title}</h3><p>{service.desc}</p></div><Arrow size={19} /></Link>)}</div>
      </section>

      <section data-reveal className={styles.popular} aria-labelledby="popular-heading">
        <div className={styles.popularHeading}><div><h2 id="popular-heading">{t("الأكثر طلباً اليوم", "Most popular today")}</h2><p>{t("وصول أسرع للخدمات التي تحتاجها", "Faster access to the services you need")}</p></div><div className={styles.filters} role="group" aria-label={t("تصفية الخدمات", "Filter services")}>{[["all", t("الكل", "All")], ["licenses", t("التراخيص", "Licenses")], ["credits", t("الأرصدة", "Credits")]].map(([key, label]) => <button key={key} aria-pressed={filter === key} className={filter === key ? styles.activeFilter : ""} onClick={() => setFilter(key)}>{label}</button>)}</div></div>
        <div className={styles.tableScroll}><table className={styles.toolTable}><thead><tr><th>{t("الأداة", "Tool")}</th><th>{t("نوع الخدمة", "Service type")}</th><th>{t("حالة الخدمة", "Service status")}</th><th>{t("الإجراء", "Action")}</th></tr></thead><tbody>{tools.filter(tool => filter === "all" || tool.type === filter).map(tool => <tr key={tool.name}><td><ToolMark className={styles.toolLogo} tool={tool.icon} /><b dir="ltr">{tool.name}</b></td><td>{tool.desc}</td><td><span className={styles.status}><i />{t("متاح", "Available")}</span></td><td><Link href={`${base}/pricing`}>{t("عرض التفاصيل", "View details")}<Arrow size={18} /></Link></td></tr>)}</tbody></table></div>
      </section>

      <section data-reveal className={styles.gaming} aria-label={t("العالم الرقمي", "Digital world")}>
        <div className={styles.gamingBody}><div className={styles.digitalArt} aria-hidden="true"><span className={styles.giftCard}><Gift /></span><span className={styles.storeCard}><ShoppingBag /></span><span className={styles.discountCard}><Percent /></span><img src="/images/homepage/controller.webp" alt="" width={1536} height={1024} /></div><div className={styles.gamingCopy}><h2>{t("للألعاب وقتها.", "Time to play.")}<strong>{t("وللشحن مكانه.", "Your place to top up.")}</strong></h2><p>{t("شحن الألعاب، بطاقات رقمية واشتراكات", "Game top-ups, digital cards and subscriptions")}</p><Link className={styles.limeButton} href={`${base}/gaming`}>{t("اكتشف العالم الرقمي", "Explore the digital world")}<Arrow size={20} /></Link></div></div>
        <div className={styles.gameTabs} role="group" aria-label={t("أقسام الخدمات الرقمية", "Digital service categories")}>{gameTabs.map(({ label, href }, index) => <Link key={href} href={href} className={index === 0 ? styles.activeTab : undefined}>{label}</Link>)}</div>
      </section>

      <section data-reveal className={styles.workflow}><h2>{t("من اختيارك إلى التنفيذ.", "From choice to completion.")}</h2><div className={styles.steps}>{[
        { icon: MousePointer2, title: t("اختر خدمتك", "Choose your service"), desc: t("تصفح الأقسام واختر الخدمة المناسبة لك", "Find the right service for you"), href: "/pricing" },
        { icon: Wallet, title: t("اشحن محفظتك", "Fund your wallet"), desc: t("استخدم وسائل الدفع المتاحة", "Choose from available payment methods"), href: "/wallet" },
        { icon: ClipboardList, title: t("تابع طلبك", "Track your order"), desc: t("احصل على خدماتك بسرعة وأمان", "Get your services quickly and securely"), href: "/orders" },
      ].map((step, index) => <Link href={url(step.href)} key={index} className={styles.step}><span className={styles.stepNumber}>0{index + 1}</span><step.icon size={29} strokeWidth={1.6} /><div><h3>{step.title}</h3><p>{step.desc}</p></div></Link>)}</div></section>

      <section data-reveal className={styles.support}><img className={styles.supportImage} src="/images/homepage/support-headset.webp" width={640} height={640} alt={t("سماعة فريق الدعم الفني", "Customer support headset")} loading="lazy" /><div className={styles.supportCopy}><h2>{t("وراك فريق يساعدك.", "A team behind you.")}</h2><p>{t("تواصل معنا لو محتاج مساعدة في اختيار الخدمة", "Get in touch for help choosing your service")}</p></div><div className={styles.supportLinks}><Link className={styles.greenButton} href={`${base}/contact`}><MessageCircle size={21} />{t("تواصل معنا", "Contact us")}</Link><Link className={styles.telegram} href={`${base}/faq`}><FileText size={20} />{t("الأسئلة الشائعة", "FAQ")}</Link></div></section>

  </div>;
}
