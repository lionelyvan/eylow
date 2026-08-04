"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  // Reste `false` au rendu serveur / première passe client pour éviter tout
  // mismatch d'hydratation ; on ne connaît le type de pointeur qu'une fois
  // monté dans le navigateur, d'où l'activation dans l'effet ci-dessous.
  const [enabled, setEnabled] = useState(false);
  const [hoveringInteractive, setHoveringInteractive] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- détection de capacité device (pointer fin) impossible à connaître avant le montage client
    setEnabled(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let ringX = window.innerWidth / 2;
    let ringY = window.innerHeight / 2;
    let dotX = ringX;
    let dotY = ringY;
    let targetX = ringX;
    let targetY = ringY;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      const el = e.target as HTMLElement;
      setHoveringInteractive(Boolean(el.closest("a, button, [data-cursor='interactive']")));
    };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const render = () => {
      dotX += (targetX - dotX) * 0.35;
      dotY += (targetY - dotY) * 0.35;
      ringX += (targetX - ringX) * 0.14;
      ringY += (targetY - ringY) * 0.14;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--accent)",
          pointerEvents: "none",
          zIndex: 999,
          willChange: "transform",
        }}
      />
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: hoveringInteractive ? 52 : 32,
          height: hoveringInteractive ? 52 : 32,
          borderRadius: "50%",
          border: `1px solid ${hoveringInteractive ? "var(--accent)" : "rgba(240,236,228,0.35)"}`,
          background: hoveringInteractive ? "rgba(200,255,0,0.06)" : "transparent",
          pointerEvents: "none",
          zIndex: 998,
          willChange: "transform, width, height",
          transition: "width 0.25s ease, height 0.25s ease, border-color 0.25s ease, background 0.25s ease",
        }}
      />
    </>
  );
}
