export const digitalServices = [
  {
    id: "virtual-visa", variant: "visa", image: "service-visa-v1.webp",
    name: { ar: "بطاقات Visa الافتراضية", en: "Virtual Visa cards" },
    tag: { ar: "بطاقات وخدمات إلكترونية", en: "Cards & digital services" },
    description: { ar: "مساعدة في تفعيل وإعداد بطاقات الدفع الافتراضية والخدمات المرتبطة بها.", en: "Help with activating and setting up virtual payment cards and related digital services." },
    action: { ar: "استفسر عن البطاقات", en: "Ask about virtual cards" },
    alt: { ar: "بطاقتا دفع إلكترونيتان مع هاتف", en: "Two virtual payment cards with a smartphone" },
  },
  {
    id: "starlink", variant: "starlink", image: "service-starlink-v1.webp",
    name: { ar: "إعداد وتفعيل ستارلينك", en: "Starlink setup & activation" },
    tag: { ar: "اتصال وخدمات ستارلينك", en: "Starlink connectivity" },
    description: { ar: "من إعداد الجهاز إلى خطوات التفعيل، نساعدك تبدأ وتتابع تشغيل خدمتك.", en: "From device setup to activation steps, get help starting and managing your service." },
    action: { ar: "اطلب خدمة ستارلينك", en: "Request Starlink support" },
    alt: { ar: "طبق إنترنت فضائي أبيض وراوتر بإضاءة خضراء", en: "White satellite internet dish and router with emerald accents" },
  },
  {
    id: "account-verification", variant: "verification", image: "service-verification-v1.webp",
    name: { ar: "مساعدة توثيق الحسابات", en: "Account verification help" },
    tag: { ar: "Binance ومنصات إلكترونية", en: "Binance & digital platforms" },
    description: { ar: "إرشادك لفهم متطلبات التحقق واستكمال الخطوات الرسمية لحسابك باسمك.", en: "Guidance on verification requirements and completing the official steps for your own account." },
    action: { ar: "استفسر عن التوثيق", en: "Ask about verification" },
    alt: { ar: "هاتف مع درع زجاجي وعلامة تحقق", en: "Smartphone with a glass shield and a verification check" },
  },
] as const;
