"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** false during SSR and the first client render, true once hydrated. No effect, no setState. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
