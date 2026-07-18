"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  User as UserIcon,
  Shield,
  Sparkles,
  Calendar,
  Mail,
  Award,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { GlassCard } from "@/components/shared/Cards";
import { Avatar, Badge } from "@/components/shared/Typography";
import { useSmartSaveStore } from "@/store/use-smartsave-store";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, wallet, normalSavings, strictSavings } = useSmartSaveStore();

  const totalAssets = wallet.balance + normalSavings.balance + strictSavings.balance;
  const protectedRatio = totalAssets > 0 ? Math.round((strictSavings.balance / totalAssets) * 100) : 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="px-4 py-4 flex flex-col gap-6"
    >
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="px-1">
        <h1 className="text-xl font-bold text-text-primary">My Profile</h1>
        <p className="text-xs text-text-tertiary">Personal information and financial statistics</p>
      </div>

      {/* ── Profile Details Card ─────────────────────────────────── */}
      <GlassCard className="relative overflow-hidden border border-border-subtle bg-bg-surface/50">
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <Avatar
            src={user.avatarUrl}
            name={`${user.firstName} ${user.lastName}`}
            size="xl"
            className="ring-4 ring-accent-primary/20"
          />

          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {user.firstName} {user.lastName}
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <Mail size={12} className="text-text-tertiary" />
              <p className="text-xs text-text-secondary">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="ai" size="md">
              <Sparkles size={10} className="mr-0.5" />
              SmartSave Premium
            </Badge>
            <Badge variant="success" size="md">
              Level 3 Saver
            </Badge>
          </div>
        </div>

        {/* Joined date info */}
        <div className="flex items-center justify-center gap-2 mt-2 pt-4 border-t border-border-subtle text-xs text-text-tertiary">
          <Calendar size={12} />
          <span>Member since {formatDate(user.joinedAt, "long")}</span>
        </div>
      </GlassCard>

      {/* ── Financial Stats ──────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-1">
          Financial Summary
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <GlassCard padding="sm" className="border border-border-subtle">
            <p className="text-2xs text-text-tertiary font-medium uppercase tracking-wider mb-1">
              Total Managed Assets
            </p>
            <p className="text-xl font-bold text-accent-primary-light number-font">
              {formatCurrency(totalAssets)}
            </p>
          </GlassCard>

          <GlassCard padding="sm" className="border border-border-subtle">
            <p className="text-2xs text-text-tertiary font-medium uppercase tracking-wider mb-1">
              Protected Ratio
            </p>
            <p className="text-xl font-bold text-success number-font">
              {protectedRatio}%
            </p>
          </GlassCard>
        </div>
      </div>

      {/* ── Saver Badges / Achievements ───────────────────────────── */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-1">
          Achievements
        </h3>

        <GlassCard padding="sm" className="flex items-center gap-3 border border-border-subtle bg-bg-surface/50">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-accent-primary-light">
            <Award size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">Impulse Shield Master</p>
            <p className="text-xs text-text-tertiary">Blocked 5+ non-essential withdrawals</p>
          </div>
          <Badge variant="success">Active</Badge>
        </GlassCard>

        <GlassCard padding="sm" className="flex items-center gap-3 border border-border-subtle bg-bg-surface/50">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-success">
            <TrendingUp size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">Steady Accumulator</p>
            <p className="text-xs text-text-tertiary">Kept savings growing for 3 consecutive months</p>
          </div>
          <Badge variant="success">Active</Badge>
        </GlassCard>
      </div>
    </motion.div>
  );
}
