"use client";

import React, { useEffect } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { useAuth, useUser } from "@clerk/nextjs";
import { useSmartSaveStore } from "@/store/use-smartsave-store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId, getToken } = useAuth();
  const { user } = useUser();
  const setToken = useSmartSaveStore((s) => s.setToken);
  const syncUser = useSmartSaveStore((s) => s.syncUser);
  const fetchData = useSmartSaveStore((s) => s.fetchData);

  useEffect(() => {
    async function initializeAuthAndData() {
      const isDevBypass = typeof document !== "undefined" && document.cookie.includes("dev_bypass=true");
      let activeToken = null;

      if (isDevBypass) {
        activeToken = "mock_user_default";
      } else if (isLoaded && userId) {
        try {
          activeToken = await getToken();
        } catch (e) {
          console.warn("Clerk getToken() failed, falling back to dev bypass:", e);
        }
        // Fallback: If Clerk token is null (e.g. clock skew in dev), use mock token
        if (!activeToken && process.env.NODE_ENV !== "production") {
          console.warn("Clerk token unavailable (clock skew?). Using dev bypass token.");
          activeToken = `mock_${userId}`;
        }
      }

      if (activeToken) {
        setToken(activeToken);

        // Sync profile details
        if (!isDevBypass && user && !activeToken.startsWith("mock_")) {
          await syncUser({
            firstName: user.firstName || "User",
            lastName: user.lastName || "",
            email: user.emailAddresses[0]?.emailAddress || "",
            avatarUrl: user.imageUrl,
          });
        } else {
          await syncUser({
            firstName: user?.firstName || "Dev",
            lastName: user?.lastName || "User",
            email: user?.emailAddresses[0]?.emailAddress || "dev@smartsave.ai",
            avatarUrl: user?.imageUrl || null,
          });
        }

        // Fetch wallet products, transactions, and notifications
        await fetchData();
      }
    }

    initializeAuthAndData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId]);

  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}

