import Link from "next/link";
import styles from "./StorefrontHome.module.css";

export function BinanceIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 1 4.2 4.2-2.4 2.4L12 5.8l-1.8 1.8-2.4-2.4L12 1Zm-6.8 6.8 2.4 2.4L5.8 12l1.8 1.8-2.4 2.4L1 12l4.2-4.2Zm13.6 0L23 12l-4.2 4.2-2.4-2.4 1.8-1.8-1.8-1.8 2.4-2.4ZM12 8.6l3.4 3.4-3.4 3.4L8.6 12 12 8.6Zm-1.8 7.8 1.8 1.8 1.8-1.8 2.4 2.4L12 23l-4.2-4.2 2.4-2.4Z" /></svg>;
}

export function BybitIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h7.5c2.5 0 4.5 2 4.5 4.5S14 13 11.5 13H8v7H4V4Zm4 6h3.5c.8 0 1.5-.7 1.5-1.5S12.3 7 11.5 7H8v3Zm12-6v16h-4V4h4Z" /></svg>;
}

function PaymentIcon({ name }: { name: string }) {
  if (name === "PayPal") return <i className="fa-brands fa-paypal" aria-hidden="true" />;
  if (name === "Binance Pay") return <BinanceIcon />;
  if (name === "Bybit") return <BybitIcon />;
  if (name === "Vodafone Cash") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor" /><path d="M15 4c-6 0-9 4-8 9 1 5 8 6 10 1 1-3-1-5-4-5-1-2 0-4 2-5Z" fill="white" /></svg>;
  if (name === "InstaPay") return <svg viewBox="0 0 24 24" fill="none" strokeWidth="3" aria-hidden="true"><path d="m4 3 8 9-8 9" stroke="#ed633e" /><path d="m12 3 8 9-8 9" stroke="#9553ac" /></svg>;
  if (name === "USDT") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor" /><path d="M6 6h12v3h-4.5v2c3 .2 5 .8 5 1.5s-2 .8-5 1V19h-3v-5.5c-3-.2-5-.4-5-1s2-1.3 5-1.5V9H6V6Z" fill="white" /><ellipse cx="12" cy="12" rx="6.3" ry="1.2" fill="none" stroke="white" strokeWidth=".7" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="3" width="22" height="18" rx="5" fill="#ffd400" /><path d="M7 7h11v3h-7v2h6v3h-6v4H7V7Z" fill="#0878ae" /></svg>;
}

export default function PaymentMethods({ lang }: { lang: string }) {
  const methods = [ ["PayPal", "#0070ba"], ["Binance Pay", "#c99300"], ["Bybit", "#f7a600"], ["Vodafone Cash", "#e31e24"], ["InstaPay", "#9553ac"], ["USDT", "#26a17b"], ["Fawry", "#0878ae"] ];
  return <div className={styles.payments}><h3>{lang === "ar" ? "طرق الدفع المتاحة" : "Payment methods"}</h3><div className={styles.paymentIcons}>{methods.map(([name, color]) => <Link key={name} href={`/${lang}/wallet`} className={styles.paymentBadge} aria-label={lang === "ar" ? `${name} — المحفظة` : `${name} — Wallet`}><span style={{ color }}><PaymentIcon name={name} /></span><b>{name}</b></Link>)}</div></div>;
}
