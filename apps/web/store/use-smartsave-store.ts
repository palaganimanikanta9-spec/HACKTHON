import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  User,
  WalletAccount,
  SavingsAccount,
  StrictSavings,
  Transaction,
  Notification,
  AppSettings,
  VerificationRequest,
} from "@/types";
import {
  mockUser,
  mockWallet,
  mockNormalSavings,
  mockStrictSavings,
} from "@/lib/mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface SmartSaveState {
  // Domain States
  user: User;
  wallet: WalletAccount;
  normalSavings: SavingsAccount;
  strictSavings: StrictSavings;
  transactions: Transaction[];
  notifications: Notification[];
  settings: AppSettings;
  verificationRequests: VerificationRequest[];
  currentVerificationRequest: VerificationRequest | null;
  token: string | null;

  // Sync Actions
  setToken: (token: string | null) => void;
  syncUser: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
  }) => Promise<void>;
  fetchData: () => Promise<void>;

  // Actions - Main Wallet
  depositToMain: (amount: number, description?: string) => Promise<boolean>;
  withdrawFromMain: (amount: number, description?: string) => Promise<boolean>;

  // Actions - Normal Savings
  depositToNormalSavings: (amount: number) => Promise<boolean>;
  withdrawFromNormalSavings: (amount: number) => Promise<boolean>;

  // Actions - Strict Savings
  depositToStrictSavings: (amount: number) => Promise<boolean>;
  initiateStrictSavingsWithdrawal: (amount: number) => Promise<{
    status: "AUTO_APPROVED" | "PENDING_VERIFICATION";
    requestId?: string;
    amount: number;
    message?: string;
  }>;
  uploadProofDocument: (file: File) => Promise<{
    status: "APPROVED" | "REJECTED";
    reasoning: string;
    ocr: any;
    ai: any;
  } | null>;
  completeVerificationFlow: (requestId: string, status: "APPROVED" | "REJECTED", reason?: string) => Promise<void>;
  updateThreshold: (amount: number) => Promise<boolean>;

  // Actions - General & Notifications
  markNotificationsAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<boolean>;
  setTheme: (theme: AppSettings["theme"]) => Promise<void>;
  resetAllData: () => Promise<void>;
}

