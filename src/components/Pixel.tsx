"use client";

import { motion } from "framer-motion";

export type PixelState =
  | "idle"
  | "listening"
  | "thinking"
  | "confused"
  | "trying"
  | "realizing"
  | "learning"
  | "celebrating";

const GLOW: Record<PixelState, string> = {
  idle: "var(--explore)",
  listening: "var(--explore)",
  thinking: "var(--think)",
  confused: "var(--challenge)",
  trying: "var(--think)",
  realizing: "var(--challenge)",
  learning: "var(--supported)",
  celebrating: "var(--mastery)",
};

const CAPTION: Record<PixelState, string> = {
  idle: "Pixel is waiting",
  listening: "Pixel is listening",
  thinking: "Pixel is thinking",
  confused: "Pixel is puzzled",
  trying: "Pixel is trying its rule",
  realizing: "Pixel notices a mismatch",
  learning: "Pixel is learning",
  celebrating: "Pixel is celebrating",
};

export function Pixel({
  state = "idle",
  size = 128,
}: {
  state?: PixelState;
  size?: number;
}) {
  const glow = GLOW[state];
  const eyeOffset = state === "listening" ? 3 : state === "confused" ? -2 : 0;

  return (
    <motion.figure
      className="relative m-0 flex flex-col items-center"
      animate={
        state === "listening"
          ? { y: [0, -4, 0], rotate: [-2, 2, -2] }
          : state === "celebrating"
            ? { y: [0, -12, 0] }
            : state === "thinking" || state === "trying"
              ? { rotate: [-3, 3, -3] }
              : { y: [0, -6, 0] }
      }
      transition={{ duration: state === "celebrating" ? 0.6 : 3, repeat: Infinity, ease: "easeInOut" }}
      aria-label={CAPTION[state]}
    >
      <div
        className="absolute inset-0 -z-10 rounded-full blur-2xl"
        style={{ background: glow, opacity: 0.35 }}
      />
      <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-hidden="true">
        {/* antenna */}
        <line x1="60" y1="16" x2="60" y2="30" stroke={glow} strokeWidth="4" strokeLinecap="round" />
        <circle cx="60" cy="12" r="6" fill={glow} />
        {/* body */}
        <rect x="24" y="28" width="72" height="64" rx="24" fill="#1b2340" stroke={glow} strokeWidth="4" />
        {/* face screen */}
        <rect x="34" y="40" width="52" height="34" rx="14" fill="#0b1020" />
        {/* eyes */}
        {state === "celebrating" || state === "learning" ? (
          <>
            <path d="M42 58 q5 -8 10 0" stroke={glow} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M68 58 q5 -8 10 0" stroke={glow} strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx={47 + eyeOffset} cy="57" r="5.5" fill={glow} />
            <circle cx={73 + eyeOffset} cy="57" r="5.5" fill={glow} />
          </>
        )}
        {/* mouth */}
        {state === "confused" || state === "realizing" ? (
          <path d="M50 68 q10 -8 20 0" stroke={glow} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        ) : state === "celebrating" ? (
          <path d="M48 66 q12 12 24 0" stroke={glow} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        ) : (
          <line x1="52" y1="68" x2="68" y2="68" stroke={glow} strokeWidth="3.5" strokeLinecap="round" />
        )}
        {/* feet lights */}
        <circle cx="40" cy="96" r="4" fill={glow} />
        <circle cx="80" cy="96" r="4" fill={glow} />
      </svg>
      <figcaption className="sr-only">{CAPTION[state]}</figcaption>
    </motion.figure>
  );
}
