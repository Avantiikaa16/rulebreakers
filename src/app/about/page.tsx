import type { Metadata } from "next";
import Link from "next/link";
import { IslandSky } from "@/components/IslandSky";
import { Pixel } from "@/components/Pixel";
import { CONCEPTS } from "@/lib/concepts";

export const metadata: Metadata = { title: "RuleBreakers — for grown-ups & judges" };

export default function About() {
  return (
    <>
      <IslandSky />
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-16">
        <Link
          href="/"
          className="self-start rounded-full border border-line bg-bg-raised px-3 py-2 text-sm font-bold text-ink hover:brightness-110"
        >
          ← Back to Oops Island
        </Link>

        <div className="ql-card flex flex-col gap-8 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <Pixel state="idle" size={72} />
            <div>
              <h1 className="text-3xl font-bold">RuleBreakers</h1>
              <p className="font-semibold text-think">Spot what&rsquo;s wrong. Figure out the rule. Fix it.</p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">The inversion</h2>
            <p className="text-ink-dim">
              Every math app starts the same way: here is a question, find the answer. RuleBreakers does
              the opposite. The child is dropped into a small broken world with <em>no question</em>.
              They have to <strong className="text-ink">notice</strong> what&rsquo;s wrong,{" "}
              <strong className="text-ink">discover</strong> the hidden rule,{" "}
              <strong className="text-ink">fix</strong> the world, and{" "}
              <strong className="text-ink">explain</strong> how they knew. Then the AI builds the next
              world specifically to test the rule they just stated.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">The Hypothesis Engine</h2>
            <p className="text-ink-dim">
              We don&rsquo;t ask the model to invent math problems. A deterministic engine owns every
              concept as a set of <em>facets</em> — for fair sharing: equal groups, use all of it, the
              amount depends on the total. The LLM (<code>gpt-4o-mini</code>, server-side) only reads
              the child&rsquo;s sentence and marks which facets it covers. The engine then picks the
              authored counterexample that isolates a missing facet — the smallest world that
              distinguishes real understanding from the child&rsquo;s current wording. Every world&rsquo;s
              state, and whether a fix is correct, is decided by code, not the model.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">Don&rsquo;t get tricked</h2>
            <p className="text-ink-dim">
              Some worlds aren&rsquo;t broken at all. If a child always changes something, they&rsquo;ve
              learned the wrong lesson — so a correct answer is sometimes &ldquo;nothing is wrong
              here.&rdquo; It also teaches them not to trust a claim just because a character (or an AI)
              makes it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">The three regions</h2>
            <ul className="grid gap-2 sm:grid-cols-3">
              {Object.values(CONCEPTS).map((c) => (
                <li key={c.concept} className="rounded-2xl border border-line bg-bg-raised p-3 text-sm">
                  <strong>{c.region}</strong>
                  <span className="mt-1 block text-ink-dim">{c.bigIdea}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-ink-dim">
              Then the Glitch Boss corrupts one scene in all three ways at once.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">Nerdy relevance</h2>
            <p className="text-ink-dim">
              RuleBreakers watches a child&rsquo;s mental model evolve and captures it as a reasoning
              profile — which facets they discovered, in which order, in their own words. In a Live + AI
              learning system, that&rsquo;s what a tutor reads before the session: not what the learner
              got wrong, but how they think and what moved them forward.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
