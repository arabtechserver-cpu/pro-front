"use client";

import { useEffect } from "react";
import AOS from "aos";

export default function AosInit() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }

    // Disable on mobile so touch momentum scroll has zero layout shifts or animation overhead
    const initTimer = setTimeout(() => {
      AOS.init({
        disable: () => (typeof window !== "undefined" ? window.innerWidth < 768 : false),
        duration: 400,
        delay: 0,
        once: true,
        easing: "ease-out-cubic",
        offset: 0,
        mirror: false,
        throttleDelay: 16,
        debounceDelay: 0,
      });
      AOS.refresh();
    }, 50);

    const handleRefresh = () => {
      AOS.refresh();
    };

    window.addEventListener("load", handleRefresh);
    window.addEventListener("resize", handleRefresh, { passive: true });

    return () => {
      window.removeEventListener("load", handleRefresh);
      window.removeEventListener("resize", handleRefresh);
      clearTimeout(initTimer);
    };
  }, []);

  return null;
}
