"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";
interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

const ToastContext = createContext<((message: string, type?: ToastType) => void) | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "clamp(90px, 12vh, 120px)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 500,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(18,15,22,0.92)",
                border: `1px solid ${
                  t.type === "error" ? "#ff453a55" : t.type === "success" ? "#ff2d7855" : "#ffffff22"
                }`,
                color: "#f5f5f7",
                padding: "12px 18px",
                borderRadius: "var(--radius-full)",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.01em",
                backdropFilter: "blur(14px)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              }}
            >
              {t.type === "success" && <CheckCircle2 size={15} color="#ff5ea8" />}
              {t.type === "error" && <XCircle size={15} color="#ff453a" />}
              {t.type === "info" && <Info size={15} color="#b0abc0" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé dans <ToastProvider>");
  return ctx;
}
