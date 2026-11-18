import { useEffect, useMemo, useRef, useState } from "react";
import { jump, plain, RuleText } from "../components/RuleText";
import { rulesFor, type Block, type Topic } from "../content/rules";
import { T, t } from "../i18n";
import { useStore } from "../state/store";

// The Rules Reference (scripts/extract_rules.py) and, when From the Abyss is in the game, the
// expansion's chapters plus its changes patched into the core rules (src/content/rules-abyss.ts).

const blockId = (tp: Topic, b: Block, i: number) => b.anchor ?? (b.num && b.type !== "step" ? `rule-${b.num}` : `${tp.id}-${i}`);

interface Hit {
  topic: Topic;
  block: Block;
  id: string;
}

function search(topics: Topic[], query: string): Hit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: Hit[] = [];
  for (const tp of topics) {
    if (tp.title.toLowerCase().includes(q)) hits.push({ topic: tp, block: { type: "h", text: tp.title }, id: tp.id });
    tp.blocks.forEach((b, i) => {
      if (plain(b.text).toLowerCase().includes(q)) hits.push({ topic: tp, block: b, id: blockId(tp, b, i) });
    });
  }
  return hits;
}

/** Contents entries: topics, and the sub-headings inside them. */
interface Entry {
  id: string;
  label: string;
  num?: string;
  level: 2 | 3;
  part: Topic["part"];
}

function contents(topics: Topic[]): Entry[] {
  const out: Entry[] = [];
  for (const tp of topics) {
    out.push({ id: tp.id, label: tp.title, num: tp.num, level: 2, part: tp.part });
    tp.blocks.forEach((b, i) => {
      if (b.type === "h") out.push({ id: blockId(tp, b, i), label: b.text.replace(/\s*\(\{[a-z-]+\}\)/, ""), num: b.num, level: 3, part: tp.part });
    });
  }
  return out;
}

const PART_LABEL: Record<Topic["part"], string> = { glossary: "rules.part.glossary", appendix: "rules.part.appendix", abyss: "rules.part.abyss" };

function BlockView({ tp, b, i }: { tp: Topic; b: Block; i: number }) {
  const id = blockId(tp, b, i);
  const mark = b.abyss ? ` abyss-${b.abyss}` : "";
  const tag = b.abyss && (
    <span className="abyss-tag" title={t(`rules.abyss.${b.abyss}`)}>
      {t(`rules.abyss.${b.abyss}.short`)}
    </span>
  );
  switch (b.type) {
    case "h":
      return (
        <h3 id={id} className={`rule-h${mark}`}>
          {b.num && <span className="hnum">{b.num}</span>}
          <RuleText text={b.text} />
          {tag}
        </h3>
      );
    case "h3":
      return (
        <h4 id={id} className={`rule-h3${mark}`}>
          {b.num && <span className="hnum">{b.num}</span>}
          {b.text}
          {tag}
        </h4>
      );
    case "rule":
    case "step":
      return (
        <div id={id} className={`rule ${b.type}${mark}`}>
          <span className="rnum">{b.num}</span>
          <div>
            <RuleText text={b.text} />
            {tag}
          </div>
        </div>
      );
    case "bullet":
    case "sub":
      return (
        <div id={id} className={`rule-${b.type}${mark}`}>
          <RuleText text={b.text} />
          {tag}
        </div>
      );
    case "example":
      return (
        <p id={id} className={`rule-example${mark}`}>
          <RuleText text={b.text} />
        </p>
      );
    default:
      return (
        <p id={id} className={`rule-p${mark}`}>
          <RuleText text={b.text} />
          {tag}
        </p>
      );
  }
}

