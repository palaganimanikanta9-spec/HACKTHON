"use client";

import React from "react";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useSmartSaveStore } from "@/store/use-smartsave-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { wallet, normalSavings, strictSavings, user, notifications } = useSmartSaveStore();

  const totalBalance = wallet.balance + normalSavings.balance + strictSavings.balance;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Fixed Top Bar */}
      <TopBar
        totalBalance={totalBalance}
        notificationCount={unreadCount}
        userName={user.firstName}
        avatarUrl={user.avatarUrl}
      />

      {/* Page Content — padded for top/bottom bars */}
      <div
        className="pt-top-bar pb-nav-bottom min-h-dvh"
        style={{ paddingBottom: "calc(72px + env(safe-area-inset-bottom))" }}
      >
        {children}
      </div>

      {/* Fixed Bottom Navigation */}
      <BottomNavigation />
    </>
  );
}
