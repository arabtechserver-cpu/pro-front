"use client";

import { useState, useEffect } from "react";

export default function CustomerLogsClient() {
  const [activeTab, setActiveTab] = useState<"orders" | "wallet">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [walletLogs, setWalletLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "orders") {
        // We reuse the existing /api/orders endpoint to list orders
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (res.ok && data.success) {
          setOrders(data.orders || []);
        }
      } else {
        // We reuse the existing /api/transactions endpoint to list wallet deposits
        const res = await fetch("/api/transactions");
        const data = await res.json();
        if (res.ok && data.success) {
          setWalletLogs(data.transactions || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-outline-variant/30">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-1">
            سجل العملاء 📋
          </h1>
          <p className="text-on-surface-variant text-sm">
            متابعة شاملة لجميع طلبات العملاء وحركات المحفظة بالتفصيل.
          </p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-surface-container-high rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${
            activeTab === "orders" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          سجل الطلبات
        </button>
        <button
          onClick={() => setActiveTab("wallet")}
          className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${
            activeTab === "wallet" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          حركات المحفظة
        </button>
      </div>

      <div className="glass-card rounded-3xl border border-outline-variant/30 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 flex justify-center"><span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span></div>
        ) : activeTab === "orders" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-high/60 text-on-surface-variant text-sm border-b border-outline-variant/20">
                  <th className="p-4 text-start font-bold">رقم الطلب</th>
                  <th className="p-4 text-start font-bold">العميل</th>
                  <th className="p-4 text-start font-bold">الخدمة</th>
                  <th className="p-4 text-start font-bold">التكلفة</th>
                  <th className="p-4 text-start font-bold">الحالة</th>
                  <th className="p-4 text-start font-bold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container-high/30">
                    <td className="p-4 font-mono font-bold text-on-surface">{order.id.slice(-6)}</td>
                    <td className="p-4 text-on-surface">{order.user?.fullName || "بدون اسم"}</td>
                    <td className="p-4 text-on-surface">{order.serviceName}</td>
                    <td className="p-4 text-primary font-bold font-mono">{order.price} $</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        order.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                        order.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                        "bg-red-500/10 text-red-400"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-on-surface-variant">{new Date(order.createdAt).toLocaleString("ar-EG")}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-on-surface-variant">لا توجد طلبات.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-high/60 text-on-surface-variant text-sm border-b border-outline-variant/20">
                  <th className="p-4 text-start font-bold">الرقم المرجعي</th>
                  <th className="p-4 text-start font-bold">العميل</th>
                  <th className="p-4 text-start font-bold">المبلغ</th>
                  <th className="p-4 text-start font-bold">الطريقة</th>
                  <th className="p-4 text-start font-bold">الحالة</th>
                  <th className="p-4 text-start font-bold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm">
                {walletLogs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-container-high/30">
                    <td className="p-4 font-mono font-bold text-on-surface">{tx.refNo}</td>
                    <td className="p-4 text-on-surface">{tx.user?.fullName || "بدون اسم"}</td>
                    <td className="p-4 text-emerald-400 font-bold font-mono">+{tx.amount} $</td>
                    <td className="p-4 text-on-surface-variant">{tx.method}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        tx.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                        tx.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                        "bg-red-500/10 text-red-400"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-on-surface-variant">{new Date(tx.createdAt).toLocaleString("ar-EG")}</td>
                  </tr>
                ))}
                {walletLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-on-surface-variant">لا توجد حركات شحن محفظة.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
