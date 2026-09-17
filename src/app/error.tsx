"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("RuleBreakers hit an unexpected error");
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="text-5xl" aria-hidden>
        🛠️
      </div>
      <h1 className="text-2xl font-bold">Clue needs a moment</h1>
      <p className="text-ink-dim">Something went wobbly. Your progress is saved — let&rsquo;s try that again.</p>
      <div className="flex gap-3">
        <button className="ql-btn bg-explore text-[#0b1020]" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="ql-btn border border-line text-ink">
          Back to the island
        </Link>
      </div>
    </main>
  );
}
