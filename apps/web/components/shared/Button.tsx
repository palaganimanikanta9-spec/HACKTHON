"use client";

import React from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Button Variants ────────────────────────────────────────────────

const buttonVariants = cva(
  // Base
  "inline-flex items-center justify-center gap-2 font-semibold select-none touch-manipulation transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-primary text-white hover:bg-accent-primary-hover shadow-md hover:shadow-violet",
        secondary:
          "bg-bg-elevated text-text-primary border border-border-default hover:bg-bg-overlay hover:border-border-strong",
        ghost:
          "bg-transparent text-text-primary hover:bg-bg-elevated",
        danger:
          "bg-error/10 text-error border border-error/30 hover:bg-error/20",
        success:
          "bg-success/10 text-success border border-success/30 hover:bg-success/20",
        glass:
          "glass text-text-primary hover:bg-bg-elevated",
        gradient:
          "bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-700 hover:to-violet-600 shadow-md hover:shadow-violet",
      },
      size: {
        xs: "h-7 px-3 text-xs rounded-full",
        sm: "h-9 px-4 text-sm rounded-full",
        md: "h-11 px-5 text-sm rounded-full",
        lg: "h-13 px-6 text-base rounded-full",
        xl: "h-14 px-8 text-base rounded-full",
        icon: "h-10 w-10 rounded-full p-0",
        "icon-sm": "h-8 w-8 rounded-full p-0",
        "icon-lg": "h-12 w-12 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.1 }}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

// ── Icon Button (standalone) ──────────────────────────────────────

interface IconButtonProps extends Omit<ButtonProps, "leftIcon" | "rightIcon"> {
  icon: React.ReactNode;
  label: string;
}

export function IconButton({ icon, label, className, variant = "ghost", size = "icon", ...props }: IconButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("flex-shrink-0", className)}
      aria-label={label}
      {...props}
    >
      {icon}
    </Button>
  );
}

// ── Action Button (for wallet actions) ───────────────────────────

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
}

export function ActionButton({ icon, label, onClick, disabled, className }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center gap-2 group disabled:opacity-40",
        className
      )}
    >
      <motion.div
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center",
          "bg-bg-elevated border border-border-subtle",
          "text-accent-primary",
          "group-hover:bg-accent-primary group-hover:text-white group-hover:border-accent-primary",
          "transition-colors duration-200"
        )}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {icon}
      </motion.div>
      <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
        {label}
      </span>
    </button>
  );
}

export { buttonVariants };
