import { Fragment, lazy, Suspense, useEffect, useState } from "react";
import { NavIcon } from "./components/NavIcon";
import { getLanguage, t } from "./i18n";
import { useStore } from "./state/store";
import { useTheme } from "./state/theme";
import { AboutView } from "./views/AboutView";
import { DiceView } from "./views/DiceView";
import { MonstersView } from "./views/MonstersView";
import { RolesView } from "./views/RolesView";
import { SetupView } from "./views/SetupView";

// The rules text is ~115 KB; load it only when the Rules tab is opened.
const RulesView = lazy(() => import("./views/RulesView").then((m) => ({ default: m.RulesView })));

// Same layout as BSG Companion; Monsters takes the place BSG gives to Execution.
const DOCK = ["setup", "roles", "dice", "monsters", "rules"] as const;

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

  // Sticky things below the header (the rules search, jump targets) need its height, and things near the bottom
  // (the page's end, the Contents button) need the height of the tab bar when it is docked at the bottom of a
  // phone screen (0 when it sits in the header on wide screens). Both include the device's safe-area insets.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".top");
    const dock = document.querySelector<HTMLElement>(".dock");
    if (!header || !dock) return;
    const root = document.documentElement.style;
    const set = () => {
      root.setProperty("--header-h", `${header.offsetHeight}px`);
      root.setProperty("--dock-h", getComputedStyle(dock).position === "fixed" ? `${dock.offsetHeight}px` : "0px");
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(header);
    ro.observe(dock);
    window.addEventListener("resize", set);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", set);
    };
  }, []);

  const go = (r: string) => {
    window.location.hash = `/${r}`;
  };

  // "rules/4.13" = a page and a target on it
  const [tab, ...rest] = route.split("/");
  const param = rest.join("/") || undefined;
  // "about" is reached from the footer, not the dock
  const current = (DOCK as readonly string[]).includes(tab) || tab === "about" ? tab : "setup";
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
            <div className="top-actions">
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
          {current === "about" && <AboutView />}
          {current === "rules" && (
            <Suspense fallback={<p className="view muted">{t("rules.loading")}</p>}>
              <RulesView target={param} go={go} />
            </Suspense>
          )}
        </main>

        <footer className="footer small muted">
          {t("app.footer")} · <a href="#/about">{t("app.about")}</a> · v{__APP_VERSION__}
        </footer>
      </div>
    </Fragment>
  );
}
