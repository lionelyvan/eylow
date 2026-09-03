"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface AdminState {
  isAdmin: boolean;
  checking: boolean;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminState | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setIsAdmin(Boolean(d.isAdmin)))
      .catch(() => setIsAdmin(false))
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (password: string) => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const ok = res.ok;
    if (ok) {
      setIsAdmin(true);
      setLoginOpen(false);
    }
    return ok;
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAdmin(false);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        checking,
        loginOpen,
        openLogin: () => setLoginOpen(true),
        closeLogin: () => setLoginOpen(false),
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin doit être utilisé dans <AdminProvider>");
  return ctx;
}
