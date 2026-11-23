"use client";

import { useCallback, useEffect, useState } from "react";
import { Clipboard, Eye, Headset, KeyRound, Layers, RefreshCw, Users } from "lucide-react";

type Plan = { id: string; name: string; description: string; amountMinor: number; currency: string; durationDays: number; discountPercent: number; promoAmountMinor: number | null; discountUntil: string | null; active: boolean };
type License = { id: string; suffix: string; customerEmail: string; expiresAt: string | null; revokedAt: string | null; plan: { name: string }; device: { shopName: string } | null; purchase: { amountMinor: number; transaction: { refNo: string } } | null };
type Customer = { id: string; shopName: string; email: string; status: string; until: string | null; lastSeenAt: string };
type Session = { id: string; code: string; shopName: string; email: string; notes: string; status: string; mode: "VIEW_ONLY" | "CONTROL"; assignedToMe: boolean; expiresAt: string; controlProvider: string };
type Message = { id: string; body: string; author: "CUSTOMER" | "TECHNICIAN" };
type OfferType = "NONE" | "FIXED" | "PERCENT";
type PlanForm = { id: string; name: string; description: string; amount: string; currency: string; durationDays: number; offerType: OfferType; promoAmount: string; discountPercent: number; discountDays: string; active: boolean };
const emptyPlan: PlanForm = { id: "", name: "", description: "", amount: "", currency: "USD", durationDays: 30, offerType: "NONE", promoAmount: "", discountPercent: 0, discountDays: "", active: true };
const tabs = [
  { id: "plans", label: "الباقات والأسعار", icon: Layers },
  { id: "licenses", label: "مفاتيح التفعيل", icon: KeyRound },
  { id: "customers", label: "العملاء", icon: Users },
  { id: "support", label: "الدعم عن بُعد", icon: Headset },
] as const;
const labels: Record<string, string> = { TRIAL: "تجربة ٣ أيام", ACTIVE: "نشط", EXPIRED: "منتهي", REVOKED: "موقوف", REQUESTED: "طلب جديد", ACCEPTED: "مقبول", ENDED: "انتهى" };
const openStates = ["REQUESTED", "ACCEPTED", "ACTIVE"];
const controlKeys: Record<string, string> = { ArrowLeft: "Left", ArrowRight: "Right", ArrowUp: "Up", ArrowDown: "Down", Backspace: "Backspace", Delete: "Delete", Enter: "Enter", Home: "Home", End: "End" };
const date = (value: string | null) => value ? new Date(value).toLocaleString("ar-EG", { timeZone: "Africa/Cairo", dateStyle: "medium", timeStyle: "short" }) : "—";
const field = "w-full rounded-xl border border-outline-variant/40 bg-surface px-3 py-2.5 text-on-surface";
const primary = "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50";
const secondary = "inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/40 px-3 py-2 text-sm font-bold hover:bg-surface-variant disabled:opacity-50";
const card = "rounded-2xl border border-outline-variant/30 bg-surface-container p-5";

