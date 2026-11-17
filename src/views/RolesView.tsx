import { Collapsible } from "../components/Collapsible";
import { Portrait } from "../components/Portrait";
import { characterById } from "../data/characters";
import { TITLE_LABEL, TITLES, type TitleId } from "../data/succession";
import { T, t } from "../i18n";
import { ranked } from "../logic/succession";
import { useStore, type Player } from "../state/store";

/** Number of steps in a numbered procedure in en.json (<prefix>.step1…N) */
const Steps = ({ k, count }: { k: string; count: number }) => (
  <ol>
    {Array.from({ length: count }, (_, i) => (
      <li key={i}>
        <T k={`${k}.step${i + 1}`} />
      </li>
    ))}
  </ol>
);

export function RolesView({ go }: { go: (tab: string) => void }) {
  const { state, dispatch } = useStore();
  const { players, titles, phase } = state;

  if (phase !== "playing") {
    return (
      <div className="view">
        <p className="callout">
          <T
            k="roles.notStarted"
            slots={{
              setup: (
                <button className="link" onClick={() => go("setup")}>
                  {t("roles.notStarted.link")}
                </button>
              ),
            }}
          />
        </p>
      </div>
    );
  }

  const holderOf = (title: TitleId) => players.find((p) => p.seat === titles[title]);
  const titlesOf = (p: Player) => TITLES.filter((tt) => titles[tt] === p.seat);

  return (
    <div className="view roles">
      <div className="title-cards">
        {TITLES.map((title) => {
          const holder = holderOf(title);
          const eligible = ranked(title, players).filter((p) => !p.revealed);
          return (
            <section key={title} className={`card title-card ${title}`}>
              <h2>{TITLE_LABEL[title]}</h2>
              {holder ? (
                <div className="holder">
                  <Portrait id={holder.characterId} size={64} />
                  <div>
                    <div className="holder-name">{characterById[holder.characterId].name}</div>
                    <div className="muted small">{characterById[holder.characterId].epithet}</div>
                    {holder.brig && <div className="badge brig">{t("status.brig")}</div>}
                  </div>
                </div>
              ) : (
                <p className="muted">{t("roles.nobody")}</p>
              )}
              <label className="give">
                <span className="muted small">{t("roles.give")}</span>
                <select
                  value={holder?.seat ?? ""}
                  onChange={(e) => dispatch({ type: "giveTitle", title, seat: Number(e.target.value) })}
                >
                  {!holder && <option value="">-</option>}
                  {eligible.map((p) => (
                    <option key={p.seat} value={p.seat}>
                      {characterById[p.characterId].short}
                      {p.brig ? ` (${t("status.brig")})` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <p className="muted small line">
                {t("roles.line")}:{" "}
                {ranked(title, players)
                  .map((p) => characterById[p.characterId].short + (p.revealed ? " ✕" : p.brig ? ` (${t("status.brig")})` : ""))
                  .join(" › ")}
              </p>
            </section>
          );
        })}
      </div>

      <section className="card">
        <h2>{t("roles.players")}</h2>
        <ul className="player-list">
          {players.map((p) => {
            const ch = characterById[p.characterId];
            const held = titlesOf(p);
            return (
              <li key={p.seat} className={`player ${p.revealed ? "revealed" : ""} ${p.brig ? "in-brig" : ""}`}>
                <Portrait id={p.characterId} size={44} />
                <div className="player-main">
                  <div className="player-name">
                    {ch.name}
                    {p.revealed && <span className="badge traitor">{t("status.traitor")}</span>}
                    {held.map((tt) => (
                      <span key={tt} className={`badge title ${tt}`}>
                        {TITLE_LABEL[tt]}
                      </span>
                    ))}
                  </div>
                  <div className="player-controls">
                    <div className="segmented" role="radiogroup" aria-label={t("roles.whereIs", { name: ch.short })}>
                      {[false, true].map((brig) => (
                        <button
                          key={String(brig)}
                          role="radio"
                          aria-checked={p.brig === brig}
                          className={p.brig === brig ? "on" : ""}
                          onClick={() => dispatch({ type: "setBrig", seat: p.seat, brig })}
                        >
                          {t(brig ? "status.brig" : "status.free")}
                        </button>
                      ))}
                    </div>
                    {!p.revealed && (
                      <button
                        className="reveal-btn"
                        onClick={() => {
                          if (confirm(t("roles.revealConfirm", { name: ch.short }))) dispatch({ type: "reveal", seat: p.seat });
                        }}
                      >
                        {t("roles.revealButton")}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="muted small">{t("roles.statusHint")}</p>
      </section>

      <section className="card">
        <h2>{t("roles.awakening")}</h2>
        {state.awakened ? (
          <p>
            {t("roles.awakening.done")}{" "}
            <button className="link" onClick={() => dispatch({ type: "setAwakened", value: false })}>
              {t("roles.awakening.undo")}
            </button>
          </p>
        ) : (
          <>
            <p>
              <T k="roles.awakening.when" />
            </p>
            <Steps k="roles.awakening" count={3} />
            <button className="secondary" onClick={() => dispatch({ type: "setAwakened", value: true })}>
              {t("roles.awakening.mark")}
            </button>
          </>
        )}
      </section>

      <Collapsible title={t("roles.reveal")}>
        <Steps k="roles.reveal" count={7} />
        <p className="muted small">
          <T k="roles.reveal.note" />
        </p>
      </Collapsible>

      <Collapsible title={t("roles.brig")}>
        <ul>
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i}>
              <T k={`roles.brig.rule${i + 1}`} />
            </li>
          ))}
        </ul>
      </Collapsible>

      {state.log.length > 0 && (
        <Collapsible title={t("roles.log")}>
          <ol className="log">
            {state.log.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </Collapsible>
      )}
    </div>
  );
}
