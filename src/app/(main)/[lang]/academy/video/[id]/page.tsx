import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getVideo(id: string) {
  try {
    const res = await fetch(`https://api.arabtechproserver.tech/api/videos/tutorials/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function getEmbedUrl(url: string) {
  // Convert standard Odysee URLs to embed URLs if needed
  if (url.includes('odysee.com') && !url.includes('$/embed')) {
    // Basic conversion logic (Odysee URLs are complex, it's best if the admin provides the embed link directly)
    // Example: https://odysee.com/@channel:id/video:id -> https://odysee.com/$/embed/video/id
    // But for safety, we assume if it's an embed or we just pass it to iframe.
    // If it already has $/embed, keep it. If not, we might just try to use it as is if it's a direct mp4, 
    // or tell admins to use embed links.
    return url.replace('odysee.com/', 'odysee.com/$/embed/');
  }
  
  // YouTube conversion
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('youtube.com/watch?v=', 'youtube.com/embed/');
  }
  if (url.includes('youtu.be/')) {
    return url.replace('youtu.be/', 'youtube.com/embed/');
  }
  
  return url;
}

export default async function VideoPage({ params }: { params: { lang: string, id: string } }) {
  const isAr = params.lang === 'ar';
  const video = await getVideo(params.id);

  if (!video) {
    notFound();
  }

  // Handle Paywall Logic
  // For a real app, you would check if the user is authenticated and has purchased the series.
  // Here we simulate the paywall block if the video is NOT free preview.
  const hasAccess = video.isFreePreview; // In real app: || user.hasSubscription

  const embedUrl = getEmbedUrl(video.videoUrl);

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white pt-24 pb-12" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
          <Link href={`/${params.lang}/academy`} className="hover:text-indigo-400 transition-colors">
            {isAr ? 'الأكاديمية' : 'Academy'}
          </Link>
          <span className="material-symbols-outlined text-sm rtl:rotate-180">chevron_right</span>
          {video.series && (
            <>
              <Link href={`/${params.lang}/academy/series/${video.series.id}`} className="hover:text-indigo-400 transition-colors">
                {isAr ? video.series.titleAr : video.series.titleEn}
              </Link>
              <span className="material-symbols-outlined text-sm rtl:rotate-180">chevron_right</span>
            </>
          )}
          <span className="text-gray-200">{isAr ? video.titleAr : video.titleEn}</span>
        </div>

        {/* Video Player Area */}
        <div className="bg-[#1A1A2E] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 mb-8">
          {hasAccess ? (
            <div className="aspect-video relative w-full bg-black">
              <iframe 
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            </div>
          ) : (
            <div className="aspect-video relative w-full bg-gray-900 flex flex-col items-center justify-center p-8 text-center border-b border-gray-800">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl text-indigo-400">lock</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">
                {isAr ? 'هذا المحتوى حصري للمشتركين' : 'This content is exclusive for subscribers'}
              </h2>
              <p className="text-gray-400 max-w-md mb-8">
                {isAr 
                  ? 'اشترك الآن للوصول إلى هذا الفيديو وجميع فيديوهات الدورة بالإضافة إلى مميزات حصرية أخرى.' 
                  : 'Subscribe now to get access to this video, the entire course, and other exclusive features.'}
              </p>
              {video.series && (
                <Link href={`/${params.lang}/academy/series/${video.series.id}`} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-indigo-500/20">
                  {isAr ? `اشترك في السلسلة بـ $${video.series.price}` : `Subscribe for $${video.series.price}`}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Video Details */}
        <div className="bg-[#1A1A2E] p-8 rounded-2xl border border-gray-800">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">
                {isAr ? video.titleAr : video.titleEn}
              </h1>
              {video.category && (
                <span className="inline-block bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-sm font-medium">
                  {video.category}
                </span>
              )}
            </div>
          </div>
          
          <div className="prose prose-invert prose-lg max-w-none text-gray-300">
            {isAr ? video.descriptionAr : video.descriptionEn}
          </div>
        </div>
      </div>
    </div>
  );
}
