// From the Abyss prelude cards, transcribed from the card scans; images cut by scripts/extract_preludes.py.
// Ability text uses the rules markup ({icon}, **bold**) and is shown with RuleText.

export type PreludeType = "day" | "twilight" | "night";

/** Resolution order during setup: all day cards, then twilight, then night. */
export const PRELUDE_TYPES: PreludeType[] = ["day", "twilight", "night"];

export interface Prelude {
  id: string;
  type: PreludeType;
  title: string;
  /** Story text, read aloud */
  flavor: string;
  /** What to do */
  text: string;
  /** Respite stays in play after setup */
  keep?: boolean;
  /** Delegate Authority changes who starts with the titles; the app applies it */
  delegate?: boolean;
  image: string;
}

const images = import.meta.glob<string>("../assets/preludes/*.webp", { eager: true, import: "default" });
const img = (id: string) => images[`../assets/preludes/${id}.webp`];

const card = (type: PreludeType, id: string, title: string, flavor: string, text: string, extra: Partial<Prelude> = {}): Prelude => ({
  id,
  type,
  title,
  flavor,
  text,
  image: img(id),
  ...extra,
});

const ROLL_TABLE = "1–2: Fuel · 3–4: Food · 5–6: Sanity · 7–8: Souls";

export const preludes: Prelude[] = [
  // Day: favor the humans
  card(
    "day",
    "favorable-conditions",
    "Favorable Conditions",
    "The sun beams across the sky and glitters off the passing waves. Gentle winds and favorable tides make the start of the journey fast and pleasant. The Atlantica makes good time on the water, and crew and passengers alike cheer their good fortune. It is no doubt an auspicious beginning to the voyage.",
    "Advance the travel track 2 spaces; this does not cause components in water spaces to move.",
  ),
  card(
    "day",
    "surplus",
    "Surplus",
    "Unexpected discoveries aboard the ship indicate that counts were missed as the vessel was loaded. Fortunately, it seems more made it into the Atlantica than was planned, and the extras should provide comfort and prove useful on the journey.",
    `Roll a die and find the result below. If the matching resource is at its starting value, gain 2 of that resource; otherwise, reroll the die until you gain resources this way.\n${ROLL_TABLE}`,
  ),
  card(
    "day",
    "respite",
    "Respite",
    "Despite setbacks, the crew of the Atlantica is determined to keep the ship on track. When difficulties arise, the crew is well-trained to handle them, and their resolve keeps the ship safe. But even this crew has their limits—should something truly disastrous occur, they may only be able to mitigate it for a short time.",
    "Place this card near the mythos deck.\nDuring the first Mythos step of the game, instead of drawing and resolving a mythos card, the current player resolves the following icon: {track-choice}\nThen remove this card from the game.",
    { keep: true },
  ),
  card(
    "day",
    "volunteer",
    "Volunteer",
    "Several travelers on the Atlantica are eager to provide help with minor tasks when the need arises. With their aid, jobs are completed quickly, and the journey is made more comfortable for all on board. Morale is up, and the ship seems prepared for whatever the future may hold.",
    "Spawn 1 ally in the current player’s space. Shuffle 4 boon cards into the chaos deck.",
  ),
  card(
    "day",
    "outpace",
    "Outpace",
    "The ocean glides by as the Atlantica’s engines power it toward its destination. A lookout spots a pod of dolphins off the port side. They provide fleeting amusement for the passengers but are quickly left behind. Other odd debris floats by and seems to be caught up in the ship’s wake. But nothing is visible for long as the ship steams ahead.",
    "Return 1 Deep One from each of the following spaces to the supply: Deck space 1, Deck space 2, Water space 1–4, Water space 5–8.",
  ),

  // Twilight: affect everyone
  card(
    "twilight",
    "valuable-lessons",
    "Valuable Lessons",
    "You spend your time on the Atlantica conversing with other passengers and crewmembers. They share their stories and life experience, and you develop a kinship with your fellow travelers. In the course of your discussions, they impart some wisdom that may prove helpful in the days to come.",
    "Each player takes 1 random unused feat card from the box and places it in their play area.",
  ),
  card(
    "twilight",
    "delegate-authority",
    "Delegate Authority",
    "As the ship encounters difficulties on the water and the atmosphere on board becomes tense, the weight of responsibility becomes too overwhelming to bear. Those in charge shed their responsibilities, leaving the less experienced to take up the mantle.",
    "Give each title to the character who is next-highest in the line of succession for that title.",
    { delegate: true },
  ),
  card(
    "twilight",
    "spreading-rumors",
    "Spreading Rumors",
    "Disquiet proliferates amongst the passengers and crew. Whispers of unsavory characters and secret danger are perpetuated, debated, and rebuffed in equal measure. There is a lingering sense of something unkown, which is speculated about but just out of reach.",
    "Shuffle 1 boon card and 1 treachery card into each of the following skill decks: Influence ({influence}), Lore ({lore}), Observation ({observation}), Strength ({strength}), Will ({will}).",
  ),
  card(
    "twilight",
    "preparation",
    "Preparation",
    "You have the unmistakable sense that something is coming. The feeling hangs at the periphery of your consciousness, always present but never in focus. It sets you on edge, and you become hyper-aware of your surroundings and the goings-on aboard the ship. You keep your wits about you, bracing for a moment that you are certain is soon to arrive.",
    "Each player draws 3 skill cards from their skill set.",
  ),
  card(
    "twilight",
    "cargo-raid",
    "Cargo Raid",
    "Access to the cargo hold is carefully controlled to protect the belongings of those aboard the ship. While the benefits may be worthwhile, the process is nonetheless frustrating to those passengers who demand immediate access to their things. As the annoyance boils over, a group of such passengers rush the hold, disregarding the regulations. The crew is eventually able to regain control of the situation, but some travelers come away with more than they brought on board.",
    "Each player draws 1 item card.",
  ),

  // Night: favor the hybrids
  card(
    "night",
    "boarding-party",
    "Boarding Party",
    "Over the rumble of the ship’s engine, the lapping of the waves against the hull, and the dull murmur of late night conversation, only a pair of muffled yelps and splashes herald the arrival of terrible creatures aboard the Atlantica.",
    "Spawn 1 Deep One in deck space 3 and 1 Deep One in deck space 4. Move each passenger in those spaces to its closest water space.",
  ),
  card(
    "night",
    "emergence",
    "Emergence",
    "Off the bow, a pair of hulking shapes erupt from the black water. Their massive frames soon dwarf the ship, the impossible silhouettes blocking out the stars in the sky. The eyes of the terrible creatures display an ancient and utterly alien consciousness. As they reach their wretched limbs toward the Atlantica, the stunned silence of the ship shatters into screams of terror.",
    "Move Father Dagon to water space 1–4. Move Mother Hydra to water space 5–8.",
  ),
  card(
    "night",
    "shortage",
    "Shortage",
    "It becomes clear that there is an issue with the ship’s manifest. Details are missing, counts are off, and soon the crew is tasked with taking stock. The conclusion they come to is grim—the Atlantica is not as prepared for its journey as one might have hoped.",
    `Roll a die and find the result below. If the matching resource is at its starting value, lose 2 of that resource; otherwise, reroll the die until you lose resources this way.\n${ROLL_TABLE}`,
  ),
  card(
    "night",
    "malfunctions",
    "Malfunctions",
    "A metallic ping echoes through the walls of the ship. There is a moment of silence, followed by a pressurized explosion. Steam begins hissing from twisted pipes throughout the ship. Some failure of the Atlantica’s construction threatens to plunge the ship beneath the waves.",
    "Damage the ship 2 times; this does not cause players to be defeated or allies to flee.",
  ),
  card(
    "night",
    "doom",
    "Doom",
    "A chill runs down your spine and the hairs on the back of your neck stand on end. A terrible, unknown sound rises from the deck, and you are overwhelmed with dread. Something is on the ship—something that ought not exist anywhere.",
    "Reveal cards from the top of the horror deck until you reveal a card that shows a horror. Spawn the matching horror in deck space 1. Shuffle the horror deck.",
  ),
];

export const preludeById: Record<string, Prelude> = Object.fromEntries(preludes.map((pr) => [pr.id, pr]));

export const MAX_PER_TYPE = 5;

export interface PreludeCounts {
  day: number;
  twilight: number;
  night: number;
}

/** The book's standard draw and its two balance adjustments (From the Abyss, "Modifying Balance"). */
export const PRELUDE_PRESETS: { id: string; counts: PreludeCounts }[] = [
  { id: "standard", counts: { day: 1, twilight: 1, night: 1 } },
  { id: "humans", counts: { day: 2, twilight: 1, night: 0 } },
  { id: "hybrids", counts: { day: 0, twilight: 1, night: 2 } },
];

/** Shuffle each type separately and draw the requested number, from the cards not left out. */
export function drawPreludes(counts: PreludeCounts, excluded: string[]): string[] {
  const out: string[] = [];
  for (const type of PRELUDE_TYPES) {
    const pool = preludes.filter((pr) => pr.type === type && !excluded.includes(pr.id)).map((pr) => pr.id);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    out.push(...pool.slice(0, counts[type]));
  }
  return out;
}
