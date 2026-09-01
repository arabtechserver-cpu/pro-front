import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";

export default async function Contact({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);

  return (
    <div className="flex flex-col gap-12 pb-12">
      <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center border border-outline-variant/30 mb-6 shadow-[0_0_15px_rgba(87,241,219,0.1)]">
          <span className="material-symbols-outlined text-[32px] text-primary glow-cyan">support_agent</span>
        </div>
        <h1 className="font-display-lg-mobile text-4xl font-bold text-on-surface mb-4">{dict.contact.title}</h1>
        <p className="text-on-surface-variant">
          {dict.contact.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Support Channel 1 */}
        <a href="https://wa.me/16728972935" target="_blank" rel="noopener noreferrer" className="glass-card rounded-2xl p-5 text-center flex flex-col items-center gap-3 hover:-translate-y-1.5 hover:border-emerald-500/50 transition-all duration-300 shadow-md group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.148-1.348c1.472.802 3.13 1.224 4.863 1.225h.005c5.505 0 9.989-4.478 9.99-9.985 0-2.668-1.039-5.176-2.927-7.062A9.923 9.923 0 0 0 12.012 2zm.005 16.521h-.004c-1.493 0-2.957-.401-4.232-1.157l-.304-.18-3.146.825.839-3.067-.198-.315c-.832-1.323-1.272-2.859-1.272-4.436 0-4.492 3.656-8.147 8.152-8.147 2.176 0 4.221.848 5.76 2.387a8.096 8.096 0 0 1 2.384 5.763c0 4.493-3.656 8.147-8.152 8.147zm4.469-6.108c-.245-.123-1.452-.716-1.677-.798-.225-.082-.389-.123-.553.123-.164.246-.635.798-.778.962-.143.164-.286.184-.531.062-.245-.123-1.037-.382-1.976-1.219-.73-.651-1.223-1.455-1.366-1.7-.143-.246-.015-.379.108-.501.111-.11.245-.286.368-.429.123-.143.164-.246.245-.409.082-.164.041-.307-.02-.429-.062-.123-.553-1.332-.757-1.822-.204-.49-.409-.419-.553-.429h-.471c-.164 0-.429.062-.654.307-.225.246-.86.84-.86 2.05 0 1.209.88 2.373 1.002 2.537.123.164 1.733 2.646 4.198 3.712.586.254 1.044.406 1.401.52.59.187 1.127.16 1.551.097.473-.07 1.452-.593 1.656-1.166.204-.573.204-1.064.143-1.166-.061-.102-.225-.164-.47-.287z"/></svg>
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-base">{params.lang === "ar" ? "واتساب الإدارة 1" : "WhatsApp Admin 1"}</h3>
            <p className="text-xs text-emerald-400 font-mono mt-1 font-bold" dir="ltr">+1 (672) 897-2935</p>
          </div>
          <div className="mt-auto pt-2">
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{params.lang === "ar" ? "استجابة سريعة" : "Fast Support"}</span>
          </div>
        </a>
        
        {/* Support Channel 2 */}
        <a href="https://wa.me/249123667227" target="_blank" rel="noopener noreferrer" className="glass-card rounded-2xl p-5 text-center flex flex-col items-center gap-3 hover:-translate-y-1.5 hover:border-emerald-500/50 transition-all duration-300 shadow-md group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.148-1.348c1.472.802 3.13 1.224 4.863 1.225h.005c5.505 0 9.989-4.478 9.99-9.985 0-2.668-1.039-5.176-2.927-7.062A9.923 9.923 0 0 0 12.012 2zm.005 16.521h-.004c-1.493 0-2.957-.401-4.232-1.157l-.304-.18-3.146.825.839-3.067-.198-.315c-.832-1.323-1.272-2.859-1.272-4.436 0-4.492 3.656-8.147 8.152-8.147 2.176 0 4.221.848 5.76 2.387a8.096 8.096 0 0 1 2.384 5.763c0 4.493-3.656 8.147-8.152 8.147zm4.469-6.108c-.245-.123-1.452-.716-1.677-.798-.225-.082-.389-.123-.553.123-.164.246-.635.798-.778.962-.143.164-.286.184-.531.062-.245-.123-1.037-.382-1.976-1.219-.73-.651-1.223-1.455-1.366-1.7-.143-.246-.015-.379.108-.501.111-.11.245-.286.368-.429.123-.143.164-.246.245-.409.082-.164.041-.307-.02-.429-.062-.123-.553-1.332-.757-1.822-.204-.49-.409-.419-.553-.429h-.471c-.164 0-.429.062-.654.307-.225.246-.86.84-.86 2.05 0 1.209.88 2.373 1.002 2.537.123.164 1.733 2.646 4.198 3.712.586.254 1.044.406 1.401.52.59.187 1.127.16 1.551.097.473-.07 1.452-.593 1.656-1.166.204-.573.204-1.064.143-1.166-.061-.102-.225-.164-.47-.287z"/></svg>
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-base">{params.lang === "ar" ? "واتساب الإدارة 2" : "WhatsApp Admin 2"}</h3>
            <p className="text-xs text-emerald-400 font-mono mt-1 font-bold" dir="ltr">+249 12 366 7227</p>
          </div>
          <div className="mt-auto pt-2">
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{params.lang === "ar" ? "متاح دائماً" : "Always Available"}</span>
          </div>
        </a>

        {/* Support Channel 3 */}
        <a href="https://t.me/arabtechserveronline" target="_blank" rel="noopener noreferrer" className="glass-card rounded-2xl p-5 text-center flex flex-col items-center gap-3 hover:-translate-y-1.5 hover:border-sky-500/50 transition-all duration-300 shadow-md group">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/30 text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.763-.169.711-.43 1.05-.683 1.073-.55.05-1.042-.366-1.575-.716-.834-.547-1.306-.888-2.116-1.421-.937-.618-.329-.958.204-1.512.14-.145 2.569-2.356 2.616-2.557.006-.025.011-.122-.047-.173-.058-.051-.144-.034-.206-.02-.089.02-1.501.954-4.238 2.802-.401.275-.764.41-1.089.403-.358-.008-1.047-.202-1.56-.369-.629-.205-1.129-.313-1.085-.661.023-.182.274-.369.753-.561 2.955-1.287 4.927-2.137 5.914-2.548 2.822-1.173 3.407-1.377 3.79-1.384.084-.001.272.02.394.119.103.084.132.197.145.276.014.08.03.26-.002.434z"/></svg>
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-base">{params.lang === "ar" ? "قناة ودعم تيليجرام" : "Telegram Channel"}</h3>
            <p className="text-xs text-sky-400 font-mono mt-1" dir="ltr">@arabtechserveronline</p>
          </div>
          <div className="mt-auto pt-2">
            <span className="text-[11px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">{params.lang === "ar" ? "تحديثات وسيرفر" : "Channel & Bot"}</span>
          </div>
        </a>

        {/* Support Channel 4 */}
        <a href="https://chat.whatsapp.com/DINRDwU2lVjFcGRowxT3m5" target="_blank" rel="noopener noreferrer" className="glass-card rounded-2xl p-5 text-center flex flex-col items-center gap-3 hover:-translate-y-1.5 hover:border-primary/50 transition-all duration-300 shadow-md group">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/30 text-primary group-hover:bg-primary group-hover:text-black transition-all">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-base">{params.lang === "ar" ? "مجتمع الواتساب" : "WhatsApp Community"}</h3>
            <p className="text-xs text-primary mt-1">{params.lang === "ar" ? "انضم لمجتمع الفنيين" : "Join Resellers"}</p>
          </div>
          <div className="mt-auto pt-2">
            <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">+2000 فني ووكيل</span>
          </div>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
        {/* Ticket Form */}
        <div className="glass-card rounded-2xl p-8 border border-outline-variant/30">
          <h2 className="font-headline-md text-2xl text-on-surface mb-6">{dict.contact.openTicket}</h2>
          <form className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-label-sm text-on-surface-variant uppercase tracking-wider">{dict.contact.name}</label>
                <input type="text" className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-label-sm text-on-surface-variant uppercase tracking-wider">{dict.contact.email}</label>
                <input type="email" className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-label-sm text-on-surface-variant uppercase tracking-wider">{dict.contact.department}</label>
              <select className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all appearance-none">
                <option value="general">General Inquiry</option>
                <option value="sales">Sales & Bulk Pricing</option>
                <option value="api">API Technical Support</option>
                <option value="order">Order Issue (Provide IMEI)</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-label-sm text-on-surface-variant uppercase tracking-wider">{dict.contact.message}</label>
              <textarea rows={5} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"></textarea>
            </div>
            
            <button type="button" className="w-full mt-2 bg-primary-container text-on-primary-container py-3.5 rounded-lg font-bold uppercase tracking-wider hover:bg-primary transition-all glow-primary shadow-[0_0_15px_rgba(45,212,191,0.2)] active:scale-[0.98]">
              {dict.contact.send}
            </button>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="flex flex-col gap-6">
          <h2 className="font-headline-md text-2xl text-on-surface">{dict.contact.faqTitle}</h2>
          
          <div className="flex flex-col gap-4">
            <div className="glass-card p-5 rounded-lg border border-outline-variant/30 cursor-pointer group hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-center">
                 <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">How long do IMEI unlocks take?</h4>
                 <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">expand_more</span>
              </div>
            </div>
            
            <div className="glass-card p-5 rounded-lg border border-primary/50 cursor-pointer">
              <div className="flex justify-between items-center mb-3">
                 <h4 className="font-bold text-primary">Can I get a refund for a wrong IMEI?</h4>
                 <span className="material-symbols-outlined text-primary">expand_less</span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                No, unfortunately we cannot issue refunds for incorrect IMEI submissions. Our API sends the request directly to the source database immediately upon submission. Please double-check all IMEI numbers by dialing *#06# before placing an order.
              </p>
            </div>
            
            <div className="glass-card p-5 rounded-lg border border-outline-variant/30 cursor-pointer group hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-center">
                 <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">How do I access the Reseller API?</h4>
                 <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">expand_more</span>
              </div>
            </div>
            
            <div className="glass-card p-5 rounded-lg border border-outline-variant/30 cursor-pointer group hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-center">
                 <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">What payment methods do you accept?</h4>
                 <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">expand_more</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
