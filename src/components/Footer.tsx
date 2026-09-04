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
      tagAr: "01097160605",
      tagEn: "01097160605",
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
      tagAr: "ID: 894642115",
      tagEn: "ID: 894642115",
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
              <picture>
                <source srcSet={lang === "ar" ? "/images/logo_ar.webp" : "/images/logo_en.webp"} type="image/webp" />
                <img 
                  src={lang === "ar" ? "/images/logo_ar.png" : "/images/logo_en.png"} 
                  alt="Logo" 
                  width={220}
                  height={55}
                  className="relative z-10 h-11 sm:h-14 w-auto max-w-[220px] sm:max-w-[300px] object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]" 
                />
              </picture>
            </Link>

            <p className="text-xs leading-relaxed text-on-surface-variant max-w-xs">
              {dict.desc}
            </p>

            {/* Social Media & Contact Channels Links */}
            <div className="flex flex-wrap gap-2 pt-2">
              <a 
                href="https://wa.me/16728972935" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm"
                title={lang === "ar" ? "واتساب الإدارة 1 (+16728972935)" : "WhatsApp Admin 1"}
                aria-label="WhatsApp Admin 1"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.148-1.348c1.472.802 3.13 1.224 4.863 1.225h.005c5.505 0 9.989-4.478 9.99-9.985 0-2.668-1.039-5.176-2.927-7.062A9.923 9.923 0 0 0 12.012 2zm.005 16.521h-.004c-1.493 0-2.957-.401-4.232-1.157l-.304-.18-3.146.825.839-3.067-.198-.315c-.832-1.323-1.272-2.859-1.272-4.436 0-4.492 3.656-8.147 8.152-8.147 2.176 0 4.221.848 5.76 2.387a8.096 8.096 0 0 1 2.384 5.763c0 4.493-3.656 8.147-8.152 8.147zm4.469-6.108c-.245-.123-1.452-.716-1.677-.798-.225-.082-.389-.123-.553.123-.164.246-.635.798-.778.962-.143.164-.286.184-.531.062-.245-.123-1.037-.382-1.976-1.219-.73-.651-1.223-1.455-1.366-1.7-.143-.246-.015-.379.108-.501.111-.11.245-.286.368-.429.123-.143.164-.246.245-.409.082-.164.041-.307-.02-.429-.062-.123-.553-1.332-.757-1.822-.204-.49-.409-.419-.553-.429h-.471c-.164 0-.429.062-.654.307-.225.246-.86.84-.86 2.05 0 1.209.88 2.373 1.002 2.537.123.164 1.733 2.646 4.198 3.712.586.254 1.044.406 1.401.52.59.187 1.127.16 1.551.097.473-.07 1.452-.593 1.656-1.166.204-.573.204-1.064.143-1.166-.061-.102-.225-.164-.47-.287z"/></svg>
              </a>

              <a 
                href="https://wa.me/249123667227" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm"
                title={lang === "ar" ? "واتساب الإدارة 2 (+249123667227)" : "WhatsApp Admin 2"}
                aria-label="WhatsApp Admin 2"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.148-1.348c1.472.802 3.13 1.224 4.863 1.225h.005c5.505 0 9.989-4.478 9.99-9.985 0-2.668-1.039-5.176-2.927-7.062A9.923 9.923 0 0 0 12.012 2zm.005 16.521h-.004c-1.493 0-2.957-.401-4.232-1.157l-.304-.18-3.146.825.839-3.067-.198-.315c-.832-1.323-1.272-2.859-1.272-4.436 0-4.492 3.656-8.147 8.152-8.147 2.176 0 4.221.848 5.76 2.387a8.096 8.096 0 0 1 2.384 5.763c0 4.493-3.656 8.147-8.152 8.147zm4.469-6.108c-.245-.123-1.452-.716-1.677-.798-.225-.082-.389-.123-.553.123-.164.246-.635.798-.778.962-.143.164-.286.184-.531.062-.245-.123-1.037-.382-1.976-1.219-.73-.651-1.223-1.455-1.366-1.7-.143-.246-.015-.379.108-.501.111-.11.245-.286.368-.429.123-.143.164-.246.245-.409.082-.164.041-.307-.02-.429-.062-.123-.553-1.332-.757-1.822-.204-.49-.409-.419-.553-.429h-.471c-.164 0-.429.062-.654.307-.225.246-.86.84-.86 2.05 0 1.209.88 2.373 1.002 2.537.123.164 1.733 2.646 4.198 3.712.586.254 1.044.406 1.401.52.59.187 1.127.16 1.551.097.473-.07 1.452-.593 1.656-1.166.204-.573.204-1.064.143-1.166-.061-.102-.225-.164-.47-.287z"/></svg>
              </a>

              <a 
                href="https://chat.whatsapp.com/DINRDwU2lVjFcGRowxT3m5" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm"
                title={lang === "ar" ? "مجتمع وقناة الواتساب" : "WhatsApp Community"}
                aria-label="WhatsApp Community"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </a>

              <a 
                href="https://t.me/arabtechserveronline" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 hover:bg-sky-500 hover:text-white transition-all duration-300 shadow-sm"
                title={lang === "ar" ? "قناة تيليجرام" : "Telegram Channel"}
                aria-label="Telegram"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.763-.169.711-.43 1.05-.683 1.073-.55.05-1.042-.366-1.575-.716-.834-.547-1.306-.888-2.116-1.421-.937-.618-.329-.958.204-1.512.14-.145 2.569-2.356 2.616-2.557.006-.025.011-.122-.047-.173-.058-.051-.144-.034-.206-.02-.089.02-1.501.954-4.238 2.802-.401.275-.764.41-1.089.403-.358-.008-1.047-.202-1.56-.369-.629-.205-1.129-.313-1.085-.661.023-.182.274-.369.753-.561 2.955-1.287 4.927-2.137 5.914-2.548 2.822-1.173 3.407-1.377 3.79-1.384.084-.001.272.02.394.119.103.084.132.197.145.276.014.08.03.26-.002.434z"/></svg>
              </a>

              <a 
                href="https://www.facebook.com/ARABTECHSERVEROnline" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-600/30 flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
                title={lang === "ar" ? "صفحة الفيسبوك" : "Facebook Page"}
                aria-label="Facebook"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>

              <a 
                href="https://tiktok.com/@arabtechsuppurt" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-sm"
                title={lang === "ar" ? "تيك توك" : "TikTok"}
                aria-label="TikTok"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 2.378A6.347 6.347 0 0 0 3.5 15.672a6.35 6.35 0 0 0 10.84 4.492V12.38a8.217 8.217 0 0 0 5.25 1.862V10.8a4.79 4.79 0 0 1-3.77-4.114z"/></svg>
              </a>

              <a 
                href="mailto:arabtechserver@gmail.com" 
                className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-sm"
                title={lang === "ar" ? "البريد الإلكتروني" : "Email Support"}
                aria-label="Email"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
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
              <li><Link href={`/${lang}/contact`} className="text-on-surface-variant hover:text-primary transition-colors">{dict.contact}</Link></li>
              <li><Link href={`/${lang}/tutorials`} className="text-on-surface-variant hover:text-primary transition-colors">{dict.tutorials}</Link></li>
              <li><Link href={`/${lang}/blog`} className="text-on-surface-variant hover:text-primary transition-colors">{dict.blog}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm text-on-surface mb-4">{dict.legal}</h3>
            <ul className="flex flex-col gap-2 text-xs">
              <li><Link href={`/${lang}/terms`} className="text-on-surface-variant hover:text-primary transition-colors">{dict.terms}</Link></li>
              <li><Link href={`/${lang}/terms`} className="text-on-surface-variant hover:text-primary transition-colors">{dict.privacy}</Link></li>
              <li><Link href={`/${lang}/refund`} className="text-on-surface-variant hover:text-primary transition-colors">{dict.refund}</Link></li>
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

        {/* Contact Strip: Site Name, WhatsApp, Email, & Support */}
        <div className="pt-6 border-t border-outline-variant/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Site Name & Identity */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-high/40 border border-outline-variant/20">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-lg">domain</span>
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant font-medium">
                {lang === "ar" ? "اسم المنصة الرسمية" : "Official Platform"}
              </p>
              <p className="font-bold text-on-surface text-xs mt-0.5">
                {lang === "ar" ? "عرب تك برو سيرفر" : "Arab Tech Pro Server"}
              </p>
            </div>
          </div>

          {/* WhatsApp Admin 1 */}
          <a
            href="https://wa.me/16728972935"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-high/40 hover:bg-emerald-500/10 border border-outline-variant/20 hover:border-emerald-500/40 transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.148-1.348c1.472.802 3.13 1.224 4.863 1.225h.005c5.505 0 9.989-4.478 9.99-9.985 0-2.668-1.039-5.176-2.927-7.062A9.923 9.923 0 0 0 12.012 2zm.005 16.521h-.004c-1.493 0-2.957-.401-4.232-1.157l-.304-.18-3.146.825.839-3.067-.198-.315c-.832-1.323-1.272-2.859-1.272-4.436 0-4.492 3.656-8.147 8.152-8.147 2.176 0 4.221.848 5.76 2.387a8.096 8.096 0 0 1 2.384 5.763c0 4.493-3.656 8.147-8.152 8.147zm4.469-6.108c-.245-.123-1.452-.716-1.677-.798-.225-.082-.389-.123-.553.123-.164.246-.635.798-.778.962-.143.164-.286.184-.531.062-.245-.123-1.037-.382-1.976-1.219-.73-.651-1.223-1.455-1.366-1.7-.143-.246-.015-.379.108-.501.111-.11.245-.286.368-.429.123-.143.164-.246.245-.409.082-.164.041-.307-.02-.429-.062-.123-.553-1.332-.757-1.822-.204-.49-.409-.419-.553-.429h-.471c-.164 0-.429.062-.654.307-.225.246-.86.84-.86 2.05 0 1.209.88 2.373 1.002 2.537.123.164 1.733 2.646 4.198 3.712.586.254 1.044.406 1.401.52.59.187 1.127.16 1.551.097.473-.07 1.452-.593 1.656-1.166.204-.573.204-1.064.143-1.166-.061-.102-.225-.164-.47-.287z"/></svg>
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant font-medium">
                {lang === "ar" ? "واتساب الدعم والإدارة" : "WhatsApp Admin"}
              </p>
              <p className="font-bold text-emerald-400 font-mono text-xs mt-0.5" dir="ltr">
                +1 (672) 897-2935
              </p>
            </div>
          </a>

          {/* WhatsApp Admin 2 */}
          <a
            href="https://wa.me/249123667227"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-high/40 hover:bg-emerald-500/10 border border-outline-variant/20 hover:border-emerald-500/40 transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.148-1.348c1.472.802 3.13 1.224 4.863 1.225h.005c5.505 0 9.989-4.478 9.99-9.985 0-2.668-1.039-5.176-2.927-7.062A9.923 9.923 0 0 0 12.012 2zm.005 16.521h-.004c-1.493 0-2.957-.401-4.232-1.157l-.304-.18-3.146.825.839-3.067-.198-.315c-.832-1.323-1.272-2.859-1.272-4.436 0-4.492 3.656-8.147 8.152-8.147 2.176 0 4.221.848 5.76 2.387a8.096 8.096 0 0 1 2.384 5.763c0 4.493-3.656 8.147-8.152 8.147zm4.469-6.108c-.245-.123-1.452-.716-1.677-.798-.225-.082-.389-.123-.553.123-.164.246-.635.798-.778.962-.143.164-.286.184-.531.062-.245-.123-1.037-.382-1.976-1.219-.73-.651-1.223-1.455-1.366-1.7-.143-.246-.015-.379.108-.501.111-.11.245-.286.368-.429.123-.143.164-.246.245-.409.082-.164.041-.307-.02-.429-.062-.123-.553-1.332-.757-1.822-.204-.49-.409-.419-.553-.429h-.471c-.164 0-.429.062-.654.307-.225.246-.86.84-.86 2.05 0 1.209.88 2.373 1.002 2.537.123.164 1.733 2.646 4.198 3.712.586.254 1.044.406 1.401.52.59.187 1.127.16 1.551.097.473-.07 1.452-.593 1.656-1.166.204-.573.204-1.064.143-1.166-.061-.102-.225-.164-.47-.287z"/></svg>
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant font-medium">
                {lang === "ar" ? "واتساب خدمة العملاء" : "Customer Support"}
              </p>
              <p className="font-bold text-emerald-400 font-mono text-xs mt-0.5" dir="ltr">
                +249 12 366 7227
              </p>
            </div>
          </a>

          {/* Official Gmail */}
          <a
            href="mailto:arabtechserver@gmail.com"
            className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-high/40 hover:bg-rose-500/10 border border-outline-variant/20 hover:border-rose-500/40 transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 group-hover:scale-105 transition-transform">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-on-surface-variant font-medium">
                {lang === "ar" ? "البريد الإلكتروني الرسمي" : "Official Support Email"}
              </p>
              <p className="font-bold text-rose-400 font-mono text-xs mt-0.5 truncate" dir="ltr">
                arabtechserver@gmail.com
              </p>
            </div>
          </a>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-4 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <p className="flex items-center gap-1 flex-wrap text-center md:text-start">
            <span>&copy; {new Date().getFullYear()}</span>
            <span className="font-bold text-on-surface">عرب تك برو سيرفر - Arab Tech Pro Server.</span>
            <span>{dict.rights || "جميع الحقوق محفوظة."}</span>
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href={`/${lang}/terms`} className="hover:text-primary transition-colors">
              {dict.terms || "شروط الخدمة"}
            </Link>
            <span>•</span>
            <Link href={`/${lang}/refund`} className="hover:text-primary transition-colors">
              {dict.refund || "سياسة الاسترجاع"}
            </Link>
            <span>•</span>
            <Link href={`/${lang}/contact`} className="hover:text-primary transition-colors">
              {dict.contact || "تواصل معنا"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
