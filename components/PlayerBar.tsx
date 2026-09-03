"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Mic2, Volume2, VolumeX } from "lucide-react";
import styles from "./PlayerBar.module.css";
import Visualizer from "./Visualizer";
import { useAudioPlayer } from "@/context/AudioPlayerContext";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function PlayerBar() {
  const {
    current,
    isPlaying,
    currentTime,
    duration,
    volume,
    analyser,
    togglePlay,
    seek,
    setVolume,
    playNext,
    playPrev,
    openLyrics,
  } = useAudioPlayer();

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          className={styles.bar}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.trackInfo}>
            <div className={styles.viz}>
              <Visualizer analyser={analyser} isPlaying={isPlaying} bars={12} />
            </div>
            <span className={styles.name}>{current.name}</span>
            {current.lyrics && (
              <button
                className={styles.iconBtn}
                onClick={() => openLyrics(current)}
                aria-label="Voir les paroles"
                data-cursor="interactive"
              >
                <Mic2 size={16} />
              </button>
            )}
          </div>

          <div className={styles.controls}>
            <button className={styles.iconBtn} onClick={playPrev} aria-label="Morceau précédent" data-cursor="interactive">
              <SkipBack size={17} />
            </button>
            <button
              className={styles.playBtn}
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Lecture"}
              data-cursor="interactive"
            >
              {isPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: 2 }} />}
            </button>
            <button className={styles.iconBtn} onClick={playNext} aria-label="Morceau suivant" data-cursor="interactive">
              <SkipForward size={17} />
            </button>
          </div>

          <div className={styles.timeRow}>
            <span className={styles.time}>{formatTime(currentTime)}</span>
            <input
              className={styles.seek}
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Avancer dans le morceau"
            />
            <span className={styles.time}>{formatTime(duration)}</span>

            <div className={styles.volumeRow}>
              <button
                className={styles.iconBtn}
                onClick={() => setVolume(volume > 0 ? 0 : 0.85)}
                aria-label={volume > 0 ? "Couper le son" : "Rétablir le son"}
                data-cursor="interactive"
              >
                {volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <input
                className={styles.volume}
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
