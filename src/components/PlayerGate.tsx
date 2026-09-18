"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useHydrated } from "@/lib/useHydrated";
import { usePlayer } from "@/lib/usePlayer";
import { AVATARS, setPlayer } from "@/lib/player";
import { playCue } from "@/lib/sound";
import { IslandSky } from "@/components/IslandSky";
import { Pixel } from "@/components/Pixel";

/** Gates every route behind a one-time, local-only "who's exploring?" screen. */
export function PlayerGate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const player = usePlayer();
  // Before hydration we don't know localStorage yet — render children so the
  // very first paint matches the server, then swap to the name screen if needed.
  if (!hydrated || player) return <>{children}</>;
  return <NameScreen />;
}

function NameScreen() {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);

  const go = (finalName: string) => {
    const trimmed = finalName.trim();
    if (!trimmed) return;
    playCue("star");
    setPlayer(trimmed, avatar);
  };

  return (
    <>
      <IslandSky />
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <Pixel state="listening" size={88} />
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="ql-card w-full p-6"
        >
          <h1 className="text-xl font-extrabold">Hi! I&rsquo;m Clue 👋</h1>
          <p className="mt-1 text-sm text-ink-dim">What should I call you, explorer?</p>

          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 24))}
            onKeyDown={(e) => e.key === "Enter" && go(name)}
            placeholder="Type your name…"
            aria-label="Your name"
            className="mt-4 w-full rounded-xl border border-line bg-bg-raised p-3 text-center text-lg font-semibold text-ink"
          />

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-widest text-ink-dim">
            Pick your look
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={avatar === a}
                aria-label={`Choose ${a} avatar`}
                onClick={() => {
                  setAvatar(a);
                  playCue("boop");
                }}
                className="grid h-12 w-12 place-items-center rounded-full border-2 text-2xl transition-transform active:scale-90"
                style={{
                  borderColor: avatar === a ? "var(--explore)" : "rgba(255,255,255,0.14)",
                  background: avatar === a ? "rgba(56,207,217,0.16)" : "transparent",
                }}
              >
                {a}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={name.trim().length === 0}
            className="ql-btn mt-5 w-full bg-explore text-[#0b1020] disabled:opacity-40"
            onClick={() => go(name)}
          >
            Let&rsquo;s explore! →
          </button>

          <p className="mt-3 text-[11px] text-ink-dim">
            Just for fun — stays on this device, never sent anywhere.
          </p>
        </motion.div>

        <button
          type="button"
          className="rounded-full bg-bg-raised/90 px-3 py-1.5 text-xs font-semibold text-ink-dim underline"
          onClick={() => go("Explorer")}
        >
          Skip for now
        </button>
      </main>
    </>
  );
}
