"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";

const AnalyticsTracker = dynamic(() => import("@/components/AnalyticsTracker"), { ssr: false });
const AiChatWidget = dynamic(() => import("@/components/AiChatWidget"), { ssr: false });
const ContactFloatingButton = dynamic(() => import("@/components/ContactFloatingButton"), { ssr: false });
const FloatingSideDock = dynamic(() => import("@/components/FloatingSideDock"), { ssr: false });
const AosInit = dynamic(() => import("@/components/AosInit"), { ssr: false });
const CyberMouseBackground = dynamic(() => import("@/components/CyberMouseBackground"), { ssr: false });

export default function ClientWidgets({ lang }: { lang: string }) {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Gracefully handle noisy third-party vendor rejections (GSI, Turnstile, browser extensions)
      const reason = event?.reason;
      if (!reason) return;

      const reasonStr = typeof reason === "object" ? JSON.stringify(reason) : String(reason);
      if (
        reason?.isNotDisplayed ||
        reason?.opt_out_or_no_session ||
        reason?.type === "user_dismissed" ||
        reasonStr.includes("turnstile") ||
        reasonStr.includes("gsi") ||
        reasonStr.includes("requestAdapter") ||
        reasonStr.includes("sandboxed")
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return (
    <>
      <AosInit />
      <AnalyticsTracker />
      <CyberMouseBackground />
      <AiChatWidget />
      <FloatingSideDock lang={lang} />
    </>
  );
}
