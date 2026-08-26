'use client';

import React, { useState, useEffect } from 'react';
import ImageUploader from '@/components/ImageUploader';

export default function VideosAdminPage() {
  const [activeTab, setActiveTab] = useState<'series' | 'standalone'>('series');
  
  const [seriesList, setSeriesList] = useState([]);
  const [videosList, setVideosList] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const [seriesRes, videosRes] = await Promise.all([
        fetch('/api/videos/series'),
        fetch('/api/videos/tutorials')
      ]);
      const series = await seriesRes.json();
      const videos = await videosRes.json();
      setSeriesList(series);
      setVideosList(videos);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
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

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/videos/series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          titleEn: formData.titleEn,
          titleAr: formData.titleAr,
          descriptionEn: formData.descriptionEn,
          descriptionAr: formData.descriptionAr,
          thumbnail: formData.thumbnail,
          isSubscriptionRequired: formData.isSubscriptionRequired,
          price: Number(formData.price)
        })
      });
      if (res.ok) {
        alert("تم إنشاء السلسلة بنجاح!");
        fetchVideos();
      } else {
        alert("حدث خطأ");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/videos/tutorials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          titleEn: formData.titleEn,
          titleAr: formData.titleAr,
          descriptionEn: formData.descriptionEn,
          descriptionAr: formData.descriptionAr,
          videoUrl: formData.videoUrl,
          thumbnail: formData.thumbnail,
          category: formData.category,
          seriesId: formData.seriesId || undefined,
          isFreePreview: formData.isFreePreview
        })
      });
      if (res.ok) {
        alert("تم رفع الفيديو بنجاح!");
        fetchVideos();
      } else {
        alert("حدث خطأ");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">إدارة الأكاديمية والفيديوهات</h1>
      
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('series')}
          className={`px-6 py-2 rounded-lg font-bold transition-colors ${activeTab === 'series' ? 'bg-indigo-600 text-white' : 'bg-[#2A2A3C] text-gray-400 hover:bg-[#3A3A4C]'}`}
        >
          مجموعات الفيديوهات (الكورسات)
        </button>
        <button 
          onClick={() => setActiveTab('standalone')}
          className={`px-6 py-2 rounded-lg font-bold transition-colors ${activeTab === 'standalone' ? 'bg-indigo-600 text-white' : 'bg-[#2A2A3C] text-gray-400 hover:bg-[#3A3A4C]'}`}
        >
          الفيديوهات المفردة / الدروس
        </button>
      </div>

      {activeTab === 'series' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#1E1E2D] p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">إضافة كورس / سلسلة جديدة</h2>
            <form onSubmit={handleCreateSeries} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="titleAr" placeholder="العنوان (عربي)" required className="w-full bg-[#151521] border border-gray-700 rounded-lg p-3 text-white" onChange={handleInputChange} />
                <input type="text" name="titleEn" placeholder="العنوان (إنجليزي)" required className="w-full bg-[#151521] border border-gray-700 rounded-lg p-3 text-white" onChange={handleInputChange} />
              </div>
              <textarea name="descriptionAr" placeholder="الوصف (عربي)" className="w-full bg-[#151521] border border-gray-700 rounded-lg p-3 text-white" onChange={handleInputChange}></textarea>
              <textarea name="descriptionEn" placeholder="الوصف (إنجليزي)" className="w-full bg-[#151521] border border-gray-700 rounded-lg p-3 text-white" onChange={handleInputChange}></textarea>
              
              <div className="p-4 bg-[#151521] border border-gray-700 rounded-lg">
                <label className="block text-sm text-gray-300 mb-2 font-bold">الصورة المصغرة (Thumbnail)</label>
                <ImageUploader name="thumbnail" onChange={(url) => setFormData({ ...formData, thumbnail: url })} />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="text-white flex items-center gap-2">
                  <input type="checkbox" name="isSubscriptionRequired" className="w-5 h-5 rounded bg-gray-800 border-gray-700" onChange={handleInputChange} />
                  هل تتطلب اشتراك / شراء؟
                </label>
                {formData.isSubscriptionRequired && (
                  <input type="number" name="price" placeholder="السعر ($)" className="bg-[#151521] border border-gray-700 rounded-lg p-2 text-white w-32" onChange={handleInputChange} />
                )}
              </div>
              
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                إنشاء السلسلة
              </button>
            </form>
          </div>

          <div className="bg-[#1E1E2D] p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">السلاسل الحالية</h2>
            {loading ? <p className="text-gray-400">جاري التحميل...</p> : (
              <ul className="space-y-4">
                {seriesList.map((s: any) => (
                  <li key={s.id} className="bg-[#151521] p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white">{s.titleAr} / {s.titleEn}</h3>
                      <p className="text-sm text-gray-400">{s.isSubscriptionRequired ? `مدفوع ($${s.price})` : 'مجاني'}</p>
                    </div>
                    <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs">{s.videos?.length || 0} فيديوهات</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {activeTab === 'standalone' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#1E1E2D] p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">إضافة فيديو جديد</h2>
            <form onSubmit={handleCreateVideo} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="titleAr" placeholder="العنوان (عربي)" required className="w-full bg-[#151521] border border-gray-700 rounded-lg p-3 text-white" onChange={handleInputChange} />
                <input type="text" name="titleEn" placeholder="العنوان (إنجليزي)" required className="w-full bg-[#151521] border border-gray-700 rounded-lg p-3 text-white" onChange={handleInputChange} />
              </div>
              <textarea name="descriptionAr" placeholder="الوصف (عربي)" className="w-full bg-[#151521] border border-gray-700 rounded-lg p-3 text-white" onChange={handleInputChange}></textarea>
              <div className="p-4 bg-[#151521] border border-gray-700 rounded-lg">
                <label className="block text-sm text-gray-300 mb-2 font-bold">الصورة المصغرة (Thumbnail)</label>
                <ImageUploader name="thumbnail" onChange={(url) => setFormData({ ...formData, thumbnail: url })} />
              </div>

              <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                <p className="text-xs text-indigo-300 mb-2 font-bold">▶️ رابط الفيديو (يدعم YouTube و Odysee)</p>
                <input type="text" name="videoUrl" placeholder="https://odysee.com/... أو https://youtube.com/..." required className="w-full bg-[#151521] border border-gray-700 rounded-lg p-3 text-white" onChange={handleInputChange} />
              </div>
              
              <select name="seriesId" className="w-full bg-[#151521] border border-gray-700 rounded-lg p-3 text-white" onChange={handleInputChange}>
                <option value="">-- فيديو مستقل (لا ينتمي لسلسلة) --</option>
                {seriesList.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.titleAr}</option>
                ))}
              </select>

              <label className="text-white flex items-center gap-2">
                <input type="checkbox" name="isFreePreview" defaultChecked className="w-5 h-5 rounded bg-gray-800 border-gray-700" onChange={handleInputChange} />
                متاح مجاناً للجميع (Free Preview)
              </label>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                نشر الفيديو
              </button>
            </form>
          </div>

          <div className="bg-[#1E1E2D] p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">الفيديوهات الحالية</h2>
            {loading ? <p className="text-gray-400">جاري التحميل...</p> : (
              <ul className="space-y-4">
                {videosList.map((v: any) => (
                  <li key={v.id} className="bg-[#151521] p-4 rounded-lg border border-gray-700">
                    <h3 className="font-bold text-white">{v.titleAr}</h3>
                    <p className="text-sm text-gray-400 truncate mt-1">{v.videoUrl}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${v.isFreePreview ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {v.isFreePreview ? 'مجاني' : 'مقفل'}
                      </span>
                      {v.series && (
                        <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">سلسلة: {v.series.titleAr}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
