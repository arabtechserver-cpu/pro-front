"use client";

import { useEffect } from "react";
import { startUserInactivityMonitor } from "@/lib/user-session-activity";

export default function UserInactivityGuard() {
  useEffect(() => {
    return startUserInactivityMonitor();
  }, []);

  return null;
}
