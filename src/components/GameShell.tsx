"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/lib/store";
import type { Concept, GroupsWorld, PartitionWorld, SequenceWorld } from "@/lib/types";
import { CONCEPTS, facetDef } from "@/lib/concepts";
import { templateById } from "@/lib/worlds/registry";
import { playCue } from "@/lib/sound";
import { usePixelVoice } from "@/lib/usePixelVoice";
import { Pixel } from "@/components/Pixel";
import { PixelSpeech } from "@/components/PixelSpeech";
import { ExplanationInput } from "@/components/ExplanationInput";
import { FeedbackBar } from "@/components/FeedbackBar";
import { AlertFlash } from "@/components/AlertFlash";
import { Confetti } from "@/components/Confetti";
import { SoundToggle } from "@/components/SoundToggle";
import { IslandSky } from "@/components/IslandSky";
import { DragonBakery } from "@/components/world/DragonBakery";
import { FractionCafe } from "@/components/world/FractionCafe";
import { NumberRailway } from "@/components/world/NumberRailway";

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const CHARACTER: Record<Concept, { name: string; calm: string; upset: string }> = {
  equal_groups: { name: "Baker Bramble", calm: "🧑‍🍳", upset: "😱" },
  equal_partition: { name: "Chef Pol", calm: "👩‍🍳", upset: "😰" },
  skip_count: { name: "Conductor Cody", calm: "🧑‍✈️", upset: "😩" },
};

export function GameShell({ concept }: { concept: Concept }) {
  // start the concept once, before first paint, so there is no wrong-region flash
  useState(() => {
    useGame.getState().start(concept);
    return true;
  });
  const g = useGame();
  const generalized = g.phase === "generalized";

  return (
    <>
      <IslandSky restored={generalized} />
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:px-6">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="rounded-full border border-line bg-bg-raised px-3 py-2 text-sm font-bold text-ink hover:brightness-110"
          >
            ← Island
          </Link>
          <div className="flex items-center gap-3 rounded-full border border-line bg-bg-raised px-3 py-1.5">
            <RuleTracker />
            <SoundToggle />
          </div>
        </header>

        <FeedbackBar note={g.feedback} />

        <AnimatePresence mode="wait">
          <motion.section key={g.phase} {...fade} transition={{ duration: 0.25 }} className="flex-1">
            {g.phase === "intro" && <IntroScreen />}
            {g.phase === "notice" && <NoticeScreen />}
            {g.phase === "fix" && <FixScreen />}
            {g.phase === "fixed" && <FixedScreen />}
            {g.phase === "explain" && <ExplainScreen />}
            {g.phase === "mutate" && <MutateScreen />}
            {g.phase === "generalized" && <GeneralizedScreen />}
          </motion.section>
        </AnimatePresence>
      </main>
    </>
  );
}

function WorldView({ interactive }: { interactive: boolean }) {
  const { world, moveCookie, setPartition, setCar, templateId } = useGame();
  if (world.kind === "groups") {
    return <DragonBakery world={world as GroupsWorld} interactive={interactive} onMove={moveCookie} />;
  }
  if (world.kind === "partition") {
    return (
      <FractionCafe
        world={world as PartitionWorld}
        interactive={interactive}
        onChange={setPartition}
        showEnd={templateId === "short-bar"}
      />
    );
  }
  return <NumberRailway world={world as SequenceWorld} interactive={interactive} onSetCar={setCar} />;
}

function RuleTracker() {
  const { concept, model } = useGame();
  const facets = CONCEPTS[concept].facets;
  return (
    <span
      className="flex gap-1.5"
      aria-label={`${model.covered.length} of ${facets.length} parts of the rule found`}
    >
      {facets.map((f) => {
        const has = model.covered.includes(f.facet);
        return (
          <span
            key={f.facet}
            title={f.kidRule}
            className="h-2.5 w-2.5 rounded-full"
            style={{
              background: has ? "var(--supported)" : "var(--line)",
              boxShadow: has ? "0 0 8px var(--supported)" : "none",
            }}
          />
        );
      })}
    </span>
  );
}

