import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="text-5xl" aria-hidden>
        🌌
      </div>
      <h1 className="text-2xl font-bold">That corner of the island is empty</h1>
      <p className="text-ink-dim">There&rsquo;s nothing broken here yet.</p>
      <Link href="/" className="ql-btn bg-explore text-[#0b1020]">
        Back to Oops Island
      </Link>
    </main>
  );
}
