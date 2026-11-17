import type { Config } from "../state/store";

export type LoyaltyKind = "hybrid" | "cultist" | "human";

export interface LoyaltySetup {
  valid: boolean;
  players: number;
  /** Cards in the loyalty deck, by kind */
  deck: Record<LoyaltyKind, number>;
  deckSize: number;
  /** The Cultist card is only used with 4 or 6 players */
  cultistInPlay: boolean;
  /** Starting value of each resource dial */
  dials: { fuel: number; food: number; sanity: number; souls: number };
}

// Hybrid / Cultist / Human cards per player count (Rules Reference, setup step 16;
// the From the Abyss table is the same).
const TABLE: Record<number, [number, number, number]> = {
  3: [1, 0, 5],
  4: [1, 1, 6],
  5: [2, 0, 8],
  6: [2, 1, 9],
};

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 6;

export function computeLoyalty(config: Config, players: number): LoyaltySetup {
  const row = TABLE[players];
  const [hybrid, cultist, human] = row ?? [0, 0, 0];
  // No-Cultist variant (Appendix I): a Human card replaces the Cultist, and the dials start lower.
  const dropCultist = config.noCultist && cultist > 0;
  const deck = {
    hybrid,
    cultist: dropCultist ? 0 : cultist,
    human: dropCultist ? human + cultist : human,
  };
  return {
    valid: !!row,
    players,
    deck,
    deckSize: deck.hybrid + deck.cultist + deck.human,
    cultistInPlay: deck.cultist > 0,
    dials: dropCultist ? { fuel: 7, food: 6, sanity: 6, souls: 7 } : { fuel: 8, food: 8, sanity: 8, souls: 8 },
  };
}
