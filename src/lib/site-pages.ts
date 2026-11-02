export const sitePages = {
  home: { path: "", ar: "الرئيسية", en: "Home" },
  pricing: { path: "/pricing", ar: "أسعار الوكلاء", en: "Reseller pricing" },
  gaming: { path: "/gaming", ar: "الألعاب والبطاقات", en: "Games & cards" },
  orders: { path: "/orders", ar: "طلباتي", en: "My orders" },
  wallet: { path: "/wallet", ar: "المحفظة", en: "Wallet" },
  blog: { path: "/blog", ar: "المدونة", en: "Blog" },
  tutorials: { path: "/tutorials", ar: "الفيديوهات التعليمية", en: "Video tutorials" },
  academy: { path: "/academy", ar: "الأكاديمية", en: "Academy" },
  api: { path: "/api-developer", ar: "ربط API", en: "Developer API" },
  contact: { path: "/contact", ar: "تواصل معنا", en: "Contact us" },
  faq: { path: "/faq", ar: "الأسئلة الشائعة", en: "FAQ" },
  terms: { path: "/terms", ar: "الشروط والأحكام", en: "Terms & conditions" },
  refund: { path: "/refund", ar: "سياسة الاسترجاع", en: "Refund policy" },
  profile: { path: "/profile", ar: "حسابي", en: "My account" },
  login: { path: "/login", ar: "دخول", en: "Log in" },
  register: { path: "/register", ar: "إنشاء حساب", en: "Sign up" },
} as const;

export type SitePage = keyof typeof sitePages;
export const primaryPages: SitePage[] = ["home", "pricing", "gaming", "blog", "contact"];
export const morePages: SitePage[] = ["api", "faq", "terms", "refund"];
