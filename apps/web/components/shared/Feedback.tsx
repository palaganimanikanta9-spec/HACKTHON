"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Progress Bar ──────────────────────────────────────────────────

interface ProgressBarProps {
  value: number; // 0–100
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: "violet" | "emerald" | "amber" | "cyan" | "rose";
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
}

const progressColorMap = {
  violet: "bg-accent-primary",
  emerald: "bg-success",
  amber: "bg-warning",
  cyan: "bg-accent-secondary",
  rose: "bg-error",
};

const progressSizeMap = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  color = "violet",
  size = "md",
  className,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && <p className="text-xs text-text-secondary">{label}</p>}
          {showValue && (
            <p className="text-xs font-semibold text-text-primary">{Math.round(percentage)}%</p>
          )}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-bg-overlay overflow-hidden", progressSizeMap[size])}>
        <motion.div
          className={cn("h-full rounded-full", progressColorMap[color])}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

// ── Circular Progress ─────────────────────────────────────────────

interface CircularProgressProps {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
  className?: string;
}

export function CircularProgress({
  value,
  size = 64,
  strokeWidth = 6,
  color = "hsl(var(--accent-primary))",
  trackColor = "hsl(var(--bg-overlay))",
  children,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(value, 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedMap = {
  sm: "rounded",
  md: "rounded-xl",
  lg: "rounded-2xl",
  full: "rounded-full",
};

export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton",
        roundedMap[rounded],
        className
      )}
    />
  );
}

// ── Card Skeleton ─────────────────────────────────────────────────

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-3xl p-6 bg-bg-surface border border-border-subtle", className)}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-12" rounded="full" />
        </div>
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

// ── Transaction Item Skeleton ─────────────────────────────────────

export function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <Skeleton className="w-10 h-10 flex-shrink-0" rounded="full" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

// ── Loading Spinner ───────────────────────────────────────────────

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const spinnerSizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
};

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "border-2 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin",
        spinnerSizeMap[size],
        className
      )}
    />
  );
}

// ── Loading Screen ────────────────────────────────────────────────

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-16 h-16 rounded-2xl bg-accent-primary flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full" />
        </motion.div>
      </motion.div>
      <p className="text-sm text-text-tertiary">Loading SmartSave…</p>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center gap-4 py-12 px-6 text-center", className)}
    >
      <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center text-text-tertiary">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-tertiary">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
}

// ── Error State ────────────────────────────────────────────────────

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again or contact support.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("flex flex-col items-center gap-4 py-12 px-6 text-center", className)}
    >
      <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center text-error text-2xl">
        ⚠️
      </div>
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-tertiary">{description}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-semibold text-accent-primary hover:underline"
        >
          Try again
        </button>
      )}
    </motion.div>
  );
}

// ── Step Indicator ─────────────────────────────────────────────────

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-0", className)}>
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                  isCompleted && "bg-success border-success text-white",
                  isActive && "bg-accent-primary border-accent-primary text-white",
                  !isCompleted && !isActive && "bg-transparent border-border-default text-text-tertiary"
                )}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {isCompleted ? "✓" : i + 1}
              </motion.div>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-1",
                i < currentStep ? "bg-success" : "bg-border-default"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
