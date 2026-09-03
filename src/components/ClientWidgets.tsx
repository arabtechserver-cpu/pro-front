"use client";

import React from "react";
import dynamic from "next/dynamic";

const AnalyticsTracker = dynamic(() => import("@/components/AnalyticsTracker"), { ssr: false });
const AiChatWidget = dynamic(() => import("@/components/AiChatWidget"), { ssr: false });
const ContactFloatingButton = dynamic(() => import("@/components/ContactFloatingButton"), { ssr: false });
const FloatingSideDock = dynamic(() => import("@/components/FloatingSideDock"), { ssr: false });
const AosInit = dynamic(() => import("@/components/AosInit"), { ssr: false });
const CyberMouseBackground = dynamic(() => import("@/components/CyberMouseBackground"), { ssr: false });

export default function ClientWidgets({ lang }: { lang: string }) {
  return (
    <>
      <AosInit />
      <AnalyticsTracker />
      <CyberMouseBackground />
      <ContactFloatingButton lang={lang} />
      <AiChatWidget />
      <FloatingSideDock lang={lang} />
    </>
  );
}
