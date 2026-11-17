// Characters of Unfathomable (core) and From the Abyss. Names and epithets are from the
// lines of succession on the title cards; portraits are cut from the small character cards
// by scripts/extract_portraits.py.

export type Box = "core" | "abyss";

export interface Character {
  id: string;
  name: string;
  /** First name or short form used in compact lists and the log */
  short: string;
  /** The epithet printed on the character sheet ("the Captain") */
  epithet: string;
  box: Box;
  portrait: string;
}

const portraits = import.meta.glob<string>("../assets/portraits/*.webp", { eager: true, import: "default" });
const portrait = (id: string) => portraits[`../assets/portraits/${id}.webp`];

const c = (id: string, name: string, short: string, epithet: string, box: Box): Character => ({
  id,
  name,
  short,
  epithet,
  box,
  portrait: portrait(id),
});

export const characters: Character[] = [
  c("keilani-tatupu", "Keilani Tatupu", "Keilani", "the Captain", "core"),
  c("arjun-singh", "Arjun Singh", "Arjun", "the First Mate", "core"),
  c("jeanne-lafarge", "Jeanne Lafarge", "Jeanne", "the Engineer", "core"),
  c("jamie-snell", "Jamie Snell", "Jamie", "the Master-At-Arms", "core"),
  c("svetlana-gedroits", "Svetlana Gedroits", "Svetlana", "the Ship's Surgeon", "core"),
  c("beatrice-sharpe", "Beatrice Sharpe", "Beatrice", "the Mathematician", "core"),
  c("edmund-mallory", "Edmund Mallory", "Edmund", "the Jinx", "core"),
  c("ishmael-marsh", "Ishmael Marsh", "Ishmael", "the Exile", "core"),
  c("william-bowleg", "William Bowleg", "William", "the Apprentice", "core"),
  c("samira-dualeh", "Samira Dualeh", "Samira", "the Stowaway", "core"),
  c("avery-engelbrecht", "Avery Engelbrecht", "Avery", "the Boatswain", "abyss"),
  c("sardaana-morgunova", "Sardaana Morgunova", "Sardaana", "the Lookout", "abyss"),
  c("wong-mui-choo", "Wong Mui Choo", "Mui Choo", "the Fisherwoman", "abyss"),
  c("raul-martinez-garcia", "Raúl Martínez García", "Raúl", "the Valet", "abyss"),
  c("antar-al-fakahany", "Antar Al-Fakahany", "Antar", "the Sleuth", "abyss"),
  c("ida-lawrence", "Ida Lawrence", "Ida", "the Ship's Cook", "abyss"),
  c("kokoj-fernandes", "Kokoj Fernandes", "Kokoj", "the Antiquarian", "abyss"),
  c("guillaume-delacroix", "Guillaume Delacroix", "Guillaume", "the Spiritualist", "abyss"),
];

export const characterById: Record<string, Character> = Object.fromEntries(characters.map((ch) => [ch.id, ch]));
