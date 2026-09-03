"use client";

import { useEffect, useRef } from "react";

interface VisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  bars?: number;
  color?: string;
  colorEnd?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Dessine des barres de fréquences réelles quand l'audio joue (via AnalyserNode),
 * avec un dégradé rose -> violet façon égaliseur Apple Music. Retombe sur une
 * respiration ambiante douce quand rien ne joue, pour ne jamais afficher un
 * visualiseur figé.
 */
export default function Visualizer({
  analyser,
  isPlaying,
  bars = 48,
  color = "#ff3fa4",
  colorEnd = "#8b5cf6",
  className,
  style,
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const idlePhase = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const gap = w / bars;
      const barWidth = Math.max(2, gap * 0.5);
      const gradient = ctx.createLinearGradient(0, h, 0, 0);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, colorEnd);

      for (let i = 0; i < bars; i++) {
        let value: number;
        if (isPlaying && analyser && dataArray) {
          analyser.getByteFrequencyData(dataArray);
          const idx = Math.floor((i / bars) * dataArray.length * 0.75);
          value = dataArray[idx] / 255;
        } else {
          idlePhase.current += 0.015;
          value = (Math.sin(idlePhase.current + i * 0.5) + 1) / 2;
          value = 0.06 + value * 0.1;
        }
        const barHeight = Math.max(2, value * h);
        const x = i * gap + gap / 2 - barWidth / 2;
        const y = h - barHeight;
        ctx.fillStyle = gradient;
        ctx.globalAlpha = isPlaying ? 0.95 : 0.32;
        const radius = Math.min(barWidth / 2, 3);
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(x, y, barWidth, barHeight, radius);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [analyser, isPlaying, bars, color, colorEnd]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  );
}
