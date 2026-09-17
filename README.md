# 🕵️ RuleBreakers

### Spot what's wrong. Figure out the rule. Fix it.

**A K–5 math game built for the [Nerdy AI Hackathon Challenge](https://hackathon.nerdy.com/).**

Every math app starts the same way — *here is a question, find the answer.* RuleBreakers does the
opposite: a child is dropped into a small broken world with **no question at all**. They have to
notice what's wrong, discover the hidden mathematical rule, repair the world, and explain how they
knew. Then an AI builds the next world specifically to test the rule they just stated — and
sometimes nothing is broken at all, because knowing when *not* to "fix" something is part of really
understanding it.

> *"The pieces have to be exactly the same size."* → world upgraded. Now here's a world where the
> pieces are equal but there's a whole chunk of the bar left uncut. Still confident?

---

## Why this is different

Most AI learning products put the AI in the tutor's seat, asking questions and grading answers.
RuleBreakers puts the AI somewhere more interesting: **it listens to how a child explains their own
reasoning, and invents the smallest possible scenario that would break that reasoning if it's
incomplete.** That's not a chatbot and it's not a quiz generator — it's a live, running hypothesis
about what a specific child currently believes, continuously tested against reality.

- **The child is never given a question.** They notice a fault, form a rule in their own words,
  and get to prove they can tell the difference between "broken" and "actually fine."
- **The AI never grades anything.** A deterministic engine owns every fact about whether a fix is
  correct, whether a rule is complete, and whether the child has generalised the concept. The LLM's
  only job, ever, is reading language.
- **Evidence, not scores.** The output for a parent or tutor isn't a percentage — it's the child's
  own words, in order, showing how their model of the concept changed.

## The loop

```
👀 NOTICE            something isn't right — no hint is given
    ↓
🧠 DISCOVER          figure out the hidden mathematical rule
    ↓
✋ FIX                manipulate the world (or decide it wasn't broken)
    ↓
🎤 EXPLAIN            tell Clue why, in your own words
    ↓
🪄 WORLD MUTATES      the AI builds the smallest counterexample that tests your rule
    ↓
💡 GENERALIZE         the rule levels up, fact by fact, until it's complete
```

## The Hypothesis Engine

The genuinely novel AI job here isn't generating math problems — it's **inventing the smallest
counterexample that exposes the boundary of a child's understanding**, and doing it without ever
being trusted to grade anything.

| Layer | Owns | Code |
|---|---|---|
| **Concepts & facets** | Each math idea is broken into named facets a full understanding requires (for fair sharing: *equal groups*, *use all of it*, *depends on the total*) | `src/lib/concepts.ts` |
| **World templates** | Deterministic, seedable generators — each one is broken in exactly one authored way, or not broken at all | `src/lib/worlds/*` |
| **The LLM** | Reads the child's sentence and marks which facets it covers — nothing else. Zod-validated on the way back in; a deterministic keyword classifier is the fallback if the model is unavailable, times out, or returns garbage | `src/lib/ai/analyze-hypothesis.ts` |
| **The selector** | Picks the next template whose facet exposes exactly what the child's explanation is missing | `src/lib/hypothesis/select.ts` |
| **Mastery** | Whether a fix is correct and whether the child has generalised is decided entirely by code | `src/lib/mastery.ts` |

The LLM is checked automatically in this order: **Groq** (free tier, no billing required) →
**OpenAI** → **fully offline deterministic fallback**. The game is 100% playable with no API key at
all; a real LLM key just makes the "read what the child said" step smarter.

## Regions

| Region | Concept | Facets a child discovers |
|---|---|---|
| 🍪 **Dragon Bakery** | fair shares / division | equal groups · use all of it · depends on the total |
| 🍫 **Fraction Café** | equal partition / fractions | equal pieces · right number of pieces · covers the whole |
| 🚂 **Number Railway** | skip-counting patterns | constant step · which step it is · keeps going |
| 🦹 **The Glitch Boss** | all three at once | find every glitch in one scene — or catch the decoy that isn't broken |

Finishing a region generates a **Tutor Handoff Report** (`/report`) — a reasoning profile built
from what the child actually did: which facets they discovered, in what order, in their own words,
and what to try next. That's the artefact a real tutor in a Live + AI system would read before a
session.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Optional, to use a real LLM instead of the offline classifier — put one of these in `.env.local`
(never in `.env.example`, that file is committed and has no secrets in it):

```bash
GROQ_API_KEY=...     # free, no billing — console.groq.com
# or
OPENAI_API_KEY=...   # platform.openai.com
```

Groq is tried first if both are set. Without either, the game runs unchanged on a deterministic
keyword classifier — nothing breaks, nothing degrades except classification nuance.

```bash
npm test            # 21 unit tests — engine, selector, classifier, mastery (vitest)
npm run lint
npm run build
```

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Zustand · Zod ·
`openai` SDK (used for both Groq and OpenAI, since Groq's API is OpenAI-compatible) ·
Web Audio API for sound · the browser's native `speechSynthesis` and `SpeechRecognition` for
Clue's voice and optional voice input. No database — progress and session evidence live in
the browser's `localStorage` only.

## Quality bar

- 21 unit tests covering every world template, the counterexample selector, the offline
  classifier, and the mastery state machine
- Full browser end-to-end tests: all three regions plus the Glitch Boss, played start to finish,
  verified against both the offline fallback and live Groq classification
- Mobile-viewport pass (no horizontal overflow, 44px+ touch targets, reduced-motion respected)
- Every AI response is schema-validated (Zod) with a retry-then-fallback path — a malformed or
  missing model response never breaks the game

## Nerdy relevance

RuleBreakers watches a child's mental model evolve and captures it as evidence — which facets they
discovered, in what order, in their own words — instead of a score. In a Live + AI learning system,
that's the bridge between the two halves: not *what the learner got wrong*, but *how they think and
what moved them forward*, handed to a human tutor before they even say hello.

## Disclosures

See [`THIRD_PARTY_AND_AI_DISCLOSURES.md`](./THIRD_PARTY_AND_AI_DISCLOSURES.md) for AI-use
disclosure and third-party licenses (all permissive; no GPL/LGPL/AGPL/SSPL dependencies). No real
student data is used anywhere in development or testing.

See [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) for the recorded-demo shot list.
