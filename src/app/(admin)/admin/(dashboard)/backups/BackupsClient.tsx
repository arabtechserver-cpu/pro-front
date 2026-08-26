"use client";

import { useState, useEffect } from "react";

export default function BackupsClient() {
  const [backups, setBackups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/backup", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBackups(data.backups || []);
      }
    } catch (error) {
      console.error("Failed to fetch backups");
    } finally {
      setIsLoading(false);
    }
  };

  const createBackup = async () => {
    setIsActioning(true);
    setAlertMessage(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/backup/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertMessage({ type: "success", text: "تم أخذ النسخة الاحتياطية بنجاح!" });
        fetchBackups();
      } else {
        setAlertMessage({ type: "error", text: data.error || "تعذر أخذ النسخة الاحتياطية" });
      }
    } catch (error) {
      setAlertMessage({ type: "error", text: "تعذر الاتصال بالسيرفر" });
    } finally {
      setIsActioning(false);
    }
  };

  const restoreBackup = async (filename: string) => {
    if (!confirm(`هل أنت متأكد من استرجاع النسخة ${filename}؟ سيتم استبدال البيانات الحالية بالكامل.`)) {
      return;
    }
    
    setIsActioning(true);
    setAlertMessage(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/backup/restore", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ filename })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertMessage({ type: "success", text: "تم استرجاع النسخة الاحتياطية بنجاح. يرجى إعادة تشغيل السيرفر." });
      } else {
        setAlertMessage({ type: "error", text: data.error || "تعذر استرجاع النسخة" });
      }
    } catch (error) {
      setAlertMessage({ type: "error", text: "تعذر الاتصال بالسيرفر" });
    } finally {
      setIsActioning(false);
    }
  };

  const deleteBackup = async (filename: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه النسخة الاحتياطية؟")) return;
    
    setIsActioning(true);
    setAlertMessage(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/backup/${filename}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertMessage({ type: "success", text: "تم الحذف بنجاح" });
        fetchBackups();
      } else {
        setAlertMessage({ type: "error", text: data.error || "تعذر الحذف" });
      }
    } catch (error) {
      setAlertMessage({ type: "error", text: "تعذر الاتصال بالسيرفر" });
    } finally {
      setIsActioning(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-outline-variant/30">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-1">
            إدارة النسخ الاحتياطي 💾
          </h1>
          <p className="text-on-surface-variant text-sm">
            قم بإنشاء واسترجاع نسخ احتياطية كاملة لقاعدة البيانات لحمايتها.
          </p>
        </div>
        <button
          onClick={createBackup}
          disabled={isActioning}
          className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
        >
          {isActioning ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <span className="material-symbols-outlined">save</span>
          )}
          <span>إنشاء نسخة جديدة الآن</span>
        </button>
      </div>

      {alertMessage && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
          alertMessage.type === "success" 
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
            : "bg-red-500/15 text-red-400 border border-red-500/30"
        }`}>
          <span>{alertMessage.text}</span>
        </div>
      )}

      <div className="glass-card rounded-3xl border border-outline-variant/30 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 flex justify-center"><span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span></div>
        ) : (
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-surface-container-high/60 text-on-surface-variant text-sm border-b border-outline-variant/20">
                <th className="p-4 text-start font-bold">اسم الملف</th>
                <th className="p-4 text-start font-bold">الحجم</th>
                <th className="p-4 text-start font-bold">التاريخ</th>
                <th className="p-4 text-center font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-sm">
              {backups.map((backup) => (
                <tr key={backup.filename} className="hover:bg-surface-container-high/30">
                  <td className="p-4 font-mono font-bold text-on-surface">{backup.filename}</td>
                  <td className="p-4 text-on-surface-variant">{(backup.size / 1024).toFixed(2)} KB</td>
                  <td className="p-4 text-on-surface-variant font-mono">{new Date(backup.createdAt).toLocaleString("ar-EG")}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => restoreBackup(backup.filename)}
                        disabled={isActioning}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 disabled:opacity-50"
                      >
                        استرجاع
                      </button>
                      <button
                        onClick={() => deleteBackup(backup.filename)}
                        disabled={isActioning}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500 hover:text-white text-xs font-bold disabled:opacity-50"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {backups.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-on-surface-variant">لا توجد نسخ احتياطية مسجلة.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
