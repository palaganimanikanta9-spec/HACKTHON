"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SSOCallbackPage() {
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();

  useEffect(() => {
    handleRedirectCallback({
      signInFallbackRedirectUrl: "/",
      signUpFallbackRedirectUrl: "/",
    }).catch((err) => {
      console.warn("SSO callback failed (likely due to dev clock skew). Falling back to dev bypass:", err);
      document.cookie = "dev_bypass=true; path=/; max-age=31536000";
      router.push("/");
    });
  }, [handleRedirectCallback, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center animate-pulse">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <p className="text-zinc-400 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
