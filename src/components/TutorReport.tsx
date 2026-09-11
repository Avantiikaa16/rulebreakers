"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadSessions } from "@/lib/session";
import { buildReport, type Report } from "@/lib/report";
import { useHydrated } from "@/lib/useHydrated";

export function TutorReport() {
  const hydrated = useHydrated();
  const report = useMemo<Report>(
    () => buildReport(hydrated ? loadSessions() : []),
    [hydrated],
  );
  const [note, setNote] = useState<string | null>(null);
  const [source, setSource] = useState<"llm" | "fallback" | null>(null);

  useEffect(() => {
    if (report.concepts.length === 0) return;
    let alive = true;
    const fb = [report.overall, ...report.concepts.map((c) => c.headline)].join(" ");
    fetch("/api/tutor-report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(report),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { note: string; source: "llm" | "fallback" }) => {
        if (!alive) return;
        setNote(d.note || fb);
        setSource(d.source);
      })
      .catch(() => alive && (setNote(fb), setSource("fallback")));
    return () => {
      alive = false;
    };
  }, [report]);

  if (!hydrated) {
    return <div className="ql-card mx-auto max-w-md p-8 text-center text-sm text-ink-dim">Loading…</div>;
  }

  if (report.concepts.length === 0) {
    return (
      <div className="ql-card mx-auto max-w-md p-8 text-center">
        <p className="text-lg font-semibold">No report yet</p>
        <p className="mt-2 text-sm text-ink-dim">
          Crack a rule in one of the regions and RuleBreakers builds a reasoning profile from what
          the child actually did.
        </p>
        <Link href="/" className="ql-btn mt-5 inline-block bg-explore text-[#0b1020]">
          ← Oops Island
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="rounded-full border border-line bg-bg-raised px-3 py-2 text-sm font-bold text-ink hover:brightness-110"
        >
          ← Island
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-full border border-line bg-bg-raised px-3 py-2 text-sm font-bold text-ink hover:brightness-110"
        >
          Print / save PDF
        </button>
      </div>

      <div className="ql-card overflow-hidden">
        <header className="border-b border-line bg-bg-raised px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-explore">
            Tutor Handoff — RuleBreakers
          </p>
          <h1 className="mt-1 text-xl font-bold">
            Learner reasoning profile · {report.regionsCracked} region{report.regionsCracked === 1 ? "" : "s"}
          </h1>
        </header>

        <div className="space-y-6 px-6 py-6">
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-ink-dim">
              Before the session
            </h2>
            <p className="mt-1.5 text-[15px] leading-relaxed">{note ?? report.overall}</p>
            {source === "llm" && (
              <p className="mt-1 text-[11px] text-ink-dim">
                Phrased by AI from the engine&rsquo;s findings — no assessment added.
              </p>
            )}
          </section>

          {report.concepts.map((c) => (
            <section key={c.concept} className="rounded-xl border border-line p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{c.title}</h3>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: c.strong ? "var(--supported)" : "var(--think)", color: "#0b1020" }}
                >
                  {c.strong ? "Generalised" : "Partial"}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed">{c.headline}</p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-ink-dim">Discovered</p>
                  <ul className="mt-1 list-disc pl-4 text-sm">
                    {c.discovered.length ? c.discovered.map((d) => <li key={d}>{d}</li>) : <li>—</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-ink-dim">Still missing</p>
                  <ul className="mt-1 list-disc pl-4 text-sm">
                    {c.missing.length ? c.missing.map((d) => <li key={d}>{d}</li>) : <li>nothing</li>}
                  </ul>
                </div>
              </div>

              <p className="mt-3 text-[11px] uppercase tracking-widest text-ink-dim">Their words, in order</p>
              <ol className="mt-1 space-y-1 text-sm italic">
                {c.journey.map((s, i) => (
                  <li key={i} className="rounded-lg bg-bg-raised px-3 py-1.5">
                    {i + 1}. &ldquo;{s}&rdquo;
                  </li>
                ))}
              </ol>

              <p className="mt-3 text-sm">
                <span className="text-[11px] uppercase tracking-widest text-ink-dim">Recommended next</span>
                <br />
                {c.recommendedNext}
              </p>
            </section>
          ))}
        </div>
      </div>

      <p className="mx-auto mt-4 w-fit rounded-full bg-bg-raised/90 px-3 py-1 text-center text-xs text-ink-dim">
        Demo artefact. RuleBreakers is not integrated with any Nerdy system.
      </p>
    </article>
  );
}
