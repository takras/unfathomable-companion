// From the Abyss: the expansion rulebook's chapters, and its changes to Rules Reference rules.
// Written out by hand from unf02_rules-web.pdf (its layout is too irregular to extract reliably);
// wording follows the book. Story text, component lists, credits and the quick-reference page
// (which repeats the chapters) are left out.
import type { Block, Patch, Topic } from "./rules";

const p = (text: string): Block => ({ type: "p", text });
const h = (text: string): Block => ({ type: "h", text });
const h3 = (text: string): Block => ({ type: "h3", text });
const b = (text: string): Block => ({ type: "bullet", text });
const sub = (text: string): Block => ({ type: "sub", text });
const step = (num: string, text: string): Block => ({ type: "step", num, text });
const ex = (title: string, text: string): Block => ({ type: "example", text: `[[${title}]] *${text}*` });

const topic = (slug: string, title: string, blocks: Block[], related: string[] = []): Topic => ({
  id: `topic-abyss-${slug}`,
  num: "",
  title,
  blocks,
  related,
  part: "abyss",
});

const L = {
  horrors: "<<Horrors|topic-abyss-horrors>>",
  repelling: "<<Repelling Horrors|abyss-repelling>>",
  allies: "<<Allies|topic-abyss-allies>>",
  spawn: "<<Spawn|topic-abyss-spawn>>",
  skill: "<<Skill Cards|topic-abyss-skill-cards>>",
  personal: "<<Personal Crisis Cards|topic-abyss-personal-crisis-cards>>",
  passengers: "<<Passengers|topic-abyss-passengers>>",
};

