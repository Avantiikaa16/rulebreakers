"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * A bright, living island sky — replaces any dark "space" theme. Sun, drifting
 * clouds, gliding birds, swaying palms, rolling hills and a shoreline. `restored`
 * (all glitches fixed / concept generalised) warms and brightens the whole scene.
 */
export function IslandSky({ restored = false }: { restored?: boolean }) {
  const reduce = useReducedMotion();

  const clouds = useMemo(
    () => [
      { x: "6%", y: "10%", s: 1.3, dur: 46, op: 0.9 },
      { x: "68%", y: "6%", s: 1.0, dur: 58, op: 0.8 },
      { x: "38%", y: "16%", s: 0.8, dur: 40, op: 0.7 },
      { x: "82%", y: "20%", s: 1.1, dur: 52, op: 0.75 },
      { x: "20%", y: "26%", s: 0.6, dur: 36, op: 0.6 },
    ],
    [],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-[filter] duration-1000"
      style={{ filter: restored ? "saturate(1.25) brightness(1.08)" : "saturate(1.05)" }}
    >
      {/* sky */}
      <div
        className="absolute inset-0"
        style={{
          background: restored
            ? "linear-gradient(180deg, #2fd0e6 0%, #7fe6c9 38%, #ffe6a3 68%, #ffcf8f 100%)"
            : "linear-gradient(180deg, #2bb6d9 0%, #6fd3c7 42%, #ffe1a8 74%, #ffc98a 100%)",
        }}
      />

      {/* sun */}
      <motion.div
        className="absolute -right-10 -top-10 h-56 w-56 rounded-full"
        style={{
          background: "radial-gradient(circle at 40% 35%, #fff6d0, #ffd35c 55%, rgba(255,211,92,0) 78%)",
          boxShadow: "0 0 90px 30px rgba(255,211,92,0.45)",
        }}
        animate={reduce ? {} : { scale: [1, 1.06, 1], opacity: [0.95, 1, 0.95] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* distant birds */}
      {!reduce &&
        [0, 1].map((i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ top: `${14 + i * 9}%` }}
            initial={{ x: "-10vw" }}
            animate={{ x: "110vw" }}
            transition={{ duration: 26 + i * 8, repeat: Infinity, ease: "linear", delay: i * 9 }}
          >
            <Bird />
          </motion.div>
        ))}

      {/* clouds */}
      {clouds.map((c, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: c.x, top: c.y, opacity: c.op, transform: `scale(${c.s})` }}
          animate={reduce ? {} : { x: [0, 30, 0] }}
          transition={{ duration: c.dur, repeat: Infinity, ease: "easeInOut" }}
        >
          <Cloud />
        </motion.div>
      ))}

      {/* rolling hills */}
      <svg className="absolute bottom-[10%] left-0 w-full" viewBox="0 0 400 60" preserveAspectRatio="none" style={{ height: "12%" }}>
        <path d="M0,40 Q60,10 120,35 T240,30 T400,38 V60 H0 Z" fill="rgba(38,120,90,0.55)" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 60" preserveAspectRatio="none" style={{ height: "10%" }}>
        <path d="M0,45 Q80,20 160,42 T400,40 V60 H0 Z" fill="rgba(24,90,68,0.65)" />
      </svg>

      {/* sea/shore strip */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: "8%", background: "linear-gradient(180deg, rgba(255,255,255,0.35), rgba(45,190,190,0.55))" }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1.5"
        style={{ background: "rgba(255,255,255,0.7)" }}
        animate={reduce ? {} : { opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* palm trees */}
      <PalmTree side="left" reduce={!!reduce} />
      <PalmTree side="right" reduce={!!reduce} />

      {/* sparkles once restored */}
      {restored &&
        !reduce &&
        Array.from({ length: 10 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 90}%`, background: "#fff6c8" }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.4, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
    </div>
  );
}

/** A small gull silhouette with flapping wings — replaces the old "⌒⌒" text glyph. */
function Bird() {
  const wingDown = "M14 7 Q9 1 1 5 Q7 6 14 7 Q21 6 27 5 Q19 1 14 7 Z";
  const wingUp = "M14 7 Q9 5 1 7 Q7 7 14 7 Q21 7 27 7 Q19 5 14 7 Z";
  return (
    <svg width="28" height="14" viewBox="0 0 28 14" fill="rgba(30,50,60,0.55)">
      <motion.path
        animate={{ d: [wingDown, wingUp, wingDown] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

function Cloud() {
  return (
    <svg width="120" height="46" viewBox="0 0 120 46" fill="none">
      <ellipse cx="30" cy="30" rx="26" ry="16" fill="white" />
      <ellipse cx="58" cy="20" rx="30" ry="20" fill="white" />
      <ellipse cx="88" cy="30" rx="24" ry="15" fill="white" />
      <rect x="20" y="28" width="80" height="14" rx="7" fill="white" />
    </svg>
  );
}

function PalmTree({ side, reduce }: { side: "left" | "right"; reduce: boolean }) {
  const flip = side === "right" ? { transform: "scaleX(-1)" } : undefined;
  return (
    <motion.div
      className="absolute"
      style={{
        [side]: "-2%",
        // planted on the shore strip itself, not just nudged off the raw edge —
        // a couple of % / 14px was imperceptible on short/wide viewports
        bottom: "max(6%, 34px)",
        width: "34vw",
        maxWidth: 260,
        transformOrigin: "bottom center",
        ...flip,
      }}
      animate={reduce ? {} : { rotate: [0, 1.5, 0, -1.5, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* viewBox starts at y=-65: the upward fronds' control points reach y=-55,
          which SVG clips flat if the viewBox doesn't extend up there — that was
          the actual "cut off" look, at the top of the leaves, not the trunk base */}
      <svg viewBox="0 -65 200 285" width="100%" height="auto">
        <ellipse cx="96" cy="214" rx="34" ry="9" fill="#4a2f16" opacity="0.4" />
        <path d="M96 218 C 92 150 100 90 108 40" stroke="#6b4423" strokeWidth="11" fill="none" strokeLinecap="round" />
        <g fill="#2f9e5c">
          <path d="M108 40 C 60 20 30 40 10 20 C 40 55 75 60 105 55 Z" />
          <path d="M108 40 C 150 10 180 30 195 10 C 165 50 130 58 108 55 Z" />
          <path d="M108 40 C 95 -5 60 -15 45 -35 C 60 10 80 35 105 50 Z" />
          <path d="M108 40 C 120 -10 155 -20 165 -40 C 150 5 130 30 108 50 Z" />
          <path d="M108 40 C 108 -20 108 -35 108 -55 C 112 -10 112 15 112 50 Z" />
        </g>
        <g fill="#8a5a2b">
          <circle cx="98" cy="46" r="6" />
          <circle cx="110" cy="50" r="6" />
        </g>
      </svg>
    </motion.div>
  );
}
