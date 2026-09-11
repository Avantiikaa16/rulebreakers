"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { SequenceWorld } from "@/lib/types";
import { sequenceFixed } from "@/lib/worlds/sequence";
import { playCue } from "@/lib/sound";

const CAR_COLORS = ["#ff7a59", "#ffc44d", "#4ade80", "#38cfd9", "#b78bff"];

export function NumberRailway({
  world,
  interactive,
  onSetCar,
}: {
  world: SequenceWorld;
  interactive: boolean;
  onSetCar: (index: number, value: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const running = sequenceFixed(world);
  const reduce = useReducedMotion();

  const pick = (i: number) => {
    if (!interactive) return;
    playCue("thinking");
    setSelected((cur) => (cur === i ? null : i));
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-sm">Tap the car that looks wrong, then choose its number.</p>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-end gap-0.5 px-1">
          <motion.span
            className="mr-1 text-4xl"
            aria-hidden
            animate={running ? { x: [0, 4, 0] } : {}}
            transition={{ duration: 0.4, repeat: running ? Infinity : 0 }}
          >
            🚂
          </motion.span>
          {world.terms.map((t, i) => {
            const isSel = selected === i;
            const missing = t === null;
            return (
              <motion.button
                key={i}
                type="button"
                layout
                disabled={!interactive}
                onClick={() => pick(i)}
                aria-label={missing ? `Empty car ${i + 1}` : `Car ${i + 1}, number ${t}`}
                className="relative grid h-16 w-16 place-items-center rounded-t-xl rounded-b-md border-2 text-xl font-extrabold disabled:opacity-100"
                animate={
                  isSel
                    ? { y: -8 }
                    : reduce || !interactive
                      ? { y: 0 }
                      : missing
                        ? { y: [0, -6, 0], rotate: [0, -4, 4, 0] }
                        : { y: [0, -2, 0] }
                }
                transition={{ duration: missing ? 0.9 : 2.2, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
                whileTap={interactive ? { scale: 0.92 } : {}}
                style={{
                  borderColor: isSel ? "#fff" : missing ? "var(--challenge)" : "rgba(0,0,0,0.3)",
                  background: missing
                    ? "repeating-linear-gradient(45deg,rgba(255,122,89,0.2),rgba(255,122,89,0.2)_6px,transparent_6px,transparent_12px)"
                    : CAR_COLORS[i % CAR_COLORS.length],
                  color: missing ? "var(--challenge)" : "#0b1020",
                }}
              >
                {missing ? "?" : t}
                <span className="absolute -bottom-1.5 left-1 h-3 w-3 rounded-full bg-[#0b1020]" aria-hidden />
                <span className="absolute -bottom-1.5 right-1 h-3 w-3 rounded-full bg-[#0b1020]" aria-hidden />
              </motion.button>
            );
          })}
        </div>
      </div>

      {interactive && selected !== null && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-2"
        >
          <span className="w-full text-center text-xs text-ink-dim">
            What number goes in car {selected + 1}?
          </span>
          {world.choices.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                playCue("scan");
                onSetCar(selected, c);
                setSelected(null);
              }}
              className="ql-btn bg-bg-raised px-4 py-2 text-base"
            >
              {c}
            </button>
          ))}
        </motion.div>
      )}

      {running && !interactive && (
        <p className="text-center text-sm font-semibold text-supported">The train is running! 🚂💨</p>
      )}
    </div>
  );
}
