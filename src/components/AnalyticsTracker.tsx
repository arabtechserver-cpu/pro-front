"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Generate a simple session ID if one doesn't exist
    let sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("sessionId", sessionId);
    }

    // Ignore admin routes
    if (pathname && pathname.startsWith("/admin")) {
      return;
    }

    const trackEvent = async () => {
      try {
        await fetch("/api/analytics/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventName: "page_view",
            sessionId,
            path: pathname,
            metadata: {
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
            },
          }),
        });
      } catch (err) {
        // Silently ignore if blocked by browser ad blocker / client extensions
      }
    };

    trackEvent();
  }, [pathname]);

  return null;
}
