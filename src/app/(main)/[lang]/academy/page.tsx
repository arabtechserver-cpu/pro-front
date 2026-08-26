import React from 'react';
import Link from 'next/link';

async function getSeries() {
  try {
    const res = await fetch('https://api.arabtechproserver.tech/api/videos/series', { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function getStandaloneVideos() {
  try {
    const res = await fetch('https://api.arabtechproserver.tech/api/videos/tutorials?seriesId=', { cache: 'no-store' });
    if (!res.ok) return [];
    const videos = await res.json();
    return videos.filter((v: any) => !v.seriesId); // Ensure only standalone
  } catch {
    return [];
  }
}

export default async function AcademyPage({ params }: { params: { lang: string } }) {
  const isAr = params.lang === 'ar';
  const seriesList = await getSeries();
  const standaloneVideos = await getStandaloneVideos();

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white py-20" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
            {isAr ? 'أكاديمية التعلم' : 'Learning Academy'}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {isAr 
              ? 'تصفح الكورسات والفيديوهات التعليمية لتطوير مهاراتك في السوفت وير' 
              : 'Browse our courses and tutorials to develop your software skills'}
          </p>
        </div>

        {seriesList.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-500 text-4xl">video_library</span>
              {isAr ? 'الكورسات المتاحة' : 'Available Courses'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {seriesList.map((series: any) => (
                <Link href={`/${params.lang}/academy/series/${series.id}`} key={series.id} className="group">
                  <div className="bg-[#1A1A2E] rounded-2xl overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 h-full flex flex-col">
                    <div className="relative aspect-video bg-gray-900 overflow-hidden">
                      {series.thumbnail ? (
                        <img src={series.thumbnail} alt={series.titleAr} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
                          <span className="material-symbols-outlined text-6xl text-white/20">play_circle</span>
                        </div>
                      )}
                      {series.isSubscriptionRequired && (
                        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-yellow-400 border border-yellow-500/30">
                          ${series.price}
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">
                        {isAr ? series.titleAr : series.titleEn}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
                        {isAr ? series.descriptionAr : series.descriptionEn}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
                        <span className="text-sm text-gray-500 flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">format_list_bulleted</span>
                          {series.videos?.length || 0} {isAr ? 'فيديوهات' : 'Videos'}
                        </span>
                        <span className="text-indigo-400 font-bold group-hover:translate-x-[-4px] transition-transform flex items-center gap-1">
                          {isAr ? 'شاهد الآن' : 'Watch Now'}
                          <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {standaloneVideos.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-purple-500 text-4xl">play_lesson</span>
              {isAr ? 'دروس فردية' : 'Standalone Tutorials'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {standaloneVideos.map((video: any) => (
                <Link href={`/${params.lang}/academy/video/${video.id}`} key={video.id} className="group">
                  <div className="bg-[#1A1A2E] rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300">
                    <div className="aspect-video bg-gray-900 relative">
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt={video.titleAr} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                          <span className="material-symbols-outlined text-4xl text-white/20">smart_display</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 group-hover:text-purple-400 line-clamp-2">
                        {isAr ? video.titleAr : video.titleEn}
                      </h3>
                      {!video.isFreePreview && (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded mt-2">
                          <span className="material-symbols-outlined text-[14px]">lock</span>
                          {isAr ? 'للمشتركين' : 'Members Only'}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
