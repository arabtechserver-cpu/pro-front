export const screenGroups = {
  shop: { ar: "البيع والمخزون", en: "Sales & stock" },
  repair: { ar: "الصيانة", en: "Repairs" },
  manage: { ar: "إدارة المحل", en: "Shop admin" },
  service: { ar: "الدعم والتفعيل", en: "Support & activation" },
} as const;

type Localized = { ar: string; en: string };
export type Screen = {
  id: string;
  group: keyof typeof screenGroups;
  title: Localized;
  detail: Localized;
  steps: { ar: string[]; en: string[] };
};

export const screens: Screen[] = [
  {
    id: "sales", group: "shop",
    title: { ar: "نقطة البيع", en: "Point of sale" },
    detail: { ar: "من البحث عن قطعة لحد طباعة الإيصال. شاشة الكاشير تجمع السلة والعميل وطريقة الدفع في مكان واحد.", en: "Search for a product, build the basket, collect payment and print the receipt from one screen." },
    steps: { ar: ["ابحث باسم المنتج أو امسح الباركود.", "اختر العميل وطريقة الدفع، وراجع الإجمالي.", "احفظ البيع واطبع الإيصال."], en: ["Find a product by name or barcode.", "Choose the customer and payment type, then check the total.", "Complete the sale and print the receipt."] },
  },
  {
    id: "invoices", group: "shop",
    title: { ar: "الفواتير والمرتجعات", en: "Invoices & returns" },
    detail: { ar: "راجع فواتير البيع السابقة وابحث بالتاريخ أو اسم العميل. افتح تفاصيل الفاتورة للطباعة أو تسجيل مرتجع.", en: "Find past sales by date or customer. Open an invoice to print it or record a return." },
    steps: { ar: ["اعثر على الفاتورة من السجل.", "راجع الأصناف والمدفوع والمتبقي.", "سجّل المرتجع عند الحاجة."], en: ["Find the invoice in the register.", "Review the items and amounts.", "Record a return when needed."] },
  },
  {
    id: "inventory", group: "shop",
    title: { ar: "المخزون والمنتجات", en: "Inventory & products" },
    detail: { ar: "رتّب الأجهزة والإكسسوارات وقطع الصيانة في تصنيفات. تابع المخزون وسعرَي الشراء والبيع من شاشة المنتجات.", en: "Organize phones, accessories and repair parts by category, with stock and cost information alongside each product." },
    steps: { ar: ["أضف المنتج ووحدة القياس والسعر.", "تابع الكمية وتوفّر قطع الغيار.", "اعثر على القطعة بالاسم أو الباركود."], en: ["Add products, units and prices.", "Track quantities and parts availability.", "Find stock by name or barcode."] },
  },
  {
    id: "purchases", group: "shop",
    title: { ar: "أوامر الشراء", en: "Purchase orders" },
    detail: { ar: "سجّل المشتريات باسم المورد وتابع مراحل الطلب وصولًا لاستلام الأصناف في المخزون.", en: "Record purchases against a supplier and track orders through receiving inventory." },
    steps: { ar: ["حدد المورد وأصناف الطلب.", "راجع الكميات والتكاليف.", "سجّل استلام الشحنة."], en: ["Choose a supplier and add items.", "Review quantities and costs.", "Record delivery into stock."] },
  },
  {
    id: "repairs", group: "repair",
    title: { ar: "لوحة الصيانة", en: "Repair dashboard" },
    detail: { ar: "شوف الأجهزة اللي وصلت النهارده، واللي تحت الإصلاح، والجاهز منها للتسليم. فلتر الطلبات حسب الحالة أو الفني.", en: "See today’s intake, work in progress and devices ready to collect. Filter jobs by status or technician." },
    steps: { ar: ["ابحث عن طلب أو جهاز من القائمة.", "تابع الأجهزة المتأخرة والجاهزة.", "حدّث حالة الطلب مع كل خطوة."], en: ["Find a device or job in the list.", "Spot overdue and ready jobs.", "Update the job as work progresses."] },
  },
  {
    id: "intake", group: "repair",
    title: { ar: "استلام جهاز", en: "Device intake" },
    detail: { ar: "وثّق الجهاز والملحقات والعطل وحالة الشاشة والهيكل قبل بدء الشغل، واربط الطلب بعميل موجود أو عميل جديد.", en: "Document the device, accessories, fault and physical condition before work starts. Link intake to an existing or new customer." },
    steps: { ar: ["سجّل الموديل والسيريال أو IMEI.", "دوّن العطل وحالة الجهاز عند الاستلام.", "احفظ الطلب وجهّز وصل الاستلام."], en: ["Record the model, serial number or IMEI.", "Capture the fault and intake condition.", "Save the job and prepare an intake receipt."] },
  },
  {
    id: "repair-order", group: "repair",
    title: { ar: "تفاصيل طلب الصيانة", en: "Repair order detail" },
    detail: { ar: "افتح بطاقة الجهاز لمراجعة العطل وقطع الغيار والدفعات وسجل تغيّر الحالة من الاستلام للتسليم.", en: "Open an individual job to review the fault, spare parts, payments and the full status history." },
    steps: { ar: ["راجع بيانات الجهاز وتاريخ الطلب.", "تابع قطع الغيار والدفعات من نفس البطاقة.", "حدّث الحالة أو جهّز الجهاز للتسليم."], en: ["Review the device and order history.", "Track spare parts and payments from the job card.", "Update progress or prepare the device for pickup."] },
  },
  {
    id: "phone-lab", group: "repair",
    title: { ar: "مختبر الهواتف", en: "Phone lab" },
    detail: { ar: "مساحة لفحص اتصال الأجهزة عبر USB والتعرّف على حالة الأدوات والتعريفات المتاحة على جهازك.", en: "Check devices connected over USB and see which local tools and drivers are available." },
    steps: { ar: ["وصّل الجهاز وافحص ظهوره في القائمة.", "راجع حالة الأدوات المحلية المطلوبة.", "اختر الأداة المناسبة للجهاز المتصل."], en: ["Connect a device and check the device list.", "Review the required local tools.", "Choose an available tool for the connected device."] },
  },
  {
    id: "customers", group: "manage",
    title: { ar: "العملاء", en: "Customers" },
    detail: { ar: "احتفظ بملف لكل عميل فيه بيانات التواصل وسجل التعاملات. ابحث بالاسم أو رقم الهاتف وقت الاستلام والكاشير.", en: "Keep one record per customer, with contact details and transaction history. Search by name or phone during intake and checkout." },
    steps: { ar: ["أضف عميلًا جديدًا أو افتح ملف عميل موجود.", "راجع التعاملات والمدفوعات.", "حدّث تفاصيل التواصل عند الحاجة."], en: ["Add a customer or open an existing record.", "Review transactions and payments.", "Update contact information when needed."] },
  },
  {
    id: "suppliers", group: "manage",
    title: { ar: "الموردون", en: "Suppliers" },
    detail: { ar: "رتّب بيانات الموردين وسجّل المشتريات والدفعات المرتبطة بكل مورد لمراجعة الحساب بسهولة.", en: "Organize supplier records and review purchases and payments linked to each supplier." },
    steps: { ar: ["احفظ بيانات المورد.", "اربط المشتريات بحساب المورد.", "راجع الدفعات والرصيد."], en: ["Save supplier details.", "Link purchases to the supplier account.", "Review payments and balance."] },
  },
  {
    id: "reports", group: "manage",
    title: { ar: "التقارير والمصروفات", en: "Reports & expenses" },
    detail: { ar: "راجع حركة البيع والإيرادات والمصروفات خلال فترة تختارها. استخدم التقارير في مراجعة شغل اليوم وإغلاق الخزنة.", en: "Review sales, revenue and expenses for a chosen period. Use reports to review daily activity and cash closing." },
    steps: { ar: ["اختر الفترة اللي عايز تراجعها.", "سجّل المصروفات اليومية.", "راجع ملخص الإيرادات والخزنة."], en: ["Choose a reporting period.", "Record day-to-day expenses.", "Review the revenue and cash summary."] },
  },
  {
    id: "staff", group: "manage",
    title: { ar: "الموظفون والصلاحيات", en: "Staff & permissions" },
    detail: { ar: "اضبط أدوار صاحب المحل والكاشير والفني، وراجع صلاحيات كل دور بما يناسب طريقة شغلك.", en: "Assign owner, cashier and technician roles and review what each role can do in the workspace." },
    steps: { ar: ["أضف أعضاء الفريق.", "اختر الدور المناسب لكل موظف.", "راجع صلاحيات البيع والصيانة."], en: ["Add team members.", "Choose the right role for each person.", "Review sales and repair permissions."] },
  },
  {
    id: "settings", group: "manage",
    title: { ar: "إعدادات المحل", en: "Shop settings" },
    detail: { ar: "ظبّط بيانات المحل وطباعة الإيصالات والإعدادات المستخدمة في البيع والصيانة. راجع خيارات النسخ الاحتياطي والاستعادة من البرنامج.", en: "Configure shop details, receipt printing and preferences. Review backup and restore options inside the program." },
    steps: { ar: ["عدّل بيانات المحل الظاهرة على المستندات.", "اضبط الطباعة بما يناسب جهازك.", "راجع إعدادات النسخ الاحتياطي."], en: ["Edit the shop details printed on documents.", "Configure printing for your hardware.", "Review backup preferences."] },
  },
  {
    id: "records", group: "manage",
    title: { ar: "مراجعة العمليات", en: "Operation review" },
    detail: { ar: "افتح مراجعة المزامنة لمتابعة العمليات المعلقة أو التي تحتاج مراجعة، وتشغيل المراجعة من داخل البرنامج.", en: "Open sync review to inspect pending operations and any that need attention, then run a review from the program." },
    steps: { ar: ["راجع العمليات المعلقة.", "افتح تفاصيل العملية عند ظهور مشكلة.", "أعد المحاولة من الشاشة نفسها."], en: ["Review pending operations.", "Inspect an operation when it needs attention.", "Retry from the same screen."] },
  },
  {
    id: "support", group: "service",
    title: { ar: "الدعم والفنيون عن بُعد", en: "Remote support" },
    detail: { ar: "ابعت وصف المشكلة لعرب تيك من داخل البرنامج، وافتح جلسة مشاهدة مؤقتة بموافقتك عند الحاجة.", en: "Describe the issue to Arab Tech and approve a temporary viewing session when you need to share the program window." },
    steps: { ar: ["سجّل تفاصيل المشكلة وابدأ المحادثة.", "وافق على مشاركة نافذة البرنامج عند الحاجة.", "أنه المشاركة في أي وقت من داخل ar-pro."], en: ["Describe the issue and start a conversation.", "Approve sharing when the technician needs to see the window.", "End sharing at any time from ar-pro."] },
  },
  {
    id: "activation", group: "service",
    title: { ar: "التسجيل والتفعيل", en: "Registration & activation" },
    detail: { ar: "ابدأ بتجربة مجانية لمدة ٣ أيام أو فعّل اشتراكك بالمفتاح المرتبط ببريدك. التحقق من الترخيص يتم عبر الإنترنت.", en: "Start a three-day free trial or activate with a license key issued to your email. License verification uses an internet connection." },
    steps: { ar: ["اكتب اسم المحل والبريد الإلكتروني.", "اختر التجربة أو أدخل مفتاح التفعيل.", "افتح مساحة عمل المحل بعد التحقق."], en: ["Enter your shop name and email.", "Start a trial or enter your activation key.", "Open your shop workspace once verified."] },
  },
];
