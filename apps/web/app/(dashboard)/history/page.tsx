"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Calendar, Shield, PiggyBank, CreditCard, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/shared/Cards";
import { TransactionList } from "@/components/shared/Lists";
import { SearchBar } from "@/components/shared/SearchBar";
import { staggerContainer } from "@/lib/animations";
import { useSmartSaveStore } from "@/store/use-smartsave-store";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const { transactions } = useSmartSaveStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "MAIN" | "SAVINGS" | "STRICT">("ALL");

  // Filter transactions
  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.counterpartyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = activeFilter === "ALL" || txn.walletType === activeFilter;

    return matchesSearch && matchesType;
  });

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
          <h1 className="text-xl font-bold text-text-primary">Transaction History</h1>
          <p className="text-xs text-text-tertiary">Monitor all incoming and outgoing funds</p>
        </div>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Search Bar */}
        <SearchBar
          placeholder="Search by name, category, or note..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "ALL", label: "All Activity", icon: Sparkles },
            { id: "MAIN", label: "Wallet", icon: CreditCard },
            { id: "SAVINGS", label: "Savings", icon: PiggyBank },
            { id: "STRICT", label: "Protected", icon: Shield },
          ].map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border",
                  isActive
                    ? "bg-accent-primary border-accent-primary text-white"
                    : "bg-bg-surface border-border-subtle text-text-secondary hover:text-text-primary"
                )}
              >
                <Icon size={12} />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Transaction List ──────────────────────────────────────── */}
      <GlassCard padding="none" className="overflow-hidden border border-border-subtle bg-bg-surface/50">
        <TransactionList
          transactions={filteredTransactions}
          title=""
          isLoading={false}
        />
      </GlassCard>
    </motion.div>
  );
}
