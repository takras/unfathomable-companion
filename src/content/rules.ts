// The rules as the app shows them: the Rules Reference (extracted from the PDF by
// scripts/extract_rules.py), plus, when From the Abyss is in the game, the expansion's own chapters
// and its changes to core rules patched in where they apply.
//
// Inline markup in text: **bold**, *italic*, [[RUN-IN LABEL]], {icon}, <<link text|target id>>.
import core from "./rules-reference.json";
import { abyssPatches, abyssTopics } from "./rules-abyss";

export type BlockType = "p" | "h" | "h3" | "rule" | "step" | "bullet" | "sub" | "example";

export interface Block {
  type: BlockType;
  num?: string;
  text: string;
  /** Id to link to, for blocks without a rule number */
  anchor?: string;
  /** Set on text that From the Abyss added ("added") or rewrote ("changed") */
  abyss?: "added" | "changed";
}

export interface Topic {
  /** Anchor id */
  id: string;
  num: string;
  title: string;
  blocks: Block[];
  related: string[];
  part: "glossary" | "appendix" | "abyss";
}

/**
 * A change From the Abyss makes to a core rule. `at` is a rule or heading number ("3.5"), or "intro"
 * for the topic's opening paragraph, or "end" for the end of the topic.
 * - replace: new text for that block (its bullets stay)
 * - replaceChild: new text for the bullet under `at` that starts with `find`
 * - after: new blocks after that block and its bullets
 */
export type Patch =
  | { topic: string; at: string; mode: "replace"; text: string }
  | { topic: string; at: string; mode: "replaceChild"; find: string; text: string }
  | { topic: string; at: string; mode: "after"; blocks: Block[] };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const coreTopics: Topic[] = (core as Omit<Topic, "id" | "part">[])
  .filter((tp) => tp.title !== "Glossary") // the book's intro, no rules of its own
  .map((tp) => ({
    ...tp,
    blocks: tp.blocks as Block[],
    id: `topic-${tp.num || slug(tp.title)}`,
    part: tp.num ? "glossary" : "appendix",
  }));

const HEADS: BlockType[] = ["rule", "h", "h3"];

/** Index of the block `at` refers to, and the end of its group (its bullets and examples). */
function locate(blocks: Block[], at: string): [number, number] {
  if (at === "intro") return [0, 1];
  if (at === "end") return [blocks.length - 1, blocks.length];
  const i = blocks.findIndex((b) => b.num === at);
  if (i < 0) throw new Error(`rules patch: no block ${at}`);
  let j = i + 1;
  while (j < blocks.length && !HEADS.includes(blocks[j].type)) j++;
  return [i, j];
}

const plainStart = (s: string) => s.replace(/\*\*|\*|\[\[|\]\]/g, "");

function applyPatches(topics: Topic[], patches: Patch[]): Topic[] {
  const byId = new Map(topics.map((tp) => [tp.id, { ...tp, blocks: [...tp.blocks] }]));
  for (const p of patches) {
    const tp = byId.get(`topic-${p.topic}`);
    if (!tp) throw new Error(`rules patch: no topic ${p.topic}`);
    const [i, j] = locate(tp.blocks, p.at);
    if (p.mode === "replace") {
      tp.blocks[i] = { ...tp.blocks[i], text: p.text, abyss: "changed" };
    } else if (p.mode === "replaceChild") {
      const k = tp.blocks.findIndex((b, n) => n > i && n < j && plainStart(b.text).startsWith(p.find));
      if (k < 0) throw new Error(`rules patch: no "${p.find}" under ${p.at}`);
      tp.blocks[k] = { ...tp.blocks[k], text: p.text, abyss: "changed" };
    } else {
      tp.blocks.splice(j, 0, ...p.blocks.map((b) => ({ ...b, abyss: "added" as const })));
    }
  }
  return topics.map((tp) => byId.get(tp.id) ?? tp);
}

let cache: Record<string, Topic[]> = {};

/** All topics to show, in order. */
export function rulesFor(abyss: boolean): Topic[] {
  const key = abyss ? "abyss" : "core";
  if (!cache[key]) {
    cache = { ...cache, [key]: abyss ? [...applyPatches(coreTopics, abyssPatches), ...abyssTopics] : coreTopics };
  }
  return cache[key];
}
