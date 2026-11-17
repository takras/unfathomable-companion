import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { characterById } from "../data/characters";
import { activationById, type ActivationId } from "../data/monsters";
import { TITLE_LABEL, TITLES, type TitleId } from "../data/succession";
import { t as tr } from "../i18n";
import { initialTitles, nextHolder } from "../logic/succession";
import { saveRaw } from "./persist";

export interface Player {
  /** Stable id; the app does not track seating */
  seat: number;
  characterId: string;
  /** Revealed traitor. Until then a player is a human, whatever their loyalty cards say (25.6). */
  revealed: boolean;
  /** In the Brig (humans and revealed traitors can both be there) */
  brig: boolean;
}

const fresh = (p: Player): Player => ({ ...p, revealed: false, brig: false });

export interface Config {
  /** From the Abyss expansion */
  abyss: boolean;
  /** Appendix I: no Cultist card in 4- and 6-player games */
  noCultist: boolean;
  /** From the Abyss: resolve a day, twilight and night prelude card during setup */
  preludes: boolean;
}

export interface State {
  version: 1;
  config: Config;
  /** Players in the order their characters were picked */
  players: Player[];
  phase: "setup" | "playing";
  titles: Partial<Record<TitleId, number>>; // seat of the holder
  /** The awakening phase (second loyalty deal) has happened */
  awakened: boolean;
  /** Activation icons picked on the Monsters page, in the order they resolve */
  activations: ActivationId[];
  log: string[];
}

export const defaultConfig: Config = { abyss: false, noCultist: false, preludes: false };

const initialState: State = {
  version: 1,
  config: defaultConfig,
  players: [],
  phase: "setup",
  titles: {},
  awakened: false,
  activations: [],
  log: [],
};

export type Action =
  | { type: "config"; patch: Partial<Config> }
  | { type: "addCharacter"; id: string }
  | { type: "removeSeat"; seat: number }
  | { type: "startGame" }
  | { type: "backToSetup" }
  | { type: "setBrig"; seat: number; brig: boolean }
  | { type: "reveal"; seat: number }
  | { type: "giveTitle"; title: TitleId; seat: number }
  | { type: "setAwakened"; value: boolean }
  | { type: "setActivations"; ids: ActivationId[] }
  | { type: "reset" };

export const STORAGE_KEY = "unf-companion-state-v1";

function parse(raw: string | null): State {
  if (!raw) return initialState;
  try {
    const parsed = JSON.parse(raw) as State;
    if (parsed.version !== 1) return initialState;
    // Drop players whose character no longer exists (e.g. a renamed id) rather than crashing on them.
    const players = (parsed.players ?? []).filter((p) => characterById[p.characterId]);
    return { ...initialState, ...parsed, players, config: { ...defaultConfig, ...parsed.config } };
  } catch {
    return initialState;
  }
}

/** Expansion-only options switch off with the expansion; expansion characters leave with it. */
function normalize(config: Config): Config {
  return config.abyss ? config : { ...config, preludes: false };
}

const nameOf = (s: State, seat: number | undefined) =>
  characterById[s.players.find((p) => p.seat === seat)?.characterId ?? ""]?.short ?? "-";

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "config": {
      const config = normalize({ ...s.config, ...a.patch });
      const players = config.abyss ? s.players : s.players.filter((p) => characterById[p.characterId].box === "core");
      const activations = config.abyss ? s.activations : s.activations.filter((id) => activationById[id].box === "core");
      return { ...s, config, players, activations };
    }
    case "addCharacter": {
      if (s.players.some((p) => p.characterId === a.id)) return s;
      const seat = s.players.reduce((m, p) => Math.max(m, p.seat), -1) + 1;
      return { ...s, players: [...s.players, { seat, characterId: a.id, revealed: false, brig: false }] };
    }
    case "removeSeat":
      return { ...s, players: s.players.filter((p) => p.seat !== a.seat) };
    case "startGame": {
      const titles = initialTitles(s.players);
      const log = TITLES.filter((t) => titles[t] !== undefined).map((t) =>
        tr("log.titleStart", { title: TITLE_LABEL[t], name: nameOf(s, titles[t]) }),
      );
      return { ...s, phase: "playing", titles, awakened: false, log };
    }
    case "backToSetup":
      return {
        ...s,
        phase: "setup",
        titles: {},
        awakened: false,
        log: [],
        players: s.players.map(fresh),
      };
    case "setBrig":
    case "reveal": {
      const before = s.players.find((p) => p.seat === a.seat);
      if (!before) return s;
      const after = a.type === "reveal" ? { ...before, revealed: true } : { ...before, brig: a.brig };
      if (after.revealed === before.revealed && after.brig === before.brig) return s;
      const players = s.players.map((p) => (p.seat === a.seat ? after : p));
      const event =
        a.type === "reveal"
          ? tr("log.reveal", { name: nameOf(s, a.seat) })
          : tr(a.brig ? "log.toBrig" : "log.fromBrig", { name: nameOf(s, a.seat) });
      const log = [...s.log, event];
      const titles = { ...s.titles };
      // Moving to the Brig or revealing loses all titles (49.3); leaving the Brig changes nothing.
      // A title nobody could hold (everyone revealed) is handed out as soon as someone can.
      const losesTitles = a.type === "reveal" || a.brig;
      for (const t of TITLES) {
        const loses = losesTitles && titles[t] === a.seat;
        if (!loses && titles[t] !== undefined) continue;
        const next = nextHolder(t, players);
        if (next === titles[t]) continue;
        if (next === undefined) delete titles[t];
        else titles[t] = next;
        log.push(tr("log.titleMoved", { title: TITLE_LABEL[t], from: nameOf(s, s.titles[t]), to: nameOf(s, next) }));
      }
      return { ...s, players, titles, log };
    }
    case "giveTitle":
      return {
        ...s,
        titles: { ...s.titles, [a.title]: a.seat },
        log: [...s.log, tr("log.titleGiven", { title: TITLE_LABEL[a.title], name: nameOf(s, a.seat) })],
      };
    case "setAwakened":
      return { ...s, awakened: a.value, log: a.value ? [...s.log, tr("log.awakening")] : s.log };
    case "setActivations":
      return { ...s, activations: a.ids };
    case "reset":
      // A new game, keeping the game settings.
      return { ...initialState, config: s.config };
  }
}

interface Ctx {
  state: State;
  dispatch: (a: Action) => void;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children, initialRaw }: { children: ReactNode; initialRaw: string | null }) {
  const [state, dispatch] = useReducer(reducer, initialRaw, parse);
  useEffect(() => saveRaw(STORAGE_KEY, JSON.stringify(state)), [state]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore outside StoreProvider");
  return ctx;
}
