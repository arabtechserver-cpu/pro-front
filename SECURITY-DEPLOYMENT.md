# إعداد الواجهة بعد إصلاحات الحماية

انشر الواجهة والخلفية المعدلتين معًا. بروكسي API يمرر هيدرز توقيع PayPal اللازمة للتحقق، ولا يمرر `CF-Connecting-IP` أو `X-Real-IP` بوصفهما مصدرًا موثوقًا لهوية العميل.

يجب أن تكون حاوية Next.js خلف مدخل عام موثوق يعيد إنشاء `X-Forwarded-For` من الاتصال الفعلي، مع منع الوصول المباشر إلى منفذ الحاوية. أضف عنوان الحاوية والبروكسيات الفعلية إلى `TRUSTED_PROXY_CIDRS` في الخلفية فقط بعد ضبط هذا المسار. التفاصيل، والترحيلات، ومتطلبات PayPal، وإبطال كاش الإيصالات موضحة في ملف `SECURITY-DEPLOYMENT.md` داخل مشروع الخلفية.

### مفتاح تشفير دوال الخادم الثابت (Server Actions Persistent Key)
يجب تعيين متغير البيئة `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` في بيئة الإنتاج والحاوية (Docker) لضمان عدم توليد مفتاح عشوائي جديد عند كل إعادة تشغيل للسيرفر أو عند وجود أكثر من حاوية خلف Load Balancer، مما يمنع حدوث أخطاء `failed-to-find-server-action`:
```bash
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=KumNXbsXHTxE7lZZO8nfK/ZpXgU6K3z9x46dXP342YY=
```

