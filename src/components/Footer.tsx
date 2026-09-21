"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface FooterProps {
  dict?: any;
  lang?: string;
}

export default function Footer({ dict, lang = "ar" }: FooterProps) {
  const isAr = lang === "ar";
  const currentYear = new Date().getFullYear();

  const paymentBadges = [
    {
      id: "paypal",
      name: "PayPal",
      icon: (
        <span className="font-bold text-sky-400 text-xs italic font-mono">P</span>
      )
    },
    {
      id: "vodafone",
      name: "Vodafone Cash",
      icon: (
        <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block shrink-0" />
      )
    },
    {
      id: "instapay",
      name: "INSTAPAY",
      icon: (
        <span className="font-black text-rose-500 text-[10px] font-sans">i</span>
      )
    },
    {
      id: "usdt",
      name: "USDT",
      icon: (
        <span className="font-bold text-emerald-400 text-[10px] font-mono">₮</span>
      )
    },
    {
      id: "fawri",
      name: "Fawri",
      icon: (
        <span className="font-black text-amber-400 text-[10px] font-mono">F</span>
      )
    },
    {
      id: "binance",
      name: "Binance Pay",
      icon: (
        <span className="font-black text-yellow-400 text-[10px] font-mono">◈</span>
      )
    }
  ];

  return (
    <footer className="w-full bg-slate-100 dark:bg-[#050b14] border-t border-slate-200 dark:border-cyan-500/20 pt-10 sm:pt-12 pb-6 text-slate-700 dark:text-slate-300">
      <div className="w-full cyber-container space-y-8">
        
        {/* Top Section: 6 Columns matching sec6_footer.jpg */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 items-start">
          
          {/* Column 1 (in RTL, far right): Supported Payment Methods */}
          <div className="space-y-3 order-6 lg:order-1">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-cyan-400">
              {isAr ? "وسائل الدفع المتاحة" : "Payment Methods"}
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              {paymentBadges.map((pm) => (
                <Link
                  key={pm.id}
                  href={`/${lang}/wallet`}
                  className="p-2 rounded-xl bg-white dark:bg-[#08172b] border border-slate-200 dark:border-cyan-500/20 hover:border-cyan-500/50 flex items-center gap-1.5 transition-all text-center justify-center shadow-sm group"
                >
                  {pm.icon}
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-white truncate">
                    {pm.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Legal */}
          <div className="space-y-3 order-5 lg:order-2">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-cyan-400">
              {isAr ? "القانوني" : "Legal"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href={`/${lang}/terms`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "الشروط والأحكام" : "Terms & Conditions"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/terms`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/refund`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "سياسة الاسترجاع" : "Refund Policy"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support & Help */}
          <div className="space-y-3 order-4 lg:order-3">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-cyan-400">
              {isAr ? "الدعم والمساعدة" : "Support & Help"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href={`/${lang}/blog`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "المدونة" : "Blog"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/tutorials`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "فيديوهات تعليمية" : "Video Tutorials"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/contact`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "تواصل معنا" : "Contact Us"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/faq`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "الأسئلة الشائعة" : "FAQ"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Services */}
          <div className="space-y-3 order-3 lg:order-4">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-cyan-400">
              {isAr ? "خدماتنا" : "Our Services"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href={`/${lang}/pricing?cat=store`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "الأدوات والمتجر" : "Tools & Store"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/pricing`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "الباقات والتفعيلات" : "Packages & Activations"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/pricing?cat=imei`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "فحص IMEI و FRP" : "IMEI & FRP Check"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/pricing?cat=server`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "سيرفرات التفليش" : "Flashing Servers"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/pricing?cat=server`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "تفعيل التراخيص" : "License Activation"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/pricing`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "جميع الخدمات" : "All Services"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Quick Links */}
          <div className="space-y-3 order-2 lg:order-5">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-cyan-400">
              {isAr ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href={`/${lang}`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "الرئيسية" : "Home"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/pricing`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "أسعار الوكلاء" : "Reseller Pricing"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/pricing?cat=imei`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "خدمات IMEI" : "IMEI Services"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/pricing?cat=server`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "خدمات السيرفر" : "Server Services"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/pricing?cat=remote`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "خدمات التحكم عن بعد" : "Remote Services"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/orders`} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                  {isAr ? "الطلبات" : "Orders"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 6 (in RTL, far left): Brand Identity */}
          <div className="space-y-3 order-1 lg:order-6">
            <Link href={`/${lang}`} className="inline-block">
              <picture>
                <source srcSet={isAr ? "/images/logo_ar.webp" : "/images/logo_en.webp"} type="image/webp" />
                <img
                  src={isAr ? "/images/logo_ar.png" : "/images/logo_en.png"}
                  alt="Arab Tech Pro Server"
                  width={200}
                  height={50}
                  className="h-10 w-auto object-contain"
                />
              </picture>
            </Link>

            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 font-sans">
              <p className="font-semibold text-slate-800 dark:text-slate-300">Your GSM Partner</p>
              <p>Always One Step Ahead</p>
            </div>

            {/* Social Icons matching mockup squares */}
            <div className="flex items-center gap-2 pt-1">
              {/* Telegram */}
              <a
                href="https://t.me/arabtechserveronline"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white dark:bg-[#08172b] border border-slate-200 dark:border-cyan-500/20 hover:border-cyan-500 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-sm transition-all"
                aria-label="Telegram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.763-.169.711-.43 1.05-.683 1.073-.55.05-1.042-.366-1.575-.716-.834-.547-1.306-.888-2.116-1.421-.937-.618-.329-.958.204-1.512.14-.145 2.569-2.356 2.616-2.557.006-.025.011-.122-.047-.173-.058-.051-.144-.034-.206-.02-.089.02-1.501.954-4.238 2.802-.401.275-.764.41-1.089.403-.358-.008-1.047-.202-1.56-.369-.629-.205-1.129-.313-1.085-.661.023-.182.274-.369.753-.561 2.955-1.287 4.927-2.137 5.914-2.548 2.822-1.173 3.407-1.377 3.79-1.384.084-.001.272.02.394.119.103.084.132.197.145.276.014.08.03.26-.002.434z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/ARABTECHSERVEROnline"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white dark:bg-[#08172b] border border-slate-200 dark:border-cyan-500/20 hover:border-cyan-500 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-sm transition-all"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@arabtechsuppurt"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white dark:bg-[#08172b] border border-slate-200 dark:border-cyan-500/20 hover:border-cyan-500 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-sm transition-all"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://tiktok.com/@arabtechsuppurt"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white dark:bg-[#08172b] border border-slate-200 dark:border-cyan-500/20 hover:border-cyan-500 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-sm transition-all"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 2.378A6.347 6.347 0 0 0 3.5 15.672a6.35 6.35 0 0 0 10.84 4.492V12.38a8.217 8.217 0 0 0 5.25 1.862V10.8a4.79 4.79 0 0 1-3.77-4.114z" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Brands Horizontal Row matching sec6_footer.jpg */}
        <div className="pt-6 border-t border-slate-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="hover:text-black dark:hover:text-white transition-colors">Apple</span>
          <span className="hover:text-black dark:hover:text-white transition-colors">SAMSUNG</span>
          <span className="hover:text-black dark:hover:text-white transition-colors">mi</span>
          <span className="hover:text-black dark:hover:text-white transition-colors">HUAWEI</span>
          <span className="hover:text-black dark:hover:text-white transition-colors">ONEPLUS</span>
          <span className="hover:text-black dark:hover:text-white transition-colors">oppo</span>
          <span className="hover:text-black dark:hover:text-white transition-colors">vivo</span>
          <span className="hover:text-black dark:hover:text-white transition-colors">Qualcomm</span>
          <span className="hover:text-black dark:hover:text-white transition-colors">MEDIATEK</span>
          <span className="hover:text-black dark:hover:text-white transition-colors">UNISOC</span>
        </div>

        {/* Bottom Copyright Strip matching sec6_footer.jpg */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <div>
            &copy; {currentYear} Arab Tech Pro Server {isAr ? "جميع الحقوق محفوظة." : "All Rights Reserved."}
          </div>
          <div>
            Made With <span className="text-red-500 font-bold">♥</span> For GSM Community
          </div>
        </div>

      </div>
    </footer>
  );
}
