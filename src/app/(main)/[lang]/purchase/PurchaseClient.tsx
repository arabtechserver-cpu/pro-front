"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PurchaseClientContent({ lang, dict }: { lang: string, dict: any }) {
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get("serviceId");

  const [userSession, setUserSession] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<number>(0.0);

  // Dhru Services & Categories from Backend API
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState<boolean>(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || "");

  // Order Submission Form Fields
  const [targetInput, setTargetInput] = useState<string>("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  /**
   * يقرأ حقول المزود من بنيتين مختلفتين:
   * 1. Array (النظام الجديد): [{id, label, type, options, required}]
   * 2. Object (Dhru القديم): {key: {fieldname, required, fieldtype, fieldoptions}}
   * يُعيد دائماً: Record<key, fieldObj> أو null
   */
  const getProviderCustomFields = (service: any): Record<string, any> | null => {
    if (!service) return null;

    // ── البنية الجديدة: fields كـ array مباشرة على الـ service
    const rawFields = service.fields ?? service.requiresCustom;
    if (!rawFields) return null;

    try {
      const parsed = typeof rawFields === 'string' ? JSON.parse(rawFields) : rawFields;

      // Array من field objects: [{id, label, type, options, required}]
      if (Array.isArray(parsed) && parsed.length > 0) {
        // حوّل لـ Record<id, fieldObj> عشان يتوافق مع باقي الكود
        const result: Record<string, any> = {};
        for (const field of parsed) {
          if (field.adminonly) continue; // تجاهل الحقول المخصصة للأدمن
          const key = field.id || field.field_id || field.name || field.label;
          if (key) result[key] = field;
        }
        return Object.keys(result).length > 0 ? result : null;
      }

      // Object قديم من Dhru: {key: {fieldname, required, ...}}
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length > 0) {
        return parsed;
      }
    } catch (e) {}
    return null;
  };

  // Helper to extract options list for select/dropdown fields — يقرأ من بيانات Dhru API الحقيقية
  const extractFieldOptions = (key: string, fieldObj: any): string[] => {
    let options: string[] = [];

    // البيانات من Dhru API: options كـ array أو string أو fieldoptions
    const raw = fieldObj?.options ?? fieldObj?.fieldoptions ?? fieldObj?.FIELDOPTIONS ?? fieldObj?.Options;

    if (Array.isArray(raw)) {
      // array of strings أو array of objects {value, label}
      options = raw
        .map((item: any) => {
          if (typeof item === 'string') return item.trim();
          if (item?.value !== undefined) return String(item.value).trim();
          if (item?.label !== undefined) return String(item.label).trim();
          return String(item).trim();
        })
        .filter(Boolean);
    } else if (typeof raw === 'string' && raw.trim()) {
      // string مفصولة بـ \n أو , أو | أو \\n
      if (raw.includes('Router Beeline')) {
        options = ['Router Beeline TC-100', 'Router Beeline TC-150'];
      } else {
        options = raw.split(/\\n|[\r\n,|]+/).map((s: string) => s.trim()).filter(Boolean);
      }
    }

    return options;
  };

  const getFieldIdentityText = (key: string, fieldObj: any): string => {
    return [
      key,
      fieldObj?.label,
      fieldObj?.fieldname,
      fieldObj?.reqid,
      fieldObj?.name
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  };

  const isPrimaryImeiProviderField = (key: string, fieldObj: any): boolean => {
    const identity = getFieldIdentityText(key, fieldObj);
    if (!identity) return false;

    // حقول الروابط/الصور لا تُعتبر بديلاً عن حقل IMEI الأساسي.
    if (/(link|url|http|https|screenshot|screen shot|image|photo|hint)/i.test(identity)) {
      return false;
    }

    return /(imei|ecid|serial number|sn\b)/i.test(identity);
  };

  // 1. Load User Session & Sync Live Balance
  useEffect(() => {
    const saved = localStorage.getItem("user_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserSession(parsed);
        setUserBalance(parseFloat(parsed.balance || 0));

        if (parsed.email || parsed.id) {
          const token = localStorage.getItem("user_token");
          const queryParam = parsed.id ? `userId=${encodeURIComponent(parsed.id)}` : `email=${encodeURIComponent(parsed.email)}`;
          fetch(`/api/users/profile?${queryParam}`, {
            headers: token ? { "Authorization": `Bearer ${token}` } : {}
          })
            .then(res => res.json())
            .then(data => {
              if (data.user) {
                setUserBalance(data.user.balance);
                const updatedSession = { ...parsed, balance: data.user.balance };
                localStorage.setItem("user_session", JSON.stringify(updatedSession));
              }
            })
            .catch(() => {});
        }
      } catch (e) {}
    }
  }, []);

  // 2. Fetch Available Services & Groups from Backend API
  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const res = await fetch("/api/dhru/services");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setCategoriesList(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  // 3. Auto Sync Category & Service Selection from Query Param (serviceId)
  useEffect(() => {
    if (categoriesList.length > 0) {
      if (initialServiceId) {
        let matched = false;
        for (const group of categoriesList) {
          const found = (group.services || []).find((s: any) => s.id === initialServiceId);
          if (found) {
            setSelectedCategoryId(group.id);
            setSelectedServiceId(found.id);
            matched = true;
            break;
          }
        }
        if (!matched && categoriesList[0]) {
          setSelectedCategoryId(categoriesList[0].id);
          if (categoriesList[0].services?.[0]) {
            setSelectedServiceId(categoriesList[0].services[0].id);
          }
        }
      } else if (!selectedCategoryId) {
        setSelectedCategoryId(categoriesList[0].id);
        if (categoriesList[0].services?.[0]) {
          setSelectedServiceId(categoriesList[0].services[0].id);
        }
      }
    }
  }, [initialServiceId, categoriesList]);

  // Dynamic category and service derivation with auto-category sync
  let selectedCategory = categoriesList.find(c => c.id === selectedCategoryId);
  let availableServices = selectedCategory?.services || [];
  let selectedService = availableServices.find((s: any) => s.id === selectedServiceId);

  // If selectedServiceId is in a different category, auto-find & sync
  if (!selectedService && selectedServiceId) {
    for (const group of categoriesList) {
      const found = (group.services || []).find((s: any) => s.id === selectedServiceId);
      if (found) {
        selectedService = found;
        selectedCategory = group;
        availableServices = group.services || [];
        break;
      }
    }
  }

  if (!selectedCategory && categoriesList.length > 0) {
    selectedCategory = categoriesList[0];
    availableServices = selectedCategory?.services || [];
  }

  if (!selectedService && availableServices.length > 0) {
    selectedService = availableServices[0];
  }

  // Check if service requires an IMEI — بناءً على بيانات API المزود أولاً
  const providerFieldsForImei = getProviderCustomFields(selectedService);
  const providerHasPrimaryImeiField = providerFieldsForImei
    ? Object.entries(providerFieldsForImei).some(([k, fieldObj]: [string, any]) => {
        return isPrimaryImeiProviderField(k, fieldObj);
      })
    : false;
  // يظهر IMEI الافتراضي فقط لو الخدمة نفسها هي خدمة IMEI بحتة
  // ولم يرسل الـ API حقل IMEI مخصص
  const isImeiService = !providerHasPrimaryImeiField && (
    selectedService?.requiresImei === true ||
    selectedService?.requiresImei === "1" ||
    selectedCategory?.name === "IMEI Service" ||
    selectedCategory?.name?.toLowerCase().includes("imei")
  );

  // هل الخدمة تدعم الكمية (qty) — بناءً على API فقط
  const serviceSupportsQty =
    selectedService?.supportsQty === true ||
    selectedService?.supportsQty === "1" ||
    selectedService?.minQty !== undefined ||
    selectedService?.maxQty !== undefined;

  // Unit price & total calculation
  const unitPrice = selectedService ? (selectedService.credit + (selectedService.margin || 0)) : 0;
  const totalPrice = unitPrice * (quantity > 0 ? quantity : 1);
  const hasEnoughBalance = userBalance >= totalPrice;

  // Handle Category Select Change
  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const cat = categoriesList.find(c => c.id === catId);
    if (cat && cat.services && cat.services.length > 0) {
      setSelectedServiceId(cat.services[0].id);
    } else {
      setSelectedServiceId("");
    }
  };

  // Handle Service Select Change
  const handleServiceChange = (srvId: string) => {
    setSelectedServiceId(srvId);
    for (const group of categoriesList) {
      const found = (group.services || []).find((s: any) => s.id === srvId);
      if (found) {
        setSelectedCategoryId(group.id);
        break;
      }
    }
  };

  // 3. Handle Submitting a New Order
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitFeedback(null);

    if (!userSession) {
      setSubmitFeedback({ type: "error", text: lang === 'ar' ? 'يرجى تسجيل الدخول أولاً لإرسال الطلب' : 'Please sign in to place an order.' });
      return;
    }

    if (!selectedService) {
      setSubmitFeedback({ type: "error", text: lang === 'ar' ? 'يرجى اختيار الخدمة المراد طلبها' : 'Please select a service.' });
      return;
    }

    const providerFields = getProviderCustomFields(selectedService);
    let payloadTarget = targetInput.trim();
    let rawImeiStr = "";

    if (providerFields) {
      const missingKeys = Object.entries(providerFields)
        .filter(([k, f]: [string, any]) => (f?.required === "1" || f?.required === true) && !customFieldValues[k]?.trim())
        .map(([k, f]: [string, any]) => f?.fieldname || f?.reqid || k);

      if (missingKeys.length > 0) {
        setSubmitFeedback({
          type: "error",
          text: lang === 'ar' 
            ? `يرجى إكمال الحقول المطلوبة للمزود: ${missingKeys.join("، ")}` 
            : `Please fill required provider fields: ${missingKeys.join(", ")}`
        });
        return;
      }

      let customString = Object.entries(customFieldValues)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" | ");

      if (isImeiService) {
        if (!targetInput.trim()) {
          setSubmitFeedback({ 
            type: "error", 
            text: lang === 'ar' ? 'يرجى إدخال رقم الـ IMEI أو Serial الخاص بالجهاز' : 'Please enter the target IMEI/Serial number.' 
          });
          return;
        }
        rawImeiStr = targetInput.trim();
        payloadTarget = `IMEI: ${targetInput.trim()} | ${customString}`;
      } else {
        // If provider explicitly required an IMEI custom field, find it to send as rawImei
        const imeiKey = Object.keys(providerFields).find(k => {
          const f = providerFields[k];
          return isPrimaryImeiProviderField(k, f);
        });
        if (imeiKey && customFieldValues[imeiKey]) {
          rawImeiStr = customFieldValues[imeiKey];
        }
        payloadTarget = customString;
      }
    } else if (isImeiService) {
      if (!targetInput.trim()) {
        setSubmitFeedback({ 
          type: "error", 
          text: lang === 'ar' ? 'يرجى إدخال رقم الـ IMEI أو Serial الخاص بالجهاز' : 'Please enter the target IMEI/Serial number.' 
        });
        return;
      }
      rawImeiStr = targetInput.trim();
    } else {
      payloadTarget = targetInput.trim() || (lang === 'ar' ? 'طلب خدمة فورية بدون إدخال' : 'Instant Service Order (No Input)');
    }

    if (!hasEnoughBalance) {
      setSubmitFeedback({ 
        type: "error", 
        text: lang === 'ar' 
          ? `رصيدك الحالي ($${userBalance.toFixed(2)}) غير كافٍ لتنفيذ الطلب ($${totalPrice.toFixed(2)}). يرجى شحن المحفظة أولاً.` 
          : `Insufficient balance. Required: $${totalPrice.toFixed(2)}, Current: $${userBalance.toFixed(2)}.` 
      });
      return;
    }

    setSubmittingOrder(true);
    try {
      const token = localStorage.getItem("user_token");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: userSession.id,
          email: userSession.email,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          targetInput: payloadTarget,
          rawImei: rawImeiStr,
          quantity: quantity > 0 ? quantity : 1,
          price: unitPrice,
          notes: notes.trim(),
          customFields: customFieldValues
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitFeedback({ type: "success", text: data.message || "تم إرسال وحفظ الطلب بنجاح!" });
        setTargetInput("");
        setNotes("");
        
        if (data.newBalance !== undefined) {
          setUserBalance(data.newBalance);
          const updated = { ...userSession, balance: data.newBalance };
          localStorage.setItem("user_session", JSON.stringify(updated));
        }
      } else {
        setSubmitFeedback({ type: "error", text: data.error || "حدث خطأ أثناء تنفيذ الطلب" });
      }
    } catch {
      setSubmitFeedback({ type: "error", text: "تعذر الاتصال بالسيرفر لإكمال عملية الشراء" });
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-4xl mx-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
        <div>
          <h1 className="font-display-lg-mobile text-3xl font-bold text-on-surface flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-3xl">shopping_cart</span>
            <span>{lang === 'ar' ? 'طلب خدمة جديدة' : 'Place a New Order'}</span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {lang === 'ar' 
              ? 'اختر الخدمة المطلوبة وادخل بيانات الجهاز IMEI لتقديم الطلب فوراً.' 
              : 'Select service, enter IMEI or target device data to order instantly.'}
          </p>
        </div>

        {/* Navigation to Orders History Page */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/${lang}/orders`}
            className="px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/30 hover:border-primary/50 text-xs font-bold text-on-surface flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-base text-primary">receipt_long</span>
            <span>{lang === 'ar' ? 'سجل طلباتي 📜' : 'My Orders 📜'}</span>
          </Link>

          {userSession && (
            <div className="p-2.5 px-4 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center gap-3 shadow-sm">
              <div className="text-end">
                <p className="text-[10px] font-bold text-on-surface-variant">{lang === 'ar' ? 'رصيد المحفظة' : 'Wallet Balance'}</p>
                <p className="text-sm font-bold text-primary font-mono dir-ltr">${userBalance.toFixed(2)} USD</p>
              </div>
              <Link 
                href={`/${lang}/wallet`}
                className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-on-primary font-bold text-xs transition-all"
              >
                {lang === 'ar' ? 'شحن' : 'Top Up'}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* NOT LOGGED IN WARNING */}
      {!userSession && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-amber-400">lock</span>
            <div>
              <p className="font-bold text-sm text-on-surface">{lang === 'ar' ? 'يرجى تسجيل الدخول لتقديم طلب جديدة' : 'Please Sign In to Order Services'}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{lang === 'ar' ? 'قم بتسجيل الدخول بحسابك لطلب الخدمات وحسم التكلفة من المحفظة.' : 'Sign in to order services.'}</p>
            </div>
          </div>
          <Link
            href={`/${lang}/login`}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shrink-0 shadow-md"
          >
            {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </Link>
        </div>
      )}

      {/* DEDICATED ORDER CREATION FORM CARD */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-2xl space-y-6">
        <div className="border-b border-outline-variant/20 pb-4">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">layers</span>
            <span>{lang === 'ar' ? 'اختيار الخدمة وتأكيد الطلب' : 'Service Selection & Confirmation'}</span>
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            {lang === 'ar' ? 'حدد الفئة ثم اختر الخدمة المطلوبة وادخل رقم الـ IMEI للتنفيذ التلقائي.' : 'Select category, choose service, and enter IMEI.'}
          </p>
        </div>

        {/* Feedback Alert */}
        {submitFeedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              submitFeedback.type === "success"
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 glow-cyan"
                : "bg-red-500/15 border border-red-500/30 text-red-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">
                {submitFeedback.type === "success" ? "check_circle" : "error"}
              </span>
              <span>{submitFeedback.text}</span>
            </div>

            {submitFeedback.type === "success" && (
              <Link
                href={`/${lang}/orders`}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all shrink-0 text-center"
              >
                {lang === 'ar' ? 'عرض ومتابعة طلباتي 📜' : 'Track My Orders 📜'}
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleOrderSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {lang === 'ar' ? '1. فئة الخدمة الرئيسية' : '1. Service Category'}
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={loadingServices}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3.5 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer font-semibold text-xs"
              >
                {loadingServices ? (
                  <option>{lang === 'ar' ? 'جاري تحميل الأقسام...' : 'Loading categories...'}</option>
                ) : (
                  categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.services?.length || 0} خدمة)
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Service Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {lang === 'ar' ? '2. اختيار الخدمة المطلوبة' : '2. Select Service'}
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                disabled={loadingServices || availableServices.length === 0}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3.5 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer font-semibold text-xs"
              >
                {availableServices.length === 0 ? (
                  <option value="">{lang === 'ar' ? 'لا توجد خدمات متاحة في هذا القسم' : 'No services available'}</option>
                ) : (
                  availableServices.map((srv: any) => {
                    const price = (srv.credit + (srv.margin || 0)).toFixed(2);
                    const groupPrefix = srv.groupName ? `[${srv.groupName}] ` : '';
                    return (
                      <option key={srv.id} value={srv.id}>
                        {groupPrefix}{srv.name} — (${price} USD)
                      </option>
                    );
                  })
                )}
              </select>
            </div>
          </div>

          {/* Selected Service Details Card */}
          {selectedService && (
            <div className="p-5 rounded-2xl bg-surface-container-high/60 border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                {/* Category & Group/Package Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs">folder_open</span>
                    <span>القسم: {selectedCategory?.name || (lang === 'ar' ? 'القسم الرئيسي' : 'Main Category')}</span>
                  </span>

                  {selectedService.groupName && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary text-[11px] font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">package_2</span>
                      <span>الباقة: {selectedService.groupName}</span>
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-on-surface">{selectedService.name}</h4>
                <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-secondary">schedule</span>
                    <span>وقت التسليم: {selectedService.time || "فوري - 30 دقيقة"}</span>
                  </span>
                </div>
              </div>

              <div className="text-start sm:text-end shrink-0">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">سعر الخدمة</span>
                <span className="text-2xl font-bold font-mono text-primary glow-cyan">
                  ${unitPrice.toFixed(2)} USD
                </span>
              </div>
            </div>
          )}

          {/* PROVIDER REQUIRED CUSTOM FIELDS VS STANDARD INPUT — يتحكم فيها API المزود تلقائياً */}
          {(() => {
            const providerFields = getProviderCustomFields(selectedService);
            const hasCustomFields = providerFields && Object.keys(providerFields).length > 0;

            if (isImeiService || hasCustomFields) {
              return (
                <div className="space-y-6">
                  {/* ── حالة 2: الخدمة IMEI وتحتاج حقل مخصص ── */}
                  {isImeiService && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                        <span>{lang === 'ar' ? 'رقم الـ IMEI / الرقم التسلسلي' : 'Target IMEI / Serial Number'}</span>
                        <span className="text-primary text-[11px] font-normal">{lang === 'ar' ? '* إجباري' : '* Required'}</span>
                      </label>
                      <input
                        type="text"
                        value={targetInput}
                        onChange={(e) => setTargetInput(e.target.value)}
                        placeholder={lang === 'ar' ? 'أدخل رقم الـ IMEI الخاص بالجهاز (15 رقم) أو Serial...' : 'Enter 15-digit IMEI or device Serial number...'}
                        className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3.5 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm dir-ltr"
                        required
                      />
                    </div>
                  )}

                  {/* ── حالة 1: المزود أرسل حقول مخصصة (model, network, ...) */}
                  {hasCustomFields && (
                    <div className="space-y-4 p-5 rounded-2xl bg-surface-container-high/40 border border-primary/20">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                        <span className="material-symbols-outlined text-base">tune</span>
                        <span>
                          {lang === 'ar'
                            ? 'بيانات الطلب (حسب متطلبات المزود):'
                            : 'Order Details (Provider Requirements):'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(providerFields).map(([key, fieldObj]: [string, any]) => {
                          // قراءة التسمية من بيانات Dhru API الحقيقية
                          const rawLabel = fieldObj?.label || fieldObj?.fieldname || fieldObj?.reqid || fieldObj?.name || key;
                          const cleanLabel = rawLabel.replace(/^custom_/i, '');
                          const isRequired = fieldObj?.required === "1" || fieldObj?.required === true || fieldObj?.REQUIRED === "1";
                          const fieldType = (fieldObj?.fieldtype || fieldObj?.type || fieldObj?.FIELDTYPE || '').toLowerCase();
                          const optionsList = extractFieldOptions(key, fieldObj);

                          // حقل IMEI/Serial ضمن providerFields → input text
                          if (isPrimaryImeiProviderField(key, fieldObj)) {
                            return (
                              <div key={key} className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                                  <span>{cleanLabel}:</span>
                                  {isRequired && <span className="text-primary text-[11px] font-normal">{lang === 'ar' ? '* إجباري' : '* Required'}</span>}
                                </label>
                                <input
                                  type="text"
                                  value={customFieldValues[key] || ""}
                                  onChange={(e) => setCustomFieldValues({ ...customFieldValues, [key]: e.target.value })}
                                  placeholder={lang === 'ar' ? 'أدخل رقم الـ IMEI أو Serial...' : 'Enter IMEI or Serial...'}
                                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3.5 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm dir-ltr"
                                  required={isRequired}
                                />
                              </div>
                            );
                          }

                          // حقل select / dropdown — فقط لو فيه options حقيقية
                          if (fieldType === 'select' && optionsList.length > 0) {
                            return (
                              <div key={key} className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                                  <span>{cleanLabel}:</span>
                                  {isRequired && <span className="text-primary text-[11px] font-normal">{lang === 'ar' ? '* إجباري' : '* Required'}</span>}
                                </label>
                                <select
                                  value={customFieldValues[key] || ""}
                                  onChange={(e) => setCustomFieldValues({ ...customFieldValues, [key]: e.target.value })}
                                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3.5 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-semibold text-xs cursor-pointer"
                                  required={isRequired}
                                >
                                  <option value="">{lang === 'ar' ? '-- اختر --' : '-- Select --'}</option>
                                  {optionsList.map((opt, i) => (
                                    <option key={i} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>
                            );
                          }

                          // حقل نصي عادي
                          return (
                            <div key={key} className="flex flex-col gap-2">
                              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                                <span>{cleanLabel}:</span>
                                {isRequired && <span className="text-primary text-[11px] font-normal">{lang === 'ar' ? '* إجباري' : '* Required'}</span>}
                              </label>
                              <input
                                type={fieldType === "password" ? "password" : "text"}
                                value={customFieldValues[key] || ""}
                                onChange={(e) => setCustomFieldValues({ ...customFieldValues, [key]: e.target.value })}
                                placeholder={lang === 'ar' ? `أدخل ${cleanLabel}...` : `Enter ${cleanLabel}...`}
                                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3.5 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm dir-ltr"
                                required={isRequired}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // ── حالة 3: خدمة فورية بدون حقول
            return (
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 text-xs font-bold text-primary flex items-center gap-3">
                <span className="material-symbols-outlined text-xl text-primary shrink-0">verified</span>
                <span>
                  {lang === 'ar'
                    ? '✨ هذه الخدمة لا تطلب أي بيانات إضافية - جاهزة للتأكيد الفوري!'
                    : '✨ This service requires no additional input - Ready for instant order!'}
                </span>
              </div>
            );
          })()}

          {/* Quantity & Notes — الكمية تظهر فقط لو API المزود يدعمها */}
          <div className={`grid gap-6 ${serviceSupportsQty ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
            {serviceSupportsQty && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {lang === 'ar' ? 'الكمية' : 'Quantity'}
                </label>
                <input
                  type="number"
                  min={selectedService?.minQty || 1}
                  max={selectedService?.maxQty || 100}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3.5 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm dir-ltr"
                />
              </div>
            )}

            <div className={serviceSupportsQty ? 'md:col-span-2 flex flex-col gap-2' : 'flex flex-col gap-2'}>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {lang === 'ar' ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={lang === 'ar' ? 'أي تعليمات أو ملاحظات للمزود...' : 'Optional notes for provider...'}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3.5 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-xs"
              />
            </div>
          </div>

          {/* Cost Summary & Balance Check */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant">{lang === 'ar' ? 'إجمالي التكلفة المطلوبة:' : 'Total Cost Required:'}</p>
                <p className="text-xl font-bold font-mono text-primary dir-ltr">${totalPrice.toFixed(2)} USD</p>
              </div>
            </div>

            <div className="text-center sm:text-end">
              {hasEnoughBalance ? (
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{lang === 'ar' ? `رصيدك كافٍ ($${userBalance.toFixed(2)})` : `Sufficient balance ($${userBalance.toFixed(2)})`}</span>
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-xs inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span>{lang === 'ar' ? `رصيدك غير كافٍ ($${userBalance.toFixed(2)})` : `Insufficient ($${userBalance.toFixed(2)})`}</span>
                  </span>
                  <Link
                    href={`/${lang}/wallet`}
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all"
                  >
                    {lang === 'ar' ? 'شحن المحفظة 💳' : 'Top Up 💳'}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Submit Order Button */}
          <button
            type="submit"
            disabled={submittingOrder || !hasEnoughBalance || !selectedService}
            className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.99] ${
              !hasEnoughBalance || !selectedService
                ? "bg-surface-container-high border border-outline-variant/30 text-on-surface-variant/50 cursor-not-allowed"
                : "bg-gradient-to-r from-primary to-secondary text-on-primary hover:shadow-[0_0_25px_rgba(45,212,191,0.4)]"
            }`}
          >
            {submittingOrder ? (
              <>
                <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                <span>{lang === 'ar' ? 'جاري خصم الرصيد وتنفيذ الطلب...' : 'Processing order & deducting balance...'}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">rocket_launch</span>
                <span>{lang === 'ar' ? `تأكيد وإرسال الطلب ($${totalPrice.toFixed(2)} USD)` : `Confirm & Send Order ($${totalPrice.toFixed(2)} USD)`}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PurchaseClient({ lang, dict }: { lang: string, dict: any }) {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-primary">
        <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
        <p className="text-xs font-bold mt-2">جاري التحميل...</p>
      </div>
    }>
      <PurchaseClientContent lang={lang} dict={dict} />
    </Suspense>
  );
}
