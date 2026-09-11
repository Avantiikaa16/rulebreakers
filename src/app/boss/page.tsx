import type { Metadata } from "next";
import { GlitchBoss } from "@/components/GlitchBoss";

export const metadata: Metadata = { title: "RuleBreakers — The Glitch" };

export default function BossPage() {
  return <GlitchBoss />;
}
