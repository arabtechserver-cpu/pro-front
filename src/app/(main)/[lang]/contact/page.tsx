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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Support Channel 1 */}
        <a href="https://api.whatsapp.com/send/?phone=16728972935&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="glass-card rounded-xl p-6 text-center flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <span className="material-symbols-outlined text-emerald-500 text-xl">chat</span>
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-lg">WhatsApp Support</h3>
            <p className="text-sm text-on-surface-variant mt-1">Instant chat support for quick queries.</p>
          </div>
          <div className="mt-auto pt-4">
            <span className="text-xs font-label-sm text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Avg Response: 5 Mins</span>
          </div>
        </a>
        
        {/* Support Channel 2 */}
        <a href="mailto:arabtechsupport1@gmail.com" className="glass-card rounded-xl p-6 text-center flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300 border-secondary/30">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20">
            <span className="material-symbols-outlined text-secondary text-xl">mark_email_unread</span>
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-lg">Email Ticketing</h3>
            <p className="text-sm text-on-surface-variant mt-1">arabtechsupport1@gmail.com</p>
          </div>
          <div className="mt-auto pt-4">
            <span className="text-xs font-label-sm text-secondary bg-secondary/10 px-2 py-1 rounded">Avg Response: 2 Hours</span>
          </div>
        </a>

        {/* Support Channel 3 */}
        <div className="glass-card rounded-xl p-6 text-center flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300 border-tertiary/30">
          <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center border border-tertiary/20">
            <span className="material-symbols-outlined text-tertiary text-xl">groups</span>
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-lg">Community Forum</h3>
            <p className="text-sm text-on-surface-variant mt-1">Join our active reseller community.</p>
          </div>
          <div className="mt-auto pt-4">
            <span className="text-xs font-label-sm text-tertiary bg-tertiary/10 px-2 py-1 rounded">2,000+ Members</span>
          </div>
        </div>
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
