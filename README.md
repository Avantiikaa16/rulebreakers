# RuleBreakers

**Spot what's wrong. Figure out the rule. Fix it.**

A K–5 math game for the Nerdy AI Hackathon Challenge. Every math app starts the same way —
*here is a question, find the answer.* RuleBreakers does the opposite: the child is dropped into a
small broken world with **no question**, and has to notice what's wrong, discover the hidden rule,
repair the world, and explain how they knew. Then the AI builds the next world specifically to test
the rule they just stated.

## The loop

```
NOTICE  something isn't right
  ↓
DISCOVER  the hidden mathematical rule
  ↓
FIX  manipulate the world
  ↓
EXPLAIN  tell Sy why it was wrong
  ↓
WORLD MUTATES  the AI builds the smallest counterexample that tests your rule
  ↓
GENERALIZE  your rule levels up until it's complete
```

## The Hypothesis Engine

The interesting AI job here isn't generating math problems — it's **inventing the smallest
counterexample that exposes the boundary of a child's understanding.**

- A deterministic engine (`src/lib/worlds`, `src/lib/mastery.ts`) owns each concept as a set of
  **facets**. For fair sharing: *equal groups*, *use all of it*, *the amount depends on the total*.
- The LLM (`gpt-4o-mini` by default, server-side, `src/lib/ai/analyze-hypothesis.ts`) only reads the
  child's sentence and marks which facets it covers. Zod-validated; deterministic keyword fallback
  (`src/lib/hypothesis/classify-local.ts`) means it runs fully offline with no API key.
- The **selector** (`src/lib/hypothesis/select.ts`) picks the authored world template whose
  parameters isolate a missing facet.
- Whether a fix is correct, and whether the child has generalised, is decided by code — never the model.

Some worlds aren't broken at all. If a child always changes something, they've learned the wrong
lesson — so a correct answer is sometimes "nothing is wrong here."

## Regions

| Region | Concept | Facets |
|---|---|---|
| 🍪 Dragon Bakery | fair shares / division | equal groups · use all of it · depends on the total |
| 🍫 Fraction Café | equal partition / fractions | equal pieces · right number of pieces · covers the whole |
| 🚂 Number Railway | skip-counting patterns | constant step · which step · keeps going |
| 🦹 Glitch Boss | all three at once | find every glitch — or spot that one isn't broken |

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Optional: put `OPENAI_API_KEY=...` in `.env.local` to use GPT for hypothesis classification
and the tutor report (defaults to `gpt-4o-mini`; override with `OPENAI_MODEL`). Without it,
everything still works on the deterministic fallback.

```bash
npm test           # engine unit tests (vitest)
npm run build
```

## Nerdy relevance

RuleBreakers watches a child's mental model evolve and captures it as a **reasoning profile**
(`/report`) — which facets they discovered, in what order, in their own words. In a Live + AI
learning system, that's what a tutor reads before the session: not what the learner got wrong, but
how they think and what moved them forward.

See `THIRD_PARTY_AND_AI_DISCLOSURES.md` for licenses and AI-use disclosure.
