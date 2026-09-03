"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Mic2, Trash2, UploadCloud, Music2, Music4 } from "lucide-react";
import styles from "./Tracks.module.css";
import Visualizer from "./Visualizer";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { useAdmin } from "@/context/AdminContext";
import { useToast } from "@/context/ToastContext";
import type { Track } from "@/types";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function TracksSection({
  onTrackAdded,
  onTrackRemoved,
}: {
  onTrackAdded: (track: Track) => void;
  onTrackRemoved: (id: string) => void;
}) {
  const { tracks, current, isPlaying, analyser, play, togglePlay, openLyrics } = useAudioPlayer();
  const { isAdmin } = useAdmin();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRowPlay = (track: Track) => {
    if (current?.id === track.id) togglePlay();
    else play(track);
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast("Seuls les fichiers audio sont acceptés.", "error");
      return;
    }
    setUploading(true);
    setProgressLabel("Envoi du fichier…");
    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch("/api/tracks/upload", { method: "POST", body: form });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Échec de l'upload.");

      setProgressLabel("Enregistrement…");
      const createRes = await fetch("/api/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: uploadData.name,
          url: uploadData.url,
          storage_path: uploadData.storage_path,
          size: uploadData.size,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Échec de l'enregistrement.");

      onTrackAdded(createData.track);
      toast(`"${createData.track.name}" ajouté.`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Une erreur est survenue.", "error");
    } finally {
      setUploading(false);
      setProgressLabel("");
    }
  };

  const handleDelete = async (track: Track) => {
    if (!confirm(`Supprimer "${track.name}" définitivement ?`)) return;
    setDeletingId(track.id);
    try {
      const res = await fetch(`/api/tracks/${track.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la suppression.");
      onTrackRemoved(track.id);
      toast("Morceau supprimé.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Une erreur est survenue.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section id="morceaux" className={styles.section}>
      <div className={styles.header}>
        <motion.h2
          className={styles.heading}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          Mes <span>sons</span>
        </motion.h2>
        <span className={styles.count}>{tracks.length} morceau{tracks.length > 1 ? "x" : ""}</span>
      </div>

      <div className={styles.list}>
        {tracks.length === 0 && (
          <div className={styles.empty}>
            {isAdmin
              ? "Aucun morceau pour l'instant — ajoute le premier ci-dessous."
              : "De nouveaux sons arrivent bientôt."}
          </div>
        )}

        {tracks.map((track, i) => {
          const isActive = current?.id === track.id;
          const isRowPlaying = isActive && isPlaying;
          return (
            <motion.div
              key={track.id}
              className={`${styles.row} ${isActive ? styles.rowActive : ""}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: EASE, delay: Math.min(i * 0.04, 0.3) }}
            >
              <div className={styles.artwork}>
                <Music4 size={20} strokeWidth={1.5} />
                <button
                  className={styles.playBtn}
                  onClick={() => handleRowPlay(track)}
                  aria-label={isRowPlaying ? `Mettre en pause ${track.name}` : `Lire ${track.name}`}
                  data-cursor="interactive"
                >
                  {isRowPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
                </button>
              </div>

              <div className={styles.trackInfo}>
                <div className={styles.trackName}>{track.name}</div>
                <div className={styles.trackMeta}>
                  {track.size || "—"}
                  {track.duration ? ` · ${track.duration}` : ""}
                </div>
              </div>

              <div className={styles.miniViz}>
                <Visualizer analyser={analyser} isPlaying={isRowPlaying} bars={14} />
              </div>

              <div className={styles.rowActions}>
                {track.lyrics && (
                  <button
                    className={styles.iconBtn}
                    onClick={() => openLyrics(track)}
                    aria-label={`Voir les paroles de ${track.name}`}
                    data-cursor="interactive"
                  >
                    <Mic2 size={15} />
                  </button>
                )}
                {isAdmin && (
                  <button
                    className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                    onClick={() => handleDelete(track)}
                    disabled={deletingId === track.id}
                    aria-label={`Supprimer ${track.name}`}
                    data-cursor="interactive"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {isAdmin && (
        <>
          <div
            className={`${styles.uploadZone} ${dragActive ? styles.uploadZoneActive : ""}`}
            onClick={() => !uploading && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) uploadFile(file);
            }}
            data-cursor="interactive"
          >
            <span className={styles.uploadLabel}>
              {uploading ? <Music2 size={22} /> : <UploadCloud size={22} />}
              {uploading ? progressLabel : "Glisse un morceau ici, ou clique pour parcourir"}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="audio/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFile(file);
                e.target.value = "";
              }}
            />
          </div>
          {uploading && (
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: "70%" }} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
