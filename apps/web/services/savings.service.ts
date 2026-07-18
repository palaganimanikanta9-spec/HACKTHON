import { useSmartSaveStore } from "@/store/use-smartsave-store";

export const savingsService = {
  getAccount: () => {
    return useSmartSaveStore.getState().normalSavings;
  },

  deposit: (amount: number) => {
    if (amount <= 0) return false;
    return useSmartSaveStore.getState().depositToNormalSavings(amount);
  },

  withdraw: (amount: number) => {
    if (amount <= 0) return false;
    return useSmartSaveStore.getState().withdrawFromNormalSavings(amount);
  },

  getBalance: () => {
    return useSmartSaveStore.getState().normalSavings.balance;
  },
};
