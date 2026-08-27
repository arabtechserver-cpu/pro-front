import Link from "next/link";

interface FooterProps {
  dict: any;
  lang?: string;
}

export default function Footer({ dict, lang = "ar" }: FooterProps) {
  const paymentMethods = [
    {
      id: "paypal",
      nameAr: "باي بال PayPal",
      nameEn: "PayPal Checkout",
      badge: "🅿️",
      tagAr: "دفع آمن تلقائي",
      tagEn: "Live Instant",
      color: "from-blue-600/20 to-indigo-600/20 border-blue-500/40 text-blue-400"
    },
    {
      id: "vodafone",
      nameAr: "فودافون كاش",
      nameEn: "Vodafone Cash",
      badge: "📱",
      tagAr: "01036673447",
      tagEn: "01036673447",
      color: "from-red-600/20 to-rose-600/20 border-red-500/40 text-red-400"
    },
    {
      id: "bankak",
      nameAr: "بنك الخرطوم (بنكك)",
      nameEn: "Bank of Khartoum",
      badge: "🏦",
      tagAr: "6302273 (باسم حسن)",
      tagEn: "6302273 (Hassan)",
      color: "from-emerald-600/20 to-teal-600/20 border-emerald-500/40 text-emerald-400"
    },
    {
      id: "bep20",
      nameAr: "BNB Smart Chain (BEP20)",
      nameEn: "BNB Smart Chain",
      badge: "🟡",
      tagAr: "USDT / BNB",
      tagEn: "BEP20 Crypto",
      color: "from-amber-500/20 to-yellow-600/20 border-amber-500/40 text-amber-400"
    },
    {
      id: "binance",
      nameAr: "باينانس Binance Pay",
      nameEn: "Binance Pay",
      badge: "🔶",
      tagAr: "ID: 287584748",
      tagEn: "ID: 287584748",
      color: "from-amber-600/20 to-orange-600/20 border-amber-400/40 text-amber-300"
    }
  ];

  return (
    <footer className="mt-auto border-t border-outline-variant/30 bg-surface-container-lowest/70 backdrop-blur-xl relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 space-y-10">
        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 md:col-span-1 space-y-4">
            <Link href={`/${lang}`} className="relative flex items-center gap-2 group w-fit" aria-label="Home">
              <div className="absolute -inset-2 bg-gradient-to-r from-white/20 via-primary/25 to-white/20 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-all pointer-events-none"></div>
              <img 
                src={lang === "ar" ? "/images/logo_ar.png" : "/images/logo_en.png"} 
                alt="Logo" 
                className="relative z-10 h-11 sm:h-14 w-auto max-w-[220px] sm:max-w-[300px] object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]" 
              />
            </Link>

            <p className="text-xs leading-relaxed text-on-surface-variant max-w-xs">
              {dict.desc}
            </p>

            {/* Social Media Links */}
            <div className="flex gap-3 pt-2">
              <a 
                href="https://t.me/ARABTECHSUPPURT2" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 shadow-sm group"
                aria-label="Telegram"
              >
                <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">send</span>
              </a>

              <a 
                href="https://api.whatsapp.com/send/?phone=16728972935&text&type=phone_number&app_absent=0" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all duration-300 shadow-sm group"
                aria-label="WhatsApp"
              >
                <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">chat</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm text-on-surface mb-4">{dict.services}</h3>
            <ul className="flex flex-col gap-2 text-xs">
              <li><Link href={`/${lang}/pricing`} className="text-on-surface-variant hover:text-primary transition-colors">{dict.imei}</Link></li>
              <li><Link href={`/${lang}/pricing`} className="text-on-surface-variant hover:text-primary transition-colors">{dict.server}</Link></li>
              <li><Link href={`/${lang}/pricing`} className="text-on-surface-variant hover:text-primary transition-colors">{dict.remote}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm text-on-surface mb-4">{dict.support}</h3>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <a 
                  href="https://arab-tech1.online/api-docs" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary font-bold hover:underline flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">api</span>
                  <span>{lang === "ar" ? "توثيق API (API Docs)" : "API Documentation"}</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://arab-tech1.online/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-on-surface hover:text-primary transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">language</span>
                  <span>{lang === "ar" ? "الموقع الرئيسي arab-tech1" : "Main Portal arab-tech1"}</span>
                </a>
              </li>
              <li><Link href={`/${lang}/contact`} className="text-on-surface-variant hover:text-primary transition-colors">{dict.contact}</Link></li>
              <li><Link href={`/${lang}/tutorials`} className="text-on-surface-variant hover:text-primary transition-colors">{dict.tutorials}</Link></li>
              <li><Link href={`/${lang}/blog`} className="text-on-surface-variant hover:text-primary transition-colors">{dict.blog}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm text-on-surface mb-4">{dict.legal}</h3>
            <ul className="flex flex-col gap-2 text-xs">
              <li><Link href={`/${lang}/contact`} className="text-on-surface-variant hover:text-primary transition-colors">{dict.terms}</Link></li>
              <li><Link href={`/${lang}/contact`} className="text-on-surface-variant hover:text-primary transition-colors">{dict.privacy}</Link></li>
              <li><Link href={`/${lang}/contact`} className="text-on-surface-variant hover:text-primary transition-colors">{dict.refund}</Link></li>
            </ul>
          </div>

        </div>

        {/* ALL AVAILABLE PAYMENT GATEWAYS SHOWCASE */}
        <div className="pt-6 border-t border-outline-variant/20 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">payments</span>
              <h4 className="text-xs font-bold text-on-surface">
                {lang === "ar" ? "وسائل وبوابات الدفع المتاحة لجميع الدول:" : "Supported Payment Gateways & Deposit Methods:"}
              </h4>
            </div>

            <Link 
              href={`/${lang}/wallet`} 
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>{lang === "ar" ? "صفحة شحن المحفظة 💳" : "Go to Wallet Top-up 💳"}</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {paymentMethods.map((pm) => (
              <Link
                key={pm.id}
                href={`/${lang}/wallet`}
                className={`p-3 rounded-2xl bg-gradient-to-br ${pm.color} border backdrop-blur-md flex items-center gap-3 transition-all hover:scale-[1.03] active:scale-95 shadow-sm group`}
              >
                <div className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                  {pm.badge}
                </div>

                <div className="overflow-hidden">
                  <p className="font-bold text-xs truncate">
                    {lang === "ar" ? pm.nameAr : pm.nameEn}
                  </p>
                  <p className="text-[10px] opacity-80 font-mono truncate">
                    {lang === "ar" ? pm.tagAr : pm.tagEn}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-on-surface-variant">
            &copy; {new Date().getFullYear()}. {dict.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
