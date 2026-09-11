"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const COLORS = ["#ff7a59", "#ffc44d", "#4ade80", "#38cfd9", "#b78bff", "#ff9ecd", "#fff6c8"];

/**
 * A one-shot confetti burst from the top of the screen. Mount it (e.g. keyed on
 * a success event) and let it play out — it doesn't loop and has no exit logic
 * of its own, so the parent should unmount it after ~2s or leave it (cheap).
 */
export function Confetti({ count = 46 }: { count?: number }) {
  const reduce = useReducedMotion();
  // lazy-initialized so the randomness runs once, outside the render body
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.35,
      dur: 1.6 + Math.random() * 1.1,
      drift: (Math.random() - 0.5) * 140,
      rot: Math.random() * 360,
      size: 6 + Math.random() * 6,
      color: COLORS[i % COLORS.length],
      shape: i % 3 === 0 ? "circle" : "rect",
    })),
  );

  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: "108vh", x: p.drift, opacity: [1, 1, 0], rotate: p.rot }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
