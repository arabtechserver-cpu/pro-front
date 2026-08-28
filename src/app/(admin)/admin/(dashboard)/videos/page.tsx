'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ImageUploader from '@/components/ImageUploader';

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

export default function VideosAdminPage() {
  const [activeTab, setActiveTab] = useState<'standalone' | 'series'>('standalone');
  
  const [seriesList, setSeriesList] = useState<VideoSeriesItem[]>([]);
  const [videosList, setVideosList] = useState<VideoTutorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Video Playing / Preview Modal State
  const [previewVideo, setPreviewVideo] = useState<VideoTutorialItem | null>(null);

  // Edit Video Modal State
  const [editingVideo, setEditingVideo] = useState<VideoTutorialItem | null>(null);
  const [editVideoData, setEditVideoData] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    videoUrl: '',
    thumbnail: '',
    category: '',
    seriesId: '',
    isFreePreview: true
  });
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  // Edit Series Modal State
  const [editingSeries, setEditingSeries] = useState<VideoSeriesItem | null>(null);
  const [editSeriesData, setEditSeriesData] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    thumbnail: '',
    isSubscriptionRequired: false,
    price: 0
  });
  const [isSavingSeries, setIsSavingSeries] = useState(false);

  // Create Form Data
  const [formData, setFormData] = useState({
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
    videoUrl: '',
    thumbnail: '',
    category: '',
    seriesId: '',
    isFreePreview: true,
    isSubscriptionRequired: false,
    price: 0
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

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

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const [seriesRes, videosRes] = await Promise.all([
        fetch('/api/videos/series', { credentials: 'include' }),
        fetch('/api/videos/tutorials', { credentials: 'include' })
      ]);
      const series = await seriesRes.json().catch(() => []);
      const videos = await videosRes.json().catch(() => []);
      setSeriesList(Array.isArray(series) ? series : []);
      setVideosList(Array.isArray(videos) ? videos : []);
    } catch (err) {
      console.error(err);
      showToast('تعذر تحميل بيانات الفيديوهات من السيرفر', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Create Series
  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCreate(true);
    try {
      const res = await fetch('/api/videos/series', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          titleEn: formData.titleEn,
          titleAr: formData.titleAr,
          descriptionEn: formData.descriptionEn,
          descriptionAr: formData.descriptionAr,
          thumbnail: formData.thumbnail,
          isSubscriptionRequired: formData.isSubscriptionRequired,
          price: formData.isSubscriptionRequired ? Number(formData.price) : 0
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast('تم إنشاء السلسلة / الكورس بنجاح!');
        setFormData({
          ...formData,
          titleEn: '',
          titleAr: '',
          descriptionEn: '',
          descriptionAr: '',
          thumbnail: '',
          isSubscriptionRequired: false,
          price: 0
        });
        fetchVideos();
      } else {
        showToast(data.error || 'فشل إنشاء السلسلة', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Create Video
  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.videoUrl.trim()) {
      showToast('يرجى إدخال رابط الفيديو', 'error');
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const res = await fetch('/api/videos/tutorials', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          titleEn: formData.titleEn,
          titleAr: formData.titleAr,
          descriptionEn: formData.descriptionEn,
          descriptionAr: formData.descriptionAr,
          videoUrl: formData.videoUrl.trim(),
          thumbnail: formData.thumbnail,
          category: formData.category,
          seriesId: formData.seriesId || undefined,
          isFreePreview: formData.isFreePreview
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast('تم رفع ونشر الفيديو بنجاح!');
        setFormData({
          ...formData,
          titleEn: '',
          titleAr: '',
          descriptionEn: '',
          descriptionAr: '',
          videoUrl: '',
          thumbnail: '',
          category: '',
          seriesId: '',
          isFreePreview: true
        });
        fetchVideos();
      } else {
        showToast(data.error || 'فشل رفع الفيديو', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Open Edit Video Modal
  const openEditVideo = (video: VideoTutorialItem) => {
    setEditingVideo(video);
    setEditVideoData({
      titleAr: video.titleAr || '',
      titleEn: video.titleEn || '',
      descriptionAr: video.descriptionAr || '',
      descriptionEn: video.descriptionEn || '',
      videoUrl: video.videoUrl || '',
      thumbnail: video.thumbnail || '',
      category: video.category || '',
      seriesId: video.seriesId || '',
      isFreePreview: video.isFreePreview !== false
    });
  };

  // Save Edit Video
  const handleSaveVideoEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    setIsSavingVideo(true);
    try {
      const res = await fetch(`/api/videos/tutorials/${editingVideo.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(editVideoData)
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast('تم حفظ تعديلات الفيديو بنجاح!');
        setEditingVideo(null);
        fetchVideos();
      } else {
        showToast(data.error || 'فشل حفظ التعديلات', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال بالسيرفر', 'error');
    } finally {
      setIsSavingVideo(false);
    }
  };

  // Delete Video
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
        setVideosList(prev => prev.filter(v => v.id !== video.id));
      } else {
        showToast(data.error || 'فشل حذف الفيديو', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال بالسيرفر', 'error');
    }
  };

  // Open Edit Series Modal
  const openEditSeries = (series: VideoSeriesItem) => {
    setEditingSeries(series);
    setEditSeriesData({
      titleAr: series.titleAr || '',
      titleEn: series.titleEn || '',
      descriptionAr: series.descriptionAr || '',
      descriptionEn: series.descriptionEn || '',
      thumbnail: series.thumbnail || '',
      isSubscriptionRequired: series.isSubscriptionRequired || false,
      price: series.price || 0
    });
  };

  // Save Edit Series
  const handleSaveSeriesEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeries) return;

    setIsSavingSeries(true);
    try {
      const res = await fetch(`/api/videos/series/${editingSeries.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(editSeriesData)
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast('تم حفظ تعديلات السلسلة بنجاح!');
        setEditingSeries(null);
        fetchVideos();
      } else {
        showToast(data.error || 'فشل حفظ التعديلات', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال بالسيرفر', 'error');
    } finally {
      setIsSavingSeries(false);
    }
  };

  // Delete Series
  const handleDeleteSeries = async (series: VideoSeriesItem) => {
    if (!confirm(`هل أنت متأكد من حذف السلسلة (${series.titleAr || series.titleEn})؟ ستبقى الفيديوهات كفيديوهات مستقلة.`)) {
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
        showToast('تم حذف السلسلة بنجاح');
        setSeriesList(prev => prev.filter(s => s.id !== series.id));
      } else {
        showToast(data.error || 'فشل حذف السلسلة', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال بالسيرفر', 'error');
    }
  };

  // Filtered Videos & Series
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videosList;
    const q = searchQuery.toLowerCase().trim();
    return videosList.filter(v => 
      v.titleAr?.toLowerCase().includes(q) ||
      v.titleEn?.toLowerCase().includes(q) ||
      v.videoUrl?.toLowerCase().includes(q) ||
      v.category?.toLowerCase().includes(q)
    );
  }, [videosList, searchQuery]);

  const filteredSeries = useMemo(() => {
    if (!searchQuery.trim()) return seriesList;
    const q = searchQuery.toLowerCase().trim();
    return seriesList.filter(s => 
      s.titleAr?.toLowerCase().includes(q) ||
      s.titleEn?.toLowerCase().includes(q) ||
      s.descriptionAr?.toLowerCase().includes(q)
    );
  }, [seriesList, searchQuery]);

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
              <span className="truncate">رابط الفيديو: {previewVideo.videoUrl}</span>
              <span className={`px-2.5 py-1 rounded-full font-bold ${previewVideo.isFreePreview ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {previewVideo.isFreePreview ? 'معاينة مجانية' : 'كورس مقفل'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-outline-variant/20">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_square</span>
                تعديل بيانات الفيديو
              </h3>
              <button
                type="button"
                onClick={() => setEditingVideo(null)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveVideoEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">العنوان بالعربية</label>
                  <input
                    type="text"
                    value={editVideoData.titleAr}
                    onChange={(e) => setEditVideoData({ ...editVideoData, titleAr: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">العنوان بالإنجليزية</label>
                  <input
                    type="text"
                    value={editVideoData.titleEn}
                    onChange={(e) => setEditVideoData({ ...editVideoData, titleEn: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">الوصف بالعربية</label>
                <textarea
                  value={editVideoData.descriptionAr}
                  onChange={(e) => setEditVideoData({ ...editVideoData, descriptionAr: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">رابط الفيديو (YouTube / Odysee)</label>
                <input
                  type="text"
                  value={editVideoData.videoUrl}
                  onChange={(e) => setEditVideoData({ ...editVideoData, videoUrl: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm font-mono text-left dir-ltr"
                />
              </div>

              <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20">
                <label className="block text-xs font-bold text-on-surface-variant mb-2">الصورة المصغرة (Thumbnail)</label>
                <ImageUploader
                  name="edit_video_thumbnail"
                  defaultValue={editVideoData.thumbnail}
                  onChange={(url) => setEditVideoData({ ...editVideoData, thumbnail: url })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">السلسلة / الكورس التابع له</label>
                  <select
                    value={editVideoData.seriesId}
                    onChange={(e) => setEditVideoData({ ...editVideoData, seriesId: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm font-semibold cursor-pointer"
                  >
                    <option value="">-- فيديو مستقل (لا ينتمي لكورس) --</option>
                    {seriesList.map(s => (
                      <option key={s.id} value={s.id}>{s.titleAr || s.titleEn}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editVideoData.isFreePreview}
                      onChange={(e) => setEditVideoData({ ...editVideoData, isFreePreview: e.target.checked })}
                      className="w-5 h-5 rounded-lg accent-primary cursor-pointer"
                    />
                    <span className="text-sm font-bold text-on-surface">متاح مجاناً للجميع (Free Preview)</span>
                  </label>
                </div>
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
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="flex-1 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Series Modal */}
      {editingSeries && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-outline-variant/20">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_square</span>
                تعديل بيانات السلسلة / الكورس
              </h3>
              <button
                type="button"
                onClick={() => setEditingSeries(null)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveSeriesEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">عنوان الكورس بالعربية</label>
                  <input
                    type="text"
                    value={editSeriesData.titleAr}
                    onChange={(e) => setEditSeriesData({ ...editSeriesData, titleAr: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">عنوان الكورس بالإنجليزية</label>
                  <input
                    type="text"
                    value={editSeriesData.titleEn}
                    onChange={(e) => setEditSeriesData({ ...editSeriesData, titleEn: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">الوصف بالعربية</label>
                <textarea
                  value={editSeriesData.descriptionAr}
                  onChange={(e) => setEditSeriesData({ ...editSeriesData, descriptionAr: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm"
                />
              </div>

              <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20">
                <label className="block text-xs font-bold text-on-surface-variant mb-2">بوستر / صورة الكورس المصغرة</label>
                <ImageUploader
                  name="edit_series_thumbnail"
                  defaultValue={editSeriesData.thumbnail || ''}
                  onChange={(url) => setEditSeriesData({ ...editSeriesData, thumbnail: url })}
                />
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editSeriesData.isSubscriptionRequired}
                    onChange={(e) => setEditSeriesData({ ...editSeriesData, isSubscriptionRequired: e.target.checked })}
                    className="w-5 h-5 rounded-lg accent-primary cursor-pointer"
                  />
                  <span className="text-sm font-bold text-on-surface">كورس مدفوع (يتطلب رصيد أو شراء)</span>
                </label>

                {editSeriesData.isSubscriptionRequired && (
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5">سعر الكورس ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editSeriesData.price}
                      onChange={(e) => setEditSeriesData({ ...editSeriesData, price: parseFloat(e.target.value) || 0 })}
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
                  حفظ تعديلات السلسلة
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSeries(null)}
                  className="flex-1 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header & Quick Statistics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-outline-variant/20 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-2 flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">movie</span>
            </span>
            إدارة الأكاديمية والفيديوهات
          </h1>
          <p className="text-on-surface-variant text-sm">
            إضافة وتعديل وحذف الشروحات والدروس التعليمية والكورسات الكاملة في الأكاديمية.
          </p>
        </div>

        {/* Live Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px] sm:min-w-[320px]">
            <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="بحث في الفيديوهات والكورسات..."
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
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setActiveTab('standalone')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
            activeTab === 'standalone'
              ? 'bg-primary text-on-primary shadow-md'
              : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-lg">play_lesson</span>
          <span>الدروس والفيديوهات</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'standalone' ? 'bg-black/30 text-white' : 'bg-surface-variant text-on-surface-variant'}`}>
            {videosList.length}
          </span>
        </button>

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
      </div>

      {/* Tab 1: Standalone Videos & Tutorials */}
      {activeTab === 'standalone' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create Video Form */}
          <div className="lg:col-span-5 bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-7 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2 pb-3 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-xl">add_circle</span>
              إضافة فيديو وشرح جديد
            </h2>

            <form onSubmit={handleCreateVideo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">العنوان (عربي)</label>
                  <input
                    type="text"
                    name="titleAr"
                    value={formData.titleAr}
                    onChange={handleInputChange}
                    placeholder="مثال: شرح تخطي حساب جوجل"
                    required
                    className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">العنوان (إنجليزي)</label>
                  <input
                    type="text"
                    name="titleEn"
                    value={formData.titleEn}
                    onChange={handleInputChange}
                    placeholder="e.g. FRP Bypass Tutorial"
                    required
                    className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">الوصف (عربي)</label>
                <textarea
                  name="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={handleInputChange}
                  placeholder="وصف وتفاصيل الفيديو والشرح..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  رابط الفيديو (YouTube أو Odysee)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-sm">
                    link
                  </span>
                  <input
                    type="text"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/watch?v=... أو Odysee"
                    required
                    className="w-full pr-9 pl-3 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-xs font-mono text-left dir-ltr"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-surface rounded-2xl border border-outline-variant/20">
                <label className="block text-xs font-bold text-on-surface-variant mb-2">الصورة المصغرة (Thumbnail)</label>
                <ImageUploader
                  name="create_video_thumb"
                  onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">السلسلة / الكورس</label>
                <select
                  name="seriesId"
                  value={formData.seriesId}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-xs font-semibold cursor-pointer"
                >
                  <option value="">-- فيديو مستقل (لا ينتمي لكورس) --</option>
                  {seriesList.map(s => (
                    <option key={s.id} value={s.id}>{s.titleAr || s.titleEn}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="isFreePreview"
                    checked={formData.isFreePreview}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded-md accent-primary cursor-pointer"
                  />
                  <span className="text-xs font-bold text-on-surface">متاح مجاناً للجميع (Free Preview)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmittingCreate}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSubmittingCreate ? (
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">publish</span>
                )}
                نشر وحفظ الفيديو
              </button>
            </form>
          </div>

          {/* Current Videos List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">video_library</span>
                قائمة الفيديوهات الحالية ({filteredVideos.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 bg-surface-container rounded-3xl border border-outline-variant/30 gap-3">
                <span className="material-symbols-outlined animate-spin text-3xl text-primary">refresh</span>
                <span className="text-xs text-on-surface-variant">جاري تحميل الفيديوهات...</span>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="p-12 text-center bg-surface-container rounded-3xl border border-outline-variant/30 text-on-surface-variant text-sm">
                لا توجد فيديوهات مطابقة للبحث.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-surface-container border border-outline-variant/30 hover:border-primary/40 p-4 rounded-2xl transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Thumbnail or Video Icon */}
                      <div
                        onClick={() => setPreviewVideo(video)}
                        className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden bg-black/40 border border-outline-variant/20 shrink-0 cursor-pointer group flex items-center justify-center"
                        title="انقر لمشاهدة الفيديو"
                      >
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-on-surface-variant group-hover:text-primary">smart_display</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-xl">play_circle</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-on-surface line-clamp-1">
                          {video.titleAr || video.titleEn}
                        </h3>
                        <p className="text-xs text-on-surface-variant/80 font-mono truncate max-w-xs sm:max-w-md dir-ltr text-left">
                          {video.videoUrl}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${video.isFreePreview ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
                            {video.isFreePreview ? 'مجاني 🟢' : 'مقفل 🔒'}
                          </span>
                          {video.series && (
                            <span className="bg-purple-500/15 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold truncate max-w-[140px]">
                              {video.series.titleAr || video.series.titleEn}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/10">
                      {/* Play Preview */}
                      <button
                        type="button"
                        onClick={() => setPreviewVideo(video)}
                        className="w-8 h-8 rounded-xl bg-surface-variant hover:bg-primary/20 text-on-surface hover:text-primary flex items-center justify-center transition-colors"
                        title="مشاهدة الفيديو"
                      >
                        <span className="material-symbols-outlined text-sm">play_arrow</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => openEditVideo(video)}
                        className="w-8 h-8 rounded-xl bg-primary/10 hover:bg-primary/25 text-primary border border-primary/30 flex items-center justify-center transition-colors"
                        title="تعديل الفيديو"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>

                      {/* Delete Button */}
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
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Series & Courses */}
      {activeTab === 'series' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create Series Form */}
          <div className="lg:col-span-5 bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-7 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2 pb-3 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-xl">playlist_add</span>
              إضافة كورس / سلسلة جديدة
            </h2>

            <form onSubmit={handleCreateSeries} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">عنوان الكورس (عربي)</label>
                  <input
                    type="text"
                    name="titleAr"
                    value={formData.titleAr}
                    onChange={handleInputChange}
                    placeholder="مثال: دورة احتراف فك الشفرات"
                    required
                    className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">عنوان الكورس (إنجليزي)</label>
                  <input
                    type="text"
                    name="titleEn"
                    value={formData.titleEn}
                    onChange={handleInputChange}
                    placeholder="e.g. Master Unlock Course"
                    required
                    className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">الوصف (عربي)</label>
                <textarea
                  name="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={handleInputChange}
                  placeholder="وصف محتوى الكورس وما سيتعلمه المشترك..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-xs"
                />
              </div>

              <div className="p-3.5 bg-surface rounded-2xl border border-outline-variant/20">
                <label className="block text-xs font-bold text-on-surface-variant mb-2">بوستر / غلاف الكورس</label>
                <ImageUploader
                  name="create_series_thumb"
                  onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                />
              </div>

              <div className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/20 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="isSubscriptionRequired"
                    checked={formData.isSubscriptionRequired}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded-md accent-primary cursor-pointer"
                  />
                  <span className="text-xs font-bold text-on-surface">كورس مدفوع (يتطلب اشتراك / شراء)</span>
                </label>

                {formData.isSubscriptionRequired && (
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">سعر الكورس ($ USD)</label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="15.00"
                      className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingCreate}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSubmittingCreate ? (
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">save</span>
                )}
                إنشاء الكورس
              </button>
            </form>
          </div>

          {/* Current Series List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">video_library</span>
                قائمة الكورسات والسلاسل ({filteredSeries.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 bg-surface-container rounded-3xl border border-outline-variant/30 gap-3">
                <span className="material-symbols-outlined animate-spin text-3xl text-primary">refresh</span>
                <span className="text-xs text-on-surface-variant">جاري تحميل الكورسات...</span>
              </div>
            ) : filteredSeries.length === 0 ? (
              <div className="p-12 text-center bg-surface-container rounded-3xl border border-outline-variant/30 text-on-surface-variant text-sm">
                لا توجد كورسات مطابقة للبحث.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSeries.map((series) => (
                  <div
                    key={series.id}
                    className="bg-surface-container border border-outline-variant/30 hover:border-primary/40 p-4 rounded-2xl transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Series Thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-outline-variant/20 shrink-0 flex items-center justify-center">
                        {series.thumbnail ? (
                          <img src={series.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-on-surface-variant">video_library</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-on-surface">
                          {series.titleAr || series.titleEn}
                        </h3>
                        {series.descriptionAr && (
                          <p className="text-xs text-on-surface-variant/80 line-clamp-1">
                            {series.descriptionAr}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            {series.videos?.length || 0} دروس
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${series.isSubscriptionRequired ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'}`}>
                            {series.isSubscriptionRequired ? `مدفوع ($${(series.price || 0).toFixed(2)})` : 'مجاني 🟢'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/10">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => openEditSeries(series)}
                        className="w-8 h-8 rounded-xl bg-primary/10 hover:bg-primary/25 text-primary border border-primary/30 flex items-center justify-center transition-colors"
                        title="تعديل السلسلة"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSeries(series)}
                        className="w-8 h-8 rounded-xl bg-error/10 hover:bg-error/25 text-error border border-error/30 flex items-center justify-center transition-colors"
                        title="حذف السلسلة"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
