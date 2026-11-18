import { StrictMode } from "react";
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

applyTheme(initialTheme());
setLanguage(initialLanguage());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider initialRaw={loadRaw(STORAGE_KEY)}>
      <App />
    </StoreProvider>
  </StrictMode>,
);
