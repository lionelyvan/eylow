"use client";

import { useEffect, useState } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";
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
  const { isAdmin, openLogin } = useAdmin();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <a href="#top" className={styles.logo} data-cursor="interactive">
        {artistName.slice(0, artistName.length - 1)}
        <span>{artistName.slice(-1)}</span>
      </a>

      <div className={styles.links}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className={styles.link} data-cursor="interactive">
            {l.label}
          </a>
        ))}
        {isAdmin ? (
          <span className={styles.adminDot}>
            <ShieldCheck size={12} /> Admin
          </span>
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
          style={{
            position: "fixed",
            inset: 0,
            top: 68,
            background: "var(--noir)",
            zIndex: 99,
            display: "flex",
            flexDirection: "column",
            padding: "32px clamp(20px, 5vw, 56px)",
            gap: 28,
          }}
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 36,
                color: "var(--blanc)",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
