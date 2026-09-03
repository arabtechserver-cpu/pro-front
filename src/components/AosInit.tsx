"use client";

import { useEffect } from "react";
import AOS from "aos";

export default function AosInit() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      easing: "ease-out-cubic",
      offset: 30,
      mirror: true,
    });

    const handleRefresh = () => {
      AOS.refresh();
    };

    window.addEventListener("load", handleRefresh);
    window.addEventListener("scroll", handleRefresh, { passive: true });
    
    // Initial refresh after render
    const timeout = setTimeout(() => {
      AOS.refresh();
    }, 400);

    return () => {
      window.removeEventListener("load", handleRefresh);
      window.removeEventListener("scroll", handleRefresh);
      clearTimeout(timeout);
    };
  }, []);

  return null;
}
