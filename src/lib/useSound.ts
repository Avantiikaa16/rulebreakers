"use client";

import { useSyncExternalStore } from "react";
import { isMuted, setMuted } from "./sound";

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function useMuted(): { muted: boolean; toggle: () => void } {
  const muted = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => isMuted(),
    () => false,
  );

  return {
    muted,
    toggle: () => {
      setMuted(!isMuted());
      emit();
    },
  };
}
