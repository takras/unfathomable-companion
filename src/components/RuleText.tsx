import { Fragment, type ReactNode } from "react";
import { GameIcon, type GameIconId } from "./GameIcon";

/** Scroll a rules anchor into view (below the sticky header) and flash it. */
export function jump(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ block: "start" });
  el.classList.remove("flash");
  void el.offsetWidth; // restart the animation
  el.classList.add("flash");
}

// Inline markup in the rules (see src/content/rules.ts):
//   **bold**  *italic*  [[RUN-IN LABEL]]  {icon-name}  <<link text|anchor id>>
// and, for search, a query to highlight.

const ICON: Record<string, GameIconId> = {
  "mother-hydra": "act-mother-hydra",
  "father-dagon": "act-father-dagon",
  "deep-ones": "act-deep-ones",
  shoggoth: "act-shoggoth",
  "drowned-spirit": "act-drowned-spirit",
  "grasping-tendril": "act-grasping-tendril",
  horror: "act-horror",
  "track-travel": "track-travel",
  "track-ritual": "track-ritual",
  "track-choice": "track-choice",
  fuel: "res-fuel",
  food: "res-food",
  sanity: "res-sanity",
  souls: "res-souls",
  influence: "skill-influence",
  lore: "skill-lore",
  observation: "skill-observation",
  strength: "skill-strength",
  will: "skill-will",
  treachery: "skill-treachery",
};

const ICON_NAME: Record<string, string> = {
  "mother-hydra": "Mother Hydra",
  "father-dagon": "Father Dagon",
  "deep-ones": "Deep Ones",
  shoggoth: "Shoggoth",
  "drowned-spirit": "Drowned Spirit",
  "grasping-tendril": "Grasping Tendril",
  horror: "horror",
  boon: "boon",
  "track-travel": "travel track",
  "track-ritual": "ritual track",
  "track-choice": "choice of track",
};

/** Plain text of a marked-up string (for search). */
export const plain = (s: string) =>
  s
    .replace(/\{([a-z-]+)\}/g, (_m, id) => ICON_NAME[id] ?? id)
    .replace(/<<(.+?)\|.+?>>/g, "$1")
    .replace(/\*\*|\*|\[\[|\]\]/g, "");

function highlight(text: string, query: string, key: string): ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const out: ReactNode[] = [];
  let i = 0;
  for (;;) {
    const at = lower.indexOf(query, i);
    if (at < 0) break;
    if (at > i) out.push(text.slice(i, at));
    out.push(<mark key={`${key}-${at}`}>{text.slice(at, at + query.length)}</mark>);
    i = at + query.length;
  }
  if (!out.length) return text;
  if (i < text.length) out.push(text.slice(i));
  return out;
}

const TOKEN = /\*\*(.+?)\*\*|\[\[(.+?)\]\]|\{([a-z-]+)\}|<<(.+?)\|(.+?)>>|\*(.+?)\*/g;

export function RuleText({ text, query = "", links = true }: { text: string; query?: string; links?: boolean }) {
  const q = query.toLowerCase();
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(text))) {
    if (m.index > last) out.push(<Fragment key={last}>{highlight(text.slice(last, m.index), q, `t${last}`)}</Fragment>);
    const k = m.index;
    if (m[1] !== undefined) out.push(<strong key={k}>{highlight(m[1], q, `b${k}`)}</strong>);
    else if (m[2] !== undefined) out.push(<span key={k} className="runin">{highlight(m[2], q, `l${k}`)}</span>);
    else if (m[3] !== undefined) {
      const id = ICON[m[3]];
      // no picture for this icon (boon): its name in small capitals
      out.push(id ? <GameIcon key={k} id={id} size="1.15em" label={ICON_NAME[m[3]] ?? m[3]} /> : <span key={k} className="runin">{ICON_NAME[m[3]] ?? m[3]}</span>);
    } else if (m[4] !== undefined) {
      const target = m[5];
      if (!links) {
        out.push(<span key={k}>{highlight(m[4], q, `a${k}`)}</span>);
        last = TOKEN.lastIndex;
        continue;
      }
      out.push(
        <a
          key={k}
          href={`#/rules/${target}`}
          onClick={(e) => {
            e.preventDefault();
            jump(target);
          }}
        >
          {highlight(m[4], q, `a${k}`)}
        </a>,
      );
    } else out.push(<em key={k}>{highlight(m[6], q, `i${k}`)}</em>);
    last = TOKEN.lastIndex;
  }
  if (last < text.length) out.push(<Fragment key={last}>{highlight(text.slice(last), q, `t${last}`)}</Fragment>);
  return <>{out}</>;
}
