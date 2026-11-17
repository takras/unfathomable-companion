import { Collapsible } from "../components/Collapsible";
import { GameIcon, type GameIconId } from "../components/GameIcon";
import type { Box } from "../data/characters";
import { T, t } from "../i18n";
import { useStore } from "../state/store";

/** One attack: who rolls against whom, the target number and any modifier to the roll. */
interface Attack {
  id: string;
  target: number;
  modifier?: number;
  box: Box;
  icon?: GameIconId;
}

// Rules Reference 6.5 (Deep One 4, character 6); From the Abyss: repel a horror on 6,
// Shoggoth and Grasping Tendril add 1 to their attack rolls.
const ATTACKS: Attack[] = [
  { id: "humanDeepOne", target: 4, box: "core", icon: "act-deep-ones" },
  { id: "humanTraitor", target: 6, box: "core" },
  { id: "traitorHuman", target: 6, box: "core" },
  { id: "deepOneHuman", target: 6, box: "core", icon: "act-deep-ones" },
  { id: "humanHorror", target: 6, box: "abyss", icon: "act-horror" },
  { id: "shoggothHuman", target: 6, modifier: 1, box: "abyss", icon: "act-shoggoth" },
  { id: "tendrilHuman", target: 6, modifier: 1, box: "abyss", icon: "act-grasping-tendril" },
];

const FACES = [1, 2, 3, 4, 5, 6, 7, 8];

/** The 8 die faces, the ones that succeed lit. A modifier shifts the result (clamped to 1–8). */
function DieStrip({ target, modifier = 0 }: { target: number; modifier?: number }) {
  const hits = FACES.filter((f) => Math.min(8, Math.max(1, f + modifier)) >= target);
  return (
    <div className="die-strip" aria-label={t("dice.hitsOn", { faces: hits.join(", ") })}>
      {FACES.map((f) => (
        <span key={f} className={`face ${hits.includes(f) ? "hit" : ""}`}>
          {f}
        </span>
      ))}
      <span className="chance">{Math.round((hits.length / 8) * 100)}%</span>
    </div>
  );
}

const ROLLS = ["deep", "risk", "shoggoth", "spirit", "tendril", "wander", "allies"];
const ABYSS_ROLLS = new Set(["shoggoth", "spirit", "tendril", "wander", "allies"]);

export function DiceView() {
  const { state } = useStore();
  const abyss = state.config.abyss;

  return (
    <div className="view dice">
      <p className="muted">{t("dice.intro")}</p>

      {ATTACKS.filter((a) => abyss || a.box === "core").map((a) => {
        const need = a.target - (a.modifier ?? 0);
        return (
          <section key={a.id} className="card attack">
            <div className="attack-head">
              {a.icon && <GameIcon id={a.icon} size={34} />}
              <div>
                <h2>{t(`dice.${a.id}`)}</h2>
                <div className="muted small">
                  {a.modifier
                    ? t("dice.targetModified", { target: a.target, modifier: a.modifier, need })
                    : t("dice.target", { target: a.target })}
                </div>
              </div>
            </div>
            <DieStrip target={a.target} modifier={a.modifier} />
            <p className="outcome">
              <T k={`dice.${a.id}.outcome`} />
            </p>
          </section>
        );
      })}

      <p className="muted small">
        <T k={abyss ? "dice.cannotAttackAbyss" : "dice.cannotAttack"} />
      </p>

      <Collapsible title={t("dice.steps")}>
        <ol>
          {Array.from({ length: 7 }, (_, i) => (
            <li key={i}>
              <T k={`dice.steps.step${i + 1}`} />
            </li>
          ))}
        </ol>
        <ul>
          <li>{t("dice.rules.clamp")}</li>
          <li>{t("dice.rules.reroll")}</li>
          <li>{t("dice.rules.once")}</li>
        </ul>
      </Collapsible>

      <Collapsible title={t("dice.other")}>
        <ul className="kv">
          {ROLLS.filter((r) => abyss || !ABYSS_ROLLS.has(r)).map((r) => (
            <li key={r}>
              <span className="k">{t(`dice.other.${r}`)}</span>
              <span className="v">{t(`dice.other.${r}.result`)}</span>
            </li>
          ))}
        </ul>
      </Collapsible>
    </div>
  );
}
