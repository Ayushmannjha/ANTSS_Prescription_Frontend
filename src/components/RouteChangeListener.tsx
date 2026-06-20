"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function RouteChangeListener() {
  const pathname = usePathname();

  useEffect(() => {
    // Dispatch a global event when the route changes.
    // This allows cached client components to detect navigation and refresh data.
    const event = new CustomEvent("app-route-change", { detail: pathname });
    window.dispatchEvent(event);
  }, [pathname]);

  return null;
}
