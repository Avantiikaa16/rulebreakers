"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { isMuted } from "./sound";

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const preferred = [
    "Google UK English Female",
    "Google US English",
    "Samantha",
    "Microsoft Zira - English (United States)",
    "Karen",
    "Moira",
    "Tessa",
  ];
  for (const name of preferred) {
    const v = voices.find((x) => x.name === name);
    if (v) return v;
  }
  return (
    voices.find((v) => v.lang.startsWith("en") && /female|zira|samantha|google|karen/i.test(v.name)) ??
    voices.find((v) => v.lang.startsWith("en")) ??
    voices[0]
  );
}

const noop = () => () => {};

export interface PixelVoice {
  supported: boolean;
  speaking: boolean;
  speak: (text: string) => void;
  cancel: () => void;
}

/** Pixel's speaking voice — browser SpeechSynthesis, cute-robot pitch, muteable. */
export function usePixelVoice(): PixelVoice {
  const supported = useSyncExternalStore(
    noop,
    () => typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined",
    () => false,
  );
  const [speaking, setSpeaking] = useState(false);

  // warm the voice list
  useEffect(() => {
    if (!supported) return;
    const load = () => {
      cachedVoice = pickVoice();
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || isMuted() || !text.trim()) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (cachedVoice === undefined) cachedVoice = pickVoice();
      if (cachedVoice) u.voice = cachedVoice;
      u.pitch = 1.28;
      u.rate = 1.03;
      u.volume = 0.9;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      synth.speak(u);
    },
    [supported],
  );

  const cancel = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return { supported, speaking, speak, cancel };
}
