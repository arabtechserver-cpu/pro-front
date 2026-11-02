"use client";

import { useEffect, useState } from "react";
import { Bot, ArrowUp } from "lucide-react";
import styles from "./SupportTools.module.css";

export default function FloatingSideDock({ lang = "ar" }: { lang?: string }) {
  const ar = lang === "ar";
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 350);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const channels = [
    { name: ar ? "دعم واتساب الفوري" : "WhatsApp support", href: "https://wa.me/16728972935", icon: "fa-whatsapp", style: styles.whatsapp },
    { name: ar ? "قناة تيليجرام الرسمية" : "Telegram channel", href: "https://t.me/arabtechserveronline", icon: "fa-telegram", style: styles.telegram },
    { name: ar ? "صفحة الفيسبوك" : "Facebook page", href: "https://www.facebook.com/ARABTECHSERVEROnline", icon: "fa-facebook-f", style: styles.facebook },
  ];
  return <>
    <aside className={styles.dock} aria-label={ar ? "قنوات التواصل السريع" : "Quick contact channels"}>
      {channels.map(channel => <a key={channel.href} className={`${styles.social} ${channel.style}`} href={channel.href} target="_blank" rel="noopener noreferrer" aria-label={channel.name} title={channel.name}><i className={`fa-brands ${channel.icon}`} aria-hidden="true" /></a>)}
      <span className={styles.divider} aria-hidden="true" />
      <button type="button" className={styles.aiLaunch} aria-label={ar ? "المساعد الذكي 24/7" : "AI assistant"} title={ar ? "افتح المساعد الذكي" : "Open AI assistant"} aria-haspopup="dialog" aria-controls="atp-ai-dialog" onClick={() => window.dispatchEvent(new CustomEvent("toggle-ai-chat"))}><Bot size={21} /><span>AI</span></button>
    </aside>
    {showTop && <button type="button" className={styles.toTop} aria-label={ar ? "الرجوع لأعلى الصفحة" : "Back to top"} onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}><ArrowUp size={19} /></button>}
  </>;
}
