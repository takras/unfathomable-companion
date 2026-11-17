import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/cinzel/600.css";
import "@fontsource/cinzel/700.css";
import "@fontsource/crimson-pro/400.css";
import "@fontsource/crimson-pro/400-italic.css";
import "@fontsource/crimson-pro/600.css";
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
