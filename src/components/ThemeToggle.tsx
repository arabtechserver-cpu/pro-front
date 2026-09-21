"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  lang?: string;
}

export default function ThemeToggle({ className = "", lang = "ar" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-surface-container-low/80 animate-pulse ${className}`} />
    );
  }

  const isDark = theme === "dark";
  const label = isDark
    ? (lang === "ar" ? "التحويل إلى الوضع النهاري" : "Switch to Light Mode")
    : (lang === "ar" ? "التحويل إلى الوضع الليلي" : "Switch to Dark Mode");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`relative w-9 h-9 rounded-full border border-slate-300 dark:border-white/10 bg-white/90 dark:bg-surface-container-low/80 text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-300 hover:border-cyan-400/50 shadow-sm transition-all duration-200 flex items-center justify-center shrink-0 group ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-sky-600 group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
