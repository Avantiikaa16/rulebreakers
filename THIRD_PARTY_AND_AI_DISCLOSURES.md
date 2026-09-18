# Third-Party & AI Disclosures — RuleBreakers

Per Nerdy AI Hackathon Challenge terms §7.6.

## AI assistance

Built with **Claude (Anthropic)** as a coding assistant. At runtime, one server-side LLM call
classifies which facets of a concept a child's explanation covers — it never grades and never
decides game state (`src/lib/worlds`, `src/lib/mastery.ts` do that deterministically). Provider:
**Groq** if `GROQ_API_KEY` is set, else **OpenAI**, else a deterministic offline classifier
(`src/lib/hypothesis/classify-local.ts`) — fully playable with no key. The same LLM optionally
rephrases the Tutor Report; a template fallback always exists.

## Dependencies — all permissive, no copyleft

`next`, `react`/`react-dom`, `zod`, `zustand`, `framer-motion` (MIT) · `openai` (Apache-2.0, used
as the client for both Groq and OpenAI). Dev-only: typescript, eslint, vitest, tailwindcss — MIT.
No GPL / LGPL / AGPL / SSPL dependencies.

## Assets

No third-party audio, images, or icons. Sound is generated live via the Web Audio API; character
voices use the browser's built-in `speechSynthesis`. Fonts: system + **Fredoka** (Google Fonts, OFL).

## Data

No real student data, no accounts. Progress, session summaries, and the optional nickname/avatar
(`src/lib/player.ts`) live only in the browser's `localStorage` and are never transmitted.
