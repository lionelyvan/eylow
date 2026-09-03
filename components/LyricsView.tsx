"use client";

import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Music4, Play, Radio } from "lucide-react";
import styles from "./LyricsView.module.css";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import {
  activeLineIndex,
  lineProgress,
  parseDurationLabel,
  parseLyrics,
  wordThresholds,
} from "@/lib/lyrics";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Lit l'énergie audio en direct (moyenne du spectre de fréquences) et la
 * pose sur l'élément référencé via la variable CSS --energy, 60 fois par
 * seconde, sans passer par un re-render React. C'est ce qui fait "vivre"
 * la ligne active au rythme réel du morceau : plus le son est intense,
 * plus la lueur et le léger zoom de la ligne en cours s'accentuent.
 */
function useAudioEnergy(analyser: AnalyserNode | null, isPlaying: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!analyser || !isPlaying) {
      ref.current?.style.setProperty("--energy", "0");
      return;
    }
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;
    let smoothed = 0;

    const loop = () => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = sum / data.length / 255;
      // Léger lissage pour éviter un scintillement nerveux et obtenir une
      // vraie pulsation "au rythme" plutôt qu'un bruit visuel.
      smoothed += (avg - smoothed) * 0.25;
      ref.current?.style.setProperty("--energy", smoothed.toFixed(3));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, [analyser, isPlaying]);

  return ref;
}

export default function LyricsView() {
  const {
    lyricsOpen,
    lyricsTrack,
    closeLyrics,
    current,
    isPlaying,
    currentTime,
    duration,
    analyser,
    play,
    seek,
  } = useAudioPlayer();

  const isActiveTrack = Boolean(lyricsTrack && current?.id === lyricsTrack.id);
  const effectiveDuration = isActiveTrack ? duration : parseDurationLabel(lyricsTrack?.duration);
  const effectiveTime = isActiveTrack ? currentTime : 0;
  const roundedDuration = Math.round(effectiveDuration);

  const { lines, synced } = useMemo(
    () => parseLyrics(lyricsTrack?.lyrics, effectiveDuration),
    // On ne recalcule pas à chaque frame : uniquement quand la piste ou sa
    // durée change (la durée passe de 0 aux vraies métadonnées une fois).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lyricsTrack?.id, lyricsTrack?.lyrics, roundedDuration]
  );

  const activeIdx = isActiveTrack ? activeLineIndex(lines, effectiveTime) : -1;
  const progress = isActiveTrack ? lineProgress(lines, activeIdx, effectiveTime) : 0;

  const energyRef = useAudioEnergy(analyser, isActiveTrack && isPlaying);
  const bodyRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (activeIdx < 0) return;
    const el = lineRefs.current[activeIdx];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIdx]);

  const handleLineClick = (line: { time: number }) => {
    if (!isActiveTrack || !lyricsTrack) return;
    seek(line.time);
  };

  return (
    <AnimatePresence>
      {lyricsOpen && lyricsTrack && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          role="dialog"
          aria-modal="true"
          aria-label={`Paroles de ${lyricsTrack.name}`}
        >
          <div ref={energyRef} className={styles.backdrop}>
            <div className={styles.blobA} />
            <div className={styles.blobB} />
            <div className={styles.blobC} />
          </div>

          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.headerArt}>
                <Music4 size={19} strokeWidth={1.5} />
              </div>
              <div className={styles.headerText}>
                <div className={styles.headerName}>{lyricsTrack.name}</div>
                <div className={`${styles.badge} ${synced ? styles.badgeSynced : ""}`}>
                  <span className={styles.badgeDot} />
                  {synced ? "Paroles synchronisées" : "Rythme estimé"}
                </div>
              </div>
            </div>
            <button
              className={styles.closeBtn}
              onClick={closeLyrics}
              aria-label="Fermer les paroles"
              data-cursor="interactive"
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.body} ref={bodyRef}>
            {lines.length === 0 ? (
              <div className={styles.emptyState}>
                <Music4 size={30} strokeWidth={1.2} />
                <span>Paroles à venir pour ce morceau.</span>
              </div>
            ) : (
              lines.map((line, i) => {
                const isActive = i === activeIdx;
                const isDone = i < activeIdx;
                const words = isActive ? wordThresholds(line.text) : null;

                return (
                  <div
                    key={`${line.time}-${i}`}
                    ref={(el) => {
                      lineRefs.current[i] = el;
                    }}
                    className={`${styles.line} ${isActive ? styles.lineActive : ""} ${
                      isDone ? styles.lineDone : ""
                    }`}
                    onClick={() => handleLineClick(line)}
                  >
                    {isActive && words
                      ? words.map((w, wi) => (
                          <span
                            key={wi}
                            className={`${styles.word} ${
                              w.threshold <= progress ? styles.wordSung : ""
                            }`}
                          >
                            {w.word}
                            {wi < words.length - 1 ? "\u00A0" : ""}
                          </span>
                        ))
                      : line.text}
                  </div>
                );
              })
            )}
          </div>

          {!isActiveTrack && lines.length > 0 && (
            <div className={styles.footerHint}>
              <button
                className={styles.playCta}
                onClick={() => play(lyricsTrack)}
                data-cursor="interactive"
              >
                <Play size={15} /> Lire ce morceau pour synchroniser
              </button>
            </div>
          )}

          {isActiveTrack && !synced && (
            <div className={styles.footerHint}>
              <span className={styles.syncHint}>
                <Radio size={12} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
                Rythme estimé à partir de la longueur des lignes. Colle des paroles au format
                LRC (ex. [00:12.50] texte) pour un calage parfait.
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
