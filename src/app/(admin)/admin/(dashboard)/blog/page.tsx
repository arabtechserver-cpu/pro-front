"use client";

import { useState } from "react";
import { addBlogPost, addVideoTutorial } from "./actions";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUploader from "@/components/ImageUploader";

export default function AdminBlog() {
  const [activeTab, setActiveTab] = useState<"blog" | "tutorial">("blog");
  
  // State for rich text content
  const [contentAr, setContentAr] = useState("");
  const [contentEn, setContentEn] = useState("");

  const handleBlogSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      const formData = new FormData(form);
      await addBlogPost(formData);
      form.reset();
      setContentAr("");
      setContentEn("");
      alert("تم نشر المقال بنجاح!");
    } catch (error: any) {
      alert("حدث خطأ أثناء النشر: " + error.message);
    }
  };

  const handleTutorialSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      const formData = new FormData(form);
      await addVideoTutorial(formData);
      form.reset();
      alert("تم نشر الشرح بنجاح!");
    } catch (error: any) {
      alert("حدث خطأ أثناء النشر: " + error.message);
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-display font-bold text-on-surface mb-2">إدارة المحتوى</h1>
        <p className="text-on-surface-variant">إضافة مقالات جديدة أو شروحات فيديو</p>
      </div>

      <div className="flex gap-4 border-b border-outline-variant/30 pb-4">
        <button 
          onClick={() => setActiveTab("blog")}
          className={`px-6 py-2 rounded-xl font-bold transition-colors ${activeTab === "blog" ? "bg-primary text-on-primary" : "bg-surface-variant text-on-surface-variant hover:text-on-surface"}`}
        >
          <span className="material-symbols-outlined align-middle mr-1 text-sm">article</span> إضافة مقال
        </button>
        <button 
          onClick={() => setActiveTab("tutorial")}
          className={`px-6 py-2 rounded-xl font-bold transition-colors ${activeTab === "tutorial" ? "bg-primary text-on-primary" : "bg-surface-variant text-on-surface-variant hover:text-on-surface"}`}
        >
          <span className="material-symbols-outlined align-middle mr-1 text-sm">smart_display</span> إضافة فيديو تعليمي
        </button>
      </div>

      <div className="glass-card p-8 rounded-3xl border border-outline-variant/30 w-full max-w-5xl">
        {activeTab === "blog" && (
          <form onSubmit={handleBlogSubmit} className="space-y-6 text-right">
            <h2 className="text-2xl font-bold text-on-surface mb-6 border-b border-outline-variant/20 pb-4">مقال جديد</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">العنوان (عربي) <span className="text-error">*</span></label>
                <input name="titleAr" type="text" required placeholder="أدخل عنوان المقال بالعربية..." className="w-full px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">العنوان (إنجليزي) <span className="text-error">*</span></label>
                <input name="titleEn" type="text" required placeholder="Enter article title in English..." className="w-full px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-left" dir="ltr" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">المقتطف (عربي) <span className="text-error">*</span></label>
                <textarea name="excerptAr" required placeholder="اكتب ملخصاً قصيراً للمقال هنا..." className="w-full px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl min-h-[120px] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">المقتطف (إنجليزي) <span className="text-error">*</span></label>
                <textarea name="excerptEn" required placeholder="Write a short excerpt here..." className="w-full px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl min-h-[120px] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-left" dir="ltr"></textarea>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">محتوى المقال (عربي) <span className="text-error">*</span></label>
                <input type="hidden" name="contentAr" value={contentAr} />
                <RichTextEditor value={contentAr} onChange={setContentAr} placeholder="اكتب محتوى المقال الكامل هنا مع التنسيقات والصور..." dir="rtl" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">محتوى المقال (إنجليزي) <span className="text-error">*</span></label>
                <input type="hidden" name="contentEn" value={contentEn} />
                <RichTextEditor value={contentEn} onChange={setContentEn} placeholder="Write full article content here with formatting and images..." dir="ltr" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">صورة المقال <span className="text-error">*</span></label>
                <ImageUploader name="imageUrl" defaultValue="/images/promo_samsung.png" className="w-full bg-surface-container border border-outline-variant/50 rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">التصنيف <span className="text-error">*</span></label>
                <input name="category" type="text" defaultValue="Tutorial" required placeholder="مثال: أخبار, شروحات..." className="w-full px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="btn-primary py-3 px-8 rounded-xl font-bold text-lg hover:shadow-lg transition-all w-full md:w-auto">
                <span className="material-symbols-outlined align-middle mr-2">publish</span>
                نشر المقال
              </button>
            </div>
          </form>
        )}

        {activeTab === "tutorial" && (
          <form onSubmit={handleTutorialSubmit} className="space-y-6 text-right">
            <h2 className="text-2xl font-bold text-on-surface mb-6 border-b border-outline-variant/20 pb-4">فيديو تعليمي جديد</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">العنوان (عربي) <span className="text-error">*</span></label>
                <input name="titleAr" type="text" required placeholder="أدخل عنوان الفيديو بالعربية..." className="w-full px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">العنوان (إنجليزي) <span className="text-error">*</span></label>
                <input name="titleEn" type="text" required placeholder="Enter video title in English..." className="w-full px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-left" dir="ltr" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">رابط الفيديو (يدعم YouTube أو Odysee) <span className="text-error">*</span></label>
              <input name="videoUrl" type="url" required placeholder="مثال: https://odysee.com/videoplayback:id أو YouTube URL" className="w-full px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-left" dir="ltr" />
              <p className="text-xs text-on-surface-variant mt-2">
                * يدعم روابط أوديسي المباشرة (مثل: https://odysee.com/video:id) وروابط يوتيوب.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">التصنيف <span className="text-error">*</span></label>
              <input name="category" type="text" defaultValue="Hardware" required placeholder="مثال: سوفت وير, هارد وير..." className="w-full px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
            </div>

            <div className="pt-4">
              <button type="submit" className="btn-primary py-3 px-8 rounded-xl font-bold text-lg hover:shadow-lg transition-all w-full md:w-auto">
                <span className="material-symbols-outlined align-middle mr-2">publish</span>
                نشر الشرح
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
