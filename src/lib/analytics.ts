// Privacy-preserving product analytics (brief section 14).
// Never receives raw voice, photos, or transcripts. Dev = console; prod = no-op sink.

import type { AnalyticsEvent } from "./types";

type Props = Record<string, string | number | boolean | null>;

const SENSITIVE_KEYS = /transcript|photo|image|voice|audio|name|text|secret|key|token/i;

function redact(props: Props): Props {
  const out: Props = {};
  for (const [k, v] of Object.entries(props)) {
    out[k] = SENSITIVE_KEYS.test(k) ? "[redacted]" : v;
  }
  return out;
}

export function track(event: AnalyticsEvent, props: Props = {}): void {
  const payload = { event, ...redact(props), at: new Date().toISOString() };
  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", payload);
  }
  // prod: intentionally a no-op until a real sink is configured for the contest.
}
