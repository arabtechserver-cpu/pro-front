import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import Link from "next/link";
import { Metadata, ResolvingMetadata } from "next";

// Define the type for the props received by the page and generateMetadata
type Props = {
  params: { lang: Locale; id: string };
};

// Function to fetch a single blog post
async function getPost(id: string) {
  try {
    const res = await fetch(`https://api.arabtechproserver.tech/api/blog/posts/${id}`, {
      cache: "no-store", // We could use revalidate if we wanted ISR
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch blog post with id ${id}:`, error);
    return null;
  }
}

// Generate dynamic SEO Metadata
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPost(params.id);

  if (!post) {
    return {
      title: params.lang === "ar" ? "المقال غير موجود" : "Post Not Found",
    };
  }

  const title = params.lang === "ar" ? post.titleAr : post.titleEn;
  const description = params.lang === "ar" ? post.excerptAr : post.excerptEn;
  
  // Set up SEO properties
  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: "article",
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: post.imageUrl ? [post.imageUrl] : [],
    },
  };
}

// Main Page Component
export default async function BlogPostPage({ params }: Props) {
  const dict = await getDictionary(params.lang);
  const post = await getPost(params.id);

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-error mb-4">
          {params.lang === "ar" ? "عذراً، المقال غير موجود (404)" : "Sorry, post not found (404)"}
        </h1>
        <Link href={`/${params.lang}/blog`} className="text-primary hover:underline">
          {params.lang === "ar" ? "العودة إلى المدونة" : "Back to Blog"}
        </Link>
      </div>
    );
  }

  const title = params.lang === "ar" ? post.titleAr : post.titleEn;
  const content = params.lang === "ar" ? post.contentAr : post.contentEn;

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Article Header & Banner */}
      <header className="relative w-full h-[50vh] min-h-[400px] flex items-end">
        {post.imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: `url('${post.imageUrl}')` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-surface/40 z-10" />
        
        <div className="container mx-auto px-4 relative z-20 pb-12">
          <div className="max-w-4xl mx-auto">
            <span className="bg-primary text-on-primary px-4 py-1.5 rounded-full text-xs uppercase font-extrabold tracking-widest shadow-lg inline-block mb-6">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-on-surface mb-6 leading-tight">
              {title}
            </h1>
            <div className="flex items-center gap-6 text-sm text-on-surface-variant font-medium">
              <span className="flex items-center gap-2 bg-surface-variant/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-on-surface">
                <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
                {new Date(post.createdAt).toLocaleDateString(
                  params.lang === "ar" ? "ar-EG" : "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </span>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                {dict.blog?.author || "Admin"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="container mx-auto px-4">
        <article className="max-w-4xl mx-auto glass-card rounded-3xl p-8 md:p-12 border border-outline-variant/30 shadow-xl">
          {/* We use a prose class to style the rich text HTML content from the editor */}
          <div
            className="prose prose-lg dark:prose-invert prose-primary max-w-none 
              prose-headings:font-display prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl 
              prose-a:text-primary hover:prose-a:text-primary-container prose-a:transition-colors
              prose-img:rounded-2xl prose-img:shadow-lg prose-img:mx-auto"
            dangerouslySetInnerHTML={{ __html: content }}
          />
          
          <div className="mt-16 pt-8 border-t border-outline-variant/20">
            <Link
              href={`/${params.lang}/blog`}
              className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-container transition-colors group"
            >
              <span className={`material-symbols-outlined transform transition-transform ${params.lang === 'ar' ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`}>
                {params.lang === "ar" ? "arrow_forward" : "arrow_back"}
              </span>
              {params.lang === "ar" ? "العودة إلى جميع المقالات" : "Back to all articles"}
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
