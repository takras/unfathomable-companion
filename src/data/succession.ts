// Lines of succession from the back of the title cards. These are the From the Abyss cards
// (18 characters); the core characters keep the same order relative to each other as on the
// core cards, so one list per title serves both.
import { labels } from "../i18n";

export type TitleId = "captain" | "keeper";

export const TITLES: TitleId[] = ["captain", "keeper"];

export const TITLE_LABEL = labels(TITLES, "title");

export const succession: Record<TitleId, string[]> = {
  captain: [
    "keilani-tatupu", "arjun-singh", "avery-engelbrecht", "jeanne-lafarge", "jamie-snell",
    "sardaana-morgunova", "svetlana-gedroits", "wong-mui-choo", "raul-martinez-garcia",
    "beatrice-sharpe", "antar-al-fakahany", "edmund-mallory", "ida-lawrence", "ishmael-marsh",
    "kokoj-fernandes", "william-bowleg", "guillaume-delacroix", "samira-dualeh",
  ],
  keeper: [
    "william-bowleg", "kokoj-fernandes", "guillaume-delacroix", "ishmael-marsh",
    "antar-al-fakahany", "beatrice-sharpe", "edmund-mallory", "samira-dualeh", "ida-lawrence",
    "raul-martinez-garcia", "wong-mui-choo", "svetlana-gedroits", "sardaana-morgunova",
    "jamie-snell", "jeanne-lafarge", "avery-engelbrecht", "arjun-singh", "keilani-tatupu",
  ],
};
