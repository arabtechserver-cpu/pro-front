"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { shouldShowDefaultImeiField } from "../../../../lib/purchase-service-fields";

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
  const [serviceDetailsById, setServiceDetailsById] = useState<Record<string, any>>({});
  const [loadedServiceDetails, setLoadedServiceDetails] = useState<Record<string, boolean>>({});

  // Order Submission Form Fields
  const [targetInput, setTargetInput] = useState<string>("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showServiceInfo, setShowServiceInfo] = useState<boolean>(false);

  // Success Confirmation Modal Data
  const [successOrderModalData, setSuccessOrderModalData] = useState<{
    orderId: string;
    serviceName: string;
    targetInput: string;
    price: number;
    newBalance: number;
  } | null>(null);

  /**
   * يقرأ حقول المزود من بنيتين مختلفتين:
   * 1. Array (النظام الجديد): [{id, label, type, options, required, description}]
   * 2. Object (Dhru القديم): {key: {fieldname, required, fieldtype, fieldoptions, description}}
   * يُعيد دائماً: Record<key, fieldObj> أو null
   */
  const getProviderCustomFields = (service: any): Record<string, any> | null => {
    if (!service) return null;

    const rawFields = service.fields ?? service.requiresCustom;
    if (!rawFields) return null;

    try {
      const parsed = typeof rawFields === 'string' ? JSON.parse(rawFields) : rawFields;

      // Array من field objects
      if (Array.isArray(parsed) && parsed.length > 0) {
        const result: Record<string, any> = {};
        for (const field of parsed) {
          if (field.adminonly) continue; // تجاهل الحقول المخصصة للأدمن
          const key = field.id || field.field_id || field.name || field.label;
          if (key) result[key] = field;
        }
        return Object.keys(result).length > 0 ? result : null;
      }

      // Object من Dhru API
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length > 0) {
        return parsed;
      }
    } catch (e) {}
    return null;
  };

  // Helper to extract options list for select/dropdown fields — يقرأ من بيانات Dhru API الحقيقية
  const extractFieldOptions = (key: string, fieldObj: any): string[] => {
    let options: string[] = [];
    const raw = fieldObj?.options ?? fieldObj?.fieldoptions ?? fieldObj?.FIELDOPTIONS ?? fieldObj?.Options;

    if (Array.isArray(raw)) {
      options = raw
        .map((item: any) => {
          if (typeof item === 'string') return item.trim();
          if (item?.value !== undefined) return String(item.value).trim();
          if (item?.label !== undefined) return String(item.label).trim();
          return String(item).trim();
        })
        .filter(Boolean);
    } else if (typeof raw === 'string' && raw.trim()) {
      if (raw.includes('Router Beeline')) {
        options = ['Router Beeline TC-100', 'Router Beeline TC-150'];
      } else {
        options = raw.split(/\\n|[\r\n,|]+/).map((s: string) => s.trim()).filter(Boolean);
      }
    }

    return options;
  };

  const getLocalizedFieldLabel = (rawKey: string, fieldObj: any, lang: string): string => {
    const raw = fieldObj?.label || fieldObj?.fieldname || fieldObj?.reqid || fieldObj?.name || rawKey;
    const clean = String(raw).replace(/^custom_/i, '').trim();
    const lower = clean.toLowerCase();

    if (lang === 'ar') {
      if (lower === 'email' || lower === 'user email' || lower === 'user_email' || lower === 'e-mail') return 'البريد الإلكتروني (Email)';
      if (lower === 'username' || lower === 'user name' || lower === 'user_name' || lower === 'login' || lower === 'targetlogin') return 'اسم المستخدم (Username / Login)';
      if (lower === 'password' || lower === 'pass' || lower === 'user password') return 'كلمة المرور (Password)';
      if (lower === 'ecid' || lower === 'ecid copy from tool') return 'رقم الـ ECID (من الأداة)';
      if (lower === 'serial number' || lower === 'serial_number' || lower === 'sn' || lower === 'serial' || lower === 'serial no') return 'الرقم التسلسلي للجهاز (Serial Number)';
      if (lower === 'imei' || lower === 'imei number') return 'رقم الـ IMEI (15 رقم)';
      if (lower === 'sn or imei' || lower === 'imei/sn' || lower === 'sn / imeis' || lower === 'serial number or imei' || lower === 'imei or serial number' || lower === 'imei or sn') return 'رقم IMEI أو Serial Number';
      if (lower === 'model' || lower === 'model no') return 'موديل الجهاز (Model)';
      if (lower === 'lock code' || lower === 'code lock' || lower === 'keylock' || lower === 'lock code / imei') return 'رمز القفل (Lock Code)';
      if (lower.includes('lock screen photo') || lower.includes('screenshot') || lower.includes('picture')) return 'رابط صورة الشاشة (Screenshot Link)';
      if (lower.includes('video link') || lower.includes('video')) return 'رابط فيديو الإثبات (Video Link)';
      if (lower === 'checker report' || lower === 'link proof') return 'تقرير الفحص أو الإثبات (Report / Proof)';
      if (lower === 'apple id' || lower === 'icloud email id' || lower === 'apple id email') return 'حساب أبل (Apple ID / iCloud Email)';
      if (lower.includes('apple id hint') || lower.includes('link apple id hint')) return 'تلميح حساب أبل (Apple ID Hint Link)';
      if (lower === 'country' || lower === 'current country') return 'الدولة الحالية للجهاز (Country)';
      if (lower === 'mobile' || lower === 'phonenumber' || lower === 'whatsapp number') return 'رقم الهاتف / واتساب (Phone Number)';
      if (lower.includes('anydesk') || lower.includes('any desk') || lower.includes('ultra viewer') || lower.includes('ultraview')) return 'معرف وبيانات AnyDesk / UltraViewer';
      if (lower === 'playerid') return 'معرف اللاعب (Player ID)';
      if (lower === 'account id' || lower === 'userid') return 'معرف الحساب (Account ID / User ID)';
      if (lower === 'hardware id' || lower === 'hwid' || lower === 'machine id' || lower === 'processor id' || lower === 'fingerprint') return 'المعرف الصلب للجهاز (HWID / Machine ID)';
      if (lower === 'license key' || lower === 'domain name' || lower === 'workspace') return 'مفتاح الترخيص / النطاق (License / Domain)';
    }

    return clean;
  };

  const isLongTextField = (rawKey: string, fieldObj: any): boolean => {
    const raw = (fieldObj?.label || fieldObj?.fieldname || fieldObj?.reqid || fieldObj?.name || rawKey).toLowerCase();
    return raw.includes('report') || raw.includes('proof') || raw.includes('questions') || raw.includes('comments') || raw.includes('notes') || raw.includes('bulk') || raw.includes('link');
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
          const headers: Record<string, string> = {};
          if (token && token !== "null" && token !== "undefined") {
            headers["Authorization"] = `Bearer ${token}`;
          }
          fetch(`/api/users/profile?${queryParam}`, {
            headers,
            credentials: "include"
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
        const res = await fetch("/api/dhru/services?view=pricing");
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

  // Fetch only the selected service's heavy fields instead of loading them for every service.
  useEffect(() => {
    if (!selectedServiceId || loadedServiceDetails[selectedServiceId]) return;

    let active = true;
    fetch(`/api/dhru/services/${encodeURIComponent(selectedServiceId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch service details");
        return res.json();
      })
      .then((service) => {
        if (active) {
          setServiceDetailsById((prev) => ({ ...prev, [selectedServiceId]: service }));
        }
      })
      .catch((err) => console.error("Failed to fetch selected service details:", err))
      .finally(() => {
        if (active) {
          setLoadedServiceDetails((prev) => ({ ...prev, [selectedServiceId]: true }));
        }
      });

    return () => {
      active = false;
    };
  }, [loadedServiceDetails, selectedServiceId]);

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
  const selectedServiceDetails = selectedServiceId ? serviceDetailsById[selectedServiceId] : null;

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

  if (!selectedCategory && selectedServiceDetails?.dhruCategory) {
    selectedCategory = selectedServiceDetails.dhruCategory;
  }

  if (!selectedService && availableServices.length > 0) {
    selectedService = availableServices[0];
  }

  if (selectedServiceDetails) {
    selectedService = { ...(selectedService || {}), ...selectedServiceDetails };
  }

  const selectedServiceDetailsLoaded = !selectedServiceId || Boolean(loadedServiceDetails[selectedServiceId]);
  const providerFieldsForImei = getProviderCustomFields(selectedService);
  const isImeiService = selectedServiceDetailsLoaded && shouldShowDefaultImeiField(
    selectedCategory?.name || selectedServiceDetails?.dhruCategory?.name,
    providerFieldsForImei
  );

  // هل الخدمة تدعم الكمية (qty) — بناءً على API فقط
  const serviceSupportsQty =
    selectedService?.supportsQty === true ||
    selectedService?.supportsQty === "1" ||
    selectedService?.minQty !== undefined ||
    selectedService?.maxQty !== undefined;

  // Unit price & total calculation
  const getCalculatedUnitPrice = (service: any): number => {
    if (!service) return 0;
    if (service.finalPrice !== undefined && service.finalPrice !== null) return Number(service.finalPrice) || 0;
    if (service.price !== undefined && service.price !== null) return Number(service.price) || 0;
    const c = typeof service.credit === 'number' ? service.credit : parseFloat(service.credit) || 0;
    const m = typeof service.margin === 'number' ? service.margin : parseFloat(service.margin) || 0;
    return Number((c + m).toFixed(2));
  };

  const unitPrice = getCalculatedUnitPrice(selectedService);
  const isFreeService = Boolean(selectedService && unitPrice === 0 && (
    selectedService.name?.toLowerCase().includes("free") || 
    selectedService.name?.includes("مجاني") || 
    selectedService.name?.includes("مجانا")
  ));
  const isZeroUnpriced = Boolean(selectedService && unitPrice === 0 && !isFreeService);

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

    if (providerFields && Object.keys(providerFields).length > 0) {
      const missingKeys = Object.entries(providerFields)
        .filter(([k, f]: [string, any]) => (f?.required === "1" || f?.required === true) && !customFieldValues[k]?.trim())
        .map(([k, f]: [string, any]) => getLocalizedFieldLabel(k, f, lang));

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
        .filter(([_, v]) => Boolean(v && String(v).trim()))
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
        payloadTarget = customString ? `IMEI: ${targetInput.trim()} | ${customString}` : `IMEI: ${targetInput.trim()}`;
      } else {
        // If provider explicitly required an IMEI/SN custom field, find it to send as rawImei
        const imeiKey = Object.keys(providerFields).find(k => {
          const f = providerFields[k];
          return isPrimaryImeiProviderField(k, f);
        });
        if (imeiKey && customFieldValues[imeiKey]) {
          rawImeiStr = customFieldValues[imeiKey];
        } else if (targetInput.trim()) {
          rawImeiStr = targetInput.trim();
        }

        if (targetInput.trim() && customString) {
          payloadTarget = `${targetInput.trim()} | ${customString}`;
        } else {
          payloadTarget = customString || targetInput.trim() || (lang === 'ar' ? 'طلب فوري' : 'Instant Order');
        }
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
      payloadTarget = targetInput.trim();
    } else {
      payloadTarget = targetInput.trim() || (lang === 'ar' ? 'طلب فوري' : 'Instant Order');
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
      const headers: Record<string, string> = { 
        "Content-Type": "application/json"
      };
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        credentials: "include",
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

      const data = await res.json().catch(() => ({ success: false, message: "تعذر قراءة رد الخادم" }));
      if (res.ok && data.success) {
        const orderId = data.order?.id ? data.order.id.slice(-6).toUpperCase() : "NEW";
        const newBal = data.newBalance !== undefined ? data.newBalance : Math.max(0, userBalance - totalPrice);

        setSubmitFeedback({ type: "success", text: data.message || "تم استلام وتأكيد طلبك بنجاح!" });
        setSuccessOrderModalData({
          orderId,
          serviceName: selectedService.name,
          targetInput: payloadTarget,
          price: totalPrice,
          newBalance: newBal
        });

        setTargetInput("");
        setNotes("");
        setCustomFieldValues({});
        
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
    <div className="flex flex-col gap-8 pb-16 max-w-4xl mx-auto relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* CELEBRATION ORDER SUCCESS MODAL */}
      {successOrderModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-emerald-500/50 shadow-2xl relative overflow-hidden space-y-6 text-center bg-surface-container-low">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl ring-8 ring-emerald-500/10">
              <span className="material-symbols-outlined text-4xl animate-bounce">check_circle</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-bold text-white font-display">
                {lang === 'ar' ? '🎉 تم استلام وتأكيد طلبك بنجاح!' : '🎉 Order Placed Successfully!'}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {lang === 'ar'
                  ? 'طلبك الآن قيد المراجعة والمعالجة من قبل الإدارة، وسيتم تسليم النتيجة فور إتمامها.'
                  : 'Your order is currently pending review & processing. Result will be delivered upon completion.'}
              </p>
            </div>

            {/* Details Summary Card */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-xs space-y-2.5 text-right font-sans">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/15">
                <span className="text-on-surface-variant font-bold">رقم الطلب:</span>
                <span className="font-mono font-bold text-primary text-sm">#{successOrderModalData.orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-bold">الخدمة:</span>
                <span className="font-bold text-on-surface truncate max-w-[220px]">{successOrderModalData.serviceName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-bold">البيانات / IMEI:</span>
                <span className="font-mono font-bold text-primary dir-ltr">{successOrderModalData.targetInput}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-bold">المبلغ المخصوم:</span>
                <span className="font-mono font-bold text-emerald-400">${successOrderModalData.price.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-outline-variant/15">
                <span className="text-on-surface-variant font-bold">رصيد محفظتك الجديد:</span>
                <span className="font-mono font-bold text-primary text-sm">${successOrderModalData.newBalance.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/${lang}/orders`}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-black py-3.5 rounded-2xl font-bold text-xs shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-base">receipt_long</span>
                <span>{lang === 'ar' ? 'الانتقال لسجل طلباتي 📜' : 'View in My Orders 📜'}</span>
              </Link>
              <button
                type="button"
                onClick={() => setSuccessOrderModalData(null)}
                className="px-6 bg-surface-container-high hover:bg-surface-container-highest text-on-surface py-3.5 rounded-2xl font-bold text-xs border border-outline-variant/30 transition-all active:scale-95"
              >
                {lang === 'ar' ? '➕ طلب خدمة أخرى' : '➕ Order Another Service'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                    const c = typeof srv.credit === 'number' ? srv.credit : parseFloat(srv.credit) || 0;
                    const m = typeof srv.margin === 'number' ? srv.margin : parseFloat(srv.margin) || 0;
                    const p = srv.finalPrice ?? srv.price ?? (c + m);
                    const pNum = typeof p === 'number' ? p : parseFloat(p) || 0;
                    const isFree = pNum === 0 && (srv.name?.toLowerCase().includes("free") || srv.name?.includes("مجاني") || srv.name?.includes("مجانا"));
                    const priceLabel = isFree 
                      ? (lang === 'ar' ? 'مجاناً 🎁' : 'Free 🎁') 
                      : pNum > 0 
                      ? `$${pNum.toFixed(2)} USD` 
                      : (lang === 'ar' ? 'سعر خاص 💬' : 'Special Price 💬');
                    const groupPrefix = srv.groupName ? `[${srv.groupName}] ` : '';
                    return (
                      <option key={srv.id} value={srv.id}>
                        {groupPrefix}{srv.name} — ({priceLabel})
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

                {/* Collapsible Provider Instructions & Info */}
                {selectedService.info && (
                  <div className="mt-3 pt-2.5 border-t border-outline-variant/15">
                    <button
                      type="button"
                      onClick={() => setShowServiceInfo(!showServiceInfo)}
                      className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline"
                    >
                      <span className="material-symbols-outlined text-sm">info</span>
                      <span>
                        {showServiceInfo
                          ? (lang === 'ar' ? 'إخفاء شروط وتعليمات المزود ▲' : 'Hide provider rules & instructions ▲')
                          : (lang === 'ar' ? 'عرض شروط وتعليمات المزود للخدمة ▼' : 'View provider rules & instructions ▼')}
                      </span>
                    </button>
                    {showServiceInfo && (
                      <div className="mt-2.5 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-xs text-on-surface-variant leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                        {selectedService.info}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="text-start sm:text-end shrink-0">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">سعر الخدمة</span>
                {unitPrice > 0 ? (
                  <span className="text-2xl font-bold font-mono text-primary glow-cyan">
                    ${unitPrice.toFixed(2)} USD
                  </span>
                ) : isFreeService ? (
                  <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl inline-block mt-1">
                    {lang === 'ar' ? 'خدمة مجانية 🎁' : 'Free Service 🎁'}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl inline-block mt-1">
                    {lang === 'ar' ? 'سعر خاص عند الطلب 💬' : 'Price on Request 💬'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* PROVIDER REQUIRED CUSTOM FIELDS VS STANDARD INPUT — يتحكم فيها API المزود تلقائياً */}
          {(() => {
            if (selectedServiceId && !selectedServiceDetailsLoaded) {
              return (
                <div className="flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-high/30 p-4 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin text-base text-primary">sync</span>
                  <span>{lang === 'ar' ? 'جاري تحميل حقول الطلب المطلوبة...' : 'Loading required order fields...'}</span>
                </div>
              );
            }

            const providerFields = getProviderCustomFields(selectedService);
            const hasCustomFields = Boolean(providerFields && Object.keys(providerFields).length > 0);

            if (isImeiService || hasCustomFields) {
              return (
                <div className="space-y-6">
                  {/* ── حالة: الخدمة IMEI وتحتاج حقل مخصص ── */}
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

                  {/* ── حالة: المزود أرسل حقول مخصصة (Custom Fields) ── */}
                  {hasCustomFields && (
                    <div className="space-y-4 p-5 rounded-2xl bg-surface-container-high/40 border border-primary/20">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                        <span className="material-symbols-outlined text-base">tune</span>
                        <span>
                          {lang === 'ar'
                            ? 'بيانات وحقول الطلب المطلوبة من المزود:'
                            : 'Order Details & Provider Required Fields:'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(providerFields!).map(([key, fieldObj]: [string, any]) => {
                          const cleanLabel = getLocalizedFieldLabel(key, fieldObj, lang);
                          const isRequired = fieldObj?.required === "1" || fieldObj?.required === true || fieldObj?.REQUIRED === "1";
                          const fieldType = (fieldObj?.fieldtype || fieldObj?.type || fieldObj?.FIELDTYPE || '').toLowerCase();
                          const fieldDesc = fieldObj?.description || fieldObj?.DESCRIPTION || fieldObj?.hint || '';
                          const optionsList = extractFieldOptions(key, fieldObj);
                          const isLong = isLongTextField(key, fieldObj);

                          // حقل select / dropdown — لو فيه options حقيقية
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
                                  <option value="">{lang === 'ar' ? '-- اختر من القائمة --' : '-- Select from list --'}</option>
                                  {optionsList.map((opt, i) => (
                                    <option key={i} value={opt}>{opt}</option>
                                  ))}
                                </select>
                                {fieldDesc && (
                                  <p className="text-[11px] text-on-surface-variant/80 flex items-center gap-1 mt-0.5">
                                    <span className="material-symbols-outlined text-xs text-primary">info</span>
                                    <span>{fieldDesc}</span>
                                  </p>
                                )}
                              </div>
                            );
                          }

                          // حقل نصي طويل (تقرير، إثبات، روابط متعددة)
                          if (isLong) {
                            return (
                              <div key={key} className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                                  <span>{cleanLabel}:</span>
                                  {isRequired && <span className="text-primary text-[11px] font-normal">{lang === 'ar' ? '* إجباري' : '* Required'}</span>}
                                </label>
                                <textarea
                                  rows={2}
                                  value={customFieldValues[key] || ""}
                                  onChange={(e) => setCustomFieldValues({ ...customFieldValues, [key]: e.target.value })}
                                  placeholder={lang === 'ar' ? `أدخل ${cleanLabel}...` : `Enter ${cleanLabel}...`}
                                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm dir-ltr"
                                  required={isRequired}
                                />
                                {fieldDesc && (
                                  <p className="text-[11px] text-on-surface-variant/80 flex items-center gap-1 mt-0.5">
                                    <span className="material-symbols-outlined text-xs text-primary">info</span>
                                    <span>{fieldDesc}</span>
                                  </p>
                                )}
                              </div>
                            );
                          }

                          // حقل نصي عادي / كلمة مرور / إيميل / سيريال
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
                              {fieldDesc && (
                                <p className="text-[11px] text-on-surface-variant/80 flex items-center gap-1 mt-0.5">
                                  <span className="material-symbols-outlined text-xs text-primary">info</span>
                                  <span>{fieldDesc}</span>
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // ── حالة: خدمة سيرفر عامة لا تتطلب حقول مخصصة إجبارية من المزود
            return (
              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                    <span>{lang === 'ar' ? 'بيانات الحساب / المعرف المستهدف (اسم المستخدم، البريد، أو السيريال)' : 'Target Account / Username / Email / Serial'}</span>
                    <span className="text-on-surface-variant text-[11px] font-normal">{lang === 'ar' ? '(اختياري/حسب نوع الخدمة)' : '(Optional)'}</span>
                  </label>
                  <input
                    type="text"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    placeholder={lang === 'ar' ? 'أدخل اسم المستخدم أو الإيميل أو المعرف المستهدف للخدمة...' : 'Enter target username, email or device ID...'}
                    className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3.5 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm dir-ltr"
                  />
                </div>
                <p className="text-[11px] text-primary/90 flex items-center gap-1.5 px-1">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  <span>{lang === 'ar' ? 'إذا كانت الخدمة تتطلب ربط حساب أو تفعيل، يرجى كتابة اسم الحساب أعلاه.' : 'If this service requires account binding, enter the account details above.'}</span>
                </p>
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
                <span>
                  {isFreeService
                    ? (lang === 'ar' ? 'تأكيد وإرسال الطلب (مجاناً 🎁)' : 'Confirm & Send Order (Free 🎁)')
                    : (lang === 'ar' ? `تأكيد وإرسال الطلب ($${totalPrice.toFixed(2)} USD)` : `Confirm & Send Order ($${totalPrice.toFixed(2)} USD)`)}
                </span>
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
