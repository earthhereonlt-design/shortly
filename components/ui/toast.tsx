"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

const ToastCtx = React.createContext<(t: Omit<Toast, "id" | "variant"> & { variant?: ToastVariant }) => void>(
  () => {},
);

export function useToast() {
  return React.useContext(ToastCtx);
}

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <Check className="h-4 w-4 text-emerald-400" />,
  error: <TriangleAlert className="h-4 w-4 text-red-400" />,
  info: <Info className="h-4 w-4 text-brand-violet" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = React.useCallback<React.ContextType<typeof ToastCtx>>((t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id, variant: t.variant ?? "success" }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-[min(92vw,360px)] flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="glass-strong pointer-events-auto flex items-start gap-3 rounded-2xl p-4 shadow-soft"
            >
              <div className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-surface-elevated">
                {icons[t.variant]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-ink-muted">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-ink-faint transition-colors hover:text-ink"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