export function RulesView({ target, go }: { target?: string; go: (tab: string) => void }) {
  const { state } = useStore();
  const abyss = state.config.abyss;
  const topics = useMemo(() => rulesFor(abyss), [abyss]);
  const toc = useMemo(() => contents(topics), [topics]);
  const byTitle = useMemo(() => new Map(topics.filter((tp) => tp.part !== "abyss").map((tp) => [tp.title.toLowerCase(), tp])), [topics]);

  const [query, setQuery] = useState("");
  const hits = useMemo(() => search(topics, query), [topics, query]);
  const searching = query.trim().length >= 2;

  const [tocOpen, setTocOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const tocRef = useRef<HTMLDivElement>(null);

  // Deep link (#/rules/4 or #/rules/rule-4.13): scroll there once rendered.
  useEffect(() => {
    if (!target) return;
    const id = /^\d+$/.test(target) ? `topic-${target}` : target;
    requestAnimationFrame(() => jump(id));
  }, [target]);

  // Scroll spy: the active entry is the last heading that has passed under the sticky header and search bar.
  useEffect(() => {
    if (searching) return;
    const headings = toc.map((e) => document.getElementById(e.id)).filter(Boolean) as HTMLElement[];
    let timer = 0;
    const update = () => {
      timer = 0;
      const header = document.querySelector<HTMLElement>(".top")?.offsetHeight ?? 0;
      const line = header + 70;
      let current = headings[0]?.id ?? null;
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= line) current = h.id;
        else break;
      }
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) current = headings[headings.length - 1]?.id ?? current;
      setActiveId(current);
    };
    const onScroll = () => {
      if (!timer) timer = window.setTimeout(update, 60);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(timer);
    };
  }, [toc, searching]);

  // Keep the active entry in view inside the open contents list.
  useEffect(() => {
    if (!tocOpen) return;
    const box = tocRef.current;
    const el = box?.querySelector<HTMLElement>("li.active");
    if (!box || !el) return;
    box.scrollTop = el.offsetTop - box.clientHeight / 3;
  }, [activeId, tocOpen]);

  useEffect(() => {
    if (!tocOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setTocOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tocOpen]);

  const open = (id: string) => {
    setQuery("");
    setTocOpen(false);
    requestAnimationFrame(() => requestAnimationFrame(() => jump(id)));
  };

  let lastPart: Topic["part"] | null = null;

  return (
    <div className="view rules">
      <div className="rules-search">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("rules.search")}
          aria-label={t("rules.search")}
        />
      </div>

      <p className="muted small rules-scope">
        <T
          k={abyss ? "rules.scope.abyss" : "rules.scope.core"}
          slots={{
            setup: (
              <button className="link" onClick={() => go("setup")}>
                {t("rules.scope.setup")}
              </button>
            ),
          }}
        />
      </p>

      {searching ? (
        <section className="card search-results">
          <h2>{t("rules.results", { n: hits.length })}</h2>
          {hits.length === 0 && <p className="muted">{t("rules.noResults")}</p>}
          <ol className="hits">
            {hits.slice(0, 80).map((h) => (
              <li key={h.id}>
                <button className="hit" onClick={() => open(h.id)}>
                  <span className="hit-where">
                    {h.block.type !== "step" && (h.block.num ?? h.topic.num)} {h.topic.title}
                    {h.block.abyss && <span className="abyss-tag">{t(`rules.abyss.${h.block.abyss}.short`)}</span>}
                  </span>
                  <span className="hit-text">
                    <RuleText text={h.block.text} query={query.trim()} links={false} />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {hits.length > 80 && <p className="muted small">{t("rules.moreResults", { n: hits.length - 80 })}</p>}
        </section>
      ) : (
        <article className="rulebook">
          {topics.map((tp) => {
            const partHead = tp.part !== lastPart && tp.part !== "glossary";
            lastPart = tp.part;
            return (
              <section key={tp.id} className={`topic part-${tp.part}`}>
                {partHead && <h2 className="part-h">{t(PART_LABEL[tp.part])}</h2>}
                <h2 id={tp.id} className="topic-h">
                  {tp.num && <span className="hnum">{tp.num}</span>}
                  {tp.title}
                </h2>
                {tp.blocks.map((b, i) => (
                  <BlockView key={i} tp={tp} b={b} i={i} />
                ))}
                {tp.related.length > 0 && (
                  <p className="related">
                    <span className="runin">{t("rules.related")}:</span>{" "}
                    {tp.related.map((r, i) => {
                      const to = byTitle.get(r.toLowerCase());
                      return (
                        <span key={r}>
                          {to ? (
                            <a
                              href={`#/rules/${to.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                jump(to.id);
                              }}
                            >
                              {r}
                            </a>
                          ) : (
                            r
                          )}
                          {i < tp.related.length - 1 ? ", " : ""}
                        </span>
                      );
                    })}
                  </p>
                )}
              </section>
            );
          })}
          <p className="muted small source-note">{t(abyss ? "rules.source.abyss" : "rules.source")}</p>
        </article>
      )}

      {/* Contents: a drawer from the left, opened by the floating button (as in BSG Companion). */}
      {tocOpen && <div className="toc-backdrop" onClick={() => setTocOpen(false)} aria-hidden />}
      <nav className={`toc-drawer ${tocOpen ? "open" : ""}`} id="rules-contents" aria-label={t("rules.contents")} aria-hidden={!tocOpen}>
        <h2>{t("rules.contents")}</h2>
        <div className="toc-scroll" ref={tocRef}>
          <ul className="toc">
            {toc.map((e, i) => (
              <li
                key={e.id}
                className={`lvl-${e.level} ${e.id === activeId ? "active" : ""} ${i > 0 && e.part !== toc[i - 1].part ? "part-start" : ""}`}
              >
                {i > 0 && e.part !== toc[i - 1].part && <span className="toc-part">{t(PART_LABEL[e.part])}</span>}
                <button
                  className="toc-link"
                  tabIndex={tocOpen ? 0 : -1}
                  aria-current={e.id === activeId ? "location" : undefined}
                  onClick={() => open(e.id)}
                >
                  {/* keep the number column even without a number, so entries line up */}
                  {(e.num || e.level === 3) && <span className="tnum">{e.num}</span>}
                  <span>{e.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <button className="toc-fab" aria-expanded={tocOpen} aria-controls="rules-contents" onClick={() => setTocOpen((o) => !o)}>
        {tocOpen ? `✕ ${t("rules.close")}` : `☰ ${t("rules.contents")}`}
      </button>
    </div>
  );
}
