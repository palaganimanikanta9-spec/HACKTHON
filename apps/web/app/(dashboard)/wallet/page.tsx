"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Download,
  Clock,
  Plus,
  ArrowUpRight,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { WalletCard } from "@/components/shared/Cards";
import { BalanceDisplay } from "@/components/shared/Typography";
import { ActionButton, Button } from "@/components/shared/Button";
import { TransactionList } from "@/components/shared/Lists";
import { AIInsightCarousel } from "@/components/shared/AIComponents";
import { Modal } from "@/components/shared/Overlays";
import { useSmartSaveStore } from "@/store/use-smartsave-store";
import { staggerContainer } from "@/lib/animations";
import { mockInsights } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";

export default function WalletPage() {
  const { wallet, transactions, depositToMain, withdrawFromMain } = useSmartSaveStore();

  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [modalType, setModalType] = useState<"SEND" | "ADD" | "RECEIVE" | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const walletTransactions = transactions.filter((t) => t.walletType === "MAIN");

  // Sum calculations
  const sentTxns = walletTransactions.filter((t) => t.type === "SEND" && t.status === "COMPLETED");
  const receivedTxns = walletTransactions.filter(
    (t) => (t.type === "RECEIVE" || t.type === "TRANSFER_IN") && t.status === "COMPLETED"
  );

  const sentSum = sentTxns.reduce((sum, t) => sum + t.amount, 0);
  const receivedSum = receivedTxns.reduce((sum, t) => sum + t.amount, 0);

  // Dynamic monthly change calculations
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  const walletMonthlyTransactions = walletTransactions.filter(
    (t) => new Date(t.createdAt) >= thirtyDaysAgo && t.status === "COMPLETED"
  );
  
  const walletNetChange = walletMonthlyTransactions.reduce((sum, t) => {
    return t.direction === "CREDIT" ? sum + t.amount : sum - t.amount;
  }, 0);
  
  const previousWalletBalance = wallet.balance - walletNetChange;
  const walletChangePercentage = previousWalletBalance > 0 ? (walletNetChange / previousWalletBalance) * 100 : 0;

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
    if (modalType === "SEND") {
      if (wallet.balance < parsedAmount) {
        setErrorMsg("Insufficient funds in Main Wallet.");
        setIsLoading(false);
        return;
      }
      const success = await withdrawFromMain(parsedAmount, note || "Transfer out");
      if (success) {
        setModalType(null);
        setAmount("");
        setNote("");
      } else {
        setErrorMsg("Transfer failed. Please try again.");
      }
    } else if (modalType === "ADD") {
      const success = await depositToMain(parsedAmount, note || "Deposit added");
      if (success) {
        setModalType(null);
        setAmount("");
        setNote("");
      } else {
        setErrorMsg("Deposit failed. Please try again.");
      }
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
      {/* ── Hero Wallet Card ────────────────────────────────────── */}
      <WalletCard balance={wallet.balance}>
        <div className="flex flex-col gap-6">
          {/* Card header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-white/60" strokeWidth={1.5} />
              <span className="text-xs text-white/60 font-medium">Main Wallet</span>
            </div>
            <span className="text-xs text-white/50 font-mono">{wallet.cardNumber}</span>
          </div>

          {/* Balance */}
          <BalanceDisplay
            amount={wallet.balance}
            label="Available Balance"
            isVisible={isBalanceVisible}
            onToggleVisibility={() => setIsBalanceVisible((v) => !v)}
            size="xl"
            showChange={true}
            changeAmount={walletNetChange}
            changePercentage={walletChangePercentage}
          />

          {/* Actions row */}
          <div className="flex items-center gap-4 pt-2">
            <ActionButton icon={<Send size={20} />} label="Send" onClick={() => setModalType("SEND")} />
            <ActionButton icon={<Download size={20} />} label="Receive" onClick={() => setModalType("RECEIVE")} />
            <ActionButton icon={<Plus size={20} />} label="Add Money" onClick={() => setModalType("ADD")} />
          </div>
        </div>
      </WalletCard>

      {/* ── Quick Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4 border border-border-subtle">
          <p className="text-xs text-text-tertiary mb-1">Sent this month</p>
          <p className="text-xl font-bold text-text-primary number-font">{formatCurrency(sentSum)}</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight size={12} className="text-error" />
            <span className="text-2xs text-text-tertiary">{sentTxns.length} payments</span>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 border border-border-subtle">
          <p className="text-xs text-text-tertiary mb-1">Received this month</p>
          <p className="text-xl font-bold text-success number-font">{formatCurrency(receivedSum)}</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight size={12} className="text-success rotate-180" />
            <span className="text-2xs text-text-tertiary">{receivedTxns.length} credits</span>
          </div>
        </div>
      </div>

      {/* ── AI Insights ─────────────────────────────────────────── */}
      <AIInsightCarousel insights={mockInsights.slice(0, 3)} />

      {/* ── Recent Transactions ──────────────────────────────────── */}
      <TransactionList
        transactions={walletTransactions}
        title="Recent Transactions"
        seeAllHref="/history"
        limit={5}
      />

      {/* ── Action Modals ────────────────────────────────────────── */}
      <Modal
        isOpen={modalType === "SEND" || modalType === "ADD"}
        onClose={() => {
          setModalType(null);
          setAmount("");
          setNote("");
          setErrorMsg("");
        }}
        title={modalType === "SEND" ? "Send Money" : "Add Money"}
        description={
          modalType === "SEND"
            ? "Enter the transfer amount and details."
            : "Enter the deposit amount to fund your Main Wallet."
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

          {/* Description/Note input */}
          <input
            type="text"
            placeholder="Add a note (e.g. rent share, demo funding)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-12 px-4 bg-bg-elevated border border-border-default rounded-2xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary"
          />

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-error text-xs">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button onClick={handleAction} className="w-full mt-2" variant="primary" size="lg" disabled={isLoading}>
            {isLoading ? "Processing..." : `Confirm ${modalType === "SEND" ? "Send" : "Deposit"}`}
          </Button>
        </div>
      </Modal>

      {/* ── Receive QR Display Modal ─────────────────────────────── */}
      <Modal
        isOpen={modalType === "RECEIVE"}
        onClose={() => setModalType(null)}
        title="Receive Funds"
        description="Scan this demo QR code to transfer funds to this Main Wallet."
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-48 h-48 bg-white p-3 rounded-2xl flex items-center justify-center border border-border-subtle shadow-md">
            {/* Simple Branded Demo QR placeholder */}
            <div className="relative w-full h-full border-4 border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center">
              <span className="text-3xs text-zinc-400 font-bold uppercase tracking-wider text-center">SmartSave QR</span>
              <span className="text-4xs text-zinc-400 font-mono mt-1 select-all">{wallet.cardNumber}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-text-primary">Card Number</p>
            <p className="text-xs text-text-tertiary font-mono select-all">{wallet.cardNumber}</p>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
