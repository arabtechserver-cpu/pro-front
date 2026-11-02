import Link from "next/link";
import { Phone } from "lucide-react";
import { sitePages, type SitePage } from "@/lib/site-pages";
import PaymentMethods from "./PaymentMethods";
import { SiteBrand } from "./SiteHeader";
import styles from "./StorefrontHome.module.css";

export default function SiteFooter({ lang }: { lang: "ar" | "en" }) {
  const groups: { ar: string; en: string; pages: SitePage[] }[] = [
    { ar: "الخدمات والحساب", en: "Services & account", pages: ["pricing", "gaming", "orders", "wallet", "profile"] },
    { ar: "المحتوى", en: "Resources", pages: ["blog", "api"] },
    { ar: "المساعدة والسياسات", en: "Help & policies", pages: ["contact", "faq", "terms", "refund"] },
  ];
  return <div className={styles.container}><footer className={styles.footer}>
    <div className={styles.footerBrand}>
      <SiteBrand lang={lang} />
      <a className={styles.footerPhone} href="tel:+16728972935" aria-label={lang === "ar" ? "اتصل بنا على +1 672-897-2935" : "Call us at +1 672-897-2935"}>
        <Phone size={15} aria-hidden="true" /><span dir="ltr">+1 672-897-2935</span>
      </a>
      <p>© 2026 {lang === "ar" ? "عرب تك برو سيرفر. جميع الحقوق محفوظة" : "Arab Tech Pro Server. All rights reserved."}</p>
    </div>
    {groups.map(group => <div className={styles.footerGroup} key={group.en}><h3>{group[lang]}</h3>{group.pages.map(key => <Link key={key} href={`/${lang}${sitePages[key].path}`}>{sitePages[key][lang]}</Link>)}</div>)}
    <PaymentMethods lang={lang} />
  </footer></div>;
}
