"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Wrench,
  XCircle,
} from "lucide-react";

interface TimelineStep {
  toStatus: string;
  createdAt: string;
}

interface TrackData {
  shopName: string;
  shopPhone?: string | null;
  orderNumber: string;
  deviceType: string;
  brand: string;
  model: string;
  status: string;
  quoteApprovalStatus: "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED" | string;
  quoteNote?: string | null;
  quoteRespondedAt?: string | null;
  estimatedPrice: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  warrantyDays: number;
  dueAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineStep[];
}

const STATUS_META: Record<string, { ar: string; en: string; tone: string }> = {
  RECEIVED: { ar: "تم استلام الجهاز", en: "Device Received", tone: "bg-sky-500/15 text-sky-300 border-sky-400/30" },
  DIAGNOSING: { ar: "قيد الفحص والتشخيص", en: "Diagnosing", tone: "bg-indigo-500/15 text-indigo-300 border-indigo-400/30" },
  IN_PROGRESS: { ar: "جاري العمل على الصيانة", en: "Repair In Progress", tone: "bg-amber-500/15 text-amber-300 border-amber-400/30" },
  WAITING_PARTS: { ar: "بانتظار توفر قطعة غيار", en: "Waiting for Parts", tone: "bg-orange-500/15 text-orange-300 border-orange-400/30" },
  READY_FOR_DELIVERY: { ar: "الجهاز جاهز للاستلام", en: "Ready for Pickup", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" },
  DELIVERED: { ar: "تم التسليم للعميل", en: "Delivered", tone: "bg-slate-500/15 text-slate-200 border-slate-400/30" },
  UNREPAIRABLE: { ar: "تعذر الإصلاح", en: "Unrepairable", tone: "bg-rose-500/15 text-rose-300 border-rose-400/30" },
  CANCELLED: { ar: "ملغي", en: "Cancelled", tone: "bg-rose-500/15 text-rose-300 border-rose-400/30" },
  QUOTE_APPROVED: { ar: "تمت موافقة العميل على السعر", en: "Customer Approved Quote", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" },
  QUOTE_REJECTED: { ar: "رفض العميل عرض السعر", en: "Customer Rejected Quote", tone: "bg-rose-500/15 text-rose-300 border-rose-400/30" },
};

export default function TrackClient({
  lang,
  initialToken = "",
}: {
  lang: "ar" | "en";
  initialToken?: string;
}) {
  const ar = lang === "ar";
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [activeToken, setActiveToken] = useState(initialToken);
  const [data, setData] = useState<TrackData | null>(null);
  const [quoteNote, setQuoteNote] = useState("");
  const [loading, setLoading] = useState(Boolean(initialToken));
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [error, setError] = useState("");

  const fetchTrack = useCallback(
    async (tok: string) => {
      const clean = tok.trim();
      if (!clean) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/mobile-cashier/public/track/${encodeURIComponent(clean)}`, {
          cache: "no-store",
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            body.error ||
              (ar ? "رابط التتبع غير صالح أو تم إلغاؤه." : "Tracking link is invalid or revoked."),
          );
        }
        setData(body as TrackData);
      } catch (err) {
        setData(null);
        setError(
          err instanceof Error
            ? err.message
            : ar
              ? "تعذر جلب حالة الطلب حالياً."
              : "Unable to load repair status.",
        );
      } finally {
        setLoading(false);
      }
    },
    [ar],
  );

  useEffect(() => {
    setTokenInput(initialToken);
    setActiveToken(initialToken);
    if (initialToken) {
      void fetchTrack(initialToken);
    } else {
      setData(null);
      setLoading(false);
    }
  }, [initialToken, fetchTrack]);

  const handleLookup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clean = tokenInput.trim();
    if (!clean) return;
    setActiveToken(clean);
    router.push(`/${lang}/track/${encodeURIComponent(clean)}`);
  };

  const respondQuote = async (decision: "APPROVED" | "REJECTED") => {
    if (!activeToken || submittingQuote) return;
    setSubmittingQuote(true);
    setError("");
    try {
      const res = await fetch(
        `/api/mobile-cashier/public/track/${encodeURIComponent(activeToken)}/quote-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision,
            note: quoteNote.trim() || undefined,
          }),
        },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          body.error || (ar ? "تعذر تسجيل قرارك حالياً." : "Unable to record your decision."),
        );
      }
      setData(body as TrackData);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmittingQuote(false);
    }
  };

  const formatDate = (value: string | null | undefined) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  };

  const statusInfo = data
    ? STATUS_META[data.status] ?? {
        ar: data.status,
        en: data.status,
        tone: "bg-white/10 text-white border-white/20",
      }
    : null;

  const phoneDigits = data?.shopPhone ? data.shopPhone.replace(/[^0-9]/g, "") : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6" dir={ar ? "rtl" : "ltr"}>
      <div className="glass-card rounded-3xl border border-primary/25 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-xl font-black text-on-surface md:text-2xl">
                {ar ? "بوابة تتبع حالة الصيانة" : "Repair Status Tracker"}
              </h1>
              <p className="text-xs text-on-surface-variant">
                {data?.shopName || (ar ? "متابعة حية لأجهزة الصيانة عبر ar-pro" : "Live repair order status via ar-pro")}
              </p>
            </div>
          </div>

          {data?.shopPhone && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <a
                href={`tel:${data.shopPhone}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/30 bg-surface-container-high px-3 py-2 font-bold text-on-surface hover:border-primary/50"
                dir="ltr"
              >
                <Phone className="h-3.5 w-3.5 text-primary" />
                <span>{data.shopPhone}</span>
              </a>
              {phoneDigits && (
                <a
                  href={`https://wa.me/${phoneDigits}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-2 font-bold text-emerald-400 hover:bg-emerald-500/25"
                >
                  <span>{ar ? "واتساب المركز" : "WhatsApp"}</span>
                </a>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleLookup} className="mt-5 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              dir="ltr"
              placeholder={ar ? "أدخل رمز التتبع الخاص بالطلب..." : "Enter tracking token..."}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest py-2.5 ps-10 pe-4 font-mono text-xs text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-on-primary transition-all hover:opacity-90"
            >
              {ar ? "تتبع الطلب" : "Track Order"}
            </button>
            {activeToken && (
              <button
                type="button"
                disabled={loading}
                onClick={() => void fetchTrack(activeToken)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/30 bg-surface-container-high px-3.5 py-2.5 text-xs font-bold text-on-surface hover:border-primary/40 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-primary ${loading ? "animate-spin" : ""}`} />
                <span>{ar ? "تحديث" : "Refresh"}</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-300">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="glass-card rounded-3xl border border-outline-variant/20 p-10 text-center text-xs text-on-surface-variant">
          <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
          <span>{ar ? "جاري تحميل حالة الجهاز..." : "Loading device status..."}</span>
        </div>
      )}

      {data && statusInfo && (
        <div className="glass-card space-y-6 rounded-3xl border border-outline-variant/30 p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-high text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <div className="font-mono text-base font-black text-primary" dir="ltr">
                  {data.orderNumber}
                </div>
                <div className="text-sm font-bold text-on-surface">
                  {data.brand} {data.model}
                </div>
              </div>
            </div>

            <span className={`rounded-full border px-4 py-1.5 text-xs font-bold ${statusInfo.tone}`}>
              {ar ? statusInfo.ar : statusInfo.en}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3.5">
              <div className="text-[11px] font-bold text-on-surface-variant">
                {ar ? "التكلفة المقدّرة" : "Estimated Cost"}
              </div>
              <div className="mt-1 font-mono text-base font-black text-on-surface" dir="ltr">
                {data.estimatedPrice.toFixed(2)} {data.currency}
              </div>
            </div>
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3.5">
              <div className="text-[11px] font-bold text-on-surface-variant">
                {ar ? "المدفوع" : "Paid"}
              </div>
              <div className="mt-1 font-mono text-base font-black text-emerald-400" dir="ltr">
                {data.paidAmount.toFixed(2)} {data.currency}
              </div>
            </div>
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3.5">
              <div className="text-[11px] font-bold text-on-surface-variant">
                {ar ? "المتبقي" : "Remaining"}
              </div>
              <div className="mt-1 font-mono text-base font-black text-amber-400" dir="ltr">
                {data.remainingAmount.toFixed(2)} {data.currency}
              </div>
            </div>
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3.5">
              <div className="text-[11px] font-bold text-on-surface-variant">
                {ar ? "الضمان" : "Warranty"}
              </div>
              <div className="mt-1 font-mono text-base font-black text-on-surface">
                {data.warrantyDays} {ar ? "يوم" : "days"}
              </div>
            </div>
          </div>

          {(data.dueAt || data.deliveredAt) && (
            <div className="flex flex-wrap gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>{ar ? "تاريخ الاستلام:" : "Received:"}</span>
                <strong className="font-mono text-on-surface">{formatDate(data.createdAt)}</strong>
              </div>
              {data.dueAt && (
                <div>
                  <span>{ar ? "الموعد المتوقع:" : "Estimated Due:"}</span>{" "}
                  <strong className="font-mono text-on-surface">{formatDate(data.dueAt)}</strong>
                </div>
              )}
              {data.deliveredAt && (
                <div>
                  <span>{ar ? "تاريخ التسليم:" : "Delivered:"}</span>{" "}
                  <strong className="font-mono text-emerald-400">{formatDate(data.deliveredAt)}</strong>
                </div>
              )}
            </div>
          )}

          {data.quoteApprovalStatus === "PENDING" &&
            data.status !== "DELIVERED" &&
            data.status !== "CANCELLED" && (
              <div className="space-y-3 rounded-2xl border border-amber-400/35 bg-amber-500/10 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>
                    {ar
                      ? `بانتظار موافقتك على تكلفة الصيانة (${data.estimatedPrice.toFixed(2)} ${data.currency})`
                      : `Awaiting your approval for ${data.estimatedPrice.toFixed(2)} ${data.currency}`}
                  </span>
                </div>
                <input
                  type="text"
                  value={quoteNote}
                  onChange={(e) => setQuoteNote(e.target.value)}
                  maxLength={300}
                  placeholder={ar ? "ملاحظة اختيارية للمركز..." : "Optional note for the repair shop..."}
                  className="w-full rounded-xl border border-amber-400/30 bg-surface-container-lowest px-3.5 py-2 text-xs text-on-surface focus:border-amber-400 focus:outline-none"
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={submittingQuote}
                    onClick={() => void respondQuote("APPROVED")}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{ar ? "موافق على السعر — ابدأ الصيانة" : "Approve Quote"}</span>
                  </button>
                  <button
                    type="button"
                    disabled={submittingQuote}
                    onClick={() => void respondQuote("REJECTED")}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>{ar ? "رفض عرض السعر" : "Reject Quote"}</span>
                  </button>
                </div>
              </div>
            )}

          {data.quoteApprovalStatus !== "NOT_REQUIRED" && data.quoteApprovalStatus !== "PENDING" && (
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-xs">
              <span className="font-bold text-on-surface-variant">
                {ar ? "قرار عرض السعر:" : "Quote decision:"}{" "}
              </span>
              <span
                className={`font-bold ${
                  data.quoteApprovalStatus === "APPROVED" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {data.quoteApprovalStatus === "APPROVED"
                  ? ar
                    ? "تمت الموافقة"
                    : "Approved"
                  : ar
                    ? "مرفوض"
                    : "Rejected"}
              </span>
              {data.quoteNote && (
                <span className="text-on-surface-variant"> — {data.quoteNote}</span>
              )}
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {ar ? "سجل مراحل الصيانة" : "Repair Timeline"}
            </h2>
            {data.timeline.length === 0 ? (
              <p className="text-xs text-on-surface-variant">
                {ar ? "تم تسجيل الطلب وجاري التحديث." : "Order recorded."}
              </p>
            ) : (
              <div className="space-y-2.5">
                {data.timeline.map((step, idx) => {
                  const meta = STATUS_META[step.toStatus];
                  return (
                    <div
                      key={`${step.toStatus}-${step.createdAt}-${idx}`}
                      className="flex items-center justify-between gap-3 border-s-2 border-primary ps-3.5 text-xs"
                    >
                      <span className="font-bold text-on-surface">
                        {meta ? (ar ? meta.ar : meta.en) : step.toStatus}
                      </span>
                      <span className="font-mono text-[11px] text-on-surface-variant" dir="ltr">
                        {formatDate(step.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
