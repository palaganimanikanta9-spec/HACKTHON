"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Check, Trash2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/shared/Cards";
import { NotificationCard } from "@/components/shared/Lists";
import { Button } from "@/components/shared/Button";
import { useSmartSaveStore } from "@/store/use-smartsave-store";
import { staggerContainer } from "@/lib/animations";

export default function NotificationsPage() {
  const { notifications, markNotificationsAsRead, clearNotifications } = useSmartSaveStore();

  // Mark all as read when entering the page
  useEffect(() => {
    markNotificationsAsRead();
  }, [markNotificationsAsRead]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="px-4 py-4 flex flex-col gap-6"
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="w-9 h-9 rounded-full bg-bg-surface border border-border-subtle flex items-center justify-center text-text-secondary"
          >
            <ChevronLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Notifications</h1>
            <p className="text-xs text-text-tertiary">Real-time status updates</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="w-8 h-8 rounded-full hover:bg-bg-elevated flex items-center justify-center text-text-tertiary hover:text-error transition-colors"
            title="Clear all"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* ── Notifications List ───────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {notifications.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center text-text-tertiary">
              <Bell size={24} />
            </div>
            <div>
              <p className="text-base font-semibold text-text-primary">No new notifications</p>
              <p className="text-xs text-text-tertiary mt-1">We'll alert you here when transactions verify.</p>
            </div>
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationCard key={notif.id} notification={notif} />
          ))
        )}
      </div>
    </motion.div>
  );
}
