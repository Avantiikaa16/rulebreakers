# Third-Party & AI Disclosures — RuleBreakers

Maintained throughout development for the Nerdy AI Hackathon Challenge.

## AI assistance

- **Claude (Anthropic)** was used as a coding assistant to help write this application.
- **OpenAI `gpt-4o-mini`** (configurable via `OPENAI_MODEL`) is called at runtime, server-side only,
  for exactly one job: reading the child's free-text explanation and classifying which *facets* of
  a concept it expresses. It never renders world state, never decides whether a fix is correct, and
  never decides mastery — all of that is deterministic engine code (`src/lib/worlds`,
  `src/lib/mastery.ts`). Every model response is validated with Zod (`src/lib/schemas.ts`); on any
  failure the app falls back to a deterministic keyword classifier
  (`src/lib/hypothesis/classify-local.ts`) and stays fully playable with no API key.
- The same OpenAI model is also used, optionally, to rephrase the deterministic Tutor Handoff
  Report into tutor-friendly prose. The structured findings are unchanged; a template fallback is
  always present.

## Runtime dependencies (all permissive licenses)

| Package | License | Use |
|---|---|---|
| next | MIT | app framework |
| react, react-dom | MIT | UI |
| openai | Apache-2.0 | server-side GPT calls |
| zod | MIT | schema validation of all external/AI data |
| zustand | MIT | game state |
| framer-motion | MIT | animation |

Dev-only: typescript, eslint, vitest, @vitejs/plugin-react, jsdom, tailwindcss — all MIT.

No GPL / LGPL / AGPL / SSPL or other reciprocal-license dependencies.

## Assets

- All UI sounds are generated at runtime with the Web Audio API (`src/lib/sound.ts`) — no audio files.
- Character voices use the browser's built-in `speechSynthesis` — no third-party TTS.
- All visuals are CSS / SVG / system emoji. No third-party images, icons, or fonts beyond
  **Fredoka** (Google Fonts, OFL).

## Data

- No real student data is used. All content is synthetic and authored.
- No accounts, no personal data collection. Progress and session summaries are stored only in the
  browser's `localStorage` and never transmitted.
- No camera, microphone-recording upload, biometric identifiers, or speaker/face identification.
  (Optional speech-to-text uses the browser's on-device Web Speech API for the "how did you know?"
  step; the transcript is editable and only its text is sent to the classification endpoint.)
