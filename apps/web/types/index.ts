// ═══════════════════════════════════════════════════════════════════
// SHARED TYPESCRIPT TYPES (SmartSave AI Wallet Domain Models)
// ═══════════════════════════════════════════════════════════════════

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  joinedAt: string;
}

export interface WalletAccount {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  cardNumber?: string;
  updatedAt: string;
}

export interface SavingsAccount {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  monthlyGrowth?: number;
  updatedAt: string;
}

export interface StrictSavings {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  withdrawalThreshold: number;
  totalSaved: number;
  startDate: string;
  endDate: string;
  updatedAt: string;
}

export type TransactionType =
  | "SEND"
  | "RECEIVE"
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "AUTO_TRANSFER";

export type TransactionDirection = "CREDIT" | "DEBIT";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";
export type WalletType = "MAIN" | "SAVINGS" | "STRICT";
export type ExpenseClassification = "ESSENTIAL" | "NON_ESSENTIAL";

export interface Transaction {
  id: string;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  currency: string;
  counterpartyName?: string;
  description?: string;
  status: TransactionStatus;
  walletType: WalletType;
  classification?: ExpenseClassification;
  createdAt: string;
  icon?: string;
}

export interface Transfer {
  fromAccount: WalletType;
  toAccount: WalletType;
  amount: number;
  description?: string;
  timestamp: string;
}

export type NotificationType = "SUCCESS" | "WARNING" | "INFO" | "ERROR";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Threshold {
  amount: number;
  currency: string;
  updatedAt: string;
}

export type VerificationRequestStatus =
  | "PENDING_VERIFICATION"
  | "VERIFYING"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "AUTO_APPROVED";

export interface VerificationRequest {
  id: string;
  amount: number;
  status: VerificationRequestStatus;
  classification?: ExpenseClassification;
  confidence?: number;
  reasoning?: string;
  expiresAt: string;
  createdAt: string;
}

export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface AppSettings {
  theme: "dark" | "light" | "system";
  biometricsEnabled: boolean;
  notificationsEnabled: boolean;
  strictModeEnabled: boolean;
}

export type Theme = "dark" | "light" | "system";

export type InsightType =
  | "SAVING_OPPORTUNITY"
  | "STRICT_SAVINGS_MILESTONE"
  | "SPENDING_ALERT"
  | "AI_PROTECTION";

export type InsightColor = "emerald" | "violet" | "amber" | "cyan" | "rose";

export interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  impact: string;
  impactType: "positive" | "negative" | "warning";
  icon: string;
  color: InsightColor;
  createdAt: string;
}