async function request<T>(path: string, method = "GET", body?: unknown, passive = false): Promise<T> {
  const response = await fetch("/api/mobile-cashier/admin" + path, {
    method, credentials: "same-origin", cache: "no-store",
    headers: { "Content-Type": "application/json", "x-admin-request": "true", ...(passive ? { "x-passive-request": "true" } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "تعذر إكمال الطلب.");
  return data as T;
}

function SessionPanel({ session, onMutate }: { session: Session; onMutate: () => Promise<void> }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [frame, setFrame] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const path = "/support/" + session.id;
  const canControl = session.mode === "CONTROL" && session.controlProvider === "CASHIER_WINDOW";
  const live = session.assignedToMe && (session.mode === "VIEW_ONLY" || canControl) && ["ACCEPTED", "ACTIVE"].includes(session.status);
  const refreshMessages = useCallback(async () => {
    setMessages(await request<Message[]>(path + "/messages", "GET", undefined, true));
  }, [path]);
  useEffect(() => {
    const refresh = () => void refreshMessages().catch((err: Error) => setError(err.message));
    refresh();
    const timer = window.setInterval(refresh, 3500);
    return () => window.clearInterval(timer);
  }, [refreshMessages]);
  useEffect(() => {
    if (!live) return;
    const controller = new AbortController();
    let previous = "";
    let polling = false;
    async function refresh() {
      if (polling) return;
      polling = true;
      try {
        const response = await fetch("/api/mobile-cashier/admin" + path + "/frame", {
          cache: "no-store", credentials: "same-origin", signal: controller.signal,
          headers: { "x-admin-request": "true", "x-passive-request": "true" },
        });
        const img = response.ok && response.status === 200 && response.headers.get("content-type")?.startsWith("image/jpeg") ? await response.blob() : null;
        if (controller.signal.aborted) return;
        URL.revokeObjectURL(previous);
        previous = img ? URL.createObjectURL(img) : "";
        setFrame(previous);
      } catch {
        if (!controller.signal.aborted) setFrame("");
      } finally {
        polling = false;
      }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 1900);
    return () => { controller.abort(); window.clearInterval(timer); URL.revokeObjectURL(previous); setFrame(""); };
  }, [live, path]);

  async function action(next: string, body?: unknown) {
    setBusy(true);
    setError("");
    try {
      await request(path + "/" + next, "POST", body);
      if (next === "messages") { setText(""); await refreshMessages(); }
      else await onMutate();
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }

  async function sendInput(body: unknown) {
    try { await request(path + "/input", "POST", body); }
    catch (err) { setError((err as Error).message); }
  }

  return <div className={card + " space-y-4"}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h3 className="text-lg font-black">{session.shopName}</h3><p dir="ltr" className="text-sm text-on-surface-variant text-right">{session.email}</p></div>
      <span dir="ltr" className="rounded-lg bg-surface px-3 py-1 font-mono text-sm">{session.code}</span>
    </div>
    <p className="text-sm">{session.mode === "VIEW_ONLY" ? "مشاهدة نافذة البرنامج" : canControl ? "التحكم في نافذة البرنامج" : "طلب تحكم · UNCONFIGURED"} · {labels[session.status] ?? session.status} · {date(session.expiresAt)}</p>
    <div className="flex flex-wrap gap-2">
      {session.status === "REQUESTED" && <button className={primary} disabled={busy} onClick={() => void action("accept")}>استلم الطلب باسم عرب تيك</button>}
      {session.assignedToMe && openStates.includes(session.status) && <button className={secondary} disabled={busy} onClick={() => void action("end")}>إنهاء الجلسة</button>}
    </div>
    {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
    {live && <section aria-label="نافذة مشاهدة البرنامج" className="overflow-hidden rounded-xl border border-outline-variant/40 bg-slate-950 text-slate-200">
      {frame && canControl ? <button type="button" className="block w-full cursor-crosshair focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" aria-label="التحكم في نافذة ar-pro لدى العميل"
        onClick={(event) => {
          if (!event.detail) return;
          const rect = event.currentTarget.getBoundingClientRect();
          void sendInput({ type: "click", x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height });
        }}
        onKeyDown={(event) => {
          if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
          const key = controlKeys[event.key];
          if (!key && event.key.length !== 1) return;
          event.preventDefault();
          void sendInput(key ? { type: "key", key } : { type: "text", text: event.key });
        }}>
        <img src={frame} alt="نافذة ar-pro لدى العميل" className="h-auto w-full" draggable={false}/>
      </button> : frame ? <img src={frame} alt="نافذة ar-pro لدى العميل" className="h-auto w-full"/> : <p className="flex items-center gap-2 px-4 py-12 text-sm"><Eye size={18}/> في انتظار مشاركة نافذة البرنامج من العميل.</p>}
    </section>}
    <div className="max-h-64 space-y-2 overflow-y-auto" aria-live="polite">
      {session.notes && <p className="break-words rounded-lg bg-surface px-3 py-2 text-sm">{session.notes}</p>}
      {messages.map((message) => <p key={message.id} className="break-words rounded-lg bg-surface px-3 py-2 text-sm"><strong>{message.author === "TECHNICIAN" ? "عرب تيك" : "العميل"}</strong> {message.body}</p>)}
    </div>
    {session.assignedToMe && openStates.includes(session.status) && <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); if (text.trim()) void action("messages", { body: text.trim() }); }}>
      <input className={field} value={text} onChange={(event) => setText(event.target.value)} placeholder="اكتب للعميل" aria-label="رسالة للعميل" maxLength={1500} required/>
      <button className={primary} disabled={busy}>إرسال</button>
    </form>}
  </div>;
}

export default function CashierAdmin() {
  const [tab, setTab] = useState<typeof tabs[number]["id"]>("plans");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [plan, setPlan] = useState<PlanForm>(emptyPlan);
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState("");
  const [issued, setIssued] = useState("");
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const session = sessions.find((item) => item.id === selected);

  const load = useCallback(async (passive = false) => {
    if (tab === "plans") setPlans(await request<Plan[]>("/plans"));
    if (tab === "licenses") {
      const [choices, keys] = await Promise.all([request<Plan[]>("/plans"), request<License[]>("/licenses")]);
      setPlans(choices);
      setLicenses(keys);
    }
    if (tab === "customers") setCustomers(await request<Customer[]>("/customers"));
    if (tab === "support") setSessions(await request<Session[]>("/support", "GET", undefined, passive));
  }, [tab]);
  useEffect(() => {
    void load().catch((err: Error) => setError(err.message));
    if (tab !== "support") return;
    const timer = window.setInterval(() => void load(true).catch((err: Error) => setError(err.message)), 4500);
    return () => window.clearInterval(timer);
  }, [load, tab]);

  async function run(operation: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try { await operation(); await load(); }
    catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }

  const edit = (item: Plan) => setPlan({
    id: item.id, name: item.name, description: item.description, amount: (item.amountMinor / 100).toFixed(2),
    currency: item.currency, durationDays: item.durationDays, discountPercent: item.discountPercent, discountDays: "", active: item.active,
    offerType: item.promoAmountMinor != null ? "FIXED" : item.discountPercent > 0 ? "PERCENT" : "NONE",
    promoAmount: item.promoAmountMinor == null ? "" : (item.promoAmountMinor / 100).toFixed(2),
  });

  return <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-7" dir="rtl">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-3xl font-black">ar-pro</h1><p className="mt-1 text-sm text-on-surface-variant">خطط الاشتراك والتفعيل ودعم العملاء من عرب تيك.</p></div>
      <button className={secondary} onClick={() => void run(async () => {})} disabled={busy}><RefreshCw size={16}/> تحديث</button>
    </header>
    <nav aria-label="أقسام ar-pro" className="flex flex-wrap gap-2">
      {tabs.map(({ id, icon: Icon, label }) => <button key={id} className={tab === id ? primary : secondary} aria-pressed={tab === id} onClick={() => { setError(""); setNotice(""); setTab(id); }}><Icon size={17}/>{label}</button>)}
    </nav>
    {error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-red-500">{error}</p>}
    {notice && <p role="status" className="rounded-xl bg-teal-500/10 p-3 text-teal-600 dark:text-teal-300">{notice}</p>}

    {tab === "plans" && <div className="grid items-start gap-4 xl:grid-cols-[minmax(280px,1fr)_1fr]">
      <form className={card + " grid gap-3 sm:grid-cols-2"} onSubmit={(event) => {
        event.preventDefault();
        void run(async () => {
          const { id, amount, discountDays, offerType, promoAmount, discountPercent, ...data } = plan;
          await request(id ? "/plans/" + id : "/plans", id ? "PUT" : "POST", {
            ...data,
            amountMinor: Math.round(Number(amount) * 100),
            promoAmountMinor: offerType === "FIXED" ? Math.round(Number(promoAmount) * 100) : null,
            discountPercent: offerType === "PERCENT" ? discountPercent : 0,
            discountDays: offerType !== "NONE" && discountDays ? Number(discountDays) : null,
          });
          setPlan(emptyPlan);
          setNotice("تم حفظ الباقة.");
        });
      }}>
        <h2 className="text-lg font-black sm:col-span-2">{plan.id ? "تعديل الباقة" : "إضافة باقة"}</h2>
        <label className="space-y-1 sm:col-span-2">اسم الباقة<input className={field} minLength={2} maxLength={100} required value={plan.name} onChange={(event) => setPlan({ ...plan, name: event.target.value })}/></label>
        <label className="space-y-1 sm:col-span-2">الوصف<textarea className={field} rows={2} maxLength={500} value={plan.description} onChange={(event) => setPlan({ ...plan, description: event.target.value })}/></label>
        <label className="space-y-1">السعر الأساسي<input required type="number" min={0} max={1000000} step="0.01" className={field} value={plan.amount} onChange={(event) => setPlan({ ...plan, amount: event.target.value })}/></label>
        <label className="space-y-1">العملة<select className={field} value={plan.currency} onChange={(event) => setPlan({ ...plan, currency: event.target.value })}>{["EGP", "USD", "EUR", "SAR", "AED"].map((code) => <option key={code}>{code}</option>)}</select></label>
        <label className="space-y-1">مدة الاشتراك بالأيام<input type="number" min={1} max={3660} required className={field} value={plan.durationDays || ""} onChange={(event) => setPlan({ ...plan, durationDays: Number(event.target.value) })}/></label>
        <label className="space-y-1">نوع العرض<select className={field} value={plan.offerType} onChange={(event) => setPlan({ ...plan, offerType: event.target.value as OfferType })}>
          <option value="NONE">بدون عرض</option><option value="FIXED">سعر عرض ثابت</option><option value="PERCENT">نسبة خصم</option>
        </select></label>
        {plan.offerType === "FIXED" && <label className="space-y-1">السعر خلال العرض<input type="number" min={0} max={1000000} step="0.01" required className={field} value={plan.promoAmount} onChange={(event) => setPlan({ ...plan, promoAmount: event.target.value })}/></label>}
        {plan.offerType === "PERCENT" && <label className="space-y-1">نسبة الخصم %<input type="number" min={1} max={100} required className={field} value={plan.discountPercent || ""} onChange={(event) => setPlan({ ...plan, discountPercent: Number(event.target.value) })}/></label>}
        {plan.offerType !== "NONE" && <label className="space-y-1">مدة العرض من اليوم بالأيام<input type="number" min={1} max={366} required={!plans.find((item) => item.id === plan.id)?.discountUntil} className={field} value={plan.discountDays} onChange={(event) => setPlan({ ...plan, discountDays: event.target.value })} placeholder="اتركها فارغة للاحتفاظ بتاريخ الانتهاء"/></label>}
        <label className="flex items-center gap-2 sm:col-span-2"><input type="checkbox" checked={plan.active} onChange={(event) => setPlan({ ...plan, active: event.target.checked })}/> تظهر في صفحة المنتج</label>
        <button className={primary} disabled={busy}>حفظ الباقة</button>
        {plan.id && <button type="button" className={secondary} onClick={() => setPlan(emptyPlan)}>إلغاء التعديل</button>}
      </form>
      <section className={card + " space-y-3"}>
        <h2 className="text-lg font-black">الباقات المسجلة</h2>
        {!plans.length && <p className="text-sm text-on-surface-variant">أضف أول باقة لتظهر في صفحة المنتج.</p>}
        {plans.map((item) => <article key={item.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-surface p-3">
          <div><h3 className="font-bold">{item.name}</h3><p className="text-sm" dir="ltr">{(item.amountMinor / 100).toFixed(2)} {item.currency} · {item.durationDays}d</p>
          {item.discountUntil && <p className="text-sm text-on-surface-variant">
            {item.promoAmountMinor != null ? <>سعر العرض <bdi>{(item.promoAmountMinor / 100).toFixed(2)} {item.currency}</bdi></> : <>خصم {item.discountPercent}%</>} حتى {date(item.discountUntil)}
          </p>}
          <p className="text-xs text-on-surface-variant">{item.active ? "ظاهرة على الموقع" : "مخفية"}</p></div>
          <button className={secondary} onClick={() => edit(item)}>تعديل</button>
        </article>)}
      </section>
    </div>}

    {tab === "licenses" && <div className="space-y-4">
      <form className={card + " space-y-3"} onSubmit={(event) => {
        event.preventDefault();
        void run(async () => {
          setIssued("");
          setCopied(false);
          const result = await request<{ key: string }>("/licenses", "POST", { planId, customerEmail: email });
          setIssued(result.key);
          setEmail("");
        });
      }}>
        <h2 className="text-lg font-black">إصدار مفتاح لعميل</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input type="email" className={field} aria-label="بريد العميل" placeholder="بريد العميل" dir="ltr" value={email} onChange={(event) => setEmail(event.target.value)} required/>
          <select className={field} aria-label="الباقة" value={planId} onChange={(event) => setPlanId(event.target.value)} required><option value="">اختر الباقة</option>{plans.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <button className={primary} disabled={busy || !plans.some((item) => item.active)}>إصدار المفتاح</button>
        </div>
      </form>
      {issued && <div className={card + " space-y-2"} role="status">
        <p className="text-sm font-bold">المفتاح يظهر مرة واحدة. انسخه لإرساله للعميل.</p>
        <div className="flex flex-wrap items-center gap-3"><code className="break-all rounded-lg bg-surface p-2" dir="ltr">{issued}</code><button className={secondary} onClick={() => void navigator.clipboard.writeText(issued).then(() => setCopied(true)).catch(() => setError("تعذر النسخ التلقائي. حدد نص المفتاح وانسخه."))}><Clipboard size={15}/>{copied ? "تم النسخ" : "نسخ"}</button></div>
        <button className={secondary} onClick={() => setIssued("")}>إخفاء المفتاح</button>
      </div>}
      <section className={card + " space-y-3"}>
        <h2 className="text-lg font-black">آخر المفاتيح</h2>
        {!licenses.length && <p className="text-sm text-on-surface-variant">لا توجد مفاتيح بعد.</p>}
        {licenses.map((item) => <article key={item.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-surface p-3">
          <div className="min-w-0">
            <h3 dir="ltr" className="break-all text-right font-bold">{item.customerEmail}</h3>
            <p className="text-sm">{item.plan.name} · {item.device?.shopName || "لم يُستخدم"} · <bdi>…{item.suffix}</bdi></p>
            <p className="text-sm">{item.revokedAt ? "موقوف" : item.expiresAt ? "ينتهي " + date(item.expiresAt) : "جاهز للتفعيل"}</p>
            {item.purchase && <p className="text-sm">شراء من المحفظة · <bdi>{(item.purchase.amountMinor / 100).toFixed(2)} USD</bdi> · <bdi>{item.purchase.transaction.refNo}</bdi></p>}
          </div>
          {!item.revokedAt && <button className={secondary} disabled={busy} onClick={() => {
            if (window.confirm("هل تريد إيقاف هذا المفتاح؟")) void run(async () => { await request("/licenses/" + item.id + "/revoke", "POST"); setNotice("تم إيقاف المفتاح."); });
          }}>إيقاف المفتاح</button>}
        </article>)}
      </section>
    </div>}

    {tab === "customers" && <section className={card + " space-y-3"}>
      <h2 className="text-lg font-black">عملاء ar-pro</h2>
      {!customers.length && <p className="text-sm text-on-surface-variant">لا توجد أجهزة مسجلة بعد.</p>}
      {customers.map((customer) => <article key={customer.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-surface p-3">
        <div><h3 className="font-bold">{customer.shopName}</h3><p dir="ltr" className="break-all text-sm">{customer.email}</p></div>
        <div className="text-sm"><p className="font-bold">{labels[customer.status] ?? customer.status} · {date(customer.until)}</p><p className="text-on-surface-variant">آخر تحقق {date(customer.lastSeenAt)}</p></div>
      </article>)}
    </section>}

    {tab === "support" && <div className="grid items-start gap-4 xl:grid-cols-[minmax(220px,0.7fr)_1.3fr]">
      <section className={card + " space-y-3"}>
        <h2 className="text-lg font-black">طلبات الدعم الواردة</h2>
        <p className="text-sm text-on-surface-variant">الفني عرب تيك</p>
        {!sessions.length && <p className="text-sm">لا توجد طلبات دعم بعد.</p>}
        {sessions.map((item) => <button key={item.id} onClick={() => setSelected(item.id)} className={"block w-full rounded-xl border bg-surface p-3 text-right " + (selected === item.id ? "border-primary" : "border-outline-variant/30")}>
          <strong>{item.shopName}</strong><span className="mt-1 block text-xs text-on-surface-variant">{item.mode === "VIEW_ONLY" ? "مشاهدة فقط" : "طلب تحكم"} · {labels[item.status] ?? item.status}</span>
        </button>)}
      </section>
      {session && <SessionPanel key={session.id} session={session} onMutate={load}/>}
    </div>}
  </div>;
}
