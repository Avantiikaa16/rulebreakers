"use client";

import { useMuted } from "@/lib/useSound";

export function SoundToggle({ className = "" }: { className?: string }) {
  const { muted, toggle } = useMuted();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={muted}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      className={`grid h-10 w-10 place-items-center rounded-full border border-line bg-bg-raised text-lg ${className}`}
    >
      <span aria-hidden>{muted ? "🔇" : "🔊"}</span>
    </button>
  );
}
