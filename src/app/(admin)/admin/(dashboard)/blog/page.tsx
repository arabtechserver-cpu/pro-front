"use client";

import { useState, useEffect } from "react";
import { addBlogPost, addVideoTutorial, updateBlogPost, deleteBlogPost } from "./actions";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUploader from "@/components/ImageUploader";

interface BlogPost {
  id: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  contentAr: string;
  contentEn: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}

export default function AdminBlog() {
  const [activeTab, setActiveTab] = useState<"articles" | "new_blog" | "tutorial">("articles");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State for new post rich text content
  const [newContentAr, setNewContentAr] = useState("");
  const [newContentEn, setNewContentEn] = useState("");

  // State for edit post rich text content
  const [editContentAr, setEditContentAr] = useState("");
  const [editContentEn, setEditContentEn] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://api.arabtechproserver.tech/api/blog/posts", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const seen = new Set();
        const uniquePosts = (Array.isArray(data) ? data : []).filter((p: any) => {
          const key = (p.titleAr || p.titleEn || p.id).trim().toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setPosts(uniquePosts);
      }
    } catch (err) {
      console.error("Failed to load blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSeedDefaults = async () => {
    if (!confirm("هل تريد إضافة الـ 10 مقالات الاحترافية الافتراضية إلى الموقع الآن؟")) return;
    try {
      setLoading(true);
      const token = document.cookie.split('admin_token=')[1]?.split(';')[0]?.trim() || localStorage.getItem('adminToken') || localStorage.getItem('user_token');
      const headers: Record<string, string> = {};
      if (token && token !== 'null' && token !== 'undefined') {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch("/api/blog/seed-defaults", {
        method: "POST",
        headers,
        credentials: "include"
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setToastMessage(data.message || "تمت إضافة المقالات بنجاح!");
        fetchPosts();
      } else {
        alert(data.error || "فشل تحميل المقالات");
      }
    } catch (err) {
      alert("حدث خطأ أثناء تحميل المقالات");
    } finally {
      setLoading(false);
    }
  };

  const handleBlogSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      const formData = new FormData(form);
      formData.set("contentAr", newContentAr);
      formData.set("contentEn", newContentEn);
      await addBlogPost(formData);
      form.reset();
      setNewContentAr("");
      setNewContentEn("");
      setToastMessage("تم نشر المقال بنجاح!");
      fetchPosts();
      setActiveTab("articles");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error: any) {
      alert("حدث خطأ أثناء النشر: " + error.message);
    }
  };

  const handleEditClick = (post: BlogPost) => {
    setEditingPost(post);
    setEditContentAr(post.contentAr || "");
    setEditContentEn(post.contentEn || "");
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPost) return;
    const form = e.currentTarget;
    try {
      const formData = new FormData(form);
      formData.set("contentAr", editContentAr);
      formData.set("contentEn", editContentEn);
      await updateBlogPost(editingPost.id, formData);
      setEditingPost(null);
      setToastMessage("تم حفظ وتحديث المقال بنجاح!");
      fetchPosts();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error: any) {
      alert("حدث خطأ أثناء التحديث: " + error.message);
    }
  };

  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف المقال: "${title}"؟`)) return;
    try {
      await deleteBlogPost(id);
      setToastMessage("تم حذف المقال بنجاح");
      fetchPosts();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert("فشل حذف المقال: " + err.message);
    }
  };

  const handleTutorialSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      const formData = new FormData(form);
      await addVideoTutorial(formData);
      form.reset();
      setToastMessage("تم نشر الفيديو بنجاح!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error: any) {
      alert("حدث خطأ أثناء النشر: " + error.message);
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-8 z-50 bg-primary text-surface font-bold px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <span className="material-symbols-outlined text-2xl">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">article</span>
            إدارة المدونة والمقالات والشروحات
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            إدارة وتعديل المقالات الـ 10 باللغتين العربية والإنجليزية وإضافة مقالات وشروحات جديدة.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSeedDefaults}
            className="px-4 py-2 rounded-xl bg-surface-container-high border border-primary/40 text-primary hover:bg-primary hover:text-surface text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">auto_stories</span>
            إضافة/استعادة المقالات الـ 10 بضغطة زر
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-3 border-b border-outline-variant/30 pb-3">
        <button
          onClick={() => { setActiveTab("articles"); setEditingPost(null); }}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-sm ${
            activeTab === "articles"
              ? "bg-primary text-on-primary shadow-md"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-base">format_list_bulleted</span>
          المقالات المنشورة ({posts.length})
        </button>

        <button
          onClick={() => { setActiveTab("new_blog"); setEditingPost(null); }}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-sm ${
            activeTab === "new_blog"
              ? "bg-primary text-on-primary shadow-md"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          إضافة مقال جديد
        </button>

        <button
          onClick={() => { setActiveTab("tutorial"); setEditingPost(null); }}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-sm ${
            activeTab === "tutorial"
              ? "bg-primary text-on-primary shadow-md"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-base">smart_display</span>
          إضافة فيديو تعليمي
        </button>
      </div>

      {/* EDIT MODAL / DRAWER */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e1628] border border-outline-variant/40 rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">edit_note</span>
                تعديل المقال: {editingPost.titleAr}
              </h2>
              <button
                onClick={() => setEditingPost(null)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-on-surface-variant">العنوان (عربي) *</label>
                  <input
                    name="titleAr"
                    type="text"
                    required
                    defaultValue={editingPost.titleAr}
                    className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant/50 rounded-xl text-sm font-bold text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-on-surface-variant">العنوان (إنجليزي) *</label>
                  <input
                    name="titleEn"
                    type="text"
                    required
                    defaultValue={editingPost.titleEn}
                    className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant/50 rounded-xl text-sm font-bold text-on-surface text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-on-surface-variant">المقتطف والوصف المختصر (عربي) *</label>
                  <textarea
                    name="excerptAr"
                    required
                    rows={3}
                    defaultValue={editingPost.excerptAr}
                    className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant/50 rounded-xl text-xs text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-on-surface-variant">المقتطف والوصف المختصر (إنجليزي) *</label>
                  <textarea
                    name="excerptEn"
                    required
                    rows={3}
                    defaultValue={editingPost.excerptEn}
                    className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant/50 rounded-xl text-xs text-on-surface text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-primary">المحتوى الكامل (عربي) *</label>
                  <RichTextEditor value={editContentAr} onChange={setEditContentAr} placeholder="محتوى المقال بالعربية..." dir="rtl" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-primary">المحتوى الكامل (إنجليزي) *</label>
                  <RichTextEditor value={editContentEn} onChange={setEditContentEn} placeholder="Article content in English..." dir="ltr" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-on-surface-variant">صورة المقال (رابط أو رفع) *</label>
                  <input
                    name="imageUrl"
                    type="text"
                    required
                    defaultValue={editingPost.imageUrl}
                    className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant/50 rounded-xl text-xs font-mono text-on-surface text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-on-surface-variant">التصنيف (Category) *</label>
                  <input
                    name="category"
                    type="text"
                    required
                    defaultValue={editingPost.category}
                    className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant/50 rounded-xl text-xs text-on-surface"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-5 py-2.5 rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 1: LIST ARTICLES */}
      {activeTab === "articles" && (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-outline-variant/30 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">article</span>
              قائمة المقالات المنشورة في الموقع ({posts.length})
            </h2>

            <button
              onClick={() => setActiveTab("new_blog")}
              className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              إضافة مقال جديد
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">refresh</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-on-surface-variant text-sm">لا توجد مقالات حالياً في قاعدة البيانات.</p>
              <button
                onClick={handleSeedDefaults}
                className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">auto_stories</span>
                توليد المقالات الـ 10 المقترحة بنقرة واحدة
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post, idx) => (
                <div
                  key={post.id}
                  className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/25 flex flex-col justify-between gap-4 hover:border-primary/40 transition-all group"
                >
                  <div className="flex gap-4 items-start">
                    <div
                      className="w-24 h-24 rounded-xl bg-cover bg-center border border-outline-variant/30 flex-shrink-0"
                      style={{ backgroundImage: `url('${post.imageUrl || "/images/promo_hero.png"}')` }}
                    />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-primary/15 text-primary px-2.5 py-0.5 rounded-full font-bold">
                          {post.category}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          {new Date(post.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                        {post.titleAr}
                      </h3>
                      <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                        {post.excerptAr}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-outline-variant/15 text-xs">
                    <a
                      href={`/ar/blog/${post.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-[11px] font-bold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">visibility</span>
                      معاينة في الموقع
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(post)}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary/20 text-on-surface hover:text-primary font-bold text-xs transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">edit</span>
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id, post.titleAr)}
                        className="p-1.5 rounded-lg bg-error/10 hover:bg-error/20 text-error transition-all"
                        title="حذف المقال"
                      >
                        <span className="material-symbols-outlined text-xs">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: NEW BLOG POST */}
      {activeTab === "new_blog" && (
        <div className="glass-card p-8 rounded-3xl border border-outline-variant/30 w-full max-w-5xl">
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
                <textarea name="excerptAr" required placeholder="اكتب ملخصاً قصيراً للمقال هنا..." className="w-full px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl min-h-[100px] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">المقتطف (إنجليزي) <span className="text-error">*</span></label>
                <textarea name="excerptEn" required placeholder="Write a short excerpt here..." className="w-full px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl min-h-[100px] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-left" dir="ltr"></textarea>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">محتوى المقال (عربي) <span className="text-error">*</span></label>
                <RichTextEditor value={newContentAr} onChange={setNewContentAr} placeholder="اكتب محتوى المقال الكامل هنا مع التنسيقات والصور..." dir="rtl" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">محتوى المقال (إنجليزي) <span className="text-error">*</span></label>
                <RichTextEditor value={newContentEn} onChange={setNewContentEn} placeholder="Write full article content here with formatting and images..." dir="ltr" />
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
        </div>
      )}

      {/* TAB 3: TUTORIAL / VIDEO */}
      {activeTab === "tutorial" && (
        <div className="glass-card p-8 rounded-3xl border border-outline-variant/30 w-full max-w-5xl">
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
                * يدعم روابط أوديسي المباشرة وروابط يوتيوب.
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
        </div>
      )}
    </div>
  );
}
