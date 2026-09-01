"use client";

import React, { useState, useRef, useEffect } from 'react';
import { getUserAuthToken } from "../lib/client-auth-token";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "ما هي أسعار تفعيل Borneo Schematics؟",
    "كيف أقوم بشحن رصيد محفظتي؟",
    "أريد أسعار باقات التجار والموزعين VIP",
    "أريد فتح تذكرة دعم فني أو شكوى للإدارة",
    "ما هي شروط وسياسة استرجاع الرصيد؟"
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    moved: false,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: dragPos ? dragPos.x : rect.left,
      initialY: dragPos ? dragPos.y : rect.top,
      moved: false,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - dragRef.current.startX;
      const deltaY = moveEvent.clientY - dragRef.current.startY;

      if (Math.hypot(deltaX, deltaY) > 8) {
        dragRef.current.moved = true;
        setIsDragging(true);

        const newX = Math.max(8, Math.min(window.innerWidth - 90, dragRef.current.initialX + deltaX));
        const newY = Math.max(8, Math.min(window.innerHeight - 110, dragRef.current.initialY + deltaY));
        setDragPos({ x: newX, y: newY });
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setTimeout(() => setIsDragging(false), 50);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleToggleClick = () => {
    if (!dragRef.current.moved) {
      setIsOpen((prev) => !prev);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = JSON.parse(localStorage.getItem('arabtech_ai_history') || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        setMessages(saved.slice(-50));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (messages.length) {
      localStorage.setItem('arabtech_ai_history', JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const token = typeof window !== 'undefined' ? getUserAuthToken(localStorage) : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          message: query,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.error || 'عذراً، حدث خطأ أثناء معالجة الرد.' }]);
      }
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'تعذر الاتصال بالمساعد الذكي حالياً. يمكنك مراسلة الدعم الفني مباشرة على تيليجرام: @ARABTECHSUPPURT2 أو واتساب: +16728972935' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('arabtech_ai_history');
    }
  };

  // Helper to render Markdown-like text safely with interactive button links
  const renderMessageContent = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');
    return lines.map((rawLine, idx) => {
      let line = rawLine.trim();

      // Empty line
      if (!line) return <div key={idx} className="h-1" />;

      // Markdown separator line (--- or ***)
      if (/^[-*_]{3,}$/.test(line)) {
        return <hr key={idx} className="border-t border-outline-variant/30 my-2" />;
      }

      // Collect link buttons into placeholder tokens to prevent regex collision and nested tags
      const linkMap: { id: string; html: string }[] = [];
      let tempLine = line;

      // 1. Convert Markdown links [Title](URL)
      tempLine = tempLine.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, url) => {
        const token = `___LINK_TOKEN_${linkMap.length}___`;
        linkMap.push({
          id: token,
          html: `<a href="${url}" target="_blank" rel="noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1 my-1 bg-primary/20 hover:bg-primary text-cyan-300 hover:text-white border border-primary/40 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 no-underline"><span>${label}</span> <span class="text-[10px]">↗</span></a>`
        });
        return token;
      });

      // 2. Convert Raw Standalone URLs (https://...)
      tempLine = tempLine.replace(/(https?:\/\/[^\s<"'>]+)/g, (url) => {
        const token = `___LINK_TOKEN_${linkMap.length}___`;
        let displayLabel = 'زيارة الرابط';
        if (url.includes('wa.me')) displayLabel = '📱 محادثة واتساب الدعم';
        else if (url.includes('t.me')) displayLabel = '💬 تيليجرام الدعم الفني';
        else if (url.includes('arabtechproserver.tech/pricing')) displayLabel = '🛒 صفحة الأسعار والطلب';
        else if (url.includes('arabtechproserver.tech')) displayLabel = '🌐 الموقع الرسمي';

        linkMap.push({
          id: token,
          html: `<a href="${url}" target="_blank" rel="noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1 my-1 bg-primary/20 hover:bg-primary text-cyan-300 hover:text-white border border-primary/40 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 no-underline"><span>${displayLabel}</span> <span class="text-[10px]">↗</span></a>`
        });
        return token;
      });

      // 3. Bold text formatting (**text**)
      tempLine = tempLine.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>');

      // 4. Restore Link Buttons
      for (const item of linkMap) {
        tempLine = tempLine.split(item.id).join(item.html);
      }

      // Bullet / List Item
      if (/^[-•*]\s/.test(line)) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1.5 pr-1">
            <span className="text-primary mt-1.5 text-[8px]">●</span>
            <div className="flex-1 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: tempLine.replace(/^[-•*]\s/, '') }} />
          </div>
        );
      }

      // Numbered List
      if (/^\d+\.\s/.test(line)) {
        const num = line.match(/^(\d+)\.\s/)?.[1];
        return (
          <div key={idx} className="flex items-start gap-2 my-1.5 pr-1">
            <span className="text-primary font-bold text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">{num}</span>
            <div className="flex-1 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: tempLine.replace(/^\d+\.\s/, '') }} />
          </div>
        );
      }

      // Headings
      if (line.startsWith('### ')) {
        return <h5 key={idx} className="font-bold text-sm text-primary mt-3 mb-1" dangerouslySetInnerHTML={{ __html: tempLine.replace('### ', '') }} />;
      }
      if (line.startsWith('## ')) {
        return <h4 key={idx} className="font-bold text-base text-cyan-400 mt-3 mb-1.5" dangerouslySetInnerHTML={{ __html: tempLine.replace('## ', '') }} />;
      }
      if (line.startsWith('# ')) {
        return <h3 key={idx} className="font-extrabold text-lg text-white mt-4 mb-2" dangerouslySetInnerHTML={{ __html: tempLine.replace('# ', '') }} />;
      }

      return (
        <p key={idx} className="my-1.5 text-sm leading-relaxed text-on-surface" dangerouslySetInnerHTML={{ __html: tempLine }} />
      );
    });
  };

  return (
    <>
      {/* Floating Full-Body Animated AI Robot (Draggable & Touch Animated) */}
      {!isOpen && (
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onClick={handleToggleClick}
          className={`fixed z-[9999] flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 group select-none touch-none ${
            dragPos ? "" : "bottom-5 right-3 sm:bottom-8 sm:right-6"
          } ${
            isDragging ? 'scale-110 drop-shadow-[0_20px_40px_rgba(14,165,233,0.9)]' : 'hover:scale-105 active:scale-95 cursor-pointer'
          }`}
          style={
            dragPos
              ? {
                  left: `${dragPos.x}px`,
                  top: `${dragPos.y}px`,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }
              : undefined
          }
          aria-label="Open AI Support Chat"
        >
          {/* Interactive Speech Badge Attached to Robot (Mobile & Desktop Responsive) */}
          <div className="flex flex-col items-center sm:items-end bg-[#0b0f19]/95 backdrop-blur-xl border border-cyan-400/50 rounded-2xl px-2.5 py-1 sm:px-3.5 sm:py-2 shadow-[0_8px_25px_rgba(0,0,0,0.6)] group-hover:border-cyan-400 transition-all pointer-events-none mb-1 sm:mb-0">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-black text-white tracking-wide flex items-center gap-1 whitespace-nowrap">
                <span>المساعد الذكي AI</span>
                <span className="text-[9px] text-cyan-400 font-mono">24/7</span>
              </span>
            </div>
            <div className="hidden sm:block text-[9px] sm:text-[10px] text-cyan-200/80 font-medium mt-0.5 whitespace-nowrap">
              دعم فني وتفاوض مباشر
            </div>
          </div>

          {/* Full-Body Animated 3D/Vector Cyber Robot */}
          <div className="relative w-14 h-18 sm:w-20 sm:h-24 flex items-center justify-center filter drop-shadow-[0_6px_16px_rgba(14,165,233,0.5)] group-hover:drop-shadow-[0_10px_24px_rgba(14,165,233,0.8)] transition-all">
            
            {/* Holographic Glowing Base Ring / Pulse Aura */}
            <div className="absolute bottom-0.5 w-10 sm:w-14 h-3 rounded-full bg-cyan-500/30 blur-md animate-pulse pointer-events-none"></div>

            {/* Complete Full-Body Robot SVG */}
            <svg
              viewBox="0 0 120 160"
              className="w-full h-full animate-[bounce_3s_ease-in-out_infinite] pointer-events-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* ── 1. ANTENNA & BEACON LIGHT ── */}
              <line x1="60" y1="12" x2="60" y2="28" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              <circle cx="60" cy="10" r="5" fill="#38bdf8" className="animate-pulse" />
              <circle cx="60" cy="10" r="8" fill="#38bdf8" opacity="0.4" className="animate-ping" />

              {/* ── 2. HEAD & HELMET ── */}
              {/* Left & Right Earphone Cushions */}
              <rect x="22" y="38" width="9" height="18" rx="4.5" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1.5" />
              <rect x="89" y="38" width="9" height="18" rx="4.5" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1.5" />

              {/* Main Helmet Head */}
              <rect x="30" y="26" width="60" height="42" rx="16" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />

              {/* Visor Screen */}
              <rect x="36" y="34" width="48" height="24" rx="10" fill="#082f49" stroke="#0ea5e9" strokeWidth="1.5" />

              {/* Left Eye (Animated Blinking) */}
              <ellipse cx="48" cy="46" rx="4.5" ry="6" fill="#38bdf8">
                <animate
                  attributeName="ry"
                  values="6;6;0.5;6;6"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </ellipse>
              <circle cx="50" cy="44" r="1.5" fill="#ffffff" />

              {/* Right Eye (Animated Blinking) */}
              <ellipse cx="72" cy="46" rx="4.5" ry="6" fill="#38bdf8">
                <animate
                  attributeName="ry"
                  values="6;6;0.5;6;6"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </ellipse>
              <circle cx="74" cy="44" r="1.5" fill="#ffffff" />

              {/* Cheerful Robot Smile */}
              <path d="M52 52 Q60 57 68 52" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* ── 3. NECK ── */}
              <rect x="53" y="68" width="14" height="8" rx="2" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />

              {/* ── 4. TORSO & CHEST ARMOR ── */}
              <path
                d="M36 76 L84 76 L78 114 L42 114 Z"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="2"
              />

              {/* Chest Core / Arc Reactor (Heart) */}
              <circle cx="60" cy="94" r="9" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="60" cy="94" r="5" fill="#38bdf8" className="animate-pulse" />
              <circle cx="60" cy="94" r="2" fill="#ffffff" />

              {/* Decorative Chest Lines */}
              <line x1="44" y1="84" x2="52" y2="84" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="68" y1="84" x2="76" y2="84" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />

              {/* ── 5. LEFT ARM (WAVING HAND!) ── */}
              <g className="origin-[36px_80px]">
                <circle cx="36" cy="80" r="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                <path d="M36 80 Q18 68 20 48" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" fill="none">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0 36 80; 12 36 80; -8 36 80; 0 36 80"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </path>
                {/* Cute Waving Glove Hand */}
                <circle cx="20" cy="46" r="5.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0 36 80; 12 36 80; -8 36 80; 0 36 80"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>

              {/* ── 6. RIGHT ARM (POUSED AT SIDE) ── */}
              <circle cx="84" cy="80" r="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              <path d="M84 80 Q98 94 94 106" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" fill="none" />
              <circle cx="94" cy="108" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />

              {/* ── 7. HOVER THRUSTERS & FLAMES ── */}
              {/* Hip Belt */}
              <rect x="42" y="114" width="36" height="6" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />

              {/* Left & Right Jet Thruster Nozzles */}
              <path d="M46 120 L54 120 L52 130 L48 130 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <path d="M66 120 L74 120 L72 130 L68 130 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />

              {/* Plasma Jet Flames (Animated) */}
              <path d="M48 130 Q50 146 52 130" fill="#38bdf8" className="animate-pulse" />
              <path d="M68 130 Q70 146 72 130" fill="#38bdf8" className="animate-pulse" />
              <path d="M49 130 Q50 140 51 130" fill="#ffffff" />
              <path d="M69 130 Q70 140 71 130" fill="#ffffff" />
            </svg>
          </div>
        </div>
      )}

      {/* Chat Box Modal (Fully Mobile & Desktop Responsive) */}
      {isOpen && (
        <div className="fixed inset-x-2.5 bottom-2.5 sm:bottom-6 sm:right-6 sm:inset-x-auto w-auto sm:w-[420px] max-w-full h-[85vh] sm:h-[580px] bg-[#0b0f19]/95 backdrop-blur-2xl rounded-3xl border border-outline-variant/40 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 z-[9999]">
          
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-primary/20 via-blue-900/30 to-surface-container-high border-b border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-primary to-cyan-400 p-0.5 shadow-lg">
                <div className="w-full h-full bg-[#0f172a] rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg sm:text-xl">smart_toy</span>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0b0f19] rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-on-surface flex items-center gap-1.5">
                  <span>عرب تك برو AI</span>
                  <span className="text-[9px] sm:text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-mono border border-primary/30">PRO</span>
                </h3>
                <p className="text-[10px] sm:text-[11px] text-on-surface-variant flex items-center gap-1">
                  <span>متصل الآن لخدمتك</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={startNewChat}
                title="محادثة جديدة"
                className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-white/5 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">refresh</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="إغلاق"
                className="p-1.5 text-on-surface-variant hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">close</span>
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 sm:space-y-4 text-xs sm:text-sm scrollbar-thin scrollbar-thumb-outline-variant/40">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-3 sm:p-4 text-on-surface-variant">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3 shadow-inner">
                  <span className="material-symbols-outlined text-2xl sm:text-3xl">auto_awesome</span>
                </div>
                <h4 className="font-bold text-sm sm:text-base text-on-surface mb-1">مرحباً بك في المساعد الذكي 👋</h4>
                <p className="text-[11px] sm:text-xs max-w-[280px] mb-3 text-on-surface-variant/80">
                  اسألني عن أسعار الخدمات، فحص وتتبع الطلبات، باقات الجملة، أو رفع شكوى مباشرة للإدارة.
                </p>

                {/* Suggestions Pills */}
                <div className="w-full space-y-1.5 text-right">
                  <p className="text-[10px] sm:text-[11px] font-bold text-on-surface-variant/90 px-1 mb-1">
                    💡 أسئلة مقترحة شائعة:
                  </p>
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(sug)}
                      className="w-full text-right p-2 sm:p-2.5 rounded-xl bg-surface-container-low hover:bg-primary/20 border border-outline-variant/20 hover:border-primary/40 text-[11px] sm:text-xs text-on-surface transition-all flex items-center justify-between group shadow-sm active:scale-[0.98]"
                    >
                      <span className="line-clamp-1">{sug}</span>
                      <span className="material-symbols-outlined text-primary text-xs sm:text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-md ${
                      m.role === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-bl-none'
                    }`}
                  >
                    {m.role === 'assistant' ? renderMessageContent(m.content) : m.content}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-surface-container-high border border-outline-variant/30 rounded-2xl rounded-bl-none px-3.5 py-2.5 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-primary text-base">progress_activity</span>
                  <span className="text-[11px] text-on-surface-variant">جاري التفكير وصياغة الرد...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 sm:p-3 bg-surface-container-lowest border-t border-outline-variant/30 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب استفسارك أو طلبك هنا..."
              disabled={isLoading}
              className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:hover:bg-primary text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
              aria-label="Send message"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl rotate-180">send</span>
            </button>
          </form>

        </div>
      )}
    </>
  );
}
