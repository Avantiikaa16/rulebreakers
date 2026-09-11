"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { REGIONS } from "@/lib/regions";
import { CONCEPTS } from "@/lib/concepts";
import { useCompletedRegions } from "@/lib/useProgress";
import { useHydrated } from "@/lib/useHydrated";
import { resetProgress } from "@/lib/progress";
import { IslandSky } from "@/components/IslandSky";
import { SoundToggle } from "@/components/SoundToggle";
import { Pixel } from "@/components/Pixel";

const TOKEN = { challenge: "#ff7a59", think: "#ffc44d", explore: "#38cfd9" } as const;

export function OopsIsland() {
  const reduce = useReducedMotion();
  const done = useCompletedRegions();
  const ready = useHydrated();
  const allDone = ready && REGIONS.every((r) => done.includes(r.concept));

  return (
    <>
      <IslandSky restored={allDone} />
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-4 pb-16 pt-6 sm:px-6">
        <header className="ql-card flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Pixel state="idle" size={44} />
            <div>
              <h1 className="text-lg font-extrabold leading-none">RuleBreakers</h1>
              <p className="text-[11px] font-semibold text-ink-dim">🏝️ Oops Island</p>
            </div>
          </div>
          <SoundToggle />
        </header>

        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="ql-card px-4 py-2.5 text-center text-sm font-semibold"
        >
          🕵️ Something is broken in every place. Find the hidden rule and fix the world!
        </motion.p>

        <ol className="flex flex-col gap-4">
          {REGIONS.map((r, i) => {
            const complete = ready && done.includes(r.concept);
            const color = TOKEN[r.color];
            const isNext = !complete && (i === 0 || done.includes(REGIONS[i - 1].concept));
            return (
              <motion.li
                key={r.slug}
                initial={{ opacity: 0, y: 24, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 260, damping: 20 }}
              >
                <Link
                  href={`/region/${r.slug}`}
                  className="ql-card flex items-center gap-4 p-4"
                  style={{ borderColor: complete ? "var(--supported)" : isNext ? color : "rgba(255,255,255,0.14)" }}
                >
                  <motion.span
                    className="grid h-20 w-20 shrink-0 place-items-center rounded-full text-4xl"
                    style={{
                      background: `radial-gradient(circle at 32% 28%, ${color}, ${color}55 70%)`,
                      boxShadow: `0 6px 0 -1px rgba(0,0,0,0.25), 0 0 0 4px rgba(255,255,255,0.12), 0 0 24px ${color}88`,
                    }}
                    animate={
                      reduce
                        ? {}
                        : isNext
                          ? { y: [0, -8, 0], rotate: [0, -4, 4, 0] }
                          : { y: [0, i % 2 ? 4 : -4, 0] }
                    }
                    transition={{ duration: isNext ? 1.8 : 4 + i, repeat: Infinity, ease: "easeInOut" }}
                    aria-hidden
                  >
                    {r.emoji}
                  </motion.span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-extrabold">{r.name}</span>
                      {complete && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} aria-label="cracked" className="text-xl">
                          ✅
                        </motion.span>
                      )}
                    </div>
                    <p className="text-sm text-ink-dim">{r.blurb}</p>
                    <p
                      className="mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold"
                      style={{ background: `${color}33`, color }}
                    >
                      {CONCEPTS[r.concept].title}
                    </p>
                  </div>
                  <motion.span
                    className="text-2xl text-ink-dim"
                    animate={isNext && !reduce ? { x: [0, 5, 0] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ›
                  </motion.span>
                </Link>
              </motion.li>
            );
          })}
        </ol>

        {allDone ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: [1, 1.03, 1] }}
            transition={{ scale: { duration: 1.6, repeat: Infinity } }}
            className="ql-card p-4 text-center"
            style={{ borderColor: "var(--mastery)" }}
          >
            <p className="text-lg font-extrabold">🎉 Every rule cracked — but The Glitch is loose!</p>
            <Link href="/boss" className="ql-btn mt-3 inline-block bg-mastery text-[#0b1020]">
              Face The Glitch 🦹
            </Link>
          </motion.div>
        ) : (
          <div
            className="rounded-3xl border-2 border-dashed p-4 text-center text-sm font-semibold text-ink-dim"
            style={{ borderColor: "rgba(255,255,255,0.35)", background: "rgba(20,26,48,0.55)", backdropFilter: "blur(8px)" }}
          >
            🔒 The Glitch Boss unlocks when all three places are fixed.
          </div>
        )}

        <footer className="flex items-center justify-between gap-2 pt-2 text-xs">
          <Link href="/about" className="rounded-full bg-bg-raised/90 px-3 py-1.5 font-semibold text-ink-dim underline">
            For grown-ups &amp; judges
          </Link>
          <button
            className="rounded-full bg-bg-raised/90 px-3 py-1.5 font-semibold text-ink-dim underline"
            onClick={() => confirm("Start over?") && resetProgress()}
          >
            Reset progress
          </button>
        </footer>
      </main>
    </>
  );
}
