import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, ChevronDown, Download, HardDrive, Headset, KeyRound, Monitor, ReceiptText, Wrench } from "lucide-react";
import { getProduct } from "./product";
import ScreenTour from "./ScreenTour";
import styles from "./product.module.css";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const description = lang === "ar"
    ? "ar-pro برنامج ويندوز لإدارة البيع والمخزون وصيانة الموبايلات. شاهد شاشات البرنامج وجربه ٣ أيام مجانًا."
    : "ar-pro is a Windows workspace for phone shops. Explore sales, stock and repairs and start a three-day trial.";
  return {
    title: lang === "ar" ? "ar-pro لإدارة محلات الموبايل" : "ar-pro for phone shops",
    description,
    alternates: { canonical: "/" + lang + "/ar-pro", languages: { ar: "/ar/ar-pro", en: "/en/ar-pro" } },
    openGraph: { title: "ar-pro", description, images: [{ url: "/images/ar-pro/sales.webp", width: 1440, height: 900 }] },
  };
}

export default async function ArPro({ params }: Props) {
  const { lang } = await params;
  const ar = lang === "ar";
  const product = await getProduct();
  const c = (arabic: string, english: string) => ar ? arabic : english;
  const contactPath = "/" + lang + "/contact";
  const checkoutPath = "/" + lang + "/ar-pro/checkout";
  const currency = (value: number, code: string) => new Intl.NumberFormat(ar ? "ar-EG" : "en", { style: "currency", currency: code, currencyDisplay: code === "USD" ? "narrowSymbol" : "symbol" }).format(value / 100);
  const duration = (days: number) => {
    if (days === 30) return c("اشتراك شهر واحد", "1 month of access");
    if (days === 90) return c("اشتراك ٣ شهور", "3 months of access");
    if (days === 365) return c("اشتراك سنة كاملة", "1 year of access");
    return c(`${days} يوم اشتراك`, `${days} days of access`);
  };
  const facts = [
    { icon: Monitor, text: c("برنامج لأجهزة ويندوز", "Built for Windows") },
    { icon: HardDrive, text: c("بيانات المحل على جهازك", "Shop data stays on your device") },
    { icon: KeyRound, text: c("٣ أيام تجربة مجانية", "Three-day free trial") },
  ];
  const items = [
    { icon: ReceiptText, title: c("بيع وارجع للفاتورة وقت ما تحتاج", "Make a sale and find it later"), text: c("امسح الباركود أو ابحث بالاسم، احفظ عملية البيع، واطبع الإيصال للعميل.", "Scan a barcode or search by name, save the sale and print a receipt for the customer.") },
    { icon: Wrench, title: c("اعرف كل جهاز وصل لفين", "See where every repair stands"), text: c("سجّل حالة الجهاز عند الاستلام، تابع طلب الصيانة، وجهّز تفاصيل التسليم.", "Record the device condition at intake, track the repair and prepare for pickup.") },
    { icon: Headset, title: c("خلي عرب تيك يشوف المشكلة", "Show the issue to Arab Tech"), text: c("ابعث تفاصيل المشكلة، واتفق مع الفني على مشاركة نافذة البرنامج مؤقتًا بموافقتك.", "Send the details and approve a temporary view of the application window when needed.") },
  ];
  const faqs = [
    { title: c("إمتى تبدأ التجربة المجانية؟", "When does the free trial start?"), text: c("بتبدأ من أول تسجيل ناجح على الجهاز، وبتستمر لمدة ٧٢ ساعة.", "It starts with the first successful registration on the device and lasts 72 hours.") },
    { title: c("هل البرنامج يحتاج إنترنت؟", "Does ar-pro need internet access?"), text: c("البرنامج يحتاج اتصال للتحقق من الترخيص والاستفادة من الدعم. بيانات المبيعات والمخزون والصيانة بتتحفظ على جهازك.", "ar-pro uses the internet for license checks and support. Sales, stock and repair records are stored on your computer.") },
    { title: c("إزاي أشترك بعد التجربة؟", "How do I subscribe after the trial?"), text: c("اختار الباقة وادفع من محفظة الموقع. هتاخد كود التفعيل فورًا. أدخله في البرنامج بنفس البريد اللي كتبته في الطلب.", "Choose a plan and pay from your site wallet. You’ll receive an activation code immediately. Enter it in the app with the email used for the purchase.") },
    { title: c("هل أقدر أوقف مشاركة الشاشة؟", "Can I stop sharing my screen?"), text: c("تقدر تنهي الجلسة من داخل البرنامج في أي وقت. المشاهدة بتحتاج موافقتك وتشارك نافذة ar-pro.", "You can end the session from the app at any time. After you approve, viewing is limited to the ar-pro window.") },
  ];

  return (
    <div className={styles.product}>
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <div className={styles.identity} dir="ltr"><span aria-hidden="true">ar.</span><b>ar-pro</b></div>
              <h1>{c("من أول فاتورة", "From the first sale")}<br /><em>{c("لحد تسليم الجهاز.", "to device pickup.")}</em></h1>
              <p>{c("برنامج لمحل الموبايل يجمع الكاشير والمخزون وطلبات الصيانة. تابع البيع والإصلاح والتسليم من نفس مساحة العمل.", "A Windows workspace for phone shops that brings checkout, stock and repairs together, from the counter to the workbench.")}</p>
              <div className={styles.actions}>
                {product?.downloadUrl
                  ? <a className={styles.limeButton} href={product.downloadUrl}><Download size={18} />{c("تحميل لويندوز", "Download for Windows")}</a>
                  : <a className={styles.limeButton} href="#screens">{c("اتفرج على البرنامج", "Explore the app")} <ArrowDown size={18} /></a>}
                <a className={styles.ghostButton} href="#plans">{c("الباقات والأسعار", "Plans and pricing")}</a>
              </div>
            </div>
            <figure className={styles.heroWindow}>
              <figcaption><span dir="ltr">ar-pro</span><span><Monitor size={15} />{c("نقطة البيع", "Point of sale")}</span></figcaption>
              <Image src="/images/ar-pro/sales.webp" alt={c("شاشة نقطة البيع الكاملة في ar-pro تعرض المنتجات وسلة البيع", "Full ar-pro point-of-sale screen with products and the checkout basket")} width={1440} height={900} sizes="(max-width: 980px) 94vw, 57vw" loading="eager" fetchPriority="high" />
            </figure>
          </div>
          <div className={styles.facts}>
            {facts.map(({ icon: Icon, text }) => <span key={text}><Icon size={20} aria-hidden="true" />{text}</span>)}
          </div>
        </div>
      </section>

      <ScreenTour lang={ar ? "ar" : "en"} />

      <section className={styles.story}>
        <div className={styles.wrap}>
          <div className={styles.storyGrid}>
            <Image src="/images/ar-pro/workbench.webp" alt={c("هاتف وأدوات دقيقة وطابعة إيصالات على طاولة محل موبايلات", "Phone, precision tools and a receipt printer on a mobile repair counter")} width={1536} height={1024} sizes="(max-width: 820px) 94vw, 50vw" />
            <div>
              <h2>{c("شغل المحل، من الكاونتر لطاولة الصيانة.", "From the counter to the workbench.")}</h2>
              <div className={styles.storyItems}>
                {items.map(({ icon: Icon, title, text }) => <div key={title}>
                  <Icon size={23} aria-hidden="true" /><div><h3>{title}</h3><p>{text}</p></div>
                </div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className={styles.plans}>
        <div className={styles.wrap}>
          <div className={styles.sectionTitle}>
            <h2>{c("ابدأ التجربة. اختار باقتك بعدها.", "Try it first. Pick a plan after.")}</h2>
            <p>{c("جرّبه ٣ أيام، وبعدها اختار باقتك وادفع من محفظة الموقع. كود التفعيل بيظهر فور تأكيد الدفع.", "Try it for three days, then choose a plan and pay with your site wallet. Your activation code appears as soon as payment is confirmed.")}</p>
          </div>
          <div className={styles.planGrid}>
            <article className={styles.trialPlan}>
              <KeyRound size={25} aria-hidden="true" />
              <h3>{c("التجربة المجانية", "Free trial")}</h3>
              <p className={styles.price}>{ar ? "٣ أيام" : "3 days"}</p>
              <p>{c("تبدأ من أول تسجيل ناجح على جهازك.", "Begins with the first successful registration on your device.")}</p>
              <a className={styles.darkButton} href={product?.downloadUrl ?? "#screens"}>{product?.downloadUrl ? c("تحميل البرنامج", "Download the app") : c("جولة في البرنامج", "Take a tour")} <ArrowUpRight size={17} /></a>
            </article>
            {product?.plans.map((plan) => (
              <article className={styles.paidPlan} key={plan.id}>
                <h3>{plan.name}</h3>
                <div className={styles.priceLine}><bdi className={styles.price}>{currency(plan.offerAmountMinor, plan.currency)}</bdi>
                  {plan.offerAmountMinor < plan.amountMinor && <small>{c("بعد العرض", "After offer")} <bdi>{currency(plan.amountMinor, plan.currency)}</bdi></small>}
                </div>
                <p>{duration(plan.durationDays)}</p>
                {plan.discountUntil && <p className={styles.discount}>
                  {plan.discountPercent > 0 ? c(`خصم ${plan.discountPercent}% حتى`, `${plan.discountPercent}% off until`) : c("سعر العرض حتى", "Offer price until")}{" "}
                  {new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { dateStyle: "medium", timeZone: "Africa/Cairo" }).format(new Date(plan.discountUntil))}
                </p>}
                {plan.description && <p className={styles.planDescription}>{plan.description}</p>}
                <Link className={styles.ghostButton} href={plan.currency === 'USD' ? `${checkoutPath}?plan=${plan.id}` : contactPath}>
                  {plan.currency === 'USD' ? c("اشترِ من المحفظة", "Buy with wallet") : c("تواصل للاشتراك", "Contact us to subscribe")} <ArrowUpRight size={17} />
                </Link>
              </article>
            ))}
            {!product?.plans.length && <article className={styles.paidPlan}>
              <Headset size={25} aria-hidden="true" />
              <h3>{c("اشتراك المحل", "Shop subscription")}</h3>
              <p>{c("تواصل مع عرب تيك لمعرفة الباقات المتاحة وإصدار مفتاح الاشتراك.", "Contact Arab Tech for available plans and an activation key.")}</p>
              <Link className={styles.ghostButton} href={contactPath}>{c("تواصل للاشتراك", "Contact us to subscribe")} <ArrowUpRight size={17} /></Link>
            </article>}
          </div>
          <Link className={`${styles.ghostButton} ${styles.purchasesLink}`} href={checkoutPath}><KeyRound size={17} aria-hidden="true" />{c("مشترياتي وأكواد التفعيل", "My purchases and activation codes")}</Link>
        </div>
      </section>

      <section className={styles.faq}>
        <div className={styles.wrap}>
          <div className={styles.faqGrid}>
            <h2>{c("أسئلة قبل ما تبدأ.", "Before you get started.")}</h2>
            <div>
              {faqs.map(({ title, text }) => <details key={title}>
                <summary>{title}<ChevronDown size={21} aria-hidden="true" /></summary>
                <p>{text}</p>
              </details>)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
