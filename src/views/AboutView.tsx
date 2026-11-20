import { useEffect, useState } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { T, t } from "../i18n";

interface Credit {
  name: string;
  detail: string;
  license?: string;
  url?: string;
}

const credits = (): Record<string, Credit[]> => ({
  game: [
    { name: "Unfathomable", detail: t("about.credit.core") },
    { name: "Unfathomable: From the Abyss", detail: t("about.credit.abyss") },
  ],
  fonts: [
    { name: "Federant", detail: t("about.credit.federant"), license: "OFL-1.1", url: "https://fonts.google.com/specimen/Federant" },
    { name: "EB Garamond", detail: t("about.credit.garamond"), license: "OFL-1.1", url: "https://fonts.google.com/specimen/EB+Garamond" },
    { name: "Fontsource", detail: t("about.credit.fontsource"), license: "MIT", url: "https://fontsource.org" },
  ],
  software: [
    { name: "React", detail: t("about.credit.react"), license: "MIT", url: "https://react.dev" },
    { name: "Capacitor", detail: t("about.credit.capacitor"), license: "MIT", url: "https://capacitorjs.com" },
    { name: "Vite", detail: t("about.credit.vite"), license: "MIT", url: "https://vite.dev" },
    { name: "TypeScript", detail: t("about.credit.typescript"), license: "Apache-2.0", url: "https://www.typescriptlang.org" },
  ],
});

function CreditList({ items }: { items: Credit[] }) {
  return (
    <ul className="credits">
      {items.map((c) => (
        <li key={c.name}>
          <span className="credit-name">
            {c.url ? (
              <a href={c.url} target="_blank" rel="noopener noreferrer">
                {c.name}
              </a>
            ) : (
              c.name
            )}
          </span>
          {c.license && <span className="badge">{c.license}</span>}
          <span className="credit-detail">{c.detail}</span>
        </li>
      ))}
    </ul>
  );
}

/** Full licence texts, generated into third-party-licenses.txt at build time (licenses-plugin.ts). */
function LicenceTexts() {
  const [text, setText] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const load = async () => {
    setStatus("loading");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}third-party-licenses.txt`);
      // A missing file can come back as index.html from a static host's fallback, so check the type too.
      if (!res.ok || !res.headers.get("content-type")?.startsWith("text/plain")) throw new Error(String(res.status));
      setText(await res.text());
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };
  if (text) return <pre className="licence-texts">{text}</pre>;
  return (
    <p>
      <button className="secondary" onClick={load} disabled={status === "loading"}>
        {t(status === "loading" ? "about.licences.loading" : "about.licences.show")}
      </button>
      {status === "error" && <span className="warn small"> {t("about.licences.error")}</span>}
    </p>
  );
}

/**
 * The version the user is running: on the web, the package.json version baked in at build time; in the
 * native apps, read from the installed app (Android versionName/versionCode, iOS version/build).
 */
function AppVersion() {
  const [info, setInfo] = useState<{ version: string; build?: string }>({ version: __APP_VERSION__ });
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    App.getInfo()
      .then(({ version, build }) => setInfo({ version, build }))
      .catch(() => {});
  }, []);
  return (
    <p className="muted small center">
      {info.build ? t("about.versionBuild", { version: info.version, build: info.build }) : t("about.version", { version: info.version })}
    </p>
  );
}

export function AboutView() {
  const c = credits();
  return (
    <div className="view about">
      <section className="card disclaimer">
        <h2>{t("about.disclaimer.title")}</h2>
        <p>
          <T k="about.disclaimer" />
        </p>
        <p>
          <T k="about.art" />
        </p>
        <p className="muted small">{t("about.takedown")}</p>
      </section>

      <section className="card">
        <h2>{t("about.game")}</h2>
        <CreditList items={c.game} />
        <h3 className="sub-h">{t("about.material")}</h3>
        <ul>
          <li>{t("about.material.rules")}</li>
          <li>{t("about.material.art")}</li>
          <li>{t("about.material.names")}</li>
        </ul>
      </section>

      <section className="card">
        <h2>{t("about.licence")}</h2>
        <p>
          <T k="about.licence.text" />
        </p>
        <p className="muted small">{t("about.privacy")}</p>
      </section>

      <section className="card">
        <h2>{t("about.fonts")}</h2>
        <CreditList items={c.fonts} />
        <h2 className="spaced">{t("about.software")}</h2>
        <CreditList items={c.software} />
        <h3 className="sub-h">{t("about.licences")}</h3>
        <p className="muted small">{t("about.licences.note")}</p>
        <LicenceTexts />
      </section>

      <AppVersion />
    </div>
  );
}
