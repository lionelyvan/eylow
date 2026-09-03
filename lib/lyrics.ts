/**
 * Synchronisation des paroles.
 *
 * Deux modes :
 *
 * 1. "Synced" — si le texte collé dans le champ `lyrics` est au format LRC
 *    standard (`[mm:ss.xx] texte`, l'export de la plupart des logiciels
 *    d'écriture/karaoké), chaque ligne a un horodatage exact et le défilement
 *    colle parfaitement à la voix, comme sur Apple Music.
 *
 * 2. "Estimated" — sinon (simple texte collé sans minutage), on répartit les
 *    lignes sur la durée réelle du morceau au prorata de leur longueur
 *    (une ligne deux fois plus longue occupe deux fois plus de temps), avec
 *    une petite marge en début/fin de piste. Ce n'est pas un calage au mot
 *    près, mais un rythme de lecture crédible qui suit la structure du texte.
 *
 * Dans les deux cas, l'affichage anime en plus un "balayage" mot par mot à
 * l'intérieur de la ligne active, et une pulsation qui réagit en direct à
 * l'énergie audio du morceau (voir useAudioEnergy dans LyricsView).
 */

export interface LyricLine {
  time: number;
  text: string;
}

export interface LyricsData {
  lines: LyricLine[];
  synced: boolean;
}

const LRC_LINE = /^\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]\s*(.*)$/;

export function parseLyrics(raw: string | null | undefined, duration: number): LyricsData {
  if (!raw || !raw.trim()) return { lines: [], synced: false };

  const rawLines = raw.split(/\r?\n/).map((l) => l.trim());
  const matches = rawLines.map((l) => l.match(LRC_LINE));
  const hasTimestamps = matches.some(Boolean);

  if (hasTimestamps) {
    const lines: LyricLine[] = [];
    rawLines.forEach((_, i) => {
      const m = matches[i];
      if (!m) return;
      const [, mm, ss, ms, text] = m;
      const time = parseInt(mm, 10) * 60 + parseInt(ss, 10) + (ms ? Number(`0.${ms}`) : 0);
      const cleaned = text.trim();
      if (cleaned.length > 0) lines.push({ time, text: cleaned });
    });
    lines.sort((a, b) => a.time - b.time);
    return { lines, synced: true };
  }

  const nonEmpty = rawLines.filter((l) => l.length > 0);
  if (nonEmpty.length === 0) return { lines: [], synced: false };

  const weights = nonEmpty.map((l) => Math.max(4, l.length));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  // Sans durée connue (métadonnées pas encore chargées), on estime ~2.8s
  // par ligne pour donner tout de même un rythme de lecture cohérent.
  const usableDuration = duration > 0 ? duration * 0.92 : nonEmpty.length * 2.8;
  const startOffset = duration > 0 ? Math.min(duration * 0.03, 4) : 0.6;

  let acc = startOffset;
  const lines: LyricLine[] = nonEmpty.map((text, i) => {
    const time = acc;
    acc += (weights[i] / totalWeight) * usableDuration;
    return { time, text };
  });

  return { lines, synced: false };
}

/** Convertit "3:45" ou "1:02:03" en secondes. Retourne 0 si non parsable. */
export function parseDurationLabel(label: string | null | undefined): number {
  if (!label) return 0;
  const parts = label.split(":").map((p) => Number(p.trim()));
  if (parts.some((p) => Number.isNaN(p))) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

/** Index de la ligne active pour un instant `t` donné. */
export function activeLineIndex(lines: LyricLine[], t: number): number {
  if (lines.length === 0) return -1;
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= t) idx = i;
    else break;
  }
  return idx;
}

/**
 * Fraction (0..1) de progression de la voix à l'intérieur de la ligne active,
 * utilisée pour le balayage mot par mot façon karaoké.
 */
export function lineProgress(lines: LyricLine[], activeIndex: number, t: number): number {
  if (activeIndex < 0 || activeIndex >= lines.length) return 0;
  const start = lines[activeIndex].time;
  const end = activeIndex + 1 < lines.length ? lines[activeIndex + 1].time : start + 4;
  if (end <= start) return 1;
  return Math.min(1, Math.max(0, (t - start) / (end - start)));
}

/**
 * Découpe une ligne en mots avec, pour chacun, la fraction cumulée (0..1) de
 * la ligne qu'il faut avoir atteinte pour que ce mot soit "chanté" — au
 * prorata de sa longueur en caractères, une bonne approximation du débit
 * vocal en l'absence d'horodatage mot par mot.
 */
export function wordThresholds(text: string): { word: string; threshold: number }[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const weights = words.map((w) => w.length + 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  return words.map((word, i) => {
    acc += weights[i];
    return { word, threshold: acc / total };
  });
}
