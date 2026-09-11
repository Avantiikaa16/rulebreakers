import { describe, expect, it } from "vitest";
import { GROUPS_TEMPLATES, groupsTotal } from "./worlds/groups";
import { PARTITION_TEMPLATES, partitionFixed, sliceWidths, TICKS } from "./worlds/partition";
import { SEQUENCE_TEMPLATES, sequenceFixed } from "./worlds/sequence";
import { selectGroupsTemplate, selectTemplate } from "./hypothesis/select";
import { classifyHypothesisLocal } from "./hypothesis/classify-local";
import { emptyModel, mergeHypothesis, isComplete } from "./hypothesis/model";
import { deriveMastery, type WorldOutcome } from "./mastery";
import type { GroupsWorld, HypothesisAnalysis, PartitionWorld, SequenceWorld } from "./types";

const g = (w: unknown) => w as GroupsWorld;
const p = (w: unknown) => w as PartitionWorld;
const s = (w: unknown) => w as SequenceWorld;

describe("groups templates", () => {
  it("every template builds a well-formed, unfixed-or-trick world across many seeds", () => {
    for (const t of GROUPS_TEMPLATES) {
      for (let seed = 1; seed < 40; seed++) {
        const w = g(t.build(seed));
        expect(w.groups.length).toBe(3);
        expect(w.groups.every((x) => x >= 0)).toBe(true);
        expect(w.leftover).toBeGreaterThanOrEqual(0);
        expect(t.isFixed(w)).toBe(t.id === "nothing-wrong");
      }
    }
  });

  it("redistribution templates keep the total divisible by group count", () => {
    for (const id of ["unequal", "different-total"]) {
      const t = GROUPS_TEMPLATES.find((x) => x.id === id)!;
      for (let seed = 1; seed < 30; seed++) {
        const w = g(t.build(seed));
        expect(groupsTotal(w) % w.groups.length).toBe(0);
        const fair = groupsTotal(w) / w.groups.length;
        expect(t.isFixed({ ...w, groups: [fair, fair, fair], leftover: 0 })).toBe(true);
      }
    }
  });

  it("leftover template needs the counter emptied, not just equal groups", () => {
    const t = GROUPS_TEMPLATES.find((x) => x.id === "leftover")!;
    const w = g(t.build(3));
    expect(t.isFixed({ ...w, leftover: w.leftover })).toBe(false);
    expect(t.isFixed({ ...w, groups: w.groups.map((x) => x + 1), leftover: 0 })).toBe(true);
  });
});

describe("partition templates", () => {
  it("builds broken worlds and a fixable target", () => {
    for (const t of PARTITION_TEMPLATES) {
      for (let seed = 1; seed < 20; seed++) {
        const w = p(t.build(seed));
        expect(t.isFixed(w)).toBe(t.id === "nothing-wrong");
        const d = w.target.denominator;
        const fixed: PartitionWorld = {
          ...w,
          end: TICKS,
          cuts: Array.from({ length: d - 1 }, (_, i) => ((i + 1) * TICKS) / d),
        };
        expect(partitionFixed(fixed)).toBe(true);
        expect(sliceWidths(fixed).length).toBe(d);
      }
    }
  });
});

describe("sequence templates", () => {
  it("builds broken trains and a fixable target", () => {
    for (const t of SEQUENCE_TEMPLATES) {
      for (let seed = 1; seed < 20; seed++) {
        const w = s(t.build(seed));
        expect(t.isFixed(w)).toBe(t.id === "nothing-wrong");
        const present = w.terms.filter((x): x is number => x !== null);
        const start = present[0];
        const fixed: SequenceWorld = {
          ...w,
          terms: w.terms.map((_, i) => start + i * w.step),
        };
        expect(sequenceFixed(fixed)).toBe(true);
      }
    }
  });

  it("choices always include the value each broken slot needs", () => {
    for (const t of SEQUENCE_TEMPLATES) {
      const w = s(t.build(5));
      const present = w.terms.filter((x): x is number => x !== null);
      const start = present[0];
      w.terms.forEach((_, i) => expect(w.choices).toContain(start + i * w.step));
    }
  });
});

describe("generic selector across concepts", () => {
  it("partition: missing equal_size → the unequal-parts world", () => {
    const a: HypothesisAnalysis = {
      raw: "", concept: "equal_partition", covers: [], missing: ["equal_size", "part_count", "covers_whole"],
      mentionsSpecificNumber: false, childSafeParaphrase: "", confidence: 0.5,
    };
    expect(selectTemplate("equal_partition", a, []).id).toBe("unequal-parts");
  });

  it("skip_count: complete hypothesis → the trick", () => {
    const a: HypothesisAnalysis = {
      raw: "", concept: "skip_count", covers: ["constant_step", "step_value", "extends"], missing: [],
      mentionsSpecificNumber: false, childSafeParaphrase: "", confidence: 0.9,
    };
    expect(selectTemplate("skip_count", a, ["wrong-car", "wrong-step-car", "missing-end"]).id).toBe("nothing-wrong");
  });
});

function analysis(partial: Partial<HypothesisAnalysis>): HypothesisAnalysis {
  return {
    raw: "",
    concept: "equal_groups",
    covers: [],
    missing: ["equality", "exhaustiveness", "count_independence"],
    mentionsSpecificNumber: false,
    childSafeParaphrase: "",
    confidence: 0.5,
    ...partial,
  };
}

