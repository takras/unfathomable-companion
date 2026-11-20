import { StrictMode } from "react";
import { Capacitor } from "@capacitor/core";
import { createRoot } from "react-dom/client";
// Free stand-ins for the rulebook's fonts: Federant for Halbfette Secession (headings),
// EB Garamond for Arno Pro (text).
import "@fontsource/federant/400.css";
import "@fontsource/eb-garamond/400.css";
import "@fontsource/eb-garamond/400-italic.css";
import "@fontsource/eb-garamond/600.css";
import { App } from "./App";
import { initialLanguage, setLanguage } from "./i18n";
import { loadRaw } from "./state/persist";
import { STORAGE_KEY, StoreProvider } from "./state/store";
import { applyTheme, initialTheme } from "./state/theme";
import "./styles.css";

// Native app (not a mobile browser): lets CSS and components adapt, e.g. the About page's version.
if (Capacitor.isNativePlatform()) document.documentElement.dataset.native = "";
applyTheme(initialTheme());
setLanguage(initialLanguage());

// The saved game is read asynchronously (native storage on iOS/Android) before the first render.
loadRaw(STORAGE_KEY).then((raw) => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <StoreProvider initialRaw={raw}>
        <App />
      </StoreProvider>
    </StrictMode>,
  );
});
