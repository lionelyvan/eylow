"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Camera, ImagePlus } from "lucide-react";
import styles from "./About.module.css";
import { useAdmin } from "@/context/AdminContext";
import { useToast } from "@/context/ToastContext";
import type { SiteSettings } from "@/types";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function About({
  settings,
  trackCount,
  onPhotoUpdated,
}: {
  settings: SiteSettings;
  trackCount: number;
  onPhotoUpdated: (url: string) => void;
}) {
  const { isAdmin } = useAdmin();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/settings/photo", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'upload.");
      onPhotoUpdated(data.photo_url);
      toast("Photo mise à jour.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur lors de l'upload.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section id="univers" className={styles.about}>
      <div className={styles.grid}>
        <motion.div
          className={styles.photoWrap}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {settings.photo_url ? (
            <Image
              src={settings.photo_url}
              alt={settings.artist_name}
              fill
              sizes="(max-width: 860px) 100vw, 40vw"
              className={styles.photoImg}
            />
          ) : (
            <div className={styles.photoPlaceholder}>
              <Camera size={28} strokeWidth={1.2} />
              {isAdmin ? "Aucune photo — clique pour en ajouter une" : "Portrait à venir"}
            </div>
          )}
          <div className={styles.photoFrame} />

          {isAdmin && (
            <div className={styles.uploadOverlay} onClick={() => inputRef.current?.click()}>
              <span className={styles.uploadLabel}>
                <ImagePlus size={20} />
                {uploading ? "Envoi…" : "Changer la photo"}
              </span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          <div className={`eyebrow ${styles.kicker}`}>L&rsquo;artiste</div>
          <h2 className={styles.heading}>
            Chaque son
            <br />
            est un choix.
          </h2>
          <p className={styles.paragraph}>{settings.about_text_1}</p>
          <p className={styles.paragraph}>{settings.about_text_2}</p>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{String(trackCount).padStart(2, "0")}</span>
              <span className={styles.statLabel}>Morceaux</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>{settings.stat_eps}</span>
              <span className={styles.statLabel}>EP</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>{settings.stat_years}</span>
              <span className={styles.statLabel}>Ans de pratique</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
