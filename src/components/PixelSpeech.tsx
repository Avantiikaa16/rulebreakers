"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { usePixelVoice } from "@/lib/usePixelVoice";

/**
 * Pixel's dialogue as a character speech bubble, never a chat log.
 * Keep copy to at most two short sentences (child-safe dialogue constraints).
 * Pass `voice` to have Pixel say it out loud on mount.
 */
export function PixelSpeech({
  children,
  tone = "neutral",
  voice,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "curious" | "worried" | "happy";
  voice?: string;
}) {
  const { speak } = usePixelVoice();

  useEffect(() => {
    if (voice) speak(voice);
  }, [voice, speak]);

  const color =
    tone === "curious"
      ? "var(--explore)"
      : tone === "worried"
        ? "var(--challenge)"
        : tone === "happy"
          ? "var(--supported)"
          : "var(--line)";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative mx-auto max-w-md rounded-3xl border-2 bg-bg-card px-5 py-4 text-center text-lg"
      style={{ borderColor: color }}
    >
      <span
        aria-hidden
        className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l-2 border-t-2 bg-bg-card"
        style={{ borderColor: color }}
      />
      <span className="mb-1 block text-[11px] uppercase tracking-widest text-ink-dim">Clue</span>
      {children}
    </motion.div>
  );
}
