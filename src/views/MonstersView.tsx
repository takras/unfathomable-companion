import { useState } from "react";
import { Collapsible } from "../components/Collapsible";
import { GameIcon } from "../components/GameIcon";
import { activationById, activations, type Activation, type ActivationId } from "../data/monsters";
import { has, T, t } from "../i18n";
import { useStore } from "../state/store";

type HorrorCount = "none" | "one" | "many";

const HORRORS: ActivationId[] = ["shoggoth", "drownedSpirit", "graspingTendril"];

const numbered = (k: string, count: number) =>
  Array.from({ length: count }, (_, i) => (
    <li key={i}>
      <T k={`${k}${i + 1}`} />
    </li>
  ));

/** What one activation icon does. */
function ActivationCard({
  a,
  index,
  horrors,
  setHorrors,
  onAdd,
}: {
  a: Activation;
  index: number;
  horrors: HorrorCount;
  setHorrors: (h: HorrorCount) => void;
  onAdd: (id: ActivationId) => void;
}) {
  const k = `activation.${a.id}`;
  return (
    <section className={`card activation ${a.id}`}>
      <div className="activation-head">
        <span className="step-no">{index + 1}</span>
        <GameIcon id={a.icon} size={40} />
        <h2>{t(`${k}.name`)}</h2>
      </div>

      {a.id === "horror" ? (
        <>
          <div className="segmented" role="radiogroup" aria-label={t("activation.horror.onBoard")}>
            {(["none", "one", "many"] as HorrorCount[]).map((h) => (
              <button key={h} role="radio" aria-checked={horrors === h} className={horrors === h ? "on" : ""} onClick={() => setHorrors(h)}>
                {t(`activation.horror.count.${h}`)}
              </button>
            ))}
          </div>
          <p>
            <T k={`activation.horror.${horrors}`} />
          </p>
          {horrors !== "none" && (
            <div className="add-row">
              <span className="muted small">{t("activation.horror.add")}</span>
              {HORRORS.map((id) => (
                <button key={id} className="chip" onClick={() => onAdd(id)}>
                  <GameIcon id={activationById[id].icon} size={20} />
                  {t(`activation.${id}.short`)}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* the lead-in: spawn rules for horrors, or the first line for monarchs */}
          {has(`${k}.intro`) && (
            <p>
              <T k={`${k}.intro`} />
            </p>
          )}
          {a.steps > 0 && <ol>{numbered(`${k}.step`, a.steps)}</ol>}
          {a.options > 0 && (
            <>
              <p className="muted small">{t("activation.firstOption")}</p>
              <ol className="options">{numbered(`${k}.option`, a.options)}</ol>
            </>
          )}
          {has(`${k}.note`) && (
            <p className="note">
              <T k={`${k}.note`} />
            </p>
          )}
        </>
      )}
    </section>
  );
}

export function MonstersView() {
  const { state, dispatch } = useStore();
  const abyss = state.config.abyss;
  const picked = state.activations;
  const [horrors, setHorrors] = useState<HorrorCount>("none");
  const set = (ids: ActivationId[]) => dispatch({ type: "setActivations", ids });
  const available = activations.filter((a) => abyss || a.box === "core");

  return (
    <div className="view monsters">
      <p className="muted">{t("monsters.intro")}</p>

      <div className="icon-picker" role="group" aria-label={t("monsters.picker")}>
        {available.map((a) => (
          <button key={a.id} className="icon-btn" onClick={() => set([...picked, a.id])} title={t(`activation.${a.id}.name`)}>
            <GameIcon id={a.icon} size={44} />
            <span>{t(`activation.${a.id}.short`)}</span>
          </button>
        ))}
      </div>

      {picked.length > 0 ? (
        <>
          <div className="sequence">
            {picked.map((id, i) => (
              <button
                key={i}
                className="chip"
                onClick={() => set(picked.filter((_, j) => j !== i))}
                aria-label={t("monsters.remove", { name: t(`activation.${id}.name`) })}
              >
                <GameIcon id={activationById[id].icon} size={20} />
                <span aria-hidden>×</span>
              </button>
            ))}
            <button className="link" onClick={() => set([])}>
              {t("monsters.clear")}
            </button>
          </div>
          {picked.map((id, i) => (
            <ActivationCard
              key={i}
              a={activationById[id]}
              index={i}
              horrors={horrors}
              setHorrors={setHorrors}
              onAdd={(h) => set([...picked, h])}
            />
          ))}
        </>
      ) : (
        <p className="callout muted">{t("monsters.empty")}</p>
      )}

      <Collapsible title={t("monsters.mythos")}>
        <ol>
          <li>
            <T k="monsters.mythos.crisis" />
          </li>
          <li>
            <T k="monsters.mythos.activation" />
          </li>
          <li>
            <T k="monsters.mythos.track" />
          </li>
        </ol>
        <ul className="track-icons">
          <li>
            <GameIcon id="track-travel" size={26} /> <T k="monsters.track.travel" />
          </li>
          <li>
            <GameIcon id="track-ritual" size={26} /> <T k="monsters.track.ritual" />
          </li>
          <li>
            <GameIcon id="track-choice" size={26} /> <T k="monsters.track.choice" />
          </li>
          {abyss && (
            <li>
              <GameIcon id="act-horror" size={26} /> <T k="monsters.track.horror" />
            </li>
          )}
        </ul>
        <p className="muted small">
          <T k="monsters.mythos.brig" />
        </p>
      </Collapsible>

      {abyss && (
        <Collapsible title={t("monsters.repel")}>
          <ul>{numbered("monsters.repel.rule", 4)}</ul>
        </Collapsible>
      )}
    </div>
  );
}
