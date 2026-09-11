import type { Concept } from "@/lib/types";
import type { WorldTemplate } from "./template";
import { GROUPS_TEMPLATES } from "./groups";
import { PARTITION_TEMPLATES } from "./partition";
import { SEQUENCE_TEMPLATES } from "./sequence";

interface RegionDef {
  templates: WorldTemplate[];
  first: string;
}

export const REGISTRY: Record<Concept, RegionDef> = {
  equal_groups: { templates: GROUPS_TEMPLATES, first: "unequal" },
  equal_partition: { templates: PARTITION_TEMPLATES, first: "unequal-parts" },
  skip_count: { templates: SEQUENCE_TEMPLATES, first: "wrong-car" },
};

export function templatesFor(concept: Concept): WorldTemplate[] {
  return REGISTRY[concept].templates;
}

export function firstTemplateId(concept: Concept): string {
  return REGISTRY[concept].first;
}

export function templateById(concept: Concept, id: string): WorldTemplate {
  return templatesFor(concept).find((t) => t.id === id) ?? templatesFor(concept)[0];
}
