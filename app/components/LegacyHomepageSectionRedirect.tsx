"use client";

import { useEffect } from "react";

export default function LegacyHomepageSectionRedirect() {
  useEffect(() => {
    const destination: Record<string, string> = {
      "#updates": "/updates",
      "#opportunities": "/opportunities",
    };
    const target = destination[window.location.hash.toLowerCase()];
    if (target) window.location.replace(target);
  }, []);

  return null;
}
