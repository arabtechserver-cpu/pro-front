import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import Link from "next/link";

async function getPosts() {
  try {
    const res = await fetch('https://api.arabtechproserver.tech/api/blog/posts', {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    return [];
  }
}

export default async function BlogPage({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);
  
  const posts = await getPosts();

  return (
    <div className="flex flex-col gap-12">
      {/* Page Header */}
      <section className="relative w-full max-w-4xl mx-auto text-center pt-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10"></div>
        <h1 className="font-display-lg text-4xl lg:text-5xl font-bold tracking-tight text-on-surface mb-4">
          {dict.blog?.title || "Arab Tech Server Blog"}
        </h1>
        <p className="text-lg text-on-surface-variant">
          {dict.blog?.subtitle || "Latest news, updates, and tutorials from the GSM community."}
        </p>
      </section>

      {/* Blog Grid */}
      <section className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {posts.length === 0 ? (
            <div className="col-span-full text-center text-on-surface-variant py-12">
              {params.lang === "ar" ? "لا توجد مقالات حالياً." : "No posts available yet."}
            </div>
          ) : posts.map((post: any) => (
            <article key={post.id} className="relative glass-card rounded-3xl overflow-hidden border border-outline-variant/30 hover:border-primary/50 group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_30px_-10px_rgba(var(--color-primary-rgb),0.2)] flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
              
              <div className="relative h-48 overflow-hidden z-10">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${post.imageUrl}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/20 to-transparent opacity-100"></div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-surface/80 text-primary px-3 py-1 rounded-full text-[10px] uppercase font-extrabold tracking-widest backdrop-blur-md border border-primary/20 shadow-lg">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col relative z-10">
                <div className="flex items-center gap-4 text-xs text-on-surface-variant font-medium mb-3">
                  <span className="flex items-center gap-1.5 bg-surface-variant/30 px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span> 
                    {new Date(post.createdAt).toLocaleDateString(params.lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">person</span> 
                    {dict.blog?.author || "Admin"}
                  </span>
                </div>
                
                <h2 className="text-xl font-display font-bold text-on-surface mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                  {params.lang === "ar" ? post.titleAr : post.titleEn}
                </h2>
                
                <p className="text-on-surface-variant text-sm mb-6 flex-1 leading-relaxed line-clamp-3">
                  {params.lang === "ar" ? post.excerptAr : post.excerptEn}
                </p>
                
                <div className="mt-auto pt-4 border-t border-outline-variant/20 flex items-center justify-between">
                  <Link href={`/${params.lang}/blog/${post.id}`} className="text-primary text-sm font-bold hover:text-primary-container transition-colors flex items-center gap-1.5 w-max group/link">
                    {dict.blog?.readMore || (params.lang === 'ar' ? "اقرأ المزيد" : "Read More")} 
                    <span className={`material-symbols-outlined text-[16px] transform transition-transform ${params.lang === 'ar' ? 'group-hover/link:-translate-x-1' : 'group-hover/link:translate-x-1'}`}>
                      {params.lang === 'ar' ? 'arrow_back' : 'arrow_forward'}
                    </span>
                  </Link>
                  
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                     <span className="material-symbols-outlined text-primary text-[16px]">open_in_new</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      
      {/* Newsletter Subscribe */}
      <section className="container mx-auto max-w-4xl mt-8">
        <div className="glass-panel p-8 rounded-3xl border border-primary/30 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-bl-full pointer-events-none z-0"></div>
          
          <div className="flex-1 relative z-10 text-center md:text-start">
            <h3 className="text-2xl font-bold text-on-surface mb-2">
              {params.lang === "ar" ? "اشترك في نشرتنا الإخبارية" : "Subscribe to our newsletter"}
            </h3>
            <p className="text-on-surface-variant text-sm">
              {params.lang === "ar" ? "احصل على أحدث الأخبار وعروض الأدوات مباشرة في بريدك الإلكتروني." : "Get the latest news and tool offers directly to your inbox."}
            </p>
          </div>
          
          <div className="w-full md:w-auto relative z-10 flex gap-2">
            <input 
              type="email" 
              placeholder={params.lang === "ar" ? "البريد الإلكتروني..." : "Email address..."}
              className="px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all flex-1 min-w-[200px] text-on-surface"
            />
            <button className="btn-primary">
              <i className="fas fa-paper-plane mr-2"></i> {params.lang === "ar" ? "اشترك" : "Subscribe"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
