"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PiggyBank, Plus, ArrowUpRight, Target, ChevronLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { SavingsCard } from "@/components/shared/Cards";
import { BalanceDisplay, SectionHeader } from "@/components/shared/Typography";
import { ActionButton, Button } from "@/components/shared/Button";
import { TransactionList } from "@/components/shared/Lists";
import { ProgressBar } from "@/components/shared/Feedback";
import { Modal } from "@/components/shared/Overlays";
import { useSmartSaveStore } from "@/store/use-smartsave-store";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { staggerContainer } from "@/lib/animations";

const MONTHLY_GOAL = 10000;

export default function NormalSavingsPage() {
  const { wallet, normalSavings, transactions, depositToNormalSavings, withdrawFromNormalSavings } =
    useSmartSaveStore();

  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [modalType, setModalType] = useState<"DEPOSIT" | "WITHDRAW" | null>(null);
  const [amount, setAmount] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const savingsTransactions = transactions.filter((t) => t.walletType === "SAVINGS");
  const goalProgress = (normalSavings.balance / MONTHLY_GOAL) * 100;

  const handleAction = async () => {
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
    setIsLoading(true);
    if (modalType === "DEPOSIT") {
      if (wallet.balance < parsedAmount) {
        setErrorMsg("Insufficient funds in Main Wallet.");
        setIsLoading(false);
        return;
      }
      const success = await depositToNormalSavings(parsedAmount);
      if (success) { setModalType(null); setAmount(""); }
      else setErrorMsg("Deposit failed. Please try again.");
    } else if (modalType === "WITHDRAW") {
      if (normalSavings.balance < parsedAmount) {
        setErrorMsg("Insufficient balance in Flexible Savings.");
        setIsLoading(false);
        return;
      }
      const success = await withdrawFromNormalSavings(parsedAmount);
      if (success) { setModalType(null); setAmount(""); }
      else setErrorMsg("Withdrawal failed. Please try again.");
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
          <h1 className="text-xl font-bold text-text-primary">Flexible Savings</h1>
          <p className="text-xs text-text-tertiary">Move funds instantly without lockups</p>
        </div>
      </div>

      {/* ── Savings Card ────────────────────────────────────────── */}
      <SavingsCard balance={normalSavings.balance} monthlyGrowth={normalSavings.monthlyGrowth}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank size={14} className="text-white/70" strokeWidth={1.5} />
              <span className="text-xs text-white/70 font-medium">Flexible Vault</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full">
              <span className="text-xs text-emerald-300 font-semibold">
                {formatPercentage(normalSavings.monthlyGrowth ?? 0)} APY
              </span>
            </div>
          </div>

          <BalanceDisplay
            amount={normalSavings.balance}
            label="Flexible Savings Balance"
            isVisible={isBalanceVisible}
            onToggleVisibility={() => setIsBalanceVisible((v) => !v)}
            size="xl"
          />

          <div className="flex items-center gap-4 pt-2">
            <ActionButton
              icon={<Plus size={20} />}
              label="Deposit"
              onClick={() => setModalType("DEPOSIT")}
            />
            <ActionButton
              icon={<ArrowUpRight size={20} />}
              label="Withdraw"
              onClick={() => setModalType("WITHDRAW")}
            />
          </div>
        </div>
      </SavingsCard>

      {/* ── Savings Goal ─────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-5 border border-border-subtle">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Target size={14} className="text-text-tertiary" />
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Savings Goal Progress</p>
            </div>
            <p className="text-base font-semibold text-text-primary">
              {formatCurrency(normalSavings.balance)} of {formatCurrency(MONTHLY_GOAL)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-success number-font">{Math.round(goalProgress)}%</p>
          </div>
        </div>

        <ProgressBar value={goalProgress} color="emerald" size="md" animated />

        {normalSavings.balance < MONTHLY_GOAL ? (
          <p className="text-xs text-text-tertiary mt-3">
            Save {formatCurrency(MONTHLY_GOAL - normalSavings.balance)} more to reach your goal!
          </p>
        ) : (
          <p className="text-xs text-success font-semibold mt-3">
            Goal achieved! Keep up the amazing work! 🎉
          </p>
        )}
      </div>

      {/* ── History ─────────────────────────────────────────────── */}
      <TransactionList
        transactions={savingsTransactions}
        title="Vault History"
        limit={5}
      />

      {/* ── Transfer Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={modalType !== null}
        onClose={() => {
          setModalType(null);
          setAmount("");
          setErrorMsg("");
        }}
        title={modalType === "DEPOSIT" ? "Deposit to Savings" : "Withdraw from Savings"}
        description={
          modalType === "DEPOSIT"
            ? `Move money from Main Wallet (Bal: ${formatCurrency(wallet.balance)})`
            : `Move money back to Main Wallet`
        }
      >
        <div className="flex flex-col gap-4 mt-2">
          {/* Amount input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-14 pl-8 pr-4 bg-bg-elevated border border-border-default rounded-2xl text-text-primary placeholder:text-text-tertiary text-lg font-bold focus:outline-none focus:border-accent-primary"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-error text-xs">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button
            onClick={handleAction}
            className="w-full mt-2"
            variant="primary"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : `Confirm ${modalType === "DEPOSIT" ? "Deposit" : "Withdrawal"}`}
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
