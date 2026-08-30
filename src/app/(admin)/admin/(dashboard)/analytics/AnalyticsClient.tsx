"use client";

import { useState, useEffect } from "react";

export default function AnalyticsClient() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics/summary?days=${days}`);
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="p-12 flex justify-center items-center">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-outline-variant/30">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-1">
            إحصائيات النظام
          </h1>
          <p className="text-on-surface-variant text-sm">
            نظرة عامة على أداء المنصة خلال {days} يوماً الماضية
          </p>
        </div>
        <div>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface"
          >
            <option value={7}>آخر 7 أيام</option>
            <option value={30}>آخر 30 يوماً</option>
            <option value={90}>آخر 90 يوماً</option>
          </select>
        </div>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="إجمالي الزوار الفريدين" value={data.uniqueSessions} icon="group" color="sky" />
            <StatCard title="العملاء المسجلين" value={data.totalUsers} icon="person_add" color="emerald" />
            <StatCard title="الطلبات المكتملة والمحتملة" value={data.totalOrders} icon="shopping_cart" color="amber" />
            <StatCard title="زيارات الخدمات" value={data.counts.service_view || 0} icon="visibility" color="fuchsia" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="glass-card p-6 rounded-3xl border border-outline-variant/30">
              <h2 className="text-xl font-bold mb-4">الخدمات الأكثر زيارة (Top 5)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-start border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high/60 text-on-surface-variant text-sm border-b border-outline-variant/20">
                      <th className="p-4 text-start font-bold">اسم الخدمة</th>
                      <th className="p-4 text-start font-bold">عدد الزيارات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-sm">
                    {data.topServices && data.topServices.map((service: any) => (
                      <tr key={service.id} className="hover:bg-surface-container-high/30">
                        <td className="p-4 font-bold text-on-surface">{service.name}</td>
                        <td className="p-4 font-mono text-primary font-bold">{service.views}</td>
                      </tr>
                    ))}
                    {(!data.topServices || data.topServices.length === 0) && (
                      <tr>
                        <td colSpan={2} className="p-8 text-center text-on-surface-variant">
                          لا توجد بيانات كافية لعرضها.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-outline-variant/30">
              <h2 className="text-xl font-bold mb-4">التقرير اليومي للزيارات</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-start border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high/60 text-on-surface-variant text-sm border-b border-outline-variant/20">
                      <th className="p-4 text-start font-bold">التاريخ</th>
                      <th className="p-4 text-start font-bold">تصفح الصفحات</th>
                      <th className="p-4 text-start font-bold">مشاهدة الخدمات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-sm">
                    {data.daily && data.daily.length > 0 ? data.daily.map((dayData: any) => (
                      <tr key={dayData.day} className="hover:bg-surface-container-high/30">
                        <td className="p-4 font-mono text-on-surface">{new Date(dayData.day).toLocaleDateString("ar-EG")}</td>
                        <td className="p-4 font-mono text-sky-400 font-bold">{dayData.page_view || 0}</td>
                        <td className="p-4 font-mono text-fuchsia-400 font-bold">{dayData.service_view || 0}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-on-surface-variant">
                          لا توجد نشاطات مسجلة بعد.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: string, color: 'sky' | 'emerald' | 'amber' | 'fuchsia' }) {
  const colorMap = {
    sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text1: 'text-sky-300', text2: 'text-sky-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text1: 'text-emerald-300', text2: 'text-emerald-400' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text1: 'text-amber-300', text2: 'text-amber-400' },
    fuchsia: { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', text1: 'text-fuchsia-300', text2: 'text-fuchsia-400' }
  };
  const c = colorMap[color];

  return (
    <div className={`p-6 rounded-3xl ${c.bg} border ${c.border} flex items-center justify-between`}>
      <div>
        <p className={`text-sm font-bold ${c.text1}`}>{title}</p>
        <p className={`text-3xl font-bold ${c.text2} font-mono mt-2`}>{value}</p>
      </div>
      <span className={`material-symbols-outlined ${c.text2} text-4xl`}>{icon}</span>
    </div>
  );
}
