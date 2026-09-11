"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { useSpeechInput } from "@/lib/useSpeechInput";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  busyLabel: string;
  analyzing: boolean;
  placeholder: string;
}

export function ExplanationInput({
  value,
  onChange,
  onSubmit,
  submitLabel,
  busyLabel,
  analyzing,
  placeholder,
}: Props) {
  const appendChunk = useCallback(
    (chunk: string) => {
      if (!chunk) return;
      onChange(value ? `${value.trim()} ${chunk}` : chunk);
    },
    [onChange, value],
  );

  const speech = useSpeechInput(appendChunk);

  return (
    <div className="mt-3">
      <div className="flex items-center gap-3">
        {speech.supported && (
          <button
            type="button"
            aria-pressed={speech.listening}
            aria-label={speech.listening ? "Stop talking to Pixel" : "Talk to Pixel"}
            disabled={analyzing}
            onClick={() => (speech.listening ? speech.stop() : speech.start())}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 text-xl disabled:opacity-40"
            style={{
              borderColor: speech.listening ? "var(--challenge)" : "var(--explore)",
              background: speech.listening ? "rgba(255,122,89,0.16)" : "transparent",
            }}
          >
            <span aria-hidden>{speech.listening ? "■" : "🎤"}</span>
          </button>
        )}
        <div className="flex h-6 flex-1 items-end gap-1" aria-hidden>
          {speech.listening &&
            Array.from({ length: 16 }).map((_, i) => (
              <motion.span
                key={i}
                className="w-1 flex-1 rounded-full bg-explore"
                animate={{ height: ["20%", "90%", "35%"] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
              />
            ))}
        </div>
      </div>

      {speech.listening && (
        <p className="mt-2 text-sm text-ink-dim" aria-live="polite">
          Listening… {speech.interim || "say how you worked it out"}
        </p>
      )}
      {speech.error && <p className="mt-2 text-sm text-challenge">{speech.error} You can type instead.</p>}

      <label className="mt-3 block text-sm text-ink-dim">
        {speech.supported ? "Talk or type — you can fix the words before you send them" : "Type your explanation"}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        disabled={analyzing}
        className="mt-1 w-full rounded-xl border border-line bg-bg-raised p-3 text-ink disabled:opacity-50"
        placeholder={placeholder}
      />
      <button
        type="button"
        className="ql-btn mt-3 bg-explore text-[#0b1020] disabled:opacity-40"
        disabled={value.trim().length === 0 || analyzing}
        onClick={() => {
          speech.stop();
          onSubmit();
        }}
      >
        {analyzing ? busyLabel : submitLabel}
      </button>
    </div>
  );
}
