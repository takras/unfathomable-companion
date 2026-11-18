import { succession, TITLES, type TitleId } from "../data/succession";
import type { Player } from "../state/store";

/** Players ranked by the line of succession for a title. */
export function ranked(title: TitleId, players: Player[]): Player[] {
  const order = succession[title];
  return players
    .filter((p) => order.includes(p.characterId))
    .sort((a, b) => order.indexOf(a.characterId) - order.indexOf(b.characterId));
}

/**
 * Who receives a title that has to be handed out (Rules Reference 49.2–49.4):
 * the highest in line who is a human not in the Brig. Revealed traitors never qualify.
 * If every human is in the Brig, the highest human in the Brig receives it.
 */
export function nextHolder(title: TitleId, players: Player[]): number | undefined {
  const humans = ranked(title, players).filter((p) => !p.revealed);
  return (humans.find((p) => !p.brig) ?? humans[0])?.seat;
}

/**
 * Who starts with each title (49.2). With the Delegate Authority prelude, each title goes to the
 * character next-highest in the line instead.
 */
export function initialTitles(players: Player[], delegate = false): Partial<Record<TitleId, number>> {
  const result: Partial<Record<TitleId, number>> = {};
  for (const t of TITLES) {
    const line = ranked(t, players);
    const seat = (delegate ? line[1] ?? line[0] : line[0])?.seat;
    if (seat !== undefined) result[t] = seat;
  }
  return result;
}
