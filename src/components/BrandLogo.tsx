import { brandAssets } from "@/lib/brand";
import styles from "./BrandLogo.module.css";

export default function BrandLogo({ lang = "ar", size = "default" }: { lang?: string; size?: "default" | "auth" }) {
  const ar = lang === "ar";
  return <span className={`${styles.logo} ${ar ? styles.arabic : styles.english} ${size === "auth" ? styles.auth : ""}`} dir={ar ? "rtl" : "ltr"} role="img" aria-label={ar ? "عرب تك برو سيرفر — سوفت وير وخدمات عن بُعد" : "Arab Tech Pro Server — Software & remote services"}>
    <img className={styles.mark} src={brandAssets.mark} alt="" width={72} height={72} />
    <span className={styles.wordmark}>
      <strong className={styles.name}>{ar ? "عرب تك برو سيرفر" : <>ARAB TECH PRO<span className={styles.server}>SERVER</span></>}</strong>
      <span className={styles.tagline}>{ar ? "سوفت وير وخدمات عن بُعد" : "SOFTWARE & REMOTE SERVICES"}</span>
    </span>
  </span>;
}
