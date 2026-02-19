"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error";

type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastPayload = {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
};

interface ToastContextValue {
  showToast: (
    message: string,
    type?: ToastType,
    options?: {
      duration?: number;
      actionLabel?: string;
      onAction?: () => void;
    }
  ) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastPayload[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = React.useCallback(
    (
      message: string,
      type: ToastType = "success",
      options?: {
        duration?: number;
        actionLabel?: string;
        onAction?: () => void;
      }
    ) => {
      const id = Math.random().toString(36).slice(2, 9);
      const payload: ToastPayload = {
        id,
        message,
        type,
        action:
          options?.actionLabel && options.onAction
            ? {
                label: options.actionLabel,
                onClick: options.onAction,
              }
            : undefined,
      };

      setToasts((prev) => [...prev, payload]);

      window.setTimeout(() => {
        removeToast(id);
      }, options?.duration ?? 3200);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[45] flex w-[min(92vw,420px)] flex-col gap-2"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = toast.type === "success" ? CheckCircle2 : AlertTriangle;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 20, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "surface-card flex items-start gap-3 rounded-xl border p-3 shadow-xl",
                  toast.type === "success"
                    ? "border-emerald-500/25 bg-emerald-50/90 text-emerald-950 dark:bg-emerald-900/40 dark:text-emerald-100"
                    : "border-rose-500/25 bg-rose-50/90 text-rose-950 dark:bg-rose-900/40 dark:text-rose-100"
                )}
                role="status"
                aria-live="polite"
              >
                <Icon className="mt-0.5 h-4 w-4" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{toast.message}</p>
                  {toast.action ? (
                    <button
                      type="button"
                      onClick={() => {
                        toast.action?.onClick();
                        removeToast(toast.id);
                      }}
                      className="mt-1 text-xs font-semibold uppercase tracking-wide underline decoration-current/60 underline-offset-4"
                    >
                      {toast.action.label}
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-md p-1 transition hover:bg-black/5 dark:hover:bg-white/10"
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
