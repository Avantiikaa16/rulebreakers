"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { GroupsWorld, PartitionWorld, SequenceWorld, WorldState } from "@/lib/types";
import { templatesFor } from "@/lib/worlds/registry";
import type { WorldTemplate } from "@/lib/worlds/template";
import { playCue } from "@/lib/sound";
import { usePixelVoice } from "@/lib/usePixelVoice";
import { useHydrated } from "@/lib/useHydrated";
import { Pixel } from "@/components/Pixel";
import { Confetti } from "@/components/Confetti";
import { IslandSky } from "@/components/IslandSky";
import { SoundToggle } from "@/components/SoundToggle";
import { DragonBakery } from "@/components/world/DragonBakery";
import { FractionCafe } from "@/components/world/FractionCafe";
import { NumberRailway } from "@/components/world/NumberRailway";

function pickPanels(seed: number): { template: WorldTemplate; seed: number }[] {
  const trickAt = seed % 4 === 0 ? seed % 3 : -1; // ~1 in 4 scenes has a decoy
  return (["equal_groups", "equal_partition", "skip_count"] as const).map((concept, i) => {
    const list = templatesFor(concept);
    const broken = list.filter((t) => t.exposesFacet !== null);
    const trick = list.find((t) => t.exposesFacet === null)!;
    const template = i === trickAt ? trick : broken[(seed + i) % broken.length];
    return { template, seed: seed * 7 + i * 13 + 1 };
  });
}

export function GlitchBoss() {
  const { speak } = usePixelVoice();
  const hydrated = useHydrated();
  const [seed] = useState(() => (Date.now() & 0x7fff) || 11);
  const panels = useMemo(() => pickPanels(seed), [seed]);
  const [fixed, setFixed] = useState<boolean[]>([false, false, false]);
  const count = fixed.filter(Boolean).length;
  const won = count === 3;

  const markFixed = (i: number) => {
    setFixed((prev) => {
      if (prev[i]) return prev;
      const next = [...prev];
      next[i] = true;
      playCue(next.every(Boolean) ? "core" : "star");
      if (next.every(Boolean)) speak("The Glitch is defeated! You fixed all of it.");
      return next;
    });
  };

  return (
    <>
      <IslandSky restored={won} />
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:px-6">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="rounded-full border border-line bg-bg-raised px-3 py-2 text-sm font-bold text-ink hover:brightness-110"
          >
            ← Island
          </Link>
          <SoundToggle />
        </header>

        <div className="flex items-center gap-3">
          <span className="text-4xl" aria-hidden>{won ? "😇" : "🦹"}</span>
          <div
            className="flex-1 rounded-2xl border-2 px-4 py-3"
            style={{
              borderColor: won ? "var(--supported)" : "var(--challenge)",
              background: "rgba(20,26,48,0.86)",
              backdropFilter: "blur(8px)",
            }}
          >
            <p className="text-[11px] uppercase tracking-widest text-ink-dim">The Glitch</p>
            <p className="font-bold text-ink">
              {won ? "No! You fixed everything!" : "I broke three things in this scene. You'll never spot them all!"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-line bg-bg-raised px-3 py-2 text-sm">
          <span className="text-ink-dim">Glitches fixed</span>
          <span className="flex flex-1 gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 flex-1 rounded-full"
                style={{ background: fixed[i] ? "var(--supported)" : "var(--line)", boxShadow: fixed[i] ? "0 0 8px var(--supported)" : "none" }}
              />
            ))}
          </span>
          <span className="font-bold text-ink">{count}/3</span>
        </div>

        {!hydrated ? (
          <p className="ql-card p-6 text-center text-sm text-ink-dim">Summoning the scene…</p>
        ) : won ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ql-card flex flex-col items-center gap-3 p-6 text-center"
          >
            <Confetti count={90} />
            <Pixel state="celebrating" size={100} />
            <h2 className="text-2xl font-bold" style={{ color: "var(--mastery)" }}>The Glitch is defeated!</h2>
            <p className="text-ink-dim">You used every rule you cracked — equal groups, equal pieces, and steady steps — all at once.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/report" className="ql-btn bg-explore text-[#0b1020]">Tutor report</Link>
              <Link href="/" className="ql-btn border border-line bg-bg-raised text-ink">Back to the island</Link>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {panels.map((p, i) => (
              <BossPanel key={i} template={p.template} seed={p.seed} done={fixed[i]} onFixed={() => markFixed(i)} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function BossPanel({
  template,
  seed,
  done,
  onFixed,
}: {
  template: WorldTemplate;
  seed: number;
  done: boolean;
  onFixed: () => void;
}) {
  const [world, setWorld] = useState<WorldState>(() => template.build(seed));
  const [hint, setHint] = useState<string | null>(null);

  const check = (claim: "fixed" | "fine") => {
    if (template.isFixed(world)) {
      setHint(null);
      onFixed();
    } else {
      setHint(claim === "fine" ? "Look again — this one really is broken." : template.nudges[1]);
    }
  };

  return (
    <div
      className="ql-card p-4"
      style={{ borderColor: done ? "var(--supported)" : "var(--line)", opacity: done ? 0.7 : 1 }}
    >
      {world.kind === "groups" && (
        <DragonBakery
          world={world as GroupsWorld}
          interactive={!done}
          onMove={(from, to) => setWorld((w) => moveCookie(w as GroupsWorld, from, to))}
        />
      )}
      {world.kind === "partition" && (
        <FractionCafe
          world={world as PartitionWorld}
          interactive={!done}
          showEnd={template.id === "short-bar"}
          onChange={(patch) => setWorld((w) => ({ ...(w as PartitionWorld), ...patch }))}
        />
      )}
      {world.kind === "sequence" && (
        <NumberRailway
          world={world as SequenceWorld}
          interactive={!done}
          onSetCar={(idx, val) =>
            setWorld((w) => {
              const s = w as SequenceWorld;
              const terms = [...s.terms];
              terms[idx] = val;
              return { ...s, terms };
            })
          }
        />
      )}

      {hint && <p className="mt-2 text-sm text-think">{hint}</p>}

      {done ? (
        <p className="mt-3 text-sm font-semibold text-supported">Fixed ✓</p>
      ) : (
        <div className="mt-3 flex gap-2">
          <button className="ql-btn bg-supported px-4 py-2 text-sm text-[#0b1020]" onClick={() => check("fixed")}>
            This one&rsquo;s fixed
          </button>
          <button className="ql-btn border-2 border-line bg-bg-raised px-4 py-2 text-sm" onClick={() => check("fine")}>
            This one&rsquo;s fine
          </button>
        </div>
      )}
    </div>
  );
}

function moveCookie(w: GroupsWorld, from: number | "counter", to: number | "counter"): GroupsWorld {
  if (from === to) return w;
  const groups = [...w.groups];
  let leftover = w.leftover;
  if (from === "counter") {
    if (leftover <= 0) return w;
    leftover -= 1;
  } else {
    if (groups[from] <= 0) return w;
    groups[from] -= 1;
  }
  if (to === "counter") leftover += 1;
  else groups[to] += 1;
  return { ...w, groups, leftover };
}
