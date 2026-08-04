"use client";

import { useEffect, useState } from "react";
import { AudioPlayerProvider, useAudioPlayer } from "@/context/AudioPlayerContext";
import { AdminProvider } from "@/context/AdminContext";
import { ToastProvider } from "@/context/ToastContext";
import CinematicIntro from "@/components/CinematicIntro";
import CustomCursor from "@/components/CustomCursor";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import TracksSection from "@/components/TracksSection";
import { Contact, Footer } from "@/components/Contact";
import PlayerBar from "@/components/PlayerBar";
import LyricsPanel from "@/components/LyricsPanel";
import AdminLoginModal from "@/components/AdminLoginModal";
import type { SiteSettings, Track } from "@/types";

function PageBody({ initialSettings }: { initialSettings: SiteSettings }) {
  const { tracks, setTracks } = useAudioPlayer();
  const [settings, setSettings] = useState(initialSettings);

  const handleTrackAdded = (track: Track) => setTracks([track, ...tracks]);
  const handleTrackRemoved = (id: string) => setTracks(tracks.filter((t) => t.id !== id));
  const handlePhotoUpdated = (url: string) => setSettings((s) => ({ ...s, photo_url: url }));

  return (
    <div className="use-custom-cursor">
      <Nav artistName={settings.artist_name} />
      <Hero settings={settings} ready />
      <About settings={settings} trackCount={tracks.length} onPhotoUpdated={handlePhotoUpdated} />
      <TracksSection onTrackAdded={handleTrackAdded} onTrackRemoved={handleTrackRemoved} />
      <Contact settings={settings} />
      <Footer artistName={settings.artist_name} />
      <PlayerBar />
      <LyricsPanel />
      <AdminLoginModal />
    </div>
  );
}

function TracksHydrator({ tracks }: { tracks: Track[] }) {
  const { setTracks } = useAudioPlayer();
  useEffect(() => {
    setTracks(tracks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function SiteExperience({
  initialTracks,
  initialSettings,
}: {
  initialTracks: Track[];
  initialSettings: SiteSettings;
}) {
  const [introDone, setIntroDone] = useState(false);

  return (
    <AudioPlayerProvider>
      <AdminProvider>
        <ToastProvider>
          <TracksHydrator tracks={initialTracks} />
          <div className="grain" />
          <CustomCursor />
          {!introDone && <CinematicIntro onComplete={() => setIntroDone(true)} />}
          <PageBody initialSettings={initialSettings} />
        </ToastProvider>
      </AdminProvider>
    </AudioPlayerProvider>
  );
}