export const useSmartSaveStore = create<SmartSaveState>()(
  persist(
    (set, get) => ({
      // ── Initial State ───────────────────────────────────────────
      user: mockUser,
      wallet: mockWallet,
      normalSavings: mockNormalSavings,
      strictSavings: mockStrictSavings,
      transactions: [],
      notifications: [],
      verificationRequests: [],
      currentVerificationRequest: null,
      token: null,
      settings: {
        theme: "dark",
        biometricsEnabled: true,
        notificationsEnabled: true,
        strictModeEnabled: true,
      },

      // ── Sync Actions ────────────────────────────────────────────
      setToken: (token) => {
        set({ token });
      },

      syncUser: async (userData) => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_BASE}/users/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          });
          if (res.ok) {
            const { data } = await res.json();
            const { profile } = data;
            set({
              user: {
                id: profile.id,
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                avatarUrl: profile.avatarUrl || undefined,
                joinedAt: profile.createdAt,
              },
            });
          }
        } catch (err) {
          console.error("Failed to sync user profile with backend:", err);
        }
      },

      fetchData: async () => {
        const { token } = get();
        if (!token) return;
        try {
          // 1. Fetch user profile containing all accounts & settings
          const profileRes = await fetch(`${API_BASE}/users/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (profileRes.ok) {
            const { data } = await profileRes.json();
            const { profile } = data;
            set({
              wallet: {
                id: profile.wallet.id,
                userId: profile.id,
                balance: Number(profile.wallet.balance),
                currency: profile.wallet.currency,
                cardNumber: profile.wallet.cardNumber,
                updatedAt: profile.wallet.updatedAt,
              },
              normalSavings: {
                id: profile.normalSavings.id,
                userId: profile.id,
                balance: Number(profile.normalSavings.balance),
                currency: profile.normalSavings.currency,
                monthlyGrowth: Number(profile.normalSavings.monthlyGrowth),
                updatedAt: profile.normalSavings.updatedAt,
              },
              strictSavings: {
                id: profile.strictSavings.id,
                userId: profile.id,
                balance: Number(profile.strictSavings.balance),
                currency: profile.strictSavings.currency,
                withdrawalThreshold: Number(profile.strictSavings.withdrawalThreshold),
                totalSaved: Number(profile.strictSavings.totalSaved),
                startDate: profile.strictSavings.startDate,
                endDate: profile.strictSavings.endDate,
                updatedAt: profile.strictSavings.updatedAt,
              },
              settings: {
                theme: profile.settings?.theme || "dark",
                biometricsEnabled: profile.settings?.biometricsEnabled ?? true,
                notificationsEnabled: profile.settings?.notificationsEnabled ?? true,
                strictModeEnabled: profile.settings?.strictModeEnabled ?? true,
              },
            });
          }

          // 2. Fetch transactions
          const txnRes = await fetch(`${API_BASE}/transactions`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (txnRes.ok) {
            const { data } = await txnRes.json();
            const txns = data.transactions.map((t: any) => ({
              ...t,
              amount: Number(t.amount),
            }));
            set({ transactions: txns });
          }

          // 3. Fetch notifications
          const notifRes = await fetch(`${API_BASE}/notifications`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (notifRes.ok) {
            const { data } = await notifRes.json();
            set({ notifications: data.notifications });
          }
        } catch (err) {
          console.error("Failed to load dashboard data from API:", err);
        }
      },

      // ── Actions: Main Wallet ────────────────────────────────────
      depositToMain: async (amount, description = "Received Funds") => {
        const { token } = get();
        if (!token) return false;
        try {
          const res = await fetch(`${API_BASE}/wallet/deposit`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ amount, description }),
          });
          if (res.ok) {
            await get().fetchData();
            return true;
          }
          const err = await res.json().catch(() => ({}));
          console.error("Wallet deposit failed:", res.status, err);
        } catch (err) {
          console.error("Wallet deposit network error:", err);
        }
        return false;
      },

      withdrawFromMain: async (amount, description = "Sent Funds") => {
        const { token } = get();
        if (!token) return false;
        try {
          const res = await fetch(`${API_BASE}/wallet/withdraw`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ amount, description }),
          });
          if (res.ok) {
            await get().fetchData();
            return true;
          }
          const err = await res.json().catch(() => ({}));
          console.error("Wallet withdrawal failed:", res.status, err);
        } catch (err) {
          console.error("Wallet withdrawal network error:", err);
        }
        return false;
      },

      // ── Actions: Normal Savings ─────────────────────────────────
      depositToNormalSavings: async (amount) => {
        const { token } = get();
        if (!token) return false;
        try {
          const res = await fetch(`${API_BASE}/savings/deposit`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ amount }),
          });
          if (res.ok) {
            await get().fetchData();
            return true;
          }
          const err = await res.json().catch(() => ({}));
          console.error("Savings deposit failed:", res.status, err);
        } catch (err) {
          console.error("Savings deposit network error:", err);
        }
        return false;
      },

      withdrawFromNormalSavings: async (amount) => {
        const { token } = get();
        if (!token) return false;
        try {
          const res = await fetch(`${API_BASE}/savings/withdraw`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ amount }),
          });
          if (res.ok) {
            await get().fetchData();
            return true;
          }
          const err = await res.json().catch(() => ({}));
          console.error("Savings withdrawal failed:", res.status, err);
        } catch (err) {
          console.error("Savings withdrawal network error:", err);
        }
        return false;
      },

      // ── Actions: Strict Savings ─────────────────────────────────
      depositToStrictSavings: async (amount) => {
        const { token } = get();
        if (!token) return false;
        try {
          const res = await fetch(`${API_BASE}/strict-savings/deposit`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ amount }),
          });
          if (res.ok) {
            await get().fetchData();
            return true;
          }
          const err = await res.json().catch(() => ({}));
          console.error("Strict deposit failed:", res.status, err);
        } catch (err) {
          console.error("Strict deposit network error:", err);
        }
        return false;
      },

      initiateStrictSavingsWithdrawal: async (amount) => {
        const { token } = get();
        if (!token) return { status: "PENDING_VERIFICATION", amount };
        try {
          const res = await fetch(`${API_BASE}/strict-savings/withdraw`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ amount }),
          });

          if (res.ok) {
            const json = await res.json();
            const { status, requestId, message } = json.data;

            const requestObj = requestId
              ? {
                  id: requestId,
                  amount,
                  status: "PENDING_VERIFICATION" as const,
                  expiresAt: new Date(Date.now() + 30 * 60000).toISOString(),
                  createdAt: new Date().toISOString(),
                }
              : null;

            set({
              currentVerificationRequest: requestObj,
            });

            await get().fetchData();

            return {
              status,
              requestId,
              amount,
              message,
            };
          }
          const err = await res.json().catch(() => ({}));
          console.error("Strict withdrawal failed:", res.status, err);
        } catch (err) {
          console.error("Strict withdrawal initiation failed:", err);
        }
        return { status: "PENDING_VERIFICATION", amount };
      },

      uploadProofDocument: async (file: File) => {
        const { currentVerificationRequest, token } = get();
        if (!currentVerificationRequest || !token) return null;

        const formData = new FormData();
        formData.append("document", file);
        formData.append("requestId", currentVerificationRequest.id);

        try {
          const res = await fetch(`${API_BASE}/strict-savings/upload`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (res.ok) {
            const json = await res.json();
            const { ai, ocr } = json.data;

            const status = ai.approved ? "APPROVED" : "REJECTED";
            const reasoning = ai.reason;

            // Instantly finalize decision in database
            const decideRes = await fetch(`${API_BASE}/strict-savings/decide`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                requestId: currentVerificationRequest.id,
                status,
                reasoning,
              }),
            });

            if (decideRes.ok) {
              set({ currentVerificationRequest: null });
              await get().fetchData();
              return {
                status,
                reasoning,
                ocr,
                ai,
              };
            } else {
              const decideErr = await decideRes.text().catch(() => "");
              console.error("Strict savings decision finalization failed:", decideRes.status, decideErr);
            }
          } else {
            const err = await res.json().catch(() => ({}));
            console.error("Upload proof failed:", res.status, err);
          }
        } catch (err) {
          console.error("Failed to upload and verify document:", err);
        }
        return null;
      },

      completeVerificationFlow: async (requestId, status, reason = "") => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_BASE}/strict-savings/decide`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ requestId, status, reasoning: reason }),
          });
          if (res.ok) {
            set({ currentVerificationRequest: null });
            await get().fetchData();
          }
        } catch (err) {
          console.error("Failed to resolve verification request:", err);
        }
      },

      updateThreshold: async (amount) => {
        const { token } = get();
        if (!token) return false;
        try {
          const res = await fetch(`${API_BASE}/strict-savings/threshold`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ amount }),
          });
          if (res.ok) {
            await get().fetchData();
            return true;
          }
        } catch (err) {
          console.error("Failed to update strict savings threshold:", err);
        }
        return false;
      },

      // ── Actions: General ────────────────────────────────────────
      markNotificationsAsRead: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_BASE}/notifications/read-all`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            await get().fetchData();
          }
        } catch (err) {
          console.error("Failed to mark notifications as read:", err);
        }
      },

      clearNotifications: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_BASE}/notifications/clear-all`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            await get().fetchData();
          }
        } catch (err) {
          console.error("Failed to clear notifications:", err);
        }
      },

      updateSettings: async (newSettings) => {
        const { token } = get();
        if (!token) return false;
        try {
          const res = await fetch(`${API_BASE}/users/settings`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newSettings),
          });
          if (res.ok) {
            await get().fetchData();
            return true;
          }
        } catch (err) {
          console.error("Failed to update settings:", err);
        }
        return false;
      },

      setTheme: async (theme) => {
        await get().updateSettings({ theme });
      },

      resetAllData: async () => {
        // Dev helper to clear client state
        set({
          user: mockUser,
          wallet: mockWallet,
          normalSavings: mockNormalSavings,
          strictSavings: mockStrictSavings,
          transactions: [],
          notifications: [],
          verificationRequests: [],
          currentVerificationRequest: null,
          token: null,
        });
      },
    }),
    {
      name: "smartsave-wallet-storage",
    }
  )
);
