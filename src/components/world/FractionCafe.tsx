"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PartitionWorld } from "@/lib/types";
import { TICKS, sliceWidths } from "@/lib/worlds/partition";
import { playCue } from "@/lib/sound";

const SLICE_COLORS = ["#ff7a59", "#ffc44d", "#4ade80", "#38cfd9", "#b78bff", "#ff9ecd"];

export function FractionCafe({
  world,
  interactive,
  onChange,
  showEnd = false,
}: {
  world: PartitionWorld;
  interactive: boolean;
  onChange: (patch: Partial<Pick<PartitionWorld, "cuts" | "end">>) => void;
  showEnd?: boolean;
}) {
  const reduce = useReducedMotion();
  const cuts = [...world.cuts].filter((c) => c > 0 && c < world.end).sort((a, b) => a - b);
  const widths = sliceWidths(world);
  const d = world.target.denominator;
  const pct = (ticks: number) => (ticks / TICKS) * 100;

  const toggleCut = (pos: number) => {
    playCue("scan");
    onChange({
      cuts: cuts.includes(pos) ? cuts.filter((c) => c !== pos) : [...cuts, pos].sort((a, b) => a - b),
    });
  };
  const setEnd = (delta: number) => {
    const next = Math.min(TICKS, Math.max(2, world.end + delta));
    if (next === world.end) return;
    playCue("thinking");
    onChange({ end: next, cuts: cuts.filter((c) => c < next) });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-sm">
        <span className="mr-1 align-middle text-2xl" aria-hidden>{world.glyph}</span>
        Order: <strong>{world.target.numerator}/{d}</strong> of the {world.whole} — make{" "}
        <strong>{d} equal pieces</strong>.
      </p>

      {/* bar */}
      <motion.div
        className="relative h-16 select-none rounded-xl border-2 border-line bg-bg-raised"
        animate={interactive && !reduce ? { boxShadow: ["0 0 0px var(--think)", "0 0 14px var(--think)", "0 0 0px var(--think)"] } : {}}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {widths.map((w, i) => {
          const left = ([0, ...cuts][i] ?? 0);
          return (
            <motion.div
              key={i}
              layout
              className="absolute top-0 h-full"
              style={{ left: `${pct(left)}%`, width: `${pct(w)}%`, background: SLICE_COLORS[i % SLICE_COLORS.length] }}
            />
          );
        })}
        {world.end < TICKS && (
          <div
            className="absolute top-0 h-full rounded-r-[10px] bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.07),rgba(255,255,255,0.07)_6px,transparent_6px,transparent_12px)]"
            style={{ left: `${pct(world.end)}%`, right: 0 }}
          >
            <span className="absolute left-1 top-1 text-[10px] text-ink-dim">not cut</span>
          </div>
        )}

        {/* cut lines */}
        {cuts.map((c) => (
          <div key={c} className="absolute top-0 h-full w-0.5 bg-[color:var(--bg)]" style={{ left: `${pct(c)}%` }} />
        ))}

        {/* tap targets on inner tick boundaries */}
        {interactive &&
          Array.from({ length: TICKS - 1 }, (_, i) => i + 1)
            .filter((pos) => pos < world.end)
            .map((pos) => (
              <button
                key={pos}
                type="button"
                aria-label={`Cut at position ${pos}`}
                aria-pressed={cuts.includes(pos)}
                onClick={() => toggleCut(pos)}
                className="absolute top-0 h-full -translate-x-1/2"
                style={{ left: `${pct(pos)}%`, width: `${pct(1)}%`, minWidth: "28px" }}
              >
                <span
                  className="mx-auto block h-full w-0.5"
                  style={{ background: cuts.includes(pos) ? "transparent" : "rgba(255,255,255,0.12)" }}
                />
              </button>
            ))}
      </motion.div>

      {/* visible tap-point markers so kids know exactly where they can cut */}
      {interactive && (
        <div className="relative h-3">
          {Array.from({ length: TICKS - 1 }, (_, i) => i + 1)
            .filter((pos) => pos < world.end)
            .map((pos, k) => (
              <motion.span
                key={pos}
                className="absolute top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
                style={{ left: `${pct(pos)}%`, background: cuts.includes(pos) ? "var(--supported)" : "var(--think)" }}
                animate={reduce ? {} : { y: [0, -4, 0], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: k * 0.15, ease: "easeInOut" }}
                aria-hidden
              />
            ))}
        </div>
      )}

      {interactive && (
        <div className="flex flex-col items-center gap-2 text-sm text-ink-dim">
          <p>Tap the bar to add or remove a cut. Pieces now: {widths.length}</p>
          {showEnd && (
            <div className="flex items-center gap-3">
              <span>Bar length</span>
              <button className="ql-btn bg-bg-raised px-4 py-2 text-lg" onClick={() => setEnd(-1)} aria-label="Shorten the bar">
                −
              </button>
              <strong className="w-8 text-center text-ink">{world.end}</strong>
              <button className="ql-btn bg-bg-raised px-4 py-2 text-lg" onClick={() => setEnd(1)} aria-label="Lengthen the bar">
                +
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