export const abyssTopics: Topic[] = [
  topic("components", "Expansion Components", [
    p("All cards and sheets in this expansion have the *From the Abyss* icon to distinguish them from components in the *Unfathomable* base game."),
    p("Before setting up a game using this expansion, make the following changes to the *Unfathomable* base game components:"),
    h("Add"),
    p("Add the following cards to the existing decks:"),
    b("12 Skill Cards (2 Influence, 2 Lore, 2 Observation, 2 Strength, 2 Will, 2 Treachery)"),
    b("10 Item Cards"),
    b("2 Ship Damage Cards"),
    b("10 Waypoint Cards"),
    b("10 Spell Cards"),
    b("72 Mythos Cards"),
    h("Remove"),
    p("Remove all character-specific mythos cards from the mythos deck and set them aside. (They are still used in the game; see “10. Create Play Areas” in <<Setup|topic-abyss-setup>>.)"),
    h("Replace"),
    p("Replace the following components with their updated versions:"),
    b("1 Captain Title Card"),
    b("1 Keeper of the Tome Title Card"),
    b("1 Jam Tin Grenade Item Card"),
    b("6 Player Reference Sheets"),
    b("3 Traitor Reference Sheets"),
    p("This expansion includes optional prelude cards that modify setup; see <<Preludes|topic-abyss-preludes>>."),
  ]),

  topic("setup", "Setup", [
    p("When using this expansion, add the following instructions to the setup steps of the Rules Reference:"),
    h("Create Horror Deck (New Step)"),
    p("After step [[4. Create Supply]], place the three horror figures in the supply. Shuffle the four horror cards and place them facedown on the top-left corner of the board to create the horror deck. Place the horror token on the Start space of the horror track (printed on the back of the horror deck)."),
    h("5. Create Skill Decks"),
    p("Place the boon overlay tile on the edge of the board to the left of the treachery card label. Shuffle the boon cards and place them facedown beside the board next to the boon overlay tile."),
    h("8. Create Chaos Deck"),
    p("Take two cards each from the boon and treachery decks and, without looking at them, shuffle them into the chaos deck."),
    h("10. Create Play Areas"),
    p("Each player takes the character-specific mythos card that matches their chosen character and places it facedown in their play area. Return the remaining character-specific mythos cards to the box."),
    h("Create Ally Deck (New Step)"),
    p("After step [[15. Create Spell Deck]], place the ally overlay tile on the edge of the board to the left of the item card label. Shuffle the ally cards and place them facedown beside the board next to the ally overlay tile."),
    p(`Roll a die twice, rerolling until the results are different. Then spawn one ally in the interior space that matches each result (see ${L.spawn}).`),
  ]),

  topic("spawn", "Spawn", [
    p("Passengers, allies, and horrors can now be “spawned” on the board (in addition to Deep Ones). When a player is instructed to “Spawn X” components, they take X components of the indicated type from the supply or top of the corresponding deck and place them in the indicated spaces."),
    h("Spawn Clarifications"),
    b("If a player must spawn more components than there are in the deck or supply (other than Deep Ones), they spawn as many as possible."),
    b("Ally cards are spawned faceup."),
    b(`If a player is instructed to spawn a specific horror but that horror is already on the board, they move that horror to the indicated space. (See ${L.horrors}.)`),
    b("When a game effect instructs a player to “risk a passenger,” that player rolls a die and spawns a passenger token in the deck space that matches the die result. (This is identical to the functionality in the base game, but the passenger counts as having been “spawned.”)"),
  ], ["Spawn", "Passengers"]),

  topic("passengers", "Passengers", [
    p("Abilities in this expansion can cause passengers to spawn in or move into water spaces. When the travel track advances, passengers in water spaces move one space toward the back of the ship for each space the track advanced. If a passenger was already in a water space at the back of the ship, that passenger is defeated."),
    h("Rescue"),
    p("The action to rescue passengers is modified in this expansion, making it easier to rescue passengers on the ship than in the water."),
    p("Players can perform an action to rescue **each passenger in their space** or **one passenger in an adjacent water space**."),
    p("**When a player rescues a passenger, spawn an ally in that player’s space. If multiple passengers are rescued at once, spawn only one ally for the rescue.**"),
    ex("Rescue example", "Wong Mui Choo performs an action to rescue each passenger in her space. Both passengers are returned to the supply, and she spawns one ally in her space. Then Wong Mui Choo performs an action to rescue a passenger in the adjacent water space. One passenger is returned to the supply, but the other remains in the water. She again spawns one ally in her space."),
  ], ["Passengers", "Actions", "Tracks"]),

  topic("allies", "Allies", [
    p("Allies represent other travelers aboard the ship who can provide aid to the humans."),
    p("Before or after a player could perform an action, they can use an ally in their space, resolving the ability on the ally card."),
    p("To use an ally, a player discards skill cards from their hand that have a total value equal to or greater than the number shown in the top-left of the ally card."),
    p("Only humans can use allies. **Each human can use only one ally per turn.** If an ability allows a player to use one or more allies, those **do not count toward the player’s one-ally-per-turn limit.**"),
    h("Wander"),
    p("Ally abilities will cause the ally to wander. When an ally wanders, the player who used the ally rolls a die, then moves that ally card to a different ship space that matches the result. The player who used the ally chooses whether the ally moves to a deck or interior space. If the result of the roll matches the ally’s current space, it must move to the other space that matches the result."),
    h("Flee"),
    p("Allies will flee from the board when they are endangered. When an ally flees, shuffle the card into the ally deck. Allies flee in two situations:"),
    b("When an ally’s space contains a monster or revealed traitor."),
    b("When an ally’s space becomes damaged."),
    p("**Allies do not flee while there is a human in their space.**"),
    h("Defeat"),
    p("Allies can be defeated by the ritual track, as well as by other abilities in the game. When an ally is defeated, remove its card from the game."),
    h("Ally Clarifications"),
    b("Allies **cannot spawn in or move to the Brig, Sick Bay, or water spaces.**"),
    b("If a player is granted an action outside of their turn, they can use an ally before or after that action."),
    b("If a player grants an action to another player, the granting player cannot use an ally before or after the granted action."),
    b("Multiple players can use the same ally in the same turn."),
    b("When a space becoming damaged causes all humans in that space to be defeated, each ally in that space flees."),
    b("If part of an ally ability cannot be resolved, a player can still use the ally to cause it to wander."),
    b("[[Ruffian:]] The attack follows the same steps as a human’s attack. The player using Ruffian chooses the defender. The attack is affected by any abilities that can normally affect an attack."),
    ex("Ally example", "After performing an action, Mui Choo can use an ally in her space. She discards 4 value worth of skill cards from her hand to use the Professor, allowing her to draw 3 new cards. Then the Professor wanders. Mui Choo rolls a die—a 5. Since the Professor is already in deck space 5, she must move to interior space 5. After the Professor moves, she is in a space with a Deep One and no humans. She immediately flees and is shuffled into the ally deck."),
  ], ["Actions", "Spawn"]),

  topic("horrors", "Horrors", [
    p("This expansion introduces three new monsters known as horrors: the Shoggoth, the Drowned Spirit, and the Grasping Tendril. While not as invincible as the monarchs, horrors are more dangerous than Deep Ones, and more difficult to defeat."),
    p("Each horror has a corresponding activation icon. When a horror’s activation icon is resolved, that horror activates; if the horror is not already on the board, this activation will spawn the horror. Each horror resolves its activation differently."),
    h("Shoggoth ({shoggoth})"),
    p("When the Shoggoth activates, if it is not already on the board, roll a die. Spawn the Shoggoth in the **deck space** that matches the result."),
    p("Then, whether or not it was on the board, the Shoggoth performs the first of the following options that it is able to:"),
    step("1", "Attack **each human** in the Shoggoth’s space. **Add 1 to each die result.**"),
    step("2", "Defeat **each passenger** in the Shoggoth’s space."),
    step("3", "Damage the Shoggoth’s space. The Shoggoth can only damage its space if that space is an interior space and is not already damaged."),
    step("4", "Remove the top four cards of the item deck from the game without revealing them. Then move to an adjacent space. Where the Shoggoth moves depends on the type of space it currently occupies:"),
    sub("If the Shoggoth is in a water space, it moves to the adjacent deck space."),
    sub("If the Shoggoth is in a deck space, it moves to the adjacent interior space."),
    sub("If the Shoggoth is in an interior space, it moves one space toward the closest undamaged interior space. If two or more undamaged interior spaces are equidistant from the Shoggoth’s space, it moves toward the space with the highest printed number."),
    h("Drowned Spirit ({drowned-spirit})"),
    p("When the Drowned Spirit activates, if it is not already on the board, roll a die. Spawn the Drowned Spirit in the **interior space** that matches the result."),
    p("Then, whether or not it was on the board, the Drowned Spirit performs the first of the following options that it is able to:"),
    step("1", "Damage the Drowned Spirit’s space. The Drowned Spirit can only damage its space if that space is an interior space and is not already damaged."),
    step("2", "Remove the top four cards of the spell deck from the game without revealing them. Then move to an adjacent space. Where the Drowned Spirit moves depends on the type of space it currently occupies:"),
    sub("If the Drowned Spirit is in a water space, it moves to the adjacent deck space."),
    sub("If the Drowned Spirit is in a deck space, it moves to the adjacent interior space."),
    sub("If the Drowned Spirit is in an interior space, it moves one space toward the closest undamaged interior space. If two or more undamaged interior spaces are equidistant from the Drowned Spirit’s space, it moves toward the space with the highest printed number."),
    h("Grasping Tendril ({grasping-tendril})"),
    p("While on the board, the Grasping Tendril occupies a water space and the adjacent deck space. Any ability that causes the Tendril to move will cause it to occupy both a new water space and adjacent deck space. The Grasping Tendril cannot move to an interior space."),
    p("When the Grasping Tendril activates, if it is not already on the board, roll a die. Spawn the Grasping Tendril in the **water space** that matches the result."),
    p("Then, whether or not it was on the board, the Grasping Tendril performs the first of the following options that it is able to:"),
    step("1", "Attack a human in the Grasping Tendril’s deck space. **Add 1 to the die result.** Then move the Grasping Tendril one space toward the front of the ship."),
    step("2", "Move each passenger token from the Grasping Tendril’s deck space to its water space. Then move the Grasping Tendril one space toward the front of the ship."),
    step("3", "Spawn a passenger in the Grasping Tendril’s water space. Then move the Grasping Tendril one space toward the front of the ship."),
    h("Horror Icon ({horror})"),
    p("This icon does not correspond to a specific horror. The icon resolves either as a track icon (if there are no horrors on the board) or as an activation icon (if there are one or more horrors on the board)."),
    h3("Track Icon"),
    p("When the horror icon is resolved, if there are no horrors on the board, advance the horror track one space."),
    p("When the horror token reaches the Spawn space of the horror track, set the token aside, then draw the top card of the horror deck and resolve it. Usually, the horror card will instruct a player to resolve a specific horror activation icon, spawning that horror on the board."),
    h3("Activation Icon"),
    p("When the horror icon resolves, if there is exactly one horror on the board, that horror activates."),
    p("If there is more than one horror on the board, any player flips cards from the top of the horror deck until they flip a card with a title that matches a horror on the board. That horror activates, then the player shuffles all flipped cards back into the horror deck."),
    { type: "h", text: "Repelling Horrors", anchor: "abyss-repelling" },
    p("Horrors are particularly tough monsters. When a horror would be defeated, **the horror is not removed from the board.** Instead, it is repelled. (Horrors can be removed only by the effects of a track advancing; see Removing Horrors.)"),
    p("When a player repels a horror, they move it to an adjacent space. Then that player may discard skill cards from their hand that have a total value of 4 or more to move the horror an additional space."),
    p("Which player repels a horror and chooses where it moves depends on the circumstances:"),
    b("When a horror would be defeated by a player’s attack, the attacker repels the horror."),
    b("When a horror would be defeated by the ability of a skill card, spell card, ally card, or feat card, the player who used the ability repels the horror."),
    b("When a horror would be defeated by a mythos card, if it is the result of a choice, the player who made the choice repels the horror. Otherwise, the current player repels the horror."),
    h3("Attacking Horrors"),
    p("Humans can attack horrors to repel them. The target number to repel a horror is 6."),
    ex("Repel example", "Ida Lawrence attacks the Shoggoth, rolling a 6. The Shoggoth is repelled. Ida moves the Shoggoth to the adjacent deck space. Then she chooses to discard skill cards from her hand that have a total value of 4 to move the Shoggoth to the adjacent water space."),
    h("Removing Horrors"),
    p("The effects of the travel track and ritual track are the only ways to defeat a horror and remove it from the board:"),
    b("When the travel track advances, horrors in water spaces move one space toward the back of the ship. If a horror was already in a water space at the back of the ship, it is defeated (not repelled)."),
    b("When the ritual track reaches the Cast space, each horror in a deck or water space is defeated (not repelled)."),
    p("When a horror is defeated this way, return it to the supply. Then, if there are no other horrors on the board, place the horror token on the Start space of the horror track."),
    h("Horror Clarifications"),
    b("A player cannot perform a space’s action ability if there is a horror in that space."),
    b("When a horror is spawned by its specific activation icon, any player removes the token from the horror track and sets it aside."),
    b("Horrors cannot spawn in or move to the Brig or Sick Bay."),
    b("During the Shoggoth’s or Drowned Spirit’s activation, if there are fewer than four cards left to remove from the game, remove as many as possible. Then the horror moves as normal."),
    b("During the Grasping Tendril’s activation, if there are no passengers left to spawn, the Tendril still moves as normal."),
    b("Horrors are monsters, but are not considered monarchs or Deep Ones."),
  ], ["Activations", "Attack", "Monsters", "Tracks"]),

  topic("skill-cards", "Skill Cards", [
    p("This expansion adds a new type of skill card, adjusts how players can use treachery cards, and adds new cards to existing decks."),
    h("Boon Cards"),
    p("Boons are always a supporting skill, so they always count positively during a skill check. **Boons cannot be drawn unless an ability specifically uses the word “boon.”** Both humans and traitors can draw boon cards and use their abilities."),
    h("Treachery Cards"),
    p("When using this expansion, abilities can cause humans to draw treachery cards. Humans can add treachery cards to skill checks and discard treachery cards for other abilities."),
    p("[[Note:]] While any player can now draw treachery cards, **only revealed traitors can use abilities on treachery cards.**"),
    h("Chaos Deck"),
    p("When creating a new chaos deck, shuffle in two boon cards and two treachery cards in addition to the other skill cards."),
    h("New Skill Cards"),
    p("This expansion adds one 6-value card and one 0-value card to each skill deck. Each 6-value card has the same ability as the 5-value cards in that deck (except the treachery deck)."),
    p("Each 0-value card has an ability that applies when it is revealed in a skill check."),
    h3("Skill Card Clarifications"),
    b("The 0-value skill cards from the influence, lore, observation, strength, and will decks have abilities that resolve **after the check is completely resolved.**"),
    b("The 0-value cards from the boon and treachery decks have abilities that apply while they are in a check."),
    b("If multiple 0-value cards are in the same check, the current player decides the order in which they resolve."),
    b("When adding 0-value cards to a skill check, a player cannot communicate that they are adding a 0-value card or that they are not helping with the check."),
  ], ["Skill Cards", "Treachery Cards", "Chaos Deck", "Skill Checks"]),

  topic("personal-crisis-cards", "Personal Crisis Cards", [
    p("With the increased size of the mythos deck, the procedure for resolving character-specific mythos cards is adjusted."),
    p("When using this expansion, the 18 character-specific mythos cards are removed from the mythos deck and set aside. Instead, 12 Personal Crisis cards are added to the mythos deck."),
    p("When drawn, Personal Crisis cards cause a player to resolve their character-specific mythos card."),
    h("Personal Crisis Clarifications"),
    b("If a Personal Crisis card is drawn while the current player is in the Brig, that card is discarded and a replacement card is drawn."),
    b("If an ability causes a player to look at the top cards of the mythos deck and the player sees a Personal Crisis card, they discard that card and look at the next card in the deck."),
  ], ["Mythos Cards"]),

  topic("preludes", "Preludes", [
    p("Preludes are optional cards that can be used to vary setup and the starting state of the board. They represent events that occurred on the *Atlantica’s* journey before the start of the game. There are three types of prelude cards: day, twilight, and night. Day cards favor humans, twilight cards affect everyone, and night cards favor hybrids."),
    h("Resolve Preludes"),
    p("During setup, before step [[16. Create Loyalty Deck]], shuffle the day, twilight, and night cards separately. Then do the following:"),
    step("1", "Draw 1 day card. Read it aloud, then resolve its ability."),
    step("2", "Draw 1 twilight card. Read it aloud, then resolve its ability."),
    step("3", "Draw 1 night card. Read it aloud, then resolve its ability."),
    p("Then remove all prelude cards from the game."),
    h("Modifying Balance"),
    p("If everyone agrees, players can vary the types and number of prelude cards to adjust the balance of the game toward the humans or hybrids. Players can do any of the following:"),
    b("Replace night cards with twilight cards and/or twilight cards with day cards to favor the humans."),
    b("Replace day cards with twilight cards and/or twilight cards with night cards to favor the hybrids."),
    b("Draw and resolve additional prelude cards of any type to further modify setup."),
  ]),

  topic("clarifications", "Miscellaneous Clarifications", [
    h("Boons"),
    b("[[Providence:]] If Providence prevents the loss of a resource that was paid as a cost, the ability resolves as if the cost had been paid. For example, if Providence prevents the loss of one food from the Alchemical Transmutation spell (“Lose 1 food to gain 2 fuel”), the players still gain two fuel."),
    h("Characters"),
    b("[[Ida Lawrence:]]"),
    sub("The cards are drawn from Seasoned after the action ability has fully resolved. If the ability grants an action to another player, the cards are drawn before that player performs the granted action."),
    sub("Ida can use the action ability of a skill card to trigger Seasoned even if the card’s ability cannot be completely resolved."),
    b("[[Guillaume Delacroix:]]"),
    sub("The ally used with Lost Souls **does not count toward Guillaume’s one-ally-per-turn limit.**"),
    sub("If Guillaume is granted an action during another player’s turn, he can use an ally with Lost Souls in addition to an ally in his space."),
    b("[[Kokoj Fernandes:]] A die set to a number by Eldritch Influence can have its result modified (using Keen Insight, for example). It cannot be rerolled."),
    h("Feats"),
    b("[[Instinct (Wong Mui Choo):]] If the skill check results in a partial pass (neither “Pass” nor “Fail”), this feat is not removed from the game."),
    b("[[Unfinished Business (Guillaume Delacroix):]]"),
    sub("Guillaume can have more than 3 allies in his play area while this ability resolves. After the feat is resolved, remove all but three of the remaining allies from the game."),
    sub("Used allies do not wander; they are removed from the game."),
    sub("If another character uses this feat (from the Valuable Lessons prelude card), any unused ally cards remain in their play area but cannot be used."),
    h("Items"),
    b("[[Cursed Mask:]] This item is not an Improvement, so it does not count toward a player’s limit of one active Improvement."),
    b("[[Flare Gun:]] You can choose another character to move even if you do not perform an attack."),
    b("[[Spirit Board:]] The ally defeated by this effect is revealed before being removed from the game."),
    h("Monarchs"),
    b("Monarchs cannot be defeated."),
    h("Mythos Cards"),
    b("[[Precognition:]] If there are fewer than four cards in the chaos deck, the player draws as many as possible, creates a new chaos deck, then draws the remaining cards."),
    b("[[Price of Power:]] Cast the greater banishment spell as if the token had reached the Cast space of the ritual track. Do not move the token."),
    h("Spells"),
    b("[[Blessing:]] This spell is not an Improvement, so it does not count toward a player’s limit of one active Improvement."),
    b("[[Cast Out:]] The player can repeatedly resolve the spell, rolling each time, until the die result is 5 or less or they choose to stop."),
    h("Waypoints"),
    b("[[Storm Winds:]] When you advance the travel track, first move the token on the travel track to the Start space. It does not move back to the Start space after this ability resolves."),
  ]),
];