function CharacterLine({ upset, children }: { upset: boolean; children: React.ReactNode }) {
  const { concept } = useGame();
  const c = CHARACTER[concept];
  return (
    <div className="flex items-start gap-3">
      <motion.span
        className="text-4xl"
        aria-hidden
        animate={upset ? { rotate: [0, -8, 8, -6, 6, 0] } : { y: [0, -4, 0] }}
        transition={upset ? { duration: 0.6, repeat: 2 } : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        {upset ? c.upset : c.calm}
      </motion.span>
      <div
        className="relative flex-1 rounded-2xl border-2 px-4 py-3"
        style={{
          borderColor: upset ? "var(--challenge)" : "var(--supported)",
          background: "rgba(20,26,48,0.86)",
          backdropFilter: "blur(8px)",
        }}
      >
        <span className="mb-0.5 block text-[11px] uppercase tracking-widest text-ink-dim">{c.name}</span>
        {children}
      </div>
    </div>
  );
}

/* ---------------- screens ---------------- */

function IntroScreen() {
  const { concept, beginFirstWorld } = useGame();
  const def = CONCEPTS[concept];
  return (
    <div className="ql-card p-6 text-center">
      <div className="text-5xl" aria-hidden>
        {concept === "equal_groups" ? "🍪" : concept === "equal_partition" ? "🍫" : "🚂"}
      </div>
      <h1 className="mt-3 text-2xl font-bold">{def.region}</h1>
      <p className="mt-2 text-ink-dim">
        No question to answer. Look at each little world, figure out what&rsquo;s broken, and fix it.
        Then tell Sy how you knew.
      </p>
      <button className="ql-btn mt-5 bg-explore text-[#0b1020]" onClick={beginFirstWorld}>
        Enter →
      </button>
    </div>
  );
}

function NoticeScreen() {
  const { concept, templateId, nudgeIndex, bumpNudge, seeIt, world } = useGame();
  const { speak } = usePixelVoice();
  const t = templateById(concept, templateId);
  const story = "story" in world ? world.story : "";
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    playCue("alarm");
    speak("Something is wrong!");
    const timers = [
      setTimeout(() => setFlash(false), 1700),
      setTimeout(bumpNudge, 4500),
      setTimeout(bumpNudge, 10000),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  return (
    <>
      <AlertFlash active={flash} />
      <motion.div
        className="flex flex-col gap-4"
        animate={flash ? { x: [0, -8, 8, -6, 6, -3, 0] } : { x: 0 }}
        transition={{ duration: 0.55 }}
      >
        <CharacterLine upset>
          <p className="text-lg font-bold">SOMETHING IS WRONG!</p>
          {story && <p className="mt-1 text-sm">{story}</p>}
          {nudgeIndex > 0 && <p className="mt-1 text-sm text-ink-dim">{t.nudges[nudgeIndex - 1]}</p>}
        </CharacterLine>
        <div className="ql-card p-4">
          <WorldView interactive={false} />
        </div>
        <button className="ql-btn self-center bg-challenge text-[#0b1020]" onClick={seeIt}>
          I think I see it →
        </button>
      </motion.div>
    </>
  );
}

function FixScreen() {
  const { concept, templateId, nudgeIndex, checkFix } = useGame();
  const t = templateById(concept, templateId);
  return (
    <div className="flex flex-col gap-4">
      <div className="ql-card p-3 text-center text-sm">
        <span className="font-semibold text-think">Your job:</span>{" "}
        {nudgeIndex >= 1 ? t.goal : "Look carefully. What doesn't seem right?"}
      </div>
      <div className="ql-card p-4">
        <WorldView interactive />
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button className="ql-btn bg-supported text-[#0b1020]" onClick={() => checkFix("fixed")}>
          I fixed it! ✓
        </button>
        <button className="ql-btn border-2 border-line bg-bg-raised text-ink" onClick={() => checkFix("nothing")}>
          Nothing&rsquo;s wrong 🤨
        </button>
      </div>
    </div>
  );
}

function FixedScreen() {
  const { toExplain } = useGame();
  const { speak } = usePixelVoice();
  useEffect(() => {
    playCue("core");
    speak("You fixed it!");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <Confetti count={26} />
      <CharacterLine upset={false}>
        <p className="text-lg font-bold">Thank you! That&rsquo;s right now.</p>
      </CharacterLine>
      <motion.div className="ql-card p-4 rb-pop" animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 0.5 }}>
        <WorldView interactive={false} />
      </motion.div>
      <button className="ql-btn self-center bg-explore text-[#0b1020]" onClick={toExplain}>
        How did you know? →
      </button>
    </div>
  );
}

function ExplainScreen() {
  const { analyzeAndSubmit, analyzing } = useGame();
  const [text, setText] = useState("");
  return (
    <div className="flex flex-col items-center gap-4">
      <Pixel state={analyzing ? "thinking" : "listening"} size={84} />
      <PixelSpeech tone="curious" voice="How did you know something was wrong?">
        How did you know something was wrong?
      </PixelSpeech>
      <div className="w-full">
        <ExplanationInput
          value={text}
          onChange={setText}
          onSubmit={() => analyzeAndSubmit(text.trim())}
          submitLabel="Tell Sy →"
          busyLabel="Sy is thinking…"
          analyzing={analyzing}
          placeholder="e.g. everyone has to have the same"
        />
      </div>
    </div>
  );
}

function MutateScreen() {
  const { ruleUpgraded, gained, concept, model, nextWorld, lastAnalysis } = useGame();
  const { speak } = usePixelVoice();

  useEffect(() => {
    if (ruleUpgraded) {
      playCue("ruleFormed");
      speak("Your rule just got better!");
    } else {
      playCue("thinking");
      speak("Hmm. Let me test that.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {ruleUpgraded && <Confetti count={34} />}
      <Pixel state="trying" size={84} />
      {ruleUpgraded ? (
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl border-2 px-5 py-4"
          style={{ borderColor: "var(--mastery)", background: "rgba(20,26,48,0.88)", backdropFilter: "blur(8px)" }}
        >
          <p className="text-sm font-bold uppercase tracking-widest text-mastery">Rule upgraded!</p>
          <p className="mt-1 text-lg font-semibold">
            You added: {gained.map((f) => facetDef(concept, f)?.kidRule).join(" · ")}
          </p>
        </motion.div>
      ) : (
        <PixelSpeech tone="curious">
          {lastAnalysis?.childSafeParaphrase
            ? `You said: "${lastAnalysis.childSafeParaphrase}". Let me test that…`
            : "Let me build a new world to test your idea…"}
        </PixelSpeech>
      )}

      <div className="ql-card w-full p-3 text-left text-sm">
        <p className="text-[11px] uppercase tracking-widest text-ink-dim">Your rule so far</p>
        <p className="mt-1">
          {model.covered.length === 0
            ? "…still figuring it out"
            : CONCEPTS[concept].facets
                .filter((f) => model.covered.includes(f.facet))
                .map((f) => f.kidRule)
                .join(", and ")}
        </p>
      </div>

      <button className="ql-btn bg-explore text-[#0b1020]" onClick={nextWorld}>
        Next world →
      </button>
    </div>
  );
}

function GeneralizedScreen() {
  const { concept, model, outcomes, reset } = useGame();
  const { speak } = usePixelVoice();
  const def = CONCEPTS[concept];

  useEffect(() => {
    playCue("core");
    speak("You cracked the rule!");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Confetti count={70} />
      <Pixel state="celebrating" size={104} />
      <h2 className="text-2xl font-bold" style={{ color: "var(--mastery)" }}>
        You cracked the rule!
      </h2>
      <p className="max-w-md text-ink-dim">{def.bigIdea}</p>

      <div className="ql-card w-full p-4 text-left">
        <p className="text-[11px] uppercase tracking-widest text-ink-dim">How your thinking grew</p>
        <ol className="mt-2 space-y-1 text-sm">
          {model.statements.map((s, i) => (
            <li key={i} className="rounded-lg bg-white/5 px-3 py-1.5">&ldquo;{s}&rdquo;</li>
          ))}
        </ol>
        <p className="mt-3 text-[11px] text-ink-dim">
          {outcomes.filter((o) => o.passed).length} worlds repaired
          {outcomes.some((o) => o.isTrick && o.passed) ? " · didn't get tricked" : ""}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="ql-btn bg-mastery text-[#0b1020]">
          Back to the island →
        </Link>
        <Link href="/report" className="ql-btn border border-line bg-bg-raised text-ink">
          Tutor report
        </Link>
        <button className="ql-btn border border-line bg-bg-raised text-ink" onClick={reset}>
          Play again
        </button>
      </div>
    </div>
  );
}
