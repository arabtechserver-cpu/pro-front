"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, KeyRound, Wallet } from "lucide-react";
import { getUserAuthToken } from "@/lib/client-auth-token";
import { userApiFetch } from "@/lib/user-api-fetch";
import styles from "../product.module.css";

type Purchase = {
  id: string; planName: string; amountMinor: number; durationDays: number;
  refNo: string; customerEmail: string; createdAt: string; expiresAt: string | null; used: boolean; revoked: boolean;
};
type Quote = { id: string; name: string; durationDays: number; priceMinor: number };
type Checkout = { email: string; balanceMinor: number; purchases: Purchase[]; plan: Quote | null };

const api = "/api/mobile-cashier/checkout";

export default function CheckoutClient({ lang, planId, listedPlan }: { lang: "ar" | "en"; planId: string | null; listedPlan?: Quote }) {
  const ar = lang === "ar";
  const c = (arabic: string, english: string) => ar ? arabic : english;
  const path = `/${lang}/ar-pro/checkout${planId ? `?plan=${planId}` : ""}`;
  const money = (minor: number) => new Intl.NumberFormat(ar ? "ar-EG" : "en-US", { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol" }).format(minor / 100);
  const date = (value: string) => new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { dateStyle: "medium" }).format(new Date(value));
  const [checkout, setCheckout] = useState<Checkout | null>();
  const [customerEmail, setCustomerEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Purchase | null>(null);
  const [visibleKey, setVisibleKey] = useState<{ id: string; value: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const purchaseInFlight = useRef(false);
  const pendingRequest = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getUserAuthToken(localStorage);
    const response = await userApiFetch(planId ? `${api}?planId=${planId}` : api);
    if (token !== getUserAuthToken(localStorage)) return;
    if (response.status === 401) {
      setVisibleKey(null);
      setCheckout(null);
      return;
    }
    if (!response.ok) throw new Error("checkout unavailable");
    const data: Checkout = await response.json();
    setCheckout(data);
    setCustomerEmail(current => current || data.email);
  }, [planId]);

  useEffect(() => {
    let token = getUserAuthToken(localStorage);
    const load = () => void refresh().catch(() => setMessage(lang === "ar" ? "تعذر تحميل بيانات الشراء. حاول مرة تانية." : "Unable to load checkout. Try again."));
    const onSessionChange = () => {
      const active = getUserAuthToken(localStorage);
      if (active === token) return;
      token = active;
      setReceipt(null);
      setVisibleKey(null);
      setCopied(false);
      setCustomerEmail("");
      setMessage("");
      setCheckout(active ? undefined : null);
      if (active) load();
    };
    load();
    window.addEventListener("storage", onSessionChange);
    window.addEventListener("user_session_change", onSessionChange);
    return () => {
      window.removeEventListener("storage", onSessionChange);
      window.removeEventListener("user_session_change", onSessionChange);
    };
  }, [lang, refresh]);

  async function buy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!checkout?.plan || checkout.balanceMinor < checkout.plan.priceMinor || purchaseInFlight.current || receipt) return;
    const plan = checkout.plan;
    const token = getUserAuthToken(localStorage);
    purchaseInFlight.current = true;
    setBusy(true);
    setMessage("");
    const storageKey = `ar-pro-wallet-request:${plan.id}`;
    try {
      pendingRequest.current ??= sessionStorage.getItem(storageKey) || crypto.randomUUID();
      sessionStorage.setItem(storageKey, pendingRequest.current);
      const response = await userApiFetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, priceMinor: plan.priceMinor, customerEmail, requestId: pendingRequest.current }),
      });
      const data = await response.json();
      if (getUserAuthToken(localStorage) !== token) return;
      if (!response.ok) {
        if (data.code === "PRICE_CHANGED") {
          await refresh();
          setMessage(c("السعر اتغيّر. راجع السعر الجديد واضغط تأكيد الشراء مرة تانية.", "The price changed. Review the new price and confirm again."));
        } else if (data.code === "REQUEST_MISMATCH") {
          await refresh();
          sessionStorage.removeItem(storageKey);
          pendingRequest.current = null;
          setMessage(c("الطلب السابق اتسجل ببيانات مختلفة. راجع مشترياتك.", "The previous request was placed with different details. Check your purchases."));
        } else if (data.code === "INSUFFICIENT_BALANCE") {
          await refresh();
          setMessage(c("رصيد المحفظة غير كافي.", "Your wallet balance is too low."));
        } else {
          setMessage(ar && data.error ? data.error : c("تعذر إتمام الشراء. راجع مشترياتك أو حاول تاني.", "Unable to complete your purchase. Check your purchases or try again."));
        }
        return;
      }
      const purchase: Purchase = data.purchase;
      setReceipt(purchase);
      setVisibleKey({ id: purchase.id, value: data.key });
      setCheckout(current => current && {
        ...current, balanceMinor: data.balanceMinor,
        purchases: [purchase, ...current.purchases.filter(item => item.id !== purchase.id)],
      });
      sessionStorage.removeItem(storageKey);
      pendingRequest.current = null;
      try {
        const session = JSON.parse(localStorage.getItem("user_session") || "null");
        if (session) localStorage.setItem("user_session", JSON.stringify({ ...session, balance: data.balanceMinor / 100 }));
      } catch { /* The receipt already shows the balance returned by the server. */ }
      window.dispatchEvent(new Event("user_session_change"));
    } catch {
      setMessage(c("الاتصال انقطع. افحص مشترياتك أو أعد المحاولة بنفس البيانات.", "The connection was interrupted. Check your purchases or retry with the same details."));
    } finally {
      purchaseInFlight.current = false;
      setBusy(false);
    }
  }

  async function revealKey(id: string) {
    const token = getUserAuthToken(localStorage);
    setMessage("");
    setCopied(false);
    try {
      const response = await userApiFetch(`${api}/${id}/key`);
      if (!response.ok) throw new Error("key unavailable");
      const { key } = await response.json();
      if (getUserAuthToken(localStorage) !== token) return;
      setVisibleKey({ id, value: key });
    } catch {
      setMessage(c("تعذر عرض الكود مؤقتًا.", "Unable to display the code right now."));
    }
  }

  async function copyKey() {
    if (!visibleKey) return;
    try {
      await navigator.clipboard.writeText(visibleKey.value);
      setCopied(true);
    } catch {
      setMessage(c("حدد الكود وانسخه من الشاشة.", "Select and copy the code from the screen."));
    }
  }

  const plansPath = `/${lang}/ar-pro#plans`;
  const selected = checkout?.plan;
  const insufficient = Boolean(selected && checkout && checkout.balanceMinor < selected.priceMinor);
  const keyBlock = visibleKey && <div className={styles.keyBlock}>
    <code dir="ltr">{visibleKey.value}</code>
    <button type="button" className={styles.ghostButton} onClick={copyKey}>{copied ? c("تم النسخ", "Copied") : c("نسخ الكود", "Copy code")}</button>
    <p>{c("افتح ar-pro، واختار «عندي مفتاح»، والصق الكود باستخدام بريد التفعيل الظاهر في الطلب.", "Open ar-pro, choose ‘I have a key’, and paste this code with the activation email shown on the purchase.")}</p>
  </div>;

  return <div className={styles.product}>
    <section className={styles.checkout}>
      <div className={`${styles.wrap} ${styles.checkoutWrap}`}>
        <Link className={styles.backLink} href={plansPath}>{c("باقات ar-pro", "ar-pro plans")} <ArrowUpRight size={16} aria-hidden="true" /></Link>
        <h1>{planId ? c("شراء اشتراك ar-pro", "Buy an ar-pro subscription") : c("مشترياتي في ar-pro", "My ar-pro purchases")}</h1>
        {message && <p className={styles.checkoutAlert} role="alert">{message}</p>}
        {checkout === undefined && <p role="status">{message ? <button type="button" className={styles.ghostButton} onClick={() => { setMessage(""); void refresh().catch(() => setMessage(c("تعذر تحميل بيانات الشراء.", "Unable to load checkout."))); }}>{c("حاول تاني", "Retry")}</button> : c("جارٍ تحميل البيانات…", "Loading checkout…")}</p>}
        {checkout === null && <div className={styles.checkoutCard}>
          {listedPlan && <>
            <h2><Wallet size={22} aria-hidden="true" />{listedPlan.name}</h2>
            <p>{c("سعر الباقة", "Plan price")} <bdi>{money(listedPlan.priceMinor)}</bdi> · {listedPlan.durationDays} {c("يوم", "days")}</p>
          </>}
          <p>{c("سجّل الدخول لحسابك عشان تدفع من محفظتك وتشوف أكواد التفعيل.", "Sign in to pay from your wallet and view activation codes.")}</p>
          <Link className={styles.limeButton} href={`/${lang}/login?returnTo=${encodeURIComponent(path)}`}>{c("تسجيل الدخول", "Sign in")}</Link>
        </div>}
        {checkout && <>
          {receipt ? <div className={styles.checkoutCard}>
            <h2><CheckCircle2 size={22} aria-hidden="true" />{c("تم الشراء. كود التفعيل جاهز", "Purchase complete. Your activation code is ready")}</h2>
            <p>{receipt.planName} · <bdi>{money(receipt.amountMinor)}</bdi> · <bdi>{receipt.refNo}</bdi></p>
            <p>{c("بريد التفعيل", "Activation email")} <bdi>{receipt.customerEmail}</bdi></p>
            <p>{c("الرصيد بعد الخصم", "Wallet balance after payment")} <bdi>{money(checkout.balanceMinor)}</bdi></p>
            {visibleKey?.id === receipt.id && keyBlock}
          </div> : selected ? <form className={styles.checkoutCard} onSubmit={buy}>
            <h2><Wallet size={22} aria-hidden="true" />{selected.name}</h2>
            <dl className={styles.checkoutTotals}>
              <div><dt>{c("المدة", "Duration")}</dt><dd>{selected.durationDays} {c("يوم", "days")}</dd></div>
              <div><dt>{c("سعر الباقة", "Plan price")}</dt><dd><bdi>{money(selected.priceMinor)}</bdi></dd></div>
              <div><dt>{c("رصيد المحفظة", "Wallet balance")}</dt><dd><bdi>{money(checkout.balanceMinor)}</bdi></dd></div>
            </dl>
            <label className={styles.checkoutField}>{c("البريد المستخدم في تفعيل البرنامج", "Email used to activate the app")}
              <input dir="ltr" type="email" autoComplete="email" value={customerEmail} onChange={event => setCustomerEmail(event.target.value)} required maxLength={254} />
            </label>
            <p>{c("لو جرّبت البرنامج قبل كده، استخدم نفس البريد اللي سجلته على الجهاز. مدة الاشتراك تبدأ عند تفعيل الكود.", "If you already started a trial, use the same email you registered on your device. Your subscription starts when you activate the code.")}</p>
            {insufficient && <p className={styles.checkoutAlert}>{c("الرصيد غير كافي. المبلغ الناقص", "Insufficient wallet balance. Amount needed")} <bdi>{money(selected.priceMinor - checkout.balanceMinor)}</bdi></p>}
            <div className={styles.checkoutActions}>
              {insufficient ? <Link className={styles.limeButton} href={`/${lang}/wallet`}>{c("اشحن المحفظة", "Top up wallet")}</Link> : <button className={styles.limeButton} disabled={busy} type="submit">{busy ? c("جارٍ تأكيد الشراء…", "Confirming…") : c("أكد الشراء واخصم", "Confirm and pay")} {!busy && <bdi>{money(selected.priceMinor)}</bdi>}</button>}
              <button type="button" disabled={busy} className={styles.ghostButton} onClick={() => { setMessage(""); void refresh().catch(() => setMessage(c("تعذر تحديث الرصيد.", "Unable to refresh your balance."))); }}>{c("حدّث الرصيد", "Refresh balance")}</button>
            </div>
          </form> : planId && <p className={styles.checkoutAlert}>{c("الباقة دي مش متاحة حاليًا. اختار باقة من صفحة ar-pro.", "This plan is unavailable. Choose a plan on the ar-pro page.")}</p>}

          <div className={styles.checkoutCard}>
            <h2><KeyRound size={21} aria-hidden="true" />{c("مشترياتي وأكواد التفعيل", "My purchases and activation codes")}</h2>
            {!checkout.purchases.length && <p>{c("مفيش اشتراكات مشتراة من المحفظة لسه.", "You haven’t bought a subscription with your wallet yet.")}</p>}
            {checkout.purchases.map(item => <div key={item.id} className={styles.purchaseRecord}>
              <div className={styles.purchaseHeading}>
                <div><strong>{item.planName} · <bdi>{money(item.amountMinor)}</bdi></strong><p><bdi>{date(item.createdAt)}</bdi> · <bdi>{item.refNo}</bdi> · <bdi>{item.customerEmail}</bdi></p></div>
                {!item.revoked && visibleKey?.id !== item.id && <button type="button" className={styles.ghostButton} onClick={() => void revealKey(item.id)}>{c("عرض الكود", "Show code")}</button>}
              </div>
              <p>{item.revoked ? c("الكود موقوف", "Code revoked") : item.used && item.expiresAt ? c(`تم التفعيل على الجهاز · حتى ${date(item.expiresAt)}`, `Activated on device · until ${date(item.expiresAt)}`) : c("جاهز للتفعيل", "Ready to activate")}</p>
              {visibleKey?.id === item.id && receipt?.id !== item.id && keyBlock}
            </div>)}
          </div>
        </>}
      </div>
    </section>
  </div>;
}
