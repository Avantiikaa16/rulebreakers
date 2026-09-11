"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { FeedbackNote } from "@/lib/store";

const TONE: Record<FeedbackNote["tone"], string> = {
  info: "var(--explore)",
  nudge: "var(--think)",
  cheer: "var(--supported)",
};

export function FeedbackBar({ note }: { note: FeedbackNote | null }) {
  return (
    <div className="min-h-12" aria-live="polite">
      <AnimatePresence mode="wait">
        {note && (
          <motion.p
            key={note.text}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-2xl px-4 py-3 text-sm font-bold text-ink"
            style={{
              background: "rgba(20,26,48,0.82)",
              backdropFilter: "blur(8px)",
              borderLeft: `5px solid ${TONE[note.tone]}`,
            }}
          >
            {note.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
