import { useSmartSaveStore } from "@/store/use-smartsave-store";

export const strictSavingsService = {
  getAccount: () => {
    return useSmartSaveStore.getState().strictSavings;
  },

  deposit: (amount: number) => {
    if (amount <= 0) return false;
    return useSmartSaveStore.getState().depositToStrictSavings(amount);
  },

  initiateWithdrawal: (amount: number) => {
    if (amount <= 0) {
      return { status: "AUTO_APPROVED" as const, request: null };
    }
    return useSmartSaveStore.getState().initiateStrictSavingsWithdrawal(amount);
  },

  completeVerification: (requestId: string, status: "APPROVED" | "REJECTED", reason?: string) => {
    useSmartSaveStore.getState().completeVerificationFlow(requestId, status, reason);
  },

  getBalance: () => {
    return useSmartSaveStore.getState().strictSavings.balance;
  },

  getThreshold: () => {
    return useSmartSaveStore.getState().strictSavings.withdrawalThreshold;
  },
};
