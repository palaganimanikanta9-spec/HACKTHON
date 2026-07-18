// ═══════════════════════════════════════════════════════════════════
// MOCK DATA — Realistic SmartSave AI Wallet data
// ═══════════════════════════════════════════════════════════════════

import type {
  User,
  WalletAccount,
  SavingsAccount,
  StrictSavings,
  Transaction,
  AIInsight,
  Notification,
} from "@/types";

// ── User Profile ──────────────────────────────────────────────────

export const mockUser: User = {
  id: "usr_2abc123",
  firstName: "Alex",
  lastName: "Morgan",
  email: "alex.morgan@gmail.com",
  avatarUrl: "https://api.dicebear.com/8.x/notionists/svg?seed=alex",
  joinedAt: "2024-01-15T10:00:00Z",
};

// ── Main Wallet ───────────────────────────────────────────────────

export const mockWallet: WalletAccount = {
  id: "wlt_xyz1",
  userId: "usr_2abc123",
  balance: 12845.50,
  currency: "USD",
  cardNumber: "**** **** **** 4291",
  updatedAt: new Date().toISOString(),
};

// ── Normal Savings ────────────────────────────────────────────────

export const mockNormalSavings: SavingsAccount = {
  id: "sav_xyz2",
  userId: "usr_2abc123",
  balance: 8320.00,
  currency: "USD",
  monthlyGrowth: 2.4,
  updatedAt: new Date().toISOString(),
};

// ── Strict Savings ────────────────────────────────────────────────

export const mockStrictSavings: StrictSavings = {
  id: "sst_xyz3",
  userId: "usr_2abc123",
  balance: 24500.00,
  currency: "USD",
  withdrawalThreshold: 500,
  totalSaved: 32400.00,
  startDate: "2026-07-01T00:00:00Z",
  endDate: "2026-08-01T00:00:00Z",
  updatedAt: new Date().toISOString(),
};

// ── Transactions ──────────────────────────────────────────────────

function daysAgo(d: number): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 59));
  return date.toISOString();
}

export const mockTransactions: Transaction[] = [
  {
    id: "txn_001",
    type: "RECEIVE",
    direction: "CREDIT",
    amount: 3500.00,
    currency: "USD",
    counterpartyName: "Acme Corp (Salary)",
    description: "Monthly salary payment",
    status: "COMPLETED",
    walletType: "MAIN",
    createdAt: daysAgo(0),
    icon: "building",
  },
  {
    id: "txn_002",
    type: "SEND",
    direction: "DEBIT",
    amount: 850.00,
    currency: "USD",
    counterpartyName: "James Wilson",
    description: "Rent split",
    status: "COMPLETED",
    walletType: "MAIN",
    createdAt: daysAgo(0),
    icon: "user",
  },
  {
    id: "txn_003",
    type: "DEPOSIT",
    direction: "DEBIT",
    amount: 1000.00,
    currency: "USD",
    counterpartyName: "Strict Savings",
    description: "Deposit to Strict Savings",
    status: "COMPLETED",
    walletType: "STRICT",
    createdAt: daysAgo(1),
    icon: "shield",
  },
  {
    id: "txn_004",
    type: "SEND",
    direction: "DEBIT",
    amount: 42.99,
    currency: "USD",
    counterpartyName: "Netflix",
    description: "Monthly subscription",
    status: "COMPLETED",
    walletType: "MAIN",
    createdAt: daysAgo(2),
    icon: "tv",
  },
  {
    id: "txn_005",
    type: "WITHDRAWAL",
    direction: "CREDIT",
    amount: 200.00,
    currency: "USD",
    counterpartyName: "Main Wallet",
    description: "Approved — Medical bill (AI verified)",
    status: "COMPLETED",
    walletType: "STRICT",
    classification: "ESSENTIAL",
    createdAt: daysAgo(3),
    icon: "heart-pulse",
  },
  {
    id: "txn_006",
    type: "RECEIVE",
    direction: "CREDIT",
    amount: 250.00,
    currency: "USD",
    counterpartyName: "Sarah Chen",
    description: "Dinner reimbursement",
    status: "COMPLETED",
    walletType: "MAIN",
    createdAt: daysAgo(4),
    icon: "user",
  },
  {
    id: "txn_007",
    type: "SEND",
    direction: "DEBIT",
    amount: 89.50,
    currency: "USD",
    counterpartyName: "Whole Foods Market",
    description: "Groceries",
    status: "COMPLETED",
    walletType: "MAIN",
    createdAt: daysAgo(5),
    icon: "shopping-cart",
  },
  {
    id: "txn_008",
    type: "WITHDRAWAL",
    direction: "CREDIT",
    amount: 150.00,
    currency: "USD",
    counterpartyName: "—",
    description: "Rejected — Entertainment (non-essential)",
    status: "COMPLETED",
    walletType: "STRICT",
    classification: "NON_ESSENTIAL",
    createdAt: daysAgo(6),
    icon: "x-circle",
  },
  {
    id: "txn_009",
    type: "DEPOSIT",
    direction: "CREDIT",
    amount: 500.00,
    currency: "USD",
    counterpartyName: "Normal Savings",
    description: "Monthly savings",
    status: "COMPLETED",
    walletType: "SAVINGS",
    createdAt: daysAgo(7),
    icon: "piggy-bank",
  },
  {
    id: "txn_010",
    type: "SEND",
    direction: "DEBIT",
    amount: 12.99,
    currency: "USD",
    counterpartyName: "Spotify",
    description: "Music subscription",
    status: "COMPLETED",
    walletType: "MAIN",
    createdAt: daysAgo(8),
    icon: "music",
  },
];

