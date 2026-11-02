"use client";

import Link, { useLinkStatus } from "next/link";
import BrandLogo from "./BrandLogo";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, FileText, Globe, LogOut, Menu, Moon, Search, Sun, Wallet, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { morePages, primaryPages, sitePages, type SitePage } from "@/lib/site-pages";
import styles from "./StorefrontHome.module.css";

export function SiteBrand({ lang }: { lang: string }) {
  return <Link href={`/${lang}`} className={styles.brand} aria-label={lang === "ar" ? "عرب تك برو سيرفر — الرئيسية" : "Arab Tech Pro Server — Home"}><BrandLogo lang={lang} /></Link>;
}

function NavigationPending({ ar }: { ar: boolean }) {
  const { pending } = useLinkStatus();
  return pending ? <span role="status" className="inline-flex items-center gap-1 text-xs"><span aria-hidden="true" className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />{ar ? "جارٍ الفتح…" : "Opening…"}</span> : null;
}

export default function SiteHeader({ lang }: { lang: "ar" | "en" }) {
  const ar = lang === "ar";
  const t = (arabic: string, english: string) => ar ? arabic : english;
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<{ fullName?: string; username?: string; balance?: number } | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const base = `/${lang}`;
  useEffect(() => {
    const sync = () => { try { setUser(JSON.parse(localStorage.getItem("user_session") || "null")); } catch { setUser(null); } };
    sync(); window.addEventListener("storage", sync); window.addEventListener("user_session_change", sync);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener("user_session_change", sync); };
  }, []);
  useEffect(() => {
    setMenuOpen(false);
    headerRef.current?.querySelectorAll("details[open]").forEach(detail => detail.removeAttribute("open"));
  }, [pathname]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); headerRef.current?.querySelectorAll("details[open]").forEach(detail => detail.removeAttribute("open")); } };
    window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close);
  }, []);
  const switchLanguage = pathname === "/" ? (ar ? "/en" : "/ar") : pathname.replace(/^\/(ar|en)(?=\/|$)/, ar ? "/en" : "/ar");
  const pageLink = (key: SitePage) => {
    const page = sitePages[key]; const href = `${base}${page.path}`;
    const active = page.path ? pathname === href || pathname.startsWith(`${href}/`) : pathname === "/" || pathname === base || pathname === `${base}/`;
    return <Link key={key} href={href} aria-current={active ? "page" : undefined} className={active ? styles.activePage : undefined} onClick={() => setMenuOpen(false)}>{page[lang]}<NavigationPending ar={ar} /></Link>;
  };
  const search = (event: FormEvent<HTMLFormElement>) => { if (!query.trim()) { event.preventDefault(); headerRef.current?.querySelector<HTMLInputElement>("input[type=search]")?.focus(); } };
  const logout = () => { localStorage.removeItem("user_session"); localStorage.removeItem("user_token"); setUser(null); window.dispatchEvent(new Event("user_session_change")); };
  const Arrow = ar ? ArrowLeft : ArrowRight;

  return <>
    <div className={styles.announcement}><span>{t("خدمات رقمية للمحترفين", "Digital services for professionals")}</span><Arrow size={15} /></div>
    <div className={styles.container}>
      <header ref={headerRef} className={styles.header}>
        <SiteBrand lang={lang} />
        <nav id="site-navigation" className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`} aria-label={t("القائمة الرئيسية", "Main navigation")}>
          {primaryPages.map(pageLink)}
          <details className={styles.moreMenu}><summary>{t("المزيد", "More")}<ChevronDown size={13} /></summary><div className={styles.dropdown}>{morePages.map(pageLink)}</div></details>
          <Link className={styles.mobileLanguage} href={switchLanguage}>{ar ? "English" : "العربية"}</Link>
        </nav>
        <div className={styles.account}>
          {user ? <details className={styles.accountMenu}><summary className={styles.register}>{user.fullName || user.username || t("حسابي", "My account")}<ChevronDown size={13} /></summary><div className={styles.dropdown}>{pageLink("profile")}{pageLink("wallet")}{pageLink("orders")}<button onClick={logout}><LogOut size={15} />{t("تسجيل الخروج", "Sign out")}</button></div></details> : <><Link className={styles.login} href={`${base}/login`}>{sitePages.login[lang]}</Link><Link className={styles.register} href={`${base}/register`}>{sitePages.register[lang]}</Link></>}
          <Link className={styles.language} href={switchLanguage} aria-label={ar ? "Switch to English" : "التغيير إلى العربية"}><Globe size={16} />{ar ? "EN" : "AR"}</Link>
          <button className={styles.theme} onClick={toggleTheme} aria-label={theme === "dark" ? t("تفعيل الوضع الفاتح", "Switch to light mode") : t("تفعيل الوضع الداكن", "Switch to dark mode")}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button className={styles.mobileMenu} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="site-navigation" aria-label={t("القائمة", "Menu")}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>
      <div className={styles.searchRow}>
        <form className={styles.search} action={`${base}/pricing`} onSubmit={search} role="search"><button type="submit" aria-label={t("بحث", "Search")}><Search size={21} /></button><input type="search" name="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t("ما الخدمة التي تبحث عنها؟", "What service are you looking for?")} aria-label={t("ابحث عن خدمة", "Search services")} /></form>
        <Link className={styles.quickLink} href={`${base}/orders`} aria-label={t("طلباتي", "My orders")} aria-current={pathname === `${base}/orders` ? "page" : undefined}><FileText size={19} /><span>{t("طلباتي", "My orders")}</span></Link>
        <Link className={styles.quickLink} href={`${base}/wallet`} aria-label={t("المحفظة", "Wallet")} aria-current={pathname === `${base}/wallet` ? "page" : undefined}><Wallet size={20} /><span>{t("المحفظة", "Wallet")}</span>{user && <b className={styles.balance}>${Number(user.balance || 0).toFixed(2)}</b>}</Link>
      </div>
    </div>
  </>;
}
