import { useEffect, useRef, useState } from "react";
import { drawPreludes, MAX_PER_TYPE, PRELUDE_PRESETS, PRELUDE_TYPES, preludeById, preludes, type Prelude, type PreludeCounts } from "../data/preludes";
import { T, t } from "../i18n";
import { useStore } from "../state/store";
import { RuleText } from "./RuleText";

/** Card text keeps the card's line breaks. */
const Lines = ({ text }: { text: string }) => (
  <>
    {text.split("\n").map((line, i) => (
      <p key={i}>
        <RuleText text={line} />
      </p>
    ))}
  </>
);

/** A drawn card, enlarged over the page. */
function Lightbox({ card, onClose }: { card: Prelude; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={card.title} onClick={onClose}>
      <img src={card.image} alt={card.title} />
      <button className="lightbox-close" onClick={onClose}>
        ✕ {t("preludes.close")}
      </button>
    </div>
  );
}

/** From the Abyss preludes on the Setup page: 1 choose the mix, 2 leave cards out (optional), 3 draw. */
export function PreludeSetup({ locked }: { locked: boolean }) {
  const { state, dispatch } = useStore();
  const { preludeCounts: counts, preludeExcluded: excluded } = state.config;
  const drawn = state.preludeDraw.map((id) => preludeById[id]).filter(Boolean);
  const [zoom, setZoom] = useState<Prelude | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [justDrew, setJustDrew] = useState(0);

  const available = (type: Prelude["type"]) => preludes.filter((pr) => pr.type === type && !excluded.includes(pr.id)).length;
  const setCounts = (next: PreludeCounts) => dispatch({ type: "config", patch: { preludeCounts: next } });
  const setCount = (type: Prelude["type"], n: number) => setCounts({ ...counts, [type]: Math.max(0, Math.min(MAX_PER_TYPE, n)) });
  const toggleCard = (id: string) =>
    dispatch({ type: "config", patch: { preludeExcluded: excluded.includes(id) ? excluded.filter((x) => x !== id) : [...excluded, id] } });

  const total = counts.day + counts.twilight + counts.night;
  const short = PRELUDE_TYPES.filter((type) => counts[type] > available(type));
  const preset = PRELUDE_PRESETS.find((p) => PRELUDE_TYPES.every((type) => p.counts[type] === counts[type]))?.id;
  const mix = (c: PreludeCounts) => PRELUDE_TYPES.map((type) => `${c[type]} ${t(`preludes.type.${type}`).toLowerCase()}`).join(", ");

  // The cards on screen no longer match the choices above: the mix changed, or a drawn card was left out.
  const drawnCounts: PreludeCounts = {
    day: drawn.filter((pr) => pr.type === "day").length,
    twilight: drawn.filter((pr) => pr.type === "twilight").length,
    night: drawn.filter((pr) => pr.type === "night").length,
  };
  const stale = drawn.length > 0 && (PRELUDE_TYPES.some((type) => drawnCounts[type] !== counts[type]) || drawn.some((pr) => excluded.includes(pr.id)));

  // Bring the result into view after drawing.
  useEffect(() => {
    if (justDrew) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [justDrew]);

  const draw = () => {
    dispatch({ type: "setPreludeDraw", ids: drawPreludes(counts, excluded) });
    setJustDrew((n) => n + 1);
  };

  return (
    <section className="card preludes">
      <h2>{t("preludes.title")}</h2>
      <p className="muted small">{t("preludes.intro")}</p>

      {!locked && (
        <>
          <h3 className="step-h">
            <span className="step-n">1</span>
            {t("preludes.step.mix")}
          </h3>
          <div className="segmented presets" role="radiogroup" aria-label={t("preludes.presets")}>
            {PRELUDE_PRESETS.map((p) => (
              <button key={p.id} role="radio" aria-checked={preset === p.id} className={preset === p.id ? "on" : ""} onClick={() => setCounts(p.counts)}>
                {t(`preludes.preset.${p.id}`)}
              </button>
            ))}
          </div>
          <div className="steppers">
            {PRELUDE_TYPES.map((type) => (
              <div key={type} className={`stepper ${type}`}>
                <span className="stepper-label">{t(`preludes.type.${type}`)}</span>
                <div className="stepper-controls">
                  <button onClick={() => setCount(type, counts[type] - 1)} disabled={counts[type] === 0} aria-label={t("preludes.fewer", { type: t(`preludes.type.${type}`) })}>
                    −
                  </button>
                  <span className="stepper-value">{counts[type]}</span>
                  <button
                    onClick={() => setCount(type, counts[type] + 1)}
                    disabled={counts[type] >= Math.min(MAX_PER_TYPE, available(type))}
                    aria-label={t("preludes.more", { type: t(`preludes.type.${type}`) })}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="muted small">{t("preludes.balance")}</p>

          <h3 className="step-h">
            <span className="step-n">2</span>
            {t("preludes.step.pool")}
            <span className="optional">{t("preludes.optional")}</span>
          </h3>
          <details className="pool">
            <summary>
              {excluded.length ? t("preludes.pool.excluded", { n: excluded.length }) : t("preludes.pool.all")}{" "}
              <span className="muted small">{t("preludes.pool.open")}</span>
            </summary>
            <p className="muted small">{t("preludes.pool.hint")}</p>
            {PRELUDE_TYPES.map((type) => (
              <div key={type}>
                <h4 className={`pool-h ${type}`}>{t(`preludes.type.${type}`)}</h4>
                <div className="pool-grid">
                  {preludes
                    .filter((pr) => pr.type === type)
                    .map((pr) => {
                      const out = excluded.includes(pr.id);
                      return (
                        <button key={pr.id} className={`pool-card ${out ? "out" : ""}`} aria-pressed={!out} onClick={() => toggleCard(pr.id)}>
                          <img src={pr.image} alt="" loading="lazy" />
                          <span>{pr.title}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </details>

          <h3 className="step-h">
            <span className="step-n">3</span>
            {t("preludes.step.draw")}
          </h3>
          {short.length > 0 && (
            <p className="warn small">{t("preludes.notEnough", { types: short.map((type) => t(`preludes.type.${type}`)).join(", ") })}</p>
          )}
          {total === 0 && <p className="warn small">{t("preludes.none")}</p>}
          <button className="primary wide" disabled={total === 0 || short.length > 0} onClick={draw}>
            {t(drawn.length ? "preludes.redraw" : "preludes.draw", { n: total })}
          </button>
          <p className="muted small center">{t("preludes.drawHint", { mix: mix(counts) })}</p>
        </>
      )}

      <div ref={resultsRef} className="drawn-wrap">
        {drawn.length > 0 ? (
          <>
            <h3 className="sub-h">{t("preludes.drawn")}</h3>
            {stale && !locked && <p className="warn">{t("preludes.stale", { mix: mix(drawnCounts) })}</p>}
            <p className="small">
              <T k="preludes.resolve" />
            </p>
            <ol className="drawn">
              {drawn.map((pr, i) => (
                <li key={`${justDrew}-${pr.id}`} className={`drawn-card ${pr.type}`}>
                  <span className="roundel">{i + 1}</span>
                  <button className="card-thumb" onClick={() => setZoom(pr)} aria-label={t("preludes.enlarge", { title: pr.title })}>
                    <img src={pr.image} alt="" />
                  </button>
                  <div className="drawn-text">
                    <div className="drawn-title">
                      {pr.title} <span className={`type-tag ${pr.type}`}>{t(`preludes.type.${pr.type}`)}</span>
                    </div>
                    <details className="flavor">
                      <summary>{t("preludes.readAloud")}</summary>
                      <p>{pr.flavor}</p>
                    </details>
                    <div className="ability">
                      <Lines text={pr.text} />
                    </div>
                    {pr.keep && <p className="note-line small">{t("preludes.keep")}</p>}
                    {pr.delegate && <p className="note-line small">{t("preludes.delegateApplied")}</p>}
                  </div>
                </li>
              ))}
            </ol>
            <p className="muted small">{t("preludes.after")}</p>
          </>
        ) : (
          locked && <p className="muted">{t("preludes.noneDrawn")}</p>
        )}
      </div>

      {zoom && <Lightbox card={zoom} onClose={() => setZoom(null)} />}
    </section>
  );
}
