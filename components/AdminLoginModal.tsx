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
            background: "rgba(4, 3, 6, 0.75)",
            backdropFilter: "blur(10px)",
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
            className="glass"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "100%",
              maxWidth: 380,
              background: "rgba(18, 15, 22, 0.85)",
              padding: 30,
              position: "relative",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
            }}
          >
            <button
              type="button"
              onClick={closeLogin}
              aria-label="Fermer"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "rgba(255,255,255,0.06)",
                border: "none",
                color: "var(--blanc2)",
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "var(--gradient-brand)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Lock size={15} color="#fff" />
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
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
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "var(--radius-md)",
                color: "var(--blanc)",
                padding: "14px 16px",
                fontSize: 14.5,
                marginBottom: 16,
                outline: "none",
              }}
            />

            <button
              type="submit"
              disabled={loading || !password}
              style={{
                width: "100%",
                background: "var(--gradient-brand)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-full)",
                padding: "14px 16px",
                fontSize: 13,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontWeight: 700,
                opacity: loading || !password ? 0.55 : 1,
                boxShadow: "0 8px 24px rgba(255,45,120,0.3)",
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
