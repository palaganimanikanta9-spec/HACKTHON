"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, AlertCircle, Lock, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/shared/Cards";
import { BalanceDisplay } from "@/components/shared/Typography";
import { Button } from "@/components/shared/Button";
import { useSmartSaveStore } from "@/store/use-smartsave-store";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { staggerContainer } from "@/lib/animations";

export default function StrictWithdrawalPage() {
  const router = useRouter();
  const { strictSavings, initiateStrictSavingsWithdrawal } = useSmartSaveStore();

  const [amount, setAmount] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const parsedAmt = parseFloat(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Please enter a valid positive amount.");
      return;
    }
    if (!/^\d+(\.\d{0,2})?$/.test(amount)) {
      setErrorMsg("Amount must have at most 2 decimal places.");
      return;
    }
    if (strictSavings.balance < parsedAmount) {
      setErrorMsg("Insufficient funds in your Protected Savings vault.");
      return;
    }

    setIsLoading(true);
    const result = await initiateStrictSavingsWithdrawal(parsedAmount);

    // All withdrawals go to AI verification — redirect to upload page
    router.push("/savings/strict/upload");
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
          href="/savings/strict"
          className="w-9 h-9 rounded-full bg-bg-surface border border-border-subtle flex items-center justify-center text-text-secondary"
        >
          <ChevronLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Request Withdrawal</h1>
          <p className="text-xs text-text-tertiary">Protected Savings · AI verification required</p>
        </div>
      </div>

      {/* ── Balance Indicator ───────────────────────────────────── */}
      <GlassCard className="border border-border-subtle bg-bg-surface/50">
        <BalanceDisplay
          amount={strictSavings.balance}
          label="Available Protected Balance"
          size="lg"
          isVisible={true}
        />
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-subtle text-xs text-text-tertiary">
          <Shield size={12} className="text-accent-primary-light" />
          <span>AI verification required for all withdrawals</span>
        </div>
      </GlassCard>

      {/* ── Request Form ────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-1">
            Withdrawal Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-lg">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={cn(
                "w-full h-14 pl-8 pr-4 bg-bg-surface border rounded-2xl text-lg font-bold text-text-primary focus:outline-none focus:border-accent-primary transition-all",
                errorMsg ? "border-error focus:border-error" : "border-border-subtle"
              )}
            />
          </div>
          {errorMsg && (
            <div className="flex items-center gap-1.5 text-error text-xs mt-1 px-1">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Always-visible verification notice */}
        {parsedAmt > 0 && !errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl border text-xs leading-relaxed bg-warning/5 border-warning/20 text-warning"
          >
            <div className="flex items-start gap-2">
              <Lock size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">AI Verification Required</p>
                <p className="mt-0.5 text-white/70">
                  All withdrawals from Protected Savings require uploading a valid proof of expense (receipt, invoice, or bill). The AI will review and approve or reject your request.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={isLoading || parsedAmt <= 0}>
          {isLoading ? "Processing..." : "Continue to Verify"}
        </Button>
      </form>
    </motion.div>
  );
}