describe("counterexample selector", () => {
  it("missing 'equality' → the unequal world", () => {
    const t = selectGroupsTemplate(analysis({ covers: [], missing: ["equality", "exhaustiveness"] }), []);
    expect(t.id).toBe("unequal");
  });

  it("covers equality but misses exhaustiveness → the leftover world", () => {
    const t = selectGroupsTemplate(
      analysis({ covers: ["equality"], missing: ["exhaustiveness", "count_independence"] }),
      ["unequal"],
    );
    expect(t.id).toBe("leftover");
  });

  it("a memorised number → the different-total world (count_independence floated to front)", () => {
    const t = selectGroupsTemplate(
      analysis({
        covers: ["equality"],
        missing: ["exhaustiveness", "count_independence"],
        mentionsSpecificNumber: true,
      }),
      [],
    );
    expect(t.id).toBe("different-total");
  });

  it("a complete hypothesis → the trick world", () => {
    const t = selectGroupsTemplate(
      analysis({ covers: ["equality", "exhaustiveness", "count_independence"], missing: [] }),
      ["unequal", "leftover", "different-total"],
    );
    expect(t.id).toBe("nothing-wrong");
  });

  it("no analysis → authored order", () => {
    expect(selectGroupsTemplate(null, []).id).toBe("unequal");
    expect(selectGroupsTemplate(null, ["unequal"]).id).toBe("leftover");
  });
});

describe("local hypothesis classifier", () => {
  it("'everyone gets the same' covers equality only", () => {
    const a = classifyHypothesisLocal("everyone gets the same amount", "equal_groups");
    expect(a.covers).toEqual(["equality"]);
    expect(a.missing).toContain("exhaustiveness");
  });

  it("'share all of them equally' covers equality and exhaustiveness", () => {
    const a = classifyHypothesisLocal("you share all of them so everyone is equal", "equal_groups");
    expect(a.covers).toContain("equality");
    expect(a.covers).toContain("exhaustiveness");
  });

  it("'everyone needs four' flags a memorised number", () => {
    const a = classifyHypothesisLocal("everyone needs four", "equal_groups");
    expect(a.mentionsSpecificNumber).toBe(true);
  });

  it("'it depends how many there are' does not flag a memorised number", () => {
    const a = classifyHypothesisLocal("it depends how many cookies there are, then split them", "equal_groups");
    expect(a.mentionsSpecificNumber).toBe(false);
    expect(a.covers).toContain("count_independence");
  });

  it("plausible child sentences cover the intended facet in every concept", () => {
    const cases: [string, string, string][] = [
      ["equal_groups", "everyone gets the same amount", "equality"],
      ["equal_groups", "you give out all of them, none left over", "exhaustiveness"],
      ["equal_groups", "it changes when there are more or fewer, you split the total", "count_independence"],
      ["equal_partition", "the pieces have to be exactly the same size", "equal_size"],
      ["equal_partition", "there has to be the right number of pieces, like the bottom number", "part_count"],
      ["equal_partition", "the pieces have to cover the whole bar with nothing left", "covers_whole"],
      ["skip_count", "every jump between the cars is the same", "constant_step"],
      ["skip_count", "you count by a special number like twos or fives", "step_value"],
      ["skip_count", "the pattern keeps going the same way", "extends"],
    ];
    for (const [concept, text, facet] of cases) {
      const a = classifyHypothesisLocal(text, concept as never);
      expect(a.covers, `${concept}: "${text}"`).toContain(facet);
    }
  });
});

describe("hypothesis model", () => {
  it("first hypothesis is never an upgrade; later new facets are", () => {
    let m = emptyModel("equal_groups");
    const r1 = mergeHypothesis(m, classifyHypothesisLocal("everyone the same", "equal_groups"));
    expect(r1.upgraded).toBe(false);
    m = r1.model;
    const r2 = mergeHypothesis(m, classifyHypothesisLocal("and you use all of them, none left", "equal_groups"));
    expect(r2.upgraded).toBe(true);
    expect(r2.gained).toContain("exhaustiveness");
    expect(isComplete(r2.model)).toBe(false);
  });
});

describe("mastery", () => {
  const model = { concept: "equal_groups" as const, covered: ["equality", "exhaustiveness", "count_independence"] as const, statements: ["a", "b"] };

  it("needs a beaten trick and a real counterexample fix to generalize", () => {
    const partial: WorldOutcome[] = [
      { templateId: "unequal", exposedFacet: "equality", passed: true, isTrick: false },
      { templateId: "leftover", exposedFacet: "exhaustiveness", passed: true, isTrick: false },
    ];
    expect(deriveMastery({ ...model, covered: [...model.covered] }, partial)).toBe("testing");

    const full: WorldOutcome[] = [
      ...partial,
      { templateId: "nothing-wrong", exposedFacet: null, passed: true, isTrick: true },
    ];
    expect(deriveMastery({ ...model, covered: [...model.covered] }, full)).toBe("generalized");
  });

  it("no hypothesis yet → exploring", () => {
    expect(deriveMastery(emptyModel("equal_groups"), [])).toBe("exploring");
  });
});
