import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Locale } from '@/i18n/config';

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
    console.error('Failed to fetch tutorial:', error);
    return null;
  }
}

function getEmbedUrl(url: string) {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    const id = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes('odysee.com') && !url.includes('$/embed')) {
    return url.replace('odysee.com/', 'odysee.com/$/embed/');
  }
  return url;
}

export default async function TutorialDetailsPage({
  params
}: {
  params: { lang: Locale; id: string };
}) {
  const isAr = params.lang === 'ar';
  const video = await getTutorial(params.id);

  if (!video) {
    notFound();
  }

  const series = video.series;
  const playlist: any[] = series?.videos || [];

  // Find index in playlist
  const currentIndex = playlist.findIndex((v: any) => v.id === video.id);
  const prevLesson = currentIndex > 0 ? playlist[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < playlist.length - 1 ? playlist[currentIndex + 1] : null;

  // Access logic
  const isPaidSeries = series?.isSubscriptionRequired;
  const hasAccess = video.isFreePreview || !isPaidSeries;
  const embedUrl = getEmbedUrl(video.videoUrl);

  const title = isAr ? video.titleAr : video.titleEn;
  const description = isAr ? video.descriptionAr : video.descriptionEn;

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white pt-24 pb-20 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Top Breadcrumb Navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm text-gray-400">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/${params.lang}/tutorials`} className="hover:text-indigo-400 transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">school</span>
              <span>{isAr ? 'فيديوهات الشرح والكورسات' : 'Tutorials & Courses'}</span>
            </Link>
            
            {series && (
              <>
                <span className="material-symbols-outlined text-xs rtl:rotate-180 text-gray-600">chevron_right</span>
                <Link href={`/${params.lang}/academy/series/${series.id}`} className="hover:text-indigo-400 transition-colors font-semibold">
                  {isAr ? series.titleAr : series.titleEn}
                </Link>
              </>
            )}

            <span className="material-symbols-outlined text-xs rtl:rotate-180 text-gray-600">chevron_right</span>
            <span className="text-gray-200 font-bold truncate max-w-xs sm:max-w-md">{title}</span>
          </div>

          <Link
            href={`/${params.lang}/tutorials`}
            className="bg-[#1A1A2E] hover:bg-[#22223D] text-indigo-400 hover:text-white px-3 py-1.5 rounded-xl border border-gray-800 text-xs font-bold transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>{isAr ? 'العودة لجميع الشروحات' : 'Back to Tutorials'}</span>
          </Link>
        </div>

        {/* Main Grid: Player + Details & Playlist Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Video & Content (8 cols on lg if playlist exists) */}
          <div className={playlist.length > 0 ? 'lg:col-span-8 space-y-6' : 'lg:col-span-12 space-y-6'}>
            
            {/* Player Container */}
            <div className="bg-[#1A1A2E] rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
              {hasAccess ? (
                <div className="aspect-video relative w-full bg-black">
                  <iframe 
                    src={embedUrl}
                    title={title}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <div className="aspect-video relative w-full bg-gray-900 flex flex-col items-center justify-center p-8 text-center border-b border-gray-800">
                  <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl">lock</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 text-white">
                    {isAr ? 'هذا الدرس حصري للمشتركين في الكورس' : 'This lesson is exclusive to course subscribers'}
                  </h2>
                  <p className="text-gray-400 max-w-md mb-6 text-sm leading-relaxed">
                    {isAr 
                      ? 'اشترك في الكورس الآن لفتح جميع الدروس ومتابعة الشرح العملي بالكامل.' 
                      : 'Enroll in this course now to unlock all lessons and follow the complete hands-on tutorial.'}
                  </p>
                  {series && (
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/${params.lang}/wallet`}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-extrabold py-3 px-8 rounded-2xl transition-all shadow-lg text-sm"
                      >
                        {isAr ? `شراء الكورس ($${series.price || 0})` : `Buy Course ($${series.price || 0})`}
                      </Link>
                      <Link
                        href={`/${params.lang}/academy/series/${series.id}`}
                        className="bg-[#151525] hover:bg-[#22223D] text-white px-6 py-3 rounded-2xl text-sm font-bold border border-gray-800 transition-colors"
                      >
                        {isAr ? 'عرض منهج الكورس' : 'View Course Curriculum'}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Buttons: Previous / Next Lesson */}
            {playlist.length > 1 && (
              <div className="flex items-center justify-between gap-4 p-4 bg-[#1A1A2E] rounded-2xl border border-gray-800">
                {prevLesson ? (
                  <Link
                    href={`/${params.lang}/tutorials/${prevLesson.id}`}
                    className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-indigo-400 transition-colors bg-[#151525] px-4 py-2 rounded-xl border border-gray-800"
                  >
                    <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_back</span>
                    <span>{isAr ? 'الدرس السابق' : 'Previous Lesson'}</span>
                  </Link>
                ) : (
                  <div />
                )}

                <span className="text-xs text-gray-500 font-semibold">
                  {isAr ? `الدرس ${currentIndex + 1} من ${playlist.length}` : `Lesson ${currentIndex + 1} of ${playlist.length}`}
                </span>

                {nextLesson ? (
                  <Link
                    href={`/${params.lang}/tutorials/${nextLesson.id}`}
                    className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-indigo-400 transition-colors bg-[#151525] px-4 py-2 rounded-xl border border-gray-800"
                  >
                    <span>{isAr ? 'الدرس التالي' : 'Next Lesson'}</span>
                    <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            )}

            {/* Video Details & Content Description */}
            <div className="bg-[#1A1A2E] p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-gray-800">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${video.isFreePreview ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                      {video.isFreePreview ? (isAr ? '🟢 معاينة مجانية' : '🟢 Free Preview') : (isAr ? '🔒 كورس مدفوع' : '🔒 Paid')}
                    </span>
                    {video.category && (
                      <span className="bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        {video.category}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {title}
                  </h1>
                </div>

                <span className="text-xs text-gray-400 flex items-center gap-1.5 bg-[#151525] px-3 py-1.5 rounded-xl border border-gray-800">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {new Date(video.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                </span>
              </div>

              {/* Lesson Text / Content */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400 text-base">description</span>
                  <span>{isAr ? 'تفاصيل ومحتوى هذا الدرس:' : 'Lesson Content & Notes:'}</span>
                </h3>
                <div className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-[#151525]/60 p-5 rounded-2xl border border-gray-800/80">
                  {description || (isAr ? 'لا يوجد نص أو محتوى إضافي مضاف لهذا الدرس.' : 'No additional text provided for this lesson.')}
                </div>
              </div>
            </div>
          </div>

          {/* Playlist Sidebar (4 cols on lg) */}
          {playlist.length > 0 && (
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[#1A1A2E] border border-gray-800 rounded-3xl p-5 shadow-xl sticky top-28">
                {/* Playlist Header */}
                <div className="pb-4 mb-4 border-b border-gray-800">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">playlist_play</span>
                      <span>{isAr ? 'قائمة دروس الكورس' : 'Course Playlist'}</span>
                    </span>
                    <span className="text-xs text-gray-500 font-bold">
                      {playlist.length} {isAr ? 'دروس' : 'lessons'}
                    </span>
                  </div>
                  {series && (
                    <h3 className="font-bold text-sm text-white line-clamp-1">
                      {isAr ? series.titleAr : series.titleEn}
                    </h3>
                  )}
                </div>

                {/* Playlist Lessons List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {playlist.map((item: any, idx: number) => {
                    const isCurrent = item.id === video.id;
                    const itemTitle = isAr ? item.titleAr : item.titleEn;
                    const itemFree = item.isFreePreview || !isPaidSeries;

                    return (
                      <Link
                        key={item.id}
                        href={`/${params.lang}/tutorials/${item.id}`}
                        className={`p-3 rounded-2xl border transition-all flex items-center gap-3 group ${
                          isCurrent
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                            : 'bg-[#151525] border-gray-800/80 hover:border-gray-700 text-gray-300 hover:text-white'
                        }`}
                      >
                        {/* Number / Status Icon */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCurrent
                            ? 'bg-indigo-600 text-white'
                            : itemFree
                              ? 'bg-[#1E1E35] text-emerald-400'
                              : 'bg-[#1E1E35] text-amber-400'
                        }`}>
                          {isCurrent ? (
                            <span className="material-symbols-outlined text-sm animate-pulse">play_arrow</span>
                          ) : (
                            item.orderIndex || idx + 1
                          )}
                        </div>

                        {/* Lesson Title */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold line-clamp-1">
                            {itemTitle}
                          </h4>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                            {itemFree ? (
                              <span className="text-emerald-400 font-semibold">{isAr ? 'معاينة مجانية' : 'Free Preview'}</span>
                            ) : (
                              <span className="text-amber-400 font-semibold">{isAr ? 'مقفل 🔒' : 'Locked 🔒'}</span>
                            )}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
