'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ImageUploader from '@/components/ImageUploader';

interface VideoTutorialItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  videoUrl: string;
  thumbnail?: string | null;
  category?: string | null;
  seriesId?: string | null;
  series?: VideoSeriesItem | null;
  orderIndex: number;
  isFreePreview: boolean;
  createdAt: string;
}

interface VideoSeriesItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  thumbnail?: string | null;
  isSubscriptionRequired: boolean;
  price?: number | null;
  videos?: VideoTutorialItem[];
  createdAt: string;
}

export default function VideosAdminPage() {
  const [activeTab, setActiveTab] = useState<'series' | 'standalone'>('series');
  
  const [seriesList, setSeriesList] = useState<VideoSeriesItem[]>([]);
  const [videosList, setVideosList] = useState<VideoTutorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeriesId, setFilterSeriesId] = useState<string>('all');
  const [filterPreviewStatus, setFilterPreviewStatus] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Video Playing / Preview Modal State
  const [previewVideo, setPreviewVideo] = useState<VideoTutorialItem | null>(null);

  // Focus / Manage Specific Series Curriculum Modal
  const [curriculumSeries, setCurriculumSeries] = useState<VideoSeriesItem | null>(null);

  // Add / Edit Video Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoTutorialItem | null>(null);
  const [videoFormData, setVideoFormData] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    videoUrl: '',
    thumbnail: '',
    category: '',
    seriesId: '',
    orderIndex: 0,
    isFreePreview: true
  });
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  // Add / Edit Series Modal State
  const [seriesModalOpen, setSeriesModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<VideoSeriesItem | null>(null);
  const [seriesFormData, setSeriesFormData] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    thumbnail: '',
    isSubscriptionRequired: false,
    price: 0
  });
  const [isSavingSeries, setIsSavingSeries] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('user_token') || localStorage.getItem('token') || localStorage.getItem('adminToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Fetch all Series and Videos
  const fetchVideosAndSeries = async () => {
    setLoading(true);
    try {
      const [seriesRes, videosRes] = await Promise.all([
        fetch('/api/videos/series', { credentials: 'include' }),
        fetch('/api/videos/tutorials', { credentials: 'include' })
      ]);
      const seriesData = await seriesRes.json().catch(() => []);
      const videosData = await videosRes.json().catch(() => []);
      
      const loadedSeries: VideoSeriesItem[] = Array.isArray(seriesData) ? seriesData : [];
      const loadedVideos: VideoTutorialItem[] = Array.isArray(videosData) ? videosData : [];
      
      setSeriesList(loadedSeries);
      setVideosList(loadedVideos);

      // If a series curriculum is currently open, keep it in sync with fresh data
      if (curriculumSeries) {
        const refreshed = loadedSeries.find(s => s.id === curriculumSeries.id);
        if (refreshed) {
          setCurriculumSeries(refreshed);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('تعذر تحميل بيانات الفيديوهات من السيرفر', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideosAndSeries();
  }, []);

  // --- SERIES ACTIONS ---

  const openCreateSeriesModal = () => {
    setEditingSeries(null);
    setSeriesFormData({
      titleAr: '',
      titleEn: '',
      descriptionAr: '',
      descriptionEn: '',
      thumbnail: '',
      isSubscriptionRequired: false,
      price: 0
    });
    setSeriesModalOpen(true);
  };

  const openEditSeriesModal = (series: VideoSeriesItem) => {
    setEditingSeries(series);
    setSeriesFormData({
      titleAr: series.titleAr || '',
      titleEn: series.titleEn || '',
      descriptionAr: series.descriptionAr || '',
      descriptionEn: series.descriptionEn || '',
      thumbnail: series.thumbnail || '',
      isSubscriptionRequired: series.isSubscriptionRequired || false,
      price: series.price || 0
    });
    setSeriesModalOpen(true);
  };

  const handleSaveSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSeries(true);
    try {
      const isEdit = !!editingSeries;
      const url = isEdit ? `/api/videos/series/${editingSeries.id}` : '/api/videos/series';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          titleEn: seriesFormData.titleEn,
          titleAr: seriesFormData.titleAr,
          descriptionEn: seriesFormData.descriptionEn,
          descriptionAr: seriesFormData.descriptionAr,
          thumbnail: seriesFormData.thumbnail,
          isSubscriptionRequired: seriesFormData.isSubscriptionRequired,
          price: seriesFormData.isSubscriptionRequired ? Number(seriesFormData.price) : 0
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(isEdit ? 'تم تحديث بيانات الكورس بنجاح!' : 'تم إنشاء الكورس الجديد بنجاح!');
        setSeriesModalOpen(false);
        fetchVideosAndSeries();
      } else {
        showToast(data.error || 'فشلت عملية حفظ الكورس', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال بالسيرفر', 'error');
    } finally {
      setIsSavingSeries(false);
    }
  };

  const handleDeleteSeries = async (series: VideoSeriesItem) => {
    if (!confirm(`هل أنت متأكد من حذف الكورس (${series.titleAr || series.titleEn})؟ ستبقى الفيديوهات كفيديوهات مستقلة دون حذف.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/videos/series/${series.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast('تم حذف الكورس بنجاح');
        if (curriculumSeries?.id === series.id) {
          setCurriculumSeries(null);
        }
        fetchVideosAndSeries();
      } else {
        showToast(data.error || 'فشل حذف الكورس', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال بالسيرفر', 'error');
    }
  };

  // --- VIDEO ACTIONS ---

  const openCreateVideoModal = (preselectedSeriesId?: string) => {
    setEditingVideo(null);
    
    // Calculate default next orderIndex if added to a specific series
    let nextOrder = 1;
    if (preselectedSeriesId) {
      const series = seriesList.find(s => s.id === preselectedSeriesId);
      if (series?.videos && series.videos.length > 0) {
        nextOrder = series.videos.length + 1;
      }
    }

    setVideoFormData({
      titleAr: '',
      titleEn: '',
      descriptionAr: '',
      descriptionEn: '',
      videoUrl: '',
      thumbnail: '',
      category: '',
      seriesId: preselectedSeriesId || '',
      orderIndex: nextOrder,
      isFreePreview: true
    });
    setVideoModalOpen(true);
  };

  const openEditVideoModal = (video: VideoTutorialItem) => {
    setEditingVideo(video);
    setVideoFormData({
      titleAr: video.titleAr || '',
      titleEn: video.titleEn || '',
      descriptionAr: video.descriptionAr || '',
      descriptionEn: video.descriptionEn || '',
      videoUrl: video.videoUrl || '',
      thumbnail: video.thumbnail || '',
      category: video.category || '',
      seriesId: video.seriesId || '',
      orderIndex: video.orderIndex || 0,
      isFreePreview: video.isFreePreview !== false
    });
    setVideoModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFormData.videoUrl.trim()) {
      showToast('يرجى إدخال رابط الفيديو', 'error');
      return;
    }

    setIsSavingVideo(true);
    try {
      const isEdit = !!editingVideo;
      const url = isEdit ? `/api/videos/tutorials/${editingVideo.id}` : '/api/videos/tutorials';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          titleEn: videoFormData.titleEn,
          titleAr: videoFormData.titleAr,
          descriptionEn: videoFormData.descriptionEn,
          descriptionAr: videoFormData.descriptionAr,
          videoUrl: videoFormData.videoUrl.trim(),
          thumbnail: videoFormData.thumbnail,
          category: videoFormData.category,
          seriesId: videoFormData.seriesId || undefined,
          orderIndex: Number(videoFormData.orderIndex) || 0,
          isFreePreview: videoFormData.isFreePreview
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(isEdit ? 'تم تحديث بيانات الفيديو بنجاح!' : 'تمت إضافة الفيديو بنجاح!');
        setVideoModalOpen(false);
        fetchVideosAndSeries();
      } else {
        showToast(data.error || 'فشلت عملية حفظ الفيديو', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال بالسيرفر', 'error');
    } finally {
      setIsSavingVideo(false);
    }
  };

  const handleDeleteVideo = async (video: VideoTutorialItem) => {
    if (!confirm(`هل أنت متأكد من حذف الفيديو (${video.titleAr || video.titleEn}) نهائياً؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/videos/tutorials/${video.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast('تم حذف الفيديو بنجاح');
        fetchVideosAndSeries();
      } else {
        showToast(data.error || 'فشل حذف الفيديو', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال بالسيرفر', 'error');
    }
  };

  // Filtered Series
  const filteredSeries = useMemo(() => {
    if (!searchQuery.trim()) return seriesList;
    const q = searchQuery.toLowerCase().trim();
    return seriesList.filter(s => 
      s.titleAr?.toLowerCase().includes(q) ||
      s.titleEn?.toLowerCase().includes(q) ||
      s.descriptionAr?.toLowerCase().includes(q) ||
      s.descriptionEn?.toLowerCase().includes(q)
    );
  }, [seriesList, searchQuery]);

  // Filtered Standalone & All Videos
  const filteredVideos = useMemo(() => {
    return videosList.filter(v => {
      // Search text match
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (
        v.titleAr?.toLowerCase().includes(q) ||
        v.titleEn?.toLowerCase().includes(q) ||
        v.videoUrl?.toLowerCase().includes(q) ||
        v.descriptionAr?.toLowerCase().includes(q) ||
        v.category?.toLowerCase().includes(q)
      );

      // Series filter
      const matchSeries = filterSeriesId === 'all' 
        ? true 
        : filterSeriesId === 'none' 
          ? !v.seriesId 
          : v.seriesId === filterSeriesId;

      // Preview status filter
      const matchPreview = filterPreviewStatus === 'all'
        ? true
        : filterPreviewStatus === 'free'
          ? v.isFreePreview
          : !v.isFreePreview;

      return matchSearch && matchSeries && matchPreview;
    });
  }, [videosList, searchQuery, filterSeriesId, filterPreviewStatus]);

  // Video Embed URL Helper
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('odysee.com')) {
      return url.replace('odysee.com/', 'odysee.com/$/embed/');
    }
    return url;
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-8 left-8 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 font-bold text-surface ${
            toastMessage.type === 'success' ? 'bg-primary' : 'bg-error'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">
            {toastMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 max-w-3xl w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">play_circle</span>
                <h3 className="text-lg font-bold text-on-surface truncate">
                  {previewVideo.titleAr || previewVideo.titleEn}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-outline-variant/20 mb-4">
              <iframe
                src={getEmbedUrl(previewVideo.videoUrl)}
                title={previewVideo.titleAr}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span className="truncate max-w-md">رابط الفيديو: {previewVideo.videoUrl}</span>
              <span className={`px-2.5 py-1 rounded-full font-bold ${previewVideo.isFreePreview ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {previewVideo.isFreePreview ? 'معاينة مجانية' : 'كورس مقفل للمشتركين'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Course Curriculum & Lessons Manager Modal */}
      {curriculumSeries && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-5 border-b border-outline-variant/20 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-container-high border border-outline-variant/30 shrink-0 flex items-center justify-center">
                  {curriculumSeries.thumbnail ? (
                    <img src={curriculumSeries.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-2xl text-primary">video_library</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-on-surface">
                      {curriculumSeries.titleAr || curriculumSeries.titleEn}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${curriculumSeries.isSubscriptionRequired ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'}`}>
                      {curriculumSeries.isSubscriptionRequired ? `مدفوع ($${(curriculumSeries.price || 0).toFixed(2)})` : 'مجاني 🟢'}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">
                    {curriculumSeries.descriptionAr || curriculumSeries.descriptionEn || 'إدارة الدروس والفيديوهات التابعة لهذا الكورس.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurriculumSeries(null)}
                className="w-9 h-9 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface shrink-0"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Action Bar inside Curriculum */}
            <div className="py-4 flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/10">
              <div className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">format_list_bulleted</span>
                <span>محتوى الكورس ({curriculumSeries.videos?.length || 0} دروس)</span>
              </div>

              <button
                type="button"
                onClick={() => openCreateVideoModal(curriculumSeries.id)}
                className="bg-primary hover:bg-primary/90 text-on-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>➕ إضافة درس جديد لهذا الكورس</span>
              </button>
            </div>

            {/* Curriculum Lessons List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {(!curriculumSeries.videos || curriculumSeries.videos.length === 0) ? (
                <div className="p-12 text-center bg-surface rounded-2xl border border-outline-variant/20 space-y-4 my-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">play_lesson</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface">لا توجد دروس أو فيديوهات مضافة بعد لهذا الكورس</h3>
                    <p className="text-xs text-on-surface-variant mt-1">ابدأ بإضافة أول درس وفيديو للشرح الآن ليظهر للمشتركين والطلاب.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openCreateVideoModal(curriculumSeries.id)}
                    className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    إضافة الدرس الأول
                  </button>
                </div>
              ) : (
                curriculumSeries.videos.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className="bg-surface hover:bg-surface-container-high/60 border border-outline-variant/30 hover:border-primary/40 p-4 rounded-2xl transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Lesson Order Index */}
                      <div className="w-8 h-8 rounded-xl bg-surface-container-high flex items-center justify-center font-bold text-xs text-primary shrink-0">
                        {lesson.orderIndex || idx + 1}
                      </div>

                      {/* Video Thumbnail */}
                      <div
                        onClick={() => setPreviewVideo(lesson)}
                        className="relative w-20 h-14 rounded-xl overflow-hidden bg-black/40 border border-outline-variant/20 shrink-0 cursor-pointer group flex items-center justify-center"
                        title="انقر لمشاهدة الفيديو"
                      >
                        {lesson.thumbnail ? (
                          <img src={lesson.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-on-surface-variant group-hover:text-primary">smart_display</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-base">play_circle</span>
                        </div>
                      </div>

                      {/* Video Information */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-on-surface">
                            {lesson.titleAr || lesson.titleEn}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${lesson.isFreePreview ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'}`}>
                            {lesson.isFreePreview ? '🟢 معاينة مجانية' : '🔒 مقفل للمشتركين'}
                          </span>
                        </div>
                        {lesson.descriptionAr && (
                          <p className="text-xs text-on-surface-variant line-clamp-1">
                            {lesson.descriptionAr}
                          </p>
                        )}
                        <p className="text-[11px] text-on-surface-variant/80 font-mono truncate max-w-xs sm:max-w-md dir-ltr text-left">
                          {lesson.videoUrl}
                        </p>
                      </div>
                    </div>

                    {/* Lesson Actions */}
                    <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/10">
                      {/* Play Preview */}
                      <button
                        type="button"
                        onClick={() => setPreviewVideo(lesson)}
                        className="w-8 h-8 rounded-xl bg-surface-variant hover:bg-primary/20 text-on-surface hover:text-primary flex items-center justify-center transition-colors"
                        title="مشاهدة الدرس"
                      >
                        <span className="material-symbols-outlined text-sm">play_arrow</span>
                      </button>

                      {/* Edit Video */}
                      <button
                        type="button"
                        onClick={() => openEditVideoModal(lesson)}
                        className="w-8 h-8 rounded-xl bg-primary/10 hover:bg-primary/25 text-primary border border-primary/30 flex items-center justify-center transition-colors"
                        title="تعديل الدرس"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>

                      {/* Delete Video */}
                      <button
                        type="button"
                        onClick={() => handleDeleteVideo(lesson)}
                        className="w-8 h-8 rounded-xl bg-error/10 hover:bg-error/25 text-error border border-error/30 flex items-center justify-center transition-colors"
                        title="حذف الدرس"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-outline-variant/20 flex justify-end">
              <button
                type="button"
                onClick={() => setCurriculumSeries(null)}
                className="bg-surface-variant text-on-surface-variant hover:text-on-surface px-6 py-2.5 rounded-xl font-bold text-xs transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-outline-variant/20">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  {editingVideo ? 'edit_square' : 'add_circle'}
                </span>
                {editingVideo ? 'تعديل بيانات الفيديو / الدرس' : 'إضافة فيديو وشرح جديد'}
              </h3>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">عنوان الفيديو (عربي)</label>
                  <input
                    type="text"
                    value={videoFormData.titleAr}
                    onChange={(e) => setVideoFormData({ ...videoFormData, titleAr: e.target.value })}
                    placeholder="مثال: الدرس 1: طريقة تخطي حساب جوجل"
                    required
                    className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">عنوان الفيديو (إنجليزي)</label>
                  <input
                    type="text"
                    value={videoFormData.titleEn}
                    onChange={(e) => setVideoFormData({ ...videoFormData, titleEn: e.target.value })}
                    placeholder="e.g. Lesson 1: FRP Bypass"
                    required
                    className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">وصف ومحتوى الفيديو (عربي)</label>
                <textarea
                  value={videoFormData.descriptionAr}
                  onChange={(e) => setVideoFormData({ ...videoFormData, descriptionAr: e.target.value })}
                  placeholder="اكتب تفاصيل ومحتوى هذا الدرس والروابط والخطوات..."
                  rows={3}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                  رابط الفيديو (YouTube أو Odysee)
                </label>
                <input
                  type="text"
                  value={videoFormData.videoUrl}
                  onChange={(e) => setVideoFormData({ ...videoFormData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... أو Odysee"
                  required
                  className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm font-mono text-left dir-ltr"
                />
              </div>

              <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20">
                <label className="block text-xs font-bold text-on-surface-variant mb-2">الصورة المصغرة (Thumbnail)</label>
                <ImageUploader
                  name="modal_video_thumbnail"
                  defaultValue={videoFormData.thumbnail}
                  onChange={(url) => setVideoFormData({ ...videoFormData, thumbnail: url })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">الكورس / السلسلة التابع له</label>
                  <select
                    value={videoFormData.seriesId}
                    onChange={(e) => setVideoFormData({ ...videoFormData, seriesId: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm font-semibold cursor-pointer"
                  >
                    <option value="">-- فيديو مستقل (لا ينتمي لكورس) --</option>
                    {seriesList.map(s => (
                      <option key={s.id} value={s.id}>{s.titleAr || s.titleEn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">ترتيب الدرس (Order Index)</label>
                  <input
                    type="number"
                    min="0"
                    value={videoFormData.orderIndex}
                    onChange={(e) => setVideoFormData({ ...videoFormData, orderIndex: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm font-mono"
                  />
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={videoFormData.isFreePreview}
                    onChange={(e) => setVideoFormData({ ...videoFormData, isFreePreview: e.target.checked })}
                    className="w-5 h-5 rounded-lg accent-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-bold text-on-surface block">معاينة مجانية (Free Preview)</span>
                    <span className="text-xs text-on-surface-variant">
                      إذا كان الكورس مدفوعاً، تفعيل هذا الخيار يجعل هذا الفيديو متاحاً مجاناً للجميع كعينة قبل الشراء.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="submit"
                  disabled={isSavingVideo}
                  className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSavingVideo ? (
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">save</span>
                  )}
                  {editingVideo ? 'حفظ التعديلات' : 'نشر وحفظ الفيديو'}
                </button>
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="flex-1 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Series Modal */}
      {seriesModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-outline-variant/20">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  {editingSeries ? 'edit_square' : 'playlist_add'}
                </span>
                {editingSeries ? 'تعديل بيانات الكورس / السلسلة' : 'إنشاء كورس / سلسلة جديدة'}
              </h3>
              <button
                type="button"
                onClick={() => setSeriesModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveSeries} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">عنوان الكورس بالعربية</label>
                  <input
                    type="text"
                    value={seriesFormData.titleAr}
                    onChange={(e) => setSeriesFormData({ ...seriesFormData, titleAr: e.target.value })}
                    placeholder="مثال: دورة احتراف فك الشفرات وتخطي الحمايات"
                    required
                    className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">عنوان الكورس بالإنجليزية</label>
                  <input
                    type="text"
                    value={seriesFormData.titleEn}
                    onChange={(e) => setSeriesFormData({ ...seriesFormData, titleEn: e.target.value })}
                    placeholder="e.g. Master Unlock & Software Repair Course"
                    required
                    className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">وصف الكورس ومحتوياته بالعربية</label>
                <textarea
                  value={seriesFormData.descriptionAr}
                  onChange={(e) => setSeriesFormData({ ...seriesFormData, descriptionAr: e.target.value })}
                  placeholder="وصف تفصيلي لما سيتعلمه المشترك في هذا الكورس..."
                  rows={3}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm"
                />
              </div>

              <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20">
                <label className="block text-xs font-bold text-on-surface-variant mb-2">بوستر / غلاف الكورس المصغر</label>
                <ImageUploader
                  name="modal_series_thumbnail"
                  defaultValue={seriesFormData.thumbnail}
                  onChange={(url) => setSeriesFormData({ ...seriesFormData, thumbnail: url })}
                />
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={seriesFormData.isSubscriptionRequired}
                    onChange={(e) => setSeriesFormData({ ...seriesFormData, isSubscriptionRequired: e.target.checked })}
                    className="w-5 h-5 rounded-lg accent-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-bold text-on-surface block">كورس مدفوع (يتطلب اشتراك / شراء)</span>
                    <span className="text-xs text-on-surface-variant">
                      إذا تم تفعيله، لن يتمكن الزائر من فتح الدروس المقفلة إلا بعد الشراء.
                    </span>
                  </div>
                </label>

                {seriesFormData.isSubscriptionRequired && (
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5">سعر الكورس بالدولار ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={seriesFormData.price}
                      onChange={(e) => setSeriesFormData({ ...seriesFormData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="15.00"
                      className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="submit"
                  disabled={isSavingSeries}
                  className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSavingSeries ? (
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">save</span>
                  )}
                  {editingSeries ? 'حفظ تعديلات الكورس' : 'إنشاء الكورس'}
                </button>
                <button
                  type="button"
                  onClick={() => setSeriesModalOpen(false)}
                  className="flex-1 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Page Header & Quick Statistics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-outline-variant/20 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-2 flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-2xl">movie</span>
            </span>
            إدارة الأكاديمية والكورسات
          </h1>
          <p className="text-on-surface-variant text-sm">
            إدارة السلاسل والكورسات التعليمية وإضافة الفيديوهات وتنسيق المحتوى والدروس بسهولة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Add Course Button */}
          <button
            type="button"
            onClick={openCreateSeriesModal}
            className="bg-surface-container border border-primary/30 hover:border-primary text-primary px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm hover:shadow"
          >
            <span className="material-symbols-outlined text-lg">playlist_add</span>
            <span>+ إنشاء كورس جديد</span>
          </button>

          {/* Quick Add Video Button */}
          <button
            type="button"
            onClick={() => openCreateVideoModal()}
            className="bg-primary hover:bg-primary/90 text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <span className="material-symbols-outlined text-lg">video_call</span>
            <span>+ إضافة فيديو وشرح</span>
          </button>
        </div>
      </div>

      {/* Search & Tabs Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('series')}
            className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
              activeTab === 'series'
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg">video_library</span>
            <span>الكورسات والسلاسل</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'series' ? 'bg-black/30 text-white' : 'bg-surface-variant text-on-surface-variant'}`}>
              {seriesList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('standalone')}
            className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
              activeTab === 'standalone'
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg">play_lesson</span>
            <span>جميع الدروس والفيديوهات</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'standalone' ? 'bg-black/30 text-white' : 'bg-surface-variant text-on-surface-variant'}`}>
              {videosList.length}
            </span>
          </button>
        </div>

        {/* Real-time Search */}
        <div className="relative min-w-[260px] sm:min-w-[320px]">
          <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="بحث في العناوين أو الروابط أو الوصف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant hover:text-on-surface"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* ================= TAB 1: SERIES & COURSES ================= */}
      {activeTab === 'series' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 bg-surface-container rounded-3xl border border-outline-variant/30 gap-3">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">refresh</span>
              <span className="text-sm text-on-surface-variant">جاري تحميل الكورسات...</span>
            </div>
          ) : filteredSeries.length === 0 ? (
            <div className="p-16 text-center bg-surface-container rounded-3xl border border-outline-variant/30 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">video_library</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">لا توجد كورسات مطابقة للبحث</h3>
                <p className="text-xs text-on-surface-variant mt-1">ابدأ بإنشاء أول كورس وأضف الدروس بداخله بكل سهولة.</p>
              </div>
              <button
                type="button"
                onClick={openCreateSeriesModal}
                className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span className="material-symbols-outlined text-base">add</span>
                إنشاء أول كورس
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSeries.map((series) => {
                const totalLessons = series.videos?.length || 0;
                const freeLessons = series.videos?.filter(v => v.isFreePreview)?.length || 0;

                return (
                  <div
                    key={series.id}
                    className="bg-surface-container border border-outline-variant/30 hover:border-primary/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    {/* Course Poster / Thumbnail */}
                    <div className="relative aspect-video bg-black/40 overflow-hidden border-b border-outline-variant/20 flex items-center justify-center">
                      {series.thumbnail ? (
                        <img
                          src={series.thumbnail}
                          alt={series.titleAr}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">video_library</span>
                      )}

                      {/* Price Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${series.isSubscriptionRequired ? 'bg-amber-500/90 text-black border border-amber-400' : 'bg-emerald-600/90 text-white border border-emerald-400'}`}>
                          {series.isSubscriptionRequired ? `مدفوع: $${(series.price || 0).toFixed(2)}` : 'مجاني 🟢'}
                        </span>
                      </div>

                      {/* Total Videos Badge */}
                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-white/10">
                        <span className="material-symbols-outlined text-sm text-primary">play_lesson</span>
                        <span>{totalLessons} دروس</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors line-clamp-1 mb-1">
                          {series.titleAr || series.titleEn}
                        </h3>
                        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                          {series.descriptionAr || series.descriptionEn || 'لا يوجد وصف مضاف لهذا الكورس.'}
                        </p>
                      </div>

                      {/* Lessons Breakdown Summary */}
                      <div className="flex items-center justify-between text-xs py-2 px-3 bg-surface rounded-xl border border-outline-variant/20">
                        <span className="text-on-surface-variant">الدروس المتاحة:</span>
                        <span className="font-bold text-on-surface">
                          {totalLessons} ({freeLessons} مجانية)
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 pt-2 border-t border-outline-variant/10">
                        {/* Open Curriculum Button */}
                        <button
                          type="button"
                          onClick={() => setCurriculumSeries(series)}
                          className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-on-primary py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border border-primary/20 hover:border-primary shadow-sm"
                        >
                          <span className="material-symbols-outlined text-base">format_list_bulleted</span>
                          <span>إدارة محتوى وفيديوهات الكورس ({totalLessons})</span>
                        </button>

                        {/* Quick Add Video & Edit & Delete */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openCreateVideoModal(series.id)}
                            className="flex-1 bg-surface-variant hover:bg-surface-variant/80 text-on-surface-variant hover:text-on-surface py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                            title="إضافة فيديو لهذا الكورس"
                          >
                            <span className="material-symbols-outlined text-sm">add_circle</span>
                            <span>+ إضافة درس</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditSeriesModal(series)}
                            className="w-9 h-9 rounded-xl bg-surface-variant hover:bg-primary/20 text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors"
                            title="تعديل الكورس"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSeries(series)}
                            className="w-9 h-9 rounded-xl bg-error/10 hover:bg-error/25 text-error flex items-center justify-center transition-colors"
                            title="حذف الكورس"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: ALL VIDEOS & TUTORIALS ================= */}
      {activeTab === 'standalone' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
              <span className="material-symbols-outlined text-base">filter_list</span>
              <span>تصفية الفيديوهات:</span>
            </div>

            {/* Filter by Series */}
            <select
              value={filterSeriesId}
              onChange={(e) => setFilterSeriesId(e.target.value)}
              className="px-3 py-2 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-xs font-bold cursor-pointer"
            >
              <option value="all">جميع الكورسات والفيديوهات ({videosList.length})</option>
              <option value="none">فيديوهات مستقلة فقط (لا تنتمي لكورس)</option>
              {seriesList.map(s => (
                <option key={s.id} value={s.id}>كورس: {s.titleAr || s.titleEn}</option>
              ))}
            </select>

            {/* Filter by Preview Status */}
            <select
              value={filterPreviewStatus}
              onChange={(e) => setFilterPreviewStatus(e.target.value)}
              className="px-3 py-2 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-xs font-bold cursor-pointer"
            >
              <option value="all">كل الحالات (مجاني ومقفل)</option>
              <option value="free">معاينة مجانية فقط 🟢</option>
              <option value="locked">مقفل للمشتركين 🔒</option>
            </select>

            <div className="mr-auto text-xs font-bold text-on-surface-variant">
              النتائج المعروضة: {filteredVideos.length} فيديو
            </div>
          </div>

          {/* Videos Grid / List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 bg-surface-container rounded-3xl border border-outline-variant/30 gap-3">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">refresh</span>
              <span className="text-sm text-on-surface-variant">جاري تحميل الفيديوهات...</span>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="p-16 text-center bg-surface-container rounded-3xl border border-outline-variant/30 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">play_lesson</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">لا توجد فيديوهات مطابقة للتصفية الحالية</h3>
                <p className="text-xs text-on-surface-variant mt-1">يمكنك إضافة فيديو جديد أو تغيير شروط الفلترة والبحث.</p>
              </div>
              <button
                type="button"
                onClick={() => openCreateVideoModal()}
                className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span className="material-symbols-outlined text-base">video_call</span>
                إضافة فيديو جديد
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-surface-container border border-outline-variant/30 hover:border-primary/40 rounded-3xl overflow-hidden p-4 transition-all shadow-sm hover:shadow-lg flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-3">
                    {/* Thumbnail with quick play click */}
                    <div
                      onClick={() => setPreviewVideo(video)}
                      className="relative aspect-video rounded-2xl overflow-hidden bg-black/40 border border-outline-variant/20 cursor-pointer group-hover:border-primary/40 flex items-center justify-center"
                      title="انقر لمشاهدة الفيديو"
                    >
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-primary">smart_display</span>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-3xl">play_circle</span>
                      </div>

                      {/* Status Badges on Thumbnail */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow ${video.isFreePreview ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'}`}>
                          {video.isFreePreview ? 'مجاني 🟢' : 'مقفل 🔒'}
                        </span>
                      </div>

                      {video.series && (
                        <div className="absolute bottom-2.5 right-2.5 max-w-[85%] truncate bg-black/75 backdrop-blur-sm text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          كورس: {video.series.titleAr || video.series.titleEn}
                        </div>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-bold text-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                        {video.titleAr || video.titleEn}
                      </h3>
                      {video.descriptionAr && (
                        <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                          {video.descriptionAr}
                        </p>
                      )}
                      <p className="text-[11px] text-on-surface-variant/70 font-mono truncate mt-1 dir-ltr text-left">
                        {video.videoUrl}
                      </p>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center justify-between pt-3 border-t border-outline-variant/15">
                    <button
                      type="button"
                      onClick={() => setPreviewVideo(video)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                      <span>معاينة وتجربة</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditVideoModal(video)}
                        className="w-8 h-8 rounded-xl bg-primary/10 hover:bg-primary/25 text-primary border border-primary/30 flex items-center justify-center transition-colors"
                        title="تعديل الفيديو"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteVideo(video)}
                        className="w-8 h-8 rounded-xl bg-error/10 hover:bg-error/25 text-error border border-error/30 flex items-center justify-center transition-colors"
                        title="حذف الفيديو"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
