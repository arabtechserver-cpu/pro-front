"use client";

import { useEffect } from "react";
import AOS from "aos";

export default function AosInit() {
  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true, // Only animate once to prevent repetitive scroll recalculation and lag
      easing: "ease-out-cubic",
      offset: 20,
      mirror: false,
    });

    const handleRefresh = () => {
      AOS.refresh();
    };

    window.addEventListener("load", handleRefresh);
    
    // Quick refresh after hydration
    const timeout = setTimeout(() => {
      AOS.refresh();
    }, 300);

    return () => {
      window.removeEventListener("load", handleRefresh);
      clearTimeout(timeout);
    };
  }, []);

  return null;
}
