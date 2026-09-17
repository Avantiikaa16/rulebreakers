"use client";

import { useSyncExternalStore } from "react";
import { getPlayer, subscribePlayer, type Player } from "./player";

export function usePlayer(): Player | null {
  return useSyncExternalStore(subscribePlayer, getPlayer, () => null);
}
