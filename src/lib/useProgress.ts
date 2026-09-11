"use client";

import { useSyncExternalStore } from "react";
import { completedRegions, subscribeProgress } from "./progress";
import type { Concept } from "./types";

const EMPTY: Concept[] = [];

export function useCompletedRegions(): Concept[] {
  return useSyncExternalStore(
    subscribeProgress,
    completedRegions,
    () => EMPTY,
  );
}
