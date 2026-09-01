"use client";

import { useState, useEffect } from "react";

interface MembershipTier {
  id: string;
  name: string;
  nameAr?: string;
  minDeposit: number;
  discountPercentage: number;
  badgeColor?: string;
  description?: string;
  isDefault: boolean;
  _count?: {
    users: number;
  };
}

interface UserItem {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  country: string;
  balance: number;
  status: string;
  customDiscount: number;
  membershipTierId?: string | null;
  membershipTier?: MembershipTier | null;
  createdAt: string;
}

export default function AdminMembershipsPage() {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tiers" | "users">("tiers");
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");

  // Modal States for Tiers
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<MembershipTier | null>(null);
  const [tierForm, setTierForm] = useState({
    name: "",
    nameAr: "",
    minDeposit: "100",
    discountPercentage: "10",
    badgeColor: "#fbbf24",
    description: "",
    isDefault: false
  });
  const [savingTier, setSavingTier] = useState(false);

  // Modal State for User Assignment
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [userTierId, setUserTierId] = useState<string>("");
  const [userCustomDiscount, setUserCustomDiscount] = useState<string>("0");
  const [savingUser, setSavingUser] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tiersRes, usersRes] = await Promise.all([
        fetch("/api/memberships"),
        fetch("/api/memberships/users")
      ]);

      const tiersData = await tiersRes.json();
      const usersData = await usersRes.json();

      if (tiersData.success && tiersData.tiers) {
        setTiers(tiersData.tiers);
      }
      if (usersData.success && usersData.users) {
        setUsers(usersData.users);
      }
    } catch (err) {
      console.error("Failed to load memberships data:", err);
      showToast("فشل في تحميل بيانات العضويات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateTierModal = () => {
    setEditingTier(null);
    setTierForm({
      name: "",
      nameAr: "",
      minDeposit: "100",
      discountPercentage: "10",
      badgeColor: "#fbbf24",
      description: "",
      isDefault: false
    });
    setTierModalOpen(true);
  };

  const openEditTierModal = (tier: MembershipTier) => {
    setEditingTier(tier);
    setTierForm({
      name: tier.name,
      nameAr: tier.nameAr || tier.name,
      minDeposit: tier.minDeposit.toString(),
      discountPercentage: tier.discountPercentage.toString(),
      badgeColor: tier.badgeColor || "#2dd4bf",
      description: tier.description || "",
      isDefault: tier.isDefault
    });
    setTierModalOpen(true);
  };

  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingTier(true);
      const payload: any = {
        name: tierForm.name,
        nameAr: tierForm.nameAr,
        minDeposit: parseFloat(tierForm.minDeposit) || 0,
        discountPercentage: parseFloat(tierForm.discountPercentage) || 0,
        badgeColor: tierForm.badgeColor,
        description: tierForm.description,
        isDefault: tierForm.isDefault
      };
      if (editingTier) {
        payload.id = editingTier.id;
      }

      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showToast(editingTier ? "تم تحديث العضوية بنجاح" : "تم إنشاء العضوية الجديدة بنجاح");
        setTierModalOpen(false);
        fetchData();
      } else {
        showToast(data.error || "فشل في حفظ العضوية", "error");
      }
    } catch (err) {
      showToast("حدث خطأ أثناء حفظ العضوية", "error");
    } finally {
      setSavingTier(false);
    }
  };

  const handleDeleteTier = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف العضوية: "${name}"؟ سيتم إلغاء ارتباط المستخدمين بها.`)) return;

    try {
      const res = await fetch(`/api/memberships/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("تم حذف العضوية بنجاح");
        fetchData();
      } else {
        showToast(data.error || "فشل في حذف العضوية", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء حذف العضوية", "error");
    }
  };

  const openAssignUserModal = (user: UserItem) => {
    setSelectedUser(user);
    setUserTierId(user.membershipTierId || "none");
    setUserCustomDiscount((user.customDiscount || 0).toString());
    setUserModalOpen(true);
  };

  const handleSaveUserAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setSavingUser(true);
      const res = await fetch("/api/memberships/assign-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          membershipTierId: userTierId === "none" ? null : userTierId,
          customDiscount: parseFloat(userCustomDiscount) || 0
        })
      });
      const data = await res.json();

      if (data.success) {
        showToast(`تم تحديث عضوية العميل (${selectedUser.fullName}) بنجاح`);
        setUserModalOpen(false);
        fetchData();
      } else {
        showToast(data.error || "فشل في تحديث عضوية العميل", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء التحديث", "error");
    } finally {
      setSavingUser(false);
    }
  };

  const handleQuickAssignTier = async (userId: string, tierId: string) => {
    try {
      const res = await fetch("/api/memberships/assign-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          membershipTierId: tierId === "none" ? null : tierId
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("تم تحديث العضوية فوراً");
        setUsers(prev => prev.map(u => u.id === userId ? {
          ...u,
          membershipTierId: tierId === "none" ? null : tierId,
          membershipTier: tiers.find(t => t.id === tierId) || null
        } : u));
      } else {
        showToast(data.error || "فشل في التحديث", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء التحديث", "error");
    }
  };

  // Filtered Users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery));

    const matchesTier =
      tierFilter === "all" ||
      (tierFilter === "none" && !user.membershipTierId) ||
      user.membershipTierId === tierFilter;

    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 left-6 z-50 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toast.type === "success"
            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
            : "bg-red-500/20 border-red-500/40 text-red-300"
        }`}>
          <span className="material-symbols-outlined">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="font-bold text-sm">{toast.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-high/40 p-6 rounded-3xl border border-outline-variant/20 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-2xl">card_membership</span>
            <h1 className="text-2xl font-bold font-display text-on-surface">إدارة العضويات ونسب الخصومات (VIP)</h1>
          </div>
          <p className="text-xs text-on-surface-variant">
            تحكم في مستويات العضوية (مثال: شحن 100$ بخصم 10%) وتعيين الخصومات المباشرة للعملاء المسجلين.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateTierModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-xs hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:scale-[1.02] transition-all"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>إضافة مستوى عضوية جديد</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
        <button
          onClick={() => setActiveTab("tiers")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "tiers"
              ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
              : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-base">military_tech</span>
          <span>مستويات العضوية والخصومات ({tiers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "users"
              ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
              : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-base">group</span>
          <span>المستخدمون وتعيين العضويات ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: MEMBERSHIP TIERS */}
      {activeTab === "tiers" && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary mb-2">progress_activity</span>
              <p>جاري تحميل مستويات العضوية...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="glass-card rounded-3xl p-6 border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-all shadow-xl"
                  style={{
                    background: `linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(${parseInt(tier.badgeColor?.slice(1,3) || '45', 16)}, ${parseInt(tier.badgeColor?.slice(3,5) || '212', 16)}, ${parseInt(tier.badgeColor?.slice(5,7) || '191', 16)}, 0.08) 100%)`
                  }}
                >
                  {/* Top Badge */}
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: tier.badgeColor || "#2dd4bf" }}
                      >
                        <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                      </div>
                      
                      {tier.isDefault && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                          افتراضية للجدد
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-on-surface mb-1">
                      {tier.nameAr || tier.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant font-mono mb-4">
                      {tier.name}
                    </p>

                    {/* Discount & Min Deposit Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/10">
                        <span className="text-xs text-on-surface-variant font-medium">نسبة الخصم</span>
                        <span className="text-base font-extrabold text-emerald-400 font-mono">
                          {tier.discountPercentage}% خصم
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/10">
                        <span className="text-xs text-on-surface-variant font-medium">الحد الأدنى للشحن</span>
                        <span className="text-xs font-bold text-primary font-mono">
                          {tier.minDeposit > 0 ? `$${tier.minDeposit} USD` : "مجاني / بدون حد"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/10">
                        <span className="text-xs text-on-surface-variant font-medium">المستخدمين الحاليين</span>
                        <span className="text-xs font-bold text-on-surface font-mono">
                          {tier._count?.users || 0} عميل
                        </span>
                      </div>
                    </div>

                    {tier.description && (
                      <p className="text-[11px] text-on-surface-variant line-clamp-2 mb-4">
                        {tier.description}
                      </p>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-outline-variant/20">
                    <button
                      onClick={() => openEditTierModal(tier)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-surface-container-high text-xs font-bold text-on-surface hover:bg-primary hover:text-on-primary transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>تعديل</span>
                    </button>
                    {!tier.isDefault && (
                      <button
                        onClick={() => handleDeleteTier(tier.id, tier.nameAr || tier.name)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                        title="حذف العضوية"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USERS MEMBERSHIP ASSIGNMENT */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Filters and Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface-container-high/30 p-4 rounded-2xl border border-outline-variant/20">
            <div className="relative md:col-span-2">
              <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="بحث بالاسم أو اسم المستخدم أو البريد الإلكتروني أو الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-surface-container-highest/60 border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-highest/60 border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
              >
                <option value="all">كل مستويات العضوية</option>
                <option value="none">بدون عضوية محددة</option>
                {tiers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nameAr || t.name} ({t.discountPercentage}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="glass-card rounded-3xl border border-outline-variant/20 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-surface-container-high/80 text-on-surface-variant font-bold border-b border-outline-variant/20">
                  <tr>
                    <th className="p-4">العميل</th>
                    <th className="p-4">رصيد المحفظة</th>
                    <th className="p-4">مستوى العضوية الحالية</th>
                    <th className="p-4">خصم العضوية</th>
                    <th className="p-4">خصم إضافي مخصص</th>
                    <th className="p-4">الخصم الفعلي الإجمالي</th>
                    <th className="p-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                        لم يتم العثور على أي مستخدمين مطابقين للبحث.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const effectiveDiscount = Math.max(
                        u.customDiscount || 0,
                        u.membershipTier?.discountPercentage || 0
                      );
                      return (
                        <tr key={u.id} className="hover:bg-surface-container-high/40 transition-colors">
                          {/* User Info */}
                          <td className="p-4">
                            <div className="font-bold text-on-surface text-sm">{u.fullName}</div>
                            <div className="text-[11px] text-primary font-mono">@{u.username}</div>
                            <div className="text-[10px] text-on-surface-variant">{u.email}</div>
                          </td>

                          {/* Balance */}
                          <td className="p-4">
                            <span className="font-mono font-bold text-primary text-sm">
                              ${u.balance.toFixed(2)} USD
                            </span>
                          </td>

                          {/* Quick Assign Dropdown */}
                          <td className="p-4">
                            <select
                              value={u.membershipTierId || "none"}
                              onChange={(e) => handleQuickAssignTier(u.id, e.target.value)}
                              className="px-3 py-1.5 rounded-xl bg-surface-container-highest border border-outline-variant/30 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary transition-all"
                            >
                              <option value="none">افتراضي / بدون</option>
                              {tiers.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.nameAr || t.name} ({t.discountPercentage}%)
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Tier Discount */}
                          <td className="p-4 font-mono font-bold text-on-surface">
                            {u.membershipTier ? `${u.membershipTier.discountPercentage}%` : "0%"}
                          </td>

                          {/* Custom Extra Discount */}
                          <td className="p-4 font-mono text-secondary font-bold">
                            {u.customDiscount > 0 ? `+${u.customDiscount}%` : "0%"}
                          </td>

                          {/* Effective Total Discount */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono font-extrabold text-xs ${
                              effectiveDiscount > 0
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}>
                              {effectiveDiscount > 0 ? `🔥 ${effectiveDiscount}% خصم` : "سعر أساسي (0%)"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-center">
                            <button
                              onClick={() => openAssignUserModal(u)}
                              className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-on-primary font-bold text-xs transition-all flex items-center gap-1 mx-auto"
                            >
                              <span className="material-symbols-outlined text-sm">tune</span>
                              <span>تخصيص الخصم</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT MEMBERSHIP TIER */}
      {tierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card bg-surface-container-lowest/95 rounded-3xl border border-outline-variant/30 p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">workspace_premium</span>
                <h2 className="text-xl font-bold font-display text-on-surface">
                  {editingTier ? "تعديل مستوى العضوية" : "إضافة مستوى عضوية جديد"}
                </h2>
              </div>
              <button
                onClick={() => setTierModalOpen(false)}
                className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveTier} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  اسم العضوية (عربي) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عضوية VIP الذهبية (100$)"
                  value={tierForm.nameAr}
                  onChange={(e) => setTierForm({ ...tierForm, nameAr: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-highest/80 border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  اسم العضوية (إنجليزي) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Gold VIP ($100)"
                  value={tierForm.name}
                  onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-highest/80 border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">
                    نسبة الخصم المئوية (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      required
                      value={tierForm.discountPercentage}
                      onChange={(e) => setTierForm({ ...tierForm, discountPercentage: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-highest/80 border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">
                    مبلغ الشحن المطلوب ($ USD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={tierForm.minDeposit}
                      onChange={(e) => setTierForm({ ...tierForm, minDeposit: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-highest/80 border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">$</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  لون شارة العضوية
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={tierForm.badgeColor}
                    onChange={(e) => setTierForm({ ...tierForm, badgeColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={tierForm.badgeColor}
                    onChange={(e) => setTierForm({ ...tierForm, badgeColor: e.target.value })}
                    className="flex-1 px-4 py-2 rounded-xl bg-surface-container-highest/80 border border-outline-variant/30 text-xs text-on-surface font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  وصف العضوية ومميزاتها
                </label>
                <textarea
                  rows={2}
                  placeholder="وصف مختصر لمميزات العضوية..."
                  value={tierForm.description}
                  onChange={(e) => setTierForm({ ...tierForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-highest/80 border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefaultTier"
                  checked={tierForm.isDefault}
                  onChange={(e) => setTierForm({ ...tierForm, isDefault: e.target.checked })}
                  className="rounded border-outline-variant/40 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isDefaultTier" className="text-xs font-semibold text-on-surface cursor-pointer">
                  تعيين كعضوية افتراضية لكافة المسجلين الجدد
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setTierModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-surface-container-high text-xs font-bold text-on-surface-variant hover:text-on-surface transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingTier}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {savingTier ? "جاري الحفظ..." : "حفظ العضوية"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN USER CUSTOM DISCOUNT & TIER */}
      {userModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card bg-surface-container-lowest/95 rounded-3xl border border-outline-variant/30 p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div>
                <h2 className="text-lg font-bold text-on-surface">
                  تخصيص عضوية وخصم العميل
                </h2>
                <p className="text-xs text-primary font-mono">@{selectedUser.username} ({selectedUser.fullName})</p>
              </div>
              <button
                onClick={() => setUserModalOpen(false)}
                className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveUserAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  اختر مستوى العضوية
                </label>
                <select
                  value={userTierId}
                  onChange={(e) => setUserTierId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-highest/80 border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary font-semibold"
                >
                  <option value="none">بدون عضوية مخصصة</option>
                  {tiers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nameAr || t.name} — خصم {t.discountPercentage}% (شحن ${t.minDeposit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  خصم مخصص إضافي (%) لهذا العميل تحديداً
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={userCustomDiscount}
                    onChange={(e) => setUserCustomDiscount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-highest/80 border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">%</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1">
                  سيتم تطبيق الخصم الأكبر تلقائياً على كافة طلبات وخدمات العميل.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-surface-container-high text-xs font-bold text-on-surface-variant hover:text-on-surface transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {savingUser ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
