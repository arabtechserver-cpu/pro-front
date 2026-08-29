import React from 'react';
import Link from 'next/link';
import { Locale } from '@/i18n/config';

interface VideoLesson {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  videoUrl: string;
  thumbnail?: string | null;
  category?: string | null;
  seriesId?: string | null;
  orderIndex: number;
  isFreePreview: boolean;
  createdAt: string;
}

interface VideoSeries {
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

async function getSeries(): Promise<VideoSeries[]> {
  try {
    const res = await fetch('https://api.arabtechproserver.tech/api/videos/series', {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch series:', error);
    return [];
  }
}

async function getAllVideos(): Promise<VideoLesson[]> {
  try {
    const res = await fetch('https://api.arabtechproserver.tech/api/videos/tutorials', {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch tutorials:', error);
    return [];
  }
}

export default async function AcademyPage({ params }: { params: { lang: Locale } }) {
  const isAr = params.lang === 'ar';
  const [seriesList, allVideos] = await Promise.all([
    getSeries(),
    getAllVideos()
  ]);

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white py-16 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-7xl space-y-16">
        
        {/* Header Hero Section */}
        <section className="relative w-full max-w-4xl mx-auto text-center pt-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -z-10"></div>
          
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full text-xs font-bold text-primary mb-4 shadow-sm">
            <span className="material-symbols-outlined text-sm">school</span>
            <span>{isAr ? 'أكاديمية الشروحات والكورسات التعليمية' : 'Academy & Video Tutorials'}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            {isAr ? 'أكاديمية التعلم والكورسات' : 'Learning Academy & Courses'}
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {isAr 
              ? 'تصفح الكورسات والفيديوهات التعليمية لتطوير مهاراتك في السوفت وير والبرمجة وفك الحمايات.' 
              : 'Browse our courses and tutorials to develop your software and repair skills.'}
          </p>
        </section>

        {/* ================= SECTION 1: COURSES & SERIES ================= */}
        {seriesList.length > 0 && (
          <section className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">video_library</span>
                  </span>
                  <span>{isAr ? 'الكورسات والسلاسل المتاحة' : 'Available Courses & Series'}</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  {isAr ? 'دورات متكاملة مرتبة حسب المراحل التعليمية مع تطبيقات عملية.' : 'Full comprehensive courses organized step-by-step with hands-on practice.'}
                </p>
              </div>

              <span className="text-xs font-bold text-gray-400 bg-[#1A1A2E] px-4 py-2 rounded-xl border border-gray-800 self-start sm:self-auto">
                {seriesList.length} {isAr ? 'كورسات متوفرة' : 'Courses Available'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {seriesList.map((series) => {
                const totalVideos = series.videos?.length || 0;
                const freeCount = series.videos?.filter(v => v.isFreePreview)?.length || 0;
                const title = isAr ? series.titleAr : series.titleEn;
                const desc = isAr ? series.descriptionAr : series.descriptionEn;

                return (
                  <Link
                    href={`/${params.lang}/academy/series/${series.id}`}
                    key={series.id}
                    className="group"
                  >
                    <div className="bg-[#1A1A2E] rounded-3xl overflow-hidden border border-gray-800/80 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 h-full flex flex-col hover:-translate-y-1.5">
                      {/* Poster Container */}
                      <div className="relative aspect-video bg-black/60 overflow-hidden border-b border-gray-800/60">
                        {series.thumbnail ? (
                          <img
                            src={series.thumbnail}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950/60 to-purple-950/60">
                            <span className="material-symbols-outlined text-6xl text-white/20">play_circle</span>
                          </div>
                        )}

                        {/* Price Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-md backdrop-blur-md border ${series.isSubscriptionRequired ? 'bg-amber-500 text-black border-amber-400' : 'bg-emerald-500 text-black border-emerald-400'}`}>
                            {series.isSubscriptionRequired ? `$${(series.price || 0).toFixed(2)}` : (isAr ? 'مجاني 🟢' : 'Free 🟢')}
                          </span>
                        </div>

                        {/* Total Lessons Badge */}
                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-white/10">
                          <span className="material-symbols-outlined text-sm text-indigo-400">format_list_bulleted</span>
                          <span>{totalVideos} {isAr ? 'دروس' : 'lessons'}</span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                        <div>
                          <h3 className="text-xl font-bold mb-2 text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {title}
                          </h3>
                          <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                            {desc || (isAr ? 'شاهد تفاصيل هذا الكورس ومنهج الدروس المتاحة.' : 'View course details and complete curriculum.')}
                          </p>
                        </div>

                        {/* Footer Meta & Action */}
                        <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
                            {freeCount > 0 ? (isAr ? `${freeCount} دروس مجانية` : `${freeCount} Free Previews`) : (isAr ? 'كورس شامل' : 'Full Course')}
                          </span>

                          <span className="text-indigo-400 font-bold text-xs group-hover:translate-x-[-4px] transition-transform flex items-center gap-1">
                            <span>{isAr ? 'عرض الكورس' : 'View Course'}</span>
                            <span className="material-symbols-outlined text-xs rtl:rotate-180">arrow_forward</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= SECTION 2: ALL TUTORIALS & LESSONS ================= */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">play_lesson</span>
                </span>
                <span>{isAr ? 'جميع الدروس والشروحات' : 'All Tutorials & Lessons'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                {isAr ? 'فيديوهات وشروحات عملية لمختلف الأدوات والخدمات.' : 'Practical videos and tutorials for all services and tools.'}
              </p>
            </div>

            <span className="text-xs font-bold text-gray-400 bg-[#1A1A2E] px-4 py-2 rounded-xl border border-gray-800 self-start sm:self-auto">
              {allVideos.length} {isAr ? 'فيديوهات' : 'Videos'}
            </span>
          </div>

          {allVideos.length === 0 ? (
            <div className="bg-[#1A1A2E] border border-gray-800 rounded-3xl p-16 text-center text-gray-400 space-y-3">
              <span className="material-symbols-outlined text-5xl text-gray-600">smart_display</span>
              <p className="font-bold text-base text-white">{isAr ? 'لا توجد شروحات أو كورسات منشورة حالياً.' : 'No tutorials available yet.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allVideos.map((video) => {
                const videoTitle = isAr ? video.titleAr : video.titleEn;
                const videoDesc = isAr ? video.descriptionAr : video.descriptionEn;

                return (
                  <Link
                    href={`/${params.lang}/academy/video/${video.id}`}
                    key={video.id}
                    className="group"
                  >
                    <div className="bg-[#1A1A2E] rounded-3xl overflow-hidden border border-gray-800/80 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 h-full flex flex-col hover:-translate-y-1.5">
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video bg-black/60 overflow-hidden border-b border-gray-800/60">
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={videoTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-950/60 to-pink-950/60">
                            <span className="material-symbols-outlined text-5xl text-white/20">smart_display</span>
                          </div>
                        )}

                        {/* Play Overlay Icon */}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-purple-600/30 transition-all flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                            <span className="material-symbols-outlined text-3xl ml-0.5">play_arrow</span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow ${video.isFreePreview ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'}`}>
                            {video.isFreePreview ? (isAr ? 'مجاني 🟢' : 'Free 🟢') : (isAr ? 'مقفل 🔒' : 'Locked 🔒')}
                          </span>
                        </div>

                        {video.category && (
                          <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm text-purple-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border border-purple-500/20">
                            {video.category}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                        <div>
                          <h3 className="text-lg font-bold mb-2 text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                            {videoTitle}
                          </h3>
                          {videoDesc && (
                            <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                              {videoDesc}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {new Date(video.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                          </span>
                          <span className="text-purple-400 font-bold group-hover:underline flex items-center gap-1">
                            <span>{isAr ? 'مشاهدة الفيديو' : 'Watch Video'}</span>
                            <span className="material-symbols-outlined text-xs rtl:rotate-180">play_arrow</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