// ── AI Insights ───────────────────────────────────────────────────

export const mockInsights: AIInsight[] = [
  {
    id: "ins_001",
    type: "SAVING_OPPORTUNITY",
    title: "You can save $120 this month",
    description: "You spent 40% more on dining last month compared to your average. Cooking at home 3× per week could save you $120.",
    impact: "+$120",
    impactType: "positive",
    icon: "trending-up",
    color: "emerald",
    createdAt: daysAgo(0),
  },
  {
    id: "ins_002",
    type: "STRICT_SAVINGS_MILESTONE",
    title: "Strict Savings up 18% 🎉",
    description: "Your protected savings grew by $3,800 this quarter. Keep it up — you're on track to reach your $30K goal.",
    impact: "+18%",
    impactType: "positive",
    icon: "shield-check",
    color: "violet",
    createdAt: daysAgo(1),
  },
  {
    id: "ins_003",
    type: "SPENDING_ALERT",
    title: "Subscriptions costing $156/month",
    description: "You have 6 active subscriptions. Cancelling 2 unused ones could save you $44 monthly.",
    impact: "-$44/mo",
    impactType: "warning",
    icon: "alert-circle",
    color: "amber",
    createdAt: daysAgo(2),
  },
  {
    id: "ins_004",
    type: "AI_PROTECTION",
    title: "AI blocked 3 impulse withdrawals",
    description: "This month, SmartSave AI prevented 3 non-essential withdrawals totaling $680 from your Strict Savings.",
    impact: "$680 saved",
    impactType: "positive",
    icon: "brain",
    color: "cyan",
    createdAt: daysAgo(3),
  },
];

// ── Notifications ─────────────────────────────────────────────────

export const mockNotifications: Notification[] = [
  {
    id: "notif_001",
    type: "SUCCESS",
    title: "Transfer Approved ✅",
    message: "Your $200 withdrawal was approved after AI verified your medical bill.",
    read: false,
    createdAt: daysAgo(3),
  },
  {
    id: "notif_002",
    type: "WARNING",
    title: "Withdrawal Rejected",
    message: "Your $150 withdrawal was blocked — the document was classified as non-essential (entertainment).",
    read: false,
    createdAt: daysAgo(6),
  },
  {
    id: "notif_003",
    type: "INFO",
    title: "Salary Received 💰",
    message: "Acme Corp deposited $3,500 to your Main Wallet.",
    read: true,
    createdAt: daysAgo(0),
  },
  {
    id: "notif_004",
    type: "INFO",
    title: "Monthly Savings Milestone",
    message: "You've saved $500 this month. You're 62% toward your monthly goal!",
    read: true,
    createdAt: daysAgo(7),
  },
];

// ── Portfolio Summary ─────────────────────────────────────────────

export const mockPortfolioTotal = 
  mockWallet.balance + mockNormalSavings.balance + mockStrictSavings.balance;
// = $45,665.50

export const mockMonthlyChange = {
  amount: 4820.50,
  percentage: 11.8,
  direction: "up" as const,
};

// ── Spending Categories ───────────────────────────────────────────

export const mockSpendingCategories = [
  { category: "Housing", amount: 850, percentage: 38, color: "#8B5CF6" },
  { category: "Food & Groceries", amount: 420, percentage: 19, color: "#10B981" },
  { category: "Subscriptions", amount: 156, percentage: 7, color: "#06B6D4" },
  { category: "Transport", amount: 180, percentage: 8, color: "#F59E0B" },
  { category: "Healthcare", amount: 200, percentage: 9, color: "#EF4444" },
  { category: "Other", amount: 420, percentage: 19, color: "#71717A" },
];
