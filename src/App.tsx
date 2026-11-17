import { Fragment, useEffect, useState } from "react";
import { NavIcon } from "./components/NavIcon";
import { getLanguage, t } from "./i18n";
import { useStore } from "./state/store";
import { useTheme } from "./state/theme";
import { DiceView } from "./views/DiceView";
import { MonstersView } from "./views/MonstersView";
import { RolesView } from "./views/RolesView";
import { SetupView } from "./views/SetupView";

// Same layout as BSG Companion; Monsters takes the place BSG gives to Execution.
const DOCK = ["setup", "roles", "dice", "monsters"] as const;

const readHash = () => window.location.hash.replace(/^#\/?/, "") || "setup";

export function App() {
  const { state, dispatch } = useStore();
  const [theme, toggleTheme] = useTheme();
  const [route, setRoute] = useState(readHash);

  useEffect(() => {
    const onHash = () => {
      setRoute(readHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (r: string) => {
    window.location.hash = `/${r}`;
  };

  const current = (DOCK as readonly string[]).includes(route) ? route : "setup";
  const { config, players, phase } = state;

  return (
    <Fragment key={getLanguage()}>
      <div className="app">
        <header className="top">
          <div className="top-bar">
            <div className="brand">
              <h1>{t("app.short")}</h1>
              <div className="status small">
                {[t("app.box.core"), config.abyss && t("app.box.abyss")].filter(Boolean).join(" + ")}
                {players.length > 0 && ` · ${t("app.players", { n: players.length })}`} ·{" "}
                <span className={phase === "playing" ? "ok" : ""}>{t(phase === "playing" ? "app.status.playing" : "app.status.setup")}</span>
              </div>
            </div>
            <button className="top-btn" onClick={toggleTheme} aria-label={t("app.theme.aria", { theme: t(`app.theme.${theme}`) })}>
              {t(`app.theme.${theme}`)}
            </button>
            <button
              className="top-btn danger"
              onClick={() => {
                if (confirm(t("app.reset.confirm"))) {
                  dispatch({ type: "reset" });
                  go("setup");
                }
              }}
            >
              {t("app.reset")}
            </button>
          </div>
          <nav className="dock" aria-label={t("app.nav.aria")}>
            {DOCK.map((id) => (
              <a key={id} href={`#/${id}`} className={current === id ? "active" : ""} aria-current={current === id ? "page" : undefined}>
                <NavIcon name={id} />
                <span>{t(`app.nav.${id}`)}</span>
              </a>
            ))}
          </nav>
        </header>

        <main>
          {current === "setup" && <SetupView go={go} />}
          {current === "roles" && <RolesView go={go} />}
          {current === "dice" && <DiceView />}
          {current === "monsters" && <MonstersView />}
        </main>

        <footer className="footer small muted">
          {t("app.footer", { version: __APP_VERSION__ })}
        </footer>
      </div>
    </Fragment>
  );
}
