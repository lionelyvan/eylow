"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./CinematicIntro.module.css";

const WORD = "EYLOW";
const EASE = [0.16, 1, 0.3, 1] as const;
const SESSION_KEY = "eylow_intro_seen";

export default function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<"loading" | "reveal" | "hold" | "exit" | "gone">("loading");
  const [percent, setPercent] = useState(0);
  const [skippable, setSkippable] = useState(false);
  const finishedRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    onComplete();
  };

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadySeen =
      typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1";

    if (reduced || alreadySeen) {
      finish();
      return;
    }

    const t = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timers.current.push(id);
    };

    // Compte réel simulé (le poids réel des polices/assets est faible, on
    // orchestre plutôt un rythme intentionnel façon générique de film)
    const start = performance.now();
    const DURATION = 2400;
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / DURATION) * 100));
      setPercent(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setStage("reveal");
      }
    };
    raf = requestAnimationFrame(tick);

    t(() => setSkippable(true), 700);

    return () => {
      cancelAnimationFrame(raf);
      const pendingTimers = timers.current;
      pendingTimers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stage === "reveal") {
      const id = setTimeout(() => setStage("hold"), 1000);
      timers.current.push(id);
    }
    if (stage === "hold") {
      const id = setTimeout(() => setStage("exit"), 650);
      timers.current.push(id);
    }
    if (stage === "exit") {
      const id = setTimeout(() => {
        setStage("gone");
        finish();
      }, 900);
      timers.current.push(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `finish` est stable en pratique (idempotent, sans dépendance réactive)
  }, [stage]);

  const handleSkip = () => {
    if (stage === "exit" || stage === "gone") return;
    setStage("exit");
  };

  if (stage === "gone") return null;

  const revealed = stage === "reveal" || stage === "hold" || stage === "exit";

  return (
    <AnimatePresence>
      <motion.div
        className={styles.screen}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        role="presentation"
        aria-hidden={stage === "exit"}
      >
          <div className={styles.scanline} />

          <div className={styles.center}>
            <div className={styles.wordmarkRow} aria-label="Eylow">
              {WORD.split("").map((letter, i) => (
                <motion.span
                  key={i}
                  className={`${styles.letter} ${!revealed ? "" : ""}`}
                  initial={{ opacity: 0, y: 24, rotateX: 40, filter: "blur(6px)" }}
                  animate={
                    revealed
                      ? { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }
                      : { opacity: 0.08, y: 0, rotateX: 0, filter: "blur(0px)" }
                  }
                  transition={{
                    duration: 0.7,
                    ease: EASE,
                    delay: revealed ? i * 0.07 : 0,
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            <motion.p
              className={styles.tagline}
              initial={{ opacity: 0 }}
              animate={{ opacity: revealed ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
            >
              lowstuff
            </motion.p>

            <div className={styles.eq} aria-hidden>
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.span
                  key={i}
                  className={styles.eqBar}
                  animate={{ height: [4, 18, 6, 20, 4] }}
                  transition={{
                    duration: 1.1 + (i % 3) * 0.15,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.06,
                  }}
                />
              ))}
            </div>
          </div>

          <div className={styles.progressBarTrack}>
            <motion.div
              className={styles.progressBarFill}
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className={styles.progressRow}>
            <span>CHARGEMENT DE L&rsquo;UNIVERS SONORE</span>
            <span>{String(percent).padStart(3, "0")}%</span>
          </div>

          <AnimatePresence>
            {skippable && stage === "loading" && (
              <motion.button
                key="skip"
                className={styles.skip}
                onClick={handleSkip}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                Passer →
              </motion.button>
            )}
          </AnimatePresence>

          {stage === "exit" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", zIndex: 5 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={styles.curtain}
                  style={{ left: `${(i * 100) / 6}%` }}
                  initial={{ y: 0 }}
                  animate={{ y: i % 2 === 0 ? "-100%" : "100%" }}
                  transition={{ duration: 0.75, delay: i * 0.05, ease: EASE }}
                />
              ))}
            </div>
          )}
      </motion.div>
    </AnimatePresence>
  );
}
