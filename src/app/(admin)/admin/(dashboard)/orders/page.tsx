import { cookies } from "next/headers";

async function getOrders() {
  const token = cookies().get('admin_token')?.value;
  try {
    const res = await fetch('https://api.arabtechproserver.tech/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.orders)) return data.orders;
    return [];
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

export default async function AdminOrders() {
  const ordersList = await getOrders();
  const safeOrders = Array.isArray(ordersList) ? ordersList : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-on-surface mb-2">طلبات العملاء</h1>
        <p className="text-on-surface-variant">عرض وإدارة طلبات خدمات IMEI والسيرفر</p>
      </div>

      <div className="glass-card rounded-3xl border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-surface-variant/50 text-on-surface-variant text-sm font-medium">
                <th className="p-4 border-b border-outline-variant/30">رقم الطلب</th>
                <th className="p-4 border-b border-outline-variant/30">العميل</th>
                <th className="p-4 border-b border-outline-variant/30">اسم الخدمة</th>
                <th className="p-4 border-b border-outline-variant/30">IMEI / البيانات</th>
                <th className="p-4 border-b border-outline-variant/30">النتيجة / الكود</th>
                <th className="p-4 border-b border-outline-variant/30">السعر</th>
                <th className="p-4 border-b border-outline-variant/30">الحالة</th>
                <th className="p-4 border-b border-outline-variant/30">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {safeOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-on-surface-variant">
                    لا توجد طلبات حتي الآن.
                  </td>
                </tr>
              ) : (
                safeOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors">
                    <td className="p-4 font-mono text-xs">{order.id ? order.id.slice(0, 8) : "N/A"}</td>
                    <td className="p-4 text-xs font-bold">
                      {order.user?.fullName || order.user?.email || "عميل"}
                    </td>
                    <td className="p-4 text-xs max-w-[200px] truncate">{order.serviceName || order.serviceId || "خدمة"}</td>
                    <td className="p-4 font-mono text-xs dir-ltr text-right max-w-[200px] truncate">{order.targetInput || order.imei || "-"}</td>
                    <td className="p-4 font-mono text-xs text-primary font-bold">{order.reply || "-"}</td>
                    <td className="p-4 text-primary font-bold text-xs">${(order.price || 0).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                        order.status === 'completed' ? 'bg-primary/20 text-primary' : 
                        order.status === 'pending' ? 'bg-secondary/20 text-secondary' : 
                        'bg-error/20 text-error'
                      }`}>
                        {order.status === 'completed' ? 'مكتمل' : 
                         order.status === 'pending' ? 'قيد الانتظار' : 
                         'مرفوض'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-on-surface-variant">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("ar-EG") : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
