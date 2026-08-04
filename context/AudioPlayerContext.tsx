"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Track } from "@/types";

interface AudioPlayerState {
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  current: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  lyricsOpen: boolean;
  lyricsTrack: Track | null;
  analyser: AnalyserNode | null;
  play: (track: Track) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  playNext: () => void;
  playPrev: () => void;
  openLyrics: (track?: Track) => void;
  closeLyrics: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerState | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [current, setCurrent] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [lyricsTrack, setLyricsTrack] = useState<Track | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const playNextRef = useRef<() => void>(() => {});

  // Initialise l'élément <audio> + le graphe Web Audio une seule fois
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnd = () => playNextRef.current?.();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => {
      // Le bug était ici : sans ce listener, une erreur de chargement audio
      // (URL invalide, bucket Supabase privé, CORS manquant sur le bucket
      // "musiques", format non supporté...) échouait totalement en silence.
      const mediaError = audio.error;
      const codeMap: Record<number, string> = {
        1: "MEDIA_ERR_ABORTED (chargement interrompu)",
        2: "MEDIA_ERR_NETWORK (échec réseau : vérifie l'URL et les CORS du bucket Supabase)",
        3: "MEDIA_ERR_DECODE (fichier corrompu ou format non décodable)",
        4: "MEDIA_ERR_SRC_NOT_SUPPORTED (URL invalide, bucket privé, ou format non supporté)",
      };
      console.error(
        "[AudioPlayer] Échec de lecture du morceau :",
        audio.src || "(pas de src)",
        mediaError ? codeMap[mediaError.code] ?? mediaError.code : "erreur inconnue"
      );
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      audio.pause();
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  const setupAnalyser = useCallback(() => {
    if (!audioRef.current || sourceRef.current) return;
    try {
      const AudioCtx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const src = ctx.createMediaElementSource(audioRef.current);
      const node = ctx.createAnalyser();
      node.fftSize = 128;
      node.smoothingTimeConstant = 0.75;
      src.connect(node);
      node.connect(ctx.destination);
      ctxRef.current = ctx;
      sourceRef.current = src;
      setAnalyser(node);
    } catch (err) {
      // Web Audio indisponible (navigateur restreint) : le lecteur fonctionne quand même,
      // seul le visualiseur retombera sur une animation ambiante. On logge quand même
      // pour éviter un échec totalement silencieux.
      console.warn("[AudioPlayer] Analyser Web Audio indisponible :", err);
    }
  }, []);

  const play = useCallback(
    (track: Track) => {
      const audio = audioRef.current;
      if (!audio) return;
      setupAnalyser();
      ctxRef.current?.resume().catch(() => {});

      if (current?.id !== track.id) {
        audio.src = track.url;
        setCurrent(track);
      }
      audio.play().catch((err) => {
        console.error("[AudioPlayer] audio.play() a échoué pour", track.url, err);
      });
    },
    [current, setupAnalyser]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    ctxRef.current?.resume().catch(() => {});
    if (audio.paused) {
      audio.play().catch((err) => {
        console.error("[AudioPlayer] audio.play() a échoué (togglePlay) pour", audio.src, err);
      });
    } else audio.pause();
  }, [current]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const playNext = useCallback(() => {
    if (!current || tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.id === current.id);
    const next = tracks[(idx + 1) % tracks.length];
    if (next) play(next);
  }, [current, tracks, play]);

  const playPrev = useCallback(() => {
    if (!current || tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.id === current.id);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
    if (prev) play(prev);
  }, [current, tracks, play]);

  // permet à l'event "ended" (enregistré une seule fois) d'appeler la
  // dernière version de playNext sans re-souscrire l'event listener ;
  // pattern "ref callback à jour", mutation volontaire hors des effets DOM
  // eslint-disable-next-line react-hooks/refs -- pattern latest-ref intentionnel, ne pilote aucun rendu
  playNextRef.current = playNext;

  const value = useMemo<AudioPlayerState>(
    () => ({
      tracks,
      setTracks,
      current,
      isPlaying,
      currentTime,
      duration,
      volume,
      lyricsOpen,
      lyricsTrack,
      analyser,
      play,
      togglePlay,
      seek,
      setVolume,
      playNext,
      playPrev,
      openLyrics: (track?: Track) => {
        if (track) setLyricsTrack(track);
        else if (current) setLyricsTrack(current);
        setLyricsOpen(true);
      },
      closeLyrics: () => setLyricsOpen(false),
    }),
    [
      tracks,
      current,
      isPlaying,
      currentTime,
      duration,
      volume,
      lyricsOpen,
      lyricsTrack,
      analyser,
      play,
      togglePlay,
      seek,
      setVolume,
      playNext,
      playPrev,
    ]
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer doit être utilisé dans <AudioPlayerProvider>");
  return ctx;
}
