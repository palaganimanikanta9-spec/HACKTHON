"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Brain,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIInsight } from "@/types";
import { staggerItem } from "@/lib/animations";

// ── Icon map for insights ─────────────────────────────────────────

const insightIconMap: Record<string, React.ElementType> = {
  "trending-up": TrendingUp,
  "shield-check": ShieldCheck,
  "alert-circle": AlertCircle,
  "brain": Brain,
  "sparkles": Sparkles,
};

// ── Color map ─────────────────────────────────────────────────────

const insightColorMap = {
  emerald: {
    bg: "bg-success/10 border-success/20",
    icon: "bg-success/15 text-success",
    badge: "text-success",
  },
  violet: {
    bg: "bg-accent-primary/10 border-accent-primary/20",
    icon: "bg-accent-primary/15 text-accent-primary-light",
    badge: "text-accent-primary-light",
  },
  amber: {
    bg: "bg-warning/10 border-warning/20",
    icon: "bg-warning/15 text-warning",
    badge: "text-warning",
  },
  cyan: {
    bg: "bg-accent-secondary/10 border-accent-secondary/20",
    icon: "bg-accent-secondary/15 text-accent-secondary",
    badge: "text-accent-secondary",
  },
  rose: {
    bg: "bg-error/10 border-error/20",
    icon: "bg-error/15 text-error",
    badge: "text-error",
  },
};

// ── AI Insight Card ────────────────────────────────────────────────

interface AIInsightCardProps {
  insight: AIInsight;
  className?: string;
}

export function AIInsightCard({ insight, className }: AIInsightCardProps) {
  const { title, description, impact, impactType, icon, color } = insight;

  const colors = insightColorMap[color] ?? insightColorMap.violet;
  const IconComp = insightIconMap[icon] ?? Sparkles;

  return (
    <motion.div
      variants={staggerItem}
      className={cn(
        "p-4 rounded-2xl border flex gap-3",
        colors.bg,
        className
      )}
    >
      {/* Icon */}
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", colors.icon)}>
        <IconComp size={18} strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          <span className={cn("text-sm font-bold number-font flex-shrink-0", colors.badge)}>
            {impact}
          </span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// ── AI Insight Carousel (horizontal scroll) ─────────────────────

interface AIInsightCarouselProps {
  insights: AIInsight[];
  className?: string;
}

export function AIInsightCarousel({ insights, className }: AIInsightCarouselProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* AI powered label */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-5 h-5 rounded-md bg-accent-primary/20 flex items-center justify-center">
          <Brain size={11} className="text-accent-primary-light" />
        </div>
        <p className="text-xs font-semibold text-accent-primary-light uppercase tracking-wider">
          AI Insights
        </p>
      </div>

      {/* Horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
        {insights.map((insight) => (
          <AIInsightCard
            key={insight.id}
            insight={insight}
            className="min-w-72 flex-shrink-0"
          />
        ))}
      </div>
    </div>
  );
}

// ── AI Verification Status Steps ──────────────────────────────────

export type VerificationStep = "pending" | "active" | "completed" | "failed";

interface VerificationStepItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  status: VerificationStep;
}

interface VerificationStatusProps {
  steps: VerificationStepItem[];
  className?: string;
}

export function VerificationStatus({ steps, className }: VerificationStatusProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {steps.map((step, i) => {
        const IconComp = step.icon;
        const isActive = step.status === "active";
        const isCompleted = step.status === "completed";
        const isFailed = step.status === "failed";

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl",
              isActive && "bg-accent-primary/10 border border-accent-primary/20",
              isCompleted && "bg-success/5 border border-success/15",
              isFailed && "bg-error/10 border border-error/20",
              step.status === "pending" && "bg-bg-elevated border border-border-subtle opacity-50"
            )}
          >
            {/* Step icon */}
            <motion.div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                isActive && "bg-accent-primary text-white",
                isCompleted && "bg-success text-white",
                isFailed && "bg-error text-white",
                step.status === "pending" && "bg-bg-overlay text-text-tertiary"
              )}
              animate={isActive ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {isCompleted ? (
                <span className="text-sm">✓</span>
              ) : isFailed ? (
                <span className="text-sm">✗</span>
              ) : (
                <IconComp size={16} strokeWidth={2} />
              )}
            </motion.div>

            {/* Step content */}
            <div className="flex-1">
              <p className={cn(
                "text-sm font-semibold",
                isActive ? "text-accent-primary-light" : isCompleted ? "text-success" : isFailed ? "text-error" : "text-text-tertiary"
              )}>
                {step.label}
              </p>
              <p className="text-xs text-text-tertiary">{step.description}</p>
            </div>

            {/* Active spinner */}
            {isActive && (
              <div className="w-4 h-4 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin flex-shrink-0" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
