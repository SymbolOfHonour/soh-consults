"use client";

import { useEffect } from "react";

const SW_VERSION = "v6";
const MIGRATION_KEY = "soh-sw-v6-migrated";

export default function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const setupServiceWorker = async () => {
      try {
        // Development must never use the production service worker.
        if (process.env.NODE_ENV !== "production") {
          const registrations =
            await navigator.serviceWorker.getRegistrations();

          await Promise.all(
            registrations.map((registration) =>
              registration.unregister()
            )
          );

          if ("caches" in window) {
            const keys = await caches.keys();

            await Promise.all(
              keys
                .filter((key) => key.startsWith("soh-consults-"))
                .map((key) => caches.delete(key))
            );
          }

          return;
        }

        const hasMigrated =
          window.localStorage.getItem(MIGRATION_KEY) === "true";

        // One-time cleanup for browsers that still have the old broken worker.
        if (!hasMigrated) {
          const registrations =
            await navigator.serviceWorker.getRegistrations();

          await Promise.all(
            registrations.map((registration) =>
              registration.unregister()
            )
          );

          if ("caches" in window) {
            const keys = await caches.keys();

            await Promise.all(
              keys
                .filter((key) => key.startsWith("soh-consults-"))
                .map((key) => caches.delete(key))
            );
          }

          window.localStorage.setItem(MIGRATION_KEY, "true");
        }

        const registration = await navigator.serviceWorker.register(
          `/sw.js?version=${SW_VERSION}`,
          {
            updateViaCache: "none",
          }
        );

        await registration.update();
      } catch (error) {
        console.error("Service worker setup failed:", error);
      }
    };

    setupServiceWorker();
  }, []);

  return null;
}