"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { balanceRevealVariants } from "@/lib/animations";

// ── Balance Display ────────────────────────────────────────────────

interface BalanceDisplayProps {
  amount: number;
  currency?: string;
  label?: string;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showChange?: boolean;
  changeAmount?: number;
  changePercentage?: number;
}

const sizeMap = {
  sm: "text-2xl font-bold",
  md: "text-3xl font-bold",
  lg: "text-4xl font-extrabold",
  xl: "text-5xl font-extrabold",
};

export function BalanceDisplay({
  amount,
  currency = "USD",
  label = "Balance",
  isVisible = true,
  onToggleVisibility,
  size = "lg",
  className,
  showChange = false,
  changeAmount,
  changePercentage,
}: BalanceDisplayProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* Label row */}
      <div className="flex items-center gap-2">
        <p className="text-xs uppercase tracking-wider font-medium text-white/60">
          {label}
        </p>
        {onToggleVisibility && (
          <button
            onClick={onToggleVisibility}
            className="text-white/50 hover:text-white/80 transition-colors"
            aria-label={isVisible ? "Hide balance" : "Show balance"}
          >
            {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        )}
      </div>

      {/* Balance amount */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isVisible ? "visible" : "hidden"}
          variants={balanceRevealVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className={cn(sizeMap[size], "number-font text-white tracking-tight")}
        >
          {isVisible
            ? formatCurrency(amount, { currency })
            : "••••••"}
        </motion.div>
      </AnimatePresence>

      {/* Change indicator */}
      {showChange && changeAmount !== undefined && (
        <motion.div
          className="flex items-center gap-1"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TrendingUp size={12} className="text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">
            {changePercentage !== undefined
              ? formatPercentage(changePercentage)
              : `+${formatCurrency(Math.abs(changeAmount ?? 0))}`}{" "}
            this month
          </span>
        </motion.div>
      )}
    </div>
  );
}

// ── Currency Amount ────────────────────────────────────────────────

interface CurrencyAmountProps {
  amount: number;
  direction?: "credit" | "debit" | "neutral";
  size?: "xs" | "sm" | "md" | "lg";
  showSign?: boolean;
  className?: string;
  currency?: string;
}

const amountSizeMap = {
  xs: "text-sm font-semibold",
  sm: "text-base font-semibold",
  md: "text-lg font-bold",
  lg: "text-2xl font-bold",
};

const directionColorMap = {
  credit: "text-success",
  debit: "text-text-primary",
  neutral: "text-text-primary",
};

export function CurrencyAmount({
  amount,
  direction = "neutral",
  size = "sm",
  showSign = true,
  className,
  currency = "USD",
}: CurrencyAmountProps) {
  const sign = showSign && direction === "credit" ? "+" : direction === "debit" ? "-" : "";

  return (
    <span
      className={cn(
        amountSizeMap[size],
        directionColorMap[direction],
        "number-font tabular-nums",
        className
      )}
    >
      {sign}{formatCurrency(amount, { currency })}
    </span>
  );
}

// ── Section Header ─────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────

type BadgeVariant = "default" | "success" | "error" | "warning" | "info" | "ai" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
}

const badgeVariantMap: Record<BadgeVariant, string> = {
  default: "bg-bg-elevated text-text-secondary border border-border-default",
  success: "bg-success/15 text-success border border-success/30",
  error: "bg-error/15 text-error border border-error/30",
  warning: "bg-warning/15 text-warning border border-warning/30",
  info: "bg-info/15 text-info border border-info/30",
  ai: "bg-accent-primary/15 text-accent-primary-light border border-accent-primary/30",
  outline: "bg-transparent text-text-secondary border border-border-default",
};

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const sizeStyles = size === "sm" ? "text-2xs px-2 py-0.5" : "text-xs px-2.5 py-1";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full",
        sizeStyles,
        badgeVariantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ── Chip ──────────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ label, isActive = false, onClick, className }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-accent-primary text-white"
          : "bg-bg-elevated text-text-secondary border border-border-default hover:border-accent-primary hover:text-accent-primary",
        className
      )}
    >
      {label}
    </button>
  );
}

// ── Avatar ────────────────────────────────────────────────────────

interface AvatarProps {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const avatarSizeMap = {
  xs: "w-6 h-6 text-2xs",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center",
        "bg-accent-primary text-white font-semibold",
        avatarSizeMap[size],
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
