"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Plus,
  ArrowUpRight,
  Brain,
  Lock,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { StrictSavingsCard, GlassCard } from "@/components/shared/Cards";
import { BalanceDisplay, Badge } from "@/components/shared/Typography";
import { ActionButton, Button } from "@/components/shared/Button";
import { TransactionList } from "@/components/shared/Lists";
import { Modal } from "@/components/shared/Overlays";
import { useSmartSaveStore } from "@/store/use-smartsave-store";
import { formatCurrency } from "@/lib/format";
import { staggerContainer } from "@/lib/animations";

export default function StrictSavingsDashboardPage() {
  const { wallet, strictSavings, transactions, depositToStrictSavings } = useSmartSaveStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const now = mounted ? new Date() : new Date(strictSavings.endDate || "2026-08-01T00:00:00Z");
  const startDate = new Date(strictSavings.startDate || "2026-07-01T00:00:00Z");
  const endDate = new Date(strictSavings.endDate || "2026-08-01T00:00:00Z");
  const isMatured = mounted && now >= endDate;
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = diffDays > 0 ? diffDays : 0;

  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const strictTransactions = transactions.filter((t) => t.walletType === "STRICT");

  // Sum up blocked vs approved metrics from mock transactions for accuracy
  const approvedTxns = strictTransactions.filter(
    (t) => t.type === "WITHDRAWAL" && t.status === "COMPLETED" && t.classification === "ESSENTIAL"
  );
  const blockedTxns = strictTransactions.filter(
    (t) => t.type === "WITHDRAWAL" && t.status === "FAILED" && t.classification === "NON_ESSENTIAL"
  );

  const approvedSum = approvedTxns.reduce((sum, t) => sum + t.amount, 0);
  const blockedSum = blockedTxns.reduce((sum, t) => sum + t.amount, 0);

  const handleDeposit = async () => {
    setErrorMsg("");
    const parsedAmount = parseFloat(depositAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Please enter a valid positive amount.");
      return;
    }
    if (!/^\d+(\.\d{0,2})?$/.test(depositAmount)) {
      setErrorMsg("Amount must have at most 2 decimal places.");
      return;
    }
    if (wallet.balance < parsedAmount) {
      setErrorMsg("Insufficient funds in Main Wallet.");
      return;
    }
    setIsLoading(true);
    const success = await depositToStrictSavings(parsedAmount);
    if (success) {
      setIsDepositOpen(false);
      setDepositAmount("");
    } else {
      setErrorMsg("Deposit failed. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="px-4 py-4 flex flex-col gap-6"
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-1">
        <Link
          href="/savings"
          className="w-9 h-9 rounded-full bg-bg-surface border border-border-subtle flex items-center justify-center text-text-secondary"
        >
          <ChevronLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Protected Savings</h1>
          <p className="text-xs text-text-tertiary">Locked savings verified by Smart AI</p>
        </div>
      </div>

      {/* ── Strict Savings Card ──────────────────────────────────── */}
      <StrictSavingsCard
        balance={strictSavings.balance}
        threshold={strictSavings.withdrawalThreshold}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-white/70" strokeWidth={1.5} />
              <span className="text-xs text-white/70 font-medium">Protected Vault</span>
            </div>
            <Badge variant="ai" size="sm">
              <Brain size={9} />
              AI Protected
            </Badge>
          </div>

          <BalanceDisplay
            amount={strictSavings.balance}
            label="Locked Balance"
            isVisible={isBalanceVisible}
            onToggleVisibility={() => setIsBalanceVisible((v) => !v)}
            size="xl"
          />

          {/* Lock Details Grid */}
          <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs text-white/70">
            <div>
              <p className="text-2xs text-white/40 uppercase tracking-wider font-semibold">Start Date</p>
              <p className="font-semibold number-font mt-0.5" suppressHydrationWarning>
                {mounted ? startDate.toLocaleDateString("en-GB") : "--/--/----"}
              </p>
            </div>
            <div>
              <p className="text-2xs text-white/40 uppercase tracking-wider font-semibold">End Date (Maturity)</p>
              <p className="font-semibold number-font mt-0.5" suppressHydrationWarning>
                {mounted ? endDate.toLocaleDateString("en-GB") : "--/--/----"}
              </p>
            </div>
            <div>
              <p className="text-2xs text-white/40 uppercase tracking-wider font-semibold">Current Date</p>
              <p className="font-semibold number-font mt-0.5" suppressHydrationWarning>
                {mounted ? now.toLocaleDateString("en-GB") : "--/--/----"}
              </p>
            </div>
            <div>
              <p className="text-2xs text-white/40 uppercase tracking-wider font-semibold">Days Remaining</p>
              <p className="font-semibold number-font mt-0.5" suppressHydrationWarning>
                {mounted ? (isMatured ? "0 days" : `${daysRemaining} days`) : "-- days"}
              </p>
            </div>
            <div className="col-span-2 pt-2 border-t border-white/5 flex justify-between items-center">
              <span className="text-2xs text-white/40 uppercase font-semibold">Maturity Status</span>
              <Badge variant={mounted && isMatured ? "success" : "error"} size="sm">
                {mounted ? (isMatured ? "Matured" : "Locked") : "Locked"}
              </Badge>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Lock size={12} className="text-white/50" />
              <p className="text-xs text-white/50 font-medium">AI Protection Rule</p>
            </div>
            <p className="text-sm text-white/80 font-semibold leading-relaxed">
              All withdrawals require AI document verification.
            </p>
            <p className="text-xs text-white/40 mt-1.5 leading-normal">
              Upload a valid receipt, invoice, or bill. The AI will approve or reject your withdrawal request.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-1">
            <ActionButton
              icon={<Plus size={20} />}
              label="Deposit"
              onClick={() => setIsDepositOpen(true)}
            />
            <Link href="/savings/strict/withdraw" className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-bg-elevated border border-border-subtle text-accent-primary group-hover:bg-accent-primary group-hover:text-white group-hover:border-accent-primary transition-colors duration-200">
                <ArrowUpRight size={20} />
              </div>
              <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                Withdraw
              </span>
            </Link>
          </div>
        </div>
      </StrictSavingsCard>

      {/* ── AI Shield Logs ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard padding="sm" className="border border-border-subtle bg-bg-surface/50">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-5 h-5 rounded-md bg-success/20 flex items-center justify-center text-success">
              <CheckCircle2 size={11} />
            </div>
            <p className="text-2xs text-text-tertiary font-medium uppercase tracking-wider">AI Approved</p>
          </div>
          <p className="text-xl font-bold text-success number-font">{formatCurrency(approvedSum)}</p>
          <p className="text-xs text-text-tertiary mt-0.5">{approvedTxns.length} verified this month</p>
        </GlassCard>

        <GlassCard padding="sm" className="border border-border-subtle bg-bg-surface/50">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-5 h-5 rounded-md bg-error/20 flex items-center justify-center text-error">
              <XCircle size={11} />
            </div>
            <p className="text-2xs text-text-tertiary font-medium uppercase tracking-wider">AI Blocked</p>
          </div>
          <p className="text-xl font-bold text-error number-font">{formatCurrency(blockedSum)}</p>
          <p className="text-xs text-text-tertiary mt-0.5">{blockedTxns.length} blocked impulse buys</p>
        </GlassCard>
      </div>

      {/* ── Transaction History ───────────────────────────────────── */}
      <TransactionList
        transactions={strictTransactions}
        title="Protected Log"
      />

      {/* ── Deposit Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={isDepositOpen}
        onClose={() => {
          setIsDepositOpen(false);
          setDepositAmount("");
          setErrorMsg("");
        }}
        title="Deposit to Strict Savings"
        description={`Move money from Main Wallet (Bal: ${formatCurrency(wallet.balance)}) to protected vault.`}
      >
        <div className="flex flex-col gap-4 mt-2">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full h-14 pl-8 pr-4 bg-bg-elevated border border-border-default rounded-2xl text-text-primary placeholder:text-text-tertiary text-lg font-bold focus:outline-none focus:border-accent-primary"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-error text-xs">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button
            onClick={handleDeposit}
            className="w-full mt-2"
            variant="primary"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Confirm Deposit"}
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
