"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Bell,
  Moon,
  Sun,
  ChevronRight,
  LogOut,
  HelpCircle,
  FileText,
  Sparkles,
} from "lucide-react";
import { Avatar, Badge } from "@/components/shared/Typography";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useSmartSaveStore } from "@/store/use-smartsave-store";
import { useAuth } from "@clerk/nextjs";
import { staggerContainer, staggerItem } from "@/lib/animations";

import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/shared/Overlays";
import { Button } from "@/components/shared/Button";
import { AlertCircle } from "lucide-react";

import Link from "next/link";

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  rightElement?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}

function SettingItem({ icon, label, description, rightElement, onClick, href, className }: SettingItemProps) {
  const content = (
    <>
      <div className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center text-text-secondary flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        {description && (
          <p className="text-xs text-text-tertiary mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        {rightElement ?? <ChevronRight size={16} className="text-text-tertiary" />}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="w-full block">
        <motion.div
          variants={staggerItem}
          className={cn(
            "w-full flex items-center gap-3 p-4 rounded-2xl",
            "hover:bg-bg-elevated active:bg-bg-overlay",
            "transition-colors duration-150 text-left cursor-pointer",
            className
          )}
        >
          {content}
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div
      variants={staggerItem}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
      className={cn(
        "w-full flex items-center gap-3 p-4 rounded-2xl",
        "hover:bg-bg-elevated active:bg-bg-overlay",
        "transition-colors duration-150 text-left cursor-pointer",
        className
      )}
    >
      {content}
    </motion.div>
  );
}

export default function SettingsPage() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { user, wallet, normalSavings, strictSavings, notifications, updateSettings, resetAllData } = useSmartSaveStore();

  const handleSignOut = async () => {
    try {
      // Clear dev bypass cookie
      document.cookie = "dev_bypass=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      // Reset Zustand store state
      await resetAllData();
      
      // Clerk signout
      await signOut();
      
      // Redirect to sign-in page
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };
  const totalBalance = wallet.balance + normalSavings.balance + strictSavings.balance;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [isEndDateModalOpen, setIsEndDateModalOpen] = useState(false);
  const [endDateInput, setEndDateInput] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [isEndDateLoading, setIsEndDateLoading] = useState(false);

  const now = new Date();
  const currentEndDate = new Date(strictSavings.endDate || "2026-08-01T00:00:00Z");
  const isMatured = now >= currentEndDate;

  const handleOpenEndDateModal = () => {
    if (isMatured) return; // Prevent editing after maturity
    const d = new Date(strictSavings.endDate || "2026-08-01T00:00:00Z");
    const formatted = d.toISOString().split("T")[0];
    setEndDateInput(formatted);
    setEndDateError("");
    setIsEndDateModalOpen(true);
  };

  const handleSaveEndDate = async () => {
    setEndDateError("");
    const selectedDate = new Date(endDateInput + "T23:59:59Z");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
      setEndDateError("Please select a valid date.");
      return;
    }
    if (selectedDate <= today) {
      setEndDateError("Maturity date must be in the future.");
      return;
    }

    setIsEndDateLoading(true);
    const success = await updateSettings({ endDate: selectedDate.toISOString() });
    if (success) {
      setIsEndDateModalOpen(false);
    } else {
      setEndDateError("Failed to update maturity date.");
    }
    setIsEndDateLoading(false);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="px-4 py-4 flex flex-col gap-6"
    >
      {/* ── Profile Card ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-5"
      >
        <div className="flex items-center gap-4">
          <Avatar
            src={user.avatarUrl}
            name={`${user.firstName} ${user.lastName}`}
            size="xl"
            className="ring-2 ring-accent-primary/40"
          />
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-text-primary">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-text-secondary">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="ai" size="sm">
                <Sparkles size={9} />
                SmartSave Pro
              </Badge>
              <Badge variant="success" size="sm">Verified</Badge>
            </div>
          </div>
        </div>

        {/* Portfolio summary */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-border-subtle">
          {[
            { label: "Wallet", value: wallet.balance, color: "text-accent-primary-light" },
            { label: "Savings", value: normalSavings.balance, color: "text-success" },
            { label: "Protected", value: strictSavings.balance, color: "text-accent-primary-light" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className={cn("text-base font-bold number-font", item.color)}>
                {formatCurrency(item.value, { compact: true })}
              </p>
              <p className="text-2xs text-text-tertiary">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Account Settings ─────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">
          Account
        </p>
        <div className="flex flex-col gap-1">
          <SettingItem
            icon={<User size={16} />}
            label="Edit Profile"
            description="Update your name, photo, email"
            href="/profile"
          />
          <SettingItem
            icon={<Bell size={16} />}
            label="Notifications"
            description={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : "All caught up"}
            rightElement={
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-error text-white text-2xs font-bold flex items-center justify-center">{unreadCount}</span>
                )}
                <ChevronRight size={16} className="text-text-tertiary" />
              </div>
            }
          />
          <SettingItem
            icon={<Shield size={16} />}
            label="Security"
            description="PIN, biometrics, 2FA"
          />
        </div>
      </div>

      {/* ── Strict Savings Settings ───────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">
          Smart Savings
        </p>
        <div className="flex flex-col gap-1">
          <SettingItem
            icon={<Shield size={16} />}
            label="Lock Maturity Date"
            description={!mounted ? "Loading maturity date..." : (isMatured ? `Matured on ${new Date(strictSavings.endDate).toLocaleDateString()}` : `Matures on ${new Date(strictSavings.endDate).toLocaleDateString()}`)}
            onClick={isMatured ? undefined : handleOpenEndDateModal}
            rightElement={
              <div className="flex items-center gap-2">
                <Badge variant={isMatured ? "success" : "error"} size="sm">
                  {isMatured ? "Matured" : "Locked"}
                </Badge>
                {!isMatured && <ChevronRight size={16} className="text-text-tertiary" />}
              </div>
            }
          />
          <SettingItem
            icon={<FileText size={16} />}
            label="Verification History"
            description="View all AI verification decisions"
            href="/history"
          />
        </div>
      </div>

      {/* ── Appearance ───────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">
          Appearance
        </p>
        <div className="flex flex-col gap-1">
          <SettingItem
            icon={resolvedTheme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
            label={resolvedTheme === "dark" ? "Dark Mode" : "Light Mode"}
            description="Toggle theme"
            onClick={toggleTheme}
            rightElement={
              <div
                role="switch"
                aria-checked={resolvedTheme === "dark"}
                onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors duration-300 relative cursor-pointer flex-shrink-0",
                  resolvedTheme === "dark" ? "bg-accent-primary" : "bg-border-default"
                )}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                  animate={{ left: resolvedTheme === "dark" ? "calc(100% - 1.375rem)" : "2px" }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              </div>
            }
          />
        </div>
      </div>

      {/* ── Support ───────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">
          Support
        </p>
        <div className="flex flex-col gap-1">
          <SettingItem icon={<HelpCircle size={16} />} label="Help & FAQ" description="Get help with SmartSave" />
          <SettingItem icon={<FileText size={16} />} label="Privacy Policy" />
        </div>
      </div>

      {/* ── Sign Out ─────────────────────────────────────────────── */}
      <button
        onClick={handleSignOut}
        className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-error/10 border border-error/20 text-error text-sm font-semibold hover:bg-error/15 transition-colors"
      >
        <LogOut size={16} />
        Sign Out
      </button>

      <p className="text-center text-2xs text-text-tertiary pb-2">
        SmartSave AI Wallet v1.0.0 · Made with ❤️
      </p>

{/* ── Lock Maturity Date Editor Modal ───────────────────────── */}
      <Modal
        isOpen={isEndDateModalOpen}
        onClose={() => setIsEndDateModalOpen(false)}
        title="Set Lock Maturity Date"
        description="Until this date is reached, normal withdrawals are locked and any emergency transfers require AI receipt verification."
      >
        <div className="flex flex-col gap-4 mt-2">
          <div>
            <input
              type="date"
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              className="w-full h-14 px-4 bg-bg-elevated border border-border-default rounded-2xl text-text-primary text-base font-bold focus:outline-none focus:border-accent-primary"
            />
          </div>

          {endDateError && (
            <div className="flex items-center gap-1.5 text-error text-xs">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{endDateError}</span>
            </div>
          )}

          <Button
            onClick={handleSaveEndDate}
            className="w-full mt-2"
            variant="primary"
            size="lg"
            disabled={isEndDateLoading}
          >
            {isEndDateLoading ? "Saving..." : "Update Lock Date"}
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
