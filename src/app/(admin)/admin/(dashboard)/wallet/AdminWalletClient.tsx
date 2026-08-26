"use client";

import { useState, useEffect } from "react";

interface AdminTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  method: string;
  refNo: string;
  receiptImage?: string;
  status: "completed" | "pending" | "failed" | string;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
    username: string;
    balance: number;
  };
}

export default function AdminWalletClient() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [viewReceiptModalImage, setViewReceiptModalImage] = useState<string | null>(null);

  const [telegramStatus, setTelegramStatus] = useState<{ connected: boolean; chatIds: string[] }>({ connected: false, chatIds: [] });
  const [inputChatId, setInputChatId] = useState<string>("");
  const [savingChatId, setSavingChatId] = useState<boolean>(false);

  const fetchTelegramStatus = async () => {
    try {
      const res = await fetch("/api/transactions/telegram-admin");
      if (res.ok) {
        const data = await res.json();
        setTelegramStatus({ connected: data.connected, chatIds: data.chatIds || [] });
      }
    } catch {}
  };

  useEffect(() => {
    fetchTransactions();
    fetchTelegramStatus();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/transactions");
      const data = await res.json();
      if (res.ok && data.success) {
        setTransactions(data.transactions || []);
      }
    } catch {
      console.error("Failed to fetch transactions for admin dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  // Approve Transaction & Credit Balance in SQLite DB
  const handleApprove = async (txId: string) => {
    setActionLoadingId(txId);
    setAlertMessage(null);
    try {
      const res = await fetch("/api/transactions/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: txId })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAlertMessage({ type: "success", text: data.message || "تم اعتماد الإيداع وزيادة رصيد المحفظة للعميل بنجاح!" });
        fetchTransactions();
      } else {
        setAlertMessage({ type: "error", text: data.error || "حدث خطأ أثناء اعتماد الطلب" });
      }
    } catch {
      setAlertMessage({ type: "error", text: "تعذر الاتصال بالسيرفر لتأكيد العملية" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject Transaction
  const handleReject = async (txId: string) => {
    setActionLoadingId(txId);
    setAlertMessage(null);
    try {
      const res = await fetch("/api/transactions/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: txId })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAlertMessage({ type: "success", text: "تم رفض طلب الشحن" });
        fetchTransactions();
      } else {
        setAlertMessage({ type: "error", text: data.error || "حدث خطأ أثناء رفض الطلب" });
      }
    } catch {
      setAlertMessage({ type: "error", text: "تعذر الاتصال بالسيرفر لرفض العملية" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = transactions.filter((t) => t.status === "pending").length;
  const completedCount = transactions.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-outline-variant/30">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-1">
            إدارة طلبات الشحن والمعاملات المالية 💳
          </h1>
          <p className="text-on-surface-variant text-sm">
            مراجعة وتأكيد إيداعات العملاء المباشرة ورؤية صور الإيصالات مرفقة لحظياً
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 hover:border-primary/50 text-xs font-bold text-on-surface flex items-center gap-2 transition-all shadow-sm"
          >
            <span className={`material-symbols-outlined text-sm text-primary ${isLoading ? "animate-spin" : ""}`}>
              refresh
            </span>
            <span>تحديث السجل</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-on-surface-variant">إجمالي المعاملات</p>
            <p className="text-2xl font-bold text-on-surface font-mono mt-1">{transactions.length}</p>
          </div>
          <span className="material-symbols-outlined text-primary text-3xl">receipt_long</span>
        </div>

        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-300">طلبات شحن قيد المراجعة</p>
            <p className="text-2xl font-bold text-amber-400 font-mono mt-1">{pendingCount}</p>
          </div>
          <span className="material-symbols-outlined text-amber-400 text-3xl">pending_actions</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-300">معاملات معتمدة ومكتملة</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{completedCount}</p>
          </div>
          <span className="material-symbols-outlined text-emerald-400 text-3xl">check_circle</span>
        </div>
      </div>

      {/* TELEGRAM BOT CONNECTION & ALERT STATUS CARD */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-surface-container-high to-primary/10 border border-sky-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#0088cc]/20 border border-[#0088cc]/40 text-[#0088cc] flex items-center justify-center font-bold text-xl shrink-0">
            <span className="material-symbols-outlined text-2xl">send</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-on-surface">ربط واستلام إشعارات وصور الإيصالات على تلجرام 📱</h3>
              {telegramStatus.connected ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                  🟢 متصل وتعمل الإشعارات
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                  🔴 غير متصل بعد
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {telegramStatus.connected
                ? `حساب الأدمن مسجل ومفعل وتصلك صور الإيصالات فورياً.`
                : "افتح البوت على تلجرام وأرسل كلمة /admin لتفعيل الاستلام الفوري لصور التحويلات."}
            </p>
          </div>
        </div>

        <a
          href="https://t.me/ArabTechOTPBot"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0 active:scale-95"
        >
          <span className="material-symbols-outlined text-base">near_me</span>
          <span>افتح بوت التلجرام: @ArabTechOTPBot</span>
        </a>
      </div>

      {/* Feedback Alert */}
      {alertMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
            alertMessage.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
              : "bg-red-500/15 border border-red-500/30 text-red-300"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {alertMessage.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{alertMessage.text}</span>
        </div>
      )}

      {/* Transactions Data Table */}
      <div className="glass-card rounded-3xl border border-outline-variant/30 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-on-surface-variant flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span>جاري تحميل بيانات الشحن والمعاملات من قاعدة البيانات...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-on-surface-variant flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">inbox</span>
            <p className="font-bold text-sm text-on-surface">لا توجد طلبات شحن أو معاملات مسجلة حالياً</p>
            <p className="text-xs">سيظهر أي طلب شحن يرسله العملاء مباشرة هنا في هذه اللوحة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-high/60 text-on-surface-variant font-bold border-b border-outline-variant/20">
                  <th className="p-4 text-start">اسم العميل والبيانات</th>
                  <th className="p-4 text-start">نوع المعاملة والطريقة</th>
                  <th className="p-4 text-start">رقم المرجع / الإيصال</th>
                  <th className="p-4 text-start">إشعارات تلجرام 📱</th>
                  <th className="p-4 text-start">المبلغ ($ USD)</th>
                  <th className="p-4 text-start">التاريخ</th>
                  <th className="p-4 text-start">الحالة</th>
                  <th className="p-4 text-center">الإجراءات والتحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {transactions.map((tx) => {
                  const isPending = tx.status === "pending";
                  const isActioning = actionLoadingId === tx.id;

                  return (
                    <tr key={tx.id} className="hover:bg-surface-container-high/30 transition-colors">
                      {/* Customer Info */}
                      <td className="p-4">
                        <div className="font-bold text-on-surface">{tx.user?.fullName || "عميل مسجل"}</div>
                        <div className="text-[11px] text-on-surface-variant font-mono">
                          {tx.user?.email || tx.userId}
                        </div>
                        {tx.user?.balance !== undefined && (
                          <div className="text-[10px] text-primary font-mono font-semibold mt-0.5">
                            رصيد المحفظة الحالي: ${tx.user.balance.toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* Transaction Method */}
                      <td className="p-4">
                        <div className="font-bold text-on-surface">{tx.type}</div>
                        <div className="text-[11px] text-on-surface-variant">{tx.method}</div>
                      </td>

                      {/* Reference Number */}
                      <td className="p-4 font-mono font-bold text-primary dir-ltr">
                        {tx.refNo}
                      </td>

                      {/* Telegram Direct Delivery Status */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold text-[11px] flex items-center gap-1.5 w-fit">
                          <span className="material-symbols-outlined text-sm">send</span>
                          <span>مباشر للتلجرام</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-mono font-bold text-base text-emerald-400 dir-ltr">
                        +${tx.amount.toFixed(2)}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-on-surface-variant font-mono text-[11px]">
                        {new Date(tx.createdAt).toLocaleString("ar-EG")}
                      </td>

                      {/* Status Pill */}
                      <td className="p-4">
                        {tx.status === "completed" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            مكتمل 🟢
                          </span>
                        )}
                        {tx.status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            قيد المراجعة 🟡
                          </span>
                        )}
                        {tx.status === "failed" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            مرفوض 🔴
                          </span>
                        )}
                      </td>

                      {/* Admin Actions */}
                      <td className="p-4 text-center">
                        {isPending ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleApprove(tx.id)}
                              disabled={isActioning}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-bold text-xs shadow-md transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                            >
                              {isActioning ? (
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                <span className="material-symbols-outlined text-sm">check</span>
                              )}
                              <span>اعتماد واضافة الرصيد</span>
                            </button>

                            <button
                              onClick={() => handleReject(tx.id)}
                              disabled={isActioning}
                              className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500 hover:text-white font-bold text-xs transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                              <span>رفض</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-on-surface-variant font-mono">
                            تمت المعالجة
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW RECEIPT LIGHTBOX MODAL */}
      {viewReceiptModalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-4 shadow-2xl flex flex-col items-center space-y-4">
            <button
              onClick={() => setViewReceiptModalImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-base flex items-center justify-center transition-all z-10"
            >
              ✕
            </button>

            <h3 className="font-bold text-base text-on-surface flex items-center gap-2 pt-2">
              <span className="material-symbols-outlined text-primary">image</span>
              <span>صورة إيصال التحويل المرفقة 📸</span>
            </h3>

            <div className="w-full max-h-[70vh] overflow-auto rounded-2xl border border-outline-variant/20 bg-black/50 p-2 flex items-center justify-center">
              <img
                src={viewReceiptModalImage}
                alt="إيصال التحويل"
                className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="flex items-center gap-3">
              <a
                href={viewReceiptModalImage}
                download="receipt.png"
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>تحميل الصورة للجهاز</span>
              </a>

              <button
                onClick={() => setViewReceiptModalImage(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface-variant font-bold text-xs hover:bg-surface-container-highest transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
