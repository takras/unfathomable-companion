import { GameIcon } from "./GameIcon";

/** Dock icons: line drawings for setup/roles/dice, the Deep One activation icon for monsters. */
export function NavIcon({ name }: { name: string }) {
  if (name === "monsters") return <GameIcon id="act-deep-ones" size={24} />;
  const common = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (name) {
    case "setup":
      // a hand of cards
      return (
        <svg {...common}>
          <rect x="3" y="6" width="10" height="14" rx="1.5" transform="rotate(-8 8 13)" />
          <rect x="10" y="4" width="10" height="14" rx="1.5" transform="rotate(8 15 11)" />
        </svg>
      );
    case "roles":
      // captain's cap
      return (
        <svg {...common}>
          <path d="M3 13c0-4 4-7 9-7s9 3 9 7H3z" />
          <path d="M4 13l1.5 4h13L20 13" />
          <circle cx="12" cy="9.5" r="1.2" />
        </svg>
      );
    case "dice":
      // eight-sided die
      return (
        <svg {...common}>
          <path d="M12 2l9 10-9 10-9-10z" />
          <path d="M3 12h18M12 2l-4 10 4 10M12 2l4 10-4 10" />
        </svg>
      );
    case "rules":
      // open book
      return (
        <svg {...common}>
          <path d="M12 6c-2-1.5-5-2-8.5-1.5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5v-13C17 4 14 4.5 12 6z" />
          <path d="M12 6v13" />
        </svg>
      );
    default:
      return null;
  }
}
