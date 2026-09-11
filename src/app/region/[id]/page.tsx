import { notFound } from "next/navigation";
import { regionBySlug } from "@/lib/regions";
import { GameShell } from "@/components/GameShell";

export default async function RegionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const region = regionBySlug(id);
  if (!region) notFound();
  return <GameShell concept={region.concept} />;
}
