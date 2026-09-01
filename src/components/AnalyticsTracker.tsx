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
        const payload = JSON.stringify({
          eventName: "page_view",
          sessionId,
          path: pathname,
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
          },
        });

        // Use sendBeacon if available, otherwise fetch with silent catch
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon("/api/telemetry/events", blob);
        } else {
          fetch("/api/telemetry/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
          }).catch(() => {});
        }
      } catch (err) {
        // Silently ignore
      }
    };

    trackEvent();
  }, [pathname]);

  return null;
}
