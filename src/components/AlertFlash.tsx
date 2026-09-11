"use client";

import { AnimatePresence, motion } from "framer-motion";

/** A pulsing red vignette for the "something is wrong" beat. */
export function AlertFlash({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.35, 0.8, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6 }}
          style={{
            boxShadow: "inset 0 0 200px 44px rgba(255,122,89,0.5)",
            background: "radial-gradient(circle at 50% 50%, transparent 58%, rgba(255,122,89,0.16))",
          }}
        />
      )}
    </AnimatePresence>
  );
}
