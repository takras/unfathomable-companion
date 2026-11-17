// Activation icons and what they do (Rules Reference 4 and 28.21–28.24; From the Abyss "Horrors").
// The text for each lives in en.json under activation.<id>.*
import type { GameIconId } from "../components/GameIcon";
import type { Box } from "./characters";

export type ActivationId =
  | "deepOnes"
  | "fatherDagon"
  | "motherHydra"
  | "shoggoth"
  | "drownedSpirit"
  | "graspingTendril"
  | "horror";

export interface Activation {
  id: ActivationId;
  icon: GameIconId;
  box: Box;
  /** Number of prioritised options (activation.<id>.option1…N): the monster does the first it can */
  options: number;
  /** Plain steps done in order (activation.<id>.step1…N) */
  steps: number;
}

export const activations: Activation[] = [
  { id: "deepOnes", icon: "act-deep-ones", box: "core", options: 4, steps: 0 },
  { id: "fatherDagon", icon: "act-father-dagon", box: "core", options: 0, steps: 2 },
  { id: "motherHydra", icon: "act-mother-hydra", box: "core", options: 0, steps: 2 },
  { id: "shoggoth", icon: "act-shoggoth", box: "abyss", options: 4, steps: 0 },
  { id: "drownedSpirit", icon: "act-drowned-spirit", box: "abyss", options: 2, steps: 0 },
  { id: "graspingTendril", icon: "act-grasping-tendril", box: "abyss", options: 3, steps: 0 },
  { id: "horror", icon: "act-horror", box: "abyss", options: 0, steps: 0 },
];

export const activationById = Object.fromEntries(activations.map((a) => [a.id, a])) as Record<ActivationId, Activation>;
