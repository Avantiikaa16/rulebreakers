"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Living twilight sky: coloured nebula clouds, a multi-colour starfield, drifting
 * moons, shooting stars, a bottom aurora, and gentle pointer parallax on desktop.
 * `restored` warms the whole scene once the Fraction Core is back.
 */
const STAR_COLORS = ["#ffffff", "#bfe3ff", "#ffe1b0", "#ffc7e0", "#c7f9e5", "#d7c4ff"];

export function WorldBackground({ restored = false }: { restored?: boolean }) {
  const reduce = useReducedMotion();
  const [par, setPar] = useState({ x: 0, y: 0 });
  const raf = useRef(0);

  const stars = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        id: i,
        x: (i * 47) % 100,
        y: (i * 71) % 100,
        r: (i % 5 === 0 ? 2.4 : 1) + (i % 3) * 0.4,
        color: STAR_COLORS[i % STAR_COLORS.length],
        dur: 2.4 + (i % 6) * 0.8,
        delay: (i % 9) * 0.5,
        big: i % 11 === 0,
      })),
    [],
  );

  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        setPar({
          x: (e.clientX / window.innerWidth - 0.5) * 2,
          y: (e.clientY / window.innerHeight - 0.5) * 2,
        });
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [reduce]);

  const shift = (f: number) => ({
    transform: `translate3d(${par.x * f}px, ${par.y * f}px, 0)`,
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-[filter] duration-1000"
      style={{ filter: restored ? "saturate(1.3) brightness(1.14)" : "saturate(1.08)" }}
    >
      {/* base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1400px 900px at 8% -8%, rgba(56,207,217,0.20), transparent 60%)," +
            "radial-gradient(1300px 950px at 100% 4%, rgba(183,139,255,0.20), transparent 58%)," +
            "radial-gradient(1200px 1200px at 50% 120%, rgba(255,122,89,0.14), transparent 62%)," +
            "var(--bg)",
        }}
      />

      {/* nebula clouds */}
      <div className="absolute inset-0" style={shift(14)}>
        {[
          { c: "56,207,217", x: "-12%", y: "8%", s: "34rem", d: 26 },
          { c: "183,139,255", x: "72%", y: "34%", s: "40rem", d: 32 },
          { c: "255,196,77", x: "18%", y: "72%", s: "28rem", d: 22 },
          { c: "255,122,89", x: "84%", y: "84%", s: "30rem", d: 28 },
          { c: "74,222,128", x: "40%", y: "48%", s: "26rem", d: 30 },
        ].map((n, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              left: n.x,
              top: n.y,
              width: n.s,
              height: n.s,
              background: `radial-gradient(circle at 45% 40%, rgba(${n.c},0.34), transparent 70%)`,
            }}
            animate={reduce ? {} : { x: [0, 22, -14, 0], y: [0, -18, 12, 0], scale: [1, 1.08, 0.96, 1] }}
            transition={{ duration: n.d, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* starfield */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={shift(26)}
      >
        {stars.map((s) => (
          <motion.circle
            key={s.id}
            cx={s.x}
            cy={s.y}
            r={s.r * 0.12}
            fill={restored && s.id % 2 ? "#ffe9b0" : s.color}
            animate={reduce ? { opacity: 0.7 } : { opacity: [0.25, 1, 0.35], scale: s.big ? [1, 1.6, 1] : 1 }}
            transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
            style={s.big ? { filter: `drop-shadow(0 0 2px ${s.color})` } : undefined}
          />
        ))}
      </svg>

      {/* drifting moons in the margins */}
      <div className="absolute inset-0" style={shift(40)}>
        {[
          { x: "5%", y: "26%", d: 46, c1: "#8bd3ff", c2: "#2b4a6b", ring: false },
          { x: "90%", y: "18%", d: 62, c1: "#ffd28b", c2: "#6b4a2b", ring: true },
          { x: "88%", y: "62%", d: 40, c1: "#c7a8ff", c2: "#3a2b60", ring: false },
          { x: "8%", y: "78%", d: 52, c1: "#8bffcf", c2: "#2b6b4a", ring: false },
        ].map((m, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: m.x, top: m.y }}
            animate={reduce ? {} : { y: [0, i % 2 ? 18 : -18, 0], rotate: [0, i % 2 ? -12 : 12, 0] }}
            transition={{ duration: 18 + i * 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {m.ring && (
              <div
                className="absolute left-1/2 top-1/2 rounded-[50%] border-2"
                style={{
                  width: m.d * 2,
                  height: m.d * 0.7,
                  borderColor: "rgba(255,210,139,0.35)",
                  transform: "translate(-50%,-50%) rotate(-20deg)",
                }}
              />
            )}
            <div
              className="rounded-full blur-[1px]"
              style={{
                width: m.d,
                height: m.d,
                background: `radial-gradient(circle at 35% 30%, ${m.c1}, ${m.c2} 78%)`,
                opacity: 0.5,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* shooting stars */}
      {!reduce &&
        [0, 1].map((i) => (
          <motion.div
            key={i}
            className="absolute h-0.5 w-24 rounded-full"
            style={{
              top: `${8 + i * 22}%`,
              left: "-15%",
              background: "linear-gradient(90deg, transparent, #ffffff, #bfe3ff)",
              boxShadow: "0 0 8px rgba(191,227,255,0.8)",
            }}
            animate={{ x: ["-10vw", "120vw"], y: ["0vh", "42vh"], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              repeatDelay: 9 + i * 6,
              delay: 3 + i * 5,
              ease: "easeIn",
            }}
          />
        ))}

      {/* bottom aurora */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-40 blur-2xl"
        style={{
          background:
            "linear-gradient(0deg, rgba(74,222,128,0.22), rgba(56,207,217,0.14) 45%, transparent)",
        }}
        animate={reduce ? {} : { opacity: [0.5, 0.9, 0.5], scaleY: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
