"use client";

import { motion } from "framer-motion";
import { PlayCircle, ArrowDown } from "lucide-react";
import styles from "./Hero.module.css";
import Visualizer from "./Visualizer";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import type { SiteSettings } from "@/types";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Hero({ settings, ready }: { settings: SiteSettings; ready: boolean }) {
  const { analyser, isPlaying, tracks, play } = useAudioPlayer();

  const handlePlayFirst = () => {
    if (tracks[0]) play(tracks[0]);
    else document.getElementById("morceaux")?.scrollIntoView({ behavior: "smooth" });
  };

  const nameParts = settings.artist_name.split("");

  return (
    <section id="top" className={styles.hero}>
      <div className={styles.glow} aria-hidden>
        <div className={`${styles.glowBlob} ${styles.glowBlobOne}`} />
        <div className={`${styles.glowBlob} ${styles.glowBlobTwo}`} />
      </div>

      <div className={styles.vizLayer}>
        <Visualizer analyser={analyser} isPlaying={isPlaying} bars={64} color="#ff3fa4" colorEnd="#8b5cf6" />
      </div>

      <div className={styles.content}>
        <motion.div
          className={styles.eyebrowRow}
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        >
          <span className={styles.dot} />
          <span className="eyebrow">{settings.hero_tagline}</span>
        </motion.div>

        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        >
          {nameParts.map((c, i) => (
            <span key={i} className={i === nameParts.length - 1 ? styles.titleAccent : ""}>
              {c}
            </span>
          ))}
        </motion.h1>

        <motion.p
          className={styles.desc}
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
        >
          {settings.hero_desc}
        </motion.p>

        <motion.div
          className={styles.ctaRow}
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
        >
          <button onClick={handlePlayFirst} className={styles.ctaPrimary} data-cursor="interactive">
            <PlayCircle size={17} />
            Écouter maintenant
          </button>
          <a href="#univers" className={styles.ctaSecondary} data-cursor="interactive">
            Découvrir l&rsquo;univers
          </a>
        </motion.div>
      </div>

      <div className={styles.scrollHint}>
        <span className={styles.scrollLine} />
        <ArrowDown size={12} />
        <span>Scroll</span>
      </div>
    </section>
  );
}