// Changes to the Rules Reference. Each is shown in place, marked as From the Abyss.
export const abyssPatches: Patch[] = [
  // 2 Action Abilities
  { topic: "2", at: "2.3", mode: "after", blocks: [b("A human also cannot perform this action if there is a horror in that space.")] },

  // 3 Actions
  { topic: "3", at: "3.4", mode: "replace", text: "Attack a Deep One, horror, or revealed traitor in their space." },
  { topic: "3", at: "3.4", mode: "after", blocks: [b(`An attack on a horror repels it rather than defeating it (target number 6). See ${L.repelling}.`)] },
  { topic: "3", at: "3.5", mode: "replace", text: "Rescue **each passenger in their space** or **one passenger in an adjacent water space**." },
  { topic: "3", at: "3.5", mode: "after", blocks: [b(`When a player rescues a passenger, spawn an ally in that player’s space. If multiple passengers are rescued at once, spawn only one ally for the rescue. See ${L.passengers}.`)] },
  { topic: "3", at: "3.8", mode: "after", blocks: [
    b("A player cannot perform this action if there is a horror in that space."),
    p(`[[Allies:]] Before or after a human could perform an action, they can use an ally in their space. Each human can use only one ally per turn. See ${L.allies}.`),
  ] },

  // 4 Activations
  { topic: "4", at: "4.1", mode: "replace", text: "There are three activation icons for the monarchs and Deep Ones, and four for horrors:" },
  { topic: "4", at: "4.1", mode: "after", blocks: [
    b("Shoggoth ({shoggoth})"),
    b("Drowned Spirit ({drowned-spirit})"),
    b("Grasping Tendril ({grasping-tendril})"),
    b("Horror ({horror}): activates a horror on the board, or advances the horror track if there are none"),
  ] },
  { topic: "4", at: "4.18", mode: "after", blocks: [h("Activating Horrors"), p(`Each horror activates as described under ${L.horrors}.`)] },

  // 6 Attack
  { topic: "6", at: "6.4", mode: "replaceChild", find: "If the attacker is a human", text: "If the attacker is a human, the defender must be a Deep One, a horror, or a revealed traitor." },
  { topic: "6", at: "6.5", mode: "after", blocks: [b("If the defender is a horror, the target number is 6.")] },
  { topic: "6", at: "6.9", mode: "after", blocks: [sub(`If the defender is a horror, that horror is repelled instead of defeated. See ${L.repelling}.`)] },

  // 10 Chaos Deck
  { topic: "10", at: "10.2", mode: "after", blocks: [b("When creating a new chaos deck, also shuffle in two boon cards and two treachery cards.")] },

  // 16 Defeated
  { topic: "16", at: "16.5", mode: "after", blocks: [
    p(`When a horror would be defeated, it is repelled instead. Only the travel and ritual tracks defeat horrors. See ${L.horrors}.`),
    p("When an ally is defeated, remove its card from the game."),
  ] },

  // 26 Monarchs, 27 Monsters
  { topic: "26", at: "26.2", mode: "after", blocks: [b("Monarchs cannot be defeated.")] },
  { topic: "27", at: "intro", mode: "replace", text: "Mother Hydra, Father Dagon, Deep Ones, and horrors (the Shoggoth, Drowned Spirit, and Grasping Tendril) are collectively referred to as monsters." },
  { topic: "27", at: "intro", mode: "after", blocks: [b("Horrors are monsters, but are not considered monarchs or Deep Ones.")] },

  // 28 Mythos Cards
  { topic: "28", at: "28.4", mode: "after", blocks: [p(`[[Personal Crisis cards:]] The character-specific mythos cards are not in the mythos deck. Each player keeps their character’s card facedown in their play area, and drawing a Personal Crisis card makes a player resolve it. See ${L.personal}.`)] },
  { topic: "28", at: "28.24", mode: "after", blocks: [
    b("[[Shoggoth / Drowned Spirit / Grasping Tendril Activation]] ({shoggoth} {drowned-spirit} {grasping-tendril}): That horror activates, spawning it if it is not on the board."),
    b("[[Horror]] ({horror}): If there are horrors on the board, one of them activates. See " + L.horrors + "."),
  ] },
  { topic: "28", at: "28.27", mode: "after", blocks: [b("[[Horror]] ({horror}): If there are no horrors on the board, advance the horror track one space.")] },

  // 32 Passengers
  { topic: "32", at: "32.3", mode: "after", blocks: [p("Passengers can spawn in or move into water spaces. When the travel track advances, passengers in water spaces move one space toward the back of the ship for each space the track advanced. A passenger already in a water space at the back of the ship is defeated.")] },
  { topic: "32", at: "32.4", mode: "after", blocks: [b("The risked passenger counts as having been spawned.")] },
  { topic: "32", at: "32.7", mode: "replaceChild", find: "When a player rescues a passenger", text: "A player can rescue **each passenger in their space** or **one passenger in an adjacent water space**. The rescued passenger tokens are moved facedown to the supply (without looking at them)." },
  { topic: "32", at: "32.7", mode: "after", blocks: [b("When a player rescues a passenger, spawn an ally in that player’s space. If multiple passengers are rescued at once, spawn only one ally for the rescue.")] },

  // 41 Skill Cards
  { topic: "41", at: "41.2", mode: "replace", text: "There are seven types of skill cards: influence ({influence}), lore ({lore}), observation ({observation}), strength ({strength}), will ({will}), treachery ({treachery}), and boon ({boon})." },
  { topic: "41", at: "41.2", mode: "replaceChild", find: "Only revealed traitors can draw and use abilities on treachery", text: "Any player can draw treachery cards, but only revealed traitors can use abilities on treachery skill cards. Humans can add treachery cards to skill checks and discard them for other abilities." },
  { topic: "41", at: "41.2", mode: "after", blocks: [b(`Boons are always a supporting skill. They cannot be drawn unless an ability specifically uses the word “boon.” Both humans and traitors can draw boon cards and use their abilities. See ${L.skill}.`)] },

  // 44 Spaces
  { topic: "44", at: "44.5", mode: "replace", text: "Water spaces can only contain monster figures and passengers." },
  { topic: "44", at: "44.20", mode: "after", blocks: [b("Horrors and allies cannot spawn in or move to these spaces.")] },

  // 45 Spawn
  { topic: "45", at: "intro", mode: "replace", text: "When a player is instructed to “spawn X” components (Deep Ones, passengers, allies, or horrors), they take X components of the indicated type from the supply or top of the corresponding deck and place them in the indicated spaces." },
  { topic: "45", at: "45.1", mode: "after", blocks: [
    b("If a player must spawn more components than there are in the deck or supply (other than Deep Ones), they spawn as many as possible."),
    b("Ally cards are spawned faceup."),
    b("If a player is instructed to spawn a specific horror but that horror is already on the board, they move that horror to the indicated space."),
  ] },

  // 50 Tracks
  { topic: "50", at: "50.7", mode: "after", blocks: [
    b("Passengers in water spaces also move one space toward the back of the ship for each space the token advanced. A passenger already at the back of the ship is defeated."),
    b("Horrors in water spaces move one space toward the back of the ship. A horror already at the back of the ship is defeated (not repelled)."),
  ] },
  { topic: "50", at: "50.12", mode: "after", blocks: [b("Defeat each horror in a deck or water space (not repelled) and return it to the supply. If no horrors are left on the board, place the horror token on the Start space of the horror track.")] },

  // 52 Treachery Cards
  { topic: "52", at: "intro", mode: "replace", text: "Treachery cards are a type of skill card whose abilities can only be used by revealed traitors." },
  { topic: "52", at: "52.1", mode: "replace", text: "Any player may draw treachery cards, but only revealed traitors may use abilities on them. Humans can add treachery cards to skill checks and discard them for other abilities." },

  // 53 Turn Structure
  { topic: "53", at: "53.5", mode: "after", blocks: [b(`Before or after each action, the player can use one ally in their space (once per turn). See ${L.allies}.`)] },
];
