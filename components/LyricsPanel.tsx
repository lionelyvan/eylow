"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAudioPlayer } from "@/context/AudioPlayerContext";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function LyricsPanel() {
  const { lyricsOpen, lyricsTrack, closeLyrics } = useAudioPlayer();

  return (
    <AnimatePresence>
      {lyricsOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLyrics}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(8,8,8,0.7)",
              backdropFilter: "blur(4px)",
              zIndex: 250,
            }}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(440px, 100%)",
              background: "var(--noir2)",
              borderLeft: "1px solid var(--gris)",
              zIndex: 251,
              padding: "32px clamp(24px, 4vw, 40px)",
              overflowY: "auto",
            }}
          >
            <button
              onClick={closeLyrics}
              aria-label="Fermer les paroles"
              style={{
                background: "none",
                border: "1px solid var(--gris2)",
                color: "var(--blanc)",
                width: 38,
                height: 38,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 28,
              }}
            >
              <X size={16} />
            </button>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 8,
              }}
            >
              Paroles
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 40,
                color: "var(--blanc)",
                marginBottom: 24,
                lineHeight: 1,
              }}
            >
              {lyricsTrack?.name}
            </h3>

            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "var(--font-body)",
                fontWeight: 300,
                fontSize: 16,
                lineHeight: 1.9,
                color: "var(--blanc2)",
              }}
            >
              {lyricsTrack?.lyrics || "Paroles à venir."}
            </pre>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
