"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X, ShieldCheck, LogOut } from "lucide-react";
import styles from "./Nav.module.css";
import { useAdmin } from "@/context/AdminContext";

const LINKS = [
  { href: "#univers", label: "Univers" },
  { href: "#morceaux", label: "Morceaux" },
  { href: "#contact", label: "Contact" },
];

export default function Nav({ artistName }: { artistName: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAdmin, openLogin, logout } = useAdmin();
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Garde défensive : si artistName arrive vide/null (settings Supabase
  // incomplets), on retombe sur "Eylow" plutôt que de crasher sur .slice().
  const safeName = artistName && artistName.length > 0 ? artistName : "Eylow";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sur mobile il n'y a pas de double-clic fiable : on déclenche aussi
  // l'ouverture de la connexion admin via un appui long (~600ms) sur le logo.
  const startPress = () => {
    pressTimer.current = setTimeout(() => openLogin(), 600);
  };
  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <a
        href="#top"
        className={styles.logo}
        data-cursor="interactive"
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchMove={cancelPress}
      >
        {safeName.slice(0, safeName.length - 1)}
        <span>{safeName.slice(-1)}</span>
      </a>

      <div className={styles.links}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className={styles.link} data-cursor="interactive">
            {l.label}
          </a>
        ))}
        {isAdmin ? (
          <button
            onClick={logout}
            className={styles.adminDot}
            title="Se déconnecter"
            aria-label="Se déconnecter du mode admin"
            data-cursor="interactive"
          >
            <ShieldCheck size={12} /> Admin <LogOut size={12} style={{ marginLeft: 2 }} />
          </button>
        ) : (
          <button
            onDoubleClick={openLogin}
            className={styles.link}
            style={{ opacity: 0.35, background: "none", border: "none" }}
            title="Double-clique pour te connecter"
            aria-label="Accès administrateur"
            data-cursor="interactive"
          >
            •
          </button>
        )}
      </div>

      <button
        className={styles.menuBtn}
        onClick={() => setMobileOpen((o) => !o)}
        aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        data-cursor="interactive"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {mobileOpen && (
        <div
          className="glass"
          style={{
            position: "fixed",
            inset: "84px 12px 12px",
            background: "rgba(10, 8, 14, 0.92)",
            zIndex: 99,
            display: "flex",
            flexDirection: "column",
            padding: "36px clamp(20px, 5vw, 56px)",
            gap: 26,
            borderRadius: "var(--radius-lg)",
          }}
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--blanc)",
              }}
            >
              {l.label}
            </a>
          ))}

          {/* Accès admin dans le menu mobile : appui long sur le logo pour
              se connecter (voir startPress ci-dessus), et bouton explicite
              de déconnexion ici si déjà connecté. */}
          {isAdmin && (
            <button
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#fff",
                background: "var(--gradient-brand)",
                border: "none",
                borderRadius: "var(--radius-full)",
                padding: "12px 18px",
                width: "fit-content",
                marginTop: 8,
              }}
            >
              <LogOut size={14} /> Déconnexion admin
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
