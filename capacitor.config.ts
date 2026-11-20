import type { CapacitorConfig } from "@capacitor/cli";

// Native apps (iOS/Android) wrapping the web build in dist/. Set up like BSG Companion.
const PAPER = "#e1e3ec"; // the app's lavender paper, behind the web view while it loads
const NIGHT = "#141a36"; // the icon's night sky, for the splash screen

const config: CapacitorConfig = {
  appId: "net.takras.unfathomable",
  appName: "Unfathomable Companion",
  webDir: "dist",
  backgroundColor: PAPER,
  ios: {
    contentInset: "never",
  },
  android: {
    backgroundColor: PAPER,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: NIGHT,
      showSpinner: false,
    },
    SystemBars: {
      // Edge-to-edge; Android also gets --safe-area-inset-* CSS variables (used in styles.css)
      insetsHandling: "css",
      initialViewportFitValueHint: "cover",
      // dark status bar icons on the light paper
      style: "LIGHT",
    },
  },
};

export default config;
