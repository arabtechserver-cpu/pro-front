import Link from "next/link";
import { ArrowLeft, ArrowRight, CreditCard, Satellite, ShieldCheck, Sparkles } from "lucide-react";
import { digitalServices } from "@/lib/digital-services";
import styles from "./DigitalServices.module.css";

export default function DigitalServices({ lang }: { lang: "ar" | "en" }) {
  const ar = lang === "ar";
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const icons = { visa: CreditCard, starlink: Satellite, verification: ShieldCheck };
  return <section className={styles.section} aria-labelledby="digital-services-heading">
    <div data-reveal className={styles.heading}>
      <div>
        <span className={styles.kicker}><Sparkles size={15} aria-hidden="true" />{ar ? "تفعيلات وخدمات إلكترونية" : "Activations & digital services"}</span>
        <h2 id="digital-services-heading">{ar ? "خدماتك الرقمية، بخطوة أقرب." : "Your digital services, one step closer."}</h2>
      </div>
      <p>{ar ? "بطاقات افتراضية، اتصال ستارلينك، ومساعدة في توثيق حساباتك. اختار خدمتك وسيب الباقي علينا." : "Virtual cards, Starlink connectivity and account verification assistance. Choose a service and talk to our team."}</p>
    </div>
    <div className={styles.grid}>
      {digitalServices.map(service => {
        const Icon = icons[service.variant];
        return <article data-reveal key={service.id} className={`${styles.card} ${styles[service.variant]}`}>
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
  </section>;
}
