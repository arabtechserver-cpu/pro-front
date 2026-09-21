import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Locale } from '@/i18n/config';

interface VideoLesson {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  videoUrl: string;
  thumbnail?: string | null;
  orderIndex: number;
  isFreePreview: boolean;
  createdAt: string;
}

interface VideoSeriesDetail {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  thumbnail?: string | null;
  isSubscriptionRequired: boolean;
  price?: number | null;
  videos: VideoLesson[];
  createdAt: string;
}

async function getSeriesDetail(id: string): Promise<VideoSeriesDetail | null> {
  try {
    const res = await fetch(`https://api.arabtechproserver.tech/api/videos/series/${id}`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch series detail:', error);
    return null;
  }
}

export default async function SeriesDetailPage(
  props: {
    params: Promise<{ lang: Locale; id: string }>;
  }
) {
  const params = await props.params;
  const isAr = params.lang === 'ar';
  const series = await getSeriesDetail(params.id);

  if (!series) {
    notFound();
  }

  const title = isAr ? series.titleAr : series.titleEn;
  const description = isAr ? series.descriptionAr : series.descriptionEn;
  const videos = Array.isArray(series.videos) ? series.videos : [];
  const freePreviewsCount = videos.filter(v => v.isFreePreview).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0F0F1A] dark:text-white pt-24 pb-20 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-gray-400">
          <Link href={`/${params.lang}/academy`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">school</span>
            <span>{isAr ? 'الأكاديمية والكورسات' : 'Academy & Courses'}</span>
          </Link>
          <span className="material-symbols-outlined text-sm rtl:rotate-180 text-slate-400 dark:text-gray-600">chevron_right</span>
          <span className="text-slate-800 dark:text-gray-200 font-bold truncate max-w-md">{title}</span>
        </div>

        {/* Hero Course Header Card */}
        <div className="bg-white dark:bg-[#1A1A2E] border border-slate-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xl mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-10 items-center">
            {/* Course Info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 px-3.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">video_library</span>
                  <span>{isAr ? 'كورس تدريبي' : 'Training Course'}</span>
                </span>

                <span className={`px-3.5 py-1 rounded-full text-xs font-bold border ${series.isSubscriptionRequired ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' : 'bg-violet-500/20 text-violet-600 dark:text-violet-400 border-violet-500/30'}`}>
                  {series.isSubscriptionRequired ? (isAr ? `مدفوع ($${(series.price || 0).toFixed(2)})` : `Paid ($${(series.price || 0).toFixed(2)})`) : (isAr ? 'مجاني بالكامل' : 'Free Course')}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {title}
              </h1>

              {description && (
                <p className="text-slate-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                  {description}
                </p>
              )}

              {/* Course Meta Stats */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-gray-800/80 max-w-lg">
                <div className="bg-slate-100 dark:bg-[#151525] p-3 rounded-2xl border border-slate-200 dark:border-gray-800 text-center">
                  <span className="block text-xl font-bold text-indigo-600 dark:text-indigo-400">{videos.length}</span>
                  <span className="text-[11px] text-slate-500 dark:text-gray-400">{isAr ? 'إجمالي الدروس' : 'Total Lessons'}</span>
                </div>

                <div className="bg-slate-100 dark:bg-[#151525] p-3 rounded-2xl border border-slate-200 dark:border-gray-800 text-center">
                  <span className="block text-xl font-bold text-violet-600 dark:text-violet-400">{freePreviewsCount}</span>
                  <span className="text-[11px] text-slate-500 dark:text-gray-400">{isAr ? 'معاينة مجانية' : 'Free Previews'}</span>
                </div>

                <div className="bg-slate-100 dark:bg-[#151525] p-3 rounded-2xl border border-slate-200 dark:border-gray-800 text-center">
                  <span className="block text-xl font-bold text-purple-600 dark:text-purple-400">HD</span>
                  <span className="text-[11px] text-slate-500 dark:text-gray-400">{isAr ? 'جودة عالية' : 'HD Video'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {videos.length > 0 && (
                  <Link
                    href={`/${params.lang}/academy/video/${videos[0].id}`}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">play_arrow</span>
                    <span>{isAr ? 'ابدأ مشاهدة الكورس' : 'Start Watching'}</span>
                  </Link>
                )}

                {series.isSubscriptionRequired && (
                  <Link
                    href={`/${params.lang}/wallet`}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-extrabold px-6 py-3.5 rounded-2xl text-sm shadow-lg transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                    <span>{isAr ? `شحن المحفظة ($${(series.price || 0).toFixed(2)})` : `Top Up Wallet ($${(series.price || 0).toFixed(2)})`}</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Course Poster Preview */}
            <div className="lg:col-span-5">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-gray-700/60 shadow-xl group">
                {series.thumbnail ? (
                  <img
                    src={series.thumbnail}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
                    <span className="material-symbols-outlined text-6xl text-white/20">video_library</span>
                  </div>
                )}
                {videos.length > 0 && (
                  <Link
                    href={`/${params.lang}/academy/video/${videos[0].id}`}
                    className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-all flex items-center justify-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl ml-0.5">play_arrow</span>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Curriculum Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-gray-800">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">format_list_numbered</span>
                <span>{isAr ? 'منهج ومحتوى الكورس' : 'Course Curriculum'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                {isAr
                  ? 'جميع الدروس والفيديوهات التعليمية المتاحة في هذه السلسلة مرتبة خطوة بخطوة.'
                  : 'All lessons and video tutorials in this series organized step-by-step.'}
              </p>
            </div>
            <span className="text-xs text-slate-600 dark:text-gray-400 font-bold bg-white dark:bg-[#1A1A2E] px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
              {videos.length} {isAr ? 'دروس متوفرة' : 'Lessons Available'}
            </span>
          </div>

          {videos.length === 0 ? (
            <div className="bg-white dark:bg-[#1A1A2E] border border-slate-200 dark:border-gray-800 rounded-3xl p-12 text-center text-slate-600 dark:text-gray-400 shadow-sm">
              <span className="material-symbols-outlined text-5xl text-slate-400 dark:text-gray-600 mb-3">movie</span>
              <p className="font-bold text-slate-900 dark:text-white">{isAr ? 'جاري رفع وتجهيز دروس هذا الكورس قريباً.' : 'Course lessons are being prepared soon.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((video, index) => {
                const videoTitle = isAr ? video.titleAr : video.titleEn;
                const videoDesc = isAr ? video.descriptionAr : video.descriptionEn;
                const isFree = video.isFreePreview || !series.isSubscriptionRequired;

                return (
                  <div
                    key={video.id}
                    className="bg-white dark:bg-[#1A1A2E] hover:bg-slate-50 dark:hover:bg-[#22223D] border border-slate-200 dark:border-gray-800/80 hover:border-indigo-500/40 p-4 sm:p-5 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      {/* Lesson Number */}
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#151525] border border-slate-200 dark:border-gray-800 flex items-center justify-center font-bold text-sm text-indigo-600 dark:text-indigo-400 shrink-0">
                        {video.orderIndex || index + 1}
                      </div>

                      {/* Video Thumbnail */}
                      <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden bg-black/50 border border-slate-200 dark:border-gray-800 shrink-0 flex items-center justify-center">
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-slate-400 dark:text-gray-600">smart_display</span>
                        )}
                        {isFree ? (
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-indigo-600/30 transition-all flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">play_circle</span>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-400 text-lg">lock</span>
                          </div>
                        )}
                      </div>

                      {/* Lesson Details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {videoTitle}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${isFree ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'}`}>
                            {isFree ? (isAr ? 'متاح مجاناً' : 'Free Preview') : (isAr ? 'للمشتركين فقط' : 'Members Only')}
                          </span>
                        </div>

                        {videoDesc && (
                          <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {videoDesc}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="sm:shrink-0 flex items-center justify-end">
                      {isFree ? (
                        <Link
                          href={`/${params.lang}/academy/video/${video.id}`}
                          className="bg-indigo-600/15 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border border-indigo-500/30"
                        >
                          <span className="material-symbols-outlined text-sm">play_arrow</span>
                          <span>{isAr ? 'مشاهدة الدرس' : 'Watch Lesson'}</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/${params.lang}/wallet`}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">lock</span>
                          <span>{isAr ? 'فتح الكورس' : 'Unlock Course'}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
