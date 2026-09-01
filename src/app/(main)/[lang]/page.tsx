import { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import NewsletterSection from "@/components/NewsletterSection";
import CampaignSlider from "@/components/CampaignSlider";

async function getHomepageConfig() {
  try {
    const res = await fetch("https://api.arabtechproserver.tech/api/homepage", {
      cache: "no-store"
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch homepage config:", err);
  }
  return null;
}

export async function generateMetadata({ params }: { params: { lang: Locale } }): Promise<Metadata> {
  const isAr = params.lang === "ar";
  const title = isAr
    ? "عرب تك برو سيرفر | Arab Tech Pro Server - أفضل منصة لفك الهواتف وخدمات IMEI"
    : "Arab Tech Pro Server - The Best Platform for Remote Phone Unlocking & IMEI Services";
  const description = isAr 
    ? "الموقع الرسمي لمنصة عرب تك برو سيرفر (Arab Tech Pro Server). خدمات فك شبكات الهواتف الرسمية، تخطي iCloud و FRP، وتفعيل بوكسات ودونجل وسيرفرات IMEI بأفضل الأسعار وأعلى سرعة."
    : "Official Arab Tech Pro Server for phone network unlocking, iCloud & FRP bypass, box and dongle activations, and IMEI services worldwide.";

  return {
    title,
    description,
    keywords: [
      "عرب تك برو سيرفر",
      "عرب تيك برو سيرفر",
      "عرب تك سيرفر",
      "عرب تيك سيرفر",
      "Arab Tech Pro Server",
      "Arab Tech Server Pro",
      "Arab Tech Server",
      "arabtechproserver.tech",
      "سيرفر فك الهواتف",
      "فك شبكات",
      "تخطي iCloud",
      "تخطي FRP"
    ],
    openGraph: {
      title,
      description,
      url: `https://arabtechproserver.tech/${params.lang}`,
      siteName: "Arab Tech Pro Server",
      images: [
        {
          url: "https://arabtechproserver.tech/images/og-image.png",
          width: 1200,
          height: 630,
          alt: "Arab Tech Pro Server",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://arabtechproserver.tech/images/og-image.png"],
    },
  };
}

export default async function Home({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);
  const hp = await getHomepageConfig();

  const isAr = params.lang === "ar";
  const langPrefix = `/${params.lang}`;

  // Helper to format links (if relative like /pricing, prepend /ar or /en)
  const formatUrl = (url: string | undefined, defaultUrl: string) => {
    const target = url || defaultUrl;
    if (target.startsWith("http://") || target.startsWith("https://")) {
      return target;
    }
    if (target.startsWith("/")) {
      return `${langPrefix}${target}`;
    }
    return `${langPrefix}/${target}`;
  };

  // Dynamic values or fallbacks
  const notice1 = isAr ? hp?.noticeBar?.text1Ar : hp?.noticeBar?.text1En;
  const notice2 = isAr ? hp?.noticeBar?.text2Ar : hp?.noticeBar?.text2En;
  const whatsappNum = hp?.noticeBar?.whatsapp || "+16728972935";
  const telegramUser = hp?.noticeBar?.telegram && !hp.noticeBar.telegram.includes('@gmail') ? hp.noticeBar.telegram : "@ARABTECHSUPPURT2";
  const telegramUrl = hp?.noticeBar?.telegram
    ? (hp.noticeBar.telegram.startsWith("http") ? hp.noticeBar.telegram : `https://t.me/${hp.noticeBar.telegram.replace(/^@/, '')}`)
    : "https://t.me/ARABTECHSUPPURT2";
  const emailAddr = (hp?.noticeBar?.email && hp.noticeBar.email !== "eslamgsm1774@gmail.com") ? hp.noticeBar.email : "arabtechserver@gmail.com";

  const liveTag = isAr ? hp?.heroSection?.liveTagAr : hp?.heroSection?.liveTagEn;
  const eyebrow = isAr ? hp?.heroSection?.eyebrowAr : hp?.heroSection?.eyebrowEn;
  const title1 = isAr ? hp?.heroSection?.title1Ar : hp?.heroSection?.title1En;
  const title2 = isAr ? hp?.heroSection?.title2Ar : hp?.heroSection?.title2En;
  const lead = isAr ? hp?.heroSection?.leadAr : hp?.heroSection?.leadEn;
  
  const btnBrowse = isAr ? hp?.heroSection?.btnBrowseAr : hp?.heroSection?.btnBrowseEn;
  const btnBrowseUrl = formatUrl(hp?.heroSection?.btnBrowseUrl, "/pricing");

  const btnJoin = isAr ? hp?.heroSection?.btnJoinAr : hp?.heroSection?.btnJoinEn;
  const btnJoinUrl = formatUrl(hp?.heroSection?.btnJoinUrl, "/register");

  const badge1 = isAr ? hp?.heroSection?.badge1Ar : hp?.heroSection?.badge1En;
  const badge2 = isAr ? hp?.heroSection?.badge2Ar : hp?.heroSection?.badge2En;
  const badge3 = isAr ? hp?.heroSection?.badge3Ar : hp?.heroSection?.badge3En;

  const featTitle = isAr ? hp?.sidebarPromos?.featuredTitleAr : hp?.sidebarPromos?.featuredTitleEn;
  const featSub = isAr ? hp?.sidebarPromos?.featuredSubtitleAr : hp?.sidebarPromos?.featuredSubtitleEn;
  const featImg = hp?.sidebarPromos?.featuredImage || "/images/promo_borneo.png";
  const featUrl = formatUrl(hp?.sidebarPromos?.featuredUrl, "/pricing");

  const supportTitle = isAr ? hp?.sidebarPromos?.supportTitleAr : hp?.sidebarPromos?.supportTitleEn;
  const supportBtn = isAr ? hp?.sidebarPromos?.supportBtnAr : hp?.sidebarPromos?.supportBtnEn;
  const whatsappUrl = hp?.sidebarPromos?.whatsappUrl || "https://api.whatsapp.com/send/?phone=16728972935&text&type=phone_number&app_absent=0";

  const imeiTitle = isAr ? hp?.serviceLanes?.imeiTitleAr : hp?.serviceLanes?.imeiTitleEn;
  const imeiDesc = isAr ? hp?.serviceLanes?.imeiDescAr : hp?.serviceLanes?.imeiDescEn;
  const imeiUrl = formatUrl(hp?.serviceLanes?.imeiUrl, "/pricing?cat=imei");

  const serverTitle = isAr ? hp?.serviceLanes?.serverTitleAr : hp?.serviceLanes?.serverTitleEn;
  const serverDesc = isAr ? hp?.serviceLanes?.serverDescAr : hp?.serviceLanes?.serverDescEn;
  const serverUrl = formatUrl(hp?.serviceLanes?.serverUrl, "/pricing?cat=server");

  const remoteTitle = isAr ? hp?.serviceLanes?.remoteTitleAr : hp?.serviceLanes?.remoteTitleEn;
  const remoteDesc = isAr ? hp?.serviceLanes?.remoteDescAr : hp?.serviceLanes?.remoteDescEn;
  const remoteUrl = formatUrl(hp?.serviceLanes?.remoteUrl, "/pricing?cat=remote");

  const storeTitle = isAr ? hp?.serviceLanes?.storeTitleAr : hp?.serviceLanes?.storeTitleEn;
  const storeDesc = isAr ? hp?.serviceLanes?.storeDescAr : hp?.serviceLanes?.storeDescEn;
  const storeUrl = formatUrl(hp?.serviceLanes?.storeUrl, "/pricing?cat=store");

  const feat1Title = isAr ? hp?.featureRibbon?.feat1TitleAr : hp?.featureRibbon?.feat1TitleEn;
  const feat1Desc = isAr ? hp?.featureRibbon?.feat1DescAr : hp?.featureRibbon?.feat1DescEn;

  const feat2Title = isAr ? hp?.featureRibbon?.feat2TitleAr : hp?.featureRibbon?.feat2TitleEn;
  const feat2Desc = isAr ? hp?.featureRibbon?.feat2DescAr : hp?.featureRibbon?.feat2DescEn;

  const feat3Title = isAr ? hp?.featureRibbon?.feat3TitleAr : hp?.featureRibbon?.feat3TitleEn;
  const feat3Desc = isAr ? hp?.featureRibbon?.feat3DescAr : hp?.featureRibbon?.feat3DescEn;

  const campaigns = Array.isArray(hp?.campaigns) ? hp.campaigns : [];

  return (
    <div className="flex flex-col gap-10 sm:gap-16 lg:gap-20 pb-12 sm:pb-20 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Arab Tech Pro Server",
            "url": "https://arabtechproserver.tech",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://arabtechproserver.tech/pricing?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      
      {/* --- Continuous Seamless Notice Bar --- */}
      <div className="w-full bg-surface-container/90 backdrop-blur-md border-b border-outline-variant/20 mb-2 sm:mb-4 relative z-20 overflow-hidden">
        <div className="w-full flex whitespace-nowrap overflow-hidden py-2 sm:py-2.5" dir="ltr">
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer select-none text-xs sm:text-sm font-medium text-on-surface-variant">
            
            {/* Track 1 */}
            <div className="flex shrink-0 items-center gap-6 sm:gap-8 px-4">
              <span className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/25 font-bold shrink-0">
                <i className="fas fa-bolt text-yellow-400"></i>
                <span>{notice1 || (isAr ? "تسليم فوري وتلقائي لمعظم خدمات الـ IMEI والسيرفر على مدار 24/7" : "Instant 24/7 automated delivery for IMEI & server services")}</span>
              </span>

              <span className="flex items-center gap-2 shrink-0">
                <i className="fas fa-shield-alt text-secondary"></i>
                <span>{notice2 || (isAr ? "دفع آمن 100% + شحن فوري للمحفظة مع ضمان استرجاع الرصيد" : "100% Secure checkout + instant wallet funding & refund protection")}</span>
              </span>

              <span className="flex items-center gap-2 text-on-surface shrink-0">
                <i className="fas fa-tools text-primary"></i>
                <span>{isAr ? "تفعيل فوري لأقوى أدوات وبوكسات السوفت وير (UnlockTool, Chimera, Borneo, AMT)" : "Instant activation for top tools (UnlockTool, Chimera, Borneo, AMT)"}</span>
              </span>

              <span className="flex items-center gap-2 shrink-0">
                <i className="fas fa-unlock text-tertiary"></i>
                <span>{isAr ? "فك شفرات رسمي وتخطي iCloud & FRP لجميع الشبكات والموديلات" : "Official factory unlock & iCloud / FRP bypass worldwide"}</span>
              </span>

              <span className="flex items-center gap-2 text-emerald-400 font-semibold shrink-0">
                <i className="fas fa-tags"></i>
                <span>{isAr ? "أسعار جملة وتخفيضات خاصة لأصحاب المحلات والوكلاء" : "Exclusive wholesale pricing for resellers & repair shops"}</span>
              </span>

              <a href={`https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] px-3 py-1 rounded-full border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-all font-bold shrink-0">
                <i className="fab fa-whatsapp text-[#25D366]"></i>
                <span>WhatsApp: {whatsappNum}</span>
              </a>
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#0088cc]/10 text-[#0088cc] px-3 py-1 rounded-full border border-[#0088cc]/30 hover:bg-[#0088cc]/20 transition-all font-bold shrink-0">
                <i className="fab fa-telegram-plane text-[#0088cc]"></i>
                <span>Telegram: {telegramUser}</span>
              </a>
              <a href={`mailto:${emailAddr}`} className="flex items-center gap-2 hover:text-tertiary transition-colors shrink-0">
                <i className="fas fa-envelope text-tertiary"></i>
                <span>{emailAddr}</span>
              </a>
            </div>

            {/* Track 2 (Exact Seamless Clone) */}
            <div className="flex shrink-0 items-center gap-6 sm:gap-8 px-4" aria-hidden="true">
              <span className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/25 font-bold shrink-0">
                <i className="fas fa-bolt text-yellow-400"></i>
                <span>{notice1 || (isAr ? "تسليم فوري وتلقائي لمعظم خدمات الـ IMEI والسيرفر على مدار 24/7" : "Instant 24/7 automated delivery for IMEI & server services")}</span>
              </span>

              <span className="flex items-center gap-2 shrink-0">
                <i className="fas fa-shield-alt text-secondary"></i>
                <span>{notice2 || (isAr ? "دفع آمن 100% + شحن فوري للمحفظة مع ضمان استرجاع الرصيد" : "100% Secure checkout + instant wallet funding & refund protection")}</span>
              </span>

              <span className="flex items-center gap-2 text-on-surface shrink-0">
                <i className="fas fa-tools text-primary"></i>
                <span>{isAr ? "تفعيل فوري لأقوى أدوات وبوكسات السوفت وير (UnlockTool, Chimera, Borneo, AMT)" : "Instant activation for top tools (UnlockTool, Chimera, Borneo, AMT)"}</span>
              </span>

              <span className="flex items-center gap-2 shrink-0">
                <i className="fas fa-unlock text-tertiary"></i>
                <span>{isAr ? "فك شفرات رسمي وتخطي iCloud & FRP لجميع الشبكات والموديلات" : "Official factory unlock & iCloud / FRP bypass worldwide"}</span>
              </span>

              <span className="flex items-center gap-2 text-emerald-400 font-semibold shrink-0">
                <i className="fas fa-tags"></i>
                <span>{isAr ? "أسعار جملة وتخفيضات خاصة لأصحاب المحلات والوكلاء" : "Exclusive wholesale pricing for resellers & repair shops"}</span>
              </span>

              <a href={`https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] px-3 py-1 rounded-full border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-all font-bold shrink-0">
                <i className="fab fa-whatsapp text-[#25D366]"></i>
                <span>WhatsApp: {whatsappNum}</span>
              </a>
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#0088cc]/10 text-[#0088cc] px-3 py-1 rounded-full border border-[#0088cc]/30 hover:bg-[#0088cc]/20 transition-all font-bold shrink-0">
                <i className="fab fa-telegram-plane text-[#0088cc]"></i>
                <span>Telegram: {telegramUser}</span>
              </a>
              <a href={`mailto:${emailAddr}`} className="flex items-center gap-2 hover:text-tertiary transition-colors shrink-0">
                <i className="fas fa-envelope text-tertiary"></i>
                <span>{emailAddr}</span>
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* --- Portal Showcase (Hero) --- */}
      <section className="relative container mx-auto px-4 overflow-hidden">
        {/* Orbs Background */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[280px] sm:w-[600px] h-[280px] sm:h-[600px] bg-primary/10 rounded-full blur-[80px] sm:blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-secondary/10 rounded-full blur-[80px] sm:blur-[100px] -z-10 pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 relative z-10">
          
          {/* Main Launch Card */}
          <article className="lg:col-span-8 glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 border border-outline-variant/30 flex flex-col md:flex-row gap-6 sm:gap-8 shadow-2xl items-center relative overflow-hidden group">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-75 transition-opacity duration-700 pointer-events-none" 
              style={{ backgroundImage: `url('${hp?.heroSection?.heroImage || "/images/promo_hero.png"}')` }}
            ></div>
            <div className="absolute inset-0 bg-surface-container/30 backdrop-blur-[1px] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary/10 rounded-bl-full pointer-events-none z-0"></div>
            
            <div className="flex-1 flex flex-col items-start z-10 w-full">
              <p className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <span className="bg-error/20 text-error px-2 py-1 rounded-full flex items-center gap-1.5 border border-error/30 animate-pulse text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                  {liveTag || (isAr ? "البوابة المباشرة" : "Live service portal")}
                </span>
                <span className="text-on-surface-variant uppercase tracking-wider font-label-sm text-[10px] sm:text-xs">
                  {eyebrow || (isAr ? "خدمات فك احترافية" : "Built for GSM professionals")}
                </span>
              </p>
              
              <h1 className="font-display-lg text-2xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-on-surface mb-4 sm:mb-6 leading-tight">
                <span className="block text-on-surface-variant">{title1 || (isAr ? "كل ما تحتاجه" : "The complete")}</span>
                <span className="text-primary glow-cyan">{title2 || (isAr ? "لإدارة أعمال الـ GSM" : "GSM service portal.")}</span>
              </h1>
              
              <p className="text-sm sm:text-lg text-on-surface-variant mb-6 sm:mb-8 max-w-md">
                {lead || (isAr ? "افتح، تجاوز، وقم بتفعيل الخدمات فوراً مع منصتنا المؤتمتة عبر الـ API." : "Unlock, activate, fund, and track every GSM job from one verified workspace.")}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 w-full sm:w-auto">
                <Link href={btnBrowseUrl} className="btn-primary group w-full sm:w-auto text-center justify-center">
                  <i className="fas fa-bolt mr-2 group-hover:text-yellow-400 transition-colors"></i> {btnBrowse || (isAr ? "عرض كافة الخدمات" : "Browse services")}
                </Link>
                <Link href={btnJoinUrl} className="btn-secondary group w-full sm:w-auto text-center justify-center">
                  <i className="fas fa-user-plus mr-2 group-hover:text-primary transition-colors"></i> {btnJoin || (isAr ? "انضم للشبكة مجاناً" : "Join free")}
                </Link>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm text-on-surface-variant font-medium">
                <span className="flex items-center gap-2"><i className="fas fa-check-circle text-primary"></i> {badge1 || (isAr ? "وقت تسليم حقيقي" : "Clear ETAs")}</span>
                <span className="flex items-center gap-2"><i className="fas fa-shield-alt text-primary"></i> {badge2 || (isAr ? "مدفوعات آمنة" : "Secure checkout")}</span>
                <span className="flex items-center gap-2"><i className="fas fa-headset text-primary"></i> {badge3 || (isAr ? "دعم على مدار الساعة" : "Direct support")}</span>
              </div>
            </div>

            {/* Preview UI Element */}
            <div className="hidden md:block w-full max-w-sm relative z-10 perspective-1000">
               <div className="glass-panel p-4 rounded-xl border border-outline-variant/20 shadow-2xl transform rotate-y-[-10deg] rotate-x-[5deg]">
                 <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/20">
                   <span className="font-bold text-sm text-on-surface">Order Desk</span>
                   <span className="text-xs text-primary flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Online</span>
                 </div>
                 
                 <div className="flex justify-between items-center bg-surface-container rounded p-2 mb-4">
                   <div className="flex flex-col items-center">
                     <i className="fas fa-fingerprint text-primary mb-1"></i>
                     <span className="text-[10px] text-on-surface-variant uppercase">IMEI</span>
                   </div>
                   <div className="flex flex-col items-center">
                     <i className="fas fa-server text-secondary mb-1"></i>
                     <span className="text-[10px] text-on-surface-variant uppercase">Server</span>
                   </div>
                   <div className="flex flex-col items-center">
                     <i className="fas fa-wallet text-tertiary mb-1"></i>
                     <span className="text-[10px] text-on-surface-variant uppercase">Wallet</span>
                   </div>
                 </div>

                 <div className="flex flex-col gap-2">
                    <div className="bg-surface-container-highest p-2 rounded text-xs flex justify-between items-center border border-outline-variant/10">
                      <div className="flex items-center gap-2"><i className="fab fa-apple text-on-surface-variant"></i> <span>Device unlock</span></div>
                      <span className="text-secondary bg-secondary/10 px-1.5 rounded text-[10px]">Processing</span>
                    </div>
                    <div className="bg-surface-container-highest p-2 rounded text-xs flex justify-between items-center border border-outline-variant/10">
                      <div className="flex items-center gap-2"><i className="fas fa-key text-on-surface-variant"></i> <span>Tool activation</span></div>
                      <span className="text-primary bg-primary/10 px-1.5 rounded text-[10px]">Ready</span>
                    </div>
                 </div>
               </div>
            </div>
          </article>

          {/* Promos Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
            <Link href={featUrl} className="flex-1 min-h-[160px] glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-outline-variant/30 relative overflow-hidden group block">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-75 group-hover:opacity-90 transition-opacity duration-500" 
                style={{ backgroundImage: `url('${featImg}')` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1324]/90 via-[#0c1324]/30 to-transparent"></div>
              <div className="relative z-10 h-full flex flex-col justify-end">
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider w-max mb-2 border border-primary/30 flex items-center gap-1">
                  <i className="fas fa-bolt"></i> Featured Now
                </span>
                <h3 className="font-bold text-lg sm:text-xl text-on-surface">{featTitle || "Borneo Schematics"}</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">{featSub || "Official reseller promotion"}</p>
              </div>
            </Link>

            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#25D366]/30 bg-[#25D366]/5 hover:bg-[#25D366]/10 transition-colors flex items-center gap-4 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] text-xl sm:text-2xl group-hover:scale-110 transition-transform shrink-0">
                <i className="fab fa-whatsapp"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">{isAr ? "دعم موثوق ومباشر" : "Direct human support"}</span>
                <strong className="text-sm sm:text-base text-on-surface">{supportTitle || (isAr ? "هل تحتاج مساعدة سريعة؟" : "Need a fast answer?")}</strong>
                <span className="text-xs sm:text-sm text-primary flex items-center gap-2 group-hover:gap-3 transition-all font-semibold">
                  {supportBtn || (isAr ? "تحدث مع الدعم الفني" : "Chat with Support")} <i className="fas fa-arrow-right text-[10px]"></i>
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* --- Service Lanes --- */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Link href={imeiUrl} className="glass-card p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-outline-variant/30 hover:border-primary/50 group transition-all relative overflow-hidden flex flex-col gap-3 sm:gap-4">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-80 transition-opacity duration-500 z-0 pointer-events-none" 
              style={{ backgroundImage: "url('/images/promo_imei.png')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1324]/90 via-[#0c1324]/40 to-transparent z-0 pointer-events-none"></div>
            <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg sm:text-xl group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <i className="fas fa-fingerprint"></i>
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-base sm:text-lg text-on-surface mb-1">{imeiTitle || "IMEI Services"}</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant">{imeiDesc || "Unlocks, checks, and device services"}</p>
            </div>
            <i className="fas fa-arrow-right text-primary absolute bottom-5 sm:bottom-6 right-5 sm:right-6 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all"></i>
          </Link>

          <Link href={serverUrl} className="glass-card p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-outline-variant/30 hover:border-secondary/50 group transition-all relative overflow-hidden flex flex-col gap-3 sm:gap-4">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-80 transition-opacity duration-500 z-0 pointer-events-none" 
              style={{ backgroundImage: "url('/images/promo_server.png')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1324]/90 via-[#0c1324]/40 to-transparent z-0 pointer-events-none"></div>
            <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-lg sm:text-xl group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
              <i className="fas fa-server"></i>
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-base sm:text-lg text-on-surface mb-1">{serverTitle || "Server Services"}</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant">{serverDesc || "Credits, activations, and tools"}</p>
            </div>
            <i className="fas fa-arrow-right text-secondary absolute bottom-5 sm:bottom-6 right-5 sm:right-6 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all"></i>
          </Link>

          <Link href={remoteUrl} className="glass-card p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-outline-variant/30 hover:border-tertiary/50 group transition-all relative overflow-hidden flex flex-col gap-3 sm:gap-4">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-80 transition-opacity duration-500 z-0 pointer-events-none" 
              style={{ backgroundImage: "url('/images/promo_remote.png')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1324]/90 via-[#0c1324]/40 to-transparent z-0 pointer-events-none"></div>
            <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary text-lg sm:text-xl group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors">
              <i className="fas fa-broadcast-tower"></i>
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-base sm:text-lg text-on-surface mb-1">{remoteTitle || "Remote Services"}</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant">{remoteDesc || "Assisted sessions and support"}</p>
            </div>
            <i className="fas fa-arrow-right text-tertiary absolute bottom-5 sm:bottom-6 right-5 sm:right-6 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all"></i>
          </Link>

          <Link href={storeUrl} className="glass-card p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-outline-variant/30 hover:border-primary/50 group transition-all relative overflow-hidden flex flex-col gap-3 sm:gap-4">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-80 transition-opacity duration-500 z-0 pointer-events-none" 
              style={{ backgroundImage: "url('/images/promo_store.png')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1324]/90 via-[#0c1324]/40 to-transparent z-0 pointer-events-none"></div>
            <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface text-lg sm:text-xl group-hover:bg-on-surface group-hover:text-surface-container-lowest transition-colors">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-base sm:text-lg text-on-surface mb-1">{storeTitle || "Tools & Store"}</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant">{storeDesc || "Licenses, products, and bundles"}</p>
            </div>
            <i className="fas fa-arrow-right text-on-surface absolute bottom-5 sm:bottom-6 right-5 sm:right-6 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all"></i>
          </Link>
        </div>
      </section>

      {/* --- Tool Marquee --- */}
      <section className="border-y border-outline-variant/20 bg-surface-container-lowest/50 py-6 sm:py-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-16 sm:w-32 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-16 sm:w-32 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
        
        <div className="container mx-auto px-4 mb-3 sm:mb-4 flex justify-center">
          <span className="bg-surface-container border border-outline-variant/30 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
            <i className="fas fa-certificate text-primary"></i> Tool Network
          </span>
        </div>

        <div className="w-full flex whitespace-nowrap overflow-hidden" dir="ltr">
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer select-none">
            <div className="flex shrink-0 items-center gap-8 sm:gap-12 px-6 text-base sm:text-xl font-bold text-on-surface opacity-80">
              {(hp?.toolMarquee || ["Chimera", "UnlockTool", "Borneo", "iRemoval Pro", "DFT Pro", "MobileSea Tool", "AMT", "Phoenix", "Cheetah", "FKey"]).map((tool: string, idx: number) => (
                <span key={idx} className="flex items-center gap-3 text-primary shrink-0">
                  <i className="fas fa-tools"></i> {tool}
                </span>
              ))}
            </div>

            {/* Repeat exact clone for continuous seamless loop */}
            <div className="flex shrink-0 items-center gap-8 sm:gap-12 px-6 text-base sm:text-xl font-bold text-on-surface opacity-80" aria-hidden="true">
              {(hp?.toolMarquee || ["Chimera", "UnlockTool", "Borneo", "iRemoval Pro", "DFT Pro", "MobileSea Tool", "AMT", "Phoenix", "Cheetah", "FKey"]).map((tool: string, idx: number) => (
                <span key={`repeat-${idx}`} className="flex items-center gap-3 text-primary shrink-0">
                  <i className="fas fa-tools"></i> {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Feature Ribbon --- */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x md:rtl:divide-x-reverse divide-outline-variant/20 glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-outline-variant/30">
          <div className="flex flex-col items-center text-center p-3 sm:p-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-surface-container flex items-center justify-center text-primary text-xl sm:text-2xl mb-3 sm:mb-4 border border-outline-variant/50">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-on-surface mb-1.5 sm:mb-2">{feat1Title || (isAr ? "موزع رسمي معتمد" : "Official distributor")}</h3>
            <p className="text-on-surface-variant text-xs sm:text-sm max-w-xs">{feat1Desc || (isAr ? "وصول مباشر لأهم أدوات السوفت وير العالمية وباقات الجملة." : "Global tool access with reseller-ready bundles and transparent SLAs.")}</p>
          </div>
          <div className="flex flex-col items-center text-center p-3 sm:p-4 pt-6 md:pt-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-surface-container flex items-center justify-center text-secondary text-xl sm:text-2xl mb-3 sm:mb-4 border border-outline-variant/50">
              <i className="fas fa-credit-card"></i>
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-on-surface mb-1.5 sm:mb-2">{feat2Title || (isAr ? "مدفوعات آمنة 100%" : "Secure payments")}</h3>
            <p className="text-on-surface-variant text-xs sm:text-sm max-w-xs">{feat2Desc || (isAr ? "وسائل دفع متعددة وشحن فوري للمحفظة الرقمية." : "Multiple gateways, wallet topups, and receipts for every transaction.")}</p>
          </div>
          <div className="flex flex-col items-center text-center p-3 sm:p-4 pt-6 md:pt-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-surface-container flex items-center justify-center text-tertiary text-xl sm:text-2xl mb-3 sm:mb-4 border border-outline-variant/50">
              <i className="fas fa-headset"></i>
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-on-surface mb-1.5 sm:mb-2">{feat3Title || (isAr ? "دعم مخصص ذو أولوية" : "Priority support")}</h3>
            <p className="text-on-surface-variant text-xs sm:text-sm max-w-xs">{feat3Desc || (isAr ? "فريق دعم بشري متواجد على التيليجرام والواتساب لمساعدتك." : "Live chat and Telegram admin with priority lanes for resellers.")}</p>
          </div>
        </div>
      </section>

      {/* --- Campaign Stage (Promotions) --- */}
      <section className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-8 gap-4">
          <div>
            <span className="text-primary text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-2">
              <i className="fas fa-certificate"></i> Official reseller campaigns
            </span>
            <h2 className="font-display-lg-mobile text-xl sm:text-3xl font-bold text-on-surface">Fresh activations, unlocks, and tool offers</h2>
          </div>
        </div>

        <div className="w-full">
          {campaigns.length > 0 ? (
            <CampaignSlider campaigns={campaigns} lang={params.lang} />
          ) : (
            <div className="glass-card rounded-2xl sm:rounded-3xl p-8 border border-outline-variant/30 text-center text-on-surface-variant">
              {isAr ? "لا توجد عروض حالية." : "No active campaigns at the moment."}
            </div>
          )}
        </div>
      </section>

      {/* --- Real Interactive Newsletter Section --- */}
      <NewsletterSection lang={params.lang} className="container mx-auto px-4" />
      
    </div>
  );
}
