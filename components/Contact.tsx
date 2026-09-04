"use client";

import { motion } from "framer-motion";
import { Mail, Instagram, Music } from "lucide-react";
import styles from "./Contact.module.css";
import type { SiteSettings } from "@/types";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Contact({ settings }: { settings: SiteSettings }) {
  return (
    <section id="contact" className={styles.contact}>
      <motion.div
        className={`eyebrow ${styles.eyebrow}`}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        Collaboration
      </motion.div>

      <motion.h2
        className={styles.heading}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
      >
        Un projet, une idée,
        <br />
        <span>parlons-en.</span>
      </motion.h2>

      <motion.div
        className={styles.links}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
      >
        <a href={`mailto:${settings.email}`} className={styles.linkItem} data-cursor="interactive">
          <Mail size={15} /> {settings.email}
        </a>
        <a
          href={settings.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.linkItem}
          data-cursor="interactive"
        >
          <Instagram size={15} /> Instagram
        </a>
        <a
          href={settings.bandlab_url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.linkItem}
          data-cursor="interactive"
        >
          <Music size={15} /> BandLab
        </a>
      </motion.div>
    </section>
  );
}

export function Footer({ artistName }: { artistName: string }) {
  return (
    <footer className={styles.footer}>
      <span>
        © {new Date().getFullYear()} {artistName}. Tous droits réservés.
      </span>
      <span>Build by <a href="https://obus-co.vercel.app" target="_blank" rel="noopener noreferrer" data-cursor="interactive">OBUS</a></span>
    </footer>
  );
}
