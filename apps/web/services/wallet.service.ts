import { useSmartSaveStore } from "@/store/use-smartsave-store";

export const walletService = {
  getWallet: () => {
    return useSmartSaveStore.getState().wallet;
  },

  deposit: (amount: number, description?: string) => {
    if (amount <= 0) return false;
    useSmartSaveStore.getState().depositToMain(amount, description);
    return true;
  },

  withdraw: (amount: number, description?: string) => {
    if (amount <= 0) return false;
    return useSmartSaveStore.getState().withdrawFromMain(amount, description);
  },

  getBalance: () => {
    return useSmartSaveStore.getState().wallet.balance;
  },
};
