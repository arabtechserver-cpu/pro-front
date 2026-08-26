"use client";

import { useState, useEffect } from "react";

export default function ServicesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State to manage expanded packages (groupNames)
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});

  const [editingService, setEditingService] = useState<any | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dhru/services");
      if (!res.ok) {
        throw new Error("Failed to fetch services");
      }
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEditSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingService) return;
    
    // In a real app, you would send a PUT request to update the DhruService in the database.
    // For now, we will simulate closing the modal.
    alert("سيتم إضافة API التحديث قريباً.");
    setEditingService(null);
  };

  const toggleVisibility = async (service: any) => {
    // In a real app, send a request to toggle `isActive` flag in DB.
    alert("سيتم إضافة API التحديث قريباً لإخفاء/إظهار الخدمة.");
  };

  const togglePackage = (packageKey: string) => {
    setExpandedPackages(prev => ({
      ...prev,
      [packageKey]: !prev[packageKey]
    }));
  };

  // Group services by groupName
  const getGroupedServices = (services: any[]) => {
    const groups: Record<string, any[]> = {};
    services.forEach(service => {
      if (!groups[service.groupName]) {
        groups[service.groupName] = [];
      }
      groups[service.groupName].push(service);
    });
    return groups;
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-on-surface mb-6">تعديل الخدمة</h3>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">اسم الخدمة للعميل</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingService.name} 
                  className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">هامش الربح (Margin $)</label>
                <input 
                  type="number" 
                  name="margin" 
                  step="0.01" 
                  defaultValue={editingService.margin} 
                  className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none transition-all" 
                />
                <p className="text-xs text-on-surface-variant mt-2">التكلفة الأصلية من المزود: ${editingService.credit}</p>
                <p className="text-xs text-primary mt-1 font-bold">إجمالي السعر للعميل: ${(editingService.credit + editingService.margin).toFixed(2)}</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold hover:shadow-lg transition-all">حفظ التعديلات</button>
                <button type="button" onClick={() => setEditingService(null)} className="flex-1 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-display font-bold text-on-surface mb-2">الخدمات والأقسام</h1>
        <p className="text-on-surface-variant">تم جلب الخدمات وتصنيفها إلى {categories.length} أقسام رئيسية</p>
      </div>

      <div className="w-full">
        {loading && (
          <div className="flex justify-center p-12 text-primary bg-surface-container rounded-3xl border border-outline-variant/30">
            <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-error/10 text-error rounded-xl border border-error/20 flex items-center gap-2 font-medium">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="space-y-8">
            {categories.map((category: any, idx: number) => {
              const groupedServices = getGroupedServices(category.services);
              
              return (
                <div key={idx} className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 md:p-8">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-outline-variant/30">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-2xl">
                        {category.name.includes('IMEI') ? 'phone_iphone' : category.name.includes('Server') ? 'dns' : 'remote_access'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-on-surface">{category.name}</h3>
                      <p className="text-on-surface-variant text-sm mt-1">{category.services.length} خدمة متوفرة</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {Object.keys(groupedServices).map((groupName, groupIdx) => {
                      const packageServices = groupedServices[groupName];
                      const packageKey = `${category.id}-${groupName}`;
                      const isExpanded = expandedPackages[packageKey] || false;
                      const visibleServices = isExpanded ? packageServices : packageServices.slice(0, 3);
                      const hiddenCount = packageServices.length - visibleServices.length;

                      return (
                        <div key={groupIdx} className="bg-surface/50 border border-outline-variant/20 rounded-2xl p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-secondary">folder</span>
                            <h4 className="text-lg font-bold text-on-surface">{groupName}</h4>
                            <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded-md font-bold">
                              {packageServices.length} خدمات
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            {visibleServices.map((service: any) => (
                              <div key={service.id} className={`bg-surface p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${service.isActive ? 'border-outline-variant/30 hover:border-primary/50' : 'border-error/30 opacity-60'}`}>
                                <div>
                                  <div className="font-bold text-on-surface flex items-center gap-2 text-sm">
                                    {service.name}
                                    {!service.isActive && <span className="text-xs bg-error/10 text-error px-2 py-0.5 rounded-md font-medium">مخفي عن العملاء</span>}
                                  </div>
                                  <div className="text-xs text-on-surface-variant mt-2 flex flex-wrap items-center gap-4">
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-secondary">schedule</span> {service.time}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 md:min-w-fit">
                                  <div className="flex flex-col items-end mr-3">
                                    <span className="text-[10px] text-on-surface-variant">السعر للعميل</span>
                                    <div className={`font-bold text-base ${service.margin > 0 ? 'text-secondary' : 'text-primary'}`}>
                                      ${(service.credit + service.margin).toFixed(2)}
                                    </div>
                                  </div>
                                  
                                  <button 
                                    onClick={() => toggleVisibility(service)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${service.isActive ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                                    title={service.isActive ? 'إخفاء' : 'إظهار'}
                                  >
                                    <span className="material-symbols-outlined text-xs">{service.isActive ? 'visibility_off' : 'visibility'}</span>
                                  </button>
                                  
                                  <button 
                                    onClick={() => setEditingService(service)}
                                    className="bg-surface-variant hover:bg-outline-variant/30 text-on-surface px-3 py-1.5 rounded-lg font-medium text-xs transition-colors flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">edit</span> تعديل
                                  </button>
                                </div>
                              </div>
                            ))}
                            
                            {hiddenCount > 0 && !isExpanded && (
                              <button 
                                onClick={() => togglePackage(packageKey)}
                                className="w-full py-2 mt-2 bg-surface hover:bg-surface-variant border border-dashed border-outline-variant/40 rounded-xl text-primary font-bold text-sm transition-colors flex items-center justify-center gap-2"
                              >
                                عرض جميع الخدمات في هذه الباقة ({hiddenCount} إضافية)...
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                              </button>
                            )}
                            
                            {isExpanded && hiddenCount === 0 && packageServices.length > 3 && (
                              <button 
                                onClick={() => togglePackage(packageKey)}
                                className="w-full py-2 mt-2 bg-surface hover:bg-surface-variant border border-dashed border-outline-variant/40 rounded-xl text-on-surface-variant font-bold text-sm transition-colors flex items-center justify-center gap-2"
                              >
                                إخفاء الخدمات الإضافية
                                <span className="material-symbols-outlined text-sm">expand_less</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
