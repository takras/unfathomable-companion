import { PreludeSetup } from "../components/PreludeSetup";
import { Portrait } from "../components/Portrait";
import { Toggle } from "../components/Toggle";
import { characterById, characters, type Box } from "../data/characters";
import { TITLE_LABEL, TITLES } from "../data/succession";
import { T, t, tp } from "../i18n";
import { computeLoyalty, MAX_PLAYERS, MIN_PLAYERS, type LoyaltyKind } from "../logic/loyalty";
import { initialTitles } from "../logic/succession";
import { delegated, useStore, type Config } from "../state/store";

const KINDS: LoyaltyKind[] = ["hybrid", "cultist", "human"];
const DIALS = ["fuel", "food", "sanity", "souls"] as const;

export function SetupView({ go }: { go: (tab: string) => void }) {
  const { state, dispatch } = useStore();
  const { config, players, phase } = state;
  const locked = phase === "playing";
  const set = (patch: Partial<Config>) => dispatch({ type: "config", patch });

  const n = players.length;
  const loyalty = computeLoyalty(config, n);
  // With the Delegate Authority prelude drawn, each title starts with the second in line.
  const delegate = delegated(state);
  const titles = initialTitles(players, delegate);
  const full = n >= MAX_PLAYERS;
  const canStart = loyalty.valid;

  const toggleChar = (id: string) => {
    const p = players.find((x) => x.characterId === id);
    if (p) dispatch({ type: "removeSeat", seat: p.seat });
    else if (!full) dispatch({ type: "addCharacter", id });
  };

  const boxes: Box[] = config.abyss ? ["core", "abyss"] : ["core"];

  return (
    <div className="view setup">
      {locked && (
        <div className="callout">
          <T
            k="setup.locked"
            slots={{
              roles: (
                <button className="link" onClick={() => go("roles")}>
                  {t("setup.locked.goToRoles")}
                </button>
              ),
              unlock: (
                <button
                  className="link"
                  onClick={() => {
                    if (confirm(t("setup.locked.unlockConfirm"))) dispatch({ type: "backToSetup" });
                  }}
                >
                  {t("setup.locked.unlock")}
                </button>
              ),
            }}
          />
        </div>
      )}

      <section className="card">
        <h2>{t("setup.game")}</h2>
        <Toggle label={t("setup.abyss")} hint={t("setup.abyss.hint")} checked={config.abyss} disabled={locked} onChange={(v) => set({ abyss: v })} />
        <Toggle
          label={t("setup.noCultist")}
          hint={t("setup.noCultist.hint")}
          checked={config.noCultist}
          disabled={locked}
          onChange={(v) => set({ noCultist: v })}
        />
        {config.abyss && (
          <Toggle label={t("setup.preludes")} hint={t("setup.preludes.hint")} checked={config.preludes} disabled={locked} onChange={(v) => set({ preludes: v })} />
        )}
      </section>

      {/* right under the switch that turns it on, so it is easy to find */}
      {config.abyss && config.preludes && <PreludeSetup locked={locked} />}

      <section className="card">
        <h2>
          {t("setup.characters")} <span className="count">{t("setup.characters.count", { n, max: MAX_PLAYERS })}</span>
        </h2>
        <p className="muted small">{t("setup.characters.hint", { min: MIN_PLAYERS, max: MAX_PLAYERS })}</p>
        {boxes.map((box) => (
          <div key={box}>
            {config.abyss && <h3 className="box-heading">{t(`box.${box}`)}</h3>}
            <div className="char-grid">
              {characters
                .filter((ch) => ch.box === box)
                .map((ch) => {
                  const picked = players.some((p) => p.characterId === ch.id);
                  return (
                    <button
                      key={ch.id}
                      className={`char-tile ${picked ? "picked" : ""}`}
                      aria-pressed={picked}
                      disabled={locked || (!picked && full)}
                      onClick={() => toggleChar(ch.id)}
                    >
                      <Portrait id={ch.id} size={84} dim={!picked && full} />
                      {picked && (
                        <span className="pick-no" aria-hidden>
                          ✓
                        </span>
                      )}
                      <span className="char-name">{ch.name}</span>
                      <span className="char-epithet">{ch.epithet}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </section>

      {loyalty.valid ? (
        <>
          <section className="card">
            <h2>{t("setup.loyalty")}</h2>
            <ul className="deck">
              {KINDS.filter((k) => loyalty.deck[k] > 0).map((k) => (
                <li key={k} className={`loyalty ${k}`}>
                  <span className="qty">{loyalty.deck[k]}</span>
                  <span>{tp(`loyalty.${k}`, loyalty.deck[k])}</span>
                </li>
              ))}
            </ul>
            <p>
              <T k="setup.loyalty.deal" vars={{ size: loyalty.deckSize, players: n }} />
            </p>
            {loyalty.cultistInPlay && (
              <p className="muted small">
                <T k="setup.loyalty.cultist" />
              </p>
            )}
            {config.noCultist && !loyalty.cultistInPlay && (n === 4 || n === 6) && (
              <p className="muted small">{t("setup.loyalty.noCultist")}</p>
            )}
          </section>

          <section className="card">
            <h2>{t("setup.start")}</h2>
            <ul className="kv">
              {TITLES.map((title) => (
                <li key={title}>
                  <span className="k">{TITLE_LABEL[title]}</span>
                  <span className="v with-portrait">
                    {titles[title] !== undefined && (
                      <>
                        <Portrait id={players.find((p) => p.seat === titles[title])!.characterId} size={22} />
                        {characterById[players.find((p) => p.seat === titles[title])!.characterId].name}
                        <span className="muted small"> · {t(`setup.start.${title}Deck`)}</span>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {delegate && <p className="muted small">{t("setup.start.delegate")}</p>}
            <div className="dials">
              {DIALS.map((d) => (
                <div key={d} className="dial">
                  <span className="dial-value">{loyalty.dials[d]}</span>
                  <span className="dial-label">{t(`resource.${d}`)}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <p className="callout muted">{t("setup.needPlayers", { min: MIN_PLAYERS, max: MAX_PLAYERS })}</p>
      )}

      {!locked && (
        <button
          className="primary wide"
          disabled={!canStart}
          onClick={() => {
            dispatch({ type: "startGame" });
            go("roles");
          }}
        >
          {t("setup.startGame")}
        </button>
      )}
    </div>
  );
}
