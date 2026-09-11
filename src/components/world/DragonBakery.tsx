"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { GroupsWorld } from "@/lib/types";
import { playCue } from "@/lib/sound";

type Zone = number | "counter";

/**
 * The equal_groups world. Tap a cookie to pick it up, tap a dragon (or the
 * counter) to put it down. Fully keyboard operable — every zone is a real button.
 */
export function DragonBakery({
  world,
  interactive,
  onMove,
}: {
  world: GroupsWorld;
  interactive: boolean;
  onMove: (from: Zone, to: Zone) => void;
}) {
  const [heldFrom, setHeldFrom] = useState<Zone | null>(null);

  const zoneClick = (z: Zone) => {
    if (!interactive) return;
    if (heldFrom === null) {
      const count = z === "counter" ? world.leftover : world.groups[z];
      if (count <= 0) return;
      playCue("thinking");
      setHeldFrom(z);
      return;
    }
    if (heldFrom === z) {
      setHeldFrom(null);
      return;
    }
    playCue("scan");
    onMove(heldFrom, z);
    setHeldFrom(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {world.groups.map((count, i) => (
          <DragonZone
            key={i}
            name={world.characters[i]}
            characterGlyph={world.characterGlyph}
            itemGlyph={world.itemGlyph}
            count={count}
            held={heldFrom === i}
            armed={interactive && heldFrom !== null && heldFrom !== i}
            interactive={interactive}
            onClick={() => zoneClick(i)}
          />
        ))}
      </div>

      <button
        type="button"
        disabled={!interactive}
        onClick={() => zoneClick("counter")}
        aria-label={`Counter, ${world.leftover} ${world.storyItem} left`}
        className="rounded-2xl border-2 border-dashed p-3 text-left transition-colors disabled:opacity-95"
        style={{
          borderColor:
            heldFrom === "counter"
              ? "var(--think)"
              : interactive && heldFrom !== null
                ? "var(--supported)"
                : "var(--line)",
          background: world.leftover > 0 ? "rgba(255,196,77,0.10)" : "transparent",
        }}
      >
        <div className="flex items-center justify-between text-sm text-ink-dim">
          <span>🧑‍🍳 Baker&rsquo;s counter</span>
          <span>{world.leftover} left</span>
        </div>
        <div className="mt-1 flex min-h-10 flex-wrap gap-1 text-2xl">
          <AnimatePresence mode="popLayout">
            {Array.from({ length: world.leftover }).map((_, k) => (
              <motion.span key={k} layout initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} aria-hidden>
                {world.itemGlyph}
              </motion.span>
            ))}
          </AnimatePresence>
          {world.leftover === 0 && <span className="text-sm text-ink-dim">empty</span>}
        </div>
      </button>

      {interactive && (
        <p className="text-center text-xs text-ink-dim" aria-live="polite">
          {heldFrom === null
            ? "Tap a dragon (or the counter) to pick up a cookie."
            : "Now tap where it should go. Tap the same spot to put it back."}
        </p>
      )}
    </div>
  );
}

function DragonZone({
  name,
  characterGlyph,
  itemGlyph,
  count,
  held,
  armed,
  interactive,
  onClick,
}: {
  name: string;
  characterGlyph: string;
  itemGlyph: string;
  count: number;
  held: boolean;
  armed: boolean;
  interactive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      aria-label={`${name} the dragon has ${count} cookies`}
      className="flex flex-col items-center gap-1 rounded-2xl border-2 p-2 pt-3 transition-colors disabled:opacity-95"
      style={{
        borderColor: held ? "var(--think)" : armed ? "var(--supported)" : "var(--line)",
        background: held ? "rgba(255,196,77,0.12)" : "var(--bg-card)",
      }}
    >
      <motion.span className="text-4xl" aria-hidden animate={held ? { rotate: [0, -8, 8, 0] } : {}}>
        {characterGlyph}
      </motion.span>
      <span className="text-xs font-semibold">{name}</span>
      <span
        className="rounded-full px-2 py-0.5 text-sm font-bold"
        style={{ background: "var(--bg-raised)", color: "var(--think)" }}
      >
        {count}
      </span>
      <div className="mt-0.5 flex min-h-16 flex-wrap content-start justify-center gap-0.5 text-lg">
        <AnimatePresence mode="popLayout">
          {Array.from({ length: count }).map((_, k) => (
            <motion.span
              key={k}
              layout
              initial={{ scale: 0, y: -6 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              aria-hidden
            >
              {itemGlyph}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </button>
  );
}
