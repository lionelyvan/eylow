"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, X } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { useToast } from "@/context/ToastContext";

export default function AdminLoginModal() {
  const { loginOpen, closeLogin, login } = useAdmin();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(password);
    setLoading(false);
    setPassword("");
    if (ok) toast("Mode admin activé.", "success");
    else toast("Mot de passe incorrect.", "error");
  };

  return (
    <AnimatePresence>
      {loginOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeLogin}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,8,8,0.85)",
            backdropFilter: "blur(6px)",
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <motion.form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "100%",
              maxWidth: 360,
              background: "var(--noir2)",
              border: "1px solid var(--gris)",
              padding: 28,
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={closeLogin}
              aria-label="Fermer"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "none",
                border: "none",
                color: "var(--blanc2)",
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Lock size={16} color="var(--accent)" />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--blanc2)",
                }}
              >
                Accès administrateur
              </span>
            </div>

            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              style={{
                width: "100%",
                background: "var(--noir3)",
                border: "1px solid var(--gris2)",
                color: "var(--blanc)",
                padding: "12px 14px",
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                marginBottom: 16,
              }}
            />

            <button
              type="submit"
              disabled={loading || !password}
              style={{
                width: "100%",
                background: "var(--accent)",
                color: "var(--noir)",
                border: "none",
                padding: "12px 14px",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontWeight: 700,
                opacity: loading || !password ? 0.6 : 1,
              }}
            >
              {loading ? "Vérification…" : "Se connecter"}
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
