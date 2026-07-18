"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Brain,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { GlassCard, StatCard } from "@/components/shared/Cards";
import { BalanceDisplay, Badge } from "@/components/shared/Typography";
import { CircularProgress } from "@/components/shared/Feedback";
import { AIInsightCard } from "@/components/shared/AIComponents";
import { TransactionList } from "@/components/shared/Lists";
import { useSmartSaveStore } from "@/store/use-smartsave-store";
import { staggerContainer, fadeInUpVariants } from "@/lib/animations";
import { mockInsights } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";

export default function DashboardPage() {
  const { wallet, normalSavings, strictSavings, transactions } = useSmartSaveStore();

  const totalNetWorth = wallet.balance + normalSavings.balance + strictSavings.balance;
  const totalSavings = normalSavings.balance + strictSavings.balance;
  
  // Calculate percentage of flexible savings compared to total savings
  const savingsProgress = totalSavings > 0 ? (normalSavings.balance / totalSavings) * 100 : 0;

  // Calculate dynamic monthly change based on transactions in the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const monthlyTransactions = transactions.filter(
    (t) => new Date(t.createdAt) >= thirtyDaysAgo && t.status === "COMPLETED"
  );

  const netChange = monthlyTransactions.reduce((sum, t) => {
    const amt = Number(t.amount);
    return t.direction === "CREDIT" ? sum + amt : sum - amt;
  }, 0);

  const previousNetWorth = totalNetWorth - netChange;
  const changePercentage = previousNetWorth > 0 ? (netChange / previousNetWorth) * 100 : 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="px-4 py-4 flex flex-col gap-6"
    >
      {/* ── Portfolio Hero Card ──────────────────────────────────── */}
      <GlassCard
        glow="violet"
        padding="lg"
        className="relative overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-950/40 via-bg-surface to-bg-base"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-accent-primary-light" />
              <span className="text-xs uppercase tracking-wider font-semibold text-text-secondary">
                SmartSave Portfolio
              </span>
            </div>
            <Badge variant="ai" size="sm">
              <Brain size={10} className="mr-0.5" />
              AI Active
            </Badge>
          </div>

          <BalanceDisplay
            amount={totalNetWorth}
            label="Total Net Worth"
            size="xl"
            showChange
            changePercentage={changePercentage}
          />

          <div className="grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-border-subtle">
            <Link href="/wallet" className="text-center group">
              <p className="text-xs font-medium text-text-tertiary group-hover:text-text-secondary transition-colors">
                Wallet
              </p>
              <p className="text-sm font-bold text-accent-primary-light number-font mt-0.5">
                {formatCurrency(wallet.balance, { compact: true })}
              </p>
            </Link>
            <Link href="/savings/normal" className="text-center group">
              <p className="text-xs font-medium text-text-tertiary group-hover:text-text-secondary transition-colors">
                Flexible
              </p>
              <p className="text-sm font-bold text-success number-font mt-0.5">
                {formatCurrency(normalSavings.balance, { compact: true })}
              </p>
            </Link>
            <Link href="/savings/strict" className="text-center group">
              <p className="text-xs font-medium text-text-tertiary group-hover:text-text-secondary transition-colors">
                Protected
              </p>
              <p className="text-sm font-bold text-accent-secondary number-font mt-0.5">
                {formatCurrency(strictSavings.balance, { compact: true })}
              </p>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* ── Quick Actions Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/wallet" className="block">
          <GlassCard
            hover
            padding="sm"
            className="flex items-center gap-3 border border-border-subtle h-full"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary-light flex-shrink-0">
              <ArrowUpRight size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Send Money</p>
              <p className="text-2xs text-text-tertiary">Wallet transfer</p>
            </div>
          </GlassCard>
        </Link>

        <Link href="/savings/strict/withdraw" className="block">
          <GlassCard
            hover
            padding="sm"
            className="flex items-center gap-3 border border-border-subtle h-full"
          >
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success flex-shrink-0">
              <ArrowDownLeft size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Request</p>
              <p className="text-2xs text-text-tertiary">Strict withdrawal</p>
            </div>
          </GlassCard>
        </Link>
      </div>

      {/* ── Savings Ratio & Analytics ────────────────────────────── */}
      <motion.div variants={fadeInUpVariants} className="glass rounded-3xl p-5 border border-border-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Savings Allocation</h3>
            <p className="text-xs text-text-tertiary">Flexible vs protected savings vaults</p>
          </div>
          <CircularProgress value={totalSavings > 0 ? Math.round(savingsProgress) : 100} size={56} strokeWidth={5}>
            <span className="text-2xs font-bold text-accent-primary-light">
              {totalSavings > 0 ? Math.round(savingsProgress) : 100}%
            </span>
          </CircularProgress>
        </div>

        <div className="space-y-2 mt-2 pt-2 border-t border-border-subtle">
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-success" />
              <span className="text-text-secondary">Flexible Savings</span>
            </div>
            <span className="font-semibold text-text-primary">
              {totalSavings > 0 ? Math.round(savingsProgress) : 100}%
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-primary" />
              <span className="text-text-secondary">Protected Savings</span>
            </div>
            <span className="font-semibold text-text-primary">
              {totalSavings > 0 ? 100 - Math.round(savingsProgress) : 0}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Featured AI Insight ──────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 px-1">
          <Brain size={13} className="text-accent-primary-light" />
          <p className="text-xs font-semibold text-accent-primary-light uppercase tracking-wider">
            AI Smart Recommendation
          </p>
        </div>
        <AIInsightCard insight={mockInsights[0]} />
      </div>

      {/* ── Transaction List ──────────────────────────────────────── */}
      <div className="flex flex-col">
        <TransactionList
          transactions={transactions}
          title="All Activity"
          seeAllHref="/history"
          limit={4}
        />
      </div>
    </motion.div>
  );
}
