import type { Metadata } from "next";
import { IslandSky } from "@/components/IslandSky";
import { TutorReport } from "@/components/TutorReport";

export const metadata: Metadata = { title: "RuleBreakers — Tutor Handoff Report" };

export default function ReportPage() {
  return (
    <>
      <IslandSky />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <TutorReport />
      </main>
    </>
  );
}
