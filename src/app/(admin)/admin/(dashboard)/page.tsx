import { cookies } from "next/headers";

async function getAccountInfo() {
  const token = cookies().get('admin_token')?.value;
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('https://api.arabtechproserver.tech/api/dhru/account', {
      headers,
      cache: 'no-store'
    });
    if (!res.ok) return { error: true, message: 'Failed to fetch Dhru account info' };
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch Dhru account info:", error);
    return { error: true, message: 'Connection error' };
  }
}

export default async function AdminDashboard() {
  const accountInfo = await getAccountInfo();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-on-surface mb-2">لوحة التحكم</h1>
        <p className="text-on-surface-variant">نظرة عامة على رصيد واجهة برمجة التطبيقات (API) وإحصائيات النظام</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-outline-variant/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-sm font-medium">رصيد (Dhru API)</p>
            <h3 className="text-2xl font-bold text-on-surface">
              {accountInfo?.error ? "خطأ" : accountInfo?.SUCCESS ? accountInfo.SUCCESS[0]?.credit : "جاري التحميل..."}
            </h3>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-3xl border border-outline-variant/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-xl">
            <span className="material-symbols-outlined">shopping_cart</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-sm font-medium">الطلبات قيد الانتظار</p>
            <h3 className="text-2xl font-bold text-on-surface">0</h3>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-3xl border border-outline-variant/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary text-xl">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-sm font-medium">المستخدمين المسجلين</p>
            <h3 className="text-2xl font-bold text-on-surface">0</h3>
          </div>
        </div>
      </div>
      
      <div className="glass-card p-8 rounded-3xl border border-outline-variant/30">
        <h2 className="text-xl font-bold text-on-surface mb-4">النشاط الأخير</h2>
        <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-3 opacity-50">history</span>
          <p>لا توجد نشاطات لعرضها في الوقت الحالي.</p>
        </div>
      </div>

      {accountInfo?.error && (
        <div className="bg-error/10 border border-error/20 p-4 rounded-xl text-error text-sm mt-4">
          <p className="font-bold mb-1"><span className="material-symbols-outlined align-middle mr-1">error</span> خطأ في الاتصال</p>
          <p>تعذر الاتصال بـ Dhru Fusion API. تأكد من إدراج عنوان IP الخاص بك في القائمة البيضاء ضمن لوحة تحكم Dhru Fusion.</p>
          <p className="mt-2 opacity-80 text-xs">{accountInfo.message}</p>
        </div>
      )}
    </div>
  );
}
