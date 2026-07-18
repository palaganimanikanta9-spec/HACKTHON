import { z } from "zod";

// ── User Validation ───────────────────────────────────────────────

export const syncUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  avatarUrl: z.string().url("Invalid avatar URL").optional().nullable(),
});

// ── Wallet / Transaction Validation ───────────────────────────────

export const depositSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  description: z.string().max(100, "Description is too long").optional(),
});

export const withdrawSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  description: z.string().max(100, "Description is too long").optional(),
});

export const transferSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  description: z.string().max(100, "Description is too long").optional(),
});

// ── Strict Savings Validation ─────────────────────────────────────

export const thresholdSchema = z.object({
  amount: z.number().nonnegative("Threshold must be positive or zero"),
});

// ── Settings Validation ───────────────────────────────────────────

export const settingsSchema = z.object({
  biometricsEnabled: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
  strictModeEnabled: z.boolean().optional(),
  theme: z.string().optional(),
  withdrawalThreshold: z.number().nonnegative().optional(),
  endDate: z.string().optional(),
});

