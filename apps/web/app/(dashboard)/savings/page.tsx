"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiggyBank,
  Shield,
  Sparkles,
  ChevronRight,
  Brain,
  ArrowUpRight,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/shared/Cards";
import { SectionHeader } from "@/components/shared/Typography";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Overlays";
import { useSmartSaveStore } from "@/store/use-smartsave-store";
import { formatCurrency } from "@/lib/format";
import { staggerContainer, fadeInUpVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

export default function SavingsSummaryPage() {
  const { wallet, normalSavings, strictSavings, depositToNormalSavings, depositToStrictSavings } =
    useSmartSaveStore();

  // ── Smart Split Deposit State ──────────────────────────────────
  const [isSmartSaveOpen, setIsSmartSaveOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState("");
  const [strictGoal, setStrictGoal] = useState("500");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    strictAmt: number;
    flexibleAmt: number;
  } | null>(null);

  const parsedTotal = parseFloat(totalAmount) || 0;
  const parsedGoal = parseFloat(strictGoal) || 0;

  // How much more can go into strict before hitting the goal
  const strictShortfall = Math.max(0, parsedGoal - strictSavings.balance);
  const strictAmt = Math.min(parsedTotal, strictShortfall);
  const flexibleAmt = Math.max(0, parsedTotal - strictAmt);

  const handleSmartSave = async () => {
    setErrorMsg("");
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      setErrorMsg("Please enter a valid amount to save.");
      return;
    }
    if (!/^\d+(\.\d{0,2})?$/.test(totalAmount)) {
      setErrorMsg("Amount must have at most 2 decimal places.");
      return;
    }
    if (parsedTotal > wallet.balance) {
      setErrorMsg("Insufficient funds in your Main Wallet.");
      return;
    }

    setIsLoading(true);
    let ok = true;

    // Step 1: Deposit to Strict Savings (if any)
    if (strictAmt > 0) {
      const strictOk = await depositToStrictSavings(strictAmt);
      if (!strictOk) ok = false;
    }

    // Step 2: Deposit remainder to Flexible Savings (if any)
    if (flexibleAmt > 0 && ok) {
      const flexOk = await depositToNormalSavings(flexibleAmt);
      if (!flexOk) ok = false;
    }

    if (ok) {
      setSuccessResult({ strictAmt, flexibleAmt });
    } else {
      setErrorMsg("Deposit failed. Please check your connection and try again.");
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    setIsSmartSaveOpen(false);
    setTotalAmount("");
    setStrictGoal("500");
    setErrorMsg("");
    setSuccessResult(null);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="px-4 py-4 flex flex-col gap-6"
    >
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Savings Vaults</h1>
          <p className="text-xs text-text-tertiary">Grow your wealth with smart protection tools</p>
        </div>
        <button
          onClick={() => setIsSmartSaveOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-accent-primary text-white text-xs font-bold shadow-lg shadow-accent-primary/25 hover:bg-accent-primary/90 transition-all active:scale-95"
        >
          <Zap size={13} />
          Smart Save
        </button>
      </div>

      {/* ── Flexible / Normal Savings Section ────────────────────── */}
      <motion.div variants={fadeInUpVariants}>
        <Link href="/savings/normal" className="block">
          <GlassCard
            hover
            padding="lg"
            className="border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-bg-surface to-bg-base"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-success/15 flex items-center justify-center text-success">
                  <PiggyBank size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary">Flexible Savings</h2>
                  <p className="text-3xs text-text-tertiary uppercase tracking-wider font-semibold">Normal Savings</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-text-tertiary mt-1" />
            </div>

            <div className="mt-2">
              <p className="text-2xs text-text-tertiary uppercase tracking-wider font-semibold">Available Balance</p>
              <p className="text-2xl font-extrabold text-success number-font mt-0.5">
                {formatCurrency(normalSavings.balance)}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-2xs text-text-tertiary">
              <span>Withdraw anytime without restrictions</span>
              <span className="font-semibold text-success">Interest: {normalSavings.monthlyGrowth}% APY</span>
            </div>
          </GlassCard>
        </Link>
      </motion.div>

      {/* ── Strict / Protected Savings Section ───────────────────── */}
      <motion.div variants={fadeInUpVariants}>
        <Link href="/savings/strict" className="block">
          <GlassCard
            hover
            padding="lg"
            className="border border-violet-500/20 bg-gradient-to-br from-violet-950/20 via-bg-surface to-bg-base relative overflow-hidden"
          >
            {/* Ambient Shimmer */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/10 rounded-full blur-2xl" />

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-accent-primary/15 flex items-center justify-center text-accent-primary-light">
                  <Shield size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary">Protected Savings</h2>
                  <p className="text-3xs text-text-tertiary uppercase tracking-wider font-semibold">Strict Savings</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-text-tertiary mt-1" />
            </div>

            <div className="mt-2 flex justify-between items-end">
              <div>
                <p className="text-2xs text-text-tertiary uppercase tracking-wider font-semibold">Locked Balance</p>
                <p className="text-2xl font-extrabold text-accent-primary-light number-font mt-0.5">
                  {formatCurrency(strictSavings.balance)}
                </p>
              </div>
              <div className="bg-accent-primary/15 border border-accent-primary/30 rounded-full px-2.5 py-1 flex items-center gap-1">
                <Brain size={10} className="text-accent-primary-light" />
                <span className="text-3xs font-bold text-accent-primary-light uppercase">AI Verification</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-2xs text-text-tertiary">
              <span>All withdrawals require AI verification</span>
              <span className="font-semibold text-accent-primary-light">AI Shield Active</span>
            </div>
          </GlassCard>
        </Link>
      </motion.div>

      {/* ── Quick Stats Summary ──────────────────────────────────── */}
      <motion.div variants={fadeInUpVariants} className="grid grid-cols-2 gap-3">
        <GlassCard padding="sm" className="border border-border-subtle text-center">
          <p className="text-3xs text-text-tertiary uppercase tracking-wider font-semibold mb-1">Combined Savings</p>
          <p className="text-lg font-bold text-text-primary number-font">
            {formatCurrency(normalSavings.balance + strictSavings.balance)}
          </p>
        </GlassCard>

        <GlassCard padding="sm" className="border border-border-subtle text-center">
          <p className="text-3xs text-text-tertiary uppercase tracking-wider font-semibold mb-1">Total Saved This Month</p>
          <p className="text-lg font-bold text-success number-font">
            {formatCurrency(strictSavings.totalSaved)}
          </p>
        </GlassCard>
      </motion.div>

      {/* ── Smart Split Deposit Modal ────────────────────────────── */}
      <Modal
        isOpen={isSmartSaveOpen}
        onClose={handleClose}
        title="Smart Save"
        description="Set your strict savings goal. Funds fill Protected Savings first — then the rest goes to Flexible."
      >
        <AnimatePresence mode="wait">
          {successResult ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center text-success">
                <CheckCircle2 size={32} />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-text-primary">Saved Successfully!</p>
                <p className="text-xs text-text-tertiary mt-1">Your money has been split and deposited.</p>
              </div>

              {/* Split Breakdown */}
              <div className="w-full flex flex-col gap-2 mt-2">
                {successResult.strictAmt > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-accent-primary/10 border border-accent-primary/20">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-accent-primary-light" />
                      <span className="text-xs font-semibold text-text-primary">Protected Savings</span>
                    </div>
                    <span className="text-sm font-bold text-accent-primary-light number-font">
                      {formatCurrency(successResult.strictAmt)}
                    </span>
                  </div>
                )}
                {successResult.flexibleAmt > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-success/10 border border-success/20">
                    <div className="flex items-center gap-2">
                      <PiggyBank size={14} className="text-success" />
                      <span className="text-xs font-semibold text-text-primary">Flexible Savings</span>
                    </div>
                    <span className="text-sm font-bold text-success number-font">
                      {formatCurrency(successResult.flexibleAmt)}
                    </span>
                  </div>
                )}
              </div>

              <Button onClick={handleClose} variant="primary" size="lg" className="w-full mt-2">
                Done
              </Button>
            </motion.div>
          ) : (
            <motion.div key="form" className="flex flex-col gap-4 mt-2">
              {/* Wallet Balance */}
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-bg-elevated border border-border-subtle">
                <Wallet size={14} className="text-text-tertiary" />
                <span className="text-xs text-text-secondary">
                  Wallet Balance: <span className="font-bold text-text-primary">{formatCurrency(wallet.balance)}</span>
                </span>
              </div>

              {/* Total Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-1">
                  Total Amount to Save
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-lg">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => { setTotalAmount(e.target.value); setErrorMsg(""); }}
                    className={cn(
                      "w-full h-14 pl-8 pr-4 bg-bg-elevated border rounded-2xl text-lg font-bold text-text-primary focus:outline-none focus:border-accent-primary transition-all",
                      errorMsg ? "border-error" : "border-border-default"
                    )}
                  />
                </div>
              </div>

              {/* Strict Goal */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-1">
                  Protected Savings Goal
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-lg">$</span>
                  <input
                    type="number"
                    placeholder="500"
                    value={strictGoal}
                    onChange={(e) => setStrictGoal(e.target.value)}
                    className="w-full h-14 pl-8 pr-4 bg-bg-elevated border border-border-default rounded-2xl text-lg font-bold text-text-primary focus:outline-none focus:border-accent-primary transition-all"
                  />
                </div>
                <p className="text-2xs text-text-tertiary px-1">
                  Current Protected balance: <span className="font-semibold">{formatCurrency(strictSavings.balance)}</span>
                  {" · "}Remaining to goal: <span className="font-semibold text-accent-primary-light">{formatCurrency(Math.max(0, parsedGoal - strictSavings.balance))}</span>
                </p>
              </div>

              {/* Live Split Preview */}
              {parsedTotal > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2 p-3 rounded-2xl bg-bg-elevated border border-border-subtle"
                >
                  <p className="text-2xs font-bold text-text-tertiary uppercase tracking-wider mb-1">
                    <Sparkles size={10} className="inline mr-1" />Split Preview
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-accent-primary/20 flex items-center justify-center">
                        <Shield size={10} className="text-accent-primary-light" />
                      </div>
                      <span className="text-xs text-text-secondary">Protected Savings</span>
                    </div>
                    <span className={cn(
                      "text-sm font-bold number-font",
                      strictAmt > 0 ? "text-accent-primary-light" : "text-text-tertiary"
                    )}>
                      {strictAmt > 0 ? formatCurrency(strictAmt) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-success/20 flex items-center justify-center">
                        <PiggyBank size={10} className="text-success" />
                      </div>
                      <span className="text-xs text-text-secondary">Flexible Savings</span>
                    </div>
                    <span className={cn(
                      "text-sm font-bold number-font",
                      flexibleAmt > 0 ? "text-success" : "text-text-tertiary"
                    )}>
                      {flexibleAmt > 0 ? formatCurrency(flexibleAmt) : "—"}
                    </span>
                  </div>
                  {/* Visual bar */}
                  {parsedTotal > 0 && (
                    <div className="mt-1 h-2 rounded-full bg-bg-surface overflow-hidden flex">
                      <div
                        className="h-full bg-accent-primary rounded-l-full transition-all"
                        style={{ width: `${(strictAmt / parsedTotal) * 100}%` }}
                      />
                      <div
                        className="h-full bg-success transition-all"
                        style={{ width: `${(flexibleAmt / parsedTotal) * 100}%` }}
                      />
                    </div>
                  )}
                  {strictSavings.balance >= parsedGoal && parsedGoal > 0 && (
                    <p className="text-2xs text-success mt-1">
                      ✓ Protected goal already met — all funds go to Flexible Savings
                    </p>
                  )}
                </motion.div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-error text-xs">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Button
                onClick={handleSmartSave}
                variant="primary"
                size="lg"
                className="w-full mt-1"
                disabled={isLoading || parsedTotal <= 0}
              >
                {isLoading ? "Saving..." : `Save ${parsedTotal > 0 ? formatCurrency(parsedTotal) : ""}`}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </motion.div>
  );
}
