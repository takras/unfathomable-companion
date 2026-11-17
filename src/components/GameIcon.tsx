// Game icons are alpha masks (scripts/extract_icons.py), painted in the current text colour.
const files = import.meta.glob<string>("../assets/icons/*.png", { eager: true, import: "default" });

export type GameIconId =
  | "act-deep-ones"
  | "act-father-dagon"
  | "act-mother-hydra"
  | "act-shoggoth"
  | "act-drowned-spirit"
  | "act-grasping-tendril"
  | "act-horror"
  | "track-travel"
  | "track-ritual"
  | "track-choice";

export function GameIcon({ id, label, size = 32 }: { id: GameIconId; label?: string; size?: number }) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  if (id === "track-choice") {
    // Its box outline touches the icon on every card scan, so it is drawn here instead.
    return (
      <svg className="game-icon" width={size} height={size} viewBox="0 0 100 100" fill="currentColor" {...a11y}>
        <circle cx="32" cy="50" r="20" />
        <path d="M44 34 C52 22 62 20 74 20 V8 L96 26 L74 44 V32 C64 32 58 34 54 40 Z" />
        <path d="M44 66 C52 78 62 80 74 80 V92 L96 74 L74 56 V68 C64 68 58 66 54 60 Z" />
      </svg>
    );
  }
  const url = `url("${files[`../assets/icons/${id}.png`]}")`;
  return (
    <span
      className="game-icon"
      style={{ width: size, height: size, maskImage: url, WebkitMaskImage: url }}
      {...a11y}
    />
  );
}
