import { useSmartSaveStore } from "@/store/use-smartsave-store";
import type { Transaction } from "@/types";

export const transactionService = {
  getTransactions: () => {
    return useSmartSaveStore.getState().transactions;
  },

  getTransactionsByWallet: (walletType: "MAIN" | "SAVINGS" | "STRICT") => {
    return useSmartSaveStore.getState().transactions.filter(
      (txn) => txn.walletType === walletType
    );
  },

};
