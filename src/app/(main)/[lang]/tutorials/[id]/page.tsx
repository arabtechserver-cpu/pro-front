import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getTutorial(id: string) {
  try {
    let cleanId = id;
    try {
      cleanId = encodeURIComponent(decodeURIComponent(id).trim());
    } catch (_) {}
    const res = await fetch(`https://api.arabtechproserver.tech/api/videos/tutorials/${cleanId}`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch tutorial:", error);
    return null;
  }
}

function getEmbedUrl(url: string) {
  if (!url) return "";
  if (url.includes("odysee.com") && !url.includes("$/embed")) {
    try {
      const urlObj = new URL(url);
      let path = urlObj.pathname.substring(1); // remove leading slash
      if (path.includes(":")) {
        path = path.replace(/:/g, "/");
        return `https://odysee.com/$/embed/${path}`;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return url;
}

export default async function TutorialDetailsPage({ 
  params 
}: { 
  params: { lang: Locale, id: string } 
}) {
  const dict = await getDictionary(params.lang);
  const tutorial = await getTutorial(params.id);

  if (!tutorial) {
    notFound();
  }

  const isRtl = params.lang === 'ar';
  const title = isRtl ? tutorial.titleAr : tutorial.titleEn;
  const description = isRtl
    ? (tutorial.descriptionAr || "في هذا الفيديو، سنشرح لك بالتفصيل كيفية الاستفادة من هذه الأداة أو الخدمة. يرجى مشاهدة الفيديو بالكامل للحصول على أفضل نتيجة ولفهم كافة الخطوات بشكل صحيح.")
    : (tutorial.descriptionEn || "In this video, we will explain in detail how to benefit from this tool or service. Please watch the full video for the best result and to understand all steps correctly.");

  return (
    <div className="flex flex-col gap-10 pb-20 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Clean Header & Video Section */}
      <section className="container mx-auto max-w-6xl px-4 pt-4 md:pt-8">
        {/* Navigation & Breadcrumb-like header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 md:mb-8">
          <Link href={`/${params.lang}/tutorials`} className="group inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium bg-surface-container hover:bg-surface-container-high px-3.5 py-1.5 md:px-4 md:py-2 rounded-xl border border-outline-variant/30 w-max shadow-sm text-xs md:text-sm">
            <span className={`material-symbols-outlined text-[18px] md:text-[20px] transition-transform ${isRtl ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`}>
              {isRtl ? 'arrow_forward' : 'arrow_back'}
            </span>
            <span>{isRtl ? "العودة إلى الأكاديمية" : "Back to Academy"}</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary px-2.5 py-0.5 md:px-3 md:py-1 rounded-lg text-xs md:text-sm font-bold border border-primary/20">
              {tutorial.category || "Tutorial"}
            </span>
            <span className="text-xs md:text-sm text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] md:text-[16px]">schedule</span>
              {new Date(tutorial.createdAt).toLocaleDateString(params.lang === 'ar' ? 'ar-EG' : 'en-US')}
            </span>
          </div>
        </div>

        {/* Title Area - Smaller on mobile */}
        <div className="mb-4 md:mb-8 max-w-4xl">
          <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-display font-bold text-on-surface leading-snug md:leading-tight">
            {title}
          </h1>
        </div>

        {/* Video Player - Full width & Larger on mobile */}
        <div className="glass-card rounded-xl sm:rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/30 p-1 sm:p-2 md:p-3 bg-surface-container-low/50 -mx-4 sm:mx-0">
          <div className="relative aspect-video w-full rounded-lg sm:rounded-2xl overflow-hidden bg-black shadow-inner">
            <iframe 
              src={getEmbedUrl(tutorial.videoUrl)} 
              title={title}
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* Content Details Section */}
      <section className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Description */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-3xl p-8 border border-outline-variant/30 h-full">
              <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-3 border-b border-outline-variant/20 pb-4">
                <span className="material-symbols-outlined text-primary">description</span>
                {isRtl ? "تفاصيل الشرح" : "Tutorial Description"}
              </h3>
              
              <div className="prose prose-invert max-w-none text-slate-200 prose-p:text-slate-200 prose-p:text-base md:prose-p:text-lg prose-p:leading-relaxed prose-headings:text-white prose-a:text-primary font-sans">
                <p>{description}</p>
                <p>
                  {isRtl ? 
                    "إذا واجهتك أي صعوبة في تنفيذ الخطوات المذكورة في الفيديو، فريق الدعم الخاص بنا متاح دائمًا لتقديم المساعدة." : 
                    "If you encounter any difficulties following the steps in the video, our support team is always available to help."}
                </p>
              </div>
            </div>
          </div>

          {/* Action / Help Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Need Help Card */}
            <div className="glass-card rounded-3xl p-8 border border-primary/20 shadow-md bg-primary/5 relative overflow-hidden group hover:bg-primary/10 transition-colors">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-6 border border-primary/30">
                  <span className="material-symbols-outlined text-2xl">support_agent</span>
                </div>
                <h4 className="font-bold text-on-surface mb-3 text-xl">
                  {isRtl ? "تحتاج مساعدة إضافية؟" : "Need more help?"}
                </h4>
                <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                  {isRtl ? "يمكنك التواصل معنا مباشرة للحصول على دعم فني متخصص بشأن هذه الخدمة أو غيرها." : "You can contact us directly for specialized technical support regarding this service or others."}
                </p>
                <Link href={`/${params.lang}/contact`} className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-primary/25">
                  {isRtl ? "تواصل مع الدعم" : "Contact Support"}
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
