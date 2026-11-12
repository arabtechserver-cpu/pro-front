"use client";

import { usePathname } from "next/navigation";
import { Locale } from "@/i18n/config";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import AiChatWidget from "./AiChatWidget";
import FloatingSideDock from "./FloatingSideDock";
import SiteTurnstileGate from "./SiteTurnstileGate";
import UserInactivityGuard from "./UserInactivityGuard";
import styles from "./StorefrontHome.module.css";

export default function MainSiteShell({ children, lang }: { children: React.ReactNode; lang: Locale; dict?: unknown }) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === `/${lang}` || pathname === `/${lang}/`;
  return <div className={`${styles.home} site-theme`} dir={lang === "ar" ? "rtl" : "ltr"}>
    <UserInactivityGuard />
    <SiteTurnstileGate lang={lang} />
    <SiteHeader lang={lang} />
    <main className={isHome ? styles.homeMain : styles.pageContent}>{children}</main>
    <SiteFooter lang={lang} />
    <AiChatWidget lang={lang} />
    <FloatingSideDock lang={lang} />
  </div>;
}
