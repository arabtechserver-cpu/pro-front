import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import Link from 'next/link';

async function getTutorials() {
  try {
    const res = await fetch('https://api.arabtechproserver.tech/api/videos/tutorials', {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch tutorials:", error);
    return [];
  }
}

function getEmbedUrl(url: string) {
  if (!url) return "";
  if (url.includes("odysee.com") && !url.includes("$/embed")) {
    try {
      const urlObj = new URL(url);
      let path = urlObj.pathname.substring(1); // remove leading slash
      // Handle the format: /name:id or /@channel/name:id
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

export default async function TutorialsPage({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);
  const tutorials = await getTutorials();

  return (
    <div className="flex flex-col gap-12">
      <section className="relative w-full max-w-4xl mx-auto text-center pt-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10"></div>
        <h1 className="font-display-lg text-4xl lg:text-5xl font-bold tracking-tight text-on-surface mb-4">
          {params.lang === "ar" ? "فيديوهات الشرح" : "Video Tutorials"}
        </h1>
        <p className="text-lg text-on-surface-variant">
          {params.lang === "ar" ? "تعلم كيفية استخدام خدماتنا وأدواتنا خطوة بخطوة." : "Learn how to use our services and tools step by step."}
        </p>
      </section>

      <section className="container mx-auto pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tutorials.length === 0 ? (
            <div className="col-span-full text-center text-on-surface-variant py-12">
              {params.lang === "ar" ? "لا توجد فيديوهات حالياً." : "No videos available yet."}
            </div>
          ) : (
            tutorials.map((tutorial: any) => (
              <Link href={`/${params.lang}/tutorials/${tutorial.id}`} key={tutorial.id} className="glass-card rounded-3xl overflow-hidden border border-outline-variant/30 hover:border-primary/50 group transition-all flex flex-col hover:-translate-y-2 hover:shadow-[0_15px_30px_-10px_rgba(var(--color-primary-rgb),0.2)] block">
                <div className="relative aspect-video w-full overflow-hidden bg-surface-container-high flex items-center justify-center">
                  {/* Thumbnail Image Background */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${tutorial.thumbnail || "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80"}')` }}
                  ></div>
                  
                  {/* Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/30 to-black/40"></div>
                  
                  {/* Play Button Icon */}
                  <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center text-primary relative z-10 group-hover:bg-primary group-hover:text-on-primary group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <span className="material-symbols-outlined text-4xl ml-1">play_arrow</span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1 relative z-10">
                  <div className="mb-3">
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                      {tutorial.category || "General"}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-on-surface mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {params.lang === "ar" ? tutorial.titleAr : tutorial.titleEn}
                  </h2>
                  <div className="text-xs text-on-surface-variant mt-auto pt-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">calendar_month</span> 
                    {new Date(tutorial.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
