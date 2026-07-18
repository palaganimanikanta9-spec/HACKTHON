"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  PiggyBank,
  Building2,
  User,
  ShoppingCart,
  Music,
  Tv,
  HeartPulse,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Transaction } from "@/types";
import { staggerItem } from "@/lib/animations";
import { Badge } from "./Typography";

// ── Icon Map ──────────────────────────────────────────────────────

const iconMap: Record<string, React.ElementType> = {
  "building": Building2,
  "user": User,
  "shield": Shield,
  "piggy-bank": PiggyBank,
  "shopping-cart": ShoppingCart,
  "music": Music,
  "tv": Tv,
  "heart-pulse": HeartPulse,
  "x-circle": XCircle,
  "default-send": ArrowUpRight,
  "default-receive": ArrowDownLeft,
};

// ── Transaction Item ───────────────────────────────────────────────

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

export function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const {
    type,
    direction,
    amount,
    currency,
    counterpartyName,
    description,
    status,
    classification,
    createdAt,
    icon,
  } = transaction;

  const isCredit = direction === "CREDIT";
  const isFailed = status === "FAILED";
  const isRejected = classification === "NON_ESSENTIAL";
  const isApproved = classification === "ESSENTIAL";

  // Choose icon
  const iconKey = icon || (isCredit ? "default-receive" : "default-send");
  const IconComp = iconMap[iconKey] ?? ArrowUpRight;

  // Icon background color
  const iconBgClass = isRejected
    ? "bg-error/15 text-error"
    : isApproved
    ? "bg-success/15 text-success"
    : isCredit
    ? "bg-success/10 text-success"
    : "bg-bg-overlay text-text-secondary";

  // Amount color
  const amountClass = isRejected
    ? "text-error line-through"
    : isCredit
    ? "text-success"
    : "text-text-primary";

  return (
    <motion.button
      variants={staggerItem}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl",
        "hover:bg-bg-elevated active:bg-bg-overlay",
        "transition-colors duration-150 text-left",
        isFailed && "opacity-50"
      )}
    >
      {/* Icon */}
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", iconBgClass)}>
        <IconComp size={16} strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-text-primary truncate">
            {counterpartyName ?? type}
          </p>
          {isApproved && (
            <CheckCircle2 size={12} className="text-success flex-shrink-0" />
          )}
          {isRejected && (
            <XCircle size={12} className="text-error flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-text-tertiary truncate">
          {description ?? formatDate(createdAt)}
        </p>
      </div>

      {/* Amount + Date */}
      <div className="text-right flex-shrink-0">
        <p className={cn("text-sm font-bold number-font", amountClass)}>
          {isCredit ? "+" : "-"}{formatCurrency(amount, { currency })}
        </p>
        <p className="text-2xs text-text-tertiary">{formatDate(createdAt, "relative")}</p>
      </div>
    </motion.button>
  );
}

// ── Transaction List ───────────────────────────────────────────────

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  seeAllHref?: string;
  limit?: number;
  isLoading?: boolean;
  className?: string;
}

export function TransactionList({
  transactions,
  title = "Recent Transactions",
  seeAllHref,
  limit,
  isLoading = false,
  className,
}: TransactionListProps) {
  const items = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className={cn("flex flex-col", className)}>
      {title && (
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          {seeAllHref && (
            <a
              href={seeAllHref}
              className="text-sm font-medium text-accent-primary hover:text-accent-primary-light transition-colors"
            >
              See all
            </a>
          )}
        </div>
      )}

      <div className="flex flex-col">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="skeleton h-3.5 w-32 rounded" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
              <div className="skeleton h-4 w-16 rounded" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-sm text-text-tertiary">
            No transactions yet
          </div>
        ) : (
          items.map((txn) => (
            <TransactionItem key={txn.id} transaction={txn} />
          ))
        )}
      </div>

      {/* Classification Legend */}
      {items.some((t) => t.classification) && (
        <div className="flex items-center gap-2 px-4 pt-2">
          <Badge variant="success">Essential</Badge>
          <Badge variant="error">Blocked</Badge>
          <span className="text-2xs text-text-tertiary">— AI verified</span>
        </div>
      )}
    </div>
  );
}

// ── Notification Card ──────────────────────────────────────────────

import type { Notification } from "@/types";

interface NotificationCardProps {
  notification: Notification;
  onDismiss?: (id: string) => void;
}

const notifTypeMap = {
  SUCCESS: { icon: "✅", bg: "border-success/20 bg-success/5" },
  WARNING: { icon: "⚠️", bg: "border-warning/20 bg-warning/5" },
  INFO: { icon: "ℹ️", bg: "border-info/20 bg-info/5" },
  ERROR: { icon: "❌", bg: "border-error/20 bg-error/5" },
};

export function NotificationCard({ notification, onDismiss }: NotificationCardProps) {
  const { type, title, message, read, createdAt } = notification;
  const config = notifTypeMap[type];

  return (
    <motion.div
      variants={staggerItem}
      className={cn(
        "flex items-start gap-3 p-4 rounded-2xl border",
        config.bg,
        !read && "ring-1 ring-accent-primary/20"
      )}
    >
      <span className="text-lg flex-shrink-0">{config.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-semibold", !read ? "text-text-primary" : "text-text-secondary")}>
            {title}
          </p>
          {!read && (
            <span className="w-2 h-2 rounded-full bg-accent-primary flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-xs text-text-tertiary mt-0.5">{message}</p>
        <p className="text-2xs text-text-tertiary mt-1">{formatDate(createdAt, "relative")}</p>
      </div>
    </motion.div>
  );
}
