"use client";

import { useEffect } from "react";
import AOS from "aos";

export default function AosInit() {
  useEffect(() => {
    // Delay AOS initialization slightly to allow React hydration to complete cleanly
    const initTimer = setTimeout(() => {
      AOS.init({
        duration: 600,
        once: true,
        easing: "ease-out-cubic",
        offset: 20,
        mirror: false,
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
