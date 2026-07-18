"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { backdropVariants, modalVariants, drawerVariants } from "@/lib/animations";

// ── Modal ─────────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-modal bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={cn(
                "w-full max-w-sm rounded-3xl overflow-hidden",
                "bg-bg-surface border border-border-subtle",
                "shadow-2xl",
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {(title || description) && (
                <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                  <div>
                    {title && (
                      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                    )}
                    {description && (
                      <p className="text-sm text-text-secondary mt-1">{description}</p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors ml-4 flex-shrink-0"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className={title ? "pb-6 px-6" : "p-6"}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Drawer (Bottom Sheet) ─────────────────────────────────────────

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: "auto" | "half" | "full";
  className?: string;
}

export function Drawer({ isOpen, onClose, title, children, height = "auto", className }: DrawerProps) {
  const heightClass = {
    auto: "max-h-[90vh]",
    half: "h-[50vh]",
    full: "h-[90vh]",
  }[height];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-modal bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            variants={drawerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app z-modal",
              "rounded-t-3xl overflow-hidden",
              "bg-bg-surface border-t border-border-subtle",
              heightClass,
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-border-default" />
            </div>

            {title && (
              <div className="px-6 pb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-tertiary"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="overflow-y-auto scrollable px-6 pb-8">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  const confirmClass = variant === "danger"
    ? "bg-error text-white hover:bg-red-600"
    : "bg-accent-primary text-white hover:bg-accent-primary-hover";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description}>
      <div className="flex gap-3 pt-4">
        <button
          onClick={onClose}
          className="flex-1 h-11 rounded-full border border-border-default text-text-primary text-sm font-semibold hover:bg-bg-elevated transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            "flex-1 h-11 rounded-full text-sm font-semibold transition-all",
            confirmClass,
            isLoading && "opacity-50 pointer-events-none"
          )}
        >
          {isLoading ? "…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ── Toast ─────────────────────────────────────────────────────────

interface ToastProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  onDismiss: (id: string) => void;
}

const toastIconMap = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

const toastBgMap = {
  success: "border-success/30 bg-success/10",
  error: "border-error/30 bg-error/10",
  warning: "border-warning/30 bg-warning/10",
  info: "border-info/30 bg-info/10",
};

export function Toast({ id, type, title, message, onDismiss }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={cn(
        "flex items-start gap-3 p-4 rounded-2xl border",
        "glass-strong shadow-lg",
        toastBgMap[type]
      )}
    >
      <span className="text-xl flex-shrink-0">{toastIconMap[type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {message && <p className="text-xs text-text-secondary mt-0.5">{message}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="text-text-tertiary hover:text-text-primary transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ── Toast Container ────────────────────────────────────────────────

interface ToastContainerProps {
  toasts: ToastProps[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-toast flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
