"use client";

import { useEffect } from "react";
import AOS from "aos";

export default function AosInit() {
  useEffect(() => {
    // Delay AOS initialization slightly to allow React hydration to complete cleanly
    const initTimer = setTimeout(() => {
      AOS.init({
        duration: 500,
        once: true,
        easing: "ease-out-cubic",
        offset: 20,
        mirror: false,
        disable: () => typeof window !== "undefined" && window.innerWidth < 768,
      });
      AOS.refresh();
    }, 100);

    const handleRefresh = () => {
      AOS.refresh();
    };

    window.addEventListener("load", handleRefresh);

    return () => {
      window.removeEventListener("load", handleRefresh);
      clearTimeout(initTimer);
    };
  }, []);

  return null;
}
